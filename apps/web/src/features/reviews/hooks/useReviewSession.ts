import { useState, useEffect, useCallback } from "react";
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
  const [sessionStartTime, setSessionStartTime] = useState<number>(0);

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
      setSessionStartTime(Date.now());
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to load review queue";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [deckId]);

  useEffect(() => {
    let ignore = false;
    reviewsService
      .getDueCards(deckId)
      .then(({ data }) => {
        if (!ignore) {
          setQueue(data);
          setInitialTotal(data.length);
          setIsCompleted(data.length === 0);
          setIsFlipped(false);
          setHistory([]);
          setSessionStartTime(Date.now());
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
  }, [deckId]);

  const currentCard = queue[0] || null;

  const flip = useCallback(() => {
    setIsFlipped((prev) => !prev);
  }, []);

  const rateCard = useCallback(
    async (rating: SrsRating) => {
      if (!currentCard || isSubmitting) return;

      setIsSubmitting(true);
      try {
        await reviewsService.submitReview({
          cardId: currentCard.cardId,
          rating,
        });

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

        // Reset flip state for the next card
        setIsFlipped(false);
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : "Failed to submit review";
        setError(message);
      } finally {
        setIsSubmitting(false);
      }
    },
    [currentCard, isSubmitting],
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
    flip,
    rateCard,
    restartSession: fetchQueue,
  };
}
