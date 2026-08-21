import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { MatchingGeneratorService } from './matching-generator.service';
import { PrismaService } from '../prisma/prisma.service';

describe('MatchingGeneratorService', () => {
  let service: MatchingGeneratorService;
  let prisma: {
    deck: { findUnique: jest.Mock };
  };

  const createMockCards = (count: number) =>
    Array.from({ length: count }, (_, i) => ({
      id: `c${i + 1}`,
      deckId: 'deck-1',
      word: `word_${i + 1}`,
      meaning: `meaning_${i + 1}`,
      phonetic: `/wɜːd_${i + 1}/`,
      audioUrl: i % 2 === 0 ? `https://audio.url/word_${i + 1}.mp3` : null,
    }));

  const mockDeck10 = {
    id: 'deck-1',
    userId: 'user-1',
    title: 'Advanced Vocabulary',
    isPublic: false,
    isArchived: false,
    cards: createMockCards(10),
  };

  beforeEach(async () => {
    prisma = {
      deck: {
        findUnique: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MatchingGeneratorService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<MatchingGeneratorService>(MatchingGeneratorService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('generateQuiz', () => {
    it('should generate matching quiz with 5-pair chunks per round (10 cards -> 2 rounds of 5)', async () => {
      prisma.deck.findUnique.mockResolvedValue(mockDeck10);

      const result = await service.generateQuiz('user-1', {
        deckId: 'deck-1',
        limit: 10,
      });

      expect(result.deckId).toBe('deck-1');
      expect(result.deckTitle).toBe('Advanced Vocabulary');
      expect(result.totalCards).toBe(10);
      expect(result.totalRounds).toBe(2);
      expect(result.rounds).toHaveLength(2);

      for (let r = 0; r < result.rounds.length; r++) {
        const round = result.rounds[r];
        expect(round.roundIndex).toBe(r);
        expect(round.totalRounds).toBe(2);
        expect(round.wordTiles).toHaveLength(5);
        expect(round.meaningTiles).toHaveLength(5);
        expect(round.columnA).toEqual(round.wordTiles);
        expect(round.columnB).toEqual(round.meaningTiles);

        // Check word tile structure
        for (const wt of round.wordTiles) {
          expect(wt.id).toMatch(/^tile_w_c\d+$/);
          expect(wt.type).toBe('WORD');
          expect(wt.text).toMatch(/^word_\d+$/);
          expect(wt.cardId).toBeDefined();
        }

        // Check meaning tile structure
        for (const mt of round.meaningTiles) {
          expect(mt.id).toMatch(/^tile_m_c\d+$/);
          expect(mt.type).toBe('MEANING');
          expect(mt.text).toMatch(/^meaning_\d+$/);
          expect(mt.cardId).toBeDefined();
          expect(mt.phonetic).toBeNull();
          expect(mt.audioUrl).toBeNull();
        }

        // All cardIds in wordTiles should match meaningTiles in the same round
        const wordCardIds = round.wordTiles.map((t) => t.cardId).sort();
        const meaningCardIds = round.meaningTiles.map((t) => t.cardId).sort();
        expect(wordCardIds).toEqual(meaningCardIds);
      }
    });

    it('should generate 1 round of 5 pairs when limit or deck has 5 cards', async () => {
      prisma.deck.findUnique.mockResolvedValue({
        ...mockDeck10,
        cards: createMockCards(5),
      });

      const result = await service.generateQuiz('user-1', {
        deckId: 'deck-1',
        limit: 5,
      });

      expect(result.totalCards).toBe(5);
      expect(result.totalRounds).toBe(1);
      expect(result.rounds).toHaveLength(1);
      expect(result.rounds[0].wordTiles).toHaveLength(5);
      expect(result.rounds[0].meaningTiles).toHaveLength(5);
    });

    it('should support roundsCount query parameter (e.g. roundsCount=3 -> 15 cards, 3 rounds)', async () => {
      prisma.deck.findUnique.mockResolvedValue({
        ...mockDeck10,
        cards: createMockCards(20),
      });

      const result = await service.generateQuiz('user-1', {
        deckId: 'deck-1',
        roundsCount: 3,
      });

      expect(result.totalCards).toBe(15);
      expect(result.totalRounds).toBe(3);
      expect(result.rounds).toHaveLength(3);
    });

    it('should throw BadRequestException with INSUFFICIENT_CARDS_FOR_MATCHING when deck has < 5 cards', async () => {
      prisma.deck.findUnique.mockResolvedValue({
        ...mockDeck10,
        cards: createMockCards(4),
      });

      await expect(
        service.generateQuiz('user-1', { deckId: 'deck-1' }),
      ).rejects.toThrow(
        new BadRequestException('INSUFFICIENT_CARDS_FOR_MATCHING'),
      );
    });

    it('should throw NotFoundException when deck is not found or is archived', async () => {
      prisma.deck.findUnique.mockResolvedValue(null);

      await expect(
        service.generateQuiz('user-1', { deckId: 'not-found' }),
      ).rejects.toThrow(NotFoundException);

      prisma.deck.findUnique.mockResolvedValue({
        ...mockDeck10,
        isArchived: true,
      });

      await expect(
        service.generateQuiz('user-1', { deckId: 'deck-1' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException when deck is private and owned by another user', async () => {
      prisma.deck.findUnique.mockResolvedValue({
        ...mockDeck10,
        userId: 'other-user',
        isPublic: false,
      });

      await expect(
        service.generateQuiz('user-1', { deckId: 'deck-1' }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should allow access to public deck owned by another user', async () => {
      prisma.deck.findUnique.mockResolvedValue({
        ...mockDeck10,
        userId: 'other-user',
        isPublic: true,
      });

      const result = await service.generateQuiz('user-1', {
        deckId: 'deck-1',
      });

      expect(result.totalRounds).toBe(2);
    });

    it('should independently shuffle wordTiles and meaningTiles', async () => {
      // Create 20 cards and run 10 iterations to verify permutation variation
      prisma.deck.findUnique.mockResolvedValue({
        ...mockDeck10,
        cards: createMockCards(20),
      });

      let orderDifferences = 0;
      const iterations = 10;

      for (let i = 0; i < iterations; i++) {
        const res = await service.generateQuiz('user-1', {
          deckId: 'deck-1',
          limit: 5,
        });

        const wordOrder = res.rounds[0].wordTiles
          .map((t) => t.cardId)
          .join(',');
        const meaningOrder = res.rounds[0].meaningTiles
          .map((t) => t.cardId)
          .join(',');

        if (wordOrder !== meaningOrder) {
          orderDifferences++;
        }
      }

      // Over 10 iterations of 5 items, probability of identical order every time is (1/120)^10 ~ 0
      expect(orderDifferences).toBeGreaterThan(0);
    });
  });
});
