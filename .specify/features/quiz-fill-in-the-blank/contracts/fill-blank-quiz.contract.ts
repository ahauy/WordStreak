// Contract: Fill-in-the-blank Quiz DTOs & API Contracts (US-QUIZ-02)

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

export interface FillBlankAnswerSubmissionDto {
  questionId: string;
  cardId: string;
  submittedText: string;
  isCorrect: boolean;
  hintsUsed: number;
  timeSpentMs: number;
}
