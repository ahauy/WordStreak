import { apiClient } from "../../../common/api/axios";
import { ENDPOINTS } from "../../../common/api/endpoints";
import type {
  ApiResponse,
  XpSummaryResponseDto,
  XpHistoryQueryDto,
  XpHistoryResponseDto,
  AwardPracticeXpDto,
  PracticeQuizXpRewardDto,
} from "@wordstreak/shared-types";

export const XP_UPDATED_EVENT = "wordstreak:xp-updated";

export interface XpUpdatedEventDetail {
  summary?: XpSummaryResponseDto;
}

export function dispatchXpUpdated(summary?: XpSummaryResponseDto): void {
  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent<XpUpdatedEventDetail>(XP_UPDATED_EVENT, {
        detail: { summary },
      }),
    );
  }
}

export const xpApi = {
  async getXpSummary(timezone?: string): Promise<XpSummaryResponseDto> {
    const tz =
      timezone ||
      Intl.DateTimeFormat().resolvedOptions().timeZone ||
      "Asia/Ho_Chi_Minh";

    const response = await apiClient.get<ApiResponse<XpSummaryResponseDto>>(
      ENDPOINTS.GAMIFICATION.XP_SUMMARY,
      {
        headers: {
          "x-timezone": tz,
        },
      },
    );

    if (!response.data.data) {
      throw new Error("Failed to fetch XP summary: No data returned");
    }

    return response.data.data;
  },

  async getXpHistory(
    query: XpHistoryQueryDto = {},
  ): Promise<XpHistoryResponseDto> {
    const params = {
      page: query.page || 1,
      limit: query.limit || 20,
      ...(query.activityType ? { activityType: query.activityType } : {}),
    };

    const response = await apiClient.get<ApiResponse<XpHistoryResponseDto>>(
      ENDPOINTS.GAMIFICATION.XP_HISTORY,
      { params },
    );

    if (!response.data.data) {
      return {
        data: [],
        meta: {
          total: 0,
          page: params.page,
          limit: params.limit,
          totalPages: 1,
        },
      };
    }

    return response.data.data;
  },

  async awardPracticeQuizXp(
    dto: AwardPracticeXpDto,
    timezone?: string,
  ): Promise<PracticeQuizXpRewardDto> {
    const tz =
      timezone ||
      Intl.DateTimeFormat().resolvedOptions().timeZone ||
      "Asia/Ho_Chi_Minh";

    const response = await apiClient.post<ApiResponse<PracticeQuizXpRewardDto>>(
      ENDPOINTS.GAMIFICATION.XP_PRACTICE,
      dto,
      {
        headers: {
          "x-timezone": tz,
        },
      },
    );

    if (!response.data.data) {
      throw new Error("Failed to award practice XP: No data returned");
    }

    dispatchXpUpdated();
    return response.data.data;
  },
};
