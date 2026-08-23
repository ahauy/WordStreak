import { Test, TestingModule } from '@nestjs/testing';
import { CardsService } from './cards.service';
import { PrismaService } from '../prisma/prisma.service';
import {
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { CreateCardDto } from './dto/create-card.dto';
import { QueryCardsDto } from './dto/query-cards.dto';
import { BulkCardActionDto } from './dto/bulk-card-action.dto';

describe('CardsService', () => {
  let service: CardsService;
  let prisma: {
    deck: {
      findUnique: jest.Mock;
      findFirst: jest.Mock;
      create: jest.Mock;
    };
    card: {
      create: jest.Mock;
      findMany: jest.Mock;
      findUnique: jest.Mock;
      findFirst: jest.Mock;
      update: jest.Mock;
      delete: jest.Mock;
      deleteMany: jest.Mock;
      updateMany: jest.Mock;
      count: jest.Mock;
    };
    userCardProgress: {
      create: jest.Mock;
      deleteMany: jest.Mock;
      updateMany: jest.Mock;
    };
    $transaction: jest.Mock;
  };

  const mockUserId = 'user-uuid-123';
  const mockDeckId = 'deck-uuid-456';
  const mockTargetDeckId = 'deck-uuid-999';
  const mockCardId = 'card-uuid-789';
  const mockCardId2 = 'card-uuid-790';

  beforeEach(async () => {
    prisma = {
      deck: {
        findUnique: jest.fn(),
        findFirst: jest.fn(),
        create: jest.fn(),
      },
      card: {
        create: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        findFirst: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        deleteMany: jest.fn(),
        updateMany: jest.fn(),
        count: jest.fn(),
      },
      userCardProgress: {
        create: jest.fn(),
        deleteMany: jest.fn(),
        updateMany: jest.fn(),
      },
      $transaction: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CardsService,
        {
          provide: PrismaService,
          useValue: prisma,
        },
      ],
    }).compile();

    service = module.get<CardsService>(CardsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createCard', () => {
    const createDto: CreateCardDto = {
      word: 'resilient',
      meaning: 'kiên cường',
      phonetic: '/rɪˈzɪl.jənt/',
      exampleSentence: 'She is a resilient woman.',
      collocations: 'highly resilient',
      mnemonic: 'Re-silient -> bật dậy trở lại',
    };

    it('should successfully create a card and initialize UserCardProgress in NEW state', async () => {
      prisma.deck.findUnique.mockResolvedValue({
        id: mockDeckId,
        userId: mockUserId,
        title: 'IELTS Vocabulary',
      });

      const createdCard = {
        id: mockCardId,
        deckId: mockDeckId,
        word: createDto.word,
        meaning: createDto.meaning,
        phonetic: createDto.phonetic,
        audioUrl: null,
        exampleSentence: createDto.exampleSentence,
        collocations: createDto.collocations,
        mnemonic: createDto.mnemonic,
        imageUrl: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const initialProgress = {
        id: 'progress-123',
        userId: mockUserId,
        cardId: mockCardId,
        status: 'NEW',
        interval: 0,
        easeFactor: 2.5,
        repetitions: 0,
        nextReviewDate: new Date(),
        lastReviewedAt: null,
      };

      prisma.$transaction.mockImplementation(
        (callback: (tx: any) => Promise<any>) =>
          callback({
            card: {
              create: jest.fn().mockResolvedValue(createdCard),
            },
            userCardProgress: {
              create: jest.fn().mockResolvedValue(initialProgress),
            },
          }),
      );

      const result = await service.create(mockUserId, mockDeckId, createDto);

      expect(prisma.deck.findUnique).toHaveBeenCalledWith({
        where: { id: mockDeckId },
      });
      expect(result.id).toBe(mockCardId);
      expect(result.word).toBe('resilient');
      expect(result.progress?.status).toBe('NEW');
    });

    it('should throw NotFoundException if deck does not exist', async () => {
      prisma.deck.findUnique.mockResolvedValue(null);

      await expect(
        service.create(mockUserId, 'invalid-deck', createDto),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if deck is not owned by user', async () => {
      prisma.deck.findUnique.mockResolvedValue({
        id: mockDeckId,
        userId: 'other-user-uuid',
      });

      await expect(
        service.create(mockUserId, mockDeckId, createDto),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('findAllByDeck (Paginated & Filtered)', () => {
    it('should return paginated cards and metadata with default params', async () => {
      prisma.deck.findUnique.mockResolvedValue({
        id: mockDeckId,
        userId: mockUserId,
        isPublic: false,
      });

      prisma.card.count.mockResolvedValue(25);
      prisma.card.findMany.mockResolvedValue([
        {
          id: mockCardId,
          deckId: mockDeckId,
          word: 'ubiquitous',
          meaning: 'phổ biến khắp nơi',
          phonetic: '/juːˈbɪk.wə.təs/',
          audioUrl: null,
          exampleSentence: null,
          collocations: null,
          mnemonic: null,
          imageUrl: null,
          createdAt: new Date(),
          updatedAt: new Date(),
          progress: [
            {
              status: 'NEW',
              interval: 0,
              easeFactor: 2.5,
              repetitions: 0,
              nextReviewDate: new Date(),
              lastReviewedAt: null,
            },
          ],
        },
      ]);

      const query: QueryCardsDto = { page: 1, limit: 20 };
      const result = await service.findAllByDeck(mockUserId, mockDeckId, query);

      expect(result.data).toHaveLength(1);
      expect(result.meta.total).toBe(25);
      expect(result.meta.page).toBe(1);
      expect(result.meta.limit).toBe(20);
      expect(result.meta.totalPages).toBe(2);
      expect(result.meta.hasNextPage).toBe(true);
      expect(result.meta.hasPrevPage).toBe(false);
    });

    it('should apply search filter and status filter correctly', async () => {
      prisma.deck.findUnique.mockResolvedValue({
        id: mockDeckId,
        userId: mockUserId,
        isPublic: false,
      });

      prisma.card.count.mockResolvedValue(1);
      prisma.card.findMany.mockResolvedValue([]);

      const query: QueryCardsDto = {
        page: 1,
        limit: 10,
        search: 'serendipity',
        status: 'LEARNING',
      };

      await service.findAllByDeck(mockUserId, mockDeckId, query);

      expect(prisma.card.findMany).toHaveBeenCalled();
      expect(prisma.card.count).toHaveBeenCalled();
    });
  });

  describe('bulkAction', () => {
    it('should bulk delete cards inside a transaction', async () => {
      prisma.deck.findUnique.mockResolvedValue({
        id: mockDeckId,
        userId: mockUserId,
      });

      prisma.card.findMany.mockResolvedValue([
        { id: mockCardId, deckId: mockDeckId },
        { id: mockCardId2, deckId: mockDeckId },
      ]);

      const deleteManyCardsMock = jest.fn().mockResolvedValue({ count: 2 });
      prisma.$transaction.mockImplementation(
        (callback: (tx: any) => Promise<any>) =>
          callback({
            card: {
              deleteMany: deleteManyCardsMock,
            },
          }),
      );

      const dto: BulkCardActionDto = {
        action: 'DELETE',
        cardIds: [mockCardId, mockCardId2],
      };

      const result = await service.bulkAction(mockUserId, mockDeckId, dto);

      expect(result.success).toBe(true);
      expect(result.action).toBe('DELETE');
      expect(result.affectedCount).toBe(2);
    });

    it('should bulk move cards to target deck owned by the user', async () => {
      prisma.deck.findUnique
        .mockResolvedValueOnce({ id: mockDeckId, userId: mockUserId })
        .mockResolvedValueOnce({ id: mockTargetDeckId, userId: mockUserId });

      prisma.card.findMany.mockResolvedValue([
        { id: mockCardId, deckId: mockDeckId },
      ]);

      const updateManyCardsMock = jest.fn().mockResolvedValue({ count: 1 });
      prisma.$transaction.mockImplementation(
        (callback: (tx: any) => Promise<any>) =>
          callback({
            card: {
              updateMany: updateManyCardsMock,
            },
          }),
      );

      const dto: BulkCardActionDto = {
        action: 'MOVE',
        cardIds: [mockCardId],
        targetDeckId: mockTargetDeckId,
      };

      const result = await service.bulkAction(mockUserId, mockDeckId, dto);

      expect(result.success).toBe(true);
      expect(result.action).toBe('MOVE');
      expect(result.affectedCount).toBe(1);
    });

    it('should throw BadRequestException if MOVE is missing targetDeckId', async () => {
      prisma.deck.findUnique.mockResolvedValue({
        id: mockDeckId,
        userId: mockUserId,
      });

      const dto: BulkCardActionDto = {
        action: 'MOVE',
        cardIds: [mockCardId],
      };

      await expect(
        service.bulkAction(mockUserId, mockDeckId, dto),
      ).rejects.toThrow(BadRequestException);
    });

    it('should bulk reset progress of selected cards', async () => {
      prisma.deck.findUnique.mockResolvedValue({
        id: mockDeckId,
        userId: mockUserId,
      });

      prisma.card.findMany.mockResolvedValue([
        { id: mockCardId, deckId: mockDeckId },
      ]);

      const updateManyProgressMock = jest.fn().mockResolvedValue({ count: 1 });
      prisma.$transaction.mockImplementation(
        (callback: (tx: any) => Promise<any>) =>
          callback({
            userCardProgress: {
              updateMany: updateManyProgressMock,
            },
          }),
      );

      const dto: BulkCardActionDto = {
        action: 'RESET_PROGRESS',
        cardIds: [mockCardId],
      };

      const result = await service.bulkAction(mockUserId, mockDeckId, dto);

      expect(result.success).toBe(true);
      expect(result.action).toBe('RESET_PROGRESS');
      expect(result.affectedCount).toBe(1);
    });
  });

  describe('remove', () => {
    it('should delete card if user owns the deck', async () => {
      prisma.card.findUnique.mockResolvedValue({
        id: mockCardId,
        deckId: mockDeckId,
        deck: {
          id: mockDeckId,
          userId: mockUserId,
        },
      });
      prisma.card.delete.mockResolvedValue({ id: mockCardId });

      const result = await service.remove(mockUserId, mockCardId);

      expect(prisma.card.delete).toHaveBeenCalledWith({
        where: { id: mockCardId },
      });
      expect(result.message).toBeDefined();
    });

    it('should throw ForbiddenException if user does not own deck of the card', async () => {
      prisma.card.findUnique.mockResolvedValue({
        id: mockCardId,
        deckId: mockDeckId,
        deck: {
          id: mockDeckId,
          userId: 'other-user',
        },
      });

      await expect(service.remove(mockUserId, mockCardId)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('quickCapture', () => {
    it('TC-EXT-001: should create new card with SM-2 NEW progress and auto-fill if not duplicate', async () => {
      prisma.deck.findUnique.mockResolvedValue({
        id: mockDeckId,
        title: 'IELTS Vocabulary',
        userId: mockUserId,
      });
      prisma.card.findFirst.mockResolvedValue(null);

      const mockCreatedCard = {
        id: 'new-card-123',
        deckId: mockDeckId,
        word: 'ubiquitous',
        meaning: 'phổ biến khắp nơi',
        phonetic: '/juːˈbɪk.wə.təs/',
        audioUrl: null,
        exampleSentence: 'Smartphones are ubiquitous in modern life.',
        collocations: null,
        mnemonic: null,
        imageUrl: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockProgress = {
        status: 'NEW',
        interval: 0,
        easeFactor: 2.5,
        repetitions: 0,
        nextReviewDate: new Date(),
        lastReviewedAt: null,
      };

      prisma.$transaction.mockImplementation(
        (callback: (tx: any) => Promise<any>) => {
          return callback({
            card: {
              create: jest.fn().mockResolvedValue(mockCreatedCard),
            },
            userCardProgress: {
              create: jest.fn().mockResolvedValue(mockProgress),
            },
          });
        },
      );

      const result = await service.quickCapture(mockUserId, {
        word: 'ubiquitous',
        deckId: mockDeckId,
        contextSentence: 'Smartphones are ubiquitous in modern life.',
        customDefinition: 'phổ biến khắp nơi',
      });

      expect(result.isDuplicate).toBe(false);
      expect(result.card.word).toBe('ubiquitous');
      expect(result.card.meaning).toBe('phổ biến khắp nơi');
      expect(result.card.progress?.status).toBe('NEW');
      expect(result.deck.id).toBe(mockDeckId);
    });

    it('TC-EXT-002: should detect duplicate word in target deck and return isDuplicate=true', async () => {
      prisma.deck.findUnique.mockResolvedValue({
        id: mockDeckId,
        title: 'IELTS Vocabulary',
        userId: mockUserId,
      });

      const existingCard = {
        id: 'existing-card-123',
        deckId: mockDeckId,
        word: 'ubiquitous',
        meaning: 'phổ biến',
        phonetic: null,
        audioUrl: null,
        exampleSentence: null,
        collocations: null,
        mnemonic: null,
        imageUrl: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        progress: [
          {
            status: 'LEARNING',
            interval: 1,
            easeFactor: 2.5,
            repetitions: 1,
            nextReviewDate: new Date(),
            lastReviewedAt: new Date(),
          },
        ],
      };

      prisma.card.findFirst.mockResolvedValue(existingCard);

      const result = await service.quickCapture(mockUserId, {
        word: 'Ubiquitous',
        deckId: mockDeckId,
      });

      expect(result.isDuplicate).toBe(true);
      expect(result.card.id).toBe('existing-card-123');
      expect(result.message).toContain('đã có trong bộ từ');
    });

    it('TC-EXT-003: should auto-create "Inbox / Thu thập Web" deck if user has no deck', async () => {
      prisma.deck.findFirst.mockResolvedValue(null);
      const autoCreatedDeck = {
        id: 'inbox-deck-999',
        title: 'Inbox / Thu thập Web',
        userId: mockUserId,
      };
      prisma.deck.create.mockResolvedValue(autoCreatedDeck);
      prisma.card.findFirst.mockResolvedValue(null);

      const mockCreatedCard = {
        id: 'new-card-999',
        deckId: 'inbox-deck-999',
        word: 'ephemeral',
        meaning: 'ephemeral',
        phonetic: null,
        audioUrl: null,
        exampleSentence: null,
        collocations: null,
        mnemonic: null,
        imageUrl: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockProgress = {
        status: 'NEW',
        interval: 0,
        easeFactor: 2.5,
        repetitions: 0,
        nextReviewDate: new Date(),
        lastReviewedAt: null,
      };

      prisma.$transaction.mockImplementation(
        (callback: (tx: any) => Promise<any>) => {
          return callback({
            card: {
              create: jest.fn().mockResolvedValue(mockCreatedCard),
            },
            userCardProgress: {
              create: jest.fn().mockResolvedValue(mockProgress),
            },
          });
        },
      );

      const result = await service.quickCapture(mockUserId, {
        word: 'ephemeral',
      });

      expect(prisma.deck.create).toHaveBeenCalled();
      expect(result.deck.title).toBe('Inbox / Thu thập Web');
      expect(result.isDuplicate).toBe(false);
    });
  });
});
