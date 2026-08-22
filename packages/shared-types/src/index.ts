import type { AppLanguage } from "./auth.js";
export * from "./auth.js";
export * from "./decks.js";
export * from "./cards.js";
export * from "./reviews.js";
export * from "./practice.js";
export * from "./streaks.js";
export * from "./ai-vocabulary.js";
export * from "./analytics.js";
export * from "./gamification-xp.js";
export * from "./community.js";

export interface User {
  id: string;
  username: string;
  email: string;
  dailyGoal: number;
  avatarUrl?: string | null;
  preferredLanguage?: AppLanguage;
  totalXp?: number;
  level?: number;
  tier?: string;
  createdAt: Date | string;
  updatedAt?: Date | string;
}

export interface GameStreak {
  userId: string;
  currentStreak: number;
  bestStreak: number;
  lastPlayedAt: Date;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
