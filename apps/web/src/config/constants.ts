// Application Constants for WordStreak Web

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const SrsRating = {
  AGAIN: 1,
  HARD: 2,
  GOOD: 3,
  EASY: 4,
} as const;

export type SrsRatingType = typeof SrsRating[keyof typeof SrsRating];

export const SRS_RATING_LABELS: Record<SrsRatingType, { label: string; color: string }> = {
  [SrsRating.AGAIN]: { label: 'Lặp lại', color: 'red' },
  [SrsRating.HARD]: { label: 'Khó', color: 'orange' },
  [SrsRating.GOOD]: { label: 'Tốt', color: 'blue' },
  [SrsRating.EASY]: { label: 'Dễ', color: 'green' },
};

export const QuizType = {
  MULTIPLE_CHOICE: 'MULTIPLE_CHOICE',
  FILL_IN_BLANK: 'FILL_IN_BLANK',
  LISTENING: 'LISTENING',
  WORD_MATCHING: 'WORD_MATCHING',
  PRONUNCIATION: 'PRONUNCIATION',
} as const;

export type QuizType = typeof QuizType[keyof typeof QuizType];
