import "fake-indexeddb/auto";
import { describe, it, expect, beforeEach } from "vitest";
import {
  saveDeckOffline,
  getOfflineDecks,
  getOfflineDeck,
  saveCardsOffline,
  getOfflineCardsByDeck,
  getDueOfflineCards,
  queueOfflineReview,
  getPendingReviews,
  markReviewSynced,
  deleteDeckOffline,
  getStorageEstimate,
  runLruMediaSweep,
  purgeOfflineDatabase,
  saveCachedMedia,
  getCachedMedia,
  getOfflinePreference,
  setOfflinePreference,
} from "../offlineDatabase";
import type {
  OfflineDeckEntity,
  OfflineCardEntity,
} from "@wordstreak/shared-types";

describe("OfflineDatabase", () => {
  beforeEach(async () => {
    await purgeOfflineDatabase();
  });

  const mockDeck: OfflineDeckEntity = {
    id: "deck-123",
    userId: "user-1",
    title: "Oxford 3000 Core",
    description: "Core vocabulary",
    color: "#000000",
    icon: "layers",
    isOfflineAvailable: true,
    totalCards: 2,
    cachedAt: new Date().toISOString(),
    lastSyncedAt: new Date().toISOString(),
  };

  const mockCards: OfflineCardEntity[] = [
    {
      id: "card-1",
      deckId: "deck-123",
      word: "resilient",
      meaning: "able to withstand or recover quickly",
      phonetic: "/rɪˈzɪliənt/",
      audioUrl: "https://audio.example.com/resilient.mp3",
      status: "LEARNING",
      interval: 1,
      easeFactor: 2.5,
      repetitions: 1,
      nextReviewDate: new Date(Date.now() - 1000 * 60).toISOString(), // due (in the past)
      cachedAt: new Date().toISOString(),
    },
    {
      id: "card-2",
      deckId: "deck-123",
      word: "ephemeral",
      meaning: "lasting for a very short time",
      phonetic: "/ɪˈfem(ə)rəl/",
      audioUrl: null,
      status: "LEARNING",
      interval: 10,
      easeFactor: 2.5,
      repetitions: 2,
      nextReviewDate: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(), // due tomorrow
      cachedAt: new Date().toISOString(),
    },
  ];

  it("TC-IDB-001: saves and retrieves decks offline", async () => {
    await saveDeckOffline(mockDeck);
    const decks = await getOfflineDecks("user-1");
    expect(decks).toHaveLength(1);
    expect(decks[0].title).toBe("Oxford 3000 Core");

    const singleDeck = await getOfflineDeck("deck-123");
    expect(singleDeck).toBeDefined();
    expect(singleDeck?.id).toBe("deck-123");
  });

  it("TC-IDB-002: saves and retrieves cards by deck", async () => {
    await saveCardsOffline(mockCards);
    const cards = await getOfflineCardsByDeck("deck-123");
    expect(cards).toHaveLength(2);
    expect(cards.map((c) => c.word)).toEqual(["resilient", "ephemeral"]);
  });

  it("TC-IDB-003: queries due offline cards with date cutoff", async () => {
    await saveCardsOffline(mockCards);
    const dueCards = await getDueOfflineCards("deck-123", new Date());
    expect(dueCards).toHaveLength(1);
    expect(dueCards[0].word).toBe("resilient");
  });

  it("TC-IDB-004: queues review and retrieves pending reviews", async () => {
    const queued = await queueOfflineReview({
      userId: "user-1",
      cardId: "card-1",
      rating: 3,
      interval: 1,
      easeFactor: 2.5,
      repetitions: 1,
      reviewedAtClient: new Date().toISOString(),
      clientTimezone: "Asia/Ho_Chi_Minh",
    });

    expect(queued.id).toBeDefined();
    expect(queued.status).toBe("PENDING");

    const pending = await getPendingReviews("user-1");
    expect(pending).toHaveLength(1);
    expect(pending[0].cardId).toBe("card-1");
  });

  it("TC-IDB-005: marks reviews as synced (removes them from queue)", async () => {
    const queued = await queueOfflineReview({
      userId: "user-1",
      cardId: "card-1",
      rating: 4,
      interval: 6,
      easeFactor: 2.6,
      repetitions: 2,
      reviewedAtClient: new Date().toISOString(),
      clientTimezone: "Asia/Ho_Chi_Minh",
    });

    await markReviewSynced([queued.id]);
    const pending = await getPendingReviews("user-1");
    expect(pending).toHaveLength(0);
  });

  it("TC-IDB-006: deletes deck offline cascading to cards", async () => {
    await saveDeckOffline(mockDeck);
    await saveCardsOffline(mockCards);

    await deleteDeckOffline("deck-123");

    const decks = await getOfflineDecks("user-1");
    expect(decks).toHaveLength(0);

    const cards = await getOfflineCardsByDeck("deck-123");
    expect(cards).toHaveLength(0);
  });

  it("TC-IDB-007: saves and gets cached media", async () => {
    const mediaBlob = new Blob(["mock-mp3-audio-data"], {
      type: "audio/mpeg",
    });
    await saveCachedMedia(
      "https://audio.example.com/resilient.mp3",
      mediaBlob,
      "audio/mpeg",
    );

    const cached = await getCachedMedia(
      "https://audio.example.com/resilient.mp3",
    );
    expect(cached).not.toBeNull();
    expect(cached?.size).toBe(mediaBlob.size);
  });

  it("TC-IDB-008: LRU media sweep purges oldest media when exceeding quota", async () => {
    const blob1 = new Blob([new Uint8Array(100)], { type: "audio/mpeg" });
    const blob2 = new Blob([new Uint8Array(200)], { type: "audio/mpeg" });

    const olderTime = new Date(Date.now() - 3600 * 1000).toISOString();
    const newerTime = new Date().toISOString();

    await saveCachedMedia(
      "https://audio.example.com/old.mp3",
      blob1,
      "audio/mpeg",
      olderTime,
    );
    await saveCachedMedia(
      "https://audio.example.com/new.mp3",
      blob2,
      "audio/mpeg",
      newerTime,
    );

    // Run sweep with targetMaxBytes = 250 bytes (total is 300)
    const purged = await runLruMediaSweep(250);
    expect(purged).toBeGreaterThanOrEqual(1);

    const oldMedia = await getCachedMedia("https://audio.example.com/old.mp3");
    expect(oldMedia).toBeNull();
  });

  it("TC-IDB-009: gets and sets PWA preferences", async () => {
    await setOfflinePreference("pwa_install_snoozed_until", 1700000000000);
    const pref = await getOfflinePreference("pwa_install_snoozed_until", 0);
    expect(pref).toBe(1700000000000);

    const defaultVal = await getOfflinePreference(
      "non_existent_key",
      "default",
    );
    expect(defaultVal).toBe("default");
  });

  it("TC-IDB-010: estimates storage usage metrics accurately", async () => {
    await saveDeckOffline(mockDeck);
    await saveCardsOffline(mockCards);
    const estimate = await getStorageEstimate();
    expect(estimate.offlineDeckCount).toBe(1);
    expect(estimate.offlineCardCount).toBe(2);
  });
});
