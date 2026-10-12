import "fake-indexeddb/auto";
import { renderHook, act, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { useReviewSession } from "./useReviewSession";
import { reviewsService } from "../services/reviewsService";
import type { DueCardItem } from "@wordstreak/shared-types";

describe("useReviewSession - TC-EDB-013 Web App Review Sync Bridge", () => {
  const mockDueCard: DueCardItem = {
    id: "card-1",
    cardId: "card-1",
    deckId: "deck-1",
    deckTitle: "English 101",
    word: "ubiquitous",
    meaning: "present everywhere",
    status: "LEARNING",
    interval: 1,
    repetitions: 1,
    easeFactor: 2.5,
    nextReviewDate: new Date().toISOString(),
  };

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("TC-EDB-013: emits WORDSTREAK_REVIEW_SYNC via window.postMessage when online submitReview succeeds", async () => {
    vi.spyOn(reviewsService, "getDueCards").mockResolvedValue({
      data: [mockDueCard],
    });
    vi.spyOn(reviewsService, "submitReview").mockResolvedValue({
      cardId: "card-1",
      status: "LEARNING",
      interval: 2,
      repetitions: 2,
      easeFactor: 2.5,
      lastReviewedAt: new Date().toISOString(),
      nextReviewDate: new Date().toISOString(),
    });

    const postMessageSpy = vi.spyOn(window, "postMessage");

    const { result } = renderHook(() => useReviewSession());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.currentCard?.cardId).toBe("card-1");

    await act(async () => {
      await result.current.rateCard(3);
    });

    expect(postMessageSpy).toHaveBeenCalledWith(
      { type: "WORDSTREAK_REVIEW_SYNC" },
      "*",
    );
  });

  it("TC-EDB-013: does NOT emit WORDSTREAK_REVIEW_SYNC when submitReview rejects", async () => {
    vi.spyOn(reviewsService, "getDueCards").mockResolvedValue({
      data: [mockDueCard],
    });
    vi.spyOn(reviewsService, "submitReview").mockRejectedValue(
      new Error("Network submission failed"),
    );

    const postMessageSpy = vi.spyOn(window, "postMessage");

    const { result } = renderHook(() => useReviewSession());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await act(async () => {
      await result.current.rateCard(3);
    });

    expect(postMessageSpy).not.toHaveBeenCalledWith(
      { type: "WORDSTREAK_REVIEW_SYNC" },
      "*",
    );
  });
});
