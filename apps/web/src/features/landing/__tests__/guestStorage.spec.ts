import { describe, it, expect, beforeEach } from "vitest";
import {
  getGuestPreviewState,
  saveGuestPreviewState,
  recordGuestRating,
  clearGuestPreviewState,
  GUEST_SAMPLE_CARDS,
  GUEST_STORAGE_KEY,
} from "../utils/guestStorage";

describe("guestStorage (US-START-03)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("TC-GUEST-001: returns default initial state when storage is empty", () => {
    const state = getGuestPreviewState();
    expect(state.currentIndex).toBe(0);
    expect(state.reviewedCards).toEqual([]);
    expect(state.isCompleted).toBe(false);
  });

  it("TC-GUEST-002: saves and retrieves state correctly", () => {
    saveGuestPreviewState({
      currentIndex: 2,
      reviewedCards: [{ cardId: "guest-card-1", rating: 3, timestamp: 12345 }],
      isCompleted: false,
    });

    const state = getGuestPreviewState();
    expect(state.currentIndex).toBe(2);
    expect(state.reviewedCards.length).toBe(1);
    expect(state.reviewedCards[0].cardId).toBe("guest-card-1");
  });

  it("TC-GUEST-003: recordGuestRating increments index and tracks card review", () => {
    const firstCard = GUEST_SAMPLE_CARDS[0];
    const updated = recordGuestRating(firstCard.id, 4);

    expect(updated.currentIndex).toBe(1);
    expect(updated.reviewedCards.length).toBe(1);
    expect(updated.reviewedCards[0].cardId).toBe(firstCard.id);
    expect(updated.reviewedCards[0].rating).toBe(4);
    expect(updated.isCompleted).toBe(false);
  });

  it("TC-GUEST-004: marks isCompleted when reaching 5 cards", () => {
    for (let i = 0; i < GUEST_SAMPLE_CARDS.length; i++) {
      recordGuestRating(GUEST_SAMPLE_CARDS[i].id, 3);
    }

    const state = getGuestPreviewState();
    expect(state.currentIndex).toBe(GUEST_SAMPLE_CARDS.length);
    expect(state.reviewedCards.length).toBe(GUEST_SAMPLE_CARDS.length);
    expect(state.isCompleted).toBe(true);
    expect(state.completedAt).toBeDefined();
  });

  it("TC-GUEST-005: clearGuestPreviewState wipes storage cleanly", () => {
    saveGuestPreviewState({
      currentIndex: 3,
      reviewedCards: [],
      isCompleted: false,
    });
    expect(localStorage.getItem(GUEST_STORAGE_KEY)).not.toBeNull();

    clearGuestPreviewState();
    expect(localStorage.getItem(GUEST_STORAGE_KEY)).toBeNull();
    expect(getGuestPreviewState().currentIndex).toBe(0);
  });
});
