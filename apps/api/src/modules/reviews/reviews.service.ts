import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  Optional,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { SrsService } from './srs.service';
import { StreakService } from '../streaks/streak.service';
import { XpService } from '../gamification/services/xp.service';
import {
  ReviewsSummaryService,
  DEFAULT_DAILY_GOAL,
} from './services/reviews-summary.service';
import { SubmitReviewDto } from './dto/submit-review.dto';
import { QueryDueReviewsDto } from './dto/query-due-reviews.dto';
import type {
  DueCardItem,
  ReviewStatsResponse,
  CardLearningStatus,
  ReviewSummaryDto,
  OfficialCardContent,
  TodaySessionResponse,
  BacklogWarningDto,
} from '@wordstreak/shared-types';

export {
  STREAK_RISK_MIN_DAYS,
  STREAK_RISK_WINDOW_MS,
  DEFAULT_DAILY_GOAL,
  resolveSummaryTimezone,
  getLocalDayUtcBoundaries,
} from './services/reviews-summary.service';

@Injectable()
export class ReviewsService {
  private readonly reviewsSummaryService: ReviewsSummaryService;

  constructor(
    private readonly prisma: PrismaService,
    private readonly srsService: SrsService,
    private readonly streakService: StreakService,
    private readonly xpService: XpService,
    @Optional() reviewsSummaryService?: ReviewsSummaryService,
  ) {
    this.reviewsSummaryService =
      reviewsSummaryService || new ReviewsSummaryService(prisma, streakService);
  }

  /**
   * Retrieves prioritized due cards and new cards ready for review.
   */
  async getDueCards(userId: string, query: QueryDueReviewsDto | string = {}) {
    const deckId = typeof query === 'string' ? query : query?.deckId;
    const mode = typeof query === 'object' ? query?.mode : undefined;
    let limit = (typeof query === 'object' ? query?.limit : undefined) ?? 50;
    if (mode === 'express') {
      limit = Math.min(limit, 7);
    }
    const now = new Date();

    // 0. Check user inactivity > 7 days for gentle Welcome Back re-engagement
    const userStreak = await this.prisma.userStreak.findFirst({
      where: { userId },
      select: { lastActiveDate: true },
    });
    const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;
    const isWelcomeBack = Boolean(
      userStreak?.lastActiveDate &&
      now.getTime() - new Date(userStreak.lastActiveDate).getTime() >
        SEVEN_DAYS_MS,
    );
    if (isWelcomeBack && (typeof query === 'object' && !query.limit) && mode !== 'express') {
      limit = 7;
    }

    // 1. Fetch user dailyGoal
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { dailyGoal: true },
    });
    const dailyGoal = user?.dailyGoal ?? 10;

    // 2. Check if deckId belongs to an official deck
    const isOfficialDeck =
      deckId && this.prisma.officialDeck?.findUnique
        ? await this.prisma.officialDeck.findUnique({
            where: { id: deckId },
            select: { id: true, title: true },
          })
        : null;

    // 3. Query custom progress records that are due (nextReviewDate <= now) or NEW
    const deckFilter = deckId
      ? { deckId, deck: { userId, isArchived: false } }
      : { deck: { userId, isArchived: false } };

    const progressList =
      (isOfficialDeck
        ? []
        : await this.prisma.userCardProgress.findMany({
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
          })) || [];

    // 4. Query official cards progress (all if no deckId, scoped if official deckId)
    const officialWhere: Prisma.UserOfficialCardProgressWhereInput = {
      userId,
      OR: [{ nextReviewDate: { lte: now } }, { status: 'NEW' }],
    };
    if (isOfficialDeck) {
      officialWhere.card = {
        deckCards: {
          some: { deckId },
        },
      };
    }

    const officialProgressList =
      deckId && !isOfficialDeck
        ? []
        : await this.prisma.userOfficialCardProgress.findMany({
            where: officialWhere,
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
          });

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

    const totalDueCount = overdue.length + dueToday.length;
    const backlogThreshold = 3 * dailyGoal;
    const isBacklogOverwhelmed = totalDueCount > backlogThreshold;

    // Backlog Guard (US-UX-03): If backlog > 3x dailyGoal, pause adding new cards
    const activeNewCards = isBacklogOverwhelmed ? [] : newCards;

    const resultQueue = [...overdue, ...dueToday, ...activeNewCards].slice(
      0,
      limit,
    );

    const backlogWarning: BacklogWarningDto = {
      isOverwhelmed: isBacklogOverwhelmed,
      dueCount: totalDueCount,
      threshold: backlogThreshold,
      dailyGoal,
      suggestedBatchSize: Math.min(10, dailyGoal),
    };

    return {
      data: resultQueue,
      meta: {
        totalDue: resultQueue.length,
        overdueCount: overdue.length,
        dueTodayCount: dueToday.length,
        newCount: activeNewCards.length,
        isWelcomeBack,
        isExpress: mode === 'express',
        backlogWarning,
      },
    };
  }

  /**
   * Retrieves today's combined study session (US-UX-01 / US-LIB-16 / US-UX-03):
   * Prioritizes overdue/due cards, supplemented by new cards up to dailyGoal.
   * Supports express mode (5-minute session, max 7 cards) and backlog guard.
   */
  async getTodaySession(
    userId: string,
    query: QueryDueReviewsDto = {},
  ): Promise<TodaySessionResponse> {
    const dueResult = await this.getDueCards(userId, {
      ...query,
      limit: query.mode === 'express' ? 7 : (query.limit ?? 50),
    });
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
        isWelcomeBack: dueResult.meta.isWelcomeBack,
        isExpress: query.mode === 'express',
        backlogWarning: dueResult.meta.backlogWarning,
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

  /**
   * Aggregates compact 10-field review summary for Extension and Web clients.
   */
  async getReviewSummary(
    userId: string,
    queryTimezone?: string,
    headerTimezone?: string,
  ): Promise<ReviewSummaryDto> {
    return this.reviewsSummaryService.getReviewSummary(
      userId,
      queryTimezone,
      headerTimezone,
    );
  }
}
