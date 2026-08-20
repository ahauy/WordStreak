import { useState, useEffect, useCallback, useRef } from "react";
import { reviewsService } from "../services/reviewsService";
import type { DueCardItem, SrsRating } from "@wordstreak/shared-types";

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
  const [queue, setQueue] = useState<DueCardItem[]>([]);
  const [initialTotal, setInitialTotal] = useState<number>(0);
  const [isFlipped, setIsFlipped] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<ReviewHistoryEntry[]>([]);

  const sessionStartTimeRef = useRef<number>(Date.now());

  const fetchQueue = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { data } = await reviewsService.getDueCards(deckId);
      setQueue(data);
      setInitialTotal(data.length);
      setIsCompleted(data.length === 0);
      setIsFlipped(false);
      setHistory([]);
      sessionStartTimeRef.current = Date.now();
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to load review queue");
    } finally {
      setIsLoading(false);
    }
  }, [deckId]);

  useEffect(() => {
    fetchQueue();
  }, [fetchQueue]);

  const currentCard = queue[0] || null;

  const flip = useCallback(() => {
    setIsFlipped((prev) => !prev);
  }, []);

  const rateCard = useCallback(
    async (rating: SrsRating) => {
      if (!currentCard || isSubmitting) return;

      setIsSubmitting(true);
      try {
        // 1. Submit rating to backend immediately
        await reviewsService.submitReview({
          cardId: currentCard.cardId,
          rating,
        });

        // 2. Update session history
        setHistory((prev) => [
          ...prev,
          {
            cardId: currentCard.cardId,
            rating,
            timestamp: Date.now(),
          },
        ]);

        // 3. Intra-session repeat logic: if rated AGAIN (1), re-queue at end
        setQueue((prevQueue) => {
          const nextQueue = prevQueue.slice(1);
          if (rating === 1) {
            nextQueue.push(currentCard);
          }
          if (nextQueue.length === 0) {
            setIsCompleted(true);
          }
          return nextQueue;
        });

        // 4. Reset flip state for the upcoming card
        setIsFlipped(false);
      } catch (err: any) {
        setError(err?.response?.data?.message || "Failed to submit rating");
      } finally {
        setIsSubmitting(false);
      }
    },
    [currentCard, isSubmitting],
  );

  const getStats = useCallback((): SessionStats => {
    const totalReviewed = history.length;
    const goodEasyCount = history.filter((h) => h.rating >= 3).length;
    const againHardCount = history.filter((h) => h.rating < 3).length;
    const accuracyPercentage =
      totalReviewed > 0
        ? Math.round((goodEasyCount / totalReviewed) * 100)
        : 100;
    const durationSeconds = Math.max(
      1,
      Math.round((Date.now() - sessionStartTimeRef.current) / 1000),
    );

    return {
      totalReviewed,
      uniqueCards: initialTotal,
      goodEasyCount,
      againHardCount,
      accuracyPercentage,
      durationSeconds,
    };
  }, [history, initialTotal]);

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
    history,
    flip,
    rateCard,
    restartSession: fetchQueue,
    getStats,
  };
}
