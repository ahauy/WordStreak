import { Test, TestingModule } from '@nestjs/testing';
import { PracticeService } from './practice.service';
import { PrismaService } from '../prisma/prisma.service';
import { StreakService } from '../streaks/streak.service';

describe('PracticeService - Matching Quiz', () => {
  let service: PracticeService;
  let prisma: {
    card: {
      findMany: jest.Mock;
      findUnique: jest.Mock;
    };
    userActivityLog: {
      aggregate: jest.Mock;
      create: jest.Mock;
    };
    user: {
      update: jest.Mock;
    };
  };
  let streakService: {
    recordActivity: jest.Mock;
  };

  const mockMissedCards = [
    {
      id: 'c1',
      word: 'ephemeral',
      meaning: 'phù du, chóng tàn',
      phonetic: '/ɪˈfem.ər.əl/',
      audioUrl: 'https://audio.url/ephemeral.mp3',
    },
  ];

  beforeEach(async () => {
    prisma = {
      card: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
      },
      userActivityLog: {
        aggregate: jest.fn().mockResolvedValue({ _sum: { xpEarned: 0 } }),
        create: jest.fn().mockResolvedValue({}),
      },
      user: {
        update: jest.fn().mockResolvedValue({}),
      },
    };

    streakService = {
      recordActivity: jest.fn().mockResolvedValue({
        currentStreak: 1,
        bestStreak: 1,
        streakIncreased: true,
        isActiveToday: true,
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PracticeService,
        { provide: PrismaService, useValue: prisma },
        { provide: StreakService, useValue: streakService },
      ],
    }).compile();

    service = module.get<PracticeService>(PracticeService);
  });

  describe('submitMatchingQuiz', () => {
    beforeEach(() => {
      prisma.userActivityLog.aggregate.mockResolvedValue({
        _sum: { xpEarned: 0 },
      });
    });

    it('should calculate base XP (+2/pair), perfect bonus (+5), speed bonus (+10), and combo bonus for a clean 5-pair round in <= 15s', async () => {
      prisma.card.findMany.mockResolvedValue([]);

      const cleanSubmission = {
        deckId: 'deck-1',
        mode: 'MATCHING',
        totalPairs: 5,
        totalTimeMs: 12000,
        answers: [
          {
            cardId: 'c1',
            matchedInMs: 2000,
            attempts: 1,
            isCorrectFirstTry: true,
            isCorrect: true,
          },
          {
            cardId: 'c2',
            matchedInMs: 2000,
            attempts: 1,
            isCorrectFirstTry: true,
            isCorrect: true,
          },
          {
            cardId: 'c3',
            matchedInMs: 2000,
            attempts: 1,
            isCorrectFirstTry: true,
            isCorrect: true,
          },
          {
            cardId: 'c4',
            matchedInMs: 2000,
            attempts: 1,
            isCorrectFirstTry: true,
            isCorrect: true,
          },
          {
            cardId: 'c5',
            matchedInMs: 2000,
            attempts: 1,
            isCorrectFirstTry: true,
            isCorrect: true,
          },
        ],
      };

      const result = await service.submitMatchingQuiz(
        'user-1',
        cleanSubmission,
      );

      expect(result.totalPairs).toBe(5);
      expect(result.matchedCount).toBe(5);
      expect(result.accuracyPercentage).toBe(100);
      expect(result.maxCombo).toBe(5);
      expect(result.isBotFlagged).toBe(false);
      expect(result.missedCards).toHaveLength(0);
      expect(result.xpBreakdown.baseXp).toBe(10);
      expect(result.xpBreakdown.comboBonusXp).toBe(2);
      expect(result.xpBreakdown.speedBonusXp).toBe(10);
      expect(result.xpBreakdown.perfectBonusXp).toBe(5);
      expect(result.xpBreakdown.totalXp).toBe(27);
      expect(result.totalXpEarned).toBe(27);
    });

    it('should forfeit speed bonus when totalTimeMs > 15000ms but keep base, perfect, and combo bonuses', async () => {
      prisma.card.findMany.mockResolvedValue([]);

      const slowSubmission = {
        deckId: 'deck-1',
        mode: 'MATCHING',
        totalPairs: 5,
        totalTimeMs: 18000,
        answers: [
          {
            cardId: 'c1',
            matchedInMs: 3600,
            attempts: 1,
            isCorrectFirstTry: true,
            isCorrect: true,
          },
          {
            cardId: 'c2',
            matchedInMs: 3600,
            attempts: 1,
            isCorrectFirstTry: true,
            isCorrect: true,
          },
          {
            cardId: 'c3',
            matchedInMs: 3600,
            attempts: 1,
            isCorrectFirstTry: true,
            isCorrect: true,
          },
          {
            cardId: 'c4',
            matchedInMs: 3600,
            attempts: 1,
            isCorrectFirstTry: true,
            isCorrect: true,
          },
          {
            cardId: 'c5',
            matchedInMs: 3600,
            attempts: 1,
            isCorrectFirstTry: true,
            isCorrect: true,
          },
        ],
      };

      const result = await service.submitMatchingQuiz('user-1', slowSubmission);

      expect(result.xpBreakdown.speedBonusXp).toBe(0);
      expect(result.xpBreakdown.perfectBonusXp).toBe(5);
      expect(result.xpBreakdown.baseXp).toBe(10);
      expect(result.xpBreakdown.comboBonusXp).toBe(2);
      expect(result.totalXpEarned).toBe(17);
    });

    it('should forfeit speed and perfect bonuses when errors occur, and fetch missed cards without mutating SM-2', async () => {
      prisma.card.findMany.mockResolvedValue([mockMissedCards[0]]);

      const errorSubmission = {
        deckId: 'deck-1',
        mode: 'MATCHING',
        totalPairs: 5,
        totalTimeMs: 12000,
        answers: [
          {
            cardId: 'c1',
            matchedInMs: 2000,
            attempts: 2,
            isCorrectFirstTry: false,
            isCorrect: true,
          },
          {
            cardId: 'c2',
            matchedInMs: 2000,
            attempts: 1,
            isCorrectFirstTry: true,
            isCorrect: true,
          },
          {
            cardId: 'c3',
            matchedInMs: 2000,
            attempts: 1,
            isCorrectFirstTry: true,
            isCorrect: true,
          },
          {
            cardId: 'c4',
            matchedInMs: 2000,
            attempts: 1,
            isCorrectFirstTry: true,
            isCorrect: true,
          },
          {
            cardId: 'c5',
            matchedInMs: 2000,
            attempts: 1,
            isCorrectFirstTry: true,
            isCorrect: true,
          },
        ],
      };

      const result = await service.submitMatchingQuiz(
        'user-1',
        errorSubmission,
      );

      expect(result.xpBreakdown.speedBonusXp).toBe(0);
      expect(result.xpBreakdown.perfectBonusXp).toBe(0);
      expect(result.maxCombo).toBe(4);
      expect(result.missedCards).toHaveLength(1);
      expect(result.missedCards[0].cardId).toBe('c1');
      expect(result.missedCards[0].word).toBe('ephemeral');
    });

    it('should calculate 2.0x combo multiplier for streaks >= 10 in multi-round sessions', async () => {
      prisma.card.findMany.mockResolvedValue([]);

      const tenStreakSubmission = {
        deckId: 'deck-1',
        mode: 'MATCHING',
        totalPairs: 10,
        totalTimeMs: 25000,
        answers: Array.from({ length: 10 }, (_, i) => ({
          cardId: `c${i + 1}`,
          matchedInMs: 2500,
          attempts: 1,
          isCorrectFirstTry: true,
          isCorrect: true,
        })),
      };

      const result = await service.submitMatchingQuiz(
        'user-1',
        tenStreakSubmission,
      );

      expect(result.maxCombo).toBe(10);
      expect(result.xpBreakdown.baseXp).toBe(20);
      expect(result.xpBreakdown.comboBonusXp).toBe(8);
      expect(result.xpBreakdown.speedBonusXp).toBe(20);
      expect(result.xpBreakdown.perfectBonusXp).toBe(10);
      expect(result.totalXpEarned).toBe(58);
    });

    it('should trigger bot velocity guard (isBotFlagged=true, totalXp=0) when totalTimeMs < 1500ms for 5 pairs', async () => {
      prisma.card.findMany.mockResolvedValue([]);

      const botSubmission = {
        deckId: 'deck-1',
        totalPairs: 5,
        totalTimeMs: 1200,
        answers: Array.from({ length: 5 }, (_, i) => ({
          cardId: `c${i + 1}`,
          matchedInMs: 240,
          attempts: 1,
          isCorrectFirstTry: true,
          isCorrect: true,
        })),
      };

      const result = await service.submitMatchingQuiz('user-1', botSubmission);

      expect(result.isBotFlagged).toBe(true);
      expect(result.xpBreakdown.isBotDetected).toBe(true);
      expect(result.totalXpEarned).toBe(0);
      expect(result.xpBreakdown.totalXp).toBe(0);
    });

    it('should trigger bot velocity guard when any single pair matchedInMs < 200ms', async () => {
      prisma.card.findMany.mockResolvedValue([]);

      const botSubmission = {
        deckId: 'deck-1',
        totalPairs: 5,
        totalTimeMs: 10000,
        answers: [
          {
            cardId: 'c1',
            matchedInMs: 150,
            attempts: 1,
            isCorrectFirstTry: true,
            isCorrect: true,
          },
          {
            cardId: 'c2',
            matchedInMs: 2000,
            attempts: 1,
            isCorrectFirstTry: true,
            isCorrect: true,
          },
          {
            cardId: 'c3',
            matchedInMs: 2000,
            attempts: 1,
            isCorrectFirstTry: true,
            isCorrect: true,
          },
          {
            cardId: 'c4',
            matchedInMs: 2000,
            attempts: 1,
            isCorrectFirstTry: true,
            isCorrect: true,
          },
          {
            cardId: 'c5',
            matchedInMs: 2000,
            attempts: 1,
            isCorrectFirstTry: true,
            isCorrect: true,
          },
        ],
      };

      const result = await service.submitMatchingQuiz('user-1', botSubmission);

      expect(result.isBotFlagged).toBe(true);
      expect(result.totalXpEarned).toBe(0);
    });

    it('should enforce daily 500 XP cap when user already reached the cap today', async () => {
      prisma.card.findMany.mockResolvedValue([]);
      prisma.userActivityLog.aggregate.mockResolvedValue({
        _sum: { xpEarned: 500 },
      });

      const submission = {
        deckId: 'deck-1',
        totalPairs: 5,
        totalTimeMs: 12000,
        answers: Array.from({ length: 5 }, (_, i) => ({
          cardId: `c${i + 1}`,
          matchedInMs: 2000,
          attempts: 1,
          isCorrectFirstTry: true,
          isCorrect: true,
        })),
      };

      const result = await service.submitMatchingQuiz('user-1', submission);

      expect(result.xpBreakdown.isDailyCapped).toBe(true);
      expect(result.totalXpEarned).toBe(0);
    });
  });
});
