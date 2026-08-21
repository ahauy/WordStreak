/**
 * TypeScript Contracts: Speech Recognition & Pronunciation Assessment (EPIC-08)
 * Path: .specify/features/speech-pronunciation-assessment/contracts/voice-practice.contract.ts
 */

export type VoiceAccentLocale = "en-US" | "en-GB";

export type VoiceAssessmentTier = "EXACT" | "CLOSE" | "RETRY";

export type VoiceDiffSpanType = "MATCH" | "MISSING" | "EXTRA" | "WRONG";

export interface VoiceDiffSpan {
  char: string;
  type: VoiceDiffSpanType;
}

export interface IpaSyllableToken {
  id: string;
  syllable: string;
  isPrimaryStress: boolean;
  isSecondaryStress: boolean;
  rawText: string;
}

export interface VoicePracticeSubmissionDto {
  cardId: string;
  targetWord: string;
  spokenTranscript: string;
  accuracyScore: number;
  accent: VoiceAccentLocale;
  timeSpentMs?: number;
}

export interface VoicePracticeResultDto {
  isPassed: boolean;
  accuracyScore: number;
  tier: VoiceAssessmentTier;
  xpAwarded: number;
  isDailyCapped: boolean;
  streakAdvanced: boolean;
  diffSpans: VoiceDiffSpan[];
  feedbackMessage: string;
}

export interface VoicePracticeApiResponse {
  success: boolean;
  data: VoicePracticeResultDto;
  message?: string;
}
