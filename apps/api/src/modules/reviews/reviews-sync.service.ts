import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { SrsService } from './srs.service';
import {
  StreakService,
  MAX_STREAK_FREEZES,
  calculateDayDelta,
  isValidTimezone,
} from '../streaks/streak.service';
import { calculateLevelProgress, XpActionType } from '@wordstreak/shared-types';
import type {
  SyncReviewBatchDto,
  SyncReviewItemDto,
  SyncReviewResponseDto,
  SyncConflictResolution,
} from '@wordstreak/shared-types';

export const MAX_CLOCK_DRIFT_MS = 5 * 60 * 1000; // 5 minutes
export const STREAK_TOLERANCE_MS = 48 * 60 * 60 * 1000; // 48 hours
export const MAX_BATCH_XP_CAP = 500;

interface ReconcileStreakState {
  currentStreak: number;
  bestStreak: number;
  lastActiveDate: Date | null;
  streakFreezes: number;
  totalFreezesUsed: number;
  lastFreezeDate: Date | null;
  streakUpdated: boolean;
}

@Injectable()
export class ReviewsSyncService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly srsService: SrsService,
    private readonly streakService: StreakService,
  ) {}

  /**
   * Synchronizes a batch of offline review logs atomically.
   */
  async syncReviews(
    userId: string,
    dto: SyncReviewBatchDto,
    headerTimezone?: string,
  ): Promise<SyncReviewResponseDto> {
    const timezone = this.resolveTimezone(dto.clientTimezone, headerTimezone);
    const serverNow = new Date();

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, totalXp: true },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    this.validateClockDriftAndTimestamps(dto.reviews, serverNow);

    const sortedReviews = [...dto.reviews].sort(
      (a, b) =>
        new Date(a.reviewedAtClient).getTime() -
        new Date(b.reviewedAtClient).getTime(),
    );

    return this.prisma.$transaction(async (tx) => {
      return this.processBatchTransaction(
        tx,
        userId,
        sortedReviews,
        timezone,
        serverNow,
      );
    });
  }

  private resolveTimezone(clientTz?: string, headerTz?: string): string {
    if (clientTz && isValidTimezone(clientTz)) return clientTz;
    if (headerTz && isValidTimezone(headerTz)) return headerTz;
    return 'UTC';
  }

  private validateClockDriftAndTimestamps(
    reviews: SyncReviewItemDto[],
    serverNow: Date,
  ): void {
    const maxAllowedTimestamp = serverNow.getTime() + MAX_CLOCK_DRIFT_MS;

    for (const review of reviews) {
      const clientTime = new Date(review.reviewedAtClient).getTime();
      if (isNaN(clientTime)) {
        throw new BadRequestException(
          `Invalid timestamp format for review ${review.idempotencyKey}`,
        );
      }
      if (clientTime > maxAllowedTimestamp) {
        throw new BadRequestException(
          'Future timestamp detected exceeding clock drift limit',
        );
      }
    }
  }

  private async processBatchTransaction(
    tx: Prisma.TransactionClient,
    userId: string,
    sortedReviews: SyncReviewItemDto[],
    timezone: string,
    serverNow: Date,
  ): Promise<SyncReviewResponseDto> {
    const syncedCardIds: string[] = [];
    const conflicts: SyncConflictResolution[] = [];
    const syncedReviewDates: Date[] = [];
    let batchRawXp = 0;

    for (const item of sortedReviews) {
      const itemResult = await this.processReviewItem(tx, userId, item);
      if (itemResult.isConflict) {
        conflicts.push(itemResult.conflict!);
      } else {
        syncedCardIds.push(item.cardId);
        syncedReviewDates.push(new Date(item.reviewedAtClient));
      }
      batchRawXp += itemResult.awardedXp;
    }

    const totalXpAwarded = await this.applyBatchXpReward(
      tx,
      userId,
      batchRawXp,
      sortedReviews.length,
    );

    const streakResult = await this.reconcileStreak(
      tx,
      userId,
      syncedReviewDates,
      timezone,
      serverNow,
    );

    return {
      processedCount: sortedReviews.length,
      syncedCount: syncedCardIds.length,
      failedCount: conflicts.length,
      conflictsResolved: conflicts.length,
      syncedCardIds,
      totalXpAwarded,
      streakUpdated: streakResult.streakUpdated,
      currentStreak: streakResult.currentStreak,
      bestStreak: streakResult.bestStreak,
      conflicts,
      serverTimestamp: serverNow.toISOString(),
    };
  }

  private async processReviewItem(
    tx: Prisma.TransactionClient,
    userId: string,
    item: SyncReviewItemDto,
  ): Promise<{
    isConflict: boolean;
    conflict?: SyncConflictResolution;
    awardedXp: number;
  }> {
    const card = await tx.card.findUnique({
      where: { id: item.cardId },
      include: { deck: true },
    });

    if (!card || card.deck.userId !== userId) {
      return {
        isConflict: true,
        conflict: {
          cardId: item.cardId,
          action: 'DELETED_CARD_DROPPED',
          reason: 'Card was deleted or inaccessible',
        },
        awardedXp: 10,
      };
    }

    let progress = await tx.userCardProgress.findUnique({
      where: {
        userId_cardId: { userId, cardId: item.cardId },
      },
    });

    if (!progress) {
      progress = await tx.userCardProgress.create({
        data: {
          userId,
          cardId: item.cardId,
          interval: 0,
          easeFactor: 2.5,
          repetitions: 0,
          status: 'NEW',
          nextReviewDate: new Date(),
        },
      });
    }

    const sm2Result = this.srsService.calculateSm2({
      rating: item.rating,
      repetitions: progress.repetitions,
      easeFactor: progress.easeFactor,
      interval: progress.interval,
    });

    const clientReviewDate = new Date(item.reviewedAtClient);

    await tx.userCardProgress.update({
      where: { id: progress.id },
      data: {
        interval: sm2Result.interval,
        easeFactor: sm2Result.easeFactor,
        repetitions: sm2Result.repetitions,
        nextReviewDate: sm2Result.nextReviewDate,
        status: sm2Result.status,
        lastReviewedAt: clientReviewDate,
      },
    });

    await tx.reviewLog.create({
      data: {
        userId,
        cardId: item.cardId,
        rating: item.rating,
        interval: sm2Result.interval,
        reviewedAt: clientReviewDate,
      },
    });

    const awardedXp = item.rating >= 3 ? 10 : item.rating === 2 ? 5 : 0;
    return { isConflict: false, awardedXp };
  }

  private async applyBatchXpReward(
    tx: Prisma.TransactionClient,
    userId: string,
    batchRawXp: number,
    reviewsCount: number,
  ): Promise<number> {
    const totalXpAwarded = Math.min(batchRawXp, MAX_BATCH_XP_CAP);
    if (totalXpAwarded <= 0) return 0;

    const updatedUser = await tx.user.update({
      where: { id: userId },
      data: { totalXp: { increment: totalXpAwarded } },
      select: { totalXp: true },
    });

    const levelDetails = calculateLevelProgress(updatedUser.totalXp);

    await tx.user.update({
      where: { id: userId },
      data: {
        level: levelDetails.level,
        tier: levelDetails.tier,
      },
    });

    await tx.userActivityLog.create({
      data: {
        userId,
        activityType: XpActionType.HISTORICAL_BACKFILL,
        xpEarned: totalXpAwarded,
        metadata: {
          source: 'OFFLINE_SYNC',
          reviewsCount,
          rawXp: batchRawXp,
        },
      },
    });

    return totalXpAwarded;
  }

  private async reconcileStreak(
    tx: Prisma.TransactionClient,
    userId: string,
    reviewDates: Date[],
    timezone: string,
    serverNow: Date,
  ): Promise<{
    currentStreak: number;
    bestStreak: number;
    streakUpdated: boolean;
  }> {
    let streak = await tx.userStreak.findUnique({
      where: { userId },
    });

    if (!streak) {
      streak = await tx.userStreak.create({
        data: {
          userId,
          currentStreak: 0,
          bestStreak: 0,
          lastActiveDate: null,
          streakFreezes: 1,
          totalFreezesUsed: 0,
          lastFreezeDate: null,
        },
      });
    }

    const state: ReconcileStreakState = {
      currentStreak: streak.currentStreak,
      bestStreak: streak.bestStreak,
      lastActiveDate: streak.lastActiveDate,
      streakFreezes: streak.streakFreezes,
      totalFreezesUsed: streak.totalFreezesUsed,
      lastFreezeDate: streak.lastFreezeDate,
      streakUpdated: false,
    };

    const eligibleDates = reviewDates.filter(
      (d) => serverNow.getTime() - d.getTime() <= STREAK_TOLERANCE_MS,
    );

    if (eligibleDates.length === 0) {
      return {
        currentStreak: state.currentStreak,
        bestStreak: state.bestStreak,
        streakUpdated: false,
      };
    }

    const uniqueDateStrings = Array.from(
      new Set(
        eligibleDates.map((d) =>
          this.streakService.formatDateInTimezone(d, timezone),
        ),
      ),
    ).sort();

    for (const dateStr of uniqueDateStrings) {
      this.reconcileSingleDate(state, dateStr, timezone, serverNow);
    }

    if (state.streakUpdated) {
      await tx.userStreak.update({
        where: { id: streak.id },
        data: {
          currentStreak: state.currentStreak,
          bestStreak: state.bestStreak,
          lastActiveDate: state.lastActiveDate,
          streakFreezes: state.streakFreezes,
          totalFreezesUsed: state.totalFreezesUsed,
          lastFreezeDate: state.lastFreezeDate,
        },
      });
    }

    return {
      currentStreak: state.currentStreak,
      bestStreak: state.bestStreak,
      streakUpdated: state.streakUpdated,
    };
  }

  private reconcileSingleDate(
    state: ReconcileStreakState,
    dateStr: string,
    timezone: string,
    serverNow: Date,
  ): void {
    const [y, m, d] = dateStr.split('-').map(Number);
    const dateObj = new Date(Date.UTC(y, m - 1, d, 12, 0, 0));

    if (!state.lastActiveDate) {
      state.currentStreak = 1;
      state.bestStreak = Math.max(state.bestStreak, 1);
      state.lastActiveDate = dateObj;
      state.streakUpdated = true;
      return;
    }

    const lastActiveDayStr = this.streakService.formatDateInTimezone(
      state.lastActiveDate,
      timezone,
    );
    const delta = calculateDayDelta(lastActiveDayStr, dateStr);

    if (delta <= 0) {
      return;
    }

    if (delta === 1) {
      state.currentStreak += 1;
    } else if (
      delta >= 2 &&
      delta <= state.streakFreezes + 1 &&
      state.currentStreak > 0
    ) {
      const needed = delta - 1;
      state.streakFreezes -= needed;
      state.totalFreezesUsed += needed;
      state.lastFreezeDate = serverNow;
      state.currentStreak += 1;
    } else {
      state.currentStreak = 1;
    }

    if (
      (state.currentStreak === 7 || state.currentStreak === 30) &&
      state.streakFreezes < MAX_STREAK_FREEZES
    ) {
      state.streakFreezes += 1;
    }

    state.bestStreak = Math.max(state.bestStreak, state.currentStreak);
    state.lastActiveDate = dateObj;
    state.streakUpdated = true;
  }
}
