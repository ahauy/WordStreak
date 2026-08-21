/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Test, TestingModule } from '@nestjs/testing';
import { CommunityController } from './community.controller';
import { CommunityService } from './community.service';
import type { JwtPayload } from '@wordstreak/shared-types';

describe('CommunityController', () => {
  let controller: CommunityController;

  const mockCommunityService = {
    getPublicDecks: jest.fn(),
    getPublicDeckDetail: jest.fn(),
    cloneDeck: jest.fn(),
    rateDeck: jest.fn(),
  };

  const mockUser: JwtPayload = {
    sub: 'user-123',
    email: 'user@wordstreak.com',
    username: 'testuser',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CommunityController],
      providers: [
        {
          provide: CommunityService,
          useValue: mockCommunityService,
        },
      ],
    }).compile();

    controller = module.get<CommunityController>(CommunityController);
    jest.clearAllMocks();
  });

  it('should call getPublicDecks with query and userId', async () => {
    mockCommunityService.getPublicDecks.mockResolvedValue({
      items: [],
      meta: {
        totalItems: 0,
        itemCount: 0,
        itemsPerPage: 12,
        totalPages: 1,
        currentPage: 1,
      },
    });

    const query = { page: 1, limit: 12, sort: 'POPULAR' as const };
    const result = await controller.getPublicDecks(query, mockUser);

    expect(mockCommunityService.getPublicDecks).toHaveBeenCalledWith(
      query,
      'user-123',
    );
    expect(result.items).toEqual([]);
  });

  it('should call getPublicDeckDetail with id and userId', async () => {
    mockCommunityService.getPublicDeckDetail.mockResolvedValue({
      deck: { id: 'd-1', title: 'Test Deck' },
      cards: [],
      userRating: null,
      hasCloned: false,
    });

    const result = await controller.getPublicDeckDetail('d-1', mockUser);
    expect(mockCommunityService.getPublicDeckDetail).toHaveBeenCalledWith(
      'd-1',
      'user-123',
    );
    expect(result.deck.title).toBe('Test Deck');
  });

  it('should call cloneDeck with current userId', async () => {
    mockCommunityService.cloneDeck.mockResolvedValue({
      success: true,
      clonedDeckId: 'new-deck-id',
      clonedDeckTitle: 'Test Deck (Bản sao)',
      totalCardsCloned: 10,
      message: 'Success',
    });

    const result = await controller.cloneDeck('d-1', mockUser);
    expect(mockCommunityService.cloneDeck).toHaveBeenCalledWith(
      'user-123',
      'd-1',
    );
    expect(result.success).toBe(true);
  });

  it('should call rateDeck with current userId and dto', async () => {
    mockCommunityService.rateDeck.mockResolvedValue({
      success: true,
      averageRating: 5.0,
      totalRatings: 1,
      userRating: { rating: 5, comment: 'Nice' },
      message: 'Success',
    });

    const dto = { rating: 5, comment: 'Nice' };
    const result = await controller.rateDeck('d-1', mockUser, dto);
    expect(mockCommunityService.rateDeck).toHaveBeenCalledWith(
      'user-123',
      'd-1',
      dto,
    );
    expect(result.success).toBe(true);
  });
});
