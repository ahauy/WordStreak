import { Test, TestingModule } from '@nestjs/testing';
import { StreakService, calculateDayDelta } from './streak.service';
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
        findFirst: (jest.MockedFunction<any> = jest.fn()),
        create: (jest.MockedFunction<any> = jest.fn()),
        update: (jest.MockedFunction<any> = jest.fn()),
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

  describe('calculateDayDelta', () => {
    it('calculates 0 for same day', () => {
      expect(calculateDayDelta('2026-08-20', '2026-08-20')).toBe(0);
    });

    it('calculates 1 for consecutive day (yesterday)', () => {
      expect(calculateDayDelta('2026-08-19', '2026-08-20')).toBe(1);
    });

    it('calculates 2 for 1 missed day', () => {
      expect(calculateDayDelta('2026-08-18', '2026-08-20')).toBe(2);
    });

    it('calculates 3 for 2 missed days', () => {
      expect(calculateDayDelta('2026-08-17', '2026-08-20')).toBe(3);
    });
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
    it('lazily creates user streak record if not existing with 1 default freeze', async () => {
      prisma.userStreak.findFirst.mockResolvedValue(null);
      prisma.userStreak.create.mockResolvedValue({
        id: 'streak-rec-1',
        userId: mockUserId,
        currentStreak: 0,
        bestStreak: 0,
        lastActiveDate: null,
        streakFreezes: 1,
        totalFreezesUsed: 0,
        lastFreezeDate: null,
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
          streakFreezes: 1,
          totalFreezesUsed: 0,
          lastFreezeDate: null,
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
        streakFreezes: 1,
        maxStreakFreezes: 2,
        totalFreezesUsed: 0,
        lastFreezeDate: null,
        wasProtectedByFreeze: false,
        freezesUsed: 0,
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
        streakFreezes: 1,
        totalFreezesUsed: 0,
        lastFreezeDate: null,
      });

      const result = await service.getStreak(mockUserId, 'UTC');

      expect(result.isActiveToday).toBe(true);
      expect(result.isPendingToday).toBe(false);
      expect(result.currentStreak).toBe(5);
      expect(result.flameTier).toBe(1);
      expect(result.streakFreezes).toBe(1);
      expect(result.maxStreakFreezes).toBe(2);
      expect(result.wasProtectedByFreeze).toBe(false);
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
        streakFreezes: 1,
        totalFreezesUsed: 0,
        lastFreezeDate: null,
      });

      const result = await service.getStreak(mockUserId, 'UTC');

      expect(result.isActiveToday).toBe(false);
      expect(result.isPendingToday).toBe(true);
      expect(result.currentStreak).toBe(8);
      expect(result.flameTier).toBe(2);
      expect(result.streakFreezes).toBe(1);
      expect(result.wasProtectedByFreeze).toBe(false);
    });

    // TC-FREEZE-001: 1 missed day (delta_d = 2) with 1 freeze consumes 1 freeze, preserves current streak
    it('[TC-FREEZE-001] consumes 1 freeze, preserves current streak, and flags wasProtectedByFreeze = true on 1 missed day', async () => {
      const now = new Date('2026-08-20T10:00:00Z');
      jest.useFakeTimers();
      jest.setSystemTime(now);

      prisma.userStreak.findFirst.mockResolvedValue({
        id: 'streak-rec-1',
        userId: mockUserId,
        currentStreak: 5,
        bestStreak: 10,
        lastActiveDate: new Date('2026-08-18T10:00:00Z'),
        streakFreezes: 1,
        totalFreezesUsed: 0,
        lastFreezeDate: null,
      });

      prisma.userStreak.update.mockResolvedValue({
        id: 'streak-rec-1',
        userId: mockUserId,
        currentStreak: 5,
        bestStreak: 10,
        lastActiveDate: new Date(now.getTime() - 86400000),
        streakFreezes: 0,
        totalFreezesUsed: 1,
        lastFreezeDate: now,
      });

      const result = await service.getStreak(mockUserId, 'UTC');

      expect(prisma.userStreak.update).toHaveBeenCalledWith({
        where: { id: 'streak-rec-1' },
        data: {
          streakFreezes: 0,
          totalFreezesUsed: 1,
          lastFreezeDate: now,
          lastActiveDate: new Date(now.getTime() - 86400000),
        },
      });

      expect(result.currentStreak).toBe(5);
      expect(result.isPendingToday).toBe(true);
      expect(result.isActiveToday).toBe(false);
      expect(result.wasProtectedByFreeze).toBe(true);
      expect(result.freezesUsed).toBe(1);
      expect(result.streakFreezes).toBe(0);
      expect(result.maxStreakFreezes).toBe(2);
      expect(result.totalFreezesUsed).toBe(1);
    });

    // TC-FREEZE-002: 2 missed days (delta_d = 3) with 2 freezes consumes 2 freezes, preserves current streak
    it('[TC-FREEZE-002] consumes 2 freezes and preserves current streak on 2 missed days', async () => {
      const now = new Date('2026-08-20T10:00:00Z');
      jest.useFakeTimers();
      jest.setSystemTime(now);

      prisma.userStreak.findFirst.mockResolvedValue({
        id: 'streak-rec-1',
        userId: mockUserId,
        currentStreak: 10,
        bestStreak: 15,
        lastActiveDate: new Date('2026-08-17T10:00:00Z'),
        streakFreezes: 2,
        totalFreezesUsed: 0,
        lastFreezeDate: null,
      });

      prisma.userStreak.update.mockResolvedValue({
        id: 'streak-rec-1',
        userId: mockUserId,
        currentStreak: 10,
        bestStreak: 15,
        lastActiveDate: new Date(now.getTime() - 86400000),
        streakFreezes: 0,
        totalFreezesUsed: 2,
        lastFreezeDate: now,
      });

      const result = await service.getStreak(mockUserId, 'UTC');

      expect(prisma.userStreak.update).toHaveBeenCalledWith({
        where: { id: 'streak-rec-1' },
        data: {
          streakFreezes: 0,
          totalFreezesUsed: 2,
          lastFreezeDate: now,
          lastActiveDate: new Date(now.getTime() - 86400000),
        },
      });

      expect(result.currentStreak).toBe(10);
      expect(result.isPendingToday).toBe(true);
      expect(result.wasProtectedByFreeze).toBe(true);
      expect(result.freezesUsed).toBe(2);
      expect(result.streakFreezes).toBe(0);
    });

    // TC-FREEZE-003: Inactive gap exceeding freeze quota resets streak to 0 without wasting freeze
    it('[TC-FREEZE-003] resets streak to 0 when gap exceeds freeze quota without consuming freeze', async () => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2026-08-20T10:00:00Z'));

      prisma.userStreak.findFirst.mockResolvedValue({
        id: 'streak-rec-1',
        userId: mockUserId,
        currentStreak: 15,
        bestStreak: 20,
        lastActiveDate: new Date('2026-08-17T10:00:00Z'), // delta = 3, quota = 1 -> delta > quota + 1
        streakFreezes: 1,
        totalFreezesUsed: 0,
        lastFreezeDate: null,
      });

      const result = await service.getStreak(mockUserId, 'UTC');

      expect(prisma.userStreak.update).not.toHaveBeenCalled();
      expect(result.isActiveToday).toBe(false);
      expect(result.isPendingToday).toBe(false);
      expect(result.currentStreak).toBe(0);
      expect(result.bestStreak).toBe(20);
      expect(result.streakFreezes).toBe(1);
      expect(result.wasProtectedByFreeze).toBe(false);
      expect(result.freezesUsed).toBe(0);
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
        streakFreezes: 1,
        totalFreezesUsed: 0,
        lastFreezeDate: null,
      });
      expect((await service.getStreak(mockUserId, 'UTC')).flameTier).toBe(1);

      // Tier 2 (streak 7)
      prisma.userStreak.findFirst.mockResolvedValue({
        id: 'rec-2',
        userId: mockUserId,
        currentStreak: 7,
        bestStreak: 7,
        lastActiveDate: new Date('2026-08-20T01:00:00Z'),
        streakFreezes: 1,
        totalFreezesUsed: 0,
        lastFreezeDate: null,
      });
      expect((await service.getStreak(mockUserId, 'UTC')).flameTier).toBe(2);

      // Tier 3 (streak 14)
      prisma.userStreak.findFirst.mockResolvedValue({
        id: 'rec-3',
        userId: mockUserId,
        currentStreak: 14,
        bestStreak: 14,
        lastActiveDate: new Date('2026-08-20T01:00:00Z'),
        streakFreezes: 1,
        totalFreezesUsed: 0,
        lastFreezeDate: null,
      });
      expect((await service.getStreak(mockUserId, 'UTC')).flameTier).toBe(3);

      // Tier 4 (streak 30)
      prisma.userStreak.findFirst.mockResolvedValue({
        id: 'rec-4',
        userId: mockUserId,
        currentStreak: 30,
        bestStreak: 30,
        lastActiveDate: new Date('2026-08-20T01:00:00Z'),
        streakFreezes: 1,
        totalFreezesUsed: 0,
        lastFreezeDate: null,
      });
      expect((await service.getStreak(mockUserId, 'UTC')).flameTier).toBe(4);
    });
  });

  describe('recordActivity', () => {
    it('initializes streak to 1 with 1 freeze when user has no prior activity', async () => {
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
        streakFreezes: 1,
        totalFreezesUsed: 0,
        lastFreezeDate: null,
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
          streakFreezes: 1,
          totalFreezesUsed: 0,
          lastFreezeDate: null,
        },
      });
      expect(response).toEqual({
        currentStreak: 1,
        bestStreak: 1,
        streakIncreased: true,
        isActiveToday: true,
        flameTier: 1,
        message: 'New streak started!',
        streakFreezes: 1,
        wasProtectedByFreeze: false,
        freezesUsed: 0,
        earnedMilestoneFreeze: false,
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
        streakFreezes: 1,
        totalFreezesUsed: 0,
        lastFreezeDate: null,
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
        streakFreezes: 1,
        wasProtectedByFreeze: false,
        freezesUsed: 0,
        earnedMilestoneFreeze: false,
      });
    });

    it('increments streak on consecutive day activity (yesterday -> today)', async () => {
      const now = new Date('2026-08-20T09:00:00Z');
      jest.useFakeTimers();
      jest.setSystemTime(now);

      prisma.userStreak.findFirst.mockResolvedValue({
        id: 'rec-consecutive',
        userId: mockUserId,
        currentStreak: 4,
        bestStreak: 5,
        lastActiveDate: new Date('2026-08-19T20:00:00Z'),
        streakFreezes: 1,
        totalFreezesUsed: 0,
        lastFreezeDate: null,
      });

      prisma.userStreak.update.mockResolvedValue({
        id: 'rec-consecutive',
        userId: mockUserId,
        currentStreak: 5,
        bestStreak: 5,
        lastActiveDate: now,
        streakFreezes: 1,
        totalFreezesUsed: 0,
        lastFreezeDate: null,
      });

      const response = await service.recordActivity(mockUserId, {
        timezone: 'UTC',
      });

      expect(prisma.userStreak.update).toHaveBeenCalledWith({
        where: { id: 'rec-consecutive' },
        data: {
          currentStreak: 5,
          bestStreak: 5,
          lastActiveDate: now,
          streakFreezes: 1,
        },
      });
      expect(response).toEqual({
        currentStreak: 5,
        bestStreak: 5,
        streakIncreased: true,
        isActiveToday: true,
        flameTier: 1,
        message: 'Streak increased! Great job!',
        streakFreezes: 1,
        wasProtectedByFreeze: false,
        freezesUsed: 0,
        earnedMilestoneFreeze: false,
      });
    });

    // TC-FREEZE-001 (recordActivity): Missed 1 day with 1 freeze consumed on activity submission
    it('[TC-FREEZE-001] auto-consumes 1 freeze and increments streak on missed day during recordActivity', async () => {
      const now = new Date('2026-08-20T09:00:00Z');
      jest.useFakeTimers();
      jest.setSystemTime(now);

      prisma.userStreak.findFirst.mockResolvedValue({
        id: 'rec-protected',
        userId: mockUserId,
        currentStreak: 5,
        bestStreak: 5,
        lastActiveDate: new Date('2026-08-18T20:00:00Z'), // delta = 2
        streakFreezes: 1,
        totalFreezesUsed: 0,
        lastFreezeDate: null,
      });

      prisma.userStreak.update.mockResolvedValue({
        id: 'rec-protected',
        userId: mockUserId,
        currentStreak: 6,
        bestStreak: 6,
        lastActiveDate: now,
        streakFreezes: 0,
        totalFreezesUsed: 1,
        lastFreezeDate: now,
      });

      const response = await service.recordActivity(mockUserId, {
        timezone: 'UTC',
      });

      expect(prisma.userStreak.update).toHaveBeenCalledWith({
        where: { id: 'rec-protected' },
        data: {
          currentStreak: 6,
          bestStreak: 6,
          lastActiveDate: now,
          streakFreezes: 0,
          totalFreezesUsed: 1,
          lastFreezeDate: now,
        },
      });

      expect(response).toEqual({
        currentStreak: 6,
        bestStreak: 6,
        streakIncreased: true,
        isActiveToday: true,
        flameTier: 1,
        message: 'Streak increased! Great job!',
        streakFreezes: 0,
        wasProtectedByFreeze: true,
        freezesUsed: 1,
        earnedMilestoneFreeze: false,
      });
    });

    // TC-FREEZE-002 (recordActivity): 2 missed days with 2 freezes
    it('[TC-FREEZE-002] auto-consumes 2 freezes and increments streak on 2 missed days during recordActivity', async () => {
      const now = new Date('2026-08-20T09:00:00Z');
      jest.useFakeTimers();
      jest.setSystemTime(now);

      prisma.userStreak.findFirst.mockResolvedValue({
        id: 'rec-2-freezes',
        userId: mockUserId,
        currentStreak: 10,
        bestStreak: 10,
        lastActiveDate: new Date('2026-08-17T20:00:00Z'), // delta = 3
        streakFreezes: 2,
        totalFreezesUsed: 0,
        lastFreezeDate: null,
      });

      const response = await service.recordActivity(mockUserId, {
        timezone: 'UTC',
      });

      expect(prisma.userStreak.update).toHaveBeenCalledWith({
        where: { id: 'rec-2-freezes' },
        data: {
          currentStreak: 11,
          bestStreak: 11,
          lastActiveDate: now,
          streakFreezes: 0,
          totalFreezesUsed: 2,
          lastFreezeDate: now,
        },
      });

      expect(response).toEqual({
        currentStreak: 11,
        bestStreak: 11,
        streakIncreased: true,
        isActiveToday: true,
        flameTier: 2,
        message: 'Streak increased! Great job!',
        streakFreezes: 0,
        wasProtectedByFreeze: true,
        freezesUsed: 2,
        earnedMilestoneFreeze: false,
      });
    });

    // TC-FREEZE-003 (recordActivity): Exceeding freeze quota resets streak to 1 without wasting freeze
    it('[TC-FREEZE-003] resets streak to 1 without consuming freeze when gap exceeds quota', async () => {
      const now = new Date('2026-08-20T09:00:00Z');
      jest.useFakeTimers();
      jest.setSystemTime(now);

      prisma.userStreak.findFirst.mockResolvedValue({
        id: 'rec-broken',
        userId: mockUserId,
        currentStreak: 15,
        bestStreak: 25,
        lastActiveDate: new Date('2026-08-17T10:00:00Z'), // delta = 3, quota = 1
        streakFreezes: 1,
        totalFreezesUsed: 0,
        lastFreezeDate: null,
      });

      prisma.userStreak.update.mockResolvedValue({
        id: 'rec-broken',
        userId: mockUserId,
        currentStreak: 1,
        bestStreak: 25,
        lastActiveDate: now,
        streakFreezes: 1,
        totalFreezesUsed: 0,
        lastFreezeDate: null,
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
          streakFreezes: 1,
        },
      });
      expect(response).toEqual({
        currentStreak: 1,
        bestStreak: 25,
        streakIncreased: true,
        isActiveToday: true,
        flameTier: 1,
        message: 'New streak started!',
        streakFreezes: 1,
        wasProtectedByFreeze: false,
        freezesUsed: 0,
        earnedMilestoneFreeze: false,
      });
    });

    // TC-FREEZE-004: 7-day or 30-day streak milestone awards +1 freeze (capped at 2)
    it('[TC-FREEZE-004] awards +1 freeze on reaching 7-day milestone', async () => {
      const now = new Date('2026-08-20T09:00:00Z');
      jest.useFakeTimers();
      jest.setSystemTime(now);

      prisma.userStreak.findFirst.mockResolvedValue({
        id: 'rec-milestone-7',
        userId: mockUserId,
        currentStreak: 6,
        bestStreak: 6,
        lastActiveDate: new Date('2026-08-19T20:00:00Z'),
        streakFreezes: 1,
        totalFreezesUsed: 0,
        lastFreezeDate: null,
      });

      const response = await service.recordActivity(mockUserId, {
        timezone: 'UTC',
      });

      expect(prisma.userStreak.update).toHaveBeenCalledWith({
        where: { id: 'rec-milestone-7' },
        data: {
          currentStreak: 7,
          bestStreak: 7,
          lastActiveDate: now,
          streakFreezes: 2, // awarded +1
        },
      });

      expect(response).toEqual({
        currentStreak: 7,
        bestStreak: 7,
        streakIncreased: true,
        isActiveToday: true,
        flameTier: 2,
        message: 'Streak increased! Great job!',
        streakFreezes: 2,
        wasProtectedByFreeze: false,
        freezesUsed: 0,
        earnedMilestoneFreeze: true,
      });
    });

    it('[TC-FREEZE-004] awards +1 freeze on reaching 30-day milestone', async () => {
      const now = new Date('2026-08-20T09:00:00Z');
      jest.useFakeTimers();
      jest.setSystemTime(now);

      prisma.userStreak.findFirst.mockResolvedValue({
        id: 'rec-milestone-30',
        userId: mockUserId,
        currentStreak: 29,
        bestStreak: 29,
        lastActiveDate: new Date('2026-08-19T20:00:00Z'),
        streakFreezes: 1,
        totalFreezesUsed: 1,
        lastFreezeDate: new Date('2026-08-10T10:00:00Z'),
      });

      const response = await service.recordActivity(mockUserId, {
        timezone: 'UTC',
      });

      expect(prisma.userStreak.update).toHaveBeenCalledWith({
        where: { id: 'rec-milestone-30' },
        data: {
          currentStreak: 30,
          bestStreak: 30,
          lastActiveDate: now,
          streakFreezes: 2, // awarded +1
        },
      });

      expect(response.earnedMilestoneFreeze).toBe(true);
      expect(response.streakFreezes).toBe(2);
      expect(response.currentStreak).toBe(30);
      expect(response.flameTier).toBe(4);
    });

    // TC-FREEZE-005: Milestone reward at max quota (2) does not exceed 2
    it('[TC-FREEZE-005] does not exceed max quota (2) when milestone reached while having 2 freezes', async () => {
      const now = new Date('2026-08-20T09:00:00Z');
      jest.useFakeTimers();
      jest.setSystemTime(now);

      prisma.userStreak.findFirst.mockResolvedValue({
        id: 'rec-milestone-max',
        userId: mockUserId,
        currentStreak: 6,
        bestStreak: 6,
        lastActiveDate: new Date('2026-08-19T20:00:00Z'),
        streakFreezes: 2, // already at max cap
        totalFreezesUsed: 0,
        lastFreezeDate: null,
      });

      const response = await service.recordActivity(mockUserId, {
        timezone: 'UTC',
      });

      expect(prisma.userStreak.update).toHaveBeenCalledWith({
        where: { id: 'rec-milestone-max' },
        data: {
          currentStreak: 7,
          bestStreak: 7,
          lastActiveDate: now,
          streakFreezes: 2, // remains 2
        },
      });

      expect(response.earnedMilestoneFreeze).toBe(false);
      expect(response.streakFreezes).toBe(2);
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
        streakFreezes: 1,
        totalFreezesUsed: 0,
        lastFreezeDate: null,
      });

      prisma.userStreak.update.mockResolvedValue({
        id: 'rec-tokyo',
        userId: mockUserId,
        currentStreak: 4,
        bestStreak: 5,
        lastActiveDate: nowTokyoMorning,
        streakFreezes: 1,
        totalFreezesUsed: 0,
        lastFreezeDate: null,
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
          streakFreezes: 1,
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
        streakFreezes: 1,
        totalFreezesUsed: 0,
        lastFreezeDate: null,
      });

      prisma.userStreak.update.mockResolvedValue({
        id: 'rec-tz-fallback',
        userId: mockUserId,
        currentStreak: 3,
        bestStreak: 3,
        lastActiveDate: now,
        streakFreezes: 1,
        totalFreezesUsed: 0,
        lastFreezeDate: null,
      });

      const response = await service.recordActivity(mockUserId, {
        timezone: 'Mars/Curiosity',
      });

      expect(response.streakIncreased).toBe(true);
      expect(response.currentStreak).toBe(3);
    });
  });
});
