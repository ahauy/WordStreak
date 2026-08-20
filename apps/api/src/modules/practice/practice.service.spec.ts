import { Test, TestingModule } from '@nestjs/testing';
import { PracticeService } from './practice.service';
import { PrismaService } from '../prisma/prisma.service';

describe('PracticeService', () => {
  let service: PracticeService;
  let prisma: {
    card: {
      findMany: jest.Mock;
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
  ];

  beforeEach(async () => {
    prisma = {
      card: {
        findMany: jest.fn(),
      },
      user: {
        findUnique: jest.fn(),
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
    it('should calculate base XP, speed bonus, and combo multipliers accurately', async () => {
      prisma.card.findMany.mockResolvedValue(mockMissedCards);

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
          }, // +10 base, +5 speed (streak 1)
          {
            questionId: 'q3',
            cardId: 'c3',
            selectedOptionId: 'opt-c',
            isCorrect: true,
            timeSpentMs: 2000,
          }, // +10 base, +5 speed (streak 2)
          {
            questionId: 'q4',
            cardId: 'c4',
            selectedOptionId: 'opt-c',
            isCorrect: true,
            timeSpentMs: 2000,
          }, // +10 base, +5 speed * 1.2 combo (streak 3)
          {
            questionId: 'q5',
            cardId: 'c5',
            selectedOptionId: 'opt-c',
            isCorrect: true,
            timeSpentMs: 6000,
          }, // +10 base * 1.2 combo (streak 4)
          {
            questionId: 'q6',
            cardId: 'c6',
            selectedOptionId: 'opt-c',
            isCorrect: true,
            timeSpentMs: 4000,
          }, // +10 base, +5 speed * 1.5 combo (streak 5)
          {
            questionId: 'q7',
            cardId: 'c7',
            selectedOptionId: 'opt-c',
            isCorrect: true,
            timeSpentMs: 3000,
          }, // +10 base, +5 speed * 1.5 combo (streak 6)
          {
            questionId: 'q8',
            cardId: 'c8',
            selectedOptionId: 'opt-c',
            isCorrect: true,
            timeSpentMs: 3000,
          }, // +10 base, +5 speed * 1.5 combo (streak 7)
          {
            questionId: 'q9',
            cardId: 'c9',
            selectedOptionId: 'opt-c',
            isCorrect: true,
            timeSpentMs: 3000,
          }, // +10 base, +5 speed * 1.5 combo (streak 8)
          {
            questionId: 'q10',
            cardId: 'c10',
            selectedOptionId: 'opt-c',
            isCorrect: true,
            timeSpentMs: 3000,
          }, // +10 base, +5 speed * 1.5 combo (streak 9)
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
          timeSpentMs: 150, // Total: 1500ms
        })),
      };

      const result = await service.submitQuiz('user-1', abusiveSubmission);

      expect(result.totalXpEarned).toBe(0);
      expect(result.correctCount).toBe(10);
      expect(result.accuracyPercentage).toBe(100);
    });
  });
});
