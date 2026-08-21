/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import {
  HttpException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { XpService } from './xp.service';
import { LevelEngineService } from './level-engine.service';
import { XpRateLimiterService } from './xp-rate-limiter.service';
import { PrismaService } from '../../prisma/prisma.service';
import { MasteryTier, XpActionType } from '@wordstreak/shared-types';

describe('XpService', () => {
  let service: XpService;
  let prisma: any;
  let xpRateLimiter: XpRateLimiterService;

  beforeEach(async () => {
    prisma = {
      user: {
        findUnique: jest.fn(),
        update: jest.fn(),
      },
      reviewLog: {
        count: jest.fn(),
      },
      userActivityLog: {
        create: jest.fn().mockReturnValue({ id: 'log-1' }),
        count: jest.fn(),
        findFirst: jest.fn(),
        findMany: jest.fn(),
        aggregate: jest.fn(),
      },
      $transaction: jest
        .fn()
        .mockImplementation((promises) => Promise.all(promises)),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        XpService,
        LevelEngineService,
        {
          provide: XpRateLimiterService,
          useValue: {
            checkRateLimit: jest
              .fn()
              .mockResolvedValue({ isAllowed: true, hourlyXp: 0, dailyXp: 0 }),
            recordReviewXp: jest.fn(),
          },
        },
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<XpService>(XpService);
    xpRateLimiter = module.get<XpRateLimiterService>(XpRateLimiterService);
  });

  describe('awardReviewXp', () => {
    const mockUser = {
      id: 'usr_1',
      dailyGoal: 10,
      totalXp: 100,
      level: 2,
      tier: MasteryTier.BRONZE,
    };

    it('should throw NotFoundException if user does not exist', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(
        service.awardReviewXp('usr_unknown', { cardId: 'c1', rating: 3 }),
      ).rejects.toThrow(NotFoundException);
    });

    it('TC-XP-001: should award +10 XP for rating 3 (Good) and 4 (Easy)', async () => {
      prisma.user.findUnique.mockResolvedValue(mockUser);
      prisma.reviewLog.count.mockResolvedValue(5); // under daily goal

      const res = await service.awardReviewXp('usr_1', {
        cardId: 'c1',
        rating: 3,
      });

      expect(res.xpEarned).toBe(10);
      expect(res.totalXp).toBe(110);
      expect(res.breakdown).toEqual([
        expect.objectContaining({ type: XpActionType.CARD_REVIEW, xp: 10 }),
      ]);
      expect(prisma.$transaction).toHaveBeenCalledTimes(1);
      expect(xpRateLimiter.recordReviewXp).toHaveBeenCalledWith('usr_1', 10);
    });

    it('TC-XP-002: should award +5 XP for rating 2 (Hard)', async () => {
      prisma.user.findUnique.mockResolvedValue(mockUser);
      prisma.reviewLog.count.mockResolvedValue(5);

      const res = await service.awardReviewXp('usr_1', {
        cardId: 'c1',
        rating: 2,
      });

      expect(res.xpEarned).toBe(5);
      expect(res.breakdown[0].xp).toBe(5);
    });

    it('TC-XP-003: should award 0 XP for rating 1 (Again)', async () => {
      prisma.user.findUnique.mockResolvedValue(mockUser);
      prisma.reviewLog.count.mockResolvedValue(5);

      const res = await service.awardReviewXp('usr_1', {
        cardId: 'c1',
        rating: 1,
      });

      expect(res.xpEarned).toBe(0);
      expect(res.totalXp).toBe(100);
      expect(prisma.$transaction).not.toHaveBeenCalled();
    });

    it('TC-XP-004: should award +50 XP bonus when user reaches daily review goal', async () => {
      prisma.user.findUnique.mockResolvedValue(mockUser);
      prisma.reviewLog.count.mockResolvedValue(10); // reached dailyGoal = 10
      prisma.userActivityLog.findFirst.mockResolvedValue(null); // not yet awarded today

      const res = await service.awardReviewXp('usr_1', {
        cardId: 'c1',
        rating: 3,
      });

      expect(res.xpEarned).toBe(60); // 10 review + 50 goal
      expect(res.breakdown).toHaveLength(2);
      expect(res.breakdown[1].type).toBe(XpActionType.DAILY_GOAL_COMPLETED);
      expect(res.breakdown[1].xp).toBe(50);
    });

    it('TC-XP-005: should skip daily goal bonus if already awarded today', async () => {
      prisma.user.findUnique.mockResolvedValue(mockUser);
      prisma.reviewLog.count.mockResolvedValue(12);
      prisma.userActivityLog.findFirst.mockResolvedValue({
        id: 'existing_goal_log',
      });

      const res = await service.awardReviewXp('usr_1', {
        cardId: 'c1',
        rating: 3,
      });

      expect(res.xpEarned).toBe(10);
      expect(res.breakdown).toHaveLength(1);
    });

    it('TC-XP-006: should award +100 XP for 7-day streak milestone when streakIncreased is true', async () => {
      prisma.user.findUnique.mockResolvedValue(mockUser);
      prisma.reviewLog.count.mockResolvedValue(2);

      const res = await service.awardReviewXp('usr_1', {
        cardId: 'c1',
        rating: 3,
        streakResult: {
          currentStreak: 7,
          bestStreak: 7,
          streakIncreased: true,
          isActiveToday: true,
          flameTier: 2,
          message: '7 day streak!',
          streakFreezes: 1,
        },
      });

      expect(res.xpEarned).toBe(110); // 10 review + 100 streak
      expect(res.breakdown).toContainEqual(
        expect.objectContaining({ type: XpActionType.STREAK_7_DAYS, xp: 100 }),
      );
    });

    it('TC-XP-007: should award +500 XP for 30-day streak milestone', async () => {
      prisma.user.findUnique.mockResolvedValue(mockUser);
      prisma.reviewLog.count.mockResolvedValue(2);

      const res = await service.awardReviewXp('usr_1', {
        cardId: 'c1',
        rating: 3,
        streakResult: {
          currentStreak: 30,
          bestStreak: 30,
          streakIncreased: true,
          isActiveToday: true,
          flameTier: 4,
          message: '30 day streak!',
          streakFreezes: 2,
        },
      });

      expect(res.xpEarned).toBe(510); // 10 review + 500 streak
      expect(res.breakdown).toContainEqual(
        expect.objectContaining({ type: XpActionType.STREAK_30_DAYS, xp: 500 }),
      );
    });

    it('TC-XP-013: should suppress review XP when velocity rate limit is triggered', async () => {
      prisma.user.findUnique.mockResolvedValue(mockUser);
      prisma.reviewLog.count.mockResolvedValue(3);
      (xpRateLimiter.checkRateLimit as jest.Mock).mockResolvedValueOnce({
        isAllowed: false,
        hourlyXp: 500,
        dailyXp: 500,
      });

      const res = await service.awardReviewXp('usr_1', {
        cardId: 'c1',
        rating: 3,
      });

      expect(res.xpEarned).toBe(0);
      expect(res.breakdown).toEqual([
        expect.objectContaining({ type: 'RATE_LIMITED', xp: 0 }),
      ]);
    });
  });

  describe('getXpSummary', () => {
    it('should return complete user XP summary and today metrics', async () => {
      prisma.user.findUnique.mockResolvedValue({
        id: 'usr_1',
        totalXp: 4250,
        level: 18,
        tier: MasteryTier.GOLD,
      });
      prisma.userActivityLog.aggregate.mockResolvedValue({
        _sum: { xpEarned: 80 },
      });
      prisma.userActivityLog.findFirst.mockResolvedValue({ id: 'goal_log' });

      const summary = await service.getXpSummary('usr_1');

      expect(summary.userId).toBe('usr_1');
      expect(summary.totalXp).toBe(4250);
      expect(summary.level).toBe(17);
      expect(summary.tier).toBe(MasteryTier.GOLD);
      expect(summary.todayXp).toBe(80);
      expect(summary.dailyGoalBonusEarnedToday).toBe(true);
      expect(summary.nextTier).toBe(MasteryTier.DIAMOND);
      expect(summary.nextTierLevel).toBe(31);
      expect(summary.tierMetadata.nameEn).toBe('Gold');
    });
  });

  describe('getXpHistory', () => {
    it('should return paginated activity log items', async () => {
      prisma.userActivityLog.count.mockResolvedValue(1);
      prisma.userActivityLog.findMany.mockResolvedValue([
        {
          id: 'log_1',
          activityType: XpActionType.CARD_REVIEW,
          xpEarned: 10,
          metadata: { cardId: 'c1' },
          createdAt: new Date('2026-08-21T07:49:00.000Z'),
        },
      ]);

      const history = await service.getXpHistory('usr_1', {
        page: 1,
        limit: 20,
      });

      expect(history.data).toHaveLength(1);
      expect(history.data[0].activityType).toBe(XpActionType.CARD_REVIEW);
      expect(history.meta.total).toBe(1);
      expect(history.meta.totalPages).toBe(1);
    });
  });

  describe('awardPracticeQuizXp', () => {
    it('TC-XP-018: should award +30 XP for quiz score >= 80%', async () => {
      prisma.userActivityLog.count.mockResolvedValue(1); // 1 session today
      prisma.user.findUnique.mockResolvedValue({
        id: 'usr_1',
        totalXp: 100,
        level: 2,
        tier: MasteryTier.BRONZE,
      });

      const res = await service.awardPracticeQuizXp('usr_1', {
        sessionId: 'quiz_1',
        score: 9,
        totalQuestions: 10,
      });

      expect(res.xpEarned).toBe(30);
      expect(res.scorePercentage).toBe(90);
      expect(res.totalXp).toBe(130);
      expect(prisma.$transaction).toHaveBeenCalled();
    });

    it('TC-XP-019: should award +10 XP for quiz score < 80%', async () => {
      prisma.userActivityLog.count.mockResolvedValue(0);
      prisma.user.findUnique.mockResolvedValue({
        id: 'usr_1',
        totalXp: 100,
        level: 2,
        tier: MasteryTier.BRONZE,
      });

      const res = await service.awardPracticeQuizXp('usr_1', {
        sessionId: 'quiz_2',
        score: 6,
        totalQuestions: 10,
      });

      expect(res.xpEarned).toBe(10);
      expect(res.scorePercentage).toBe(60);
      expect(res.totalXp).toBe(110);
    });

    it('TC-XP-020: should throw 429 when practice quiz daily cap of 5 is exceeded', async () => {
      prisma.userActivityLog.count.mockResolvedValue(5);

      await expect(
        service.awardPracticeQuizXp('usr_1', {
          sessionId: 'quiz_6',
          score: 10,
          totalQuestions: 10,
        }),
      ).rejects.toThrow(HttpException);
    });

    it('should throw BadRequestException when score exceeds total questions', async () => {
      await expect(
        service.awardPracticeQuizXp('usr_1', {
          sessionId: 'quiz_invalid',
          score: 12,
          totalQuestions: 10,
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
