/**
 * Official Vocabulary & Starter Library Data Contracts
 */

export interface OfficialCardContent {
  word: string;
  pos: string;
  ipa_us?: string;
  meaning_vi: string;
  definition_en?: string;
  example_en?: string;
  example_vi?: string;
  context_type?: string;
  collocations?: string[];
  word_family?: string[];
  confusables?: Array<{ word: string; note_vi: string }>;
  topic?: string;
  level?: string;
  freqRank?: number;
  tip_vi?: string | null;
  example_easy_en?: string | null;
  example_easy_vi?: string | null;
  stress_syllable?: number | null;
  ending_sound_tip_vi?: string | null;
}

export interface OfficialDeckDto {
  id: string;
  slug: string;
  title: string;
  titleVi: string;
  description?: string | null;
  pathCode: string;
  level?: string | null;
  order: number;
  listCode: string;
  cardCount: number;
  isEnrolled?: boolean;
  masteredCount?: number;
}

export interface OfficialCardDto {
  id: string;
  headword: string;
  pos: string;
  content: OfficialCardContent;
  status: string;
  contentVersion: number;
  promptVersion?: string | null;
}

export interface ForkOfficialCardDto {
  targetDeckId?: string;
}

export interface ForkOfficialCardResponse {
  cardId: string;
  deckId: string;
  word: string;
  meaning: string;
  status: string;
}
