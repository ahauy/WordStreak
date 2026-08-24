import { useState, useEffect, useCallback } from "react";
import { reviewsService } from "../services/reviewsService";
import { dispatchXpUpdated } from "../../gamification/api/xpApi";
import { clientSm2Engine } from "../../../services/offline/clientSm2Engine";
import {
  getDueOfflineCards,
  getOfflineCardsByDeck,
  saveCardsOffline,
  queueOfflineReview,
} from "../../../services/offline/offlineDatabase";
import { useAuthStore } from "../../../store/useAuthStore";
import type {
  DueCardItem,
  SrsRating,
  XpReviewRewardDto,
  LevelUpEventDto,
  OfflineCardEntity,
} from "@wordstreak/shared-types";

export interface ReviewHistoryEntry {
  cardId: string;
  rating: SrsRating;
  timestamp: number;
}

export interface SessionStats {
  totalReviewed: number;
  uniqueCards: number;
  goodEasyCount: number;
  againHardCount: number;
  accuracyPercentage: number;
  durationSeconds: number;
}

export function useReviewSession(deckId?: string) {
  const { user } = useAuthStore();
  const [queue, setQueue] = useState<DueCardItem[]>([]);
  const [initialTotal, setInitialTotal] = useState<number>(0);
  const [isFlipped, setIsFlipped] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<ReviewHistoryEntry[]>([]);
  const [sessionStartTime, setSessionStartTime] = useState<number>(0);
  const [lastXpReward, setLastXpReward] = useState<XpReviewRewardDto | null>(
    null,
  );
  const [levelUpData, setLevelUpData] = useState<LevelUpEventDto | null>(null);
  const [isOfflineMode, setIsOfflineMode] = useState<boolean>(false);

  const loadOfflineCards = useCallback(async (): Promise<DueCardItem[]> => {
    let offlineEntities = await getDueOfflineCards(deckId);
    if (offlineEntities.length === 0 && deckId) {
      offlineEntities = await getOfflineCardsByDeck(deckId);
    }

    return offlineEntities.map((c) => ({
      id: c.id,
      cardId: c.id,
      deckId: c.deckId,
      deckTitle: "Offline Deck",
      word: c.word,
      meaning: c.meaning,
      phonetic: c.phonetic,
      audioUrl: c.audioUrl,
      exampleSentence: c.exampleSentence,
      status: c.status,
      interval: c.interval,
      easeFactor: c.easeFactor,
      repetitions: c.repetitions,
      nextReviewDate: c.nextReviewDate,
    }));
  }, [deckId]);

  const loadQueue = useCallback(async (): Promise<{
    offline: boolean;
    queue: DueCardItem[];
  }> => {
    if (!navigator.onLine) {
      const offlineData = await loadOfflineCards();
      return { offline: true, queue: offlineData };
    }
    try {
      const { data } = await reviewsService.getDueCards(deckId);
      return { offline: false, queue: data };
    } catch {
      // Fallback to offline cards on network error
      try {
        const offlineData = await loadOfflineCards();
        return { offline: true, queue: offlineData };
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : "Failed to load review queue";
        throw new Error(message, { cause: err });
      }
    }
  }, [deckId, loadOfflineCards]);

  const applyQueueData = useCallback(
    (offline: boolean, queueData: DueCardItem[]) => {
      setIsOfflineMode(offline);
      setQueue(queueData);
      setInitialTotal(queueData.length);
      setIsCompleted(queueData.length === 0);
      setIsFlipped(false);
      setHistory([]);
      setSessionStartTime(Date.now());
    },
    [],
  );

  const fetchQueue = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await loadQueue();
      applyQueueData(res.offline, res.queue);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to load review queue";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [loadQueue, applyQueueData]);

  useEffect(() => {
    let ignore = false;
    loadQueue()
      .then((res) => {
        if (!ignore) {
          applyQueueData(res.offline, res.queue);
          setError(null);
          setIsLoading(false);
        }
      })
      .catch((err: unknown) => {
        if (!ignore) {
          const message =
            err instanceof Error ? err.message : "Failed to load review queue";
          setError(message);
          setIsLoading(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, [loadQueue, applyQueueData]);

  const currentCard = queue[0] || null;

  const flip = useCallback(() => {
    setIsFlipped((prev) => !prev);
  }, []);

  const handleOfflineGrading = useCallback(
    async (card: DueCardItem, rating: SrsRating) => {
      const sm2Result = clientSm2Engine.calculateSm2({
        rating,
        repetitions: card.repetitions || 0,
        easeFactor: card.easeFactor || 2.5,
        interval: card.interval || 0,
      });

      const updatedCardEntity: OfflineCardEntity = {
        id: card.cardId,
        deckId: card.deckId,
        word: card.word,
        meaning: card.meaning,
        phonetic: card.phonetic,
        audioUrl: card.audioUrl,
        exampleSentence: card.exampleSentence,
        exampleTranslation: null,
        collocations: null,
        mnemonic: null,
        imageUrl: null,
        status: sm2Result.status,
        interval: sm2Result.interval,
        easeFactor: sm2Result.easeFactor,
        repetitions: sm2Result.repetitions,
        nextReviewDate: sm2Result.nextReviewDate.toISOString(),
        cachedAt: new Date().toISOString(),
      };

      await saveCardsOffline([updatedCardEntity]);

      await queueOfflineReview({
        userId: user?.id || "offline_user",
        cardId: card.cardId,
        rating,
        interval: sm2Result.interval,
        easeFactor: sm2Result.easeFactor,
        repetitions: sm2Result.repetitions,
        reviewedAtClient: new Date().toISOString(),
        clientTimezone:
          Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC",
      });

      const rawXp = rating >= 3 ? 10 : rating === 2 ? 5 : 0;
      if (rawXp > 0) {
        setLastXpReward({
          xpEarned: rawXp,
          totalXp: rawXp,
          level: 1,
          tier: "BRONZE",
          currentLevelXp: rawXp,
          nextLevelRequiredXp: 100,
          levelProgressPercent: rawXp,
          levelUp: {
            isLevelUp: false,
            previousLevel: 1,
            currentLevel: 1,
            previousTier: "BRONZE",
            currentTier: "BRONZE",
            isTierPromotion: false,
          },
          breakdown: [
            {
              type: "CARD_REVIEW",
              xp: rawXp,
              description: "Offline review completed",
            },
          ],
        });
      }
    },
    [user],
  );

  const rateCard = useCallback(
    async (rating: SrsRating) => {
      if (!currentCard || isSubmitting) return;

      setIsSubmitting(true);
      try {
        if (isOfflineMode || !navigator.onLine) {
          await handleOfflineGrading(currentCard, rating);
        } else {
          try {
            const response = await reviewsService.submitReview({
              cardId: currentCard.cardId,
              rating,
            });

            if (response?.xp) {
              setLastXpReward(response.xp);
              dispatchXpUpdated();
              if (response.xp.levelUp?.isLevelUp) {
                setLevelUpData(response.xp.levelUp);
              }
            }
          } catch {
            // Fallback to offline queue if server is unreachable
            await handleOfflineGrading(currentCard, rating);
          }
        }

        // Record rating in history
        setHistory((prev) => [
          ...prev,
          {
            cardId: currentCard.cardId,
            rating,
            timestamp: Date.now(),
          },
        ]);

        // If card was rated 'Again' (1), re-queue it at the end of the active session
        if (rating === 1) {
          setQueue((prevQueue) => {
            const nextQueue = [...prevQueue.slice(1), currentCard];
            return nextQueue;
          });
        } else {
          setQueue((prevQueue) => {
            const nextQueue = prevQueue.slice(1);
            if (nextQueue.length === 0) {
              setIsCompleted(true);
            }
            return nextQueue;
          });
        }

        setIsFlipped(false);
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : "Failed to submit review";
        setError(message);
      } finally {
        setIsSubmitting(false);
      }
    },
    [currentCard, isSubmitting, isOfflineMode, handleOfflineGrading],
  );

  // Compute session metrics
  const sessionStats: SessionStats = {
    totalReviewed: history.length,
    uniqueCards: new Set(history.map((h) => h.cardId)).size,
    goodEasyCount: history.filter((h) => h.rating === 3 || h.rating === 4)
      .length,
    againHardCount: history.filter((h) => h.rating === 1 || h.rating === 2)
      .length,
    accuracyPercentage:
      history.length > 0
        ? Math.round(
            (history.filter((h) => h.rating === 3 || h.rating === 4).length /
              history.length) *
              100,
          )
        : 100,
    durationSeconds:
      sessionStartTime > 0 && history.length > 0
        ? Math.max(
            0,
            Math.floor(
              (history[history.length - 1].timestamp - sessionStartTime) / 1000,
            ),
          )
        : 0,
  };

  const clearXpReward = useCallback(() => {
    setLastXpReward(null);
  }, []);

  const clearLevelUpData = useCallback(() => {
    setLevelUpData(null);
  }, []);

  return {
    queue,
    currentCard,
    initialTotal,
    remainingCount: queue.length,
    isFlipped,
    isLoading,
    isSubmitting,
    isCompleted,
    error,
    sessionStats,
    lastXpReward,
    levelUpData,
    isOfflineMode,
    clearXpReward,
    clearLevelUpData,
    flip,
    rateCard,
    restartSession: fetchQueue,
  };
}
