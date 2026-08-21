/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Test, TestingModule } from '@nestjs/testing';
import { ReviewsService } from './reviews.service';
import { SrsService } from './srs.service';
import { StreakService } from '../streaks/streak.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException, ForbiddenException } from '@nestjs/common';

describe('ReviewsService', () => {
  let service: ReviewsService;
  let streakService: {
    recordActivity: jest.Mock;
  };
  let prisma: {
    user: { findUnique: jest.Mock };
    card: { findUnique: jest.Mock };
    userCardProgress: {
      findMany: jest.Mock;
      findUnique: jest.Mock;
      create: jest.Mock;
      update: jest.Mock;
      count: jest.Mock;
    };
  };

  const mockUserId = 'user-uuid-1';
  const mockCardId = 'card-uuid-1';

  beforeEach(async () => {
    streakService = {
      recordActivity: jest.fn().mockResolvedValue({
        currentStreak: 1,
        bestStreak: 1,
        streakIncreased: true,
        isActiveToday: true,
        flameTier: 1,
        message: 'New streak started!',
      }),
    };

    prisma = {
      user: { findUnique: jest.fn() },
      card: { findUnique: jest.fn() },
      userCardProgress: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        count: jest.fn(),
      },
      reviewLog: {
        create: jest.fn().mockResolvedValue({
          id: 'log-1',
          userId: mockUserId,
          cardId: mockCardId,
          rating: 3,
          interval: 1,
          reviewedAt: new Date(),
        }),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReviewsService,
        SrsService,
        {
          provide: StreakService,
          useValue: streakService,
        },
        {
          provide: PrismaService,
          useValue: prisma,
        },
      ],
    }).compile();

    service = module.get<ReviewsService>(ReviewsService);
  });

  describe('getDueCards', () => {
    it('TC-SRS-004: returns overdue and due cards prioritized, plus new cards up to dailyGoal limit', async () => {
      prisma.user.findUnique.mockResolvedValue({ dailyGoal: 10 });
      prisma.userCardProgress.findMany.mockResolvedValueOnce([
        {
          id: 'prog-1',
          status: 'LEARNING',
          nextReviewDate: new Date(Date.now() - 3600 * 1000 * 24), // overdue
          interval: 1,
          repetitions: 1,
          easeFactor: 2.5,
          card: {
            id: 'card-1',
            word: 'accommodate',
            meaning: 'đáp ứng',
            phonetic: '/əˈkɑː.mə.deɪt/',
            audioUrl: null,
            exampleSentence: 'Can accommodate 500 delegates.',
            collocations: 'accommodate needs',
            mnemonic: 'Có chỗ ở',
            deck: { id: 'deck-1', title: 'TOEIC' },
          },
        },
        {
          id: 'prog-2',
          status: 'NEW',
          nextReviewDate: new Date(),
          interval: 0,
          repetitions: 0,
          easeFactor: 2.5,
          card: {
            id: 'card-2',
            word: 'acquire',
            meaning: 'mua lại',
            phonetic: '/əˈkwaɪər/',
            audioUrl: null,
            exampleSentence: 'Acquire a startup.',
            collocations: 'acquire skills',
            mnemonic: 'Mua lại',
            deck: { id: 'deck-1', title: 'TOEIC' },
          },
        },
      ]);

      const result = await service.getDueCards(mockUserId, {});

      expect(result.data.length).toBe(2);
      expect(result.data[0].word).toBe('accommodate');
      expect(result.data[1].word).toBe('acquire');
      expect(result.meta.totalDue).toBe(2);
      expect(result.meta.overdueCount).toBe(1);
    });

    it('TC-SRS-005: returns empty list with 0 meta when user has no due or new cards', async () => {
      prisma.user.findUnique.mockResolvedValue({ dailyGoal: 10 });
      prisma.userCardProgress.findMany.mockResolvedValue([]);

      const result = await service.getDueCards(mockUserId, {});

      expect(result.data).toEqual([]);
      expect(result.meta.totalDue).toBe(0);
    });

    it('TC-SRS-006: respects deckId filter when querying cards', async () => {
      prisma.user.findUnique.mockResolvedValue({ dailyGoal: 5 });
      prisma.userCardProgress.findMany.mockResolvedValue([]);

      await service.getDueCards(mockUserId, { deckId: 'specific-deck-id' });

      expect(prisma.userCardProgress.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            card: expect.objectContaining({
              deckId: 'specific-deck-id',
            }),
          }),
        }),
      );
    });
  });

  describe('submitReview', () => {
    it('TC-SRS-007: validates ownership and updates card progress via SM-2', async () => {
      prisma.card.findUnique.mockResolvedValue({
        id: mockCardId,
        deck: { userId: mockUserId },
      });

      prisma.userCardProgress.findUnique.mockResolvedValue({
        id: 'prog-1',
        userId: mockUserId,
        cardId: mockCardId,
        status: 'LEARNING',
        interval: 1,
        repetitions: 1,
        easeFactor: 2.5,
      });

      const updatedProgress = {
        id: 'prog-1',
        cardId: mockCardId,
        status: 'LEARNING',
        interval: 6,
        repetitions: 2,
        easeFactor: 2.5,
        lastReviewedAt: new Date(),
        nextReviewDate: new Date(),
      };
      prisma.userCardProgress.update.mockResolvedValue(updatedProgress);

      const result = await service.submitReview(mockUserId, {
        cardId: mockCardId,
        rating: 3,
      });

      expect(result.status).toBe('LEARNING');
      expect(result.interval).toBe(6);
      expect(result.repetitions).toBe(2);
      expect(result.streak).toBeDefined();
      expect(result.streak?.currentStreak).toBe(1);
      expect(streakService.recordActivity).toHaveBeenCalledWith(mockUserId);
      expect(prisma.userCardProgress.update).toHaveBeenCalled();
    });

    it('TC-SRS-008: throws NotFoundException when card does not exist', async () => {
      prisma.card.findUnique.mockResolvedValue(null);

      await expect(
        service.submitReview(mockUserId, {
          cardId: 'non-existent-card',
          rating: 3,
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('TC-SRS-009: throws ForbiddenException when card belongs to another user', async () => {
      prisma.card.findUnique.mockResolvedValue({
        id: mockCardId,
        deck: { userId: 'other-user-uuid' },
      });

      await expect(
        service.submitReview(mockUserId, {
          cardId: mockCardId,
          rating: 3,
        }),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('getReviewStats', () => {
    it('TC-SRS-010: aggregates counts of due, new, learning, mastered cards', async () => {
      prisma.userCardProgress.count
        .mockResolvedValueOnce(20) // total
        .mockResolvedValueOnce(5) // due
        .mockResolvedValueOnce(4) // new
        .mockResolvedValueOnce(10) // learning
        .mockResolvedValueOnce(6); // mastered

      const stats = await service.getReviewStats(mockUserId);

      expect(stats.totalCards).toBe(20);
      expect(stats.dueCount).toBe(5);
      expect(stats.newCount).toBe(4);
      expect(stats.learningCount).toBe(10);
      expect(stats.masteredCount).toBe(6);
    });
  });
});
