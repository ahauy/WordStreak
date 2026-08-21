import { apiClient } from "../../../common/api/axios";
import type {
  QuizQuestionDto,
  FillBlankQuestionDto,
  ListeningQuestionDto,
  SubmitQuizDto,
  QuizResultResponseDto,
  ApiResponse,
} from "@wordstreak/shared-types";

export const practiceService = {
  async getMultipleChoiceQuiz(
    deckId: string,
    limit: number = 10,
  ): Promise<QuizQuestionDto[]> {
    const response = await apiClient.get<ApiResponse<QuizQuestionDto[]>>(
      "/practice/multiple-choice",
      {
        params: { deckId, limit },
      },
    );
    return response.data.data || [];
  },

  async getFillBlankQuiz(
    deckId: string,
    limit: number = 10,
  ): Promise<FillBlankQuestionDto[]> {
    const response = await apiClient.get<ApiResponse<FillBlankQuestionDto[]>>(
      "/practice/fill-in-the-blank",
      {
        params: { deckId, limit },
      },
    );
    return response.data.data || [];
  },

  async getListeningQuiz(
    deckId: string,
    limit: number = 10,
  ): Promise<ListeningQuestionDto[]> {
    const response = await apiClient.get<ApiResponse<ListeningQuestionDto[]>>(
      "/practice/listening",
      {
        params: { deckId, limit },
      },
    );
    return response.data.data || [];
  },

  async submitQuiz(dto: SubmitQuizDto): Promise<QuizResultResponseDto> {
    const response = await apiClient.post<ApiResponse<QuizResultResponseDto>>(
      "/practice/submit-quiz",
      dto,
    );
    return (
      response.data.data || {
        totalQuestions: 0,
        correctCount: 0,
        accuracyPercentage: 0,
        totalXpEarned: 0,
        maxCombo: 0,
        missedCards: [],
      }
    );
  },
};
