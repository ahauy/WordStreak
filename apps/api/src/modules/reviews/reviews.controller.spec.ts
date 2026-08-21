/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { ReviewsController } from './reviews.controller';
import { ReviewsService } from './reviews.service';
import type { JwtPayload } from '@wordstreak/shared-types';

describe('ReviewsController', () => {
  let controller: ReviewsController;
  let service: jest.Mocked<ReviewsService>;

  const mockUser: JwtPayload = {
    sub: 'user-uuid-1',
    email: 'test@example.com',
    sessionId: 'sess-1',
  };

  beforeEach(async () => {
    const mockReviewsService = {
      getDueCards: jest.fn(),
      submitReview: jest.fn(),
      getReviewStats: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReviewsController],
      providers: [
        {
          provide: ReviewsService,
          useValue: mockReviewsService,
        },
      ],
    }).compile();

    controller = module.get<ReviewsController>(ReviewsController);
    service = module.get(ReviewsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getDueCards', () => {
    it('returns due cards response', async () => {
      const mockResult = {
        data: [],
        meta: { totalDue: 0, overdueCount: 0, dueTodayCount: 0, newCount: 0 },
      };
      service.getDueCards.mockResolvedValue(mockResult);

      const response = await controller.getDueCards(mockUser, {});
      expect(response.success).toBe(true);
      expect(response.data).toEqual([]);
      expect(service.getDueCards).toHaveBeenCalledWith(mockUser.sub, {});
    });
  });

  describe('submitReview', () => {
    it('submits review rating successfully', async () => {
      const mockSubmitResult = {
        cardId: 'card-1',
        status: 'LEARNING' as const,
        interval: 6,
        repetitions: 2,
        easeFactor: 2.5,
        lastReviewedAt: new Date(),
        nextReviewDate: new Date(),
        streak: {
          currentStreak: 1,
          bestStreak: 1,
          streakIncreased: true,
          isActiveToday: true,
          flameTier: 1 as const,
          message: 'Streak active!',
          streakFreezes: 0,
        },
        xp: {
          xpEarned: 10,
          breakdown: [],
          totalXp: 10,
          level: 1,
          tier: 'BRONZE' as const,
          currentLevelXp: 10,
          nextLevelRequiredXp: 100,
          levelProgressPercent: 10,
          levelUp: {
            isLevelUp: false,
            previousLevel: 1,
            currentLevel: 1,
            previousTier: 'BRONZE' as const,
            currentTier: 'BRONZE' as const,
            isTierPromotion: false,
          },
        },
      };
      service.submitReview.mockResolvedValue(mockSubmitResult);

      const response = await controller.submitReview(mockUser, {
        cardId: 'card-1',
        rating: 3,
      });

      expect(response.success).toBe(true);
      expect(response.data).toEqual(mockSubmitResult);
      expect(service.submitReview).toHaveBeenCalledWith(
        mockUser.sub,
        {
          cardId: 'card-1',
          rating: 3,
        },
        undefined,
      );
    });
  });

  describe('getReviewStats', () => {
    it('returns review statistics', async () => {
      const mockStats = {
        totalCards: 20,
        dueCount: 5,
        newCount: 3,
        learningCount: 10,
        masteredCount: 7,
      };
      service.getReviewStats.mockResolvedValue(mockStats);

      const response = await controller.getReviewStats(mockUser);
      expect(response.success).toBe(true);
      expect(response.data).toEqual(mockStats);
      expect(service.getReviewStats).toHaveBeenCalledWith(mockUser.sub);
    });
  });
});
