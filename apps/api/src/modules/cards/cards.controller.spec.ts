/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { CardsController } from './cards.controller';
import { CardsService } from './cards.service';
import { CreateCardDto } from './dto/create-card.dto';
import { UpdateCardDto } from './dto/update-card.dto';
import type { JwtPayload, CardResponse } from '@wordstreak/shared-types';

describe('CardsController', () => {
  let controller: CardsController;
  let service: jest.Mocked<CardsService>;

  const mockUser: JwtPayload = {
    sub: 'user-uuid-123',
    email: 'learner@wordstreak.com',
    username: 'learner',
  };

  const mockDeckId = 'deck-uuid-456';
  const mockCardId = 'card-uuid-789';

  const mockCardResponse: CardResponse = {
    id: mockCardId,
    deckId: mockDeckId,
    word: 'resilient',
    meaning: 'kiên cường',
    phonetic: '/rɪˈzɪl.jənt/',
    audioUrl: null,
    exampleSentence: 'She is a resilient woman.',
    collocations: 'highly resilient',
    mnemonic: 'Re-silient -> phục hồi',
    imageUrl: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    progress: {
      status: 'NEW',
      interval: 0,
      easeFactor: 2.5,
      repetitions: 0,
      nextReviewDate: new Date().toISOString(),
      lastReviewedAt: null,
    },
  };

  beforeEach(async () => {
    const mockCardsService = {
      create: jest.fn(),
      findAllByDeck: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [CardsController],
      providers: [
        {
          provide: CardsService,
          useValue: mockCardsService,
        },
      ],
    }).compile();

    controller = module.get<CardsController>(CardsController);
    service = module.get(CardsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a card for a deck', async () => {
      const dto: CreateCardDto = {
        word: 'resilient',
        meaning: 'kiên cường',
        phonetic: '/rɪˈzɪl.jənt/',
      };

      service.create.mockResolvedValue(mockCardResponse);

      const result = await controller.create(mockUser, mockDeckId, dto);

      expect(service.create).toHaveBeenCalledWith(
        mockUser.sub,
        mockDeckId,
        dto,
      );
      expect(result).toEqual(mockCardResponse);
    });
  });

  describe('findAllByDeck', () => {
    it('should return all cards for a deck', async () => {
      service.findAllByDeck.mockResolvedValue([mockCardResponse]);

      const result = await controller.findAllByDeck(mockUser, mockDeckId);

      expect(service.findAllByDeck).toHaveBeenCalledWith(
        mockUser.sub,
        mockDeckId,
      );
      expect(result).toEqual([mockCardResponse]);
    });
  });

  describe('findOne', () => {
    it('should return a single card by id', async () => {
      service.findOne.mockResolvedValue(mockCardResponse);

      const result = await controller.findOne(mockUser, mockCardId);

      expect(service.findOne).toHaveBeenCalledWith(mockUser.sub, mockCardId);
      expect(result).toEqual(mockCardResponse);
    });
  });

  describe('update', () => {
    it('should update card metadata', async () => {
      const dto: UpdateCardDto = { meaning: 'phục hồi nhanh' };
      const updatedCard = { ...mockCardResponse, meaning: 'phục hồi nhanh' };

      service.update.mockResolvedValue(updatedCard);

      const result = await controller.update(mockUser, mockCardId, dto);

      expect(service.update).toHaveBeenCalledWith(
        mockUser.sub,
        mockCardId,
        dto,
      );
      expect(result.meaning).toBe('phục hồi nhanh');
    });
  });

  describe('remove', () => {
    it('should delete a card', async () => {
      service.remove.mockResolvedValue({
        message: 'Thẻ từ vựng đã được xóa thành công',
        deletedCardId: mockCardId,
      });

      const result = await controller.remove(mockUser, mockCardId);

      expect(service.remove).toHaveBeenCalledWith(mockUser.sub, mockCardId);
      expect(result.deletedCardId).toBe(mockCardId);
    });
  });
});
