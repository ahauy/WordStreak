import { useState, useEffect, useCallback, useRef } from "react";
import type {
  UserStreakDto,
  StreakActivityResponseDto,
} from "@wordstreak/shared-types";
import {
  streakService,
  STREAK_UPDATED_EVENT,
  type StreakUpdatedEventDetail,
} from "../services/streakService";

interface UseStreakOptions {
  enabled?: boolean;
  timezone?: string;
  onStreakUpdated?: (streak: UserStreakDto) => void;
}

export function useStreak(options: UseStreakOptions = {}) {
  const { enabled = true, timezone, onStreakUpdated } = options;

  const [streak, setStreak] = useState<UserStreakDto | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(enabled);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const onStreakUpdatedRef = useRef(onStreakUpdated);
  useEffect(() => {
    onStreakUpdatedRef.current = onStreakUpdated;
  }, [onStreakUpdated]);

  const refetchStreak = useCallback(async (): Promise<UserStreakDto | null> => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await streakService.getStreak(timezone);
      setStreak(data);
      onStreakUpdatedRef.current?.(data);
      return data;
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Failed to load streak status";
      setError(msg);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [timezone]);

  const recordActivity = useCallback(
    async (tz?: string): Promise<StreakActivityResponseDto> => {
      setIsRecording(true);
      setError(null);
      try {
        const result = await streakService.recordActivity(tz || timezone);

        // Update local streak state with activity result
        setStreak((prev) => {
          const updated: UserStreakDto = prev
            ? {
                ...prev,
                currentStreak: result.currentStreak,
                bestStreak: result.bestStreak,
                isActiveToday: result.isActiveToday,
                isPendingToday: !result.isActiveToday,
                flameTier: result.flameTier,
              }
            : {
                userId: "",
                currentStreak: result.currentStreak,
                bestStreak: result.bestStreak,
                lastActiveDate: new Date().toISOString(),
                isActiveToday: result.isActiveToday,
                isPendingToday: !result.isActiveToday,
                timezone:
                  tz ||
                  timezone ||
                  Intl.DateTimeFormat().resolvedOptions().timeZone,
                flameTier: result.flameTier,
              };
          onStreakUpdatedRef.current?.(updated);
          return updated;
        });

        return result;
      } catch (err: unknown) {
        const msg =
          err instanceof Error
            ? err.message
            : "Failed to record streak activity";
        setError(msg);
        throw err;
      } finally {
        setIsRecording(false);
      }
    },
    [timezone],
  );

  // Initial fetch on mount
  useEffect(() => {
    if (!enabled) return;

    let ignore = false;
    streakService
      .getStreak(timezone)
      .then((data) => {
        if (!ignore) {
          setStreak(data);
          setIsLoading(false);
          onStreakUpdatedRef.current?.(data);
        }
      })
      .catch((err: unknown) => {
        if (!ignore) {
          const msg =
            err instanceof Error ? err.message : "Failed to load streak status";
          setError(msg);
          setIsLoading(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, [enabled, timezone]);

  // Global event listener to keep multiple components synchronized
  useEffect(() => {
    const handleStreakEvent = (event: Event) => {
      const customEvent = event as CustomEvent<StreakUpdatedEventDetail>;
      const detail = customEvent.detail;

      if (detail?.streak) {
        setStreak(detail.streak);
        onStreakUpdatedRef.current?.(detail.streak);
      } else if (detail?.activityResult) {
        const result = detail.activityResult;
        setStreak((prev) => {
          const updated: UserStreakDto = prev
            ? {
                ...prev,
                currentStreak: result.currentStreak,
                bestStreak: result.bestStreak,
                isActiveToday: result.isActiveToday,
                isPendingToday: !result.isActiveToday,
                flameTier: result.flameTier,
              }
            : {
                userId: "",
                currentStreak: result.currentStreak,
                bestStreak: result.bestStreak,
                lastActiveDate: new Date().toISOString(),
                isActiveToday: result.isActiveToday,
                isPendingToday: !result.isActiveToday,
                timezone:
                  timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
                flameTier: result.flameTier,
              };
          onStreakUpdatedRef.current?.(updated);
          return updated;
        });
      } else {
        // Refetch from server if no payload provided
        refetchStreak();
      }
    };

    if (typeof window !== "undefined") {
      window.addEventListener(STREAK_UPDATED_EVENT, handleStreakEvent);
      return () => {
        window.removeEventListener(STREAK_UPDATED_EVENT, handleStreakEvent);
      };
    }
  }, [refetchStreak, timezone]);

  return {
    streak,
    currentStreak: streak?.currentStreak ?? 0,
    bestStreak: streak?.bestStreak ?? 0,
    flameTier: streak?.flameTier ?? 1,
    isActiveToday: streak?.isActiveToday ?? false,
    isPendingToday: streak?.isPendingToday ?? false,
    isLoading,
    isRecording,
    error,
    recordActivity,
    refetchStreak,
    setStreak,
  };
}
