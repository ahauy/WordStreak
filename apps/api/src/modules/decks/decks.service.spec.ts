import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { DecksService } from './decks.service';
import { PrismaService } from '../prisma/prisma.service';

describe('DecksService', () => {
  let service: DecksService;

  const mockPrismaService = {
    deck: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    card: {
      count: jest.fn(),
    },
    $transaction: jest.fn(),
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

  describe('create (TC-001, TC-002)', () => {
    it('should create a deck with preset theme and default attributes', async () => {
      const userId = 'user-123';
      const dto = {
        title: 'IELTS Writing Task 2',
        description: 'Advanced writing vocabulary',
        color: '#6366F1',
        icon: 'Book',
      };

      const createdDeck = {
        id: 'deck-1',
        userId,
        title: dto.title,
        description: dto.description,
        color: dto.color,
        icon: dto.icon,
        coverImageUrl: null,
        tags: null,
        isPublic: false,
        isArchived: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.deck.create.mockResolvedValue(createdDeck);

      const result = await service.create(userId, dto);

      expect(mockPrismaService.deck.create).toHaveBeenCalledWith({
        data: {
          userId,
          title: dto.title,
          description: dto.description,
          color: dto.color,
          icon: dto.icon,
          coverImageUrl: undefined,
          tags: null,
          isPublic: false,
        },
      });

      expect(result.id).toBe('deck-1');
      expect(result.title).toBe(dto.title);
      expect(result.stats).toEqual({
        totalCards: 0,
        newCards: 0,
        learningCards: 0,
        masteredCards: 0,
        dueCards: 0,
      });
    });

    it('should create a deck with custom hex and cover image url', async () => {
      const userId = 'user-123';
      const dto = {
        title: 'CS Terms',
        color: '#0EA5E9',
        coverImageUrl: 'https://example.com/cover.png',
        tags: ['CS', 'Tech'],
      };

      const createdDeck = {
        id: 'deck-2',
        userId,
        title: dto.title,
        description: null,
        color: dto.color,
        icon: 'Book',
        coverImageUrl: dto.coverImageUrl,
        tags: JSON.stringify(dto.tags),
        isPublic: false,
        isArchived: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.deck.create.mockResolvedValue(createdDeck);

      const result = await service.create(userId, dto);

      expect(result.color).toBe('#0EA5E9');
      expect(result.coverImageUrl).toBe('https://example.com/cover.png');
      expect(result.tags).toEqual(['CS', 'Tech']);
    });
  });

  describe('findAll (TC-003, TC-004)', () => {
    it('should return active decks with calculated stats', async () => {
      const userId = 'user-123';
      const now = new Date();
      const past = new Date(now.getTime() - 86400000);

      const mockDecks = [
        {
          id: 'deck-1',
          userId,
          title: 'IELTS Vocabulary',
          description: 'Core words',
          color: '#6366F1',
          icon: 'Book',
          coverImageUrl: null,
          tags: null,
          isPublic: false,
          isArchived: false,
          createdAt: now,
          updatedAt: now,
          cards: [
            {
              id: 'card-1',
              progress: [
                {
                  userId,
                  status: 'LEARNING',
                  interval: 3,
                  repetitions: 2,
                  nextReviewDate: past,
                },
              ],
            },
            {
              id: 'card-2',
              progress: [
                {
                  userId,
                  status: 'NEW',
                  interval: 0,
                  repetitions: 0,
                  nextReviewDate: now,
                },
              ],
            },
            {
              id: 'card-3',
              progress: [],
            },
          ],
        },
      ];

      mockPrismaService.deck.findMany.mockResolvedValue(mockDecks);

      const result = await service.findAll(userId, { status: 'active' });

      expect(result).toHaveLength(1);
      expect(result[0].stats).toEqual({
        totalCards: 3,
        newCards: 2, // card-2 (NEW) + card-3 (no progress)
        learningCards: 1,
        masteredCards: 0,
        dueCards: 2, // card-1 (past) + card-2 (now)
      });
    });

    it('should filter decks by search keyword', async () => {
      const userId = 'user-123';
      mockPrismaService.deck.findMany.mockResolvedValue([]);

      await service.findAll(userId, { search: 'ielts', status: 'active' });

      expect(mockPrismaService.deck.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            userId,
            isArchived: false,
            OR: [
              { title: { contains: 'ielts', mode: 'insensitive' } },
              { description: { contains: 'ielts', mode: 'insensitive' } },
            ],
          }),
        }),
      );
    });
  });

  describe('update (TC-005, TC-006)', () => {
    it('should update deck when user is the owner', async () => {
      const userId = 'user-123';
      const deckId = 'deck-1';
      const existingDeck = {
        id: deckId,
        userId,
        title: 'Old Title',
        cards: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.deck.findUnique.mockResolvedValue(existingDeck);
      mockPrismaService.deck.update.mockResolvedValue({
        ...existingDeck,
        title: 'New Title',
        color: '#10B981',
        updatedAt: new Date(),
      });

      const result = await service.update(userId, deckId, {
        title: 'New Title',
        color: '#10B981',
      });

      expect(result.title).toBe('New Title');
      expect(result.color).toBe('#10B981');
    });

    it('should throw ForbiddenException if user is not the owner', async () => {
      const userId = 'user-123';
      const otherUserId = 'user-999';
      const deckId = 'deck-1';

      mockPrismaService.deck.findUnique.mockResolvedValue({
        id: deckId,
        userId: otherUserId,
        title: 'Other Deck',
      });

      await expect(
        service.update(userId, deckId, { title: 'Hack' }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw NotFoundException if deck does not exist', async () => {
      mockPrismaService.deck.findUnique.mockResolvedValue(null);

      await expect(
        service.update('user-123', 'non-existent', { title: 'Test' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('archive and restore (TC-007, TC-008)', () => {
    it('should set isArchived to true on archive', async () => {
      const userId = 'user-123';
      const deckId = 'deck-1';
      const now = new Date();
      mockPrismaService.deck.findUnique.mockResolvedValue({
        id: deckId,
        userId,
        isArchived: false,
        cards: [],
        createdAt: now,
        updatedAt: now,
      });
      mockPrismaService.deck.update.mockResolvedValue({
        id: deckId,
        userId,
        isArchived: true,
        cards: [],
        createdAt: now,
        updatedAt: now,
      });

      const result = await service.archive(userId, deckId);
      expect(result.isArchived).toBe(true);
      expect(mockPrismaService.deck.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: deckId },
          data: { isArchived: true },
        }),
      );
    });

    it('should set isArchived to false on restore', async () => {
      const userId = 'user-123';
      const deckId = 'deck-1';
      const now = new Date();
      mockPrismaService.deck.findUnique.mockResolvedValue({
        id: deckId,
        userId,
        isArchived: true,
        cards: [],
        createdAt: now,
        updatedAt: now,
      });
      mockPrismaService.deck.update.mockResolvedValue({
        id: deckId,
        userId,
        isArchived: false,
        cards: [],
        createdAt: now,
        updatedAt: now,
      });

      const result = await service.restore(userId, deckId);
      expect(result.isArchived).toBe(false);
      expect(mockPrismaService.deck.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: deckId },
          data: { isArchived: false },
        }),
      );
    });
  });

  describe('remove (TC-009)', () => {
    it('should delete deck cascade and return deleted count', async () => {
      const userId = 'user-123';
      const deckId = 'deck-1';

      mockPrismaService.deck.findUnique.mockResolvedValue({
        id: deckId,
        userId,
      });
      mockPrismaService.card.count.mockResolvedValue(5);
      mockPrismaService.deck.delete.mockResolvedValue({ id: deckId });

      const result = await service.remove(userId, deckId);

      expect(mockPrismaService.deck.delete).toHaveBeenCalledWith({
        where: { id: deckId },
      });
      expect(result).toEqual({
        message: 'Bộ từ vựng đã được xóa vĩnh viễn thành công',
        deletedCardsCount: 5,
      });
    });
  });
});
