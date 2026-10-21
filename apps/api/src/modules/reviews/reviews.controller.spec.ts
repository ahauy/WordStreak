/* eslint-disable @typescript-eslint/unbound-method */
import { HttpStatus } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ReviewsController } from './reviews.controller';
import { ReviewsService } from './reviews.service';
import { ReviewsSyncService } from './reviews-sync.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import type { Response } from 'express';
import type {
  JwtPayload,
  ReviewSummaryDto,
  SyncReviewResponseDto,
} from '@wordstreak/shared-types';

describe('ReviewsController', () => {
  let controller: ReviewsController;
  let service: jest.Mocked<ReviewsService>;
  let syncService: jest.Mocked<ReviewsSyncService>;

  const mockUser: JwtPayload = {
    sub: 'user-uuid-1',
    email: 'test@example.com',
    sessionId: 'sess-1',
  };

  beforeEach(async () => {
    const mockReviewsService = {
      getDueCards: jest.fn(),
      getTodaySession: jest.fn(),
      submitReview: jest.fn(),
      getReviewStats: jest.fn(),
      getReviewSummary: jest.fn(),
    };

    const mockReviewsSyncService = {
      syncReviews: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReviewsController],
      providers: [
        {
          provide: ReviewsService,
          useValue: mockReviewsService,
        },
        {
          provide: ReviewsSyncService,
          useValue: mockReviewsSyncService,
        },
      ],
    }).compile();

    controller = module.get<ReviewsController>(ReviewsController);
    service = module.get(ReviewsService);
    syncService = module.get(ReviewsSyncService);
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

  describe('syncReviewBatch', () => {
    it('TC-PWA-021: synchronizes batch reviews successfully', async () => {
      const mockSyncResult: SyncReviewResponseDto = {
        processedCount: 2,
        syncedCount: 2,
        failedCount: 0,
        conflictsResolved: 0,
        syncedCardIds: ['c1', 'c2'],
        totalXpAwarded: 20,
        streakUpdated: true,
        currentStreak: 3,
        bestStreak: 5,
        conflicts: [],
        serverTimestamp: new Date().toISOString(),
      };
      syncService.syncReviews.mockResolvedValue(mockSyncResult);

      const batchDto = {
        clientTimezone: 'Asia/Ho_Chi_Minh',
        reviews: [
          {
            idempotencyKey: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
            cardId: 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
            rating: 3 as const,
            interval: 6,
            easeFactor: 2.5,
            repetitions: 2,
            reviewedAtClient: new Date().toISOString(),
          },
        ],
      };

      const response = await controller.syncReviewBatch(
        mockUser,
        batchDto,
        'Asia/Ho_Chi_Minh',
      );

      expect(response.success).toBe(true);
      expect(response.data).toEqual(mockSyncResult);
      expect(syncService.syncReviews).toHaveBeenCalledWith(
        mockUser.sub,
        batchDto,
        'Asia/Ho_Chi_Minh',
      );
    });

    it('should return today session with prioritized cards and summary (US-UX-01)', async () => {
      const mockTodaySession = {
        cards: [],
        summary: {
          dueCount: 2,
          newCount: 8,
          totalCount: 10,
          dailyGoal: 10,
          isGoalCompleted: false,
        },
      };
      service.getTodaySession.mockResolvedValue(mockTodaySession);

      const response = await controller.getTodaySession(mockUser);

      expect(response.success).toBe(true);
      expect(response.data).toEqual(mockTodaySession);
      expect(service.getTodaySession).toHaveBeenCalledWith(mockUser.sub);
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

  describe('getReviewSummary', () => {
    it('TC-REM-008: returns 200 OK with ApiResponse<ReviewSummaryDto>, ETag, and Cache-Control', async () => {
      const mockSummary: ReviewSummaryDto = {
        dueCount: 12,
        newAvailable: 35,
        studiedToday: 4,
        dailyGoal: 10,
        goalReached: false,
        currentStreak: 5,
        streakAtRisk: false,
        timezone: 'Asia/Ho_Chi_Minh',
        endOfDayAt: '2026-10-12T16:59:59.999Z',
        nextDueAt: '2026-10-12T15:30:00.000Z',
      };
      service.getReviewSummary.mockResolvedValue(mockSummary);

      const mockRes = {
        setHeader: jest.fn(),
        status: jest.fn(),
      } as unknown as Response;

      const response = await controller.getReviewSummary(
        mockUser,
        'Asia/Ho_Chi_Minh',
        'Asia/Ho_Chi_Minh',
        undefined,
        mockRes,
      );

      expect(service.getReviewSummary).toHaveBeenCalledWith(
        mockUser.sub,
        'Asia/Ho_Chi_Minh',
        'Asia/Ho_Chi_Minh',
      );
      expect(response).toEqual({
        success: true,
        data: mockSummary,
      });
      expect(mockRes.setHeader).toHaveBeenCalledWith(
        'ETag',
        expect.stringMatching(/^W\/"[a-f0-9]{64}"$/),
      );
      expect(mockRes.setHeader).toHaveBeenCalledWith(
        'Cache-Control',
        'private, must-revalidate, max-age=0',
      );
    });

    it('TC-REM-009: returns 304 Not Modified with empty body when If-None-Match matches ETag', async () => {
      const mockSummary: ReviewSummaryDto = {
        dueCount: 12,
        newAvailable: 35,
        studiedToday: 4,
        dailyGoal: 10,
        goalReached: false,
        currentStreak: 5,
        streakAtRisk: false,
        timezone: 'Asia/Ho_Chi_Minh',
        endOfDayAt: '2026-10-12T16:59:59.999Z',
        nextDueAt: '2026-10-12T15:30:00.000Z',
      };
      service.getReviewSummary.mockResolvedValue(mockSummary);

      let computedEtag = '';
      const mockRes1 = {
        setHeader: jest.fn((k: string, v: string) => {
          if (k === 'ETag') computedEtag = v;
        }),
        status: jest.fn(),
      } as unknown as Response;

      await controller.getReviewSummary(
        mockUser,
        'Asia/Ho_Chi_Minh',
        undefined,
        undefined,
        mockRes1,
      );
      expect(computedEtag).toMatch(/^W\/"[a-f0-9]{64}"$/);

      const mockRes2 = {
        setHeader: jest.fn(),
        status: jest.fn(),
      } as unknown as Response;

      const response = await controller.getReviewSummary(
        mockUser,
        'Asia/Ho_Chi_Minh',
        undefined,
        computedEtag,
        mockRes2,
      );

      expect(mockRes2.status).toHaveBeenCalledWith(HttpStatus.NOT_MODIFIED);
      expect(mockRes2.setHeader).toHaveBeenCalledWith('ETag', computedEtag);
      expect(mockRes2.setHeader).toHaveBeenCalledWith(
        'Cache-Control',
        'private, must-revalidate, max-age=0',
      );
      expect(response).toBeUndefined();
    });

    it('TC-REM-010: handles comma-separated list, bare tag, and wildcard If-None-Match', async () => {
      const mockSummary: ReviewSummaryDto = {
        dueCount: 0,
        newAvailable: 0,
        studiedToday: 0,
        dailyGoal: 10,
        goalReached: false,
        currentStreak: 0,
        streakAtRisk: false,
        timezone: 'UTC',
        endOfDayAt: '2026-10-12T23:59:59.999Z',
        nextDueAt: null,
      };
      service.getReviewSummary.mockResolvedValue(mockSummary);

      let computedEtag = '';
      const probeRes = {
        setHeader: jest.fn((k: string, v: string) => {
          if (k === 'ETag') computedEtag = v;
        }),
        status: jest.fn(),
      } as unknown as Response;

      await controller.getReviewSummary(
        mockUser,
        undefined,
        undefined,
        undefined,
        probeRes,
      );
      const bareHash = computedEtag.replace(/^W\//, '');

      // Case 1: comma-separated list
      const res1 = {
        setHeader: jest.fn(),
        status: jest.fn(),
      } as unknown as Response;
      const resp1 = await controller.getReviewSummary(
        mockUser,
        undefined,
        undefined,
        `W/"stale-hash", ${computedEtag}`,
        res1,
      );
      expect(res1.status).toHaveBeenCalledWith(HttpStatus.NOT_MODIFIED);
      expect(resp1).toBeUndefined();

      // Case 2: bare tag without W/
      const res2 = {
        setHeader: jest.fn(),
        status: jest.fn(),
      } as unknown as Response;
      const resp2 = await controller.getReviewSummary(
        mockUser,
        undefined,
        undefined,
        bareHash,
        res2,
      );
      expect(res2.status).toHaveBeenCalledWith(HttpStatus.NOT_MODIFIED);
      expect(resp2).toBeUndefined();

      // Case 3: wildcard *
      const res3 = {
        setHeader: jest.fn(),
        status: jest.fn(),
      } as unknown as Response;
      const resp3 = await controller.getReviewSummary(
        mockUser,
        undefined,
        undefined,
        '*',
        res3,
      );
      expect(res3.status).toHaveBeenCalledWith(HttpStatus.NOT_MODIFIED);
      expect(resp3).toBeUndefined();
    });

    it('TC-REM-011: returns 200 OK with fresh body when If-None-Match is stale', async () => {
      const mockSummary: ReviewSummaryDto = {
        dueCount: 1,
        newAvailable: 0,
        studiedToday: 0,
        dailyGoal: 10,
        goalReached: false,
        currentStreak: 0,
        streakAtRisk: false,
        timezone: 'UTC',
        endOfDayAt: '2026-10-12T23:59:59.999Z',
        nextDueAt: null,
      };
      service.getReviewSummary.mockResolvedValue(mockSummary);

      const mockRes = {
        setHeader: jest.fn(),
        status: jest.fn(),
      } as unknown as Response;

      const response = await controller.getReviewSummary(
        mockUser,
        undefined,
        undefined,
        'W/"stale-sha256-hash"',
        mockRes,
      );

      expect(mockRes.status).not.toHaveBeenCalledWith(HttpStatus.NOT_MODIFIED);
      expect(response).toEqual({
        success: true,
        data: mockSummary,
      });
    });

    it('TC-REM-012: verifies JwtAuthGuard is applied on ReviewsController', () => {
      const guards = Reflect.getMetadata(
        '__guards__',
        ReviewsController,
      ) as unknown[];
      expect(guards).toBeDefined();
      expect(guards).toContain(JwtAuthGuard);
    });
  });
});
