import {
  normalizePronunciationText,
  computeLevenshteinDistance,
  computePronunciationScore,
  computeDiffSpans,
} from './pronunciation-scoring.util';

describe('pronunciation-scoring.util', () => {
  describe('normalizePronunciationText', () => {
    it('should strip punctuation, lowercase, and trim text', () => {
      expect(normalizePronunciationText('  Hello, World!  ')).toBe(
        'hello world',
      );
      expect(normalizePronunciationText("It's beautiful.")).toBe(
        'its beautiful',
      );
      expect(normalizePronunciationText('')).toBe('');
    });
  });

  describe('computeLevenshteinDistance', () => {
    it('should calculate 0 distance for identical strings', () => {
      expect(computeLevenshteinDistance('kitten', 'kitten')).toBe(0);
    });

    it('should calculate correct distance for substitutions and insertions', () => {
      expect(computeLevenshteinDistance('kitten', 'sitting')).toBe(3);
      expect(computeLevenshteinDistance('cat', '')).toBe(3);
      expect(computeLevenshteinDistance('', 'dog')).toBe(3);
    });
  });

  describe('computePronunciationScore', () => {
    it('should return 100% and EXACT tier for identical words', () => {
      const result = computePronunciationScore('eloquent', 'eloquent');
      expect(result.score).toBe(100);
      expect(result.tier).toBe('EXACT');
      expect(result.isPassed).toBe(true);
    });

    it('should return ~91% and CLOSE tier for minor typos', () => {
      const result = computePronunciationScore('preliminary', 'preliminry');
      expect(result.score).toBeGreaterThanOrEqual(80);
      expect(result.tier).toBe('CLOSE');
      expect(result.isPassed).toBe(true);
    });

    it('should return <80% and RETRY tier for mispronounced words', () => {
      const result = computePronunciationScore('epitome', 'ep-tomb');
      expect(result.score).toBeLessThan(80);
      expect(result.tier).toBe('RETRY');
      expect(result.isPassed).toBe(false);
    });

    it('should handle edge cases with empty strings', () => {
      expect(computePronunciationScore('', 'word').isPassed).toBe(false);
      expect(computePronunciationScore('word', '').isPassed).toBe(false);
      expect(computePronunciationScore('', '').isPassed).toBe(true);
    });
  });

  describe('computeDiffSpans', () => {
    it('should return all MATCH spans for identical strings', () => {
      const spans = computeDiffSpans('cat', 'cat');
      expect(spans).toEqual([
        { char: 'c', type: 'MATCH' },
        { char: 'a', type: 'MATCH' },
        { char: 't', type: 'MATCH' },
      ]);
    });

    it('should identify substitutions as WRONG tokens', () => {
      const spans = computeDiffSpans('cat', 'cot');
      expect(spans).toEqual([
        { char: 'c', type: 'MATCH' },
        { char: 'o', type: 'WRONG' },
        { char: 't', type: 'MATCH' },
      ]);
    });

    it('should identify deletions as MISSING tokens', () => {
      const spans = computeDiffSpans('cats', 'cat');
      expect(spans).toEqual([
        { char: 'c', type: 'MATCH' },
        { char: 'a', type: 'MATCH' },
        { char: 't', type: 'MATCH' },
        { char: 's', type: 'MISSING' },
      ]);
    });

    it('should identify insertions as EXTRA tokens', () => {
      const spans = computeDiffSpans('cat', 'cats');
      expect(spans).toEqual([
        { char: 'c', type: 'MATCH' },
        { char: 'a', type: 'MATCH' },
        { char: 't', type: 'MATCH' },
        { char: 's', type: 'EXTRA' },
      ]);
    });

    it('should handle empty strings cleanly', () => {
      expect(computeDiffSpans('', '')).toEqual([]);
      expect(computeDiffSpans('a', '')).toEqual([
        { char: 'a', type: 'MISSING' },
      ]);
      expect(computeDiffSpans('', 'b')).toEqual([{ char: 'b', type: 'EXTRA' }]);
    });
  });
});
