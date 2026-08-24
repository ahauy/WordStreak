/**
 * OpenAPI & TypeScript Contract for PWA & Offline Reviews Batch Synchronization
 * Endpoint: POST /api/v1/reviews/sync-batch (Alias: POST /api/v1/reviews/sync-offline)
 */

import {
  IsArray,
  IsEnum,
  IsInt,
  IsISO8601,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
  ArrayMaxSize,
  ArrayMinSize,
  ValidateNested,
} from "class-validator";
import { Type } from "class-transformer";

// ==========================================
// 1. IndexedDB Client Entities
// ==========================================

export type CardLearningStatus = "NEW" | "LEARNING" | "MASTERED";
export type ReviewRating = 1 | 2 | 3 | 4; // 1: Again, 2: Hard, 3: Good, 4: Easy
export type ReviewQueueStatus = "PENDING" | "SYNCING" | "FAILED";

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
  phonetic?: string;
  audioUrl?: string;
  exampleSentence?: string;
  exampleTranslation?: string;
  collocations?: string;
  mnemonic?: string;
  imageUrl?: string;
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
  value: any;
  updatedAt: string; // ISO-8601
}

// ==========================================
// 2. Request DTOs
// ==========================================

export class SyncReviewItemDto {
  @IsUUID("4", { message: "idempotencyKey must be a valid UUID v4" })
  idempotencyKey: string;

  @IsUUID("4", { message: "cardId must be a valid UUID v4" })
  cardId: string;

  @IsInt()
  @Min(1)
  @Max(4)
  rating: ReviewRating;

  @IsInt()
  @Min(0)
  interval: number;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(1.3)
  easeFactor: number;

  @IsInt()
  @Min(0)
  repetitions: number;

  @IsISO8601(
    {},
    { message: "reviewedAtClient must be a valid ISO-8601 string" },
  )
  reviewedAtClient: string;
}

export class SyncReviewBatchDto {
  @IsString()
  @IsOptional()
  clientTimezone?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SyncReviewItemDto)
  @ArrayMinSize(1)
  @ArrayMaxSize(100)
  reviews: SyncReviewItemDto[];
}

// ==========================================
// 3. Response DTOs & Conflict Types
// ==========================================

export type ConflictResolutionAction =
  "DELETED_CARD_DROPPED" | "CONTENT_PRESERVED" | "TIMESTAMP_RESOLVED";

export class SyncConflictResolutionDto {
  cardId: string;
  action: ConflictResolutionAction;
  reason?: string;
}

export class SyncReviewResponseDto {
  processedCount: number;
  syncedCardIds: string[];
  totalXpAwarded: number;
  streakUpdated: boolean;
  currentStreak: number;
  bestStreak: number;
  conflicts: SyncConflictResolutionDto[];
  serverTimestamp: string;
}

// ==========================================
// 4. API Route Contract Specification
// ==========================================

export interface SyncBatchRouteContract {
  method: "POST";
  path: "/api/v1/reviews/sync-batch";
  aliases: ["/api/v1/reviews/sync-offline"];
  headers: {
    Authorization: "Bearer <jwt_token>";
    "Content-Type": "application/json";
  };
  requestBody: SyncReviewBatchDto;
  responses: {
    200: {
      description: "Reviews processed and synchronized successfully";
      body: SyncReviewResponseDto;
    };
    400: {
      description: "Invalid review payload or future timestamp detected";
      body: {
        statusCode: 400;
        message: string[];
        error: "Bad Request";
      };
    };
    401: {
      description: "Unauthorized - invalid or expired JWT";
      body: {
        statusCode: 401;
        message: "Unauthorized";
      };
    };
    429: {
      description: "Rate limit exceeded (Max 20 sync requests / minute)";
      body: {
        statusCode: 429;
        message: "ThrottlerException: Too Many Requests";
      };
    };
  };
}
