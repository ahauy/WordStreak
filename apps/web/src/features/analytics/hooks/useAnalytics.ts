import { useState, useEffect, useCallback } from "react";
import { analyticsApi } from "../services/analytics.api";
import type {
  AnalyticsOverviewDto,
  ActivityHeatmapResponseDto,
  DeckForecastDto,
  MasterySummaryDto,
} from "@wordstreak/shared-types";

export function useAnalytics(selectedDeckId?: string) {
  const [overview, setOverview] = useState<AnalyticsOverviewDto | null>(null);
  const [heatmap, setHeatmap] = useState<ActivityHeatmapResponseDto | null>(
    null,
  );
  const [decksProgress, setDecksProgress] = useState<DeckForecastDto[]>([]);
  const [deckMastery, setDeckMastery] = useState<MasterySummaryDto | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Initial and reactive fetch on selectedDeckId change
  useEffect(() => {
    let ignore = false;

    Promise.all([
      analyticsApi.getOverview(),
      analyticsApi.getActivityHeatmap(),
      analyticsApi.getDecksProgress(),
      selectedDeckId
        ? analyticsApi.getMasterySummary(selectedDeckId)
        : Promise.resolve(null),
    ])
      .then(([overviewData, heatmapData, decksData, customMastery]) => {
        if (!ignore) {
          setOverview(overviewData);
          setHeatmap(heatmapData);
          setDecksProgress(decksData);
          setDeckMastery(customMastery || overviewData.masterySummary);
          setIsLoading(false);
        }
      })
      .catch((err: unknown) => {
        if (!ignore) {
          const message =
            err instanceof Error ? err.message : "Failed to fetch analytics";
          setError(message);
          setIsLoading(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, [selectedDeckId]);

  const refetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [overviewData, heatmapData, decksData, customMastery] =
        await Promise.all([
          analyticsApi.getOverview(),
          analyticsApi.getActivityHeatmap(),
          analyticsApi.getDecksProgress(),
          selectedDeckId
            ? analyticsApi.getMasterySummary(selectedDeckId)
            : Promise.resolve(null),
        ]);

      setOverview(overviewData);
      setHeatmap(heatmapData);
      setDecksProgress(decksData);
      setDeckMastery(customMastery || overviewData.masterySummary);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to fetch analytics";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [selectedDeckId]);

  return {
    overview,
    heatmap,
    decksProgress,
    deckMastery,
    isLoading,
    error,
    refetch,
  };
}
