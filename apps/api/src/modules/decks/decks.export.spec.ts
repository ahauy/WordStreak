/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { DecksService } from './decks.service';
import { DecksController } from './decks.controller';
import { PrismaService } from '../prisma/prisma.service';
import type { DeckExportQueryDto } from './dto/export-deck.dto';
import type { Response } from 'express';
import type { JwtPayload } from '@wordstreak/shared-types';

describe('DecksService - Export Deck (US-ECO-01)', () => {
  let service: DecksService;
  let controller: DecksController;

  const mockPrismaService = {
    deck: {
      findUnique: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DecksController],
      providers: [
        DecksService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<DecksService>(DecksService);
    controller = module.get<DecksController>(DecksController);
    jest.clearAllMocks();
  });

  describe('Security & Access Guards', () => {
    it('should throw NotFoundException if deck does not exist', async () => {
      mockPrismaService.deck.findUnique.mockResolvedValue(null);

      const query: DeckExportQueryDto = { format: 'CSV', status: 'ALL' };

      await expect(
        service.exportDeck('user-1', 'non-existent-deck', query),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if deck is private and belongs to another user', async () => {
      mockPrismaService.deck.findUnique.mockResolvedValue({
        id: 'deck-private',
        userId: 'owner-user',
        isPublic: false,
        cards: [],
      });

      const query: DeckExportQueryDto = { format: 'CSV', status: 'ALL' };

      await expect(
        service.exportDeck('another-user', 'deck-private', query),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should allow export if deck is public even when caller is not the owner', async () => {
      mockPrismaService.deck.findUnique.mockResolvedValue({
        id: 'deck-public',
        userId: 'owner-user',
        title: 'Public Oxford 3000',
        description: 'Community vocabulary',
        isPublic: true,
        tags: '["English","IELTS"]',
        cards: [
          {
            id: 'card-1',
            word: 'Achieve',
            meaning: 'Reach a goal',
            phonetic: '/əˈtʃiːv/',
            exampleSentence: 'She achieved success.',
            collocations: 'achieve a goal',
            mnemonic: null,
            imageUrl: null,
            audioUrl: null,
            progress: [],
          },
        ],
      });

      const query: DeckExportQueryDto = { format: 'CSV', status: 'ALL' };
      const result = await service.exportDeck(
        'reader-user',
        'deck-public',
        query,
      );

      expect(result.format).toBe('csv');
      expect(result.deck.title).toBe('Public Oxford 3000');
      expect(result.cards.length).toBe(1);
    });
  });

  describe('CSV format generation & CWE-1236 defense', () => {
    it('should generate RFC 4180 CSV starting with UTF-8 BOM', async () => {
      const userId = 'user-1';
      const deckId = 'deck-vietnamese';

      mockPrismaService.deck.findUnique.mockResolvedValue({
        id: deckId,
        userId,
        title: 'Từ vựng Tiếng Việt',
        description: 'Học từ',
        isPublic: false,
        tags: null,
        cards: [
          {
            id: 'card-vn-1',
            word: 'Kiên cường',
            meaning: 'Bền bỉ, không khuất phục',
            phonetic: null,
            exampleSentence: 'Tinh thần kiên cường, bất khuất.',
            collocations: 'ý chí kiên cường',
            mnemonic: null,
            imageUrl: null,
            audioUrl: null,
            progress: [{ status: 'LEARNING', interval: 5, repetitions: 2 }],
          },
        ],
      });

      const result = await service.exportDeck(userId, deckId, {
        format: 'CSV',
        status: 'ALL',
      });

      // Verify UTF-8 BOM
      expect(result.csvContent.startsWith('\uFEFF')).toBe(true);

      // Verify RFC 4180 quotes for cells containing comma
      expect(result.csvContent).toContain('"Bền bỉ, không khuất phục"');
      expect(result.csvContent).toContain('"Tinh thần kiên cường, bất khuất."');
      expect(result.csvContent).toContain(
        'Word,Meaning,Phonetic,Example Sentence',
      );
    });

    it('should escape CSV formula injection triggers (=, +, -, @) by prepending single quote', async () => {
      const userId = 'user-1';
      const deckId = 'deck-formula';

      mockPrismaService.deck.findUnique.mockResolvedValue({
        id: deckId,
        userId,
        title: 'Formula Deck',
        description: null,
        isPublic: false,
        tags: null,
        cards: [
          {
            id: 'card-f-1',
            word: "=CMD|' /C calc'!A0",
            meaning: '+SUM(A1:A10)',
            phonetic: '@phonetic-test',
            exampleSentence: '-danger example',
            collocations: null,
            mnemonic: null,
            imageUrl: null,
            audioUrl: null,
            progress: [{ status: 'NEW', interval: 0, repetitions: 0 }],
          },
        ],
      });

      const result = await service.exportDeck(userId, deckId, {
        format: 'CSV',
        status: 'ALL',
      });

      // Escaped with leading single quote
      expect(result.csvContent).toContain("'=CMD|' /C calc'!A0");
      expect(result.csvContent).toContain("'+SUM(A1:A10)");
      expect(result.csvContent).toContain("'@phonetic-test");
      expect(result.csvContent).toContain("'-danger example");
    });
  });

  describe('Status filter capabilities', () => {
    const mockDeckWithVariousCards = {
      id: 'deck-mixed',
      userId: 'user-1',
      title: 'Mixed Status Deck',
      description: null,
      isPublic: false,
      tags: null,
      cards: [
        {
          id: 'card-m-1',
          word: 'MasteredWord',
          meaning: 'Known well',
          phonetic: null,
          exampleSentence: null,
          collocations: null,
          mnemonic: null,
          imageUrl: null,
          audioUrl: null,
          progress: [{ status: 'MASTERED', interval: 30, repetitions: 6 }],
        },
        {
          id: 'card-l-1',
          word: 'LearningWord',
          meaning: 'Currently learning',
          phonetic: null,
          exampleSentence: null,
          collocations: null,
          mnemonic: null,
          imageUrl: null,
          audioUrl: null,
          progress: [{ status: 'LEARNING', interval: 4, repetitions: 2 }],
        },
        {
          id: 'card-n-1',
          word: 'NewWord',
          meaning: 'Brand new word',
          phonetic: null,
          exampleSentence: null,
          collocations: null,
          mnemonic: null,
          imageUrl: null,
          audioUrl: null,
          progress: [{ status: 'NEW', interval: 0, repetitions: 0 }],
        },
      ],
    };

    it('should filter cards when MASTERED is selected', async () => {
      mockPrismaService.deck.findUnique.mockResolvedValue(
        mockDeckWithVariousCards,
      );

      const result = await service.exportDeck('user-1', 'deck-mixed', {
        format: 'CSV',
        status: 'MASTERED',
      });

      expect(result.cards.length).toBe(1);
      expect(result.cards[0].word).toBe('MasteredWord');
    });

    it('should filter cards when LEARNING is selected', async () => {
      mockPrismaService.deck.findUnique.mockResolvedValue(
        mockDeckWithVariousCards,
      );

      const result = await service.exportDeck('user-1', 'deck-mixed', {
        format: 'CSV',
        status: 'LEARNING',
      });

      expect(result.cards.length).toBe(1);
      expect(result.cards[0].word).toBe('LearningWord');
    });

    it('should return all cards when filter is ALL or omitted', async () => {
      mockPrismaService.deck.findUnique.mockResolvedValue(
        mockDeckWithVariousCards,
      );

      const result = await service.exportDeck('user-1', 'deck-mixed', {
        format: 'CSV',
        status: 'ALL',
      });

      expect(result.cards.length).toBe(3);
    });
  });

  describe('DecksController Export Endpoint', () => {
    it('should set Content-Type and Content-Disposition headers for CSV download', async () => {
      const user: JwtPayload = {
        sub: 'user-1',
        email: 'user@example.com',
        username: 'learner',
      };
      mockPrismaService.deck.findUnique.mockResolvedValue({
        id: 'deck-1',
        userId: 'user-1',
        title: 'IELTS Vocabulary',
        description: null,
        isPublic: false,
        tags: null,
        cards: [],
      });

      const mockSet = jest.fn();
      const mockRes = {
        set: mockSet,
      } as unknown as Response;

      const output = await controller.exportDeck(
        user,
        'deck-1',
        { format: 'CSV', status: 'ALL' },
        mockRes,
      );

      expect(typeof output).toBe('string');
      expect((output as string).startsWith('\uFEFF')).toBe(true);
      expect(mockSet).toHaveBeenCalledWith(
        expect.objectContaining({
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': expect.stringContaining(
            'attachment; filename=',
          ),
        }),
      );
    });
  });
});
