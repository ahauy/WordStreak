import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { ListeningGeneratorService } from './listening-generator.service';
import { PrismaService } from '../prisma/prisma.service';

describe('ListeningGeneratorService', () => {
  let service: ListeningGeneratorService;
  let prisma: {
    deck: { findUnique: jest.Mock };
  };

  const mockCards = [
    {
      id: 'c1',
      deckId: 'deck-1',
      word: 'ephemeral',
      meaning: 'phù du, chóng tàn',
      phonetic: '/ɪˈfem.ər.əl/',
      audioUrl: 'https://audio.url/ephemeral.mp3',
    },
    {
      id: 'c2',
      deckId: 'deck-1',
      word: 'serendipity',
      meaning: 'sự may mắn tình cờ',
      phonetic: '/ˌser.ənˈdɪp.ə.ti/',
      audioUrl: 'https://audio.url/serendipity.mp3',
    },
    {
      id: 'c3',
      deckId: 'deck-1',
      word: 'ubiquitous',
      meaning: 'phổ biến ở khắp nơi',
      phonetic: '/juːˈbɪk.wə.təs/',
      audioUrl: null,
    },
    {
      id: 'c4',
      deckId: 'deck-1',
      word: 'eloquent',
      meaning: 'hùng biện, lưu loát',
      phonetic: '/ˈel.ə.kwənt/',
      audioUrl: 'https://audio.url/eloquent.mp3',
    },
    {
      id: 'c5',
      deckId: 'deck-1',
      word: 'resilient',
      meaning: 'kiên cường, phục hồi nhanh',
      phonetic: '/rɪˈzɪl.jənt/',
      audioUrl: 'https://audio.url/resilient.mp3',
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
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ListeningGeneratorService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<ListeningGeneratorService>(ListeningGeneratorService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('generateQuestions', () => {
    it('should generate listening questions with wordLength and firstLetterHint', async () => {
      prisma.deck.findUnique.mockResolvedValue(mockDeck);

      const result = await service.generateQuestions('user-1', {
        deckId: 'deck-1',
        limit: 5,
      });

      expect(result).toHaveLength(5);

      for (const q of result) {
        expect(q.id).toMatch(/^lq_c\d+_\d+$/);
        expect(q.cardId).toBeDefined();
        expect(q.word).toBeDefined();
        expect(q.meaning).toBeDefined();
        expect(q.wordLength).toBe(q.word.trim().length);
        expect(q.firstLetterHint).toBe(q.word.trim().charAt(0).toLowerCase());

        const matchingOriginal = mockCards.find((c) => c.id === q.cardId);
        expect(matchingOriginal).toBeDefined();
        expect(q.audioUrl).toBe(matchingOriginal?.audioUrl || null);
      }
    });

    it('should respect the limit parameter and slice questions accordingly', async () => {
      prisma.deck.findUnique.mockResolvedValue(mockDeck);

      const result = await service.generateQuestions('user-1', {
        deckId: 'deck-1',
        limit: 2,
      });

      expect(result).toHaveLength(2);
    });

    it('should default limit to 10 when not specified', async () => {
      prisma.deck.findUnique.mockResolvedValue(mockDeck);

      const result = await service.generateQuestions('user-1', {
        deckId: 'deck-1',
      });

      expect(result).toHaveLength(5); // mockDeck has 5 cards
    });

    it('should allow access to public deck owned by another user', async () => {
      prisma.deck.findUnique.mockResolvedValue({
        ...mockDeck,
        userId: 'other-user',
        isPublic: true,
      });

      const result = await service.generateQuestions('user-1', {
        deckId: 'deck-1',
      });

      expect(result).toHaveLength(5);
    });

    it('should throw NotFoundException if deck is not found or is archived', async () => {
      prisma.deck.findUnique.mockResolvedValue(null);

      await expect(
        service.generateQuestions('user-1', { deckId: 'non-existent' }),
      ).rejects.toThrow(NotFoundException);

      prisma.deck.findUnique.mockResolvedValue({
        ...mockDeck,
        isArchived: true,
      });

      await expect(
        service.generateQuestions('user-1', { deckId: 'deck-1' }),
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

    it('should throw BadRequestException if deck has 0 cards', async () => {
      prisma.deck.findUnique.mockResolvedValue({
        ...mockDeck,
        cards: [],
      });

      await expect(
        service.generateQuestions('user-1', { deckId: 'deck-1' }),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
