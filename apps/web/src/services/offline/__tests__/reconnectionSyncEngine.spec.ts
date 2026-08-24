import "fake-indexeddb/auto";
import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import {
  queueOfflineReview,
  getPendingReviews,
  purgeOfflineDatabase,
} from "../offlineDatabase";
import {
  reconnectionSyncEngine,
  calculateExponentialBackoff,
} from "../reconnectionSyncEngine";
import { apiClient } from "../../../common/api/axios";
import type { SyncReviewResponseDto } from "@wordstreak/shared-types";

describe("ReconnectionSyncEngine", () => {
  beforeEach(async () => {
    await purgeOfflineDatabase();
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("TC-SYNC-001: calculateExponentialBackoff scales from 5s up to 60s cap", () => {
    expect(calculateExponentialBackoff(0)).toBe(5000);
    expect(calculateExponentialBackoff(1)).toBe(10000);
    expect(calculateExponentialBackoff(2)).toBe(20000);
    expect(calculateExponentialBackoff(3)).toBe(40000);
    expect(calculateExponentialBackoff(4)).toBe(60000);
    expect(calculateExponentialBackoff(10)).toBe(60000);
  });

  it("TC-SYNC-002: syncNow returns null when no reviews are pending", async () => {
    const result = await reconnectionSyncEngine.syncNow();
    expect(result).toBeNull();
  });

  it("TC-SYNC-003: syncNow batches pending reviews and calls POST /api/v1/reviews/sync-batch", async () => {
    await queueOfflineReview({
      userId: "user-123",
      cardId: "card-abc",
      rating: 3,
      interval: 1,
      easeFactor: 2.5,
      repetitions: 1,
      reviewedAtClient: new Date().toISOString(),
      clientTimezone: "Asia/Ho_Chi_Minh",
    });

    const mockResponseData: SyncReviewResponseDto = {
      processedCount: 1,
      syncedCount: 1,
      failedCount: 0,
      conflictsResolved: 0,
      syncedCardIds: ["card-abc"],
      totalXpAwarded: 10,
      streakUpdated: true,
      currentStreak: 5,
      bestStreak: 7,
      conflicts: [],
      serverTimestamp: new Date().toISOString(),
    };

    const postSpy = vi.spyOn(apiClient, "post").mockResolvedValueOnce({
      data: mockResponseData,
    });

    const result = await reconnectionSyncEngine.syncNow("user-123");

    expect(postSpy).toHaveBeenCalledTimes(1);
    expect(postSpy).toHaveBeenCalledWith(
      "/reviews/sync-batch",
      expect.objectContaining({
        reviews: expect.arrayContaining([
          expect.objectContaining({
            cardId: "card-abc",
            rating: 3,
          }),
        ]),
      }),
    );

    expect(result).toEqual(mockResponseData);

    // Queue should now be cleared
    const pendingAfter = await getPendingReviews("user-123");
    expect(pendingAfter).toHaveLength(0);
  });

  it("TC-SYNC-004: syncNow preserves failed queue items when network fails", async () => {
    await queueOfflineReview({
      userId: "user-123",
      cardId: "card-fail",
      rating: 4,
      interval: 6,
      easeFactor: 2.6,
      repetitions: 2,
      reviewedAtClient: new Date().toISOString(),
      clientTimezone: "UTC",
    });

    vi.spyOn(apiClient, "post").mockRejectedValueOnce(
      new Error("Network Error"),
    );

    await expect(reconnectionSyncEngine.syncNow("user-123")).rejects.toThrow(
      "Network Error",
    );

    const pendingAfter = await getPendingReviews("user-123");
    expect(pendingAfter).toHaveLength(1);
    expect(pendingAfter[0].retryCount).toBe(1);
    expect(pendingAfter[0].status).toBe("FAILED");
  });
});
