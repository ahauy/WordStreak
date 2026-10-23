import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { StreakService, isValidTimezone } from '../../streaks/streak.service';
import type {
  BacklogWarningDto,
  ReviewSummaryDto,
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
export class ReviewsSummaryService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly streakService: StreakService,
  ) {}

  async fetchSummaryAggregates(
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

    const backlogThreshold = 3 * dailyGoal;
    const isBacklogOverwhelmed = dueCount > backlogThreshold;
    const backlogWarning: BacklogWarningDto = {
      isOverwhelmed: isBacklogOverwhelmed,
      dueCount,
      threshold: backlogThreshold,
      dailyGoal,
      suggestedBatchSize: Math.min(10, dailyGoal),
    };

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
      backlogWarning,
    };
  }
}
