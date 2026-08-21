import {
  Injectable,
  Logger,
  HttpException,
  HttpStatus,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { LevelEngineService } from './level-engine.service';
import { XpRateLimiterService } from './xp-rate-limiter.service';
import {
  MasteryTier,
  XpActionType,
  XpBreakdownItem,
  XpReviewRewardDto,
  XpSummaryResponseDto,
  XpHistoryQueryDto,
  XpHistoryResponseDto,
  AwardPracticeXpDto,
  PracticeQuizXpRewardDto,
  StreakActivityResponseDto,
  UserActivityLogItemDto,
} from '@wordstreak/shared-types';

export interface AwardReviewXpInput {
  cardId: string;
  rating: number;
  streakResult?: StreakActivityResponseDto;
  clientTimezone?: string;
}

export function isValidTimezone(timezone: string): boolean {
  try {
    Intl.DateTimeFormat(undefined, { timeZone: timezone });
    return true;
  } catch {
    return false;
  }
}

export function getLocalDayUtcRange(
  date: Date,
  timezone?: string,
): { startUtc: Date; endUtc: Date; localDateStr: string } {
  const tz = timezone && isValidTimezone(timezone) ? timezone : 'UTC';
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: tz,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  const localDateStr = formatter.format(date);
  const invDate = new Date(date.toLocaleString('en-US', { timeZone: tz }));
  const diff = date.getTime() - invDate.getTime();
  const [y, m, d] = localDateStr.split('-').map(Number);
  const startUtc = new Date(Date.UTC(y, m - 1, d, 0, 0, 0, 0) + diff);
  const endUtc = new Date(Date.UTC(y, m - 1, d, 23, 59, 59, 999) + diff);
  return { startUtc, endUtc, localDateStr };
}

@Injectable()
export class XpService {
  private readonly logger = new Logger(XpService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly levelEngine: LevelEngineService,
    private readonly xpRateLimiter: XpRateLimiterService,
  ) {}

  /**
   * Awards XP for a card review submission atomically.
   */
  async awardReviewXp(
    userId: string,
    input: AwardReviewXpInput,
  ): Promise<XpReviewRewardDto> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        dailyGoal: true,
        totalXp: true,
        level: true,
        tier: true,
      },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    const { breakdown, cardReviewXp } = await this.calculateReviewBreakdown(
      user,
      input,
    );

    const totalDeltaXp = breakdown.reduce((sum, item) => sum + item.xp, 0);
    const newTotalXp = user.totalXp + totalDeltaXp;

    const levelUp = this.levelEngine.evaluateLevelUp(user.totalXp, newTotalXp);
    const progress = this.levelEngine.calculateLevelProgress(newTotalXp);

    if (totalDeltaXp > 0) {
      await this.persistXpTransaction(
        userId,
        breakdown,
        totalDeltaXp,
        progress,
      );
    }

    this.xpRateLimiter.recordReviewXp(userId, cardReviewXp);

    if (levelUp.isLevelUp) {
      this.logger.log(
        `[LevelUp] User ${userId} leveled up to ${levelUp.currentLevel} (Tier: ${levelUp.currentTier})`,
      );
    }

    return {
      xpEarned: totalDeltaXp,
      breakdown,
      totalXp: newTotalXp,
      level: progress.level,
      tier: progress.tier,
      currentLevelXp: progress.currentLevelXp,
      nextLevelRequiredXp: progress.nextLevelRequiredXp,
      levelProgressPercent: progress.progressPercent,
      levelUp,
    };
  }

  /**
   * Evaluates card review, daily goal, and streak milestone bonuses.
   */
  private async calculateReviewBreakdown(
    user: { id: string; dailyGoal: number },
    input: AwardReviewXpInput,
  ): Promise<{ breakdown: XpBreakdownItem[]; cardReviewXp: number }> {
    const breakdown: XpBreakdownItem[] = [];
    let baseReviewXp = input.rating >= 3 ? 10 : input.rating === 2 ? 5 : 0;

    const rateLimit = await this.xpRateLimiter.checkRateLimit(
      user.id,
      baseReviewXp,
    );
    if (!rateLimit.isAllowed) {
      baseReviewXp = 0;
      breakdown.push({
        type: 'RATE_LIMITED',
        xp: 0,
        description: 'Hourly XP velocity limit reached (500 XP/hr)',
      });
    } else {
      breakdown.push({
        type: XpActionType.CARD_REVIEW,
        xp: baseReviewXp,
        description:
          input.rating === 4
            ? 'Easy Review'
            : input.rating === 3
              ? 'Good Review'
              : input.rating === 2
                ? 'Hard Review'
                : 'Again',
      });
    }

    const goalBonus = await this.checkDailyGoalBonus(
      user,
      input.clientTimezone,
    );
    if (goalBonus) breakdown.push(goalBonus);

    const streakBonus = this.checkStreakMilestoneBonus(input.streakResult);
    if (streakBonus) breakdown.push(streakBonus);

    return { breakdown, cardReviewXp: baseReviewXp };
  }

  /**
   * Checks if user has achieved today's daily review goal bonus (+50 XP).
   */
  private async checkDailyGoalBonus(
    user: { id: string; dailyGoal: number },
    clientTimezone?: string,
  ): Promise<XpBreakdownItem | null> {
    const { startUtc, endUtc, localDateStr } = getLocalDayUtcRange(
      new Date(),
      clientTimezone,
    );

    const todayReviewCount = await this.prisma.reviewLog.count({
      where: {
        userId: user.id,
        reviewedAt: { gte: startUtc, lte: endUtc },
      },
    });

    if (todayReviewCount < user.dailyGoal) {
      return null;
    }

    const existingGoalLog = await this.prisma.userActivityLog.findFirst({
      where: {
        userId: user.id,
        activityType: XpActionType.DAILY_GOAL_COMPLETED,
        createdAt: { gte: startUtc, lte: endUtc },
      },
    });

    if (existingGoalLog) {
      return null;
    }

    return {
      type: XpActionType.DAILY_GOAL_COMPLETED,
      xp: 50,
      description: `Daily Goal Reached (${user.dailyGoal} cards) [${localDateStr}]`,
    };
  }

  /**
   * Checks for 7-day or 30-day streak milestone bonuses.
   */
  private checkStreakMilestoneBonus(
    streakResult?: StreakActivityResponseDto,
  ): XpBreakdownItem | null {
    if (!streakResult?.streakIncreased) {
      return null;
    }

    const streak = streakResult.currentStreak;
    if (streak % 30 === 0) {
      return {
        type: XpActionType.STREAK_30_DAYS,
        xp: 500,
        description: `${streak}-Day Streak Milestone`,
      };
    }

    if (streak % 7 === 0) {
      return {
        type: XpActionType.STREAK_7_DAYS,
        xp: 100,
        description: `${streak}-Day Streak Milestone`,
      };
    }

    return null;
  }

  /**
   * Executes atomic database transaction for activity logs and user level updates.
   */
  private async persistXpTransaction(
    userId: string,
    breakdown: XpBreakdownItem[],
    totalDeltaXp: number,
    progress: { level: number; tier: MasteryTier },
  ): Promise<void> {
    const validLogs = breakdown.filter(
      (item) => item.xp > 0 && item.type !== 'RATE_LIMITED',
    );
    const logCreations = validLogs.map((item) =>
      this.prisma.userActivityLog.create({
        data: {
          userId,
          activityType: item.type,
          xpEarned: item.xp,
          metadata: { description: item.description },
        },
      }),
    );

    const userUpdate = this.prisma.user.update({
      where: { id: userId },
      data: {
        totalXp: { increment: totalDeltaXp },
        level: progress.level,
        tier: progress.tier,
      },
    });

    await this.prisma.$transaction([...logCreations, userUpdate]);
  }

  /**
   * Retrieves user XP summary, today's progress, and tier details.
   */
  async getXpSummary(
    userId: string,
    clientTimezone?: string,
  ): Promise<XpSummaryResponseDto> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, totalXp: true, level: true, tier: true },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    const progress = this.levelEngine.calculateLevelProgress(user.totalXp);
    const { startUtc, endUtc } = getLocalDayUtcRange(
      new Date(),
      clientTimezone,
    );

    const [todayXpAgg, todayGoalLog] = await Promise.all([
      this.prisma.userActivityLog.aggregate({
        where: {
          userId,
          createdAt: { gte: startUtc, lte: endUtc },
        },
        _sum: { xpEarned: true },
      }),
      this.prisma.userActivityLog.findFirst({
        where: {
          userId,
          activityType: XpActionType.DAILY_GOAL_COMPLETED,
          createdAt: { gte: startUtc, lte: endUtc },
        },
      }),
    ]);

    const nextTierInfo = this.getNextTierInfo(progress.tier);

    return {
      userId,
      totalXp: user.totalXp,
      level: progress.level,
      tier: progress.tier,
      currentLevelXp: progress.currentLevelXp,
      nextLevelRequiredXp: progress.nextLevelRequiredXp,
      levelProgressPercent: progress.progressPercent,
      todayXp: todayXpAgg._sum.xpEarned ?? 0,
      dailyGoalBonusEarnedToday: !!todayGoalLog,
      nextTier: nextTierInfo.nextTier,
      nextTierLevel: nextTierInfo.nextTierLevel,
      tierMetadata: this.levelEngine.getTierMetadata(progress.tier),
    };
  }

  /**
   * Helper to derive next mastery tier and target level.
   */
  private getNextTierInfo(tier: MasteryTier): {
    nextTier: MasteryTier | null;
    nextTierLevel: number | null;
  } {
    switch (tier) {
      case MasteryTier.BRONZE:
        return { nextTier: MasteryTier.SILVER, nextTierLevel: 6 };
      case MasteryTier.SILVER:
        return { nextTier: MasteryTier.GOLD, nextTierLevel: 16 };
      case MasteryTier.GOLD:
        return { nextTier: MasteryTier.DIAMOND, nextTierLevel: 31 };
      case MasteryTier.DIAMOND:
        return { nextTier: MasteryTier.MASTER, nextTierLevel: 46 };
      default:
        return { nextTier: null, nextTierLevel: null };
    }
  }

  /**
   * Retrieves paginated activity ledger history for a learner.
   */
  async getXpHistory(
    userId: string,
    query: XpHistoryQueryDto = {},
  ): Promise<XpHistoryResponseDto> {
    const page = Math.max(1, query.page || 1);
    const limit = Math.min(100, Math.max(1, query.limit || 20));
    const skip = (page - 1) * limit;

    const where: Prisma.UserActivityLogWhereInput = { userId };
    if (query.activityType) {
      where.activityType = query.activityType;
    }

    const [total, logs] = await Promise.all([
      this.prisma.userActivityLog.count({ where }),
      this.prisma.userActivityLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
    ]);

    const data: UserActivityLogItemDto[] = logs.map((log) => ({
      id: log.id,
      activityType: log.activityType as XpActionType,
      xpEarned: log.xpEarned,
      metadata: log.metadata as Record<string, unknown> | null,
      createdAt: log.createdAt.toISOString(),
    }));

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  /**
   * Awards practice quiz session XP bonus with 5 grants/day cap.
   */
  async awardPracticeQuizXp(
    userId: string,
    dto: AwardPracticeXpDto,
    clientTimezone?: string,
  ): Promise<PracticeQuizXpRewardDto> {
    if (dto.score > dto.totalQuestions) {
      throw new BadRequestException(
        'Score cannot be greater than total questions',
      );
    }

    const { startUtc, endUtc } = getLocalDayUtcRange(
      new Date(),
      clientTimezone,
    );

    const todayQuizCount = await this.prisma.userActivityLog.count({
      where: {
        userId,
        activityType: XpActionType.PRACTICE_QUIZ,
        createdAt: { gte: startUtc, lte: endUtc },
      },
    });

    if (todayQuizCount >= 5) {
      throw new HttpException(
        'Daily practice quiz XP reward limit reached (5/day)',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, totalXp: true, level: true, tier: true },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    const scorePercentage =
      dto.totalQuestions > 0
        ? Math.round((dto.score / dto.totalQuestions) * 10000) / 100
        : 0;
    const xpEarned = scorePercentage >= 80 ? 30 : 10;
    const newTotalXp = user.totalXp + xpEarned;

    const levelUp = this.levelEngine.evaluateLevelUp(user.totalXp, newTotalXp);
    const progress = this.levelEngine.calculateLevelProgress(newTotalXp);

    await this.prisma.$transaction([
      this.prisma.userActivityLog.create({
        data: {
          userId,
          activityType: XpActionType.PRACTICE_QUIZ,
          xpEarned,
          metadata: {
            sessionId: dto.sessionId,
            score: dto.score,
            totalQuestions: dto.totalQuestions,
            scorePercentage,
          },
        },
      }),
      this.prisma.user.update({
        where: { id: userId },
        data: {
          totalXp: { increment: xpEarned },
          level: progress.level,
          tier: progress.tier,
        },
      }),
    ]);

    return {
      sessionId: dto.sessionId,
      scorePercentage,
      xpEarned,
      totalXp: newTotalXp,
      level: progress.level,
      tier: progress.tier,
      levelUp,
    };
  }
}
