/* eslint-disable @typescript-eslint/unbound-method, @typescript-eslint/no-unsafe-assignment */
import { Test, TestingModule } from '@nestjs/testing';
import { LibraryController } from './library.controller';
import { LibraryService } from './library.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import type { JwtPayload } from '@wordstreak/shared-types';

describe('LibraryController', () => {
  let controller: LibraryController;
  let service: jest.Mocked<LibraryService>;

  const mockUser: JwtPayload = {
    sub: 'user-123',
    email: 'test@example.com',
    sessionId: 'sess-1',
  };

  beforeEach(async () => {
    const mockLibraryService = {
      getDecks: jest.fn(),
      getDeckBySlug: jest.fn(),
      enrollDeck: jest.fn(),
      forkCard: jest.fn(),
      triageDeckCards: jest.fn(),
      getToeicPathProgress: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [LibraryController],
      providers: [
        {
          provide: LibraryService,
          useValue: mockLibraryService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<LibraryController>(LibraryController);
    service = module.get(LibraryService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getDecks', () => {
    it('calls service.getDecks with user and query', async () => {
      const mockResult = {
        decks: [],
        total: 0,
        page: 1,
        limit: 20,
        totalPages: 1,
      };
      service.getDecks.mockResolvedValue(mockResult);

      const query = { pathCode: 'tsl', page: 1, limit: 20 };
      const res = await controller.getDecks(mockUser, query);

      expect(service.getDecks).toHaveBeenCalledWith(mockUser.sub, query);
      expect(res).toEqual(mockResult);
    });
  });

  describe('getDeckBySlug', () => {
    it('calls service.getDeckBySlug with slug and user sub', async () => {
      const mockResult = {
        deck: { id: 'd1', slug: 'deck-1' } as any,
        cards: [],
        isEnrolled: false,
        masteredCount: 0,
        totalCards: 0,
      };
      service.getDeckBySlug.mockResolvedValue(mockResult);

      const res = await controller.getDeckBySlug(mockUser, 'deck-1');

      expect(service.getDeckBySlug).toHaveBeenCalledWith(
        mockUser.sub,
        'deck-1',
      );
      expect(res).toEqual(mockResult);
    });
  });

  describe('enrollDeck', () => {
    it('calls service.enrollDeck with user sub and deck id', async () => {
      const mockResult = {
        success: true,
        deckId: 'd1',
        enrolledAt: new Date(),
      };
      service.enrollDeck.mockResolvedValue(mockResult);

      const res = await controller.enrollDeck(mockUser, 'd1');

      expect(service.enrollDeck).toHaveBeenCalledWith(mockUser.sub, 'd1');
      expect(res).toEqual(mockResult);
    });
  });

  describe('forkCard', () => {
    it('calls service.forkCard with user sub, card id and dto', async () => {
      const mockResult = {
        cardId: 'c1',
        deckId: 'd1',
        word: 'test',
        meaning: 'nghĩa',
        status: 'NEW',
      };
      service.forkCard.mockResolvedValue(mockResult);

      const dto = { targetDeckId: 'd1' };
      const res = await controller.forkCard(mockUser, 'c1', dto);

      expect(service.forkCard).toHaveBeenCalledWith(mockUser.sub, 'c1', dto);
      expect(res).toEqual(mockResult);
    });
  });

  describe('triageDeckCards', () => {
    it('calls service.triageDeckCards with user sub, deck id and dto', async () => {
      const mockResult = {
        success: true,
        deckId: 'd1',
        knownCount: 2,
        unknownCount: 3,
        totalTriaged: 5,
      };
      service.triageDeckCards.mockResolvedValue(mockResult);

      const dto = {
        items: [
          { cardId: 'c1', isKnown: true },
          { cardId: 'c2', isKnown: false },
        ],
      };
      const res = await controller.triageDeckCards(mockUser, 'd1', dto);

      expect(service.triageDeckCards).toHaveBeenCalledWith(
        mockUser.sub,
        'd1',
        dto,
      );
      expect(res).toEqual(mockResult);
    });
  });

  describe('getToeicPathProgress', () => {
    it('calls service.getToeicPathProgress with user sub', async () => {
      const mockResult = {
        coveragePercent: 88.5,
        ngslCoveragePercent: 85.0,
        tslCoveragePercent: 3.5,
        maxEstimatedCoverage: 98.5,
        totalDecks: 48,
        completedDecks: 12,
        totalWords: 1200,
        masteredWords: 300,
        knownSkippedWords: 50,
        estimatedDaysRemaining: 85,
        dailyGoal: 10,
        levels: [],
      };
      service.getToeicPathProgress.mockResolvedValue(mockResult);

      const res = await controller.getToeicPathProgress(mockUser);

      expect(service.getToeicPathProgress).toHaveBeenCalledWith(mockUser.sub);
      expect(res).toEqual(mockResult);
    });
  });
});
