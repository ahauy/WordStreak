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

  it("TC-LIB-15-007: re-queues beginner cards on Step 1 when rated Good (3) until graduated", async () => {
    // Import useAuthStore and set beginner user
    const { useAuthStore } = await import("../../../store/useAuthStore");
    useAuthStore.setState({
      user: {
        id: "beginner-user",
        email: "beginner@test.com",
        username: "beginner",
        startingLevel: "ZERO",
        dailyGoal: 5,
        streak: 0,
        streakFreezes: 0,
        freezeUsedToday: false,
        totalXp: 0,
        level: 1,
        tier: "BRONZE",
        currentLevelXp: 0,
        nextLevelRequiredXp: 100,
        levelProgressPercent: 0,
        role: "USER",
        preferredLanguage: "vi",
        createdAt: new Date().toISOString(),
      },
      token: "mock-token",
      refreshToken: "mock-refresh",
      isAuthenticated: true,
    });

    const newCard: DueCardItem = {
      id: "card-new-1",
      cardId: "card-new-1",
      deckId: "deck-1",
      deckTitle: "Foundation Deck",
      word: "hello",
      meaning: "xin chào",
      status: "NEW",
      interval: 0,
      repetitions: 0,
      easeFactor: 2.5,
      nextReviewDate: new Date().toISOString(),
    };

    vi.spyOn(reviewsService, "getDueCards").mockResolvedValue({
      data: [newCard],
    });
    vi.spyOn(reviewsService, "submitReview").mockResolvedValue({
      cardId: "card-new-1",
      status: "LEARNING_STEP",
      interval: 0,
      repetitions: 0,
      easeFactor: 2.5,
      lastReviewedAt: new Date().toISOString(),
      nextReviewDate: new Date().toISOString(),
    });

    const { result } = renderHook(() => useReviewSession());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Initial card is in queue
    expect(result.current.currentCard?.cardId).toBe("card-new-1");

    // Rate Good (3) on Step 1 -> Should NOT complete, but re-queue as step 1
    await act(async () => {
      await result.current.rateCard(3);
    });

    expect(result.current.isCompleted).toBe(false);
    expect(result.current.currentCard?.status).toBe("LEARNING_STEP");
    expect(result.current.currentCard?.learningStep).toBe(1);

    // Rate Good (3) on Step 2 -> Now it graduates and session completes
    await act(async () => {
      await result.current.rateCard(3);
    });

    expect(result.current.isCompleted).toBe(true);
  });
});
