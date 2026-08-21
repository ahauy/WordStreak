import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import type {
  MasterySummaryDto,
  ActivityHeatmapResponseDto,
  HeatmapDayItemDto,
  HeatmapIntensityLevel,
  DeckForecastDto,
  AnalyticsOverviewDto,
} from '@wordstreak/shared-types';

@Injectable()
export class AnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Sanitizes and validates IANA timezone string, fallback to UTC.
   */
  private sanitizeTimezone(tz?: string): string {
    if (!tz) return 'UTC';
    try {
      Intl.DateTimeFormat(undefined, { timeZone: tz });
      return tz;
    } catch {
      return 'UTC';
    }
  }

  /**
   * Formats a Date object to YYYY-MM-DD in the specified timezone.
   */
  private formatDateInTimezone(date: Date, timezone: string): string {
    const formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone: timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
    return formatter.format(date);
  }

  /**
   * Calculates intensity level (0-4) based on daily review count.
   */
  private calculateIntensityLevel(count: number): HeatmapIntensityLevel {
    if (count === 0) return 0;
    if (count <= 5) return 1;
    if (count <= 15) return 2;
    if (count <= 30) return 3;
    return 4;
  }

  /**
   * Retrieves mastery breakdown (Mastered, Learning, New) for user cards.
   */
  async getMasterySummary(
    userId: string,
    deckId?: string,
  ): Promise<MasterySummaryDto> {
    const whereClause = {
      userId,
      card: {
        deck: {
          isArchived: false,
          ...(deckId ? { id: deckId, userId } : { userId }),
        },
      },
    };

    const progressRecords = await this.prisma.userCardProgress.findMany({
      where: whereClause,
      select: {
        interval: true,
        repetitions: true,
        status: true,
      },
    });

    let masteredCount = 0;
    let learningCount = 0;
    let newCount = 0;

    for (const record of progressRecords) {
      if (record.interval >= 21 && record.repetitions >= 4) {
        masteredCount++;
      } else if (
        record.interval > 0 ||
        (record.repetitions > 0 && record.status !== 'NEW')
      ) {
        learningCount++;
      } else {
        newCount++;
      }
    }

    const totalCards = progressRecords.length;
    const masteredPercentage =
      totalCards > 0
        ? Number(((masteredCount / totalCards) * 100).toFixed(1))
        : 0;
    const learningPercentage =
      totalCards > 0
        ? Number(((learningCount / totalCards) * 100).toFixed(1))
        : 0;
    const newPercentage =
      totalCards > 0 ? Number(((newCount / totalCards) * 100).toFixed(1)) : 0;

    return {
      totalCards,
      masteredCount,
      masteredPercentage,
      learningCount,
      learningPercentage,
      newCount,
      newPercentage,
    };
  }

  /**
   * Retrieves rolling 365-day review heatmap normalized by user timezone.
   */
  async getActivityHeatmap(
    userId: string,
    timezoneParam?: string,
  ): Promise<ActivityHeatmapResponseDto> {
    const timezone = this.sanitizeTimezone(timezoneParam);
    const now = new Date();

    // 365 rolling days window: start 364 days ago + today (total 365 days)
    const startDateObj = new Date(now.getTime() - 364 * 86400000);

    const logs = await this.prisma.reviewLog.findMany({
      where: {
        userId,
        reviewedAt: {
          gte: startDateObj,
        },
      },
      select: {
        reviewedAt: true,
      },
    });

    // Group logs by YYYY-MM-DD in the target timezone
    const countMap = new Map<string, number>();
    for (const log of logs) {
      const dateStr = this.formatDateInTimezone(log.reviewedAt, timezone);
      countMap.set(dateStr, (countMap.get(dateStr) ?? 0) + 1);
    }

    // Build the continuous 365-day array ending today
    const days: HeatmapDayItemDto[] = [];
    let totalReviews = 0;
    let activeDaysCount = 0;
    let longestDailyReviews = 0;

    for (let i = 364; i >= 0; i--) {
      const dayDate = new Date(now.getTime() - i * 86400000);
      const dateStr = this.formatDateInTimezone(dayDate, timezone);
      const count = countMap.get(dateStr) ?? 0;
      const level = this.calculateIntensityLevel(count);

      totalReviews += count;
      if (count > 0) {
        activeDaysCount++;
      }
      if (count > longestDailyReviews) {
        longestDailyReviews = count;
      }

      days.push({
        date: dateStr,
        count,
        level,
      });
    }

    return {
      startDate:
        days[0]?.date ?? this.formatDateInTimezone(startDateObj, timezone),
      endDate:
        days[days.length - 1]?.date ?? this.formatDateInTimezone(now, timezone),
      totalReviews,
      activeDaysCount,
      longestDailyReviews,
      days,
    };
  }

  /**
   * Calculates completion forecast and daily velocity for a single deck.
   */
  async getDeckForecast(
    userId: string,
    deckId: string,
  ): Promise<DeckForecastDto> {
    const deck = await this.prisma.deck.findUnique({
      where: { id: deckId },
      include: {
        user: { select: { dailyGoal: true } },
      },
    });

    if (!deck) {
      throw new NotFoundException(`Deck with ID ${deckId} not found`);
    }

    if (deck.userId !== userId) {
      throw new ForbiddenException('You do not have access to this deck');
    }

    const progressList = await this.prisma.userCardProgress.findMany({
      where: {
        userId,
        card: { deckId },
      },
      select: {
        interval: true,
        repetitions: true,
      },
    });

    const totalCards = progressList.length;
    let masteredCards = 0;

    for (const item of progressList) {
      if (item.interval >= 21 && item.repetitions >= 4) {
        masteredCards++;
      }
    }

    const remainingCards = Math.max(0, totalCards - masteredCards);
    const isCompleted = totalCards > 0 && remainingCards === 0;

    // Calculate trailing 7-day velocity for this deck
    const sevenDaysAgo = new Date(Date.now() - 7 * 86400000);
    const recentLogs = await this.prisma.reviewLog.findMany({
      where: {
        userId,
        card: { deckId },
        reviewedAt: { gte: sevenDaysAgo },
      },
      select: {
        reviewedAt: true,
      },
    });

    // Unique active days in last 7 days
    const activeDaysSet = new Set(
      recentLogs.map((log) => log.reviewedAt.toISOString().slice(0, 10)),
    );
    const activeDayCount = activeDaysSet.size;

    let dailyVelocity: number;
    if (activeDayCount >= 3) {
      dailyVelocity = Math.max(1, Math.round(recentLogs.length / 7));
    } else {
      const fallbackGoal = Math.max(
        1,
        Math.floor((deck.user?.dailyGoal ?? 10) / 2),
      );
      dailyVelocity = fallbackGoal;
    }

    const estimatedDaysToComplete = isCompleted
      ? 0
      : Math.ceil(remainingCards / Math.max(dailyVelocity, 1));

    const projectedCompletionDate =
      isCompleted || totalCards === 0
        ? null
        : new Date(
            Date.now() + estimatedDaysToComplete * 86400000,
          ).toISOString();

    return {
      deckId: deck.id,
      deckTitle: deck.title,
      deckColor: deck.color,
      totalCards,
      masteredCards,
      remainingCards,
      dailyVelocity,
      estimatedDaysToComplete,
      projectedCompletionDate,
      isCompleted,
    };
  }

  /**
   * Retrieves forecast progress across all active decks for the user.
   */
  async getDecksProgress(userId: string): Promise<DeckForecastDto[]> {
    const activeDecks = await this.prisma.deck.findMany({
      where: {
        userId,
        isArchived: false,
      },
      select: { id: true },
      orderBy: { updatedAt: 'desc' },
    });

    const results: DeckForecastDto[] = [];
    for (const deck of activeDecks) {
      const forecast = await this.getDeckForecast(userId, deck.id);
      results.push(forecast);
    }

    return results;
  }

  /**
   * Returns high-level overview metrics (Mastery breakdown, 30-day retention %, streak info).
   */
  async getOverview(userId: string): Promise<AnalyticsOverviewDto> {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000);

    const [masterySummary, reviewLogs30Days, totalReviewsLogged, streak] =
      await Promise.all([
        this.getMasterySummary(userId),
        this.prisma.reviewLog.findMany({
          where: {
            userId,
            reviewedAt: { gte: thirtyDaysAgo },
          },
          select: { rating: true },
        }),
        this.prisma.reviewLog.count({
          where: { userId },
        }),
        this.prisma.userStreak.findUnique({
          where: { userId },
          select: {
            currentStreak: true,
            bestStreak: true,
          },
        }),
      ]);

    let retentionRate30Days: number | null = null;
    if (reviewLogs30Days.length > 0) {
      const goodOrEasyCount = reviewLogs30Days.filter(
        (log) => log.rating >= 3,
      ).length;
      retentionRate30Days = Number(
        ((goodOrEasyCount / reviewLogs30Days.length) * 100).toFixed(1),
      );
    }

    return {
      masterySummary,
      retentionRate30Days,
      totalReviewsLogged,
      currentStreak: streak?.currentStreak ?? 0,
      bestStreak: streak?.bestStreak ?? 0,
    };
  }
}
