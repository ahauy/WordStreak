import { describe, it, expect } from 'vitest';
import {
  checkSentenceVocabularyCoverage,
  validateSentenceDifficulty,
  NGSL_TOP_500_WORDS,
  NGSL_TSL_COMBINED_WORDS,
} from '../lib/vocabulary-control';
import { validateEnrichedWord } from '../lib/validation-rules';

describe('Vocabulary Control Engine (US-LIB-13)', () => {
  describe('checkSentenceVocabularyCoverage (TC-LIB-13-001, TC-LIB-13-003)', () => {
    it('calculates 100% coverage when all words are in allowed set or match target word', () => {
      const allowed = new Set(['the', 'cat', 'is', 'on', 'mat', 'a', 'very']);
      const result = checkSentenceVocabularyCoverage(
        'The cat is on the mat.',
        allowed,
        'cat'
      );

      expect(result.totalWords).toBe(6);
      expect(result.coveredWords).toBe(6);
      expect(result.coveragePct).toBe(100);
      expect(result.outOfVocabWords).toEqual([]);
    });

    it('identifies out-of-vocabulary words correctly', () => {
      const allowed = new Set(['the', 'is', 'very']);
      const result = checkSentenceVocabularyCoverage(
        'The quantum anomaly is very mysterious.',
        allowed,
        'quantum'
      );

      expect(result.totalWords).toBe(6);
      expect(result.coveredWords).toBe(4); // the, quantum (target), is, very
      expect(result.outOfVocabWords).toEqual(['anomaly', 'mysterious']);
      expect(result.coveragePct).toBeCloseTo(66.67, 1);
    });

    it('handles inflected words (plurals, past tense, -ing) with simple stemming', () => {
      const allowed = new Set(['work', 'report', 'need']);
      const result = checkSentenceVocabularyCoverage(
        'Workers needed reports.',
        allowed
      );

      expect(result.outOfVocabWords).toEqual([]);
      expect(result.coveragePct).toBe(100);
    });
  });

  describe('validateSentenceDifficulty - Beginner Mode (TC-LIB-13-001, TC-LIB-13-002, TC-LIB-13-003)', () => {
    it('approves a 5-8 word sentence composed entirely of NGSL Top 500 words', () => {
      // "He is a good doctor today." (6 words)
      const result = validateSentenceDifficulty({
        sentence: 'He is a good doctor today.',
        mode: 'beginner',
        targetWord: 'doctor',
      });

      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual([]);
      expect(result.coverage.coveragePct).toBe(100);
    });

    it('flags sentences shorter than 5 words with EASY_EXAMPLE_TOO_SHORT', () => {
      const result = validateSentenceDifficulty({
        sentence: 'He is good.',
        mode: 'beginner',
        targetWord: 'good',
      });

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('EASY_EXAMPLE_TOO_SHORT');
    });

    it('flags sentences longer than 8 words with EASY_EXAMPLE_TOO_LONG', () => {
      const result = validateSentenceDifficulty({
        sentence: 'He is a very good and kind doctor in our town today.',
        mode: 'beginner',
        targetWord: 'doctor',
      });

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('EASY_EXAMPLE_TOO_LONG');
    });

    it('flags words outside NGSL Top 500 with EASY_EXAMPLE_OUT_OF_NGSL_500', () => {
      const result = validateSentenceDifficulty({
        sentence: 'The intricate mechanism stopped working immediately.',
        mode: 'beginner',
        targetWord: 'working',
      });

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('EASY_EXAMPLE_OUT_OF_NGSL_500');
      expect(result.coverage.outOfVocabWords.length).toBeGreaterThan(0);
    });
  });

  describe('validateSentenceDifficulty - Standard TOEIC Mode (TC-LIB-13-004, TC-LIB-13-005)', () => {
    it('approves standard sentence with >= 95% coverage in NGSL + TSL', () => {
      const result = validateSentenceDifficulty({
        sentence: 'The marketing manager will negotiate a new contract with the client tomorrow.',
        mode: 'standard',
        targetWord: 'negotiate',
      });

      expect(result.isValid).toBe(true);
      expect(result.coverage.coveragePct).toBeGreaterThanOrEqual(95);
    });

    it('flags sentences with < 95% coverage as EXAMPLE_LOW_COVERAGE', () => {
      const result = validateSentenceDifficulty({
        sentence: 'The juxtaposition of idiosyncratic paradigms bewildered the entire committee.',
        mode: 'standard',
        targetWord: 'committee',
      });

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('EXAMPLE_LOW_COVERAGE');
      expect(result.coverage.outOfVocabWords.length).toBeGreaterThan(1);
    });
  });

  describe('Integration with validateEnrichedWord (TC-LIB-13-006)', () => {
    it('validates exampleSentence coverage and exampleEasyEn when present', () => {
      const entry = {
        word: 'doctor',
        phonetic: '/ˈdɑːk.tər/',
        meaningVi: 'bác sĩ',
        exampleSentence: 'The doctor examined the patient in the morning.',
        exampleEasyEn: 'The doctor is here today.', // 5 words, simple
        collocations: ['see a doctor', 'medical doctor'],
      };

      const result = validateEnrichedWord(entry);
      expect(result.isValid).toBe(true);
      expect(result.status).toBe('APPROVED_CANDIDATE');
    });

    it('flags invalid beginner example length or hard words', () => {
      const entry = {
        word: 'doctor',
        phonetic: '/ˈdɑːk.tər/',
        meaningVi: 'bác sĩ',
        exampleSentence: 'The doctor examined the patient in the hospital.',
        exampleEasyEn: 'A doctor.', // only 2 words
        collocations: ['see a doctor', 'medical doctor'],
      };

      const result = validateEnrichedWord(entry);
      expect(result.isValid).toBe(false);
      expect(result.status).toBe('FLAGGED');
      expect(result.errors).toContain('EASY_EXAMPLE_TOO_SHORT');
    });
  });
});
