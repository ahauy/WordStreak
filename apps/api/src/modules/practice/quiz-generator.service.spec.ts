import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { QuizGeneratorService } from './quiz-generator.service';
import { PrismaService } from '../prisma/prisma.service';

describe('QuizGeneratorService', () => {
  let service: QuizGeneratorService;
  let prisma: any;

  const mockCards = [
    {
      id: 'c1',
      deckId: 'deck-1',
      word: 'ephemeral',
      meaning: 'phù du, chóng tàn',
      phonetic: '/ɪˈfem.ər.əl/',
      audioUrl: 'https://audio.url/ephemeral.mp3',
      exampleSentence: 'Fashions are ephemeral.',
    },
    {
      id: 'c2',
      deckId: 'deck-1',
      word: 'serendipity',
      meaning: 'sự may mắn tình cờ',
      phonetic: '/ˌser.ənˈdɪp.ə.ti/',
      audioUrl: 'https://audio.url/serendipity.mp3',
      exampleSentence: 'A stroke of serendipity.',
    },
    {
      id: 'c3',
      deckId: 'deck-1',
      word: 'ubiquitous',
      meaning: 'phổ biến ở khắp nơi',
      phonetic: '/juːˈbɪk.wə.təs/',
      audioUrl: 'https://audio.url/ubiquitous.mp3',
      exampleSentence: 'Sugar is ubiquitous in diet.',
    },
    {
      id: 'c4',
      deckId: 'deck-1',
      word: 'eloquent',
      meaning: 'hùng biện, lưu loát',
      phonetic: '/ˈel.ə.kwənt/',
      audioUrl: 'https://audio.url/eloquent.mp3',
      exampleSentence: 'An eloquent speaker.',
    },
    {
      id: 'c5',
      deckId: 'deck-1',
      word: 'resilient',
      meaning: 'kiên cường, phục hồi nhanh',
      phonetic: '/rɪˈzɪl.jənt/',
      audioUrl: 'https://audio.url/resilient.mp3',
      exampleSentence: 'She is resilient.',
    },
  ];

  const mockDeck = {
    id: 'deck-1',
    userId: 'user-1',
    title: 'Advanced Vocabulary',
    isPublic: false,
    isArchived: false,
    cards: mockCards,
  };

  beforeEach(async () => {
    prisma = {
      deck: {
        findUnique: jest.fn(),
      },
      card: {
        findMany: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        QuizGeneratorService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<QuizGeneratorService>(QuizGeneratorService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('generateQuestions', () => {
    it('should generate multiple choice questions with 4 options each', async () => {
      prisma.deck.findUnique.mockResolvedValue(mockDeck);
      prisma.card.findMany.mockResolvedValue(mockCards);

      const result = await service.generateQuestions('user-1', {
        deckId: 'deck-1',
        limit: 5,
      });

      expect(result).toHaveLength(5);

      for (const q of result) {
        expect(q.options).toHaveLength(4);
        const correctOptions = q.options.filter((o) => o.isCorrect);
        expect(correctOptions).toHaveLength(1);

        // Options text should be unique
        const optionTexts = q.options.map((o) => o.text);
        const uniqueTexts = new Set(optionTexts);
        expect(uniqueTexts.size).toBe(4);

        // Format is either EN_TO_VI or VI_TO_EN
        expect(['EN_TO_VI', 'VI_TO_EN']).toContain(q.format);
        if (q.format === 'EN_TO_VI') {
          expect(q.prompt).toBeTruthy();
        }
      }
    });

    it('should pool distractors from other user decks when current deck has fewer than 4 cards', async () => {
      const smallDeck = {
        ...mockDeck,
        id: 'deck-small',
        cards: mockCards.slice(0, 2),
      };

      prisma.deck.findUnique.mockResolvedValue(smallDeck);
      // findMany returns all cards across user's active decks
      prisma.card.findMany.mockResolvedValue(mockCards);

      const result = await service.generateQuestions('user-1', {
        deckId: 'deck-small',
      });

      expect(result).toHaveLength(2);
      expect(result[0].options).toHaveLength(4);
      expect(result[0].options.filter((o) => o.isCorrect)).toHaveLength(1);
    });

    it('should throw BadRequestException if user has fewer than 4 cards in total', async () => {
      const smallDeck = {
        ...mockDeck,
        id: 'deck-tiny',
        cards: mockCards.slice(0, 2),
      };

      prisma.deck.findUnique.mockResolvedValue(smallDeck);
      prisma.card.findMany.mockResolvedValue(mockCards.slice(0, 2));

      await expect(
        service.generateQuestions('user-1', { deckId: 'deck-tiny' }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException if deck is not found', async () => {
      prisma.deck.findUnique.mockResolvedValue(null);

      await expect(
        service.generateQuestions('user-1', { deckId: 'non-existent' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if deck is private and belongs to another user', async () => {
      prisma.deck.findUnique.mockResolvedValue({
        ...mockDeck,
        userId: 'other-user',
        isPublic: false,
      });

      await expect(
        service.generateQuestions('user-1', { deckId: 'deck-1' }),
      ).rejects.toThrow(ForbiddenException);
    });
  });
});
