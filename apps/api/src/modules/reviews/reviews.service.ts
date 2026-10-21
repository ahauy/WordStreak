import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SrsService } from './srs.service';
import { StreakService, isValidTimezone } from '../streaks/streak.service';
import { XpService } from '../gamification/services/xp.service';
import { SubmitReviewDto } from './dto/submit-review.dto';
import { QueryDueReviewsDto } from './dto/query-due-reviews.dto';
import type {
  DueCardItem,
  ReviewStatsResponse,
  CardLearningStatus,
  ReviewSummaryDto,
  OfficialCardContent,
  TodaySessionResponse,
} from '@wordstreak/shared-types';

export const STREAK_RISK_MIN_DAYS = 3;
export const STREAK_RISK_WINDOW_MS = 3 * 60 * 60 * 1000;
export const DEFAULT_DAILY_GOAL = 10;

export function resolveSummaryTimezone(
  queryTimezone?: string,
  headerTimezone?: string,
): string {
  if (
    queryTimezone &&
    queryTimezone.trim() &&
    isValidTimezone(queryTimezone.trim())
  ) {
    return queryTimezone.trim();
  }
  if (
    headerTimezone &&
    headerTimezone.trim() &&
    isValidTimezone(headerTimezone.trim())
  ) {
    return headerTimezone.trim();
  }
  return 'UTC';
}

function localWallClockToUtc(
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number,
  second: number,
  ms: number,
  timeZone: string,
): Date {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
    hourCycle: 'h23',
  });

  const getOffsetMs = (utcMs: number): number => {
    const parts = formatter.formatToParts(new Date(utcMs));
    const map: Record<string, number> = {};
    for (const part of parts) {
      if (part.type !== 'literal') {
        map[part.type] = Number(part.value);
      }
    }
    const asUtc = Date.UTC(
      map.year,
      map.month - 1,
      map.day,
      map.hour,
      map.minute,
      map.second,
      ms,
    );
    return asUtc - utcMs;
  };

  const targetAsUtc = Date.UTC(year, month - 1, day, hour, minute, second, ms);
  const firstPassUtc = targetAsUtc - getOffsetMs(targetAsUtc);
  const secondPassUtc = targetAsUtc - getOffsetMs(firstPassUtc);
  return new Date(secondPassUtc);
}

export function getLocalDayUtcBoundaries(
  now: Date,
  timezone: string,
): { startOfDayUtc: Date; endOfDayUtc: Date } {
  const dtf = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
  });
  const parts = dtf.formatToParts(now);
  const map: Record<string, number> = {};
  for (const part of parts) {
    if (part.type !== 'literal') {
      map[part.type] = Number(part.value);
    }
  }
  const { year, month, day } = map;
  const startOfDayUtc = localWallClockToUtc(
    year,
    month,
    day,
    0,
    0,
    0,
    0,
    timezone,
  );
  const endOfDayUtc = localWallClockToUtc(
    year,
    month,
    day,
    23,
    59,
    59,
    999,
    timezone,
  );
  return { startOfDayUtc, endOfDayUtc };
}

