/**
 * Vocabulary Control Engine (US-LIB-13)
 * Provides vocabulary coverage analysis and sentence difficulty validation
 * against NGSL 1.2 (Top 500) and NGSL + TSL corpora.
 */

// Core function words & closed-class words that are universally accessible
export const CORE_FUNCTION_WORDS = new Set([
  'a', 'an', 'the', 'this', 'that', 'these', 'those',
  'i', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'him', 'her', 'us', 'them',
  'my', 'your', 'his', 'its', 'our', 'their', 'mine', 'yours', 'hers', 'ours', 'theirs',
  'in', 'on', 'at', 'to', 'for', 'with', 'from', 'by', 'about', 'as', 'into', 'like', 'through', 'after', 'over', 'between', 'out', 'against', 'during', 'without', 'before', 'under', 'around', 'among',
  'and', 'but', 'or', 'so', 'because', 'if', 'when', 'than', 'though', 'while',
  'be', 'am', 'is', 'are', 'was', 'were', 'been', 'being',
  'have', 'has', 'had', 'having',
  'do', 'does', 'did', 'done', 'doing',
  'will', 'would', 'shall', 'should', 'can', 'could', 'may', 'might', 'must',
  'not', 'no', 'yes', 'too', 'very', 'here', 'there', 'now', 'then', 'all', 'any', 'some', 'one', 'two',
]);

// NGSL Top 500 foundation lemmas (high frequency general words)
export const NGSL_TOP_500_WORDS = new Set([
  ...CORE_FUNCTION_WORDS,
  'good', 'new', 'first', 'last', 'long', 'great', 'little', 'own', 'other', 'old', 'right', 'big', 'high', 'different', 'small', 'large', 'next', 'early', 'young', 'important', 'few', 'public', 'bad', 'same', 'able', 'nice', 'clean', 'easy', 'hard',
  'man', 'woman', 'child', 'person', 'people', 'year', 'day', 'time', 'thing', 'world', 'life', 'hand', 'part', 'eye', 'place', 'work', 'week', 'case', 'point', 'government', 'company', 'number', 'group', 'problem', 'fact',
  'say', 'get', 'make', 'go', 'know', 'take', 'see', 'come', 'think', 'look', 'want', 'give', 'use', 'find', 'tell', 'ask', 'work', 'seem', 'feel', 'try', 'leave', 'call', 'need', 'feel', 'become', 'mean', 'keep', 'let', 'begin', 'help', 'talk', 'turn', 'start', 'show', 'hear', 'play', 'run', 'move', 'live', 'believe', 'bring', 'happen', 'write', 'provide', 'sit', 'stand', 'lose', 'pay', 'meet', 'include', 'continue', 'set', 'learn', 'change', 'lead', 'understand', 'watch', 'follow', 'stop', 'create', 'speak', 'read', 'allow', 'add', 'spend', 'grow', 'open', 'walk', 'win', 'offer', 'remember', 'love', 'consider', 'appear', 'buy', 'wait', 'serve', 'die', 'send', 'expect', 'build', 'stay', 'fall', 'cut', 'reach', 'kill', 'remain',
  'home', 'job', 'car', 'book', 'room', 'mother', 'father', 'family', 'friend', 'school', 'student', 'teacher', 'doctor', 'house', 'city', 'country', 'state', 'town', 'water', 'food', 'money', 'night', 'morning', 'today', 'tomorrow', 'yesterday',
  'well', 'back', 'even', 'still', 'way', 'down', 'up', 'off', 'always', 'often', 'never', 'again', 'ever', 'almost', 'enough', 'away', 'really',
  'how', 'what', 'who', 'which', 'where', 'why', 'when', 'whose', 'whom',
]);

