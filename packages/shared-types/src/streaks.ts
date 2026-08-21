export interface UserStreakDto {
  userId: string;
  currentStreak: number;
  bestStreak: number;
  lastActiveDate: string | null;
  isActiveToday: boolean;
  isPendingToday: boolean;
  timezone: string;
  flameTier: 1 | 2 | 3 | 4;
  streakFreezes: number;
  maxStreakFreezes: number;
  totalFreezesUsed?: number;
  lastFreezeDate?: string | null;
  wasProtectedByFreeze?: boolean;
  freezesUsed?: number;
}

export interface RecordStreakActivityDto {
  timezone?: string;
}

export interface StreakActivityResponseDto {
  currentStreak: number;
  bestStreak: number;
  streakIncreased: boolean;
  isActiveToday: boolean;
  flameTier: 1 | 2 | 3 | 4;
  message: string;
  streakFreezes: number;
  wasProtectedByFreeze?: boolean;
  freezesUsed?: number;
  earnedMilestoneFreeze?: boolean;
}
