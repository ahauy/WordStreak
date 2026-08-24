import { apiClient } from "../../common/api/axios";
import {
  saveDeckOffline,
  saveCardsOffline,
  deleteDeckOffline,
  getOfflineDeck,
  saveCachedMedia,
  getCachedMedia,
} from "./offlineDatabase";
import type {
  OfflineDeckEntity,
  OfflineCardEntity,
  DeckResponse,
  CardResponse,
  DueCardItem,
} from "@wordstreak/shared-types";

export class PrecacheManager {
  /**
   * Downloads and caches an entire deck, its flashcards, and associated audio media for offline study.
   */
  async cacheDeckForOffline(
    deckId: string,
    userId: string = "current_user",
  ): Promise<{ cardCount: number; mediaBytes: number }> {
    // 1. Fetch deck metadata & cards from server
    const deckRes = await apiClient.get<DeckResponse>(`/decks/${deckId}`);
    const deckData = deckRes.data;

    let cardsData: CardResponse[] = [];
    try {
      const cardsRes = await apiClient.get<CardResponse[]>(
        `/decks/${deckId}/cards`,
      );
      cardsData = Array.isArray(cardsRes.data) ? cardsRes.data : [];
    } catch {
      // Fallback: If deck cards endpoint returns object or failure
      cardsData = [];
    }

    const now = new Date().toISOString();

    const offlineDeck: OfflineDeckEntity = {
      id: deckData.id,
      userId: deckData.userId || userId,
      title: deckData.title,
      description: deckData.description || undefined,
      color: deckData.color || "#000000",
      icon: deckData.icon || "layers",
      isOfflineAvailable: true,
      totalCards: cardsData.length || deckData.stats?.totalCards || 0,
      cachedAt: now,
      lastSyncedAt: now,
    };

    const offlineCards: OfflineCardEntity[] = cardsData.map((c) => ({
      id: c.id,
      deckId: c.deckId || deckId,
      word: c.word,
      meaning: c.meaning,
      phonetic: c.phonetic,
      audioUrl: c.audioUrl,
      exampleSentence: c.exampleSentence,
      exampleTranslation: null,
      collocations: c.collocations,
      mnemonic: c.mnemonic,
      imageUrl: c.imageUrl,
      status: (c.progress?.status as any) || "NEW",
      interval: c.progress?.interval || 0,
      easeFactor: c.progress?.easeFactor || 2.5,
      repetitions: c.progress?.repetitions || 0,
      nextReviewDate: c.progress?.nextReviewDate
        ? new Date(c.progress.nextReviewDate).toISOString()
        : now,
      cachedAt: now,
    }));

    // 2. Persist in IndexedDB
    await saveDeckOffline(offlineDeck);
    if (offlineCards.length > 0) {
      await saveCardsOffline(offlineCards);
    }

    // 3. Prefetch Audio Media Assets
    let totalMediaBytes = 0;
    const audioUrls = offlineCards
      .map((c) => c.audioUrl)
      .filter((url): url is string => Boolean(url && url.startsWith("http")));

    await Promise.all(
      audioUrls.map(async (url) => {
        try {
          const alreadyCached = await getCachedMedia(url);
          if (alreadyCached) {
            totalMediaBytes += alreadyCached.size;
            return;
          }
          const response = await fetch(url);
          if (response.ok) {
            const blob = await response.blob();
            await saveCachedMedia(url, blob, blob.type || "audio/mpeg");
            totalMediaBytes += blob.size;
          }
        } catch {
          // Audio prefetching failure should not block deck caching
        }
      }),
    );

    return {
      cardCount: offlineCards.length,
      mediaBytes: totalMediaBytes,
    };
  }

  /**
   * Removes a cached deck and its associated cards from offline IndexedDB.
   */
  async removeDeckFromOffline(deckId: string): Promise<void> {
    await deleteDeckOffline(deckId);
  }

  /**
   * Checks if a deck is available for offline study.
   */
  async isDeckCached(deckId: string): Promise<boolean> {
    const deck = await getOfflineDeck(deckId);
    return Boolean(deck && deck.isOfflineAvailable);
  }

  /**
   * Automatically pre-caches due review cards for offline study sessions.
   */
  async precacheDueCards(deckId?: string): Promise<number> {
    try {
      const url = deckId ? `/reviews/due?deckId=${deckId}` : "/reviews/due";
      const response = await apiClient.get<DueCardItem[]>(url);
      const dueCards = response.data;

      if (!Array.isArray(dueCards) || dueCards.length === 0) {
        return 0;
      }

      const now = new Date().toISOString();
      const offlineCards: OfflineCardEntity[] = dueCards.map((c) => ({
        id: c.cardId,
        deckId: c.deckId || deckId || "default",
        word: c.word,
        meaning: c.meaning,
        phonetic: c.phonetic,
        audioUrl: c.audioUrl,
        exampleSentence: c.exampleSentence,
        exampleTranslation: null,
        collocations: null,
        mnemonic: null,
        imageUrl: null,
        status: (c.status as any) || "LEARNING",
        interval: c.interval || 0,
        easeFactor: c.easeFactor || 2.5,
        repetitions: c.repetitions || 0,
        nextReviewDate: c.nextReviewDate
          ? new Date(c.nextReviewDate).toISOString()
          : now,
        cachedAt: now,
      }));

      await saveCardsOffline(offlineCards);

      // Async prefetch audio in background
      dueCards.forEach((c) => {
        if (c.audioUrl && c.audioUrl.startsWith("http")) {
          fetch(c.audioUrl)
            .then((r) => r.blob())
            .then((b) => saveCachedMedia(c.audioUrl!, b))
            .catch(() => {});
        }
      });

      return offlineCards.length;
    } catch {
      return 0;
    }
  }
}

export const precacheManager = new PrecacheManager();
