import { apiClient } from "../../../common/api/axios";
import type {
  DueCardItem,
  SubmitReviewDto,
  ReviewStatsResponse,
  ApiResponse,
} from "@wordstreak/shared-types";

export const reviewsService = {
  async getDueCards(
    deckId?: string,
    limit: number = 50,
  ): Promise<{ data: DueCardItem[]; meta?: Record<string, unknown> }> {
    const params = deckId ? { deckId, limit } : { limit };
    const response = await apiClient.get<ApiResponse<DueCardItem[]>>(
      "/reviews/due",
      { params },
    );
    return {
      data: response.data.data || [],
      meta: response.data.message
        ? (JSON.parse(response.data.message) as Record<string, unknown>)
        : undefined,
    };
  },

  async submitReview(dto: SubmitReviewDto): Promise<{
    cardId: string;
    status: string;
    interval: number;
    repetitions: number;
    easeFactor: number;
    lastReviewedAt: string;
    nextReviewDate: string;
    streak?: unknown;
    xp?: import("@wordstreak/shared-types").XpReviewRewardDto;
  }> {
    const response = await apiClient.post<ApiResponse>("/reviews/submit", dto);
    return response.data.data as any;
  },

  async getReviewStats(): Promise<ReviewStatsResponse> {
    const response =
      await apiClient.get<ApiResponse<ReviewStatsResponse>>("/reviews/stats");
    return (
      response.data.data || {
        totalCards: 0,
        dueCount: 0,
        newCount: 0,
        learningCount: 0,
        masteredCount: 0,
      }
    );
  },
};
