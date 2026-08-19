import { Test, TestingModule } from '@nestjs/testing';
import { CardsService } from './cards.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { CreateCardDto } from './dto/create-card.dto';

describe('CardsService', () => {
  let service: CardsService;
  let prisma: {
    deck: {
      findUnique: jest.Mock;
    };
    card: {
      create: jest.Mock;
      findMany: jest.Mock;
      findUnique: jest.Mock;
      update: jest.Mock;
      delete: jest.Mock;
    };
    userCardProgress: {
      create: jest.Mock;
    };
    $transaction: jest.Mock;
  };

  const mockUserId = 'user-uuid-123';
  const mockDeckId = 'deck-uuid-456';
  const mockCardId = 'card-uuid-789';

  beforeEach(async () => {
    prisma = {
      deck: {
        findUnique: jest.fn(),
      },
      card: {
        create: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
      userCardProgress: {
        create: jest.fn(),
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

      prisma.$transaction.mockImplementation(async (callback) => {
        return callback({
          card: {
            create: jest.fn().mockResolvedValue(createdCard),
          },
          userCardProgress: {
            create: jest.fn().mockResolvedValue(initialProgress),
          },
        });
      });

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

  describe('findAllByDeck', () => {
    it('should return all cards in a deck with progress', async () => {
      prisma.deck.findUnique.mockResolvedValue({
        id: mockDeckId,
        userId: mockUserId,
        isPublic: false,
      });

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

      const result = await service.findAllByDeck(mockUserId, mockDeckId);

      expect(result).toHaveLength(1);
      expect(result[0].word).toBe('ubiquitous');
      expect(result[0].progress?.status).toBe('NEW');
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
});
