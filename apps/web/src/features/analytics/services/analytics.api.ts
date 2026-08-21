import { apiClient } from "../../../common/api/axios";
import { ENDPOINTS } from "../../../common/api/endpoints";
import type {
  ApiResponse,
  AnalyticsOverviewDto,
  MasterySummaryDto,
  ActivityHeatmapResponseDto,
  DeckForecastDto,
} from "@wordstreak/shared-types";

export const analyticsApi = {
  async getOverview(): Promise<AnalyticsOverviewDto> {
    const response = await apiClient.get<ApiResponse<AnalyticsOverviewDto>>(
      ENDPOINTS.ANALYTICS.OVERVIEW,
    );
    if (!response.data.data) {
      throw new Error("Failed to load analytics overview");
    }
    return response.data.data;
  },

  async getMasterySummary(deckId?: string): Promise<MasterySummaryDto> {
    const response = await apiClient.get<ApiResponse<MasterySummaryDto>>(
      ENDPOINTS.ANALYTICS.MASTERY_SUMMARY,
      { params: deckId ? { deckId } : {} },
    );
    if (!response.data.data) {
      throw new Error("Failed to load mastery summary");
    }
    return response.data.data;
  },

  async getActivityHeatmap(
    timezone?: string,
  ): Promise<ActivityHeatmapResponseDto> {
    const tz = timezone || Intl.DateTimeFormat().resolvedOptions().timeZone;
    const response = await apiClient.get<
      ApiResponse<ActivityHeatmapResponseDto>
    >(ENDPOINTS.ANALYTICS.HEATMAP, { params: { timezone: tz } });
    if (!response.data.data) {
      throw new Error("Failed to load activity heatmap");
    }
    return response.data.data;
  },

  async getDeckForecast(deckId: string): Promise<DeckForecastDto> {
    const response = await apiClient.get<ApiResponse<DeckForecastDto>>(
      ENDPOINTS.ANALYTICS.DECK_FORECAST(deckId),
    );
    if (!response.data.data) {
      throw new Error(`Failed to load deck forecast for ${deckId}`);
    }
    return response.data.data;
  },

  async getDecksProgress(): Promise<DeckForecastDto[]> {
    const response = await apiClient.get<ApiResponse<DeckForecastDto[]>>(
      ENDPOINTS.ANALYTICS.DECKS_PROGRESS,
    );
    return response.data.data || [];
  },
};