// Extended NGSL + TSL combined lemmas for TOEIC preparation
export const NGSL_TSL_COMBINED_WORDS = new Set([
  ...NGSL_TOP_500_WORDS,
  // Business, Office, Management & Administration
  'accommodate', 'beneficial', 'agenda', 'invoice', 'quarterly', 'negotiate',
  'management', 'manager', 'employee', 'staff', 'department', 'colleague', 'supervisor', 'executive',
  'contract', 'agreement', 'proposal', 'negotiation', 'partnership', 'policy', 'procedure',
  'budget', 'finance', 'financial', 'revenue', 'expense', 'investment', 'profit', 'loss', 'audit', 'tax',
  'marketing', 'advertising', 'campaign', 'sales', 'client', 'customer', 'market', 'consumer', 'brand',
  'production', 'manufacturing', 'facility', 'warehouse', 'inventory', 'supply', 'logistics', 'shipment', 'delivery',
  'meeting', 'conference', 'presentation', 'schedule', 'appointment', 'deadline', 'agenda', 'minutes',
  'office', 'desk', 'computer', 'software', 'network', 'system', 'database', 'report', 'document', 'file',
  'hire', 'recruit', 'interview', 'applicant', 'resume', 'candidate', 'salary', 'benefits', 'training', 'retire',
  'quality', 'standard', 'inspection', 'maintenance', 'repair', 'equipment', 'warranty', 'guarantee',
  'travel', 'flight', 'ticket', 'hotel', 'reservation', 'itinerary', 'destination', 'transportation', 'passport',
  'health', 'insurance', 'safety', 'security', 'emergency', 'regulation', 'compliance', 'permit',
  'expand', 'launch', 'promote', 'develop', 'improve', 'increase', 'decrease', 'evaluate', 'analyze', 'implement',
  'conduct', 'organize', 'coordinate', 'supervise', 'approve', 'confirm', 'submit', 'review', 'revise',
  'examine', 'patient', 'hospital', 'medical', 'clinic', 'treatment', 'nurse',
  'committee', 'entire', 'board', 'director', 'shareholder', 'stakeholder',
  'special', 'request', 'valid', 'worker', 'item', 'product', 'price', 'cost', 'service', 'guest',
]);

/**
 * Strips punctuation and converts to lowercase.
 */
export function cleanToken(token: string): string {
  return token.toLowerCase().replace(/^[^\w]+|[^\w]+$/g, '');
}

/**
 * Performs light morphological stripping to map inflected tokens to lemmas.
 */
export function stemToken(token: string): string[] {
  const clean = cleanToken(token);
  if (!clean) return [];

  const candidates: Set<string> = new Set([clean]);

  // Agent nouns: -ers, -er (e.g. workers -> worker, work)
  if (clean.endsWith('ers') && clean.length > 4) {
    candidates.add(clean.slice(0, -3));
    candidates.add(clean.slice(0, -1));
  } else if (clean.endsWith('er') && clean.length > 3) {
    candidates.add(clean.slice(0, -2));
  }

  // Plurals and 3rd person singular: -ies, -es, -s
  if (clean.endsWith('ies') && clean.length > 4) {
    candidates.add(clean.slice(0, -3) + 'y');
  } else if (clean.endsWith('es') && clean.length > 3) {
    candidates.add(clean.slice(0, -2));
    candidates.add(clean.slice(0, -1));
  } else if (clean.endsWith('s') && clean.length > 2) {
    candidates.add(clean.slice(0, -1));
  }

  // Past tense / past participle: -ied, -ed, -d
  if (clean.endsWith('ied') && clean.length > 4) {
    candidates.add(clean.slice(0, -3) + 'y');
  } else if (clean.endsWith('ed') && clean.length > 3) {
    candidates.add(clean.slice(0, -2));
    candidates.add(clean.slice(0, -1)); // e.g. accommodated -> accommodate
  }

  // Participle / Gerund: -ing
  if (clean.endsWith('ing') && clean.length > 4) {
    candidates.add(clean.slice(0, -3));
    candidates.add(clean.slice(0, -3) + 'e'); // e.g. negotiating -> negotiate
  }

  // Adverb: -ily, -ly (e.g. easily -> easy)
  if (clean.endsWith('ily') && clean.length > 4) {
    candidates.add(clean.slice(0, -3) + 'y');
  } else if (clean.endsWith('ly') && clean.length > 3) {
    candidates.add(clean.slice(0, -2));
  }

  return Array.from(candidates);
}

