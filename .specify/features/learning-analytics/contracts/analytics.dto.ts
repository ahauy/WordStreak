export interface MasterySummaryDto {
  totalCards: number;
  masteredCount: number;
  masteredPercentage: number;
  learningCount: number;
  learningPercentage: number;
  newCount: number;
  newPercentage: number;
}

export interface HeatmapDayItemDto {
  date: string; // YYYY-MM-DD
  count: number;
  level: 0 | 1 | 2 | 3 | 4;
}

export interface ActivityHeatmapResponseDto {
  startDate: string;
  endDate: string;
  totalReviews: number;
  activeDaysCount: number;
  longestDailyReviews: number;
  days: HeatmapDayItemDto[];
}

export interface DeckForecastDto {
  deckId: string;
  deckTitle: string;
  deckColor: string;
  totalCards: number;
  masteredCards: number;
  remainingCards: number;
  dailyVelocity: number;
  estimatedDaysToComplete: number;
  projectedCompletionDate: string | null;
  isCompleted: boolean;
}

export interface AnalyticsOverviewDto {
  masterySummary: MasterySummaryDto;
  retentionRate30Days: number | null;
  totalReviewsLogged: number;
  currentStreak: number;
  bestStreak: number;
}
