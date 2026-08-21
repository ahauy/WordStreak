/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { StreakController } from './streak.controller';
import { StreakService } from './streak.service';
import type {
  JwtPayload,
  UserStreakDto,
  StreakActivityResponseDto,
} from '@wordstreak/shared-types';

describe('StreakController', () => {
  let controller: StreakController;
  let service: jest.Mocked<StreakService>;

  const mockUser: JwtPayload = {
    sub: 'user-uuid-streak-1',
    email: 'streakuser@example.com',
    sessionId: 'sess-streak-1',
  };

  beforeEach(async () => {
    const mockStreakService = {
      getStreak: jest.fn(),
      recordActivity: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [StreakController],
      providers: [
        {
          provide: StreakService,
          useValue: mockStreakService,
        },
      ],
    }).compile();

    controller = module.get<StreakController>(StreakController);
    service = module.get(StreakService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getMyStreak', () => {
    it('returns user streak information with header timezone prioritized', async () => {
      const mockResult: UserStreakDto = {
        userId: mockUser.sub,
        currentStreak: 5,
        bestStreak: 10,
        lastActiveDate: '2026-08-20T10:00:00.000Z',
        isActiveToday: true,
        isPendingToday: false,
        timezone: 'Asia/Tokyo',
        flameTier: 1,
        streakFreezes: 0,
        maxStreakFreezes: 2,
      };
      service.getStreak.mockResolvedValue(mockResult);

      const response = await controller.getMyStreak(
        mockUser,
        'Asia/Tokyo',
        'UTC',
      );

      expect(response.success).toBe(true);
      expect(response.data).toEqual(mockResult);
      expect(service.getStreak).toHaveBeenCalledWith(
        mockUser.sub,
        'Asia/Tokyo',
      );
    });

    it('falls back to query timezone when header is missing', async () => {
      const mockResult: UserStreakDto = {
        userId: mockUser.sub,
        currentStreak: 0,
        bestStreak: 0,
        lastActiveDate: null,
        isActiveToday: false,
        isPendingToday: false,
        timezone: 'America/New_York',
        flameTier: 1,
        streakFreezes: 0,
        maxStreakFreezes: 2,
      };
      service.getStreak.mockResolvedValue(mockResult);

      const response = await controller.getMyStreak(
        mockUser,
        undefined,
        'America/New_York',
      );

      expect(response.success).toBe(true);
      expect(response.data).toEqual(mockResult);
      expect(service.getStreak).toHaveBeenCalledWith(
        mockUser.sub,
        'America/New_York',
      );
    });
  });

  describe('recordActivity', () => {
    it('records study habit activity and returns streak result', async () => {
      const mockResponse: StreakActivityResponseDto = {
        currentStreak: 6,
        bestStreak: 10,
        streakIncreased: true,
        isActiveToday: true,
        flameTier: 1,
        message: 'Streak increased! Great job!',
        streakFreezes: 0,
      };
      service.recordActivity.mockResolvedValue(mockResponse);

      const response = await controller.recordActivity(
        mockUser,
        { timezone: 'Asia/Ho_Chi_Minh' },
        undefined,
      );

      expect(response.success).toBe(true);
      expect(response.data).toEqual(mockResponse);
      expect(response.message).toBe('Streak increased! Great job!');
      expect(service.recordActivity).toHaveBeenCalledWith(mockUser.sub, {
        timezone: 'Asia/Ho_Chi_Minh',
      });
    });

    it('uses header timezone if body timezone is omitted', async () => {
      const mockResponse: StreakActivityResponseDto = {
        currentStreak: 1,
        bestStreak: 1,
        streakIncreased: true,
        isActiveToday: true,
        flameTier: 1,
        message: 'New streak started!',
        streakFreezes: 0,
      };
      service.recordActivity.mockResolvedValue(mockResponse);

      const response = await controller.recordActivity(
        mockUser,
        {},
        'Europe/London',
      );

      expect(response.success).toBe(true);
      expect(service.recordActivity).toHaveBeenCalledWith(mockUser.sub, {
        timezone: 'Europe/London',
      });
    });
  });
});
