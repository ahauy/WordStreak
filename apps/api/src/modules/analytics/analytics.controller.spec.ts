import { Test, TestingModule } from '@nestjs/testing';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsService } from './analytics.service';
import type { JwtPayload } from '@wordstreak/shared-types';

describe('AnalyticsController', () => {
  let controller: AnalyticsController;
  let service: {
    getOverview: jest.Mock;
    getMasterySummary: jest.Mock;
    getActivityHeatmap: jest.Mock;
    getDeckForecast: jest.Mock;
    getDecksProgress: jest.Mock;
  };

  const mockUser: JwtPayload = {
    sub: 'user-123',
    email: 'test@wordstreak.com',
    username: 'tester',
  };

  beforeEach(async () => {
    service = {
      getOverview: jest.fn().mockResolvedValue({
        masterySummary: { totalCards: 10 },
        retentionRate30Days: 85.0,
      }),
      getMasterySummary: jest.fn().mockResolvedValue({ totalCards: 10 }),
      getActivityHeatmap: jest
        .fn()
        .mockResolvedValue({ totalReviews: 50, days: [] }),
      getDeckForecast: jest
        .fn()
        .mockResolvedValue({ deckId: 'deck-1', isCompleted: false }),
      getDecksProgress: jest.fn().mockResolvedValue([]),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AnalyticsController],
      providers: [
        {
          provide: AnalyticsService,
          useValue: service,
        },
      ],
    }).compile();

    controller = module.get<AnalyticsController>(AnalyticsController);
  });

  it('TC-STAT-008: returns overview metrics wrapped in ApiResponse', async () => {
    const result = await controller.getOverview(mockUser);

    expect(result.success).toBe(true);
    expect(result.data).toBeDefined();
    expect(service.getOverview).toHaveBeenCalledWith('user-123');
  });

  it('calls getMasterySummary with deckId when provided', async () => {
    const result = await controller.getMasterySummary(mockUser, {
      deckId: 'deck-123',
    });

    expect(result.success).toBe(true);
    expect(service.getMasterySummary).toHaveBeenCalledWith(
      'user-123',
      'deck-123',
    );
  });

  it('calls getActivityHeatmap with timezone', async () => {
    const result = await controller.getActivityHeatmap(mockUser, {
      timezone: 'UTC',
    });

    expect(result.success).toBe(true);
    expect(service.getActivityHeatmap).toHaveBeenCalledWith('user-123', 'UTC');
  });

  it('calls getDeckForecast with param deckId', async () => {
    const result = await controller.getDeckForecast(mockUser, 'deck-abc');

    expect(result.success).toBe(true);
    expect(service.getDeckForecast).toHaveBeenCalledWith(
      'user-123',
      'deck-abc',
    );
  });

  it('calls getDecksProgress', async () => {
    const result = await controller.getDecksProgress(mockUser);

    expect(result.success).toBe(true);
    expect(service.getDecksProgress).toHaveBeenCalledWith('user-123');
  });
});
