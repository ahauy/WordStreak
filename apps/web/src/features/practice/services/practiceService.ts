import { apiClient } from "../../../common/api/axios";
import type {
  QuizQuestionDto,
  FillBlankQuestionDto,
  ListeningQuestionDto,
  SubmitQuizDto,
  QuizResultResponseDto,
  MatchingQuizResponseDto,
  SubmitMatchingQuizDto,
  MatchingQuizResultDto,
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

  async getMatchingQuiz(
    deckId: string,
    limit: number = 10,
  ): Promise<MatchingQuizResponseDto> {
    const response = await apiClient.get<ApiResponse<MatchingQuizResponseDto>>(
      "/practice/matching",
      {
        params: { deckId, limit },
      },
    );
    return (
      response.data.data || {
        deckId,
        totalCards: 0,
        totalRounds: 0,
        rounds: [],
      }
    );
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

  async submitMatchingQuiz(
    dto: SubmitMatchingQuizDto,
  ): Promise<MatchingQuizResultDto> {
    const response = await apiClient.post<ApiResponse<MatchingQuizResultDto>>(
      "/practice/matching/submit",
      dto,
    );
    return (
      response.data.data || {
        totalPairs: 0,
        matchedCount: 0,
        accuracyPercentage: 0,
        maxCombo: 0,
        totalTimeMs: 0,
        totalXpEarned: 0,
        xpBreakdown: {
          baseXp: 0,
          comboBonusXp: 0,
          speedBonusXp: 0,
          perfectBonusXp: 0,
          totalXp: 0,
        },
        missedCards: [],
      }
    );
  },
};
