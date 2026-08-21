/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Test, TestingModule } from '@nestjs/testing';
import {
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { CommunityService } from './community.service';
import { PrismaService } from '../prisma/prisma.service';

describe('CommunityService (US-ECO-02)', () => {
  let service: CommunityService;

  const mockPrismaService = {
    deck: {
      count: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    card: {
      create: jest.fn(),
    },
    userCardProgress: {
      create: jest.fn(),
    },
    deckRating: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      upsert: jest.fn(),
    },
    $transaction: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CommunityService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<CommunityService>(CommunityService);
    jest.clearAllMocks();
  });

  describe('getPublicDecks (BR-COMM-001, BR-COMM-006, BR-COMM-007)', () => {
    it('should query and return paginated public decks with safe author projection', async () => {
      const mockDecks = [
        {
          id: 'deck-1',
          userId: 'user-1',
          title: 'IELTS 8.0 Vocab',
          description: 'Essential academic words',
          color: '#6366F1',
          icon: 'Book',
          coverImageUrl: null,
          category: 'IELTS',
          tags: '["academic","ielts"]',
          cloneCount: 42,
          averageRating: 4.8,
          totalRatings: 15,
          createdAt: new Date('2026-08-01T00:00:00Z'),
          updatedAt: new Date('2026-08-01T00:00:00Z'),
          user: {
            id: 'user-1',
            username: 'sarah_teacher',
            avatarUrl: 'https://avatar.com/sarah',
          },
          _count: {
            cards: 50,
          },
        },
      ];

      mockPrismaService.deck.count.mockResolvedValue(1);
      mockPrismaService.deck.findMany.mockResolvedValue(mockDecks);

      const result = await service.getPublicDecks(
        { category: 'IELTS', sort: 'POPULAR', page: 1, limit: 12 },
        'user-2',
      );

      expect(result.items.length).toBe(1);
      expect(result.meta.totalItems).toBe(1);
      expect(result.items[0].title).toBe('IELTS 8.0 Vocab');
      expect(result.items[0].author.username).toBe('sarah_teacher');
      expect(result.items[0].isOwner).toBe(false);
      expect(result.items[0].totalCards).toBe(50);
      expect(result.items[0].cloneCount).toBe(42);
    });

    it('should correctly flag isOwner = true if current user is the author', async () => {
      const mockDecks = [
        {
          id: 'deck-1',
          userId: 'user-1',
          title: 'My Public Deck',
          description: null,
          color: '#6366F1',
          icon: 'Book',
          coverImageUrl: null,
          category: 'General English',
          tags: null,
          cloneCount: 5,
          averageRating: 5.0,
          totalRatings: 1,
          createdAt: new Date('2026-08-01T00:00:00Z'),
          updatedAt: new Date('2026-08-01T00:00:00Z'),
          user: {
            id: 'user-1',
            username: 'me',
            avatarUrl: null,
          },
          _count: {
            cards: 10,
          },
        },
      ];

      mockPrismaService.deck.count.mockResolvedValue(1);
      mockPrismaService.deck.findMany.mockResolvedValue(mockDecks);

      const result = await service.getPublicDecks({}, 'user-1');
      expect(result.items[0].isOwner).toBe(true);
    });
  });

  describe('getPublicDeckDetail', () => {
    it('should throw NotFoundException if deck is not found or is private/archived', async () => {
      mockPrismaService.deck.findUnique.mockResolvedValue(null);

      await expect(
        service.getPublicDeckDetail('non-existent-id'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should return deck details with cards and user state if authenticated', async () => {
      const mockDeck = {
        id: 'deck-pub-1',
        userId: 'author-user',
        title: 'Business English 500',
        description: 'Corporate idioms',
        color: '#6366F1',
        icon: 'Briefcase',
        coverImageUrl: null,
        category: 'Business English',
        tags: '["business","office"]',
        isPublic: true,
        isArchived: false,
        cloneCount: 100,
        averageRating: 4.9,
        totalRatings: 30,
        createdAt: new Date('2026-08-01T00:00:00Z'),
        updatedAt: new Date('2026-08-01T00:00:00Z'),
        user: {
          id: 'author-user',
          username: 'business_pro',
          avatarUrl: null,
        },
        cards: [
          {
            id: 'card-1',
            word: 'Synergy',
            meaning: 'Hợp lực',
            phonetic: '/ˈsɪn.ə.dʒi/',
            audioUrl: null,
            exampleSentence: 'Great team synergy.',
            collocations: 'team synergy',
            mnemonic: null,
          },
        ],
        _count: {
          cards: 1,
        },
      };

      mockPrismaService.deck.findUnique.mockResolvedValue(mockDeck);
      mockPrismaService.deckRating.findUnique.mockResolvedValue({
        rating: 5,
        comment: 'Super useful!',
        createdAt: new Date('2026-08-10T00:00:00Z'),
      });
      mockPrismaService.deck.findFirst.mockResolvedValue({
        id: 'cloned-deck-id',
      });

      const result = await service.getPublicDeckDetail(
        'deck-pub-1',
        'learner-user',
      );

      expect(result.deck.title).toBe('Business English 500');
      expect(result.cards.length).toBe(1);
      expect(result.hasCloned).toBe(true);
      expect(result.userRating?.rating).toBe(5);
    });
  });

  describe('cloneDeck (BR-COMM-002, BR-COMM-003)', () => {
    it('should throw BadRequestException if author attempts to self-clone', async () => {
      mockPrismaService.deck.findUnique.mockResolvedValue({
        id: 'deck-1',
        userId: 'same-user-id',
        isPublic: true,
        isArchived: false,
        cards: [],
      });

      await expect(service.cloneDeck('same-user-id', 'deck-1')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw NotFoundException if target deck is private or archived', async () => {
      mockPrismaService.deck.findUnique.mockResolvedValue({
        id: 'deck-priv',
        userId: 'other-user',
        isPublic: false,
        isArchived: false,
        cards: [],
      });

      await expect(service.cloneDeck('learner-1', 'deck-priv')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should execute atomic deep copy of deck and cards and initialize SM-2 progress', async () => {
      const targetDeck = {
        id: 'source-deck-1',
        userId: 'author-user',
        title: 'Oxford 3000',
        description: 'Core 3000 vocabulary',
        color: '#10B981',
        icon: 'Book',
        coverImageUrl: null,
        category: 'General English',
        tags: '["oxford"]',
        isPublic: true,
        isArchived: false,
        cards: [
          {
            id: 'c-1',
            word: 'Abandon',
            meaning: 'Từ bỏ',
            phonetic: '/əˈbæn.dən/',
            audioUrl: null,
            exampleSentence: 'He abandoned his car.',
            collocations: null,
            mnemonic: null,
            imageUrl: null,
          },
        ],
      };

      mockPrismaService.deck.findUnique.mockResolvedValue(targetDeck);

      mockPrismaService.$transaction.mockImplementation(async (callback) => {
        const tx = {
          deck: {
            create: jest.fn().mockResolvedValue({
              id: 'cloned-deck-uuid',
              title: 'Oxford 3000 (Bản sao)',
            }),
            update: jest.fn().mockResolvedValue({}),
          },
          card: {
            create: jest.fn().mockResolvedValue({
              id: 'cloned-card-uuid',
            }),
          },
          userCardProgress: {
            create: jest.fn().mockResolvedValue({}),
          },
        };
        return callback(tx);
      });

      const result = await service.cloneDeck('learner-1', 'source-deck-1');

      expect(result.success).toBe(true);
      expect(result.clonedDeckId).toBe('cloned-deck-uuid');
      expect(result.totalCardsCloned).toBe(1);
    });
  });

  describe('rateDeck (BR-COMM-003, BR-COMM-004, BR-COMM-005)', () => {
    it('should throw ForbiddenException if author attempts to self-rate', async () => {
      mockPrismaService.deck.findUnique.mockResolvedValue({
        id: 'deck-1',
        userId: 'author-1',
        isPublic: true,
        isArchived: false,
      });

      await expect(
        service.rateDeck('author-1', 'deck-1', { rating: 5 }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should upsert rating and recalculate average atomically in transaction', async () => {
      mockPrismaService.deck.findUnique.mockResolvedValue({
        id: 'deck-1',
        userId: 'author-1',
        isPublic: true,
        isArchived: false,
      });

      mockPrismaService.$transaction.mockImplementation(async (callback) => {
        const tx = {
          deckRating: {
            upsert: jest.fn().mockResolvedValue({
              rating: 4,
              comment: 'Good explanations',
            }),
            findMany: jest
              .fn()
              .mockResolvedValue([{ rating: 5 }, { rating: 4 }]),
          },
          deck: {
            update: jest.fn().mockResolvedValue({}),
          },
        };
        return callback(tx);
      });

      const result = await service.rateDeck('learner-1', 'deck-1', {
        rating: 4,
        comment: 'Good explanations',
      });

      expect(result.success).toBe(true);
      expect(result.averageRating).toBe(4.5);
      expect(result.totalRatings).toBe(2);
      expect(result.userRating.rating).toBe(4);
    });
  });
});
