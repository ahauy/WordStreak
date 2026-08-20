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
  questionId: string;
  cardId: string;
  selectedOptionId: string | null;
  isCorrect: boolean;
  timeSpentMs: number;
}

export interface SubmitQuizDto {
  deckId: string;
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
