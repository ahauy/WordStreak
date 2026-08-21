import { Test, TestingModule } from '@nestjs/testing';
import { PracticeService } from './practice.service';
import { PrismaService } from '../prisma/prisma.service';

describe('PracticeService', () => {
  let service: PracticeService;
  let prisma: {
    card: {
      findMany: jest.Mock;
    };
    userActivityLog: {
      aggregate: jest.Mock;
    };
  };

  const mockMissedCards = [
    {
      id: 'c1',
      word: 'ephemeral',
      meaning: 'phù du, chóng tàn',
      phonetic: '/ɪˈfem.ər.əl/',
      audioUrl: 'https://audio.url/ephemeral.mp3',
    },
    {
      id: 'c5',
      word: 'resilient',
      meaning: 'kiên cường, phục hồi nhanh',
      phonetic: '/rɪˈzɪl.jənt/',
      audioUrl: 'https://audio.url/resilient.mp3',
    },
  ];

  beforeEach(async () => {
    prisma = {
      card: {
        findMany: jest.fn(),
      },
      userActivityLog: {
        aggregate: jest.fn().mockResolvedValue({ _sum: { xpEarned: 0 } }),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PracticeService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<PracticeService>(PracticeService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('submitQuiz', () => {
    it('should calculate standard quiz base XP, speed bonus (+5), and combo multipliers', async () => {
      prisma.card.findMany.mockResolvedValue([mockMissedCards[0]]);

      const submission = {
        deckId: 'deck-1',
        totalQuestions: 10,
        answers: [
          {
            questionId: 'q1',
            cardId: 'c1',
            selectedOptionId: 'opt-w',
            isCorrect: false,
            timeSpentMs: 4000,
          },
          {
            questionId: 'q2',
            cardId: 'c2',
            selectedOptionId: 'opt-c',
            isCorrect: true,
            timeSpentMs: 3000,
          }, // +10 base, +5 speed (streak 1) = 15
          {
            questionId: 'q3',
            cardId: 'c3',
            selectedOptionId: 'opt-c',
            isCorrect: true,
            timeSpentMs: 2000,
          }, // +10 base, +5 speed (streak 2) = 15
          {
            questionId: 'q4',
            cardId: 'c4',
            selectedOptionId: 'opt-c',
            isCorrect: true,
            timeSpentMs: 2000,
          }, // +10 base, +5 speed * 1.2 combo (streak 3) = 18
          {
            questionId: 'q5',
            cardId: 'c5',
            selectedOptionId: 'opt-c',
            isCorrect: true,
            timeSpentMs: 6000,
          }, // +10 base * 1.2 combo (streak 4) = 12
          {
            questionId: 'q6',
            cardId: 'c6',
            selectedOptionId: 'opt-c',
            isCorrect: true,
            timeSpentMs: 4000,
          }, // +10 base, +5 speed * 1.5 combo (streak 5) = 23
          {
            questionId: 'q7',
            cardId: 'c7',
            selectedOptionId: 'opt-c',
            isCorrect: true,
            timeSpentMs: 3000,
          }, // +10 base, +5 speed * 1.5 combo (streak 6) = 23
          {
            questionId: 'q8',
            cardId: 'c8',
            selectedOptionId: 'opt-c',
            isCorrect: true,
            timeSpentMs: 3000,
          }, // +10 base, +5 speed * 1.5 combo (streak 7) = 23
          {
            questionId: 'q9',
            cardId: 'c9',
            selectedOptionId: 'opt-c',
            isCorrect: true,
            timeSpentMs: 3000,
          }, // +10 base, +5 speed * 1.5 combo (streak 8) = 23
          {
            questionId: 'q10',
            cardId: 'c10',
            selectedOptionId: 'opt-c',
            isCorrect: true,
            timeSpentMs: 3000,
          }, // +10 base, +5 speed * 1.5 combo (streak 9) = 23
        ],
      };

      const result = await service.submitQuiz('user-1', submission);

      expect(result.totalQuestions).toBe(10);
      expect(result.correctCount).toBe(9);
      expect(result.accuracyPercentage).toBe(90);
      expect(result.maxCombo).toBe(9);
      expect(result.totalXpEarned).toBeGreaterThan(100);
      expect(result.missedCards).toHaveLength(1);
      expect(result.missedCards[0].word).toBe('ephemeral');
    });

    it('should calculate listening quiz speed bonus (+15 XP) and handle hint/replay forfeitures (TC-LISTEN-009)', async () => {
      prisma.card.findMany.mockResolvedValue([mockMissedCards[1]]);

      const listeningSubmission = {
        deckId: 'deck-1',
        mode: 'LISTENING',
        totalQuestions: 5,
        answers: [
          // Q1: +10 base + 15 speed = 25 * 1.0 (streak 1) = 25
          {
            cardId: 'c1',
            submittedWord: 'ephemeral',
            isCorrect: true,
            timeSpentMs: 3500,
            hintsUsed: 0,
            replayCount: 1,
            audioSpeedUsed: 1.0,
          },
          // Q2: +10 base + 15 speed = 25 * 1.0 (streak 2) = 25
          {
            cardId: 'c2',
            submittedWord: 'serendipity',
            isCorrect: true,
            timeSpentMs: 7000,
            hintsUsed: 0,
            replayCount: 2,
            audioSpeedUsed: 0.75,
          },
          // Q3: +10 base + 0 speed (hintsUsed > 0) = 10 * 1.2 (streak 3) = 12
          {
            cardId: 'c3',
            submittedWord: 'ubiquitous',
            isCorrect: true,
            timeSpentMs: 4000,
            hintsUsed: 1,
            replayCount: 0,
            audioSpeedUsed: 1.0,
          },
          // Q4: +10 base + 0 speed (replayCount > 2) = 10 * 1.2 (streak 4) = 12
          {
            cardId: 'c4',
            submittedWord: 'eloquent',
            isCorrect: true,
            timeSpentMs: 2000,
            hintsUsed: 0,
            replayCount: 3,
            audioSpeedUsed: 1.0,
          },
          // Q5: Incorrect -> 0 XP (streak resets)
          {
            cardId: 'c5',
            submittedWord: 'resilent',
            isCorrect: false,
            timeSpentMs: 6000,
            hintsUsed: 0,
            replayCount: 1,
            audioSpeedUsed: 1.0,
          },
        ],
      };

      const result = await service.submitQuiz('user-1', listeningSubmission);

      expect(result.totalQuestions).toBe(5);
      expect(result.correctCount).toBe(4);
      expect(result.accuracyPercentage).toBe(80);
      expect(result.maxCombo).toBe(4);
      expect(result.totalXpEarned).toBe(74); // 25 + 25 + 12 + 12 = 74
      expect(result.missedCards).toHaveLength(1);
      expect(result.missedCards[0].cardId).toBe('c5');
      expect(result.missedCards[0].word).toBe('resilient');
    });

    it('should forfeit listening speed bonus if timeSpentMs exceeds 8000ms', async () => {
      prisma.card.findMany.mockResolvedValue([]);

      const submission = {
        deckId: 'deck-1',
        answers: [
          {
            cardId: 'c1',
            submittedWord: 'perseverance',
            isCorrect: true,
            timeSpentMs: 8500, // > 8000ms
            hintsUsed: 0,
            replayCount: 0,
          },
        ],
      };

      const result = await service.submitQuiz('user-1', submission);

      expect(result.totalXpEarned).toBe(10); // Base 10 only, no speed bonus
      expect(result.correctCount).toBe(1);
      expect(result.accuracyPercentage).toBe(100);
    });

    it('should award 0 XP if total quiz completion time indicates botting/abuse (<3000ms for >=5 questions)', async () => {
      prisma.card.findMany.mockResolvedValue([]);

      const abusiveSubmission = {
        deckId: 'deck-1',
        totalQuestions: 10,
        answers: Array.from({ length: 10 }, (_, i) => ({
          questionId: `q${i}`,
          cardId: `c${i}`,
          selectedOptionId: 'opt-c',
          isCorrect: true,
          timeSpentMs: 200, // Total: 2000ms < 3000ms
        })),
      };

      const result = await service.submitQuiz('user-1', abusiveSubmission);

      expect(result.totalXpEarned).toBe(0);
      expect(result.correctCount).toBe(10);
      expect(result.accuracyPercentage).toBe(100);
    });

    it('should award 0 XP if any question velocity is underhuman (<400ms per question)', async () => {
      prisma.card.findMany.mockResolvedValue([]);

      const botSubmission = {
        deckId: 'deck-1',
        totalQuestions: 3,
        answers: [
          {
            cardId: 'c1',
            isCorrect: true,
            timeSpentMs: 300, // < 400ms
          },
          {
            cardId: 'c2',
            isCorrect: true,
            timeSpentMs: 4000,
          },
          {
            cardId: 'c3',
            isCorrect: true,
            timeSpentMs: 4000,
          },
        ],
      };

      const result = await service.submitQuiz('user-1', botSubmission);

      expect(result.totalXpEarned).toBe(0);
      expect(result.correctCount).toBe(3);
    });

    it('should deduplicate missed cards if the same card is missed multiple times', async () => {
      prisma.card.findMany.mockResolvedValue([mockMissedCards[0]]);

      const submission = {
        deckId: 'deck-1',
        answers: [
          {
            cardId: 'c1',
            isCorrect: false,
            timeSpentMs: 1000,
          },
          {
            cardId: 'c1',
            isCorrect: false,
            timeSpentMs: 1000,
          },
        ],
      };

      const result = await service.submitQuiz('user-1', submission);

      expect(result.missedCards).toHaveLength(1);
      expect(prisma.card.findMany).toHaveBeenCalledWith({
        where: { id: { in: ['c1'] } },
        select: {
          id: true,
          word: true,
          meaning: true,
          phonetic: true,
          audioUrl: true,
        },
      });
    });

    it('should handle correct answers without timeSpentMs correctly', async () => {
      const submission = {
        deckId: 'deck-1',
        answers: [
          {
            cardId: 'c1',
            isCorrect: true,
          } as any,
          {
            cardId: 'c2',
            isCorrect: false,
          } as any,
          {
            cardId: 'c3',
            isCorrect: true,
          } as any,
        ],
      };
      prisma.card.findMany.mockResolvedValue([]);

      const result = await service.submitQuiz('user-1', submission);

      expect(result.correctCount).toBe(2);
      expect(result.maxCombo).toBe(1);
      expect(result.totalXpEarned).toBe(20); // 10 + 10, no speed bonuses
    });

    it('should return empty missedCards and 0 accuracy when answers array is empty', async () => {
      const result = await service.submitQuiz('user-1', {
        deckId: 'deck-1',
        totalQuestions: 0,
        answers: [],
      });

      expect(result.totalQuestions).toBe(0);
      expect(result.correctCount).toBe(0);
      expect(result.accuracyPercentage).toBe(0);
      expect(result.totalXpEarned).toBe(0);
      expect(result.missedCards).toEqual([]);
      expect(prisma.card.findMany).not.toHaveBeenCalled();
    });

    it('should return empty missedCards when all answers are correct', async () => {
      const result = await service.submitQuiz('user-1', {
        deckId: 'deck-1',
        answers: [
          {
            cardId: 'c1',
            isCorrect: true,
            timeSpentMs: 2000,
          },
        ],
      });

      expect(result.missedCards).toEqual([]);
      expect(prisma.card.findMany).not.toHaveBeenCalled();
    });
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

      // Base XP: 5 * 2 = 10
      // Combo Bonus: items 3,4 (1.2x -> 0.4+0.4=0.8), item 5 (1.5x -> 1.0) => sum 1.8 ~ 2
      // Speed Bonus: 10 (totalTime <= 15000 and 0 errors)
      // Perfect Bonus: 5 (0 errors)
      // Total XP: 10 + 2 + 10 + 5 = 27
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
        totalTimeMs: 18000, // > 15000ms
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
          }, // error on c1
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
      expect(prisma.card.findMany).toHaveBeenCalledWith({
        where: { id: { in: ['c1'] } },
        select: {
          id: true,
          word: true,
          meaning: true,
          phonetic: true,
          audioUrl: true,
        },
      });
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
      expect(result.xpBreakdown.comboBonusXp).toBe(8); // 0.8 (streak 3-4) + 5.0 (streak 5-9) + 2.0 (streak 10) = 7.8 ~ 8
      expect(result.xpBreakdown.speedBonusXp).toBe(20); // 2 rounds * 10
      expect(result.xpBreakdown.perfectBonusXp).toBe(10); // 2 rounds * 5
      expect(result.totalXpEarned).toBe(58);
    });

    it('should trigger bot velocity guard (isBotFlagged=true, totalXp=0) when totalTimeMs < 1500ms for 5 pairs', async () => {
      prisma.card.findMany.mockResolvedValue([]);

      const botSubmission = {
        deckId: 'deck-1',
        totalPairs: 5,
        totalTimeMs: 1200, // < 1500ms
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
          }, // < 200ms
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
