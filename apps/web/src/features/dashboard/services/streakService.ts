import { apiClient } from "../../../common/api/axios";
import type {
  UserStreakDto,
  StreakActivityResponseDto,
  ApiResponse,
} from "@wordstreak/shared-types";

export const STREAK_UPDATED_EVENT = "wordstreak:streak-updated";

export interface StreakUpdatedEventDetail {
  streak?: UserStreakDto;
  activityResult?: StreakActivityResponseDto;
}

export function notifyStreakUpdated(detail?: StreakUpdatedEventDetail): void {
  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent<StreakUpdatedEventDetail>(STREAK_UPDATED_EVENT, {
        detail: detail || {},
      }),
    );
  }
}

export const streakService = {
  /**
   * Fetch current user's streak status.
   * Sends user timezone in x-timezone header and query parameter.
   */
  async getStreak(timezone?: string): Promise<UserStreakDto> {
    const tz =
      timezone || Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";

    const response = await apiClient.get<ApiResponse<UserStreakDto>>(
      "/streaks/me",
      {
        headers: {
          "x-timezone": tz,
        },
        params: {
          timezone: tz,
        },
      },
    );

    if (!response.data.data) {
      throw new Error("Invalid response: missing streak data");
    }

    return response.data.data;
  },

  /**
   * Record learning activity to advance or sustain daily streak.
   */
  async recordActivity(timezone?: string): Promise<StreakActivityResponseDto> {
    const tz =
      timezone || Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";

    const response = await apiClient.post<
      ApiResponse<StreakActivityResponseDto>
    >(
      "/streaks/record-activity",
      { timezone: tz },
      {
        headers: {
          "x-timezone": tz,
        },
      },
    );

    if (!response.data.data) {
      throw new Error("Invalid response: missing streak activity response");
    }

    const activityResult = response.data.data;

    // Dispatch global event to sync all listeners
    notifyStreakUpdated({ activityResult });

    return activityResult;
  },
};
