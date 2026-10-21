import { validateSentenceDifficulty } from './vocabulary-control';

export type CanonicalPOS =
  | 'noun'
  | 'verb'
  | 'adjective'
  | 'adverb'
  | 'preposition'
  | 'conjunction'
  | 'pronoun'
  | 'phrase';

const POS_MAP: Record<string, CanonicalPOS> = {
  v: 'verb',
  verb: 'verb',
  n: 'noun',
  noun: 'noun',
  adj: 'adjective',
  adjective: 'adjective',
  adv: 'adverb',
  adverb: 'adverb',
  prep: 'preposition',
  preposition: 'preposition',
  conj: 'conjunction',
  conjunction: 'conjunction',
  pron: 'pronoun',
  pronoun: 'pronoun',
  phrase: 'phrase',
};

/**
 * Maps raw POS abbreviations (v, n, adj, adv...) to standard canonical names.
 */
export function canonicalizePOS(pos: string): CanonicalPOS {
  const normalized = (pos || '').toLowerCase().trim();
  const canonical = POS_MAP[normalized];
  if (!canonical) {
    throw new Error(`Unrecognized part of speech: "${pos}"`);
  }
  return canonical;
}

/**
 * Validates IPA format adhering to /^\/[^\/]+\/$/
 */
export function isValidIpaFormat(phonetic: string | null | undefined): boolean {
  if (!phonetic || typeof phonetic !== 'string') return false;
  return /^\/[^/]+\/$/.test(phonetic.trim());
}

/**
 * Checks if a sentence contains the word lemma or its typical inflectional forms
 * (e.g. accommodates, accommodating, accommodated, strategies, etc.)
 */
export function sentenceContainsLemma(word: string, sentence: string | null | undefined): boolean {
  if (!word || !sentence || typeof sentence !== 'string') return false;

  const cleanWord = word.toLowerCase().trim();
  const lowerSentence = sentence.toLowerCase();

  // 1. Direct whole-word check
  const exactRegex = new RegExp(`\\b${cleanWord}\\b`, 'i');
  if (exactRegex.test(lowerSentence)) return true;

  // 2. Inflectional variants check
  // e.g. accommodate -> accommodat(e)?(ed|ing|es|s)
  // strategy -> strateg(y|ies|ic)
  const stems: string[] = [cleanWord];

  if (cleanWord.endsWith('e')) {
    stems.push(cleanWord.slice(0, -1)); // accommodat
  }
  if (cleanWord.endsWith('y')) {
    stems.push(cleanWord.slice(0, -1)); // strateg
  }

  for (const stem of stems) {
    const inflectRegex = new RegExp(
      `\\b${stem}(e|es|ed|ing|d|s|ies|ly|tion|ions)?\\b`,
      'i'
    );
    if (inflectRegex.test(lowerSentence)) {
      return true;
    }
  }

  return false;
}

export interface WordValidationTarget {
  word: string;
  phonetic?: string | null;
  meaningVi?: string | null;
  exampleSentence?: string | null;
  exampleEasyEn?: string | null;
  collocations?: string[] | null;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  status: 'APPROVED_CANDIDATE' | 'FLAGGED';
}

/**
 * Validates enriched card data against strict WordStreak lexicographical rules.
 */
export function validateEnrichedWord(entry: WordValidationTarget): ValidationResult {
  const errors: string[] = [];

  // Rule 1: IPA format
  if (!isValidIpaFormat(entry.phonetic)) {
    errors.push('INVALID_IPA_FORMAT');
  }

  // Rule 2: Lemma in example sentence
  if (!sentenceContainsLemma(entry.word, entry.exampleSentence)) {
    errors.push('EXAMPLE_MISSING_HEADWORD');
  }

  // Rule 3: Vietnamese meaning quality
  const meaningVi = (entry.meaningVi || '').trim();
  if (
    meaningVi.length < 2 ||
    meaningVi.toLowerCase() === 'undefined' ||
    meaningVi.toLowerCase() === 'n/a'
  ) {
    errors.push('MEANING_VI_TOO_SHORT');
  } else if (meaningVi.toLowerCase() === entry.word.toLowerCase()) {
    errors.push('MEANING_VI_NOT_TRANSLATED');
  }

  // Rule 4: Collocations count
  if (!Array.isArray(entry.collocations) || entry.collocations.length < 2) {
    errors.push('INSUFFICIENT_COLLOCATIONS');
  }

  // Rule 5: Standard example sentence coverage (>= 95% in NGSL + TSL)
  if (entry.exampleSentence) {
    const stdResult = validateSentenceDifficulty({
      sentence: entry.exampleSentence,
      mode: 'standard',
      targetWord: entry.word,
    });
    if (!stdResult.isValid) {
      errors.push(...stdResult.errors);
    }
  }

  // Rule 6: Beginner example sentence checks (5-8 words & 100% in NGSL Top 500)
  if (entry.exampleEasyEn) {
    const easyResult = validateSentenceDifficulty({
      sentence: entry.exampleEasyEn,
      mode: 'beginner',
      targetWord: entry.word,
    });
    if (!easyResult.isValid) {
      errors.push(...easyResult.errors);
    }
  }

  const isValid = errors.length === 0;
  return {
    isValid,
    errors,
    status: isValid ? 'APPROVED_CANDIDATE' : 'FLAGGED',
  };
}