@Injectable()
export class ReviewsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly srsService: SrsService,
    private readonly streakService: StreakService,
    private readonly xpService: XpService,
  ) {}

  /**
   * Retrieves prioritized due cards and new cards ready for review.
   */
  async getDueCards(userId: string, query: QueryDueReviewsDto = {}) {
    const { deckId, limit = 50 } = query;
    const now = new Date();

    // 1. Fetch user dailyGoal
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { dailyGoal: true },
    });
    const dailyGoal = user?.dailyGoal ?? 10;

    // 2. Build where filter for deck scope
    const deckFilter = deckId
      ? { deckId, deck: { userId, isArchived: false } }
      : { deck: { userId, isArchived: false } };

    // 3. Query custom progress records that are due (nextReviewDate <= now) or NEW
    const progressList = await this.prisma.userCardProgress.findMany({
      where: {
        userId,
        card: deckFilter,
        OR: [{ nextReviewDate: { lte: now } }, { status: 'NEW' }],
      },
      include: {
        card: {
          include: {
            deck: {
              select: {
                id: true,
                title: true,
                color: true,
              },
            },
          },
        },
      },
      orderBy: [{ nextReviewDate: 'asc' }],
      take: limit,
    });

    // 4. Query official cards progress if not scoped to a custom deck
    const officialProgressList = !deckId
      ? await this.prisma.userOfficialCardProgress.findMany({
          where: {
            userId,
            OR: [{ nextReviewDate: { lte: now } }, { status: 'NEW' }],
          },
          include: {
            card: {
              include: {
                deckCards: {
                  include: {
                    deck: {
                      select: {
                        id: true,
                        title: true,
                      },
                    },
                  },
                },
              },
            },
          },
          orderBy: [{ nextReviewDate: 'asc' }],
          take: limit,
        })
      : [];

    // 5. Separate and sort: Overdue -> Due Today -> New cards (capped by dailyGoal)
    const todayStart = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
    );
    const overdue: DueCardItem[] = [];
    const dueToday: DueCardItem[] = [];
    const newCards: DueCardItem[] = [];

    for (const item of progressList) {
      const cardItem: DueCardItem = {
        id: item.id,
        cardId: item.cardId,
        deckId: item.card.deckId,
        deckTitle: item.card.deck.title,
        deckColor: item.card.deck.color,
        word: item.card.word,
        meaning: item.card.meaning,
        phonetic: item.card.phonetic,
        audioUrl: item.card.audioUrl,
        exampleSentence: item.card.exampleSentence,
        collocations: item.card.collocations,
        mnemonic: item.card.mnemonic,
        imageUrl: item.card.imageUrl,
        status: item.status as CardLearningStatus,
        interval: item.interval,
        repetitions: item.repetitions,
        easeFactor: item.easeFactor,
        nextReviewDate: item.nextReviewDate.toISOString(),
      };

      if (item.status === 'NEW') {
        if (newCards.length < dailyGoal) {
          newCards.push(cardItem);
        }
      } else if (item.nextReviewDate < todayStart) {
        overdue.push(cardItem);
      } else {
        dueToday.push(cardItem);
      }
    }

    for (const item of officialProgressList) {
      const content =
        (item.card.content as unknown as Partial<OfficialCardContent>) || {};
      const officialDeck = item.card.deckCards?.[0]?.deck;
      const cardItem: DueCardItem = {
        id: item.id,
        cardId: item.cardId,
        deckId: officialDeck?.id || 'official-library',
        deckTitle: officialDeck?.title || 'Official Library',
        deckColor: '#6366F1',
        word: item.card.headword,
        meaning: content.meaning_vi ?? item.card.headword,
        phonetic: content.ipa_us ?? null,
        audioUrl: null,
        exampleSentence: content.example_en ?? null,
        collocations: Array.isArray(content.collocations)
          ? content.collocations.join(', ')
          : typeof content.collocations === 'string'
            ? content.collocations
            : null,
        mnemonic: content.tip_vi ?? null,
        imageUrl: null,
        status: item.status as CardLearningStatus,
        interval: item.interval,
        repetitions: item.repetitions,
        easeFactor: item.easeFactor,
        nextReviewDate: (item.nextReviewDate ?? now).toISOString(),
        isOfficial: true,
        officialCardId: item.cardId,
        stressSyllable: content.stress_syllable ?? null,
        endingSoundTipVi: content.ending_sound_tip_vi ?? null,
      };

      if (item.status === 'NEW') {
        if (newCards.length < dailyGoal) {
          newCards.push(cardItem);
        }
      } else if (item.nextReviewDate && item.nextReviewDate < todayStart) {
        overdue.push(cardItem);
      } else {
        dueToday.push(cardItem);
      }
    }

    overdue.sort(
      (a, b) =>
        new Date(a.nextReviewDate).getTime() -
        new Date(b.nextReviewDate).getTime(),
    );
    dueToday.sort(
      (a, b) =>
        new Date(a.nextReviewDate).getTime() -
        new Date(b.nextReviewDate).getTime(),
    );

    const resultQueue = [...overdue, ...dueToday, ...newCards].slice(0, limit);

    return {
      data: resultQueue,
      meta: {
        totalDue: resultQueue.length,
        overdueCount: overdue.length,
        dueTodayCount: dueToday.length,
        newCount: newCards.length,
      },
    };
  }

  /**
   * Retrieves today's combined study session (US-UX-01):
   * Prioritizes overdue/due cards, supplemented by new cards up to dailyGoal.
   */
  async getTodaySession(userId: string): Promise<TodaySessionResponse> {
    const dueResult = await this.getDueCards(userId, { limit: 50 });
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { dailyGoal: true },
    });
    const dailyGoal = user?.dailyGoal ?? DEFAULT_DAILY_GOAL;

    const cards = dueResult.data;
    const dueCount = dueResult.meta.overdueCount + dueResult.meta.dueTodayCount;
    const newCount = dueResult.meta.newCount;
    const totalCount = cards.length;
    const isGoalCompleted = totalCount === 0;

    return {
      cards,
      summary: {
        dueCount,
        newCount,
        totalCount,
        dailyGoal,
        isGoalCompleted,
      },
    };
  }

  /**
   * Submits user SRS rating for a single card, computes SM-2 interval, and updates progress.
   */
  async submitReview(
    userId: string,
    dto: SubmitReviewDto,
    clientTimezone?: string,
  ) {
    const { cardId, rating } = dto;

    // 1. Fetch custom card and verify ownership
    const card = await this.prisma.card.findUnique({
      where: { id: cardId },
      include: { deck: true },
    });

    if (card) {
      if (card.deck.userId !== userId) {
        throw new ForbiddenException('You do not have access to this card');
      }

      let progress = await this.prisma.userCardProgress.findUnique({
        where: {
          userId_cardId: {
            userId,
            cardId,
          },
        },
      });

      if (!progress) {
        progress = await this.prisma.userCardProgress.create({
          data: {
            userId,
            cardId,
            interval: 0,
            easeFactor: 2.5,
            repetitions: 0,
            status: 'NEW',
            nextReviewDate: new Date(),
          },
        });
      }

      const sm2Result = this.srsService.calculateSm2({
        rating,
        repetitions: progress.repetitions,
        easeFactor: progress.easeFactor,
        interval: progress.interval,
      });

      const updated = await this.prisma.userCardProgress.update({
        where: { id: progress.id },
        data: {
          interval: sm2Result.interval,
          easeFactor: sm2Result.easeFactor,
          repetitions: sm2Result.repetitions,
          nextReviewDate: sm2Result.nextReviewDate,
          status: sm2Result.status,
          lastReviewedAt: new Date(),
        },
      });

      await this.prisma.reviewLog.create({
        data: {
          userId,
          cardId,
          rating,
          interval: sm2Result.interval,
          reviewedAt: new Date(),
        },
      });

      const streakResult = await this.streakService.recordActivity(userId, {
        timezone: clientTimezone,
      });

      const xpResult = await this.xpService.awardReviewXp(userId, {
        cardId,
        rating,
        streakResult,
        clientTimezone,
      });

      return {
        cardId: updated.cardId,
        status: updated.status,
        interval: updated.interval,
        repetitions: updated.repetitions,
        easeFactor: updated.easeFactor,
        lastReviewedAt: updated.lastReviewedAt,
        nextReviewDate: updated.nextReviewDate,
        streak: streakResult,
        xp: xpResult,
      };
    }

    // 2. Fallback to OfficialCard if not a custom card
    const officialCard = await this.prisma.officialCard.findUnique({
      where: { id: cardId },
    });

    if (!officialCard) {
      throw new NotFoundException(`Card with ID ${cardId} not found`);
    }

    let officialProgress =
      await this.prisma.userOfficialCardProgress.findUnique({
        where: {
          userId_cardId: {
            userId,
            cardId,
          },
        },
      });

    if (!officialProgress) {
      officialProgress = await this.prisma.userOfficialCardProgress.create({
        data: {
          userId,
          cardId,
          interval: 0,
          easeFactor: 2.5,
          repetitions: 0,
          status: 'NEW',
          nextReviewDate: new Date(),
        },
      });
    }

    const sm2Result = this.srsService.calculateSm2({
      rating,
      repetitions: officialProgress.repetitions,
      easeFactor: officialProgress.easeFactor,
      interval: officialProgress.interval,
    });

    const updated = await this.prisma.userOfficialCardProgress.update({
      where: { id: officialProgress.id },
      data: {
        interval: sm2Result.interval,
        easeFactor: sm2Result.easeFactor,
        repetitions: sm2Result.repetitions,
        nextReviewDate: sm2Result.nextReviewDate,
        status: sm2Result.status,
        lastReviewedAt: new Date(),
      },
    });

    const streakResult = await this.streakService.recordActivity(userId, {
      timezone: clientTimezone,
    });

    const xpResult = await this.xpService.awardReviewXp(userId, {
      cardId,
      rating,
      streakResult,
      clientTimezone,
    });

    return {
      cardId: updated.cardId,
      status: updated.status,
      interval: updated.interval,
      repetitions: updated.repetitions,
      easeFactor: updated.easeFactor,
      lastReviewedAt: updated.lastReviewedAt,
      nextReviewDate: updated.nextReviewDate,
      streak: streakResult,
      xp: xpResult,
    };
  }

  /**
   * Aggregates review metrics and card counts for the user across custom and official cards.
   */
  async getReviewStats(userId: string): Promise<ReviewStatsResponse> {
    const now = new Date();

    const [
      customTotal,
      customDue,
      customNew,
      customLearning,
      customMastered,
      officialTotal,
      officialDue,
      officialNew,
      officialLearning,
      officialMastered,
    ] = await Promise.all([
      this.prisma.userCardProgress.count({
        where: { userId },
      }),
      this.prisma.userCardProgress.count({
        where: {
          userId,
          OR: [{ nextReviewDate: { lte: now } }, { status: 'NEW' }],
        },
      }),
      this.prisma.userCardProgress.count({
        where: { userId, status: 'NEW' },
      }),
      this.prisma.userCardProgress.count({
        where: { userId, status: 'LEARNING' },
      }),
      this.prisma.userCardProgress.count({
        where: { userId, status: 'MASTERED' },
      }),
      this.prisma.userOfficialCardProgress.count({
        where: { userId },
      }),
      this.prisma.userOfficialCardProgress.count({
        where: {
          userId,
          OR: [{ nextReviewDate: { lte: now } }, { status: 'NEW' }],
        },
      }),
      this.prisma.userOfficialCardProgress.count({
        where: { userId, status: 'NEW' },
      }),
      this.prisma.userOfficialCardProgress.count({
        where: { userId, status: 'LEARNING' },
      }),
      this.prisma.userOfficialCardProgress.count({
        where: { userId, status: 'MASTERED' },
      }),
    ]);

    return {
      totalCards: customTotal + officialTotal,
      dueCount: customDue + officialDue,
      newCount: customNew + officialNew,
      learningCount: customLearning + officialLearning,
      masteredCount: customMastered + officialMastered,
    };
  }

  private async fetchSummaryAggregates(
    userId: string,
    now: Date,
    startOfDayUtc: Date,
    endOfDayUtc: Date,
    timezone: string,
  ) {
    const activeDeckCardFilter = { deck: { userId, isArchived: false } };
    const [
      user,
      customDue,
      customNew,
      studiedToday,
      customNextDue,
      streak,
      officialDue,
      officialNew,
      officialNextDue,
    ] = await Promise.all([
      this.prisma.user.findUnique({
        where: { id: userId },
        select: { dailyGoal: true },
      }),
      this.prisma.userCardProgress.count({
        where: {
          userId,
          status: { not: 'NEW' },
          nextReviewDate: { lte: now },
          card: activeDeckCardFilter,
        },
      }),
      this.prisma.userCardProgress.count({
        where: {
          userId,
          status: 'NEW',
          card: activeDeckCardFilter,
        },
      }),
      this.prisma.reviewLog.count({
        where: {
          userId,
          reviewedAt: { gte: startOfDayUtc, lte: endOfDayUtc },
        },
      }),
      this.prisma.userCardProgress.findFirst({
        where: {
          userId,
          status: { not: 'NEW' },
          nextReviewDate: { gt: now },
          card: activeDeckCardFilter,
        },
        orderBy: { nextReviewDate: 'asc' },
        select: { nextReviewDate: true },
      }),
      this.streakService.getStreak(userId, timezone),
      this.prisma.userOfficialCardProgress.count({
        where: {
          userId,
          status: { not: 'NEW' },
          nextReviewDate: { lte: now },
        },
      }),
      this.prisma.userOfficialCardProgress.count({
        where: {
          userId,
          status: 'NEW',
        },
      }),
      this.prisma.userOfficialCardProgress.findFirst({
        where: {
          userId,
          status: { not: 'NEW' },
          nextReviewDate: { gt: now },
        },
        orderBy: { nextReviewDate: 'asc' },
        select: { nextReviewDate: true },
      }),
    ]);

    const nextDueDates = [
      customNextDue?.nextReviewDate,
      officialNextDue?.nextReviewDate,
    ]
      .filter((d): d is Date => Boolean(d))
      .sort((a, b) => a.getTime() - b.getTime());

    return [
      user,
      customDue + officialDue,
      customNew + officialNew,
      studiedToday,
      nextDueDates[0] ? { nextReviewDate: nextDueDates[0] } : null,
      streak,
    ] as const;
  }

  /**
   * Aggregates compact 10-field review summary for Extension and Web clients.
   */
  async getReviewSummary(
    userId: string,
    queryTimezone?: string,
    headerTimezone?: string,
  ): Promise<ReviewSummaryDto> {
    const now = new Date();
    const timezone = resolveSummaryTimezone(queryTimezone, headerTimezone);
    const { startOfDayUtc, endOfDayUtc } = getLocalDayUtcBoundaries(
      now,
      timezone,
    );

    const [user, dueCount, newAvailable, studiedToday, nextDueRecord, streak] =
      await this.fetchSummaryAggregates(
        userId,
        now,
        startOfDayUtc,
        endOfDayUtc,
        timezone,
      );

    const dailyGoal =
      user?.dailyGoal && user.dailyGoal > 0
        ? user.dailyGoal
        : DEFAULT_DAILY_GOAL;
    const goalReached = studiedToday >= dailyGoal;
    const currentStreak = streak.currentStreak;
    const msUntilEndOfDay = endOfDayUtc.getTime() - now.getTime();
    const streakAtRisk =
      currentStreak >= STREAK_RISK_MIN_DAYS &&
      studiedToday === 0 &&
      !streak.isActiveToday &&
      msUntilEndOfDay > 0 &&
      msUntilEndOfDay <= STREAK_RISK_WINDOW_MS;

    return {
      dueCount,
      newAvailable,
      studiedToday,
      dailyGoal,
      goalReached,
      currentStreak,
      streakAtRisk,
      timezone,
      endOfDayAt: endOfDayUtc.toISOString(),
      nextDueAt: nextDueRecord
        ? nextDueRecord.nextReviewDate.toISOString()
        : null,
    };
  }
}
