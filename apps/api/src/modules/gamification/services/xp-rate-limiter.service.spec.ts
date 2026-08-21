/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { Test, TestingModule } from '@nestjs/testing';
import {
  XpRateLimiterService,
  HOURLY_XP_CAP,
  DAILY_XP_CAP,
} from './xp-rate-limiter.service';
import { PrismaService } from '../../prisma/prisma.service';

describe('XpRateLimiterService', () => {
  let service: XpRateLimiterService;
  let prisma: {
    userActivityLog: {
      findMany: jest.Mock;
    };
  };

  beforeEach(async () => {
    prisma = {
      userActivityLog: {
        findMany: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        XpRateLimiterService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<XpRateLimiterService>(XpRateLimiterService);
  });

  afterEach(() => {
    service.resetCache();
    jest.clearAllMocks();
  });

  describe('checkRateLimit with DB warming', () => {
    it('should warm cache from DB and allow when under limits', async () => {
      const now = new Date();
      prisma.userActivityLog.findMany.mockResolvedValueOnce([
        { createdAt: new Date(now.getTime() - 10 * 60 * 1000), xpEarned: 100 },
        {
          createdAt: new Date(now.getTime() - 2 * 60 * 60 * 1000),
          xpEarned: 200,
        },
      ]);

      const result = await service.checkRateLimit('user-1', 10);
      expect(result.isAllowed).toBe(true);
      expect(result.hourlyXp).toBe(100);
      expect(result.dailyXp).toBe(300);
      expect(prisma.userActivityLog.findMany).toHaveBeenCalledTimes(1);

      // Subsequent check should use warmed in-memory cache without hitting DB
      const secondResult = await service.checkRateLimit('user-1', 10);
      expect(secondResult.isAllowed).toBe(true);
      expect(prisma.userActivityLog.findMany).toHaveBeenCalledTimes(1);
    });

    it('should disallow when DB reports hourly cap exceeded', async () => {
      const now = new Date();
      prisma.userActivityLog.findMany.mockResolvedValueOnce([
        {
          createdAt: new Date(now.getTime() - 5 * 60 * 1000),
          xpEarned: HOURLY_XP_CAP,
        },
      ]);

      const result = await service.checkRateLimit('user-1', 10);
      expect(result.isAllowed).toBe(false);
      expect(result.hourlyXp).toBe(HOURLY_XP_CAP);
    });

    it('should disallow when DB reports daily cap exceeded', async () => {
      const now = new Date();
      prisma.userActivityLog.findMany.mockResolvedValueOnce([
        { createdAt: new Date(now.getTime() - 30 * 60 * 1000), xpEarned: 100 },
        {
          createdAt: new Date(now.getTime() - 3 * 60 * 60 * 1000),
          xpEarned: DAILY_XP_CAP - 100,
        },
      ]);

      const result = await service.checkRateLimit('user-1', 10);
      expect(result.isAllowed).toBe(false);
      expect(result.dailyXp).toBe(DAILY_XP_CAP);
    });
  });

  describe('in-memory sliding window cache', () => {
    it('should track recorded XP in-memory without querying DB on subsequent checks', async () => {
      service.recordReviewXp('user-1', 100);
      service.recordReviewXp('user-1', 200);

      const result = await service.checkRateLimit('user-1', 10);
      expect(result.isAllowed).toBe(true);
      expect(result.hourlyXp).toBe(300);
      expect(result.dailyXp).toBe(300);
      expect(prisma.userActivityLog.findMany).not.toHaveBeenCalled();
    });

    it('should block prospective XP that breaches hourly limit', async () => {
      service.recordReviewXp('user-1', 495);

      const result = await service.checkRateLimit('user-1', 10);
      expect(result.isAllowed).toBe(false);
      expect(result.hourlyXp).toBe(495);
    });

    it('should ignore 0 or negative XP in recordReviewXp', async () => {
      service.recordReviewXp('user-1', 0);
      service.recordReviewXp('user-1', -10);

      prisma.userActivityLog.findMany.mockResolvedValueOnce([]);

      const result = await service.checkRateLimit('user-1');
      expect(result.hourlyXp).toBe(0);
      expect(prisma.userActivityLog.findMany).toHaveBeenCalledTimes(1);
    });
  });
});
