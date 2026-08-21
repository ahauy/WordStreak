import { Injectable } from '@nestjs/common';
import {
  MasteryTier,
  TierMetadataDto,
  TIER_METADATA_CONFIG,
  calculateThresholdForLevel,
  calculateLevelFromXp,
  calculateTierFromLevel,
  calculateLevelProgress,
  LevelProgressDetails,
  LevelUpEventDto,
} from '@wordstreak/shared-types';

@Injectable()
export class LevelEngineService {
  /**
   * Calculates minimum lifetime XP required for a given level.
   */
  calculateThresholdForLevel(level: number): number {
    return calculateThresholdForLevel(level);
  }

  /**
   * Calculates current level from total lifetime XP.
   */
  calculateLevelFromXp(totalXp: number): number {
    return calculateLevelFromXp(totalXp);
  }

  /**
   * Derives mastery tier from a numeric level.
   */
  calculateTierFromLevel(level: number): MasteryTier {
    return calculateTierFromLevel(level);
  }

  /**
   * Returns detailed level progress metrics (current level, progress %, XP to next level).
   */
  calculateLevelProgress(totalXp: number): LevelProgressDetails {
    return calculateLevelProgress(totalXp);
  }

  /**
   * Returns metadata config for a given mastery tier.
   */
  getTierMetadata(tier: MasteryTier): TierMetadataDto {
    return TIER_METADATA_CONFIG[tier] ?? TIER_METADATA_CONFIG.BRONZE;
  }

  /**
   * Evaluates if an XP delta triggers a level up or tier promotion.
   */
  evaluateLevelUp(oldTotalXp: number, newTotalXp: number): LevelUpEventDto {
    const safeOldXp = Math.max(0, oldTotalXp);
    const safeNewXp = Math.max(safeOldXp, newTotalXp);

    const previousLevel = this.calculateLevelFromXp(safeOldXp);
    const currentLevel = this.calculateLevelFromXp(safeNewXp);
    const previousTier = this.calculateTierFromLevel(previousLevel);
    const currentTier = this.calculateTierFromLevel(currentLevel);

    const isLevelUp = currentLevel > previousLevel;
    const isTierPromotion = isLevelUp && currentTier !== previousTier;

    return {
      isLevelUp,
      previousLevel,
      currentLevel,
      previousTier,
      currentTier,
      isTierPromotion,
    };
  }
}
