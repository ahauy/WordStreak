/**
 * AI Vocabulary Generation & Global Cache Contracts
 * Feature: ai-vocabulary-generator (EPIC-07: US-AI-01 & US-AI-02)
 */

export interface GenerateCardRequestDto {
  /** Target word or short phrase to generate flashcard details for (max 64 chars) */
  word: string;
}

export interface AiGeneratedCardData {
  /** Normalized word string */
  word: string;
  /** Part of speech (e.g. noun, verb, adjective, phrase) */
  partOfSpeech: string;
  /** International Phonetic Alphabet (IPA) representation */
  phonetic: string;
  /** Concise Vietnamese definition */
  meaningVi: string;
  /** Clear English definition with nuance */
  meaningEn: string;
  /** Natural English sentence demonstrating usage */
  exampleSentence: string;
  /** Vietnamese translation of the example sentence */
  exampleTranslation: string;
  /** High-frequency collocations */
  collocations: string[];
  /** Vietnamese memory hook or mnemonic association */
  mnemonic: string;
  /** Pronunciation audio URL if available */
  audioUrl?: string | null;
}

export type AiCardSource = 'GEMINI_FLASH' | 'FREE_DICTIONARY' | 'MANUAL_CURATED';

export interface GenerateCardResponseDto {
  /** Structured flashcard data */
  card: AiGeneratedCardData;
  /** Whether the result was retrieved from the shared GlobalDictionaryCache */
  isCached: boolean;
  /** Data source provider */
  source: AiCardSource;
  /** Number of remaining uncached AI generations for today */
  dailyQuotaRemaining: number;
  /** Maximum uncached AI generations allowed per day (30) */
  dailyQuotaMax: number;
}

export interface GlobalDictionaryCacheRecord {
  id: string;
  word: string;
  partOfSpeech?: string | null;
  phonetic?: string | null;
  meaningVi: string;
  meaningEn?: string | null;
  exampleSentence?: string | null;
  exampleTranslation?: string | null;
  collocations: string[];
  mnemonic?: string | null;
  audioUrl?: string | null;
  source: AiCardSource;
  hitCount: number;
  createdAt: Date | string;
  updatedAt: Date | string;
}
