/**
 * Contract: Listening & Typing Practice Quiz
 * Feature: quiz-listening-practice (US-QUIZ-03)
 * Epic: EPIC-04 Multi-format Practice & Quiz Modes (Sprint 5)
 */

export interface ListeningQuestionDto {
  id: string;
  cardId: string;
  word: string;
  phonetic?: string | null;
  meaning: string;
  audioUrl?: string | null;
  wordLength: number;
  firstLetterHint: string;
}

export interface GetListeningQuestionsQueryDto {
  deckId: string;
  limit?: number; // default 10, min 1, max 100
}

export interface ListeningAnswerSubmissionDto {
  cardId: string;
  submittedWord: string;
  isCorrect: boolean;
  timeSpentMs: number;
  hintsUsed: number; // 0, 1, 2, 3
  replayCount: number;
  audioSpeedUsed: number; // 1.0 or 0.75
}

export interface SubmitListeningQuizDto {
  deckId: string;
  totalQuestions?: number;
  answers: ListeningAnswerSubmissionDto[];
}

export interface MissedCardDto {
  cardId: string;
  word: string;
  meaning: string;
  phonetic?: string | null;
  audioUrl?: string | null;
}

export interface QuizResultResponseDto {
  totalQuestions: number;
  correctCount: number;
  accuracyPercentage: number;
  totalXpEarned: number;
  maxCombo: number;
  missedCards: MissedCardDto[];
}

export type DiffSpanType = "MATCH" | "MISSING" | "EXTRA" | "WRONG";

export interface DiffSpan {
  char: string;
  type: DiffSpanType;
}
