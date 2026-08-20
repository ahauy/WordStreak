import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RecordStreakActivityDto } from './dto/record-streak-activity.dto';
import type {
  UserStreakDto,
  StreakActivityResponseDto,
} from '@wordstreak/shared-types';

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
        },
      });
    }

    const now = new Date();
    const todayStr = this.formatDateInTimezone(now, tz);
    const yesterdayStr = getPreviousDayString(todayStr);

    let isActiveToday = false;
    let isPendingToday = false;
    let effectiveStreak = streakRecord.currentStreak;

    if (streakRecord.lastActiveDate) {
      const lastActiveDay = this.formatDateInTimezone(
        streakRecord.lastActiveDate,
        tz,
      );

      if (lastActiveDay === todayStr) {
        isActiveToday = true;
        isPendingToday = false;
        effectiveStreak = streakRecord.currentStreak;
      } else if (lastActiveDay === yesterdayStr) {
        isActiveToday = false;
        isPendingToday = true;
        effectiveStreak = streakRecord.currentStreak;
      } else {
        isActiveToday = false;
        isPendingToday = false;
        effectiveStreak = 0;
      }
    } else {
      effectiveStreak = 0;
    }

    return {
      userId,
      currentStreak: effectiveStreak,
      bestStreak: streakRecord.bestStreak,
      lastActiveDate: streakRecord.lastActiveDate
        ? streakRecord.lastActiveDate.toISOString()
        : null,
      isActiveToday,
      isPendingToday,
      timezone: tz,
      flameTier: getFlameTier(effectiveStreak),
    };
  }

  /**
   * Records a study habit activity, adjusting streak counter according to timezone boundaries.
   */
  async recordActivity(
    userId: string,
    dto?: RecordStreakActivityDto,
  ): Promise<StreakActivityResponseDto> {
    const tz =
      dto?.timezone && isValidTimezone(dto.timezone) ? dto.timezone : 'UTC';
    const now = new Date();
    const todayStr = this.formatDateInTimezone(now, tz);
    const yesterdayStr = getPreviousDayString(todayStr);

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
        },
      });

      return {
        currentStreak: newRecord.currentStreak,
        bestStreak: newRecord.bestStreak,
        streakIncreased: true,
        isActiveToday: true,
        flameTier: getFlameTier(newRecord.currentStreak),
        message: 'New streak started!',
      };
    }

    const lastActiveDay = streakRecord.lastActiveDate
      ? this.formatDateInTimezone(streakRecord.lastActiveDate, tz)
      : null;

    if (lastActiveDay === todayStr) {
      return {
        currentStreak: streakRecord.currentStreak,
        bestStreak: streakRecord.bestStreak,
        streakIncreased: false,
        isActiveToday: true,
        flameTier: getFlameTier(streakRecord.currentStreak),
        message: 'Streak already maintained for today',
      };
    }

    let newStreak: number;
    let message: string;

    if (lastActiveDay === yesterdayStr) {
      newStreak = streakRecord.currentStreak + 1;
      message = 'Streak increased! Great job!';
    } else {
      newStreak = 1;
      message = 'New streak started!';
    }

    const newBestStreak = Math.max(streakRecord.bestStreak, newStreak);

    await this.prisma.userStreak.update({
      where: { id: streakRecord.id },
      data: {
        currentStreak: newStreak,
        bestStreak: newBestStreak,
        lastActiveDate: now,
      },
    });

    return {
      currentStreak: newStreak,
      bestStreak: newBestStreak,
      streakIncreased: true,
      isActiveToday: true,
      flameTier: getFlameTier(newStreak),
      message,
    };
  }
}
