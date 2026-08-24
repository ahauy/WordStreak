import "fake-indexeddb/auto";
import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { precacheManager } from "../precacheManager";
import {
  getOfflineDeck,
  getOfflineCardsByDeck,
  purgeOfflineDatabase,
} from "../offlineDatabase";
import { apiClient } from "../../../common/api/axios";

describe("PrecacheManager", () => {
  beforeEach(async () => {
    await purgeOfflineDatabase();
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("TC-PRECACHE-001: cacheDeckForOffline fetches deck and cards, persisting into IndexedDB", async () => {
    vi.spyOn(apiClient, "get").mockImplementation((url: string) => {
      if (url === "/decks/deck-101") {
        return Promise.resolve({
          data: {
            id: "deck-101",
            userId: "user-101",
            title: "IELTS Academic 100",
            description: "High-frequency words",
            color: "#000000",
            icon: "book",
            cardCount: 2,
          },
        });
      }
      if (url === "/decks/deck-101/cards") {
        return Promise.resolve({
          data: [
            {
              id: "card-1",
              deckId: "deck-101",
              word: "aberration",
              meaning: "a departure from what is normal",
              phonetic: "/ˌæb.əˈreɪ.ʃən/",
              audioUrl: null,
              interval: 0,
              easeFactor: 2.5,
              repetitions: 0,
            },
            {
              id: "card-2",
              deckId: "deck-101",
              word: "capitulate",
              meaning: "cease to resist an opponent",
              phonetic: "/kəˈpɪtʃ.ə.leɪt/",
              audioUrl: null,
              interval: 1,
              easeFactor: 2.5,
              repetitions: 1,
            },
          ],
        });
      }
      return Promise.reject(new Error("Not found"));
    });

    const result = await precacheManager.cacheDeckForOffline(
      "deck-101",
      "user-101",
    );
    expect(result.cardCount).toBe(2);

    const savedDeck = await getOfflineDeck("deck-101");
    expect(savedDeck).toBeDefined();
    expect(savedDeck?.title).toBe("IELTS Academic 100");
    expect(savedDeck?.isOfflineAvailable).toBe(true);

    const savedCards = await getOfflineCardsByDeck("deck-101");
    expect(savedCards).toHaveLength(2);
    expect(savedCards.map((c) => c.word)).toContain("aberration");
  });

  it("TC-PRECACHE-002: isDeckCached checks offline availability accurately", async () => {
    expect(await precacheManager.isDeckCached("non-existent")).toBe(false);
  });

  it("TC-PRECACHE-003: removeDeckFromOffline deletes deck and cards", async () => {
    vi.spyOn(apiClient, "get").mockImplementation((url: string) => {
      if (url === "/decks/deck-102") {
        return Promise.resolve({
          data: {
            id: "deck-102",
            title: "TOEFL Essential",
            color: "#000000",
            icon: "layers",
          },
        });
      }
      if (url === "/decks/deck-102/cards") {
        return Promise.resolve({ data: [] });
      }
      return Promise.reject(new Error("Not found"));
    });

    await precacheManager.cacheDeckForOffline("deck-102");
    expect(await precacheManager.isDeckCached("deck-102")).toBe(true);

    await precacheManager.removeDeckFromOffline("deck-102");
    expect(await precacheManager.isDeckCached("deck-102")).toBe(false);
  });
});
