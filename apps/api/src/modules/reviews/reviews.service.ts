import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SrsService } from './srs.service';
import { StreakService } from '../streaks/streak.service';
import { SubmitReviewDto } from './dto/submit-review.dto';
import { QueryDueReviewsDto } from './dto/query-due-reviews.dto';
import type {
  DueCardItem,
  ReviewStatsResponse,
  CardLearningStatus,
} from '@wordstreak/shared-types';

@Injectable()
export class ReviewsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly srsService: SrsService,
    private readonly streakService: StreakService,
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

    // 3. Query progress records that are due (nextReviewDate <= now) or NEW
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

    // 4. Separate and sort: Overdue -> Due Today -> New cards (capped by dailyGoal)
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
   * Submits user SRS rating for a single card, computes SM-2 interval, and updates progress.
   */
  async submitReview(userId: string, dto: SubmitReviewDto) {
    const { cardId, rating } = dto;

    // 1. Fetch card and verify ownership
    const card = await this.prisma.card.findUnique({
      where: { id: cardId },
      include: { deck: true },
    });

    if (!card) {
      throw new NotFoundException(`Card with ID ${cardId} not found`);
    }

    if (card.deck.userId !== userId) {
      throw new ForbiddenException('You do not have access to this card');
    }

    // 2. Fetch or initialize progress record
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

    // 3. Compute SM-2 update
    const sm2Result = this.srsService.calculateSm2({
      rating,
      repetitions: progress.repetitions,
      easeFactor: progress.easeFactor,
      interval: progress.interval,
    });

    // 4. Update progress record in DB
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

    const streakResult = await this.streakService.recordActivity(userId);

    return {
      cardId: updated.cardId,
      status: updated.status,
      interval: updated.interval,
      repetitions: updated.repetitions,
      easeFactor: updated.easeFactor,
      lastReviewedAt: updated.lastReviewedAt,
      nextReviewDate: updated.nextReviewDate,
      streak: streakResult,
    };
  }

  /**
   * Aggregates review metrics and card counts for the user.
   */
  async getReviewStats(userId: string): Promise<ReviewStatsResponse> {
    const now = new Date();

    const [totalCards, dueCount, newCount, learningCount, masteredCount] =
      await Promise.all([
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
      ]);

    return {
      totalCards,
      dueCount,
      newCount,
      learningCount,
      masteredCount,
    };
  }
}
