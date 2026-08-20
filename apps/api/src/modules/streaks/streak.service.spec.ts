import { Test, TestingModule } from '@nestjs/testing';
import { StreakService } from './streak.service';
import { PrismaService } from '../prisma/prisma.service';

describe('StreakService', () => {
  let service: StreakService;
  let prisma: {
    userStreak: {
      findFirst: jest.Mock;
      create: jest.Mock;
      update: jest.Mock;
    };
  };

  const mockUserId = 'user-uuid-streak-1';

  beforeEach(async () => {
    prisma = {
      userStreak: {
        findFirst: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StreakService,
        {
          provide: PrismaService,
          useValue: prisma,
        },
      ],
    }).compile();

    service = module.get<StreakService>(StreakService);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('formatDateInTimezone', () => {
    it('formats UTC date correctly into specific timezone', () => {
      // 2026-08-20T18:30:00Z is 2026-08-21 in Asia/Tokyo (+09:00) and 2026-08-20 in UTC
      const date = new Date('2026-08-20T18:30:00Z');
      expect(service.formatDateInTimezone(date, 'Asia/Tokyo')).toBe(
        '2026-08-21',
      );
      expect(service.formatDateInTimezone(date, 'UTC')).toBe('2026-08-20');
      expect(service.formatDateInTimezone(date, 'America/New_York')).toBe(
        '2026-08-20',
      );
    });

    it('falls back to UTC when given an invalid timezone', () => {
      const date = new Date('2026-08-20T12:00:00Z');
      expect(service.formatDateInTimezone(date, 'Invalid/Timezone_Name')).toBe(
        '2026-08-20',
      );
    });
  });

  describe('getStreak', () => {
    it('lazily creates user streak record if not existing', async () => {
      prisma.userStreak.findFirst.mockResolvedValue(null);
      prisma.userStreak.create.mockResolvedValue({
        id: 'streak-rec-1',
        userId: mockUserId,
        currentStreak: 0,
        bestStreak: 0,
        lastActiveDate: null,
      });

      const result = await service.getStreak(mockUserId, 'UTC');

      expect(prisma.userStreak.findFirst).toHaveBeenCalledWith({
        where: { userId: mockUserId },
      });
      expect(prisma.userStreak.create).toHaveBeenCalledWith({
        data: {
          userId: mockUserId,
          currentStreak: 0,
          bestStreak: 0,
          lastActiveDate: null,
        },
      });
      expect(result).toEqual({
        userId: mockUserId,
        currentStreak: 0,
        bestStreak: 0,
        lastActiveDate: null,
        isActiveToday: false,
        isPendingToday: false,
        timezone: 'UTC',
        flameTier: 1,
      });
    });

    it('returns isActiveToday = true when last active date is today in user timezone', async () => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2026-08-20T10:00:00Z'));

      prisma.userStreak.findFirst.mockResolvedValue({
        id: 'streak-rec-1',
        userId: mockUserId,
        currentStreak: 5,
        bestStreak: 10,
        lastActiveDate: new Date('2026-08-20T08:00:00Z'),
      });

      const result = await service.getStreak(mockUserId, 'UTC');

      expect(result.isActiveToday).toBe(true);
      expect(result.isPendingToday).toBe(false);
      expect(result.currentStreak).toBe(5);
      expect(result.flameTier).toBe(1);
    });

    it('returns isPendingToday = true when last active date was yesterday in user timezone', async () => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2026-08-20T10:00:00Z'));

      prisma.userStreak.findFirst.mockResolvedValue({
        id: 'streak-rec-1',
        userId: mockUserId,
        currentStreak: 8,
        bestStreak: 12,
        lastActiveDate: new Date('2026-08-19T15:00:00Z'),
      });

      const result = await service.getStreak(mockUserId, 'UTC');

      expect(result.isActiveToday).toBe(false);
      expect(result.isPendingToday).toBe(true);
      expect(result.currentStreak).toBe(8);
      expect(result.flameTier).toBe(2);
    });

    it('returns currentStreak = 0 lazily when streak is broken (>1 day gap), preserving bestStreak', async () => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2026-08-20T10:00:00Z'));

      prisma.userStreak.findFirst.mockResolvedValue({
        id: 'streak-rec-1',
        userId: mockUserId,
        currentStreak: 15,
        bestStreak: 20,
        lastActiveDate: new Date('2026-08-15T10:00:00Z'),
      });

      const result = await service.getStreak(mockUserId, 'UTC');

      expect(result.isActiveToday).toBe(false);
      expect(result.isPendingToday).toBe(false);
      expect(result.currentStreak).toBe(0);
      expect(result.bestStreak).toBe(20);
      expect(result.flameTier).toBe(1);
    });

    it('correctly calculates flame tiers: 1-6 => 1, 7-13 => 2, 14-29 => 3, 30+ => 4', async () => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2026-08-20T10:00:00Z'));

      // Tier 1 (streak 6)
      prisma.userStreak.findFirst.mockResolvedValue({
        id: 'rec-1',
        userId: mockUserId,
        currentStreak: 6,
        bestStreak: 6,
        lastActiveDate: new Date('2026-08-20T01:00:00Z'),
      });
      expect((await service.getStreak(mockUserId, 'UTC')).flameTier).toBe(1);

      // Tier 2 (streak 7)
      prisma.userStreak.findFirst.mockResolvedValue({
        id: 'rec-2',
        userId: mockUserId,
        currentStreak: 7,
        bestStreak: 7,
        lastActiveDate: new Date('2026-08-20T01:00:00Z'),
      });
      expect((await service.getStreak(mockUserId, 'UTC')).flameTier).toBe(2);

      // Tier 3 (streak 14)
      prisma.userStreak.findFirst.mockResolvedValue({
        id: 'rec-3',
        userId: mockUserId,
        currentStreak: 14,
        bestStreak: 14,
        lastActiveDate: new Date('2026-08-20T01:00:00Z'),
      });
      expect((await service.getStreak(mockUserId, 'UTC')).flameTier).toBe(3);

      // Tier 4 (streak 30)
      prisma.userStreak.findFirst.mockResolvedValue({
        id: 'rec-4',
        userId: mockUserId,
        currentStreak: 30,
        bestStreak: 30,
        lastActiveDate: new Date('2026-08-20T01:00:00Z'),
      });
      expect((await service.getStreak(mockUserId, 'UTC')).flameTier).toBe(4);
    });
  });

  describe('recordActivity', () => {
    it('initializes streak to 1 when user has no prior activity', async () => {
      const now = new Date('2026-08-20T12:00:00Z');
      jest.useFakeTimers();
      jest.setSystemTime(now);

      prisma.userStreak.findFirst.mockResolvedValue(null);
      prisma.userStreak.create.mockResolvedValue({
        id: 'rec-new',
        userId: mockUserId,
        currentStreak: 1,
        bestStreak: 1,
        lastActiveDate: now,
      });

      const response = await service.recordActivity(mockUserId, {
        timezone: 'UTC',
      });

      expect(prisma.userStreak.create).toHaveBeenCalledWith({
        data: {
          userId: mockUserId,
          currentStreak: 1,
          bestStreak: 1,
          lastActiveDate: now,
        },
      });
      expect(response).toEqual({
        currentStreak: 1,
        bestStreak: 1,
        streakIncreased: true,
        isActiveToday: true,
        flameTier: 1,
        message: 'New streak started!',
      });
    });

    it('performs idempotent no-op when user already active today in local timezone', async () => {
      const now = new Date('2026-08-20T15:00:00Z');
      jest.useFakeTimers();
      jest.setSystemTime(now);

      prisma.userStreak.findFirst.mockResolvedValue({
        id: 'rec-existing',
        userId: mockUserId,
        currentStreak: 5,
        bestStreak: 10,
        lastActiveDate: new Date('2026-08-20T08:00:00Z'),
      });

      const response = await service.recordActivity(mockUserId, {
        timezone: 'UTC',
      });

      expect(prisma.userStreak.update).not.toHaveBeenCalled();
      expect(response).toEqual({
        currentStreak: 5,
        bestStreak: 10,
        streakIncreased: false,
        isActiveToday: true,
        flameTier: 1,
        message: 'Streak already maintained for today',
      });
    });

    it('increments streak on consecutive day activity (yesterday -> today)', async () => {
      const now = new Date('2026-08-20T09:00:00Z');
      jest.useFakeTimers();
      jest.setSystemTime(now);

      prisma.userStreak.findFirst.mockResolvedValue({
        id: 'rec-consecutive',
        userId: mockUserId,
        currentStreak: 6,
        bestStreak: 6,
        lastActiveDate: new Date('2026-08-19T20:00:00Z'),
      });

      prisma.userStreak.update.mockResolvedValue({
        id: 'rec-consecutive',
        userId: mockUserId,
        currentStreak: 7,
        bestStreak: 7,
        lastActiveDate: now,
      });

      const response = await service.recordActivity(mockUserId, {
        timezone: 'UTC',
      });

      expect(prisma.userStreak.update).toHaveBeenCalledWith({
        where: { id: 'rec-consecutive' },
        data: {
          currentStreak: 7,
          bestStreak: 7,
          lastActiveDate: now,
        },
      });
      expect(response).toEqual({
        currentStreak: 7,
        bestStreak: 7,
        streakIncreased: true,
        isActiveToday: true,
        flameTier: 2,
        message: 'Streak increased! Great job!',
      });
    });

    it('resets streak to 1 after missing a day (>1 day gap), while preserving bestStreak', async () => {
      const now = new Date('2026-08-20T09:00:00Z');
      jest.useFakeTimers();
      jest.setSystemTime(now);

      prisma.userStreak.findFirst.mockResolvedValue({
        id: 'rec-broken',
        userId: mockUserId,
        currentStreak: 15,
        bestStreak: 25,
        lastActiveDate: new Date('2026-08-17T10:00:00Z'),
      });

      prisma.userStreak.update.mockResolvedValue({
        id: 'rec-broken',
        userId: mockUserId,
        currentStreak: 1,
        bestStreak: 25,
        lastActiveDate: now,
      });

      const response = await service.recordActivity(mockUserId, {
        timezone: 'UTC',
      });

      expect(prisma.userStreak.update).toHaveBeenCalledWith({
        where: { id: 'rec-broken' },
        data: {
          currentStreak: 1,
          bestStreak: 25,
          lastActiveDate: now,
        },
      });
      expect(response).toEqual({
        currentStreak: 1,
        bestStreak: 25,
        streakIncreased: true,
        isActiveToday: true,
        flameTier: 1,
        message: 'New streak started!',
      });
    });

    it('handles midnight rollover across timezones correctly', async () => {
      // 2026-08-20 15:30:00 UTC is 2026-08-21 00:30:00 in Asia/Tokyo (+09:00)
      const nowTokyoMorning = new Date('2026-08-20T15:30:00Z');
      jest.useFakeTimers();
      jest.setSystemTime(nowTokyoMorning);

      // Last active on 2026-08-20 12:00:00 UTC, which was 2026-08-20 21:00:00 in Asia/Tokyo (yesterday in Tokyo)
      prisma.userStreak.findFirst.mockResolvedValue({
        id: 'rec-tokyo',
        userId: mockUserId,
        currentStreak: 3,
        bestStreak: 5,
        lastActiveDate: new Date('2026-08-20T12:00:00Z'),
      });

      prisma.userStreak.update.mockResolvedValue({
        id: 'rec-tokyo',
        userId: mockUserId,
        currentStreak: 4,
        bestStreak: 5,
        lastActiveDate: nowTokyoMorning,
      });

      const response = await service.recordActivity(mockUserId, {
        timezone: 'Asia/Tokyo',
      });

      expect(prisma.userStreak.update).toHaveBeenCalledWith({
        where: { id: 'rec-tokyo' },
        data: {
          currentStreak: 4,
          bestStreak: 5,
          lastActiveDate: nowTokyoMorning,
        },
      });
      expect(response.streakIncreased).toBe(true);
      expect(response.currentStreak).toBe(4);
    });

    it('falls back to UTC when invalid timezone is provided', async () => {
      const now = new Date('2026-08-20T10:00:00Z');
      jest.useFakeTimers();
      jest.setSystemTime(now);

      prisma.userStreak.findFirst.mockResolvedValue({
        id: 'rec-tz-fallback',
        userId: mockUserId,
        currentStreak: 2,
        bestStreak: 2,
        lastActiveDate: new Date('2026-08-19T10:00:00Z'),
      });

      prisma.userStreak.update.mockResolvedValue({
        id: 'rec-tz-fallback',
        userId: mockUserId,
        currentStreak: 3,
        bestStreak: 3,
        lastActiveDate: now,
      });

      const response = await service.recordActivity(mockUserId, {
        timezone: 'Mars/Curiosity',
      });

      expect(response.streakIncreased).toBe(true);
      expect(response.currentStreak).toBe(3);
    });
  });
});
