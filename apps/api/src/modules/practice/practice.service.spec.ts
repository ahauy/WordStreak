import { Test, TestingModule } from '@nestjs/testing';
import {
  HttpException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PracticeService } from './practice.service';
import { PrismaService } from '../prisma/prisma.service';
import { StreakService } from '../streaks/streak.service';

describe('PracticeService', () => {
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
        currentStreak: 2,
        bestStreak: 5,
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
    service.clearVoiceCooldown();
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
          },
          {
            questionId: 'q3',
            cardId: 'c3',
            selectedOptionId: 'opt-c',
            isCorrect: true,
            timeSpentMs: 2000,
          },
          {
            questionId: 'q4',
            cardId: 'c4',
            selectedOptionId: 'opt-c',
            isCorrect: true,
            timeSpentMs: 2000,
          },
          {
            questionId: 'q5',
            cardId: 'c5',
            selectedOptionId: 'opt-c',
            isCorrect: true,
            timeSpentMs: 6000,
          },
          {
            questionId: 'q6',
            cardId: 'c6',
            selectedOptionId: 'opt-c',
            isCorrect: true,
            timeSpentMs: 4000,
          },
          {
            questionId: 'q7',
            cardId: 'c7',
            selectedOptionId: 'opt-c',
            isCorrect: true,
            timeSpentMs: 3000,
          },
          {
            questionId: 'q8',
            cardId: 'c8',
            selectedOptionId: 'opt-c',
            isCorrect: true,
            timeSpentMs: 3000,
          },
          {
            questionId: 'q9',
            cardId: 'c9',
            selectedOptionId: 'opt-c',
            isCorrect: true,
            timeSpentMs: 3000,
          },
          {
            questionId: 'q10',
            cardId: 'c10',
            selectedOptionId: 'opt-c',
            isCorrect: true,
            timeSpentMs: 3000,
          },
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
          {
            cardId: 'c1',
            submittedWord: 'ephemeral',
            isCorrect: true,
            timeSpentMs: 3500,
            hintsUsed: 0,
            replayCount: 1,
            audioSpeedUsed: 1.0,
          },
          {
            cardId: 'c2',
            submittedWord: 'serendipity',
            isCorrect: true,
            timeSpentMs: 7000,
            hintsUsed: 0,
            replayCount: 2,
            audioSpeedUsed: 0.75,
          },
          {
            cardId: 'c3',
            submittedWord: 'ubiquitous',
            isCorrect: true,
            timeSpentMs: 4000,
            hintsUsed: 1,
            replayCount: 0,
            audioSpeedUsed: 1.0,
          },
          {
            cardId: 'c4',
            submittedWord: 'eloquent',
            isCorrect: true,
            timeSpentMs: 2000,
            hintsUsed: 0,
            replayCount: 3,
            audioSpeedUsed: 1.0,
          },
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

  describe('submitVoicePronunciation', () => {
    const mockCard = {
      id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
      word: 'eloquent',
      meaning: 'hùng biện',
      deck: {
        userId: 'user-1',
        isPublic: false,
      },
    };

    it('should evaluate 100% exact match, award +10 XP, advance streak, and log activity', async () => {
      prisma.card.findUnique.mockResolvedValue(mockCard);
      prisma.userActivityLog.aggregate.mockResolvedValue({
        _sum: { xpEarned: 0 },
      });

      const result = await service.submitVoicePronunciation('user-1', {
        cardId: mockCard.id,
        spokenTranscript: 'eloquent',
      });

      expect(result.isPassed).toBe(true);
      expect(result.accuracyScore).toBe(100);
      expect(result.tier).toBe('EXACT');
      expect(result.xpAwarded).toBe(10);
      expect(result.isDailyCapped).toBe(false);
      expect(result.streakAdvanced).toBe(true);
      expect(streakService.recordActivity).toHaveBeenCalledWith('user-1');
      expect(prisma.userActivityLog.create).toHaveBeenCalled();
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        data: { totalXp: { increment: 10 } },
      });
      expect(prisma.userActivityLog.aggregate).toHaveBeenCalled();
      const aggregateCall = (
        prisma.userActivityLog.aggregate as jest.Mock<
          Promise<unknown>,
          [{ where: { userId: string; activityType: { in: string[] } } }]
        >
      ).mock.calls[0][0];
      expect(aggregateCall.where.userId).toBe('user-1');
      expect(aggregateCall.where.activityType.in).toEqual([
        'VOICE_PRONUNCIATION',
        'PRACTICE_QUIZ',
        'WORD_MATCHING',
      ]);
    });

    it('should throw ForbiddenException when card belongs to another user private deck', async () => {
      prisma.card.findUnique.mockResolvedValue({
        id: 'c-private',
        word: 'secret',
        deck: {
          userId: 'other-user',
          isPublic: false,
        },
      });

      await expect(
        service.submitVoicePronunciation('user-1', {
          cardId: 'c-private',
          spokenTranscript: 'secret',
        }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should allow practice when card belongs to another user but deck is public', async () => {
      prisma.card.findUnique.mockResolvedValue({
        id: 'c-public',
        word: 'eloquent',
        deck: {
          userId: 'other-user',
          isPublic: true,
        },
      });
      prisma.userActivityLog.aggregate.mockResolvedValue({
        _sum: { xpEarned: 0 },
      });

      const result = await service.submitVoicePronunciation('user-1', {
        cardId: 'c-public',
        spokenTranscript: 'eloquent',
      });

      expect(result.isPassed).toBe(true);
      expect(result.accuracyScore).toBe(100);
      expect(result.xpAwarded).toBe(10);
    });

    it('should evaluate close match (85%), award +10 XP, and return diffSpans', async () => {
      prisma.card.findUnique.mockResolvedValue({
        id: 'c2',
        word: 'preliminary',
        deck: {
          userId: 'user-1',
          isPublic: false,
        },
      });

      const result = await service.submitVoicePronunciation('user-1', {
        cardId: 'c2',
        spokenTranscript: 'preliminry',
      });

      expect(result.isPassed).toBe(true);
      expect(result.accuracyScore).toBeGreaterThanOrEqual(80);
      expect(result.tier).toBe('CLOSE');
      expect(result.xpAwarded).toBe(10);
      expect(result.diffSpans).toBeDefined();
    });

    it('should evaluate retry (<80%), award 0 XP, and not update streak', async () => {
      prisma.card.findUnique.mockResolvedValue({
        id: 'c3',
        word: 'epitome',
        deck: {
          userId: 'user-1',
          isPublic: false,
        },
      });

      const result = await service.submitVoicePronunciation('user-1', {
        cardId: 'c3',
        spokenTranscript: 'ep-tomb',
      });

      expect(result.isPassed).toBe(false);
      expect(result.accuracyScore).toBeLessThan(80);
      expect(result.tier).toBe('RETRY');
      expect(result.xpAwarded).toBe(0);
      expect(streakService.recordActivity).not.toHaveBeenCalled();
    });

    it('should enforce daily 500 XP cap for voice practice', async () => {
      prisma.card.findUnique.mockResolvedValue(mockCard);
      prisma.userActivityLog.aggregate.mockResolvedValue({
        _sum: { xpEarned: 500 },
      });

      const result = await service.submitVoicePronunciation('user-1', {
        cardId: mockCard.id,
        spokenTranscript: 'eloquent',
      });

      expect(result.isPassed).toBe(true);
      expect(result.xpAwarded).toBe(0);
      expect(result.isDailyCapped).toBe(true);
      expect(streakService.recordActivity).toHaveBeenCalled();
    });

    it('should enforce 1500ms cooldown and reject rapid submissions with 429', async () => {
      prisma.card.findUnique.mockResolvedValue(mockCard);

      await service.submitVoicePronunciation('user-1', {
        cardId: mockCard.id,
        spokenTranscript: 'eloquent',
      });

      await expect(
        service.submitVoicePronunciation('user-1', {
          cardId: mockCard.id,
          spokenTranscript: 'eloquent',
        }),
      ).rejects.toThrow(HttpException);
    });

    it('should throw NotFoundException when card does not exist', async () => {
      prisma.card.findUnique.mockResolvedValue(null);

      await expect(
        service.submitVoicePronunciation('user-1', {
          cardId: 'non-existent',
          spokenTranscript: 'hello',
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should protect against forged client accuracy score by recalculating canonical score', async () => {
      prisma.card.findUnique.mockResolvedValue({
        id: 'c4',
        word: 'cat',
        deck: {
          userId: 'user-1',
          isPublic: false,
        },
      });

      const result = await service.submitVoicePronunciation('user-1', {
        cardId: 'c4',
        spokenTranscript: 'dog',
        accuracyScore: 100,
      });

      expect(result.isPassed).toBe(false);
      expect(result.accuracyScore).toBe(0);
      expect(result.tier).toBe('RETRY');
      expect(result.xpAwarded).toBe(0);
    });
  });
});
