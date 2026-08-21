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

// Word Matching Game Types (US-QUIZ-04)
export type MatchingTileType = "WORD" | "MEANING" | "term" | "definition";

export type MatchingTileState =
  | "NEUTRAL"
  | "SELECTED"
  | "MATCHED"
  | "MISMATCH"
  | "idle"
  | "selected"
  | "matched"
  | "error";

export interface MatchingCardItemDto {
  id: string;
  cardId: string;
  text: string;
  type: MatchingTileType;
  phonetic?: string | null;
  audioUrl?: string | null;
}

export type MatchingPairDto = MatchingCardItemDto;

export interface MatchingRoundDto {
  roundIndex: number;
  totalRounds: number;
  wordTiles: MatchingCardItemDto[];
  meaningTiles: MatchingCardItemDto[];
  columnA?: MatchingCardItemDto[];
  columnB?: MatchingCardItemDto[];
}

export interface GetMatchingQuizQueryDto {
  deckId: string;
  limit?: number;
  roundsCount?: number;
}

export type GetMatchingQuestionsQueryDto = GetMatchingQuizQueryDto;

export interface MatchingQuizResponseDto {
  deckId: string;
  deckTitle?: string;
  totalCards: number;
  totalRounds: number;
  rounds: MatchingRoundDto[];
}

export interface MatchingAnswerSubmissionDto {
  cardId: string;
  matchedInMs?: number;
  responseTimeMs?: number;
  attempts?: number;
  isCorrectFirstTry?: boolean;
  termCardId?: string;
  definitionCardId?: string;
  isCorrect?: boolean;
}

export interface SubmitMatchingQuizDto {
  deckId: string;
  mode?: "MATCHING" | string;
  quizType?: "matching" | string;
  roundsCompleted?: number;
  totalPairs: number;
  correctPairs?: number;
  maxCombo?: number;
  totalTimeMs: number;
  answers?: MatchingAnswerSubmissionDto[];
  roundDetails?: unknown;
}

export type MatchingSubmitQuizDto = SubmitMatchingQuizDto;

export interface MatchingMissedCardDto {
  cardId: string;
  word: string;
  meaning: string;
  phonetic?: string | null;
  audioUrl?: string | null;
  errorAttempts?: number;
}

export interface MatchingXpBreakdownDto {
  baseXp: number;
  comboBonusXp: number;
  speedBonusXp: number;
  perfectBonusXp: number;
  totalXp: number;
  isDailyCapped?: boolean;
  isBotDetected?: boolean;
  isBotFlagged?: boolean;
}

export interface MatchingQuizResultDto {
  submissionId?: string;
  score?: number;
  accuracy?: number;
  totalPairs: number;
  matchedCount: number;
  accuracyPercentage: number;
  maxCombo: number;
  totalTimeMs: number;
  totalXpEarned: number;
  totalXp?: number;
  isBotFlagged?: boolean;
  xpBreakdown: MatchingXpBreakdownDto;
  missedCards: MatchingMissedCardDto[];
}

// ==========================================
// Voice Practice & Speech Recognition Types (EPIC-08)
// ==========================================

export const VoicePronunciationTier = {
  EXACT: "EXACT",
  CLOSE: "CLOSE",
  RETRY: "RETRY",
} as const;

export type VoicePronunciationTier =
  (typeof VoicePronunciationTier)[keyof typeof VoicePronunciationTier];

export const VoiceEvaluationMode = {
  STRICT: "STRICT",
  LENIENT: "LENIENT",
} as const;

export type VoiceEvaluationMode =
  (typeof VoiceEvaluationMode)[keyof typeof VoiceEvaluationMode];

export type VoicePracticeState =
  | "IDLE"
  | "PRE_PROMPT"
  | "REQUESTING"
  | "LISTENING"
  | "PROCESSING"
  | "EVALUATED"
  | "PERMISSION_DENIED"
  | "ERROR";

export interface IpaSyllableToken {
  syllable: string;
  isPrimaryStress: boolean;
  isSecondaryStress: boolean;
  rawIpa?: string;
}

export interface VoicePronunciationSubmitDto {
  cardId: string;
  spokenTranscript: string;
  targetWord?: string;
  accuracyScore?: number;
  accent?: "en-US" | "en-GB" | string;
  timeSpentMs?: number;
  evaluationMode?: VoiceEvaluationMode;
}

export type SubmitVoicePracticeDto = VoicePronunciationSubmitDto;
export type VoicePracticeSubmissionDto = VoicePronunciationSubmitDto;
export type SubmitVoiceDto = VoicePronunciationSubmitDto;

export interface VoicePronunciationResultDto {
  isPassed: boolean;
  accuracyScore: number;
  tier: VoicePronunciationTier;
  xpAwarded: number;
  isDailyCapped: boolean;
  streakAdvanced: boolean;
  diffSpans?: DiffSpan[];
}

export type VoicePracticeResultDto = VoicePronunciationResultDto;

export interface VoicePracticeAttempt {
  id?: string;
  userId?: string;
  cardId: string;
  targetWord: string;
  recognizedText: string;
  accuracyScore: number;
  isPassed: boolean;
  xpAwarded: number;
  accentUsed?: string;
  createdAt?: Date | string;
}
