import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RecordStreakActivityDto } from './dto/record-streak-activity.dto';
import type {
  UserStreakDto,
  StreakActivityResponseDto,
} from '@wordstreak/shared-types';

export const MAX_STREAK_FREEZES = 2;

export function isValidTimezone(timezone: string): boolean {
  try {
    Intl.DateTimeFormat(undefined, { timeZone: timezone });
    return true;
  } catch {
    return false;
  }
}

export function getFlameTier(streak: number): 1 | 2 | 3 | 4 {
  if (streak >= 30) return 4;
  if (streak >= 14) return 3;
  if (streak >= 7) return 2;
  return 1;
}

export function getPreviousDayString(dateStr: string): string {
  const [year, month, day] = dateStr.split('-').map(Number);
  const prev = new Date(Date.UTC(year, month - 1, day - 1));
  return prev.toISOString().slice(0, 10);
}

export function calculateDayDelta(
  lastActiveDay: string,
  todayStr: string,
): number {
  const [y1, m1, d1] = lastActiveDay.split('-').map(Number);
  const [y2, m2, d2] = todayStr.split('-').map(Number);
  const utc1 = Date.UTC(y1, m1 - 1, d1);
  const utc2 = Date.UTC(y2, m2 - 1, d2);
  const diffMs = utc2 - utc1;
  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
}

