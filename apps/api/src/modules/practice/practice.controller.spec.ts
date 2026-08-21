import { Test, TestingModule } from '@nestjs/testing';
import { PracticeController } from './practice.controller';
import { PracticeService } from './practice.service';
import { QuizGeneratorService } from './quiz-generator.service';
import { FillBlankGeneratorService } from './fill-blank-generator.service';
import { ListeningGeneratorService } from './listening-generator.service';
import { MatchingGeneratorService } from './matching-generator.service';
import type { JwtPayload } from '@wordstreak/shared-types';

describe('PracticeController', () => {
  let controller: PracticeController;
  let practiceService: {
    submitQuiz: jest.Mock;
    submitMatchingQuiz: jest.Mock;
    submitVoicePronunciation: jest.Mock;
  };
  let quizGeneratorService: { generateQuestions: jest.Mock };
  let fillBlankGeneratorService: { generateQuestions: jest.Mock };
  let listeningGeneratorService: { generateQuestions: jest.Mock };
  let matchingGeneratorService: { generateQuiz: jest.Mock };

  const mockUser: JwtPayload = {
    sub: 'user-1',
    email: 'test@example.com',
    sessionId: 'sess-1',
  };

  beforeEach(async () => {
    practiceService = {
      submitQuiz: jest.fn(),
      submitMatchingQuiz: jest.fn(),
      submitVoicePronunciation: jest.fn(),
    };

    quizGeneratorService = {
      generateQuestions: jest.fn(),
    };

    fillBlankGeneratorService = {
      generateQuestions: jest.fn(),
    };

    listeningGeneratorService = {
      generateQuestions: jest.fn(),
    };

    matchingGeneratorService = {
      generateQuiz: jest.fn(),
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
        {
          provide: ListeningGeneratorService,
          useValue: listeningGeneratorService,
        },
        {
          provide: MatchingGeneratorService,
          useValue: matchingGeneratorService,
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

  describe('getListeningQuiz', () => {
    it('should delegate to ListeningGeneratorService', async () => {
      listeningGeneratorService.generateQuestions.mockResolvedValue([]);

      const result = await controller.getListeningQuiz(mockUser, {
        deckId: 'deck-1',
        limit: 10,
      });

      expect(result.success).toBe(true);
      expect(result.data).toEqual([]);
      expect(listeningGeneratorService.generateQuestions).toHaveBeenCalledWith(
        'user-1',
        { deckId: 'deck-1', limit: 10 },
      );
    });
  });

  describe('getMatchingQuiz', () => {
    it('should delegate to MatchingGeneratorService', async () => {
      const mockQuiz = {
        deckId: 'deck-1',
        totalCards: 10,
        totalRounds: 2,
        rounds: [],
      };
      matchingGeneratorService.generateQuiz.mockResolvedValue(mockQuiz);

      const result = await controller.getMatchingQuiz(mockUser, {
        deckId: 'deck-1',
        limit: 10,
      });

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockQuiz);
      expect(matchingGeneratorService.generateQuiz).toHaveBeenCalledWith(
        'user-1',
        { deckId: 'deck-1', limit: 10 },
      );
    });
  });

  describe('submitMatchingQuiz', () => {
    it('should delegate matching quiz submission to PracticeService.submitMatchingQuiz', async () => {
      const mockResult = {
        totalPairs: 5,
        matchedCount: 5,
        accuracyPercentage: 100,
        totalXpEarned: 27,
        maxCombo: 5,
        missedCards: [],
      };
      practiceService.submitMatchingQuiz.mockResolvedValue(mockResult);

      const payload = {
        deckId: 'deck-1',
        mode: 'MATCHING',
        totalPairs: 5,
        totalTimeMs: 12000,
        answers: [],
      };

      const result = await controller.submitMatchingQuiz(mockUser, payload);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockResult);
      expect(practiceService.submitMatchingQuiz).toHaveBeenCalledWith(
        'user-1',
        payload,
      );
    });
  });

  describe('submitPractice', () => {
    it('should route MATCHING mode submissions to submitMatchingQuiz', async () => {
      const mockMatchingResult = {
        totalPairs: 5,
        matchedCount: 5,
        accuracyPercentage: 100,
        totalXpEarned: 27,
        maxCombo: 5,
        missedCards: [],
      };
      practiceService.submitMatchingQuiz.mockResolvedValue(mockMatchingResult);

      const matchingDto = {
        deckId: 'deck-1',
        mode: 'MATCHING',
        totalPairs: 5,
        totalTimeMs: 12000,
      };

      const result = await controller.submitPractice(mockUser, matchingDto);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockMatchingResult);
      expect(practiceService.submitMatchingQuiz).toHaveBeenCalledWith(
        'user-1',
        matchingDto,
      );
    });

    it('should route standard quiz submissions to submitQuiz', async () => {
      const mockResult = {
        totalQuestions: 10,
        correctCount: 10,
        accuracyPercentage: 100,
        totalXpEarned: 150,
        maxCombo: 10,
        missedCards: [],
      };
      practiceService.submitQuiz.mockResolvedValue(mockResult);

      const standardDto = {
        deckId: 'deck-1',
        totalQuestions: 10,
        answers: [],
      };

      const result = await controller.submitPractice(mockUser, standardDto);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockResult);
      expect(practiceService.submitQuiz).toHaveBeenCalledWith(
        'user-1',
        standardDto,
      );
    });
  });

  describe('submitQuiz', () => {
    it('should delegate to PracticeService.submitQuiz', async () => {
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

  describe('submitVoicePronunciation', () => {
    it('should delegate to PracticeService.submitVoicePronunciation', async () => {
      const mockResult = {
        isPassed: true,
        accuracyScore: 100,
        tier: 'EXACT' as const,
        xpAwarded: 10,
        isDailyCapped: false,
        streakAdvanced: true,
      };
      practiceService.submitVoicePronunciation.mockResolvedValue(mockResult);

      const payload = {
        cardId: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
        spokenTranscript: 'eloquent',
        accent: 'en-US',
      };

      const result = await controller.submitVoicePronunciation(
        mockUser,
        payload,
      );

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockResult);
      expect(result.message).toBe('Voice pronunciation evaluated successfully');
      expect(practiceService.submitVoicePronunciation).toHaveBeenCalledWith(
        'user-1',
        payload,
      );
    });
  });
});
