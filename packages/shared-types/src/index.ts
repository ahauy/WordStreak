// Shared types and interfaces between apps/api and apps/web

export interface User {
  id: string;
  username: string;
  email: string;
  createdAt: Date;
}

export interface GameStreak {
  userId: string;
  currentStreak: number;
  bestStreak: number;
  lastPlayedAt: Date;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export * from './auth.js';