export interface SentenceCoverageResult {
  totalWords: number;
  coveredWords: number;
  coveragePct: number;
  outOfVocabWords: string[];
}

/**
 * Checks vocabulary coverage of a sentence against an allowed lemma set.
 */
export function checkSentenceVocabularyCoverage(
  sentence: string,
  allowedWordSet: Set<string>,
  targetWord?: string
): SentenceCoverageResult {
  if (!sentence || typeof sentence !== 'string') {
    return { totalWords: 0, coveredWords: 0, coveragePct: 100, outOfVocabWords: [] };
  }

  // Tokenize by whitespace and filter out non-word tokens
  const rawTokens = sentence.split(/\s+/).filter(Boolean);
  const words: string[] = [];

  for (const t of rawTokens) {
    const cleaned = cleanToken(t);
    // Only count tokens containing alphabetical characters
    if (cleaned && /[a-z]/i.test(cleaned)) {
      words.push(cleaned);
    }
  }

  if (words.length === 0) {
    return { totalWords: 0, coveredWords: 0, coveragePct: 100, outOfVocabWords: [] };
  }

  const cleanTargetStems = targetWord ? stemToken(targetWord) : [];
  const outOfVocabWords: string[] = [];
  let coveredWords = 0;

  for (const word of words) {
    const stems = stemToken(word);

    // 1. Is it the target word or its inflections?
    const isTarget = cleanTargetStems.some((stem) => stems.includes(stem));
    if (isTarget) {
      coveredWords++;
      continue;
    }

    // 2. Is it in the allowed word set?
    const isAllowed = stems.some((stem) => allowedWordSet.has(stem));
    if (isAllowed) {
      coveredWords++;
      continue;
    }

    outOfVocabWords.push(word);
  }

  const coveragePct = Math.round((coveredWords / words.length) * 10000) / 100;

  return {
    totalWords: words.length,
    coveredWords,
    coveragePct,
    outOfVocabWords,
  };
}

export interface SentenceDifficultyOptions {
  sentence: string;
  mode: 'beginner' | 'standard';
  targetWord: string;
  minWords?: number;
  maxWords?: number;
}

export interface SentenceDifficultyResult {
  isValid: boolean;
  errors: string[];
  coverage: SentenceCoverageResult;
}

/**
 * Validates sentence difficulty for Beginner mode (example_easy_en)
 * or Standard TOEIC mode (example_en).
 */
export function validateSentenceDifficulty(
  params: SentenceDifficultyOptions
): SentenceDifficultyResult {
  const { sentence, mode, targetWord } = params;
  const errors: string[] = [];

  if (mode === 'beginner') {
    const minWords = params.minWords ?? 5;
    const maxWords = params.maxWords ?? 8;

    const coverage = checkSentenceVocabularyCoverage(
      sentence,
      NGSL_TOP_500_WORDS,
      targetWord
    );

    if (coverage.totalWords < minWords) {
      errors.push('EASY_EXAMPLE_TOO_SHORT');
    }
    if (coverage.totalWords > maxWords) {
      errors.push('EASY_EXAMPLE_TOO_LONG');
    }
    if (coverage.outOfVocabWords.length > 0) {
      errors.push('EASY_EXAMPLE_OUT_OF_NGSL_500');
    }

    return {
      isValid: errors.length === 0,
      errors,
      coverage,
    };
  }

  // Standard TOEIC mode
  const coverage = checkSentenceVocabularyCoverage(
    sentence,
    NGSL_TSL_COMBINED_WORDS,
    targetWord
  );

  if (coverage.coveragePct < 95) {
    errors.push('EXAMPLE_LOW_COVERAGE');
  }

  return {
    isValid: errors.length === 0,
    errors,
    coverage,
  };
}
