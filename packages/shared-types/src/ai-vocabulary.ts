export type AiCardSource = 'GEMINI_FLASH' | 'FREE_DICTIONARY' | 'MANUAL_CURATED';

export interface GenerateCardRequestDto {
  word: string;
}

export interface AiGeneratedCardData {
  word: string;
  partOfSpeech: string;
  phonetic: string;
  meaningVi: string;
  meaningEn: string;
  exampleSentence: string;
  exampleTranslation: string;
  collocations: string[];
  mnemonic: string;
  audioUrl?: string | null;
}

export interface GenerateCardResponseDto {
  card: AiGeneratedCardData;
  isCached: boolean;
  source: AiCardSource;
  dailyQuotaRemaining: number;
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
