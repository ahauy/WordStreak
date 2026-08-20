import { Test, TestingModule } from '@nestjs/testing';
import { ReviewsService } from './reviews.service';
import { SrsService } from './srs.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException, ForbiddenException } from '@nestjs/common';

describe('ReviewsService', () => {
  let service: ReviewsService;
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
  let srsService: SrsService;

  const mockUserId = 'user-uuid-1';
  const mockCardId = 'card-uuid-1';

  beforeEach(async () => {
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
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReviewsService,
        SrsService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<ReviewsService>(ReviewsService);
    srsService = module.get<SrsService>(SrsService);
  });

  describe('getDueCards', () => {
    it('TC-SRS-005: returns prioritized due and new cards within limit and dailyGoal', async () => {
      prisma.user.findUnique.mockResolvedValue({ dailyGoal: 10 });
      const mockDate = new Date();

      prisma.userCardProgress.findMany.mockResolvedValue([
        {
          id: 'prog-1',
          userId: mockUserId,
          cardId: 'card-1',
          interval: 1,
          repetitions: 1,
          easeFactor: 2.5,
          status: 'LEARNING',
          nextReviewDate: new Date(Date.now() - 86400000), // Overdue
          card: {
            deckId: 'deck-1',
            word: 'ubiquitous',
            meaning: 'phổ biến',
            phonetic: '/juːˈbɪk.wə.təs/',
            audioUrl: null,
            exampleSentence: null,
            collocations: null,
            mnemonic: null,
            imageUrl: null,
            deck: { id: 'deck-1', title: 'Deck 1', color: '#6366F1' },
          },
        },
        {
          id: 'prog-2',
          userId: mockUserId,
          cardId: 'card-2',
          interval: 0,
          repetitions: 0,
          easeFactor: 2.5,
          status: 'NEW',
          nextReviewDate: mockDate,
          card: {
            deckId: 'deck-1',
            word: 'serendipity',
            meaning: 'sự may mắn tình cờ',
            phonetic: null,
            audioUrl: null,
            exampleSentence: null,
            collocations: null,
            mnemonic: null,
            imageUrl: null,
            deck: { id: 'deck-1', title: 'Deck 1', color: '#6366F1' },
          },
        },
      ]);

      const result = await service.getDueCards(mockUserId, {});

      expect(result.data.length).toBe(2);
      expect(result.data[0].word).toBe('ubiquitous');
      expect(result.data[1].word).toBe('serendipity');
      expect(result.meta.totalDue).toBe(2);
      expect(result.meta.overdueCount).toBe(1);
      expect(result.meta.newCount).toBe(1);
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
        interval: 1,
        repetitions: 1,
        easeFactor: 2.5,
        status: 'LEARNING',
      });

      const updatedDate = new Date();
      prisma.userCardProgress.update.mockResolvedValue({
        id: 'prog-1',
        userId: mockUserId,
        cardId: mockCardId,
        interval: 6,
        repetitions: 2,
        easeFactor: 2.5,
        status: 'LEARNING',
        lastReviewedAt: updatedDate,
        nextReviewDate: updatedDate,
      });

      const result = await service.submitReview(mockUserId, {
        cardId: mockCardId,
        rating: 3,
      });

      expect(result.repetitions).toBe(2);
      expect(result.interval).toBe(6);
      expect(prisma.userCardProgress.update).toHaveBeenCalled();
    });

    it('throws NotFoundException if card does not exist', async () => {
      prisma.card.findUnique.mockResolvedValue(null);

      await expect(
        service.submitReview(mockUserId, { cardId: 'invalid-id', rating: 3 }),
      ).rejects.toThrow(NotFoundException);
    });

    it('throws ForbiddenException if card belongs to another user', async () => {
      prisma.card.findUnique.mockResolvedValue({
        id: mockCardId,
        deck: { userId: 'other-user' },
      });

      await expect(
        service.submitReview(mockUserId, { cardId: mockCardId, rating: 3 }),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('getReviewStats', () => {
    it('returns aggregated counts across all progress statuses', async () => {
      prisma.userCardProgress.count
        .mockResolvedValueOnce(50) // total
        .mockResolvedValueOnce(12) // due
        .mockResolvedValueOnce(10) // new
        .mockResolvedValueOnce(25) // learning
        .mockResolvedValueOnce(15); // mastered

      const stats = await service.getReviewStats(mockUserId);

      expect(stats.totalCards).toBe(50);
      expect(stats.dueCount).toBe(12);
      expect(stats.newCount).toBe(10);
      expect(stats.learningCount).toBe(25);
      expect(stats.masteredCount).toBe(15);
    });
  });
});
