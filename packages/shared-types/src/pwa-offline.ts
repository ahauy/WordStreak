/**
 * Shared Types & DTO Interfaces for PWA & Offline Study Mode (US-ECO-04)
 * Feature slug: pwa-offline-mode
 */

import type { CardLearningStatus } from "./reviews.js";

// ==========================================
// 1. Enums & Literal Types
// ==========================================

export type ReviewRating = 1 | 2 | 3 | 4; // 1: Again, 2: Hard, 3: Good, 4: Easy
export type ReviewQueueStatus = "PENDING" | "SYNCING" | "FAILED";
export type OfflineSyncStatus =
  "IDLE" | "OFFLINE" | "SYNCING" | "SUCCESS" | "ERROR";

export type ConflictResolutionAction =
  "DELETED_CARD_DROPPED" | "CONTENT_PRESERVED" | "TIMESTAMP_RESOLVED" | "NONE";

// ==========================================
// 2. Client IndexedDB Storage Entities
// ==========================================

export interface OfflineDeckEntity {
  id: string; // Deck UUID
  userId: string;
  title: string;
  description?: string;
  color: string;
  icon: string;
  isOfflineAvailable: boolean;
  totalCards: number;
  cachedAt: string; // ISO-8601
  lastSyncedAt: string; // ISO-8601
}

export interface OfflineCardEntity {
  id: string; // Card UUID
  deckId: string; // Deck UUID
  word: string;
  meaning: string;
  phonetic?: string | null;
  audioUrl?: string | null;
  exampleSentence?: string | null;
  exampleTranslation?: string | null;
  collocations?: string | null;
  mnemonic?: string | null;
  imageUrl?: string | null;
  status: CardLearningStatus;
  interval: number;
  easeFactor: number;
  repetitions: number;
  nextReviewDate: string; // ISO-8601
  cachedAt: string; // ISO-8601
}

export interface ReviewQueueEntity {
  id: string; // UUID (idempotency key)
  userId: string;
  cardId: string;
  rating: ReviewRating;
  interval: number;
  easeFactor: number;
  repetitions: number;
  reviewedAtClient: string; // ISO-8601 UTC
  clientTimezone: string; // e.g. "Asia/Ho_Chi_Minh"
  status: ReviewQueueStatus;
  retryCount: number;
  lastError?: string;
}

export interface CachedMediaEntity {
  url: string; // Primary key (remote media URL)
  mediaBlob: Blob;
  mimeType: string;
  byteSize: number;
  lastAccessedAt: string; // ISO-8601
  cachedAt: string; // ISO-8601
}

export interface PwaPreferencesEntity {
  key: string;
  value: unknown;
  updatedAt: string; // ISO-8601
}

// ==========================================
// 3. Batch Sync Request & Response DTOs
// ==========================================

export interface SyncReviewItemDto {
  idempotencyKey: string;
  cardId: string;
  rating: ReviewRating;
  interval: number;
  easeFactor: number;
  repetitions: number;
  reviewedAtClient: string; // ISO-8601
}

export interface SyncReviewBatchDto {
  clientTimezone?: string;
  reviews: SyncReviewItemDto[];
}

export interface SyncConflictResolution {
  cardId: string;
  action: ConflictResolutionAction;
  reason?: string;
}

export interface SyncReviewResponseDto {
  processedCount: number;
  syncedCount: number;
  failedCount: number;
  conflictsResolved: number;
  syncedCardIds: string[];
  totalXpAwarded: number;
  streakUpdated: boolean;
  currentStreak: number;
  bestStreak: number;
  conflicts: SyncConflictResolution[];
  serverTimestamp: string;
}
