import { Test, TestingModule } from '@nestjs/testing';
import { LevelEngineService } from './level-engine.service';
import { MasteryTier } from '@wordstreak/shared-types';

describe('LevelEngineService', () => {
  let service: LevelEngineService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LevelEngineService],
    }).compile();

    service = module.get<LevelEngineService>(LevelEngineService);
  });

  describe('calculateThresholdForLevel', () => {
    it('should return 0 XP for Level 1 or less', () => {
      expect(service.calculateThresholdForLevel(1)).toBe(0);
      expect(service.calculateThresholdForLevel(0)).toBe(0);
      expect(service.calculateThresholdForLevel(-5)).toBe(0);
    });

    it('should return exact polynomial thresholds for milestone levels', () => {
      expect(service.calculateThresholdForLevel(2)).toBe(100);
      expect(service.calculateThresholdForLevel(5)).toBe(600);
      expect(service.calculateThresholdForLevel(6)).toBe(809);
      expect(service.calculateThresholdForLevel(16)).toBe(3654);
      expect(service.calculateThresholdForLevel(31)).toBe(9715);
      expect(service.calculateThresholdForLevel(46)).toBe(17343);
    });
  });

  describe('calculateLevelFromXp', () => {
    it('should return Level 1 for 0 XP or negative XP', () => {
      expect(service.calculateLevelFromXp(0)).toBe(1);
      expect(service.calculateLevelFromXp(-100)).toBe(1);
    });

    it('should return correct level for XP values', () => {
      expect(service.calculateLevelFromXp(50)).toBe(1);
      expect(service.calculateLevelFromXp(100)).toBe(2);
      expect(service.calculateLevelFromXp(599)).toBe(4);
      expect(service.calculateLevelFromXp(600)).toBe(5);
      expect(service.calculateLevelFromXp(809)).toBe(6);
      expect(service.calculateLevelFromXp(3654)).toBe(16);
      expect(service.calculateLevelFromXp(9715)).toBe(31);
      expect(service.calculateLevelFromXp(17343)).toBe(46);
    });
  });

  describe('calculateTierFromLevel', () => {
    it('should assign BRONZE for levels 1 to 5', () => {
      expect(service.calculateTierFromLevel(1)).toBe(MasteryTier.BRONZE);
      expect(service.calculateTierFromLevel(5)).toBe(MasteryTier.BRONZE);
    });

    it('should assign SILVER for levels 6 to 15', () => {
      expect(service.calculateTierFromLevel(6)).toBe(MasteryTier.SILVER);
      expect(service.calculateTierFromLevel(15)).toBe(MasteryTier.SILVER);
    });

    it('should assign GOLD for levels 16 to 30', () => {
      expect(service.calculateTierFromLevel(16)).toBe(MasteryTier.GOLD);
      expect(service.calculateTierFromLevel(30)).toBe(MasteryTier.GOLD);
    });

    it('should assign DIAMOND for levels 31 to 45', () => {
      expect(service.calculateTierFromLevel(31)).toBe(MasteryTier.DIAMOND);
      expect(service.calculateTierFromLevel(45)).toBe(MasteryTier.DIAMOND);
    });

    it('should assign MASTER for levels 46 and above', () => {
      expect(service.calculateTierFromLevel(46)).toBe(MasteryTier.MASTER);
      expect(service.calculateTierFromLevel(100)).toBe(MasteryTier.MASTER);
    });
  });

  describe('calculateLevelProgress', () => {
    it('should compute correct progress details for starting learner', () => {
      const progress = service.calculateLevelProgress(0);
      expect(progress.level).toBe(1);
      expect(progress.tier).toBe(MasteryTier.BRONZE);
      expect(progress.currentLevelThresholdXp).toBe(0);
      expect(progress.nextLevelThresholdXp).toBe(100);
      expect(progress.currentLevelXp).toBe(0);
      expect(progress.nextLevelRequiredXp).toBe(100);
      expect(progress.progressPercent).toBe(0);
    });

    it('should compute partial progress accurately', () => {
      const progress = service.calculateLevelProgress(50);
      expect(progress.level).toBe(1);
      expect(progress.currentLevelXp).toBe(50);
      expect(progress.progressPercent).toBe(50);
    });
  });

  describe('evaluateLevelUp', () => {
    it('should return isLevelUp false when level remains unchanged', () => {
      const result = service.evaluateLevelUp(10, 50);
      expect(result.isLevelUp).toBe(false);
      expect(result.isTierPromotion).toBe(false);
      expect(result.previousLevel).toBe(1);
      expect(result.currentLevel).toBe(1);
    });

    it('should return isLevelUp true without tier promotion within same tier', () => {
      const result = service.evaluateLevelUp(50, 110);
      expect(result.isLevelUp).toBe(true);
      expect(result.previousLevel).toBe(1);
      expect(result.currentLevel).toBe(2);
      expect(result.previousTier).toBe(MasteryTier.BRONZE);
      expect(result.currentTier).toBe(MasteryTier.BRONZE);
      expect(result.isTierPromotion).toBe(false);
    });

    it('should return isTierPromotion true when crossing tier boundary (Bronze -> Silver)', () => {
      const result = service.evaluateLevelUp(750, 820);
      expect(result.isLevelUp).toBe(true);
      expect(result.previousLevel).toBe(5);
      expect(result.currentLevel).toBe(6);
      expect(result.previousTier).toBe(MasteryTier.BRONZE);
      expect(result.currentTier).toBe(MasteryTier.SILVER);
      expect(result.isTierPromotion).toBe(true);
    });
  });

  describe('getTierMetadata', () => {
    it('should return tier metadata for valid tiers', () => {
      const meta = service.getTierMetadata(MasteryTier.GOLD);
      expect(meta.nameEn).toBe('Gold');
      expect(meta.colorHex).toBe('#D97706');
    });
  });
});
