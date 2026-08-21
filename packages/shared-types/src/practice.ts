// Shared Types for Practice & Quiz Modes (EPIC-04)

export type QuizQuestionFormat = "EN_TO_VI" | "VI_TO_EN";

export interface QuizOptionDto {
  id: string;
  text: string;
  isCorrect: boolean;
}

export interface QuizQuestionDto {
  id: string;
  cardId: string;
  format: QuizQuestionFormat;
  prompt: string;
  phonetic?: string | null;
  audioUrl?: string | null;
  exampleContext?: string | null;
  options: QuizOptionDto[];
}

export interface GetQuizQuestionsQueryDto {
  deckId: string;
  limit?: number;
}

export interface QuizAnswerSubmissionDto {
  questionId?: string;
  cardId: string;
  selectedOptionId?: string | null;
  submittedWord?: string;
  isCorrect: boolean;
  timeSpentMs?: number;
  hintsUsed?: number;
  replayCount?: number;
  audioSpeedUsed?: number;
}

export interface SubmitQuizDto {
  deckId: string;
  mode?: string;
  totalQuestions?: number;
  answers: QuizAnswerSubmissionDto[];
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

export interface FillBlankQuestionDto {
  id: string;
  cardId: string;
  sentenceWithBlank: string;
  sentencePrefix: string;
  sentenceSuffix: string;
  targetWord: string;
  targetInflection?: string;
  meaning: string;
  phonetic?: string | null;
  audioUrl?: string | null;
  scrambledLetters: string[];
  wordLength: number;
}

export interface GetFillBlankQuestionsQueryDto {
  deckId: string;
  limit?: number;
}

// Listening Quiz Types (US-QUIZ-03)
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
  submittedWord?: string;
  isCorrect: boolean;
  timeSpentMs: number;
  hintsUsed?: number; // 0, 1, 2, 3
  replayCount?: number;
  audioSpeedUsed?: number; // 1.0 or 0.75
}

export interface SubmitListeningQuizDto {
  deckId: string;
  mode?: string;
  totalQuestions?: number;
  answers: ListeningAnswerSubmissionDto[];
}

export type DiffSpanType = "MATCH" | "MISSING" | "EXTRA" | "WRONG";

export interface DiffSpan {
  char: string;
  type: DiffSpanType;
}
