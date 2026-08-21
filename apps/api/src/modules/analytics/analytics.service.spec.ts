import { Test, TestingModule } from '@nestjs/testing';
import { AnalyticsService } from './analytics.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException, ForbiddenException } from '@nestjs/common';

describe('AnalyticsService', () => {
  let service: AnalyticsService;
  let prisma: {
    userCardProgress: {
      findMany: jest.Mock;
    };
    reviewLog: {
      findMany: jest.Mock;
      count: jest.Mock;
    };
    deck: {
      findUnique: jest.Mock;
      findMany: jest.Mock;
    };
    userStreak: {
      findUnique: jest.Mock;
    };
  };

  const mockUserId = 'user-uuid-1';
  const mockDeckId = 'deck-uuid-1';

  beforeEach(async () => {
    prisma = {
      userCardProgress: {
        findMany: jest.fn(),
      },
      reviewLog: {
        findMany: jest.fn(),
        count: jest.fn(),
      },
      deck: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
      },
      userStreak: {
        findUnique: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AnalyticsService,
        {
          provide: PrismaService,
          useValue: prisma,
        },
      ],
    }).compile();

    service = module.get<AnalyticsService>(AnalyticsService);
  });

  describe('getMasterySummary', () => {
    it('TC-STAT-001: correctly calculates counts and percentages for Mastered, Learning, and New cards', async () => {
      prisma.userCardProgress.findMany.mockResolvedValue([
        { interval: 25, repetitions: 5, status: 'MASTERED' }, // Mastered
        { interval: 21, repetitions: 4, status: 'MASTERED' }, // Mastered
        { interval: 6, repetitions: 2, status: 'LEARNING' }, // Learning
        { interval: 0, repetitions: 0, status: 'NEW' }, // New
      ]);

      const result = await service.getMasterySummary(mockUserId);

      expect(result).toEqual({
        totalCards: 4,
        masteredCount: 2,
        masteredPercentage: 50.0,
        learningCount: 1,
        learningPercentage: 25.0,
        newCount: 1,
        newPercentage: 25.0,
      });
    });

    it('TC-STAT-002: handles empty deck gracefully (returns 0s without division by zero)', async () => {
      prisma.userCardProgress.findMany.mockResolvedValue([]);

      const result = await service.getMasterySummary(mockUserId, mockDeckId);

      expect(result).toEqual({
        totalCards: 0,
        masteredCount: 0,
        masteredPercentage: 0,
        learningCount: 0,
        learningPercentage: 0,
        newCount: 0,
        newPercentage: 0,
      });
    });
  });

  describe('getActivityHeatmap', () => {
    it('TC-STAT-003: aggregates daily review counts for 365 rolling days and assigns intensity levels', async () => {
      const now = new Date();
      prisma.reviewLog.findMany.mockResolvedValue([
        { reviewedAt: now },
        { reviewedAt: now },
        { reviewedAt: new Date(now.getTime() - 24 * 3600 * 1000) },
      ]);

      const result = await service.getActivityHeatmap(mockUserId, 'UTC');

      expect(result.days).toHaveLength(365);
      expect(result.totalReviews).toBe(3);
      expect(result.activeDaysCount).toBe(2);
      expect(result.longestDailyReviews).toBe(2);

      const todayItem = result.days[result.days.length - 1];
      expect(todayItem.count).toBe(2);
      expect(todayItem.level).toBe(1); // 1-5 reviews is Level 1
    });

    it('TC-STAT-004: sanitizes invalid timezone string to UTC safely', async () => {
      prisma.reviewLog.findMany.mockResolvedValue([]);

      const result = await service.getActivityHeatmap(
        mockUserId,
        'Invalid/Timezone_XYZ',
      );

      expect(result.days).toHaveLength(365);
      expect(result.totalReviews).toBe(0);
    });
  });

  describe('getDeckForecast', () => {
    it('TC-STAT-006: computes 7-day velocity and projected completion date', async () => {
      prisma.deck.findUnique.mockResolvedValue({
        id: mockDeckId,
        title: 'IELTS Band 8',
        color: '#6366F1',
        userId: mockUserId,
        user: { dailyGoal: 10 },
      });

      prisma.userCardProgress.findMany.mockResolvedValue([
        { interval: 30, repetitions: 5 }, // Mastered
        { interval: 1, repetitions: 1 }, // Remaining
        { interval: 0, repetitions: 0 }, // Remaining
      ]);

      const now = new Date();
      prisma.reviewLog.findMany.mockResolvedValue([
        { reviewedAt: new Date(now.getTime() - 1 * 86400000) },
        { reviewedAt: new Date(now.getTime() - 2 * 86400000) },
        { reviewedAt: new Date(now.getTime() - 3 * 86400000) },
        { reviewedAt: new Date(now.getTime() - 4 * 86400000) },
      ]);

      const result = await service.getDeckForecast(mockUserId, mockDeckId);

      expect(result.deckId).toBe(mockDeckId);
      expect(result.totalCards).toBe(3);
      expect(result.masteredCards).toBe(1);
      expect(result.remainingCards).toBe(2);
      expect(result.isCompleted).toBe(false);
      expect(result.estimatedDaysToComplete).toBeGreaterThan(0);
      expect(result.projectedCompletionDate).toBeDefined();
    });

    it('throws NotFoundException if deck does not exist', async () => {
      prisma.deck.findUnique.mockResolvedValue(null);

      await expect(
        service.getDeckForecast(mockUserId, 'non-existent-deck'),
      ).rejects.toThrow(NotFoundException);
    });

    it('throws ForbiddenException if deck does not belong to user', async () => {
      prisma.deck.findUnique.mockResolvedValue({
        id: mockDeckId,
        userId: 'other-user',
      });

      await expect(
        service.getDeckForecast(mockUserId, mockDeckId),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('getOverview', () => {
    it('TC-STAT-007: calculates 30-day retention percentage and returns overview metrics', async () => {
      prisma.userCardProgress.findMany.mockResolvedValue([
        { interval: 25, repetitions: 4, status: 'MASTERED' },
      ]);

      prisma.reviewLog.findMany.mockResolvedValue([
        { rating: 3 }, // Good
        { rating: 4 }, // Easy
        { rating: 1 }, // Again
        { rating: 2 }, // Hard
      ]);

      prisma.reviewLog.count.mockResolvedValue(10);

      prisma.userStreak.findUnique.mockResolvedValue({
        currentStreak: 7,
        bestStreak: 14,
      });

      const result = await service.getOverview(mockUserId);

      expect(result.totalReviewsLogged).toBe(10);
      expect(result.currentStreak).toBe(7);
      expect(result.bestStreak).toBe(14);
      expect(result.retentionRate30Days).toBe(50.0); // 2 out of 4 ratings >= 3
      expect(result.masterySummary.masteredCount).toBe(1);
    });
  });
});
