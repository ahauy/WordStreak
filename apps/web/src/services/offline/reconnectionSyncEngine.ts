import { apiClient } from "../../common/api/axios";
import {
  getPendingReviews,
  markReviewSynced,
  updateReviewQueueStatus,
} from "./offlineDatabase";
import type {
  SyncReviewBatchDto,
  SyncReviewResponseDto,
  ReviewQueueEntity,
} from "@wordstreak/shared-types";

export const INITIAL_BACKOFF_MS = 5000;
export const MAX_BACKOFF_MS = 60000;

export function calculateExponentialBackoff(retryCount: number): number {
  const backoff = INITIAL_BACKOFF_MS * Math.pow(2, retryCount);
  return Math.min(backoff, MAX_BACKOFF_MS);
}

export class ReconnectionSyncEngine {
  private isSyncing = false;
  private retryTimeout: ReturnType<typeof setTimeout> | null = null;
  private currentRetryCount = 0;
  private onlineHandler: (() => void) | null = null;

  /**
   * Synchronizes all pending offline reviews with the backend.
   */
  async syncNow(userId?: string): Promise<SyncReviewResponseDto | null> {
    if (this.isSyncing) {
      return null;
    }

    const pendingReviews = await getPendingReviews(userId);
    if (pendingReviews.length === 0) {
      return null;
    }

    this.isSyncing = true;
    this.dispatchSyncStatus("SYNCING", pendingReviews.length);

    try {
      // Mark as SYNCING in IndexedDB
      await Promise.all(
        pendingReviews.map((r) => updateReviewQueueStatus(r.id, "SYNCING")),
      );

      const batchDto: SyncReviewBatchDto = {
        clientTimezone:
          Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC",
        reviews: pendingReviews.map((r: ReviewQueueEntity) => ({
          idempotencyKey: r.id,
          cardId: r.cardId,
          rating: r.rating,
          interval: r.interval,
          easeFactor: r.easeFactor,
          repetitions: r.repetitions,
          reviewedAtClient: r.reviewedAtClient,
        })),
      };

      const response = await apiClient.post<SyncReviewResponseDto>(
        "/reviews/sync-batch",
        batchDto,
      );

      const data = response.data;

      // Mark all successfully processed and conflict items as synced
      const syncedReviewIds = pendingReviews.map((r) => r.id);
      await markReviewSynced(syncedReviewIds);

      this.currentRetryCount = 0;
      this.dispatchSyncCompleted(data);

      return data;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Sync failed";

      await Promise.all(
        pendingReviews.map((r) =>
          updateReviewQueueStatus(r.id, "FAILED", errorMessage),
        ),
      );

      this.dispatchSyncFailed(errorMessage);
      this.scheduleRetry(userId);
      throw error;
    } finally {
      this.isSyncing = false;
    }
  }

  private scheduleRetry(userId?: string): void {
    if (typeof window === "undefined" || !navigator.onLine) {
      return;
    }

    if (this.retryTimeout) {
      clearTimeout(this.retryTimeout);
    }

    const delay = calculateExponentialBackoff(this.currentRetryCount);
    this.currentRetryCount += 1;

    this.retryTimeout = setTimeout(() => {
      this.syncNow(userId).catch(() => {
        // Retry errors handled in syncNow
      });
    }, delay);
  }

  startReconnectionListener(userId?: string): void {
    if (typeof window === "undefined") return;

    this.stopReconnectionListener();

    this.onlineHandler = () => {
      this.currentRetryCount = 0;
      this.syncNow(userId).catch(() => {
        // Handled internally
      });
    };

    window.addEventListener("online", this.onlineHandler);

    // Initial check on mount
    if (navigator.onLine) {
      this.syncNow(userId).catch(() => {
        // Initial sync attempt
      });
    }
  }

  stopReconnectionListener(): void {
    if (typeof window === "undefined") return;

    if (this.onlineHandler) {
      window.removeEventListener("online", this.onlineHandler);
      this.onlineHandler = null;
    }

    if (this.retryTimeout) {
      clearTimeout(this.retryTimeout);
      this.retryTimeout = null;
    }
  }

  private dispatchSyncStatus(
    status: "SYNCING" | "IDLE",
    pendingCount: number,
  ): void {
    if (typeof window === "undefined") return;
    window.dispatchEvent(
      new CustomEvent("wordstreak:sync-status", {
        detail: { status, pendingCount },
      }),
    );
  }

  private dispatchSyncCompleted(data: SyncReviewResponseDto): void {
    if (typeof window === "undefined") return;
    window.dispatchEvent(
      new CustomEvent("wordstreak:sync-completed", {
        detail: data,
      }),
    );

    if (data.totalXpAwarded > 0) {
      window.dispatchEvent(
        new CustomEvent("wordstreak:xp-updated", {
          detail: { xpEarned: data.totalXpAwarded },
        }),
      );
    }

    if (data.streakUpdated) {
      window.dispatchEvent(
        new CustomEvent("wordstreak:streak-updated", {
          detail: {
            currentStreak: data.currentStreak,
            bestStreak: data.bestStreak,
          },
        }),
      );
    }
  }

  private dispatchSyncFailed(error: string): void {
    if (typeof window === "undefined") return;
    window.dispatchEvent(
      new CustomEvent("wordstreak:sync-failed", {
        detail: { error },
      }),
    );
  }
}

export const reconnectionSyncEngine = new ReconnectionSyncEngine();
