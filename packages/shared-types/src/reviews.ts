export const SrsRating = {
  AGAIN: 1,
  HARD: 2,
  GOOD: 3,
  EASY: 4,
} as const;

export type SrsRating = (typeof SrsRating)[keyof typeof SrsRating];

export type CardLearningStatus = "NEW" | "LEARNING" | "MASTERED" | "KNOWN_SKIPPED";

export interface SrsCalculationInput {
  rating: SrsRating;
  repetitions: number;
  easeFactor: number;
  interval: number;
}

export interface SrsCalculationResult {
  interval: number;
  easeFactor: number;
  repetitions: number;
  nextReviewDate: Date;
  status: CardLearningStatus;
}

export interface DueCardItem {
  id: string;
  cardId: string;
  deckId: string;
  deckTitle: string;
  deckColor?: string;
  word: string;
  meaning: string;
  phonetic?: string | null;
  audioUrl?: string | null;
  exampleSentence?: string | null;
  collocations?: string | null;
  mnemonic?: string | null;
  imageUrl?: string | null;
  status: CardLearningStatus;
  interval: number;
  repetitions: number;
  easeFactor: number;
  nextReviewDate: string;
  isOfficial?: boolean;
  officialCardId?: string;
}

export interface SubmitReviewDto {
  cardId: string;
  rating: SrsRating;
}

export interface ReviewStatsResponse {
  totalCards: number;
  dueCount: number;
  newCount: number;
  learningCount: number;
  masteredCount: number;
}

export interface ReviewSummaryDto {
  dueCount: number;
  newAvailable: number;
  studiedToday: number;
  dailyGoal: number;
  goalReached: boolean;
  currentStreak: number;
  streakAtRisk: boolean;
  timezone: string;
  endOfDayAt: string;
  nextDueAt: string | null;
}
