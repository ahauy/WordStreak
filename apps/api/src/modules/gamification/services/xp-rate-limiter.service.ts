import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export const HOURLY_XP_CAP = 500;
export const DAILY_XP_CAP = 2000;
const ONE_HOUR_MS = 60 * 60 * 1000;
const ONE_DAY_MS = 24 * 60 * 60 * 1000;

interface XpTimestampEntry {
  timestamp: number;
  xp: number;
}

export interface RateLimitCheckResult {
  isAllowed: boolean;
  hourlyXp: number;
  dailyXp: number;
}

@Injectable()
export class XpRateLimiterService {
  private readonly logger = new Logger(XpRateLimiterService.name);
  private readonly userReviewXpCache = new Map<string, XpTimestampEntry[]>();

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Cleans up expired cache entries older than 24 hours.
   */
  private cleanExpiredEntries(userId: string, now: number): XpTimestampEntry[] {
    const entries = this.userReviewXpCache.get(userId);
    if (!entries) {
      return [];
    }
    const filtered = entries.filter((e) => now - e.timestamp < ONE_DAY_MS);
    if (filtered.length === 0) {
      this.userReviewXpCache.delete(userId);
      return [];
    }
    this.userReviewXpCache.set(userId, filtered);
    return filtered;
  }

  /**
   * Checks whether the user has exceeded the review XP velocity limits.
   */
  async checkRateLimit(
    userId: string,
    prospectiveXp: number = 0,
  ): Promise<RateLimitCheckResult> {
    const now = Date.now();
    let cachedEntries = this.cleanExpiredEntries(userId, now);

    if (cachedEntries.length === 0) {
      cachedEntries = await this.warmUpCacheFromDb(userId, now);
    }

    let hourlyXp = 0;
    let dailyXp = 0;

    for (const entry of cachedEntries) {
      if (now - entry.timestamp < ONE_HOUR_MS) {
        hourlyXp += entry.xp;
      }
      dailyXp += entry.xp;
    }

    const isAllowed =
      hourlyXp + prospectiveXp <= HOURLY_XP_CAP &&
      dailyXp + prospectiveXp <= DAILY_XP_CAP;

    if (!isAllowed) {
      this.logger.warn(
        `User ${userId} exceeded XP velocity cap (Hourly: ${hourlyXp}/${HOURLY_XP_CAP}, Daily: ${dailyXp}/${DAILY_XP_CAP})`,
      );
    }

    return { isAllowed, hourlyXp, dailyXp };
  }

  /**
   * Records newly awarded review XP into the in-memory sliding window.
   */
  recordReviewXp(userId: string, xpEarned: number): void {
    if (xpEarned <= 0) return;
    const now = Date.now();
    const entries = this.cleanExpiredEntries(userId, now);
    entries.push({ timestamp: now, xp: xpEarned });
    this.userReviewXpCache.set(userId, entries);
  }

  /**
   * Warms up in-memory sliding-window cache from DB for the past 24 hours.
   */
  private async warmUpCacheFromDb(
    userId: string,
    now: number,
  ): Promise<XpTimestampEntry[]> {
    const oneDayAgo = new Date(now - ONE_DAY_MS);

    const logs = await this.prisma.userActivityLog.findMany({
      where: {
        userId,
        activityType: 'CARD_REVIEW',
        createdAt: { gte: oneDayAgo },
      },
      select: {
        createdAt: true,
        xpEarned: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    const entries: XpTimestampEntry[] = logs.map((log) => ({
      timestamp: log.createdAt.getTime(),
      xp: log.xpEarned,
    }));

    if (entries.length > 0) {
      this.userReviewXpCache.set(userId, entries);
    }

    return entries;
  }

  /**
   * Utility for testing: clears memory cache for user.
   */
  resetCache(userId?: string): void {
    if (userId) {
      this.userReviewXpCache.delete(userId);
    } else {
      this.userReviewXpCache.clear();
    }
  }
}
