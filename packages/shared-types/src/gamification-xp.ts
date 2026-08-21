/**
 * TypeScript Contracts & DTOs for Gamification XP & Learner Levels System (US-GAME-03)
 * Feature Slug: gamification-xp-levels
 * Monorepo target: packages/shared-types/src/gamification-xp.ts
 */

// ==========================================
// 1. Enums & Constants
// ==========================================

export const MasteryTier = {
  BRONZE: "BRONZE",
  SILVER: "SILVER",
  GOLD: "GOLD",
  DIAMOND: "DIAMOND",
  MASTER: "MASTER",
} as const;

export type MasteryTier = (typeof MasteryTier)[keyof typeof MasteryTier];

export const XpActionType = {
  CARD_REVIEW: "CARD_REVIEW",
  DAILY_GOAL_COMPLETED: "DAILY_GOAL_COMPLETED",
  STREAK_7_DAYS: "STREAK_7_DAYS",
  STREAK_30_DAYS: "STREAK_30_DAYS",
  PRACTICE_QUIZ: "PRACTICE_QUIZ",
  ADMIN_ADJUSTMENT: "ADMIN_ADJUSTMENT",
  HISTORICAL_BACKFILL: "HISTORICAL_BACKFILL",
} as const;

export type XpActionType = (typeof XpActionType)[keyof typeof XpActionType];

export interface TierMetadataDto {
  tier: MasteryTier;
  nameEn: string;
  nameVi: string;
  minLevel: number;
  maxLevel: number;
  colorHex: string;
  badgeIcon: string;
}

export const TIER_METADATA_CONFIG: Record<MasteryTier, TierMetadataDto> = {
  BRONZE: {
    tier: MasteryTier.BRONZE,
    nameEn: "Bronze",
    nameVi: "Đồng",
    minLevel: 1,
    maxLevel: 5,
    colorHex: "#B45309",
    badgeIcon: "bronze-crest",
  },
  SILVER: {
    tier: MasteryTier.SILVER,
    nameEn: "Silver",
    nameVi: "Bạc",
    minLevel: 6,
    maxLevel: 15,
    colorHex: "#94A3B8",
    badgeIcon: "silver-crest",
  },
  GOLD: {
    tier: MasteryTier.GOLD,
    nameEn: "Gold",
    nameVi: "Vàng",
    minLevel: 16,
    maxLevel: 30,
    colorHex: "#D97706",
    badgeIcon: "gold-crest",
  },
  DIAMOND: {
    tier: MasteryTier.DIAMOND,
    nameEn: "Diamond",
    nameVi: "Kim Cương",
    minLevel: 31,
    maxLevel: 45,
    colorHex: "#06B6D4",
    badgeIcon: "diamond-crest",
  },
  MASTER: {
    tier: MasteryTier.MASTER,
    nameEn: "Master",
    nameVi: "Cao Thủ",
    minLevel: 46,
    maxLevel: 999,
    colorHex: "#8B5CF6",
    badgeIcon: "master-crest",
  },
};

// ==========================================
// 2. Pure Level & Tier Formula Calculations
// ==========================================

/**
 * Computes the minimum lifetime XP threshold required to reach Level L.
 * Formula: floor(50 * (L - 1)^1.5 + 50 * (L - 1))
 */
export function calculateThresholdForLevel(level: number): number {
  if (level <= 1) return 0;
  const lMinus1 = level - 1;
  return Math.floor(50 * Math.pow(lMinus1, 1.5) + 50 * lMinus1);
}

/**
 * Computes the current level for a given lifetime total XP.
 */
export function calculateLevelFromXp(totalXp: number): number {
  if (totalXp <= 0) return 1;
  let level = 1;
  while (totalXp >= calculateThresholdForLevel(level + 1)) {
    level++;
  }
  return level;
}

/**
 * Derives the Mastery Tier corresponding to a given Level.
 */
export function calculateTierFromLevel(level: number): MasteryTier {
  if (level >= 46) return MasteryTier.MASTER;
  if (level >= 31) return MasteryTier.DIAMOND;
  if (level >= 16) return MasteryTier.GOLD;
  if (level >= 6) return MasteryTier.SILVER;
  return MasteryTier.BRONZE;
}

export interface LevelProgressDetails {
  level: number;
  tier: MasteryTier;
  currentLevelThresholdXp: number;
  nextLevelThresholdXp: number;
  currentLevelXp: number;
  nextLevelRequiredXp: number;
  progressPercent: number;
}

/**
 * Computes detailed level progress metrics from total XP.
 */
export function calculateLevelProgress(totalXp: number): LevelProgressDetails {
  const safeXp = Math.max(0, totalXp);
  const level = calculateLevelFromXp(safeXp);
  const tier = calculateTierFromLevel(level);

  const currentLevelThresholdXp = calculateThresholdForLevel(level);
  const nextLevelThresholdXp = calculateThresholdForLevel(level + 1);

  const currentLevelXp = safeXp - currentLevelThresholdXp;
  const nextLevelRequiredXp = nextLevelThresholdXp - currentLevelThresholdXp;

  const rawPercent = (currentLevelXp / nextLevelRequiredXp) * 100;
  const progressPercent = Math.min(
    100,
    Math.max(0, Math.round(rawPercent * 100) / 100),
  );

  return {
    level,
    tier,
    currentLevelThresholdXp,
    nextLevelThresholdXp,
    currentLevelXp,
    nextLevelRequiredXp,
    progressPercent,
  };
}

// ==========================================
// 3. Event & Breakdown DTOs
// ==========================================

export interface XpBreakdownItem {
  type: XpActionType | "RATE_LIMITED";
  xp: number;
  description?: string;
}

export interface LevelUpEventDto {
  isLevelUp: boolean;
  previousLevel: number;
  currentLevel: number;
  previousTier: MasteryTier;
  currentTier: MasteryTier;
  isTierPromotion: boolean;
}

export interface XpReviewRewardDto {
  xpEarned: number;
  breakdown: XpBreakdownItem[];
  totalXp: number;
  level: number;
  tier: MasteryTier;
  currentLevelXp: number;
  nextLevelRequiredXp: number;
  levelProgressPercent: number;
  levelUp: LevelUpEventDto;
}

// ==========================================
// 4. API Request & Response DTOs
// ==========================================

export interface XpSummaryResponseDto {
  userId: string;
  totalXp: number;
  level: number;
  tier: MasteryTier;
  currentLevelXp: number;
  nextLevelRequiredXp: number;
  levelProgressPercent: number;
  todayXp: number;
  dailyGoalBonusEarnedToday: boolean;
  nextTier: MasteryTier | null;
  nextTierLevel: number | null;
  tierMetadata: TierMetadataDto;
}

export interface UserActivityLogItemDto {
  id: string;
  activityType: XpActionType;
  xpEarned: number;
  metadata: Record<string, unknown> | null;
  createdAt: string;
}

export interface XpHistoryQueryDto {
  page?: number;
  limit?: number;
  activityType?: XpActionType;
}

export interface XpHistoryResponseDto {
  data: UserActivityLogItemDto[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface AwardPracticeXpDto {
  sessionId: string;
  score: number;
  totalQuestions: number;
}

export interface PracticeQuizXpRewardDto {
  sessionId: string;
  scorePercentage: number;
  xpEarned: number;
  totalXp: number;
  level: number;
  tier: MasteryTier;
  levelUp: LevelUpEventDto;
}

export interface LeaderboardEntryDto {
  userId: string;
  username: string;
  avatarUrl: string | null;
  totalXp: number;
  level: number;
  tier: MasteryTier;
  rank: number;
}
