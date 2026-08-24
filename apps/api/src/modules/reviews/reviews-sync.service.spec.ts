/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { ReviewsSyncService } from './reviews-sync.service';
import { SrsService } from './srs.service';
import { StreakService } from '../streaks/streak.service';
import { PrismaService } from '../prisma/prisma.service';
import type { SyncReviewBatchDto } from '@wordstreak/shared-types';

describe('ReviewsSyncService', () => {
  let service: ReviewsSyncService;
  let srsService: SrsService;
  let streakService: StreakService;

  let prismaMock: {
    user: { findUnique: jest.Mock; update: jest.Mock };
    card: { findUnique: jest.Mock };
    userCardProgress: {
      findUnique: jest.Mock;
      create: jest.Mock;
      update: jest.Mock;
    };
    reviewLog: { create: jest.Mock };
    userActivityLog: { create: jest.Mock };
    userStreak: {
      findUnique: jest.Mock;
      create: jest.Mock;
      update: jest.Mock;
    };
    $transaction: jest.Mock;
  };

  const mockUserId = 'user-uuid-1';

  beforeEach(async () => {
    prismaMock = {
      user: {
        findUnique: jest.fn().mockResolvedValue({
          id: mockUserId,
          totalXp: 100,
        }),
        update: jest.fn().mockImplementation(({ data }) => {
          const increment = data?.totalXp?.increment ?? 0;
          return Promise.resolve({
            id: mockUserId,
            totalXp: 100 + increment,
          });
        }),
      },
      card: {
        findUnique: jest.fn().mockImplementation(({ where }) => {
          return Promise.resolve({
            id: where.id,
            deck: { userId: mockUserId },
          });
        }),
      },
      userCardProgress: {
        findUnique: jest.fn().mockImplementation(({ where }) => {
          return Promise.resolve({
            id: `prog-${where.userId_cardId.cardId}`,
            userId: mockUserId,
            cardId: where.userId_cardId.cardId,
            interval: 1,
            repetitions: 1,
            easeFactor: 2.5,
            status: 'LEARNING',
          });
        }),
        create: jest.fn().mockImplementation(({ data }) => {
          return Promise.resolve({
            id: `prog-created-${data.cardId}`,
            ...data,
          });
        }),
        update: jest.fn().mockImplementation(({ data }) => {
          return Promise.resolve({
            id: 'prog-updated',
            ...data,
          });
        }),
      },
      reviewLog: {
        create: jest.fn().mockImplementation(({ data }) => {
          return Promise.resolve({
            id: 'log-uuid',
            ...data,
          });
        }),
      },
      userActivityLog: {
        create: jest.fn().mockImplementation(({ data }) => {
          return Promise.resolve({
            id: 'activity-uuid',
            ...data,
          });
        }),
      },
      userStreak: {
        findUnique: jest.fn().mockResolvedValue({
          id: 'streak-1',
          userId: mockUserId,
          currentStreak: 1,
          bestStreak: 1,
          lastActiveDate: new Date(),
          streakFreezes: 1,
          totalFreezesUsed: 0,
          lastFreezeDate: null,
        }),
        create: jest.fn().mockResolvedValue({
          id: 'streak-new',
          userId: mockUserId,
          currentStreak: 0,
          bestStreak: 0,
          lastActiveDate: null,
          streakFreezes: 1,
          totalFreezesUsed: 0,
          lastFreezeDate: null,
        }),
        update: jest.fn().mockImplementation(({ data }) => {
          return Promise.resolve({
            id: 'streak-1',
            userId: mockUserId,
            ...data,
          });
        }),
      },
      $transaction: jest
        .fn()
        .mockImplementation((callback: (tx: any) => Promise<any>) =>
          callback(prismaMock),
        ),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReviewsSyncService,
        SrsService,
        StreakService,
        {
          provide: PrismaService,
          useValue: prismaMock,
        },
      ],
    }).compile();

    service = module.get<ReviewsSyncService>(ReviewsSyncService);
    srsService = module.get<SrsService>(SrsService);
    streakService = module.get<StreakService>(StreakService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('syncReviews', () => {
    it('TC-PWA-003: processes successful batch sync of 5 offline reviews within 48h', async () => {
      const now = new Date();
      const reviewTime1 = new Date(
        now.getTime() - 4 * 3600 * 1000,
      ).toISOString();
      const reviewTime2 = new Date(
        now.getTime() - 3 * 3600 * 1000,
      ).toISOString();
      const reviewTime3 = new Date(
        now.getTime() - 2 * 3600 * 1000,
      ).toISOString();
      const reviewTime4 = new Date(
        now.getTime() - 1 * 3600 * 1000,
      ).toISOString();
      const reviewTime5 = new Date(now.getTime() - 1800 * 1000).toISOString();

      const batchDto: SyncReviewBatchDto = {
        clientTimezone: 'Asia/Ho_Chi_Minh',
        reviews: [
          {
            idempotencyKey: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
            cardId: 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
            rating: 3,
            interval: 6,
            easeFactor: 2.5,
            repetitions: 2,
            reviewedAtClient: reviewTime1,
          },
          {
            idempotencyKey: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12',
            cardId: 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12',
            rating: 4,
            interval: 6,
            easeFactor: 2.6,
            repetitions: 2,
            reviewedAtClient: reviewTime2,
          },
          {
            idempotencyKey: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13',
            cardId: 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13',
            rating: 3,
            interval: 6,
            easeFactor: 2.5,
            repetitions: 2,
            reviewedAtClient: reviewTime3,
          },
          {
            idempotencyKey: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14',
            cardId: 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14',
            rating: 2,
            interval: 1,
            easeFactor: 2.36,
            repetitions: 0,
            reviewedAtClient: reviewTime4,
          },
          {
            idempotencyKey: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15',
            cardId: 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15',
            rating: 3,
            interval: 6,
            easeFactor: 2.5,
            repetitions: 2,
            reviewedAtClient: reviewTime5,
          },
        ],
      };

      const result = await service.syncReviews(mockUserId, batchDto);

      expect(result.processedCount).toBe(5);
      expect(result.syncedCount).toBe(5);
      expect(result.failedCount).toBe(0);
      expect(result.conflictsResolved).toBe(0);
      expect(result.conflicts).toEqual([]);
      // Rating 3 (10 XP) + Rating 4 (10 XP) + Rating 3 (10 XP) + Rating 2 (5 XP) + Rating 3 (10 XP) = 45 XP
      expect(result.totalXpAwarded).toBe(45);
      expect(prismaMock.userCardProgress.update).toHaveBeenCalledTimes(5);
      expect(prismaMock.reviewLog.create).toHaveBeenCalledTimes(5);
      expect(prismaMock.userActivityLog.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            userId: mockUserId,
            activityType: 'HISTORICAL_BACKFILL',
            xpEarned: 45,
          }),
        }),
      );
    });

    it('TC-PWA-004: reconciles 48-hour streak across multiple days and awards milestone freeze', async () => {
      const now = new Date();
      // Suppose user's last active date was 2 days ago (delta = 2) with streak = 5, streakFreezes = 1
      const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 3600 * 1000);
      const yesterday = new Date(now.getTime() - 1 * 24 * 3600 * 1000);
      const today = now;

      prismaMock.userStreak.findUnique.mockResolvedValue({
        id: 'streak-1',
        userId: mockUserId,
        currentStreak: 5,
        bestStreak: 5,
        lastActiveDate: twoDaysAgo,
        streakFreezes: 1,
        totalFreezesUsed: 0,
        lastFreezeDate: null,
      });

      const batchDto: SyncReviewBatchDto = {
        clientTimezone: 'Asia/Ho_Chi_Minh',
        reviews: [
          {
            idempotencyKey: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a21',
            cardId: 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a21',
            rating: 3,
            interval: 6,
            easeFactor: 2.5,
            repetitions: 2,
            reviewedAtClient: yesterday.toISOString(),
          },
          {
            idempotencyKey: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
            cardId: 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
            rating: 4,
            interval: 6,
            easeFactor: 2.6,
            repetitions: 2,
            reviewedAtClient: today.toISOString(),
          },
        ],
      };

      const result = await service.syncReviews(mockUserId, batchDto);

      expect(result.streakUpdated).toBe(true);
      // Yesterday: delta 1 from 2 days ago (or consecutive) -> streak becomes 6
      // Today: delta 1 from yesterday -> streak becomes 7 (Milestone 7 days awards +1 freeze!)
      expect(result.currentStreak).toBe(7);
      expect(result.bestStreak).toBe(7);
      expect(prismaMock.userStreak.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            currentStreak: 7,
            bestStreak: 7,
          }),
        }),
      );
    });

    it('TC-PWA-005: handles deleted card conflict resolution and awards base XP', async () => {
      const now = new Date();
      const validCardId1 = 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a31';
      const deletedCardId = 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a32';
      const validCardId2 = 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33';

      prismaMock.card.findUnique.mockImplementation(({ where }) => {
        if (where.id === deletedCardId) {
          return Promise.resolve(null);
        }
        return Promise.resolve({
          id: where.id,
          deck: { userId: mockUserId },
        });
      });

      const batchDto: SyncReviewBatchDto = {
        reviews: [
          {
            idempotencyKey: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a31',
            cardId: validCardId1,
            rating: 3,
            interval: 6,
            easeFactor: 2.5,
            repetitions: 2,
            reviewedAtClient: new Date(
              now.getTime() - 3600 * 1000,
            ).toISOString(),
          },
          {
            idempotencyKey: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a32',
            cardId: deletedCardId,
            rating: 3,
            interval: 6,
            easeFactor: 2.5,
            repetitions: 2,
            reviewedAtClient: new Date(
              now.getTime() - 1800 * 1000,
            ).toISOString(),
          },
          {
            idempotencyKey: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33',
            cardId: validCardId2,
            rating: 4,
            interval: 6,
            easeFactor: 2.6,
            repetitions: 2,
            reviewedAtClient: now.toISOString(),
          },
        ],
      };

      const result = await service.syncReviews(mockUserId, batchDto);

      expect(result.processedCount).toBe(3);
      expect(result.syncedCount).toBe(2);
      expect(result.failedCount).toBe(1);
      expect(result.conflictsResolved).toBe(1);
      expect(result.conflicts).toEqual([
        {
          cardId: deletedCardId,
          action: 'DELETED_CARD_DROPPED',
          reason: 'Card was deleted or inaccessible',
        },
      ]);
      // Valid card 1 (10 XP) + Deleted card effort (10 XP) + Valid card 2 (10 XP) = 30 XP
      expect(result.totalXpAwarded).toBe(30);
    });

    it('TC-PWA-006: rejects review timestamps exceeding clock drift limit (>5 min in future)', async () => {
      const serverNow = new Date();
      const futureTime = new Date(
        serverNow.getTime() + 10 * 60 * 1000,
      ).toISOString(); // 10 mins in future

      const batchDto: SyncReviewBatchDto = {
        reviews: [
          {
            idempotencyKey: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a41',
            cardId: 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a41',
            rating: 3,
            interval: 6,
            easeFactor: 2.5,
            repetitions: 2,
            reviewedAtClient: futureTime,
          },
        ],
      };

      await expect(service.syncReviews(mockUserId, batchDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('TC-PWA-006: enforces anti-abuse 500 XP hard cap per batch', async () => {
      const now = new Date();
      const reviews = Array.from({ length: 60 }, (_, i) => ({
        idempotencyKey: `a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a${String(i).padStart(2, '0')}`,
        cardId: `b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a${String(i).padStart(2, '0')}`,
        rating: 3 as const,
        interval: 6,
        easeFactor: 2.5,
        repetitions: 2,
        reviewedAtClient: new Date(
          now.getTime() - (60 - i) * 60 * 1000,
        ).toISOString(),
      }));

      const batchDto: SyncReviewBatchDto = {
        reviews,
      };

      const result = await service.syncReviews(mockUserId, batchDto);

      // Raw XP would be 60 * 10 = 600 XP, but capped at 500 XP
      expect(result.processedCount).toBe(60);
      expect(result.totalXpAwarded).toBe(500);
      expect(prismaMock.user.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: { totalXp: { increment: 500 } },
        }),
      );
    });

    it('TC-PWA-007: bypasses historical streak backfill if reviews are older than 48 hours', async () => {
      const now = new Date();
      const threeDaysAgo = new Date(
        now.getTime() - 72 * 3600 * 1000,
      ).toISOString();

      prismaMock.userStreak.findUnique.mockResolvedValue({
        id: 'streak-1',
        userId: mockUserId,
        currentStreak: 3,
        bestStreak: 3,
        lastActiveDate: new Date(now.getTime() - 4 * 24 * 3600 * 1000),
        streakFreezes: 0,
        totalFreezesUsed: 0,
        lastFreezeDate: null,
      });

      const batchDto: SyncReviewBatchDto = {
        reviews: [
          {
            idempotencyKey: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a51',
            cardId: 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a51',
            rating: 3,
            interval: 6,
            easeFactor: 2.5,
            repetitions: 2,
            reviewedAtClient: threeDaysAgo,
          },
        ],
      };

      const result = await service.syncReviews(mockUserId, batchDto);

      expect(result.processedCount).toBe(1);
      expect(result.syncedCount).toBe(1);
      expect(result.streakUpdated).toBe(false);
      expect(result.currentStreak).toBe(3);
    });

    it('throws NotFoundException when user does not exist', async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);

      const batchDto: SyncReviewBatchDto = {
        reviews: [
          {
            idempotencyKey: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a61',
            cardId: 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a61',
            rating: 3,
            interval: 6,
            easeFactor: 2.5,
            repetitions: 2,
            reviewedAtClient: new Date().toISOString(),
          },
        ],
      };

      await expect(
        service.syncReviews('non-existent-user', batchDto),
      ).rejects.toThrow(NotFoundException);
    });

    it('throws BadRequestException when review timestamp format is invalid', async () => {
      const batchDto: SyncReviewBatchDto = {
        reviews: [
          {
            idempotencyKey: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a71',
            cardId: 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a71',
            rating: 3,
            interval: 6,
            easeFactor: 2.5,
            repetitions: 2,
            reviewedAtClient: 'not-a-valid-date',
          },
        ],
      };

      await expect(service.syncReviews(mockUserId, batchDto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });
});
