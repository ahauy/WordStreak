/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Test, TestingModule } from '@nestjs/testing';
import {
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { DecksService } from './decks.service';
import { PrismaService } from '../prisma/prisma.service';
import type { BulkImportCardsDto } from './dto/bulk-import.dto';

describe('DecksService - Bulk Import Cards (US-ECO-01)', () => {
  let service: DecksService;

  const mockTx = {
    deck: {
      create: jest.fn(),
    },
    card: {
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    userCardProgress: {
      create: jest.fn(),
    },
  };

  const mockPrismaService = {
    deck: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    card: {
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    userCardProgress: {
      create: jest.fn(),
    },
    $transaction: jest.fn((callback: (tx: typeof mockTx) => Promise<unknown>) =>
      callback(mockTx),
    ),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DecksService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<DecksService>(DecksService);
    jest.clearAllMocks();
  });

  describe('Deck ownership & access guards', () => {
    it('should throw NotFoundException if deck does not exist', async () => {
      mockPrismaService.deck.findUnique.mockResolvedValue(null);

      const dto: BulkImportCardsDto = {
        cards: [{ word: 'Ubiquitous', meaning: 'Present everywhere' }],
      };

      await expect(
        service.bulkImportCards('user-1', 'non-existent-deck', dto),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if deck does not belong to user', async () => {
      mockPrismaService.deck.findUnique.mockResolvedValue({
        id: 'deck-1',
        userId: 'other-user',
      });

      const dto: BulkImportCardsDto = {
        cards: [{ word: 'Ubiquitous', meaning: 'Present everywhere' }],
      };

      await expect(
        service.bulkImportCards('user-1', 'deck-1', dto),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should create new deck if createAsNewDeck is true', async () => {
      const userId = 'user-1';
      mockPrismaService.deck.create.mockResolvedValue({
        id: 'deck-new-auto',
        userId,
        title: 'Auto Deck',
      });
      mockTx.card.findMany.mockResolvedValue([]);
      mockTx.card.create.mockResolvedValue({ id: 'c1' });
      mockTx.userCardProgress.create.mockResolvedValue({ id: 'p1' });

      const dto: BulkImportCardsDto = {
        createAsNewDeck: true,
        newDeckTitle: 'Auto Deck',
        cards: [{ word: 'Novel', meaning: 'New and unusual' }],
      };

      const result = await service.bulkImportCards(userId, 'any-id', dto);
      expect(mockPrismaService.deck.create).toHaveBeenCalledWith({
        data: {
          userId,
          title: 'Auto Deck',
        },
      });
      expect(result.deckId).toBe('deck-new-auto');
      expect(result.imported).toBe(1);
    });
  });

  describe('Batch validation limits', () => {
    it('should throw BadRequestException if cards array is empty', async () => {
      mockPrismaService.deck.findUnique.mockResolvedValue({
        id: 'deck-1',
        userId: 'user-1',
      });

      const dto: BulkImportCardsDto = {
        cards: [],
      };

      await expect(
        service.bulkImportCards('user-1', 'deck-1', dto),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if cards count exceeds 2,000 limit', async () => {
      mockPrismaService.deck.findUnique.mockResolvedValue({
        id: 'deck-1',
        userId: 'user-1',
      });

      const bigBatch = Array.from({ length: 2001 }, (_, i) => ({
        word: `Word ${i}`,
        meaning: `Meaning ${i}`,
      }));

      const dto: BulkImportCardsDto = {
        cards: bigBatch,
      };

      await expect(
        service.bulkImportCards('user-1', 'deck-1', dto),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('Successful creation & SM-2 initialization', () => {
    it('should insert new cards and initialize UserCardProgress in NEW state', async () => {
      const userId = 'user-1';
      const deckId = 'deck-1';

      mockPrismaService.deck.findUnique.mockResolvedValue({
        id: deckId,
        userId,
      });
      mockTx.card.findMany.mockResolvedValue([]);
      mockTx.card.create.mockImplementation(({ data }) =>
        Promise.resolve({
          id: 'card-new-1',
          deckId,
          ...data,
          createdAt: new Date(),
          updatedAt: new Date(),
        }),
      );
      mockTx.userCardProgress.create.mockResolvedValue({
        id: 'prog-1',
        userId,
        cardId: 'card-new-1',
        status: 'NEW',
        interval: 0,
        easeFactor: 2.5,
        repetitions: 0,
        nextReviewDate: new Date(),
      });

      const dto: BulkImportCardsDto = {
        cards: [
          {
            word: 'Resilient',
            meaning: 'Able to withstand difficulties',
            phonetic: '/rɪˈzɪl.jənt/',
            exampleSentence: 'She remained resilient under pressure.',
          },
        ],
      };

      const result = await service.bulkImportCards(userId, deckId, dto);

      expect(result.success).toBe(true);
      expect(result.totalSubmitted).toBe(1);
      expect(result.imported).toBe(1);
      expect(result.overwritten).toBe(0);
      expect(result.skipped).toBe(0);

      expect(mockTx.card.create).toHaveBeenCalledWith({
        data: {
          deckId,
          word: 'Resilient',
          meaning: 'Able to withstand difficulties',
          phonetic: '/rɪˈzɪl.jənt/',
          exampleSentence: 'She remained resilient under pressure.',
          collocations: null,
          mnemonic: null,
          imageUrl: null,
          audioUrl: null,
        },
      });

      expect(mockTx.userCardProgress.create).toHaveBeenCalledWith({
        data: {
          userId,
          cardId: 'card-new-1',
          status: 'NEW',
          interval: 0,
          easeFactor: 2.5,
          repetitions: 0,
          nextReviewDate: expect.any(Date),
        },
      });
    });
  });

  describe('Duplicate conflict strategies', () => {
    const userId = 'user-1';
    const deckId = 'deck-1';

    beforeEach(() => {
      mockPrismaService.deck.findUnique.mockResolvedValue({
        id: deckId,
        userId,
      });
    });

    it('should SKIP duplicate word by default when strategy is SKIP', async () => {
      mockTx.card.findMany.mockResolvedValue([
        { id: 'card-existing-1', word: 'Ephemeral' },
      ]);

      const dto: BulkImportCardsDto = {
        conflictStrategy: 'SKIP',
        cards: [
          { word: 'ephemeral', meaning: 'Lasting a very short time' },
          { word: 'Perseverance', meaning: 'Continued effort' },
        ],
      };

      mockTx.card.create.mockResolvedValue({
        id: 'card-new-2',
        deckId,
        word: 'Perseverance',
        meaning: 'Continued effort',
      });
      mockTx.userCardProgress.create.mockResolvedValue({ id: 'prog-2' });

      const result = await service.bulkImportCards(userId, deckId, dto);

      expect(result.totalSubmitted).toBe(2);
      expect(result.imported).toBe(1);
      expect(result.skipped).toBe(1);
      expect(result.overwritten).toBe(0);
      expect(mockTx.card.update).not.toHaveBeenCalled();
    });

    it('should OVERWRITE existing card without resetting UserCardProgress', async () => {
      mockTx.card.findMany.mockResolvedValue([
        {
          id: 'card-existing-1',
          word: 'Ephemeral',
          imageUrl: null,
          audioUrl: null,
        },
      ]);
      mockTx.card.update.mockResolvedValue({
        id: 'card-existing-1',
        word: 'Ephemeral',
        meaning: 'New updated meaning',
      });

      const dto: BulkImportCardsDto = {
        conflictStrategy: 'OVERWRITE',
        cards: [{ word: 'Ephemeral', meaning: 'New updated meaning' }],
      };

      const result = await service.bulkImportCards(userId, deckId, dto);

      expect(result.totalSubmitted).toBe(1);
      expect(result.imported).toBe(0);
      expect(result.overwritten).toBe(1);
      expect(result.skipped).toBe(0);
      expect(mockTx.card.update).toHaveBeenCalledWith({
        where: { id: 'card-existing-1' },
        data: expect.objectContaining({
          word: 'Ephemeral',
          meaning: 'New updated meaning',
        }),
      });
      expect(mockTx.userCardProgress.create).not.toHaveBeenCalled();
    });

    it('should KEEP_BOTH by inserting new record with SM-2 progress', async () => {
      mockTx.card.findMany.mockResolvedValue([
        { id: 'card-existing-1', word: 'Ephemeral' },
      ]);
      mockTx.card.create.mockResolvedValue({
        id: 'card-new-dup',
        deckId,
        word: 'Ephemeral',
        meaning: 'Another meaning definition',
      });
      mockTx.userCardProgress.create.mockResolvedValue({ id: 'prog-dup' });

      const dto: BulkImportCardsDto = {
        conflictStrategy: 'KEEP_BOTH',
        cards: [{ word: 'Ephemeral', meaning: 'Another meaning definition' }],
      };

      const result = await service.bulkImportCards(userId, deckId, dto);

      expect(result.totalSubmitted).toBe(1);
      expect(result.imported).toBe(1);
      expect(result.overwritten).toBe(0);
      expect(result.skipped).toBe(0);
      expect(mockTx.card.create).toHaveBeenCalled();
      expect(mockTx.userCardProgress.create).toHaveBeenCalled();
    });

    it('should respect per-row rowConflictAction override', async () => {
      mockTx.card.findMany.mockResolvedValue([
        {
          id: 'card-existing-1',
          word: 'WordA',
          imageUrl: null,
          audioUrl: null,
        },
        {
          id: 'card-existing-2',
          word: 'WordB',
          imageUrl: null,
          audioUrl: null,
        },
      ]);
      mockTx.card.update.mockResolvedValue({ id: 'card-existing-2' });

      const dto: BulkImportCardsDto = {
        conflictStrategy: 'SKIP',
        cards: [
          { word: 'WordA', meaning: 'Meaning A', rowConflictAction: 'SKIP' },
          {
            word: 'WordB',
            meaning: 'Meaning B Overwritten',
            rowConflictAction: 'OVERWRITE',
          },
        ],
      };

      const result = await service.bulkImportCards(userId, deckId, dto);

      expect(result.skipped).toBe(1);
      expect(result.overwritten).toBe(1);
      expect(mockTx.card.update).toHaveBeenCalledWith({
        where: { id: 'card-existing-2' },
        data: expect.objectContaining({
          word: 'WordB',
          meaning: 'Meaning B Overwritten',
        }),
      });
    });
  });

  describe('Formula injection sanitization (CWE-1236)', () => {
    it('should strip leading formula trigger characters (=, +, -, @) from text fields', async () => {
      const userId = 'user-1';
      const deckId = 'deck-1';

      mockPrismaService.deck.findUnique.mockResolvedValue({
        id: deckId,
        userId,
      });
      mockTx.card.findMany.mockResolvedValue([]);
      mockTx.card.create.mockResolvedValue({ id: 'card-sanitized-1' });
      mockTx.userCardProgress.create.mockResolvedValue({ id: 'prog-1' });

      const dto: BulkImportCardsDto = {
        cards: [
          {
            word: "=CMD|' /C calc'!A0",
            meaning: '+SUM(1, 2)',
            phonetic: '@phonetic',
            exampleSentence: '-danger formula',
          },
        ],
      };

      await service.bulkImportCards(userId, deckId, dto);

      expect(mockTx.card.create).toHaveBeenCalledWith({
        data: {
          deckId,
          word: "CMD|' /C calc'!A0",
          meaning: 'SUM(1, 2)',
          phonetic: 'phonetic',
          exampleSentence: 'danger formula',
          collocations: null,
          mnemonic: null,
          imageUrl: null,
          audioUrl: null,
        },
      });
    });
  });

  describe('Invalid row error reporting', () => {
    it('should record error and continue when row has empty word or meaning', async () => {
      const userId = 'user-1';
      const deckId = 'deck-1';

      mockPrismaService.deck.findUnique.mockResolvedValue({
        id: deckId,
        userId,
      });
      mockTx.card.findMany.mockResolvedValue([]);
      mockTx.card.create.mockResolvedValue({ id: 'card-valid-1' });
      mockTx.userCardProgress.create.mockResolvedValue({ id: 'prog-1' });

      const dto: BulkImportCardsDto = {
        cards: [
          { word: '', meaning: 'Empty word row' },
          { word: 'ValidWord', meaning: 'Valid meaning' },
        ],
      };

      const result = await service.bulkImportCards(userId, deckId, dto);

      expect(result.imported).toBe(1);
      expect(result.errors).toBeDefined();
      expect(result.errors?.length).toBe(1);
      expect(result.errors?.[0]).toEqual({
        index: 1,
        word: '',
        reason: 'Từ vựng và ý nghĩa không được để trống',
      });
    });
  });
});
