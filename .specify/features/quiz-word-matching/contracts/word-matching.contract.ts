/**
 * TypeScript API Contracts & DTOs for Word Matching Game (US-QUIZ-04)
 * Feature Slug: quiz-word-matching
 * Epic: EPIC-04 (Multi-format Practice & Quiz Modes)
 */

export type MatchingTileType = "WORD" | "MEANING";

export type MatchingTileState = "NEUTRAL" | "SELECTED" | "MATCHED" | "MISMATCH";

/**
 * Individual tile item in a matching column (English word or Vietnamese meaning).
 */
export interface MatchingCardItemDto {
  id: string; // Unique tile instance ID (e.g., `tile_w_${cardId}` or `tile_m_${cardId}`)
  cardId: string; // Source card ID
  text: string; // Display text (Word in English or Meaning in Vietnamese)
  type: MatchingTileType; // Column classification
  phonetic?: string | null; // IPA phonetic (for English tiles)
  audioUrl?: string | null; // Pronunciation audio URL
}

/**
 * Backwards-compatible alias for MatchingCardItemDto
 */
export type MatchingPairDto = MatchingCardItemDto;

/**
 * A single round consisting of 5 pairs (10 tiles total, independently shuffled).
 */
export interface MatchingRoundDto {
  roundIndex: number; // 0-indexed round number
  totalRounds: number; // Total rounds in session
  wordTiles: MatchingCardItemDto[]; // 5 independently shuffled English tiles
  meaningTiles: MatchingCardItemDto[]; // 5 independently shuffled Vietnamese tiles
}

/**
 * Query parameters for fetching matching quiz rounds.
 */
export interface GetMatchingQuizQueryDto {
  deckId: string; // Deck UUID
  limit?: number; // Total cards count: default 10 (2 rounds of 5), min 5, max 50
}

/**
 * Backwards-compatible alias for query DTO
 */
export type GetMatchingQuestionsQueryDto = GetMatchingQuizQueryDto;

/**
 * Response payload containing generated matching rounds.
 */
export interface MatchingQuizResponseDto {
  deckId: string;
  totalCards: number;
  totalRounds: number;
  rounds: MatchingRoundDto[];
}

/**
 * Telemetry and score metrics for an individual matched pair.
 */
export interface MatchingAnswerSubmissionDto {
  cardId: string; // Card UUID
  matchedInMs: number; // Time elapsed to match this pair in milliseconds
  attempts: number; // Number of attempts before correct match (1 = first try)
  isCorrectFirstTry: boolean; // True if attempts === 1
}

/**
 * Payload sent to backend upon session completion.
 */
export interface MatchingSubmitQuizDto {
  deckId: string; // Deck UUID
  mode: "MATCHING"; // Mode identifier
  totalPairs: number; // Total pairs in session
  totalTimeMs: number; // Total duration across all rounds in milliseconds
  answers: MatchingAnswerSubmissionDto[]; // Telemetry array per card
}

/**
 * Backwards-compatible alias for submit DTO
 */
export type SubmitMatchingQuizDto = MatchingSubmitQuizDto;

/**
 * Missed card summary for post-quiz review without mutating SM-2 state.
 */
export interface MatchingMissedCardDto {
  cardId: string;
  word: string;
  meaning: string;
  phonetic?: string | null;
  audioUrl?: string | null;
  errorAttempts: number;
}

/**
 * Detailed XP calculation breakdown.
 */
export interface MatchingXpBreakdownDto {
  baseXp: number; // Base XP (2 XP per pair)
  comboBonusXp: number; // Additional XP from combo streaks (1.2x, 1.5x, 2.0x)
  speedBonusXp: number; // +10 XP if round completed in <= 15s with 0 errors
  perfectBonusXp: number; // +5 XP if round completed with 0 errors
  totalXp: number; // Total XP awarded
  isDailyCapped: boolean; // True if daily 500 XP practice cap reached
  isBotDetected: boolean; // True if velocity check flagged submission (< 1500ms / < 200ms)
}

/**
 * Response payload returned from submit endpoint.
 */
export interface MatchingQuizResultDto {
  totalPairs: number;
  matchedCount: number;
  accuracyPercentage: number;
  maxCombo: number;
  totalTimeMs: number;
  totalXpEarned: number;
  xpBreakdown: MatchingXpBreakdownDto;
  missedCards: MatchingMissedCardDto[];
}
