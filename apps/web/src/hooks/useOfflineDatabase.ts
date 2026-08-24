import { useState, useEffect, useCallback } from "react";
import {
  getStorageEstimate,
  getOfflineDeck,
  saveDeckOffline,
  saveCardsOffline,
  deleteDeckOffline,
  purgeOfflineDatabase,
} from "../services/offline/offlineDatabase";
import type {
  OfflineDeckEntity,
  OfflineCardEntity,
} from "@wordstreak/shared-types";

export interface StorageEstimateData {
  usage: number;
  quota: number;
  percentUsed: number;
  offlineDeckCount: number;
  offlineCardCount: number;
  pendingReviewCount: number;
  cachedMediaBytes: number;
}

export function useOfflineDatabase() {
  const [estimate, setEstimate] = useState<StorageEstimateData>({
    usage: 0,
    quota: 50 * 1024 * 1024,
    percentUsed: 0,
    offlineDeckCount: 0,
    offlineCardCount: 0,
    pendingReviewCount: 0,
    cachedMediaBytes: 0,
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refreshEstimate = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await getStorageEstimate();
      setEstimate(data);
    } catch {
      // Storage estimation failure fallback
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let ignore = false;
    getStorageEstimate()
      .then((data) => {
        if (!ignore) {
          setEstimate(data);
          setIsLoading(false);
        }
      })
      .catch(() => {
        if (!ignore) {
          setIsLoading(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, []);

  const isDeckSaved = useCallback(async (deckId: string): Promise<boolean> => {
    const deck = await getOfflineDeck(deckId);
    return Boolean(deck && deck.isOfflineAvailable);
  }, []);

  const saveDeck = useCallback(
    async (deck: OfflineDeckEntity, cards: OfflineCardEntity[]) => {
      await saveDeckOffline(deck);
      if (cards.length > 0) {
        await saveCardsOffline(cards);
      }
      await refreshEstimate();
    },
    [refreshEstimate],
  );

  const removeDeck = useCallback(
    async (deckId: string) => {
      await deleteDeckOffline(deckId);
      await refreshEstimate();
    },
    [refreshEstimate],
  );

  const purgeAll = useCallback(async () => {
    await purgeOfflineDatabase();
    await refreshEstimate();
  }, [refreshEstimate]);

  return {
    estimate,
    isLoading,
    refreshEstimate,
    isDeckSaved,
    saveDeck,
    removeDeck,
    purgeAll,
  };
}
