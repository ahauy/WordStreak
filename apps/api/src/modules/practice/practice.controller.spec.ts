import { Test, TestingModule } from '@nestjs/testing';
import { PracticeController } from './practice.controller';
import { PracticeService } from './practice.service';
import { QuizGeneratorService } from './quiz-generator.service';
import { FillBlankGeneratorService } from './fill-blank-generator.service';
import type { JwtPayload } from '@wordstreak/shared-types';

describe('PracticeController', () => {
  let controller: PracticeController;
  let practiceService: { submitQuiz: jest.Mock };
  let quizGeneratorService: { generateQuestions: jest.Mock };
  let fillBlankGeneratorService: { generateQuestions: jest.Mock };

  const mockUser: JwtPayload = {
    sub: 'user-1',
    email: 'test@example.com',
    sessionId: 'sess-1',
  };

  beforeEach(async () => {
    practiceService = {
      submitQuiz: jest.fn(),
    };

    quizGeneratorService = {
      generateQuestions: jest.fn(),
    };

    fillBlankGeneratorService = {
      generateQuestions: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [PracticeController],
      providers: [
        { provide: PracticeService, useValue: practiceService },
        { provide: QuizGeneratorService, useValue: quizGeneratorService },
        {
          provide: FillBlankGeneratorService,
          useValue: fillBlankGeneratorService,
        },
      ],
    }).compile();

    controller = module.get<PracticeController>(PracticeController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getMultipleChoiceQuiz', () => {
    it('should delegate to QuizGeneratorService', async () => {
      quizGeneratorService.generateQuestions.mockResolvedValue([]);

      const result = await controller.getMultipleChoiceQuiz(mockUser, {
        deckId: 'deck-1',
        limit: 10,
      });

      expect(result.success).toBe(true);
      expect(result.data).toEqual([]);
      expect(quizGeneratorService.generateQuestions).toHaveBeenCalledWith(
        'user-1',
        { deckId: 'deck-1', limit: 10 },
      );
    });
  });

  describe('getFillBlankQuiz', () => {
    it('should delegate to FillBlankGeneratorService', async () => {
      fillBlankGeneratorService.generateQuestions.mockResolvedValue([]);

      const result = await controller.getFillBlankQuiz(mockUser, {
        deckId: 'deck-1',
        limit: 10,
      });

      expect(result.success).toBe(true);
      expect(result.data).toEqual([]);
      expect(fillBlankGeneratorService.generateQuestions).toHaveBeenCalledWith(
        'user-1',
        { deckId: 'deck-1', limit: 10 },
      );
    });
  });

  describe('submitQuiz', () => {
    it('should delegate to PracticeService', async () => {
      const mockResult = {
        totalQuestions: 10,
        correctCount: 10,
        accuracyPercentage: 100,
        totalXpEarned: 150,
        maxCombo: 10,
        missedCards: [],
      };
      practiceService.submitQuiz.mockResolvedValue(mockResult);

      const result = await controller.submitQuiz(mockUser, {
        deckId: 'deck-1',
        totalQuestions: 10,
        answers: [],
      });

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockResult);
      expect(practiceService.submitQuiz).toHaveBeenCalledWith('user-1', {
        deckId: 'deck-1',
        totalQuestions: 10,
        answers: [],
      });
    });
  });
});
