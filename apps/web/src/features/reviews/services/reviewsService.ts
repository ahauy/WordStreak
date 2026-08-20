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
  ): Promise<{ data: DueCardItem[]; meta?: any }> {
    const params = deckId ? { deckId, limit } : { limit };
    const response = await apiClient.get<ApiResponse<DueCardItem[]>>(
      "/reviews/due",
      { params },
    );
    return {
      data: response.data.data || [],
      meta: response.data.message
        ? JSON.parse(response.data.message)
        : undefined,
    };
  },

  async submitReview(dto: SubmitReviewDto): Promise<any> {
    const response = await apiClient.post<ApiResponse>("/reviews/submit", dto);
    return response.data.data;
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
