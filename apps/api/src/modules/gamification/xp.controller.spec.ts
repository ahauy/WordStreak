import { Test, TestingModule } from '@nestjs/testing';
import { XpController } from './xp.controller';
import { XpService } from './services/xp.service';
import { MasteryTier, XpActionType } from '@wordstreak/shared-types';

describe('XpController', () => {
  let controller: XpController;
  let xpService: {
    getXpSummary: jest.Mock;
    getXpHistory: jest.Mock;
    awardPracticeQuizXp: jest.Mock;
  };

  const mockJwtPayload = {
    sub: 'usr_123',
    email: 'test@example.com',
    sessionId: 'sess_123',
  };

  beforeEach(async () => {
    xpService = {
      getXpSummary: jest.fn(),
      getXpHistory: jest.fn(),
      awardPracticeQuizXp: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [XpController],
      providers: [
        {
          provide: XpService,
          useValue: xpService,
        },
      ],
    }).compile();

    controller = module.get<XpController>(XpController);
  });

  describe('getXpSummary', () => {
    it('should return XP summary for authenticated user', async () => {
      const mockSummary = {
        userId: 'usr_123',
        totalXp: 1200,
        level: 8,
        tier: MasteryTier.SILVER,
        currentLevelXp: 80,
        nextLevelRequiredXp: 210,
        levelProgressPercent: 38.1,
        todayXp: 40,
        dailyGoalBonusEarnedToday: false,
        nextTier: MasteryTier.GOLD,
        nextTierLevel: 16,
        tierMetadata: {
          tier: MasteryTier.SILVER,
          nameEn: 'Silver',
          nameVi: 'Bạc',
          minLevel: 6,
          maxLevel: 15,
          colorHex: '#94A3B8',
          badgeIcon: 'silver-crest',
        },
      };

      xpService.getXpSummary.mockResolvedValue(mockSummary);

      const res = await controller.getXpSummary(
        mockJwtPayload,
        'Asia/Ho_Chi_Minh',
      );

      expect(res.success).toBe(true);
      expect(res.data).toEqual(mockSummary);
      expect(xpService.getXpSummary).toHaveBeenCalledWith(
        'usr_123',
        'Asia/Ho_Chi_Minh',
      );
    });
  });

  describe('getXpHistory', () => {
    it('should return paginated history with metadata', async () => {
      const mockHistory = {
        data: [
          {
            id: 'log_1',
            activityType: XpActionType.CARD_REVIEW,
            xpEarned: 10,
            metadata: { cardId: 'c1' },
            createdAt: '2026-08-21T07:49:00.000Z',
          },
        ],
        meta: {
          total: 1,
          page: 1,
          limit: 20,
          totalPages: 1,
        },
      };

      xpService.getXpHistory.mockResolvedValue(mockHistory);

      const res = await controller.getXpHistory(mockJwtPayload, {
        page: 1,
        limit: 20,
      });

      expect(res.success).toBe(true);
      expect(res.data).toEqual(mockHistory);
      expect(xpService.getXpHistory).toHaveBeenCalledWith('usr_123', {
        page: 1,
        limit: 20,
      });
    });
  });

  describe('awardPracticeQuizXp', () => {
    it('should award practice quiz XP and return result', async () => {
      const mockResult = {
        sessionId: 'quiz_99',
        scorePercentage: 90,
        xpEarned: 30,
        totalXp: 1230,
        level: 8,
        tier: MasteryTier.SILVER,
        levelUp: {
          isLevelUp: false,
          previousLevel: 8,
          currentLevel: 8,
          previousTier: MasteryTier.SILVER,
          currentTier: MasteryTier.SILVER,
          isTierPromotion: false,
        },
      };

      xpService.awardPracticeQuizXp.mockResolvedValue(mockResult);

      const res = await controller.awardPracticeQuizXp(
        mockJwtPayload,
        { sessionId: 'quiz_99', score: 9, totalQuestions: 10 },
        'UTC',
      );

      expect(res.success).toBe(true);
      expect(res.data).toEqual(mockResult);
      expect(res.message).toBe('Practice quiz XP awarded successfully');
    });
  });
});
