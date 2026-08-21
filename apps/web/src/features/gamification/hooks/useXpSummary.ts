import { useState, useEffect, useCallback, useRef } from "react";
import type { XpSummaryResponseDto } from "@wordstreak/shared-types";
import {
  xpApi,
  XP_UPDATED_EVENT,
  type XpUpdatedEventDetail,
} from "../api/xpApi";

interface UseXpSummaryOptions {
  enabled?: boolean;
  timezone?: string;
  onSummaryUpdated?: (summary: XpSummaryResponseDto) => void;
}

export function useXpSummary(options: UseXpSummaryOptions = {}) {
  const { enabled = true, timezone, onSummaryUpdated } = options;

  const [summary, setSummary] = useState<XpSummaryResponseDto | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(enabled);
  const [error, setError] = useState<string | null>(null);

  const onSummaryUpdatedRef = useRef(onSummaryUpdated);
  useEffect(() => {
    onSummaryUpdatedRef.current = onSummaryUpdated;
  }, [onSummaryUpdated]);

  const refetch =
    useCallback(async (): Promise<XpSummaryResponseDto | null> => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await xpApi.getXpSummary(timezone);
        setSummary(data);
        onSummaryUpdatedRef.current?.(data);
        return data;
      } catch (err: unknown) {
        const msg =
          err instanceof Error ? err.message : "Failed to load XP summary";
        setError(msg);
        return null;
      } finally {
        setIsLoading(false);
      }
    }, [timezone]);

  // Initial fetch on mount
  useEffect(() => {
    if (!enabled) return;

    let ignore = false;
    xpApi
      .getXpSummary(timezone)
      .then((data) => {
        if (!ignore) {
          setSummary(data);
          setIsLoading(false);
          onSummaryUpdatedRef.current?.(data);
        }
      })
      .catch((err: unknown) => {
        if (!ignore) {
          const msg =
            err instanceof Error ? err.message : "Failed to load XP summary";
          setError(msg);
          setIsLoading(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, [enabled, timezone]);

  // Event listener for cross-component real-time synchronization
  useEffect(() => {
    const handleXpEvent = (event: Event) => {
      const customEvent = event as CustomEvent<XpUpdatedEventDetail>;
      const detail = customEvent.detail;

      if (detail?.summary) {
        setSummary(detail.summary);
        onSummaryUpdatedRef.current?.(detail.summary);
      } else {
        refetch();
      }
    };

    if (typeof window !== "undefined") {
      window.addEventListener(XP_UPDATED_EVENT, handleXpEvent);
      return () => {
        window.removeEventListener(XP_UPDATED_EVENT, handleXpEvent);
      };
    }
  }, [refetch]);

  return {
    summary,
    level: summary?.level ?? 1,
    tier: summary?.tier ?? "BRONZE",
    totalXp: summary?.totalXp ?? 0,
    currentLevelXp: summary?.currentLevelXp ?? 0,
    nextLevelRequiredXp: summary?.nextLevelRequiredXp ?? 100,
    progressPercent: summary?.levelProgressPercent ?? 0,
    todayXp: summary?.todayXp ?? 0,
    dailyGoalBonusEarnedToday: summary?.dailyGoalBonusEarnedToday ?? false,
    nextTier: summary?.nextTier ?? null,
    nextTierLevel: summary?.nextTierLevel ?? null,
    tierMetadata: summary?.tierMetadata ?? null,
    isLoading,
    error,
    refetch,
    setSummary,
  };
}
