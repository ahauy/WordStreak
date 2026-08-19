import { Test, TestingModule } from '@nestjs/testing';
import { DecksController } from './decks.controller';
import { DecksService } from './decks.service';
import type { JwtPayload, DeckResponse } from '@wordstreak/shared-types';

describe('DecksController', () => {
  let controller: DecksController;

  const mockDecksService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    archive: jest.fn(),
    restore: jest.fn(),
    remove: jest.fn(),
  };

  const mockUser: JwtPayload = {
    sub: 'user-123',
    email: 'test@example.com',
    sessionId: 'session-123',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DecksController],
      providers: [
        {
          provide: DecksService,
          useValue: mockDecksService,
        },
      ],
    }).compile();

    controller = module.get<DecksController>(DecksController);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create (TC-011)', () => {
    it('should call decksService.create and return created deck', async () => {
      const dto = { title: 'New Deck', color: '#6366F1' };
      const expectedResponse: DeckResponse = {
        id: 'deck-1',
        userId: 'user-123',
        title: 'New Deck',
        description: null,
        color: '#6366F1',
        icon: 'Book',
        coverImageUrl: null,
        tags: null,
        isPublic: false,
        isArchived: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      mockDecksService.create.mockResolvedValue(expectedResponse);

      const result = await controller.create(mockUser, dto);

      expect(mockDecksService.create).toHaveBeenCalledWith('user-123', dto);
      expect(result).toEqual(expectedResponse);
    });
  });

  describe('findAll (TC-010)', () => {
    it('should call decksService.findAll with query parameters', async () => {
      const query = { status: 'active' as const, search: 'ielts' };
      mockDecksService.findAll.mockResolvedValue([]);

      const result = await controller.findAll(mockUser, query);

      expect(mockDecksService.findAll).toHaveBeenCalledWith('user-123', query);
      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('should call decksService.findOne', async () => {
      const deckId = 'deck-1';
      mockDecksService.findOne.mockResolvedValue({ id: deckId });

      const result = await controller.findOne(mockUser, deckId);

      expect(mockDecksService.findOne).toHaveBeenCalledWith('user-123', deckId);
      expect(result).toEqual({ id: deckId });
    });
  });

  describe('update', () => {
    it('should call decksService.update', async () => {
      const deckId = 'deck-1';
      const dto = { title: 'Updated Title' };
      mockDecksService.update.mockResolvedValue({ id: deckId, ...dto });

      const result = await controller.update(mockUser, deckId, dto);

      expect(mockDecksService.update).toHaveBeenCalledWith(
        'user-123',
        deckId,
        dto,
      );
      expect(result).toEqual({ id: deckId, ...dto });
    });
  });

  describe('archive and restore', () => {
    it('should call decksService.archive', async () => {
      const deckId = 'deck-1';
      mockDecksService.archive.mockResolvedValue({
        id: deckId,
        isArchived: true,
      });

      const result = await controller.archive(mockUser, deckId);

      expect(mockDecksService.archive).toHaveBeenCalledWith('user-123', deckId);
      expect(result.isArchived).toBe(true);
    });

    it('should call decksService.restore', async () => {
      const deckId = 'deck-1';
      mockDecksService.restore.mockResolvedValue({
        id: deckId,
        isArchived: false,
      });

      const result = await controller.restore(mockUser, deckId);

      expect(mockDecksService.restore).toHaveBeenCalledWith('user-123', deckId);
      expect(result.isArchived).toBe(false);
    });
  });

  describe('remove', () => {
    it('should call decksService.remove', async () => {
      const deckId = 'deck-1';
      mockDecksService.remove.mockResolvedValue({
        message: 'Bộ từ vựng đã được xóa vĩnh viễn thành công',
        deletedCardsCount: 10,
      });

      const result = await controller.remove(mockUser, deckId);

      expect(mockDecksService.remove).toHaveBeenCalledWith('user-123', deckId);
      expect(result.deletedCardsCount).toBe(10);
    });
  });
});