@Injectable()
export class StreakService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Formats a given Date instance into YYYY-MM-DD string in the specified IANA timezone.
   * Falls back to UTC if the timezone is invalid.
   */
  formatDateInTimezone(date: Date, timezone: string): string {
    const tz = isValidTimezone(timezone) ? timezone : 'UTC';
    const formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone: tz,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
    return formatter.format(date);
  }

  /**
   * Retrieves or lazily initializes user streak statistics and calculates active/pending status for today.
   * Auto-consumes streak freeze protection if learner missed 1 or more consecutive days within available freeze quota.
   */
  async getStreak(
    userId: string,
    clientTimezone?: string,
  ): Promise<UserStreakDto> {
    const tz =
      clientTimezone && isValidTimezone(clientTimezone)
        ? clientTimezone
        : 'UTC';

    let streakRecord = await this.prisma.userStreak.findFirst({
      where: { userId },
    });

    if (!streakRecord) {
      streakRecord = await this.prisma.userStreak.create({
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

    const now = new Date();
    const todayStr = this.formatDateInTimezone(now, tz);

    if (!streakRecord.lastActiveDate) {
      return {
        userId,
        currentStreak: 0,
        bestStreak: streakRecord.bestStreak,
        lastActiveDate: null,
        isActiveToday: false,
        isPendingToday: false,
        timezone: tz,
        flameTier: 1,
        streakFreezes: streakRecord.streakFreezes,
        maxStreakFreezes: MAX_STREAK_FREEZES,
        totalFreezesUsed: streakRecord.totalFreezesUsed,
        lastFreezeDate: null,
        wasProtectedByFreeze: false,
        freezesUsed: 0,
      };
    }

    const lastActiveDay = this.formatDateInTimezone(
      streakRecord.lastActiveDate,
      tz,
    );
    const delta = calculateDayDelta(lastActiveDay, todayStr);

    if (delta <= 0) {
      return {
        userId,
        currentStreak: streakRecord.currentStreak,
        bestStreak: streakRecord.bestStreak,
        lastActiveDate: streakRecord.lastActiveDate.toISOString(),
        isActiveToday: true,
        isPendingToday: false,
        timezone: tz,
        flameTier: getFlameTier(streakRecord.currentStreak),
        streakFreezes: streakRecord.streakFreezes,
        maxStreakFreezes: MAX_STREAK_FREEZES,
        totalFreezesUsed: streakRecord.totalFreezesUsed,
        lastFreezeDate: streakRecord.lastFreezeDate
          ? streakRecord.lastFreezeDate.toISOString()
          : null,
        wasProtectedByFreeze: false,
        freezesUsed: 0,
      };
    }

    if (delta === 1) {
      return {
        userId,
        currentStreak: streakRecord.currentStreak,
        bestStreak: streakRecord.bestStreak,
        lastActiveDate: streakRecord.lastActiveDate.toISOString(),
        isActiveToday: false,
        isPendingToday: true,
        timezone: tz,
        flameTier: getFlameTier(streakRecord.currentStreak),
        streakFreezes: streakRecord.streakFreezes,
        maxStreakFreezes: MAX_STREAK_FREEZES,
        totalFreezesUsed: streakRecord.totalFreezesUsed,
        lastFreezeDate: streakRecord.lastFreezeDate
          ? streakRecord.lastFreezeDate.toISOString()
          : null,
        wasProtectedByFreeze: false,
        freezesUsed: 0,
      };
    }

    if (
      delta >= 2 &&
      delta <= streakRecord.streakFreezes + 1 &&
      streakRecord.currentStreak > 0
    ) {
      const needed = delta - 1;
      const newFreezes = streakRecord.streakFreezes - needed;
      const totalFreezesUsed = streakRecord.totalFreezesUsed + needed;
      const virtualYesterday = new Date(now.getTime() - 86400000);

      await this.prisma.userStreak.update({
        where: { id: streakRecord.id },
        data: {
          streakFreezes: newFreezes,
          totalFreezesUsed,
          lastFreezeDate: now,
          lastActiveDate: virtualYesterday,
        },
      });

      return {
        userId,
        currentStreak: streakRecord.currentStreak,
        bestStreak: streakRecord.bestStreak,
        lastActiveDate: virtualYesterday.toISOString(),
        isActiveToday: false,
        isPendingToday: true,
        timezone: tz,
        flameTier: getFlameTier(streakRecord.currentStreak),
        streakFreezes: newFreezes,
        maxStreakFreezes: MAX_STREAK_FREEZES,
        totalFreezesUsed,
        lastFreezeDate: now.toISOString(),
        wasProtectedByFreeze: true,
        freezesUsed: needed,
      };
    }

    return {
      userId,
      currentStreak: 0,
      bestStreak: streakRecord.bestStreak,
      lastActiveDate: streakRecord.lastActiveDate.toISOString(),
      isActiveToday: false,
      isPendingToday: false,
      timezone: tz,
      flameTier: 1,
      streakFreezes: streakRecord.streakFreezes,
      maxStreakFreezes: MAX_STREAK_FREEZES,
      totalFreezesUsed: streakRecord.totalFreezesUsed,
      lastFreezeDate: streakRecord.lastFreezeDate
        ? streakRecord.lastFreezeDate.toISOString()
        : null,
      wasProtectedByFreeze: false,
      freezesUsed: 0,
    };
  }

  /**
   * Records a study habit activity, adjusting streak counter and freeze quota.
   * Rewards +1 freeze at milestones (7, 30 days) capped at MAX_STREAK_FREEZES (2).
   */
  async recordActivity(
    userId: string,
    dto?: RecordStreakActivityDto,
  ): Promise<StreakActivityResponseDto> {
    const tz =
      dto?.timezone && isValidTimezone(dto.timezone) ? dto.timezone : 'UTC';
    const now = new Date();
    const todayStr = this.formatDateInTimezone(now, tz);

    const streakRecord = await this.prisma.userStreak.findFirst({
      where: { userId },
    });

    if (!streakRecord) {
      const newRecord = await this.prisma.userStreak.create({
        data: {
          userId,
          currentStreak: 1,
          bestStreak: 1,
          lastActiveDate: now,
          streakFreezes: 1,
          totalFreezesUsed: 0,
          lastFreezeDate: null,
        },
      });

      return {
        currentStreak: newRecord.currentStreak,
        bestStreak: newRecord.bestStreak,
        streakIncreased: true,
        isActiveToday: true,
        flameTier: getFlameTier(newRecord.currentStreak),
        message: 'New streak started!',
        streakFreezes: 1,
        wasProtectedByFreeze: false,
        freezesUsed: 0,
        earnedMilestoneFreeze: false,
      };
    }

    if (!streakRecord.lastActiveDate) {
      const newStreak = 1;
      const newBestStreak = Math.max(streakRecord.bestStreak, newStreak);
      await this.prisma.userStreak.update({
        where: { id: streakRecord.id },
        data: {
          currentStreak: newStreak,
          bestStreak: newBestStreak,
          lastActiveDate: now,
          streakFreezes: streakRecord.streakFreezes,
        },
      });
      return {
        currentStreak: newStreak,
        bestStreak: newBestStreak,
        streakIncreased: true,
        isActiveToday: true,
        flameTier: 1,
        message: 'New streak started!',
        streakFreezes: streakRecord.streakFreezes,
        wasProtectedByFreeze: false,
        freezesUsed: 0,
        earnedMilestoneFreeze: false,
      };
    }

    const lastActiveDay = this.formatDateInTimezone(
      streakRecord.lastActiveDate,
      tz,
    );
    const delta = calculateDayDelta(lastActiveDay, todayStr);

    if (delta <= 0) {
      return {
        currentStreak: streakRecord.currentStreak,
        bestStreak: streakRecord.bestStreak,
        streakIncreased: false,
        isActiveToday: true,
        flameTier: getFlameTier(streakRecord.currentStreak),
        message: 'Streak already maintained for today',
        streakFreezes: streakRecord.streakFreezes,
        wasProtectedByFreeze: false,
        freezesUsed: 0,
        earnedMilestoneFreeze: false,
      };
    }

    let newStreak: number;
    let message: string;
    let wasProtectedByFreeze = false;
    let freezesUsed = 0;
    let availableFreezes = streakRecord.streakFreezes;
    let totalFreezesUsed = streakRecord.totalFreezesUsed;
    let lastFreezeDate = streakRecord.lastFreezeDate;

    if (delta === 1) {
      newStreak = streakRecord.currentStreak + 1;
      message = 'Streak increased! Great job!';
    } else if (
      delta >= 2 &&
      delta <= streakRecord.streakFreezes + 1 &&
      streakRecord.currentStreak > 0
    ) {
      const needed = delta - 1;
      availableFreezes = streakRecord.streakFreezes - needed;
      totalFreezesUsed = streakRecord.totalFreezesUsed + needed;
      lastFreezeDate = now;
      wasProtectedByFreeze = true;
      freezesUsed = needed;
      newStreak = streakRecord.currentStreak + 1;
      message = 'Streak increased! Great job!';
    } else {
      newStreak = 1;
      message = 'New streak started!';
    }

    let earnedMilestoneFreeze = false;
    if (
      (newStreak === 7 || newStreak === 30) &&
      availableFreezes < MAX_STREAK_FREEZES
    ) {
      availableFreezes += 1;
      earnedMilestoneFreeze = true;
    }

    const newBestStreak = Math.max(streakRecord.bestStreak, newStreak);

    const updateData: {
      currentStreak: number;
      bestStreak: number;
      lastActiveDate: Date;
      streakFreezes: number;
      totalFreezesUsed?: number;
      lastFreezeDate?: Date;
    } = {
      currentStreak: newStreak,
      bestStreak: newBestStreak,
      lastActiveDate: now,
      streakFreezes: availableFreezes,
    };

    if (wasProtectedByFreeze) {
      updateData.totalFreezesUsed = totalFreezesUsed;
      updateData.lastFreezeDate = lastFreezeDate ?? now;
    }

    await this.prisma.userStreak.update({
      where: { id: streakRecord.id },
      data: updateData,
    });

    return {
      currentStreak: newStreak,
      bestStreak: newBestStreak,
      streakIncreased: true,
      isActiveToday: true,
      flameTier: getFlameTier(newStreak),
      message,
      streakFreezes: availableFreezes,
      wasProtectedByFreeze,
      freezesUsed,
      earnedMilestoneFreeze,
    };
  }
}
