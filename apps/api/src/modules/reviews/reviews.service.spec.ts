/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Test, TestingModule } from '@nestjs/testing';
import { ReviewsService } from './reviews.service';
import { SrsService } from './srs.service';
import { StreakService } from '../streaks/streak.service';
import { XpService } from '../gamification/services/xp.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException, ForbiddenException } from '@nestjs/common';

describe('ReviewsService', () => {
  let service: ReviewsService;
  let streakService: {
    recordActivity: jest.Mock;
    getStreak: jest.Mock;
  };
  let xpService: {
    awardReviewXp: jest.Mock;
  };
  let prisma: {
    user: { findUnique: jest.Mock };
    card: { findUnique: jest.Mock };
    userCardProgress: {
      findMany: jest.Mock;
      findUnique: jest.Mock;
      create: jest.Mock;
      update: jest.Mock;
      count: jest.Mock;
      findFirst: jest.Mock;
    };
    officialCard: {
      findUnique: jest.Mock;
    };
    userOfficialCardProgress: {
      findMany: jest.Mock;
      findUnique: jest.Mock;
      create: jest.Mock;
      update: jest.Mock;
      count: jest.Mock;
      findFirst: jest.Mock;
    };
    userStreak: {
      findFirst: jest.Mock;
      findUnique: jest.Mock;
    };
    reviewLog: { create: jest.Mock; count: jest.Mock };
  };

  const mockUserId = 'user-uuid-1';
  const mockCardId = 'card-uuid-1';

  beforeEach(async () => {
    streakService = {
      recordActivity: jest.fn().mockResolvedValue({
        currentStreak: 1,
        bestStreak: 1,
        streakIncreased: true,
        isActiveToday: true,
        flameTier: 1,
        message: 'New streak started!',
      }),
      getStreak: jest.fn().mockResolvedValue({
        userId: mockUserId,
        currentStreak: 0,
        bestStreak: 0,
        lastActiveDate: null,
        isActiveToday: false,
        isPendingToday: false,
        timezone: 'UTC',
        flameTier: 1,
        streakFreezes: 0,
        maxStreakFreezes: 2,
        totalFreezesUsed: 0,
        lastFreezeDate: null,
        wasProtectedByFreeze: false,
        freezesUsed: 0,
      }),
    };

    xpService = {
      awardReviewXp: jest.fn().mockResolvedValue({
        xpEarned: 10,
        breakdown: [{ type: 'CARD_REVIEW', xp: 10 }],
        totalXp: 10,
        level: 1,
        tier: 'BRONZE',
        currentLevelXp: 10,
        nextLevelRequiredXp: 100,
        levelProgressPercent: 10,
        levelUp: {
          isLevelUp: false,
          previousLevel: 1,
          currentLevel: 1,
          previousTier: 'BRONZE',
          currentTier: 'BRONZE',
          isTierPromotion: false,
        },
      }),
    };

    prisma = {
      user: { findUnique: jest.fn() },
      card: { findUnique: jest.fn() },
      userCardProgress: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        count: jest.fn(),
        findFirst: jest.fn(),
      },
      officialCard: {
        findUnique: jest.fn(),
      },
      userOfficialCardProgress: {
        findMany: jest.fn().mockResolvedValue([]),
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        count: jest.fn().mockResolvedValue(0),
        findFirst: jest.fn().mockResolvedValue(null),
      },
      userStreak: {
        findFirst: jest.fn().mockResolvedValue(null),
        findUnique: jest.fn().mockResolvedValue(null),
      },
      reviewLog: {
        create: jest.fn().mockResolvedValue({
          id: 'log-1',
          userId: mockUserId,
          cardId: mockCardId,
          rating: 3,
          interval: 1,
          reviewedAt: new Date(),
        }),
        count: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReviewsService,
        SrsService,
        {
          provide: StreakService,
          useValue: streakService,
        },
        {
          provide: XpService,
          useValue: xpService,
        },
        {
          provide: PrismaService,
          useValue: prisma,
        },
      ],
    }).compile();

    service = module.get<ReviewsService>(ReviewsService);
  });

  describe('getDueCards', () => {
    it('TC-SRS-004: returns overdue and due cards prioritized, plus new cards up to dailyGoal limit', async () => {
      prisma.user.findUnique.mockResolvedValue({ dailyGoal: 10 });
      prisma.userCardProgress.findMany.mockResolvedValueOnce([
        {
          id: 'prog-1',
          status: 'LEARNING',
          nextReviewDate: new Date(Date.now() - 3600 * 1000 * 24), // overdue
          interval: 1,
          repetitions: 1,
          easeFactor: 2.5,
          card: {
            id: 'card-1',
            word: 'accommodate',
            meaning: 'đáp ứng',
            phonetic: '/əˈkɑː.mə.deɪt/',
            audioUrl: null,
            exampleSentence: 'Can accommodate 500 delegates.',
            collocations: 'accommodate needs',
            mnemonic: 'Có chỗ ở',
            deck: { id: 'deck-1', title: 'TOEIC' },
          },
        },
        {
          id: 'prog-2',
          status: 'NEW',
          nextReviewDate: new Date(),
          interval: 0,
          repetitions: 0,
          easeFactor: 2.5,
          card: {
            id: 'card-2',
            word: 'acquire',
            meaning: 'mua lại',
            phonetic: '/əˈkwaɪər/',
            audioUrl: null,
            exampleSentence: 'Acquire a startup.',
            collocations: 'acquire skills',
            mnemonic: 'Mua lại',
            deck: { id: 'deck-1', title: 'TOEIC' },
          },
        },
      ]);

      const result = await service.getDueCards(mockUserId, {});

      expect(result.data.length).toBe(2);
      expect(result.data[0].word).toBe('accommodate');
      expect(result.data[1].word).toBe('acquire');
      expect(result.meta.totalDue).toBe(2);
      expect(result.meta.overdueCount).toBe(1);
    });

    it('TC-SRS-005: returns empty list with 0 meta when user has no due or new cards', async () => {
      prisma.user.findUnique.mockResolvedValue({ dailyGoal: 10 });
      prisma.userCardProgress.findMany.mockResolvedValue([]);

      const result = await service.getDueCards(mockUserId, {});

      expect(result.data).toEqual([]);
      expect(result.meta.totalDue).toBe(0);
    });

    it('TC-SRS-006: respects deckId filter when querying cards', async () => {
      prisma.user.findUnique.mockResolvedValue({ dailyGoal: 5 });
      prisma.userCardProgress.findMany.mockResolvedValue([]);

      await service.getDueCards(mockUserId, { deckId: 'specific-deck-id' });

      expect(prisma.userCardProgress.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            card: expect.objectContaining({
              deckId: 'specific-deck-id',
            }),
          }),
        }),
      );
    });
  });

  describe('submitReview', () => {
    it('TC-SRS-007: validates ownership and updates card progress via SM-2', async () => {
      prisma.card.findUnique.mockResolvedValue({
        id: mockCardId,
        deck: { userId: mockUserId },
      });

      prisma.userCardProgress.findUnique.mockResolvedValue({
        id: 'prog-1',
        userId: mockUserId,
        cardId: mockCardId,
        status: 'LEARNING',
        interval: 1,
        repetitions: 1,
        easeFactor: 2.5,
      });

      const updatedProgress = {
        id: 'prog-1',
        cardId: mockCardId,
        status: 'LEARNING',
        interval: 6,
        repetitions: 2,
        easeFactor: 2.5,
        lastReviewedAt: new Date(),
        nextReviewDate: new Date(),
      };
      prisma.userCardProgress.update.mockResolvedValue(updatedProgress);

      const result = await service.submitReview(mockUserId, {
        cardId: mockCardId,
        rating: 3,
      });

      expect(result.status).toBe('LEARNING');
      expect(result.interval).toBe(6);
      expect(result.repetitions).toBe(2);
      expect(result.streak).toBeDefined();
      expect(result.streak?.currentStreak).toBe(1);
      expect(result.xp).toBeDefined();
      expect(result.xp.xpEarned).toBe(10);
      expect(streakService.recordActivity).toHaveBeenCalledWith(mockUserId, {
        timezone: undefined,
      });
      expect(xpService.awardReviewXp).toHaveBeenCalledWith(
        mockUserId,
        expect.objectContaining({ cardId: mockCardId, rating: 3 }),
      );
      expect(prisma.userCardProgress.update).toHaveBeenCalled();
    });

    it('TC-SRS-008: throws NotFoundException when card does not exist', async () => {
      prisma.card.findUnique.mockResolvedValue(null);

      await expect(
        service.submitReview(mockUserId, {
          cardId: 'non-existent-card',
          rating: 3,
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('TC-SRS-009: throws ForbiddenException when card belongs to another user', async () => {
      prisma.card.findUnique.mockResolvedValue({
        id: mockCardId,
        deck: { userId: 'other-user-uuid' },
      });

      await expect(
        service.submitReview(mockUserId, {
          cardId: mockCardId,
          rating: 3,
        }),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('getReviewStats', () => {
    it('TC-SRS-010: aggregates counts of due, new, learning, mastered cards', async () => {
      prisma.userCardProgress.count
        .mockResolvedValueOnce(20) // total
        .mockResolvedValueOnce(5) // due
        .mockResolvedValueOnce(4) // new
        .mockResolvedValueOnce(10) // learning
        .mockResolvedValueOnce(6); // mastered

      const stats = await service.getReviewStats(mockUserId);

      expect(stats.totalCards).toBe(20);
      expect(stats.dueCount).toBe(5);
      expect(stats.newCount).toBe(4);
      expect(stats.learningCount).toBe(10);
      expect(stats.masteredCount).toBe(6);
    });
  });

  describe('getReviewSummary', () => {
    afterEach(() => {
      jest.useRealTimers();
    });

    it('TC-REM-001: calculates complete 10-field summary in Asia/Ho_Chi_Minh', async () => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2026-10-12T10:00:00.000Z'));

      prisma.user.findUnique.mockResolvedValue({ dailyGoal: 10 });
      prisma.userCardProgress.count
        .mockResolvedValueOnce(12) // dueCount (status not NEW, nextReviewDate <= now)
        .mockResolvedValueOnce(35); // newAvailable (status NEW)
      prisma.reviewLog.count.mockResolvedValue(4); // studiedToday
      prisma.userCardProgress.findFirst.mockResolvedValue({
        nextReviewDate: new Date('2026-10-12T15:30:00.000Z'),
      });
      streakService.getStreak.mockResolvedValue({
        currentStreak: 5,
        isActiveToday: false,
      });

      const summary = await service.getReviewSummary(
        mockUserId,
        'Asia/Ho_Chi_Minh',
      );

      expect(summary).toEqual({
        dueCount: 12,
        newAvailable: 35,
        studiedToday: 4,
        dailyGoal: 10,
        goalReached: false,
        currentStreak: 5,
        streakAtRisk: false,
        timezone: 'Asia/Ho_Chi_Minh',
        endOfDayAt: '2026-10-12T16:59:59.999Z',
        nextDueAt: '2026-10-12T15:30:00.000Z',
      });
      expect(streakService.getStreak).toHaveBeenCalledWith(
        mockUserId,
        'Asia/Ho_Chi_Minh',
      );
    });

    it('TC-REM-002: marks goalReached true when studiedToday >= dailyGoal', async () => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2026-10-12T10:00:00.000Z'));

      prisma.user.findUnique.mockResolvedValue({ dailyGoal: 10 });
      prisma.userCardProgress.count
        .mockResolvedValueOnce(0)
        .mockResolvedValueOnce(0);
      prisma.reviewLog.count.mockResolvedValue(10);
      prisma.userCardProgress.findFirst.mockResolvedValue(null);
      streakService.getStreak.mockResolvedValue({
        currentStreak: 5,
        isActiveToday: true,
      });

      const summary = await service.getReviewSummary(
        mockUserId,
        'Asia/Ho_Chi_Minh',
      );

      expect(summary.goalReached).toBe(true);
      expect(summary.studiedToday).toBe(10);
      expect(summary.streakAtRisk).toBe(false);
    });

    it('TC-REM-003: flags streakAtRisk true when currentStreak >= 3, unstudied today, and within 3h of midnight even with streakFreezes > 0', async () => {
      jest.useFakeTimers();
      // In Asia/Ho_Chi_Minh (UTC+7), midnight is 2026-10-12T16:59:59.999Z.
      // 3 hours before midnight is 2026-10-12T13:59:59.999Z (10,800,000 ms remaining)
      jest.setSystemTime(new Date('2026-10-12T13:59:59.999Z'));

      prisma.user.findUnique.mockResolvedValue({ dailyGoal: 10 });
      prisma.userCardProgress.count
        .mockResolvedValueOnce(5)
        .mockResolvedValueOnce(10);
      prisma.reviewLog.count.mockResolvedValue(0);
      prisma.userCardProgress.findFirst.mockResolvedValue(null);
      streakService.getStreak.mockResolvedValue({
        currentStreak: 3,
        streakFreezes: 2,
        isActiveToday: false,
      });

      const summaryExact = await service.getReviewSummary(
        mockUserId,
        'Asia/Ho_Chi_Minh',
      );
      expect(summaryExact.streakAtRisk).toBe(true);
      expect(summaryExact.currentStreak).toBe(3);

      // 2 hours remaining: 2026-10-12T15:00:00.000Z
      jest.setSystemTime(new Date('2026-10-12T15:00:00.000Z'));
      const summaryWithin = await service.getReviewSummary(
        mockUserId,
        'Asia/Ho_Chi_Minh',
      );
      expect(summaryWithin.streakAtRisk).toBe(true);
    });

    it('TC-REM-004: keeps streakAtRisk false if streak < 3, > 3h left, or already studied/active', async () => {
      jest.useFakeTimers();
      // 1 hour before midnight (2026-10-12T16:00:00.000Z) but streak = 2 (< 3)
      jest.setSystemTime(new Date('2026-10-12T16:00:00.000Z'));
      prisma.user.findUnique.mockResolvedValue({ dailyGoal: 10 });
      prisma.userCardProgress.count.mockResolvedValue(0);
      prisma.reviewLog.count.mockResolvedValue(0);
      prisma.userCardProgress.findFirst.mockResolvedValue(null);
      streakService.getStreak.mockResolvedValue({
        currentStreak: 2,
        isActiveToday: false,
      });

      const lowStreak = await service.getReviewSummary(
        mockUserId,
        'Asia/Ho_Chi_Minh',
      );
      expect(lowStreak.streakAtRisk).toBe(false);

      // Streak = 10, but msUntilEndOfDay = 10,800,001 ms (> 3h): 2026-10-12T13:59:59.998Z
      jest.setSystemTime(new Date('2026-10-12T13:59:59.998Z'));
      streakService.getStreak.mockResolvedValue({
        currentStreak: 10,
        isActiveToday: false,
      });
      const outsideWindow = await service.getReviewSummary(
        mockUserId,
        'Asia/Ho_Chi_Minh',
      );
      expect(outsideWindow.streakAtRisk).toBe(false);

      // Streak = 5, inside 3h window, but studiedToday = 1
      jest.setSystemTime(new Date('2026-10-12T15:00:00.000Z'));
      prisma.reviewLog.count.mockResolvedValue(1);
      streakService.getStreak.mockResolvedValue({
        currentStreak: 5,
        isActiveToday: false,
      });
      const studiedTodayRes = await service.getReviewSummary(
        mockUserId,
        'Asia/Ho_Chi_Minh',
      );
      expect(studiedTodayRes.streakAtRisk).toBe(false);

      // Streak = 5, inside 3h window, studiedToday = 0, but isActiveToday = true
      prisma.reviewLog.count.mockResolvedValue(0);
      streakService.getStreak.mockResolvedValue({
        currentStreak: 5,
        isActiveToday: true,
      });
      const activeTodayRes = await service.getReviewSummary(
        mockUserId,
        'Asia/Ho_Chi_Minh',
      );
      expect(activeTodayRes.streakAtRisk).toBe(false);
    });

    it('TC-REM-005: strictly filters active non-archived decks for dueCount, newAvailable, and nextDueAt', async () => {
      jest.useFakeTimers();
      const fixedNow = new Date('2026-10-12T10:00:00.000Z');
      jest.setSystemTime(fixedNow);

      prisma.user.findUnique.mockResolvedValue({ dailyGoal: 10 });
      prisma.userCardProgress.count.mockResolvedValue(0);
      prisma.reviewLog.count.mockResolvedValue(0);
      prisma.userCardProgress.findFirst.mockResolvedValue(null);
      streakService.getStreak.mockResolvedValue({
        currentStreak: 0,
        isActiveToday: false,
      });

      const summary = await service.getReviewSummary(mockUserId, 'UTC');

      expect(summary.dueCount).toBe(0);
      expect(summary.newAvailable).toBe(0);
      expect(summary.nextDueAt).toBeNull();

      const expectedActiveDeckFilter = {
        deck: { userId: mockUserId, isArchived: false },
      };

      expect(prisma.userCardProgress.count).toHaveBeenCalledWith({
        where: {
          userId: mockUserId,
          status: { not: 'NEW' },
          nextReviewDate: { lte: fixedNow },
          card: expectedActiveDeckFilter,
        },
      });

      expect(prisma.userCardProgress.count).toHaveBeenCalledWith({
        where: {
          userId: mockUserId,
          status: 'NEW',
          card: expectedActiveDeckFilter,
        },
      });

      expect(prisma.userCardProgress.findFirst).toHaveBeenCalledWith({
        where: {
          userId: mockUserId,
          status: { not: 'NEW' },
          nextReviewDate: { gt: fixedNow },
          card: expectedActiveDeckFilter,
        },
        orderBy: { nextReviewDate: 'asc' },
        select: { nextReviewDate: true },
      });
    });

    it('TC-REM-006: resolves timezone with query param taking priority, header as fallback, and UTC as safe default', async () => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2026-10-12T10:00:00.000Z'));

      prisma.user.findUnique.mockResolvedValue({ dailyGoal: 10 });
      prisma.userCardProgress.count.mockResolvedValue(0);
      prisma.reviewLog.count.mockResolvedValue(0);
      prisma.userCardProgress.findFirst.mockResolvedValue(null);
      streakService.getStreak.mockResolvedValue({
        currentStreak: 0,
        isActiveToday: false,
      });

      // Priority 1: valid query over valid header
      const tz1 = await service.getReviewSummary(
        mockUserId,
        'Asia/Tokyo',
        'America/New_York',
      );
      expect(tz1.timezone).toBe('Asia/Tokyo');

      // Priority 2: invalid query falls back to valid header
      const tz2 = await service.getReviewSummary(
        mockUserId,
        'Invalid/Timezone',
        'Asia/Tokyo',
      );
      expect(tz2.timezone).toBe('Asia/Tokyo');

      // Priority 3: both invalid or omitted fall back to UTC without throwing
      const tz3 = await service.getReviewSummary(
        mockUserId,
        'Invalid/Timezone',
        'Mars/Phobos',
      );
      expect(tz3.timezone).toBe('UTC');
      expect(tz3.endOfDayAt).toBe('2026-10-12T23:59:59.999Z');

      // Half-hour offset timezone (Asia/Kolkata UTC+5:30)
      const tz4 = await service.getReviewSummary(mockUserId, 'Asia/Kolkata');
      expect(tz4.timezone).toBe('Asia/Kolkata');
      expect(tz4.endOfDayAt).toBe('2026-10-12T18:29:59.999Z');
    });

    it('TC-REM-007: safely handles brand-new user with zero decks and null dailyGoal', async () => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2026-10-12T10:00:00.000Z'));

      prisma.user.findUnique.mockResolvedValue(null);
      prisma.userCardProgress.count.mockResolvedValue(0);
      prisma.reviewLog.count.mockResolvedValue(0);
      prisma.userCardProgress.findFirst.mockResolvedValue(null);
      streakService.getStreak.mockResolvedValue({
        currentStreak: 0,
        isActiveToday: false,
      });

      const summary = await service.getReviewSummary('new-user-id');

      expect(summary.dailyGoal).toBe(10);
      expect(summary.dueCount).toBe(0);
      expect(summary.newAvailable).toBe(0);
      expect(summary.studiedToday).toBe(0);
      expect(summary.goalReached).toBe(false);
      expect(summary.currentStreak).toBe(0);
      expect(summary.streakAtRisk).toBe(false);
      expect(summary.nextDueAt).toBeNull();
      expect(summary.timezone).toBe('UTC');
    });
  });

  describe('Official Cards & Unified Review Operations (US-LIB-02)', () => {
    it('TC-ODA-002: getDueCards merges custom and official cards into a single prioritized queue', async () => {
      prisma.user.findUnique.mockResolvedValue({ dailyGoal: 10 });
      prisma.userCardProgress.findMany.mockResolvedValue([
        {
          id: 'prog-custom-1',
          cardId: 'card-1',
          status: 'LEARNING',
          interval: 3,
          repetitions: 2,
          easeFactor: 2.5,
          nextReviewDate: new Date('2026-10-10T00:00:00.000Z'),
          card: {
            deckId: 'deck-1',
            word: 'custom-word',
            meaning: 'custom-meaning',
            deck: { id: 'deck-1', title: 'My Deck', color: '#10B981' },
          },
        },
      ]);
      prisma.userOfficialCardProgress.findMany.mockResolvedValue([
        {
          id: 'prog-official-1',
          cardId: 'official-card-1',
          status: 'LEARNING',
          interval: 2,
          repetitions: 1,
          easeFactor: 2.4,
          nextReviewDate: new Date('2026-10-09T00:00:00.000Z'),
          card: {
            headword: 'reimburse',
            content: { meaning_vi: 'hoàn tiền' },
            deckCards: [{ deck: { id: 'off-deck-1', title: 'TSL 1A' } }],
          },
        },
      ]);

      const result = await service.getDueCards(mockUserId);
      expect(result.data).toHaveLength(2);
      expect(result.meta.totalDue).toBe(2);
      expect(result.data[0].word).toBe('reimburse');
      expect(result.data[0].isOfficial).toBe(true);
      expect(result.data[1].word).toBe('custom-word');
      expect(result.data[1].isOfficial).toBeUndefined();
    });

    it('TC-ODA-003: submitReview processes official card, creates lazy progress, and updates SM-2', async () => {
      prisma.card.findUnique.mockResolvedValue(null);
      prisma.officialCard.findUnique.mockResolvedValue({
        id: 'official-card-1',
        headword: 'reimburse',
      });
      prisma.userOfficialCardProgress.findUnique.mockResolvedValue(null);
      prisma.userOfficialCardProgress.create.mockResolvedValue({
        id: 'prog-off-new',
        userId: mockUserId,
        cardId: 'official-card-1',
        repetitions: 0,
        easeFactor: 2.5,
        interval: 0,
        status: 'NEW',
      });
      prisma.userOfficialCardProgress.update.mockResolvedValue({
        id: 'prog-off-new',
        userId: mockUserId,
        cardId: 'official-card-1',
        repetitions: 1,
        easeFactor: 2.5,
        interval: 1,
        status: 'LEARNING',
        lastReviewedAt: new Date(),
        nextReviewDate: new Date(),
      });

      const result = await service.submitReview(mockUserId, {
        cardId: 'official-card-1',
        rating: 3,
      });

      expect(prisma.userOfficialCardProgress.create).toHaveBeenCalled();
      expect(prisma.userOfficialCardProgress.update).toHaveBeenCalled();
      expect(result.cardId).toBe('official-card-1');
      expect(result.status).toBe('LEARNING');
      expect(streakService.recordActivity).toHaveBeenCalledWith(mockUserId, {
        timezone: undefined,
      });
      expect(xpService.awardReviewXp).toHaveBeenCalled();
    });

    it('TC-ODA-004: getReviewStats aggregates counts from both custom and official cards', async () => {
      prisma.userCardProgress.count
        .mockResolvedValueOnce(10) // total
        .mockResolvedValueOnce(3) // due
        .mockResolvedValueOnce(2) // new
        .mockResolvedValueOnce(5) // learning
        .mockResolvedValueOnce(3); // mastered

      prisma.userOfficialCardProgress.count
        .mockResolvedValueOnce(20) // total
        .mockResolvedValueOnce(5) // due
        .mockResolvedValueOnce(8) // new
        .mockResolvedValueOnce(7) // learning
        .mockResolvedValueOnce(5); // mastered

      const stats = await service.getReviewStats(mockUserId);

      expect(stats.totalCards).toBe(30);
      expect(stats.dueCount).toBe(8);
      expect(stats.newCount).toBe(10);
      expect(stats.learningCount).toBe(12);
      expect(stats.masteredCount).toBe(8);
    });

    it('TC-UX-01-001: getTodaySession returns prioritized cards and summary', async () => {
      prisma.user.findUnique.mockResolvedValue({ dailyGoal: 10 });
      prisma.userCardProgress.findMany.mockResolvedValue([]);
      prisma.userOfficialCardProgress.findMany.mockResolvedValue([]);

      const session = await service.getTodaySession(mockUserId);

      expect(session).toBeDefined();
      expect(session.cards).toEqual([]);
      expect(session.summary).toEqual({
        dueCount: 0,
        newCount: 0,
        totalCount: 0,
        dailyGoal: 10,
        isGoalCompleted: true,
        isWelcomeBack: false,
        isExpress: false,
      });
    });

    describe('Habit Milestones, Express Session & Welcome Back (US-LIB-16)', () => {
      it('TC-LIB-16-001: getDueCards with mode === express limits cards to max 7 and marks isExpress', async () => {
        prisma.user.findUnique.mockResolvedValue({ dailyGoal: 10 });
        prisma.userStreak.findFirst.mockResolvedValue({
          lastActiveDate: new Date(),
        });

        // 10 mock overdue cards
        const mockCards = Array.from({ length: 10 }, (_, i) => ({
          id: `p-${i}`,
          cardId: `c-${i}`,
          status: 'LEARNING',
          interval: 1,
          repetitions: 1,
          easeFactor: 2.5,
          nextReviewDate: new Date(Date.now() - 24 * 3600 * 1000),
          card: {
            deckId: 'deck-1',
            deck: { id: 'deck-1', title: 'Deck 1', color: '#000' },
            word: `word-${i}`,
            meaning: `nghĩa-${i}`,
            phonetic: null,
            audioUrl: null,
            exampleSentence: null,
            collocations: null,
            mnemonic: null,
            imageUrl: null,
          },
        }));

        prisma.userCardProgress.findMany.mockResolvedValue(mockCards);
        prisma.userOfficialCardProgress.findMany.mockResolvedValue([]);

        const result = await service.getDueCards(mockUserId, { mode: 'express' });

        expect(result.data.length).toBe(7);
        expect(result.meta.isExpress).toBe(true);
        expect(result.meta.isWelcomeBack).toBe(false);
      });

      it('TC-LIB-16-002: getDueCards activates isWelcomeBack and caps to 7 when user inactive > 7 days', async () => {
        prisma.user.findUnique.mockResolvedValue({ dailyGoal: 10 });
        const eightDaysAgo = new Date(Date.now() - 8 * 24 * 3600 * 1000);
        prisma.userStreak.findFirst.mockResolvedValue({
          lastActiveDate: eightDaysAgo,
        });

        const mockCards = Array.from({ length: 15 }, (_, i) => ({
          id: `p-${i}`,
          cardId: `c-${i}`,
          status: 'LEARNING',
          interval: 1,
          repetitions: 1,
          easeFactor: 2.5,
          nextReviewDate: new Date(Date.now() - 24 * 3600 * 1000),
          card: {
            deckId: 'deck-1',
            deck: { id: 'deck-1', title: 'Deck 1', color: '#000' },
            word: `word-${i}`,
            meaning: `nghĩa-${i}`,
            phonetic: null,
            audioUrl: null,
            exampleSentence: null,
            collocations: null,
            mnemonic: null,
            imageUrl: null,
          },
        }));

        prisma.userCardProgress.findMany.mockResolvedValue(mockCards);
        prisma.userOfficialCardProgress.findMany.mockResolvedValue([]);

        const result = await service.getDueCards(mockUserId);

        expect(result.meta.isWelcomeBack).toBe(true);
        expect(result.data.length).toBe(7);
      });

      it('TC-LIB-16-003: getTodaySession forwards express mode', async () => {
        prisma.user.findUnique.mockResolvedValue({ dailyGoal: 10 });
        prisma.userStreak.findFirst.mockResolvedValue({
          lastActiveDate: new Date(),
        });
        prisma.userCardProgress.findMany.mockResolvedValue([]);
        prisma.userOfficialCardProgress.findMany.mockResolvedValue([]);

        const session = await service.getTodaySession(mockUserId, { mode: 'express' });

        expect(session.summary.isExpress).toBe(true);
      });
    });
  });
});
