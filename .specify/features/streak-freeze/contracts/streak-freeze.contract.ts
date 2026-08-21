/**
 * Streak Freeze Protection API Contracts & DTOs
 */

export interface UserStreakFreezeDto {
  userId: string;
  currentStreak: number;
  bestStreak: number;
  lastActiveDate: string | null;
  isActiveToday: boolean;
  isPendingToday: boolean;
  timezone: string;
  flameTier: 1 | 2 | 3 | 4;

  // Streak Freeze Extensions:
  streakFreezes: number;
  maxStreakFreezes: number;
  totalFreezesUsed: number;
  lastFreezeDate: string | null;
  wasProtectedByFreeze?: boolean;
  freezesUsed?: number;
}

export interface RecordStreakActivityFreezeResponseDto {
  currentStreak: number;
  bestStreak: number;
  streakIncreased: boolean;
  isActiveToday: boolean;
  flameTier: 1 | 2 | 3 | 4;
  message: string;

  // Streak Freeze Extensions:
  streakFreezes: number;
  wasProtectedByFreeze?: boolean;
  freezesUsed?: number;
  earnedMilestoneFreeze?: boolean;
}
