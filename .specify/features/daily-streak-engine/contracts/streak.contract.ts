export interface UserStreakDto {
  userId: string;
  currentStreak: number;
  bestStreak: number;
  lastActiveDate: string | null;
  isActiveToday: boolean;
  isPendingToday: boolean;
  timezone: string;
  flameTier: 1 | 2 | 3 | 4;
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
}
