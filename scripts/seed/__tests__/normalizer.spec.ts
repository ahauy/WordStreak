import { describe, it, expect } from 'vitest';
import { canonicalizePOS, normalizeEntries, runStage2 } from '../02-normalize';
import type { RawWordEntry } from '../01-import';

describe('TC-LIB-002: POS Canonical Mapping', () => {
  it('should canonicalize all abbreviation forms to standard parts of speech', () => {
    const inputs = ['v', 'n', 'adj', 'adv', 'prep', 'conj', 'pron'];
    const expected = ['verb', 'noun', 'adjective', 'adverb', 'preposition', 'conjunction', 'pronoun'];

    const actual = inputs.map((pos) => canonicalizePOS(pos));
    expect(actual).toEqual(expected);
  });

  it('should accept already canonical forms or uppercase variations', () => {
    expect(canonicalizePOS('VERB')).toBe('verb');
    expect(canonicalizePOS('Noun')).toBe('noun');
    expect(canonicalizePOS('adjective')).toBe('adjective');
    expect(canonicalizePOS('phrase')).toBe('phrase');
  });
});

describe('TC-LIB-003: Tier Stratification & Cross Deduplication', () => {
  it('should stratify words into T1, T2, and T3 based on freqRank', () => {
    const rawEntries: RawWordEntry[] = [
      { headword: 'first', pos: 'adj', freqRank: 50, freqValue: 90, listCode: 'TSL' },
      { headword: 'middle', pos: 'n', freqRank: 600, freqValue: 30, listCode: 'TSL' },
      { headword: 'rare', pos: 'v', freqRank: 1050, freqValue: 5, listCode: 'TSL' },
    ];

    const normalized = normalizeEntries(rawEntries);

    expect(normalized[0].level).toBe('T1');
    expect(normalized[1].level).toBe('T2');
    expect(normalized[2].level).toBe('T3');
  });

  it('should construct correct idempotencyKey following BR-LIB-001', () => {
    const rawEntries: RawWordEntry[] = [
      { headword: 'Accommodate ', pos: 'v', freqRank: 120, freqValue: 45.2, listCode: 'TSL' },
    ];

    const [normalized] = normalizeEntries(rawEntries);
    expect(normalized.idempotencyKey).toBe('TSL:accommodate:verb');
    expect(normalized.word).toBe('accommodate');
    expect(normalized.partOfSpeech).toBe('verb');
  });

  it('should cross-deduplicate entries between TSL and NGSL, prioritizing TSL and tagging crossListRef', () => {
    const rawEntries: RawWordEntry[] = [
      { headword: 'accommodate', pos: 'v', freqRank: 120, freqValue: 45.2, listCode: 'TSL' },
      { headword: 'accommodate', pos: 'v', freqRank: 1500, freqValue: 10.0, listCode: 'NGSL' },
      { headword: 'market', pos: 'n', freqRank: 200, freqValue: 80.0, listCode: 'NGSL' },
    ];

    const normalized = normalizeEntries(rawEntries);

    // Should only have 1 accommodate entry, with listCode TSL, crossListRef NGSL
    const accommodate = normalized.find((e) => e.word === 'accommodate');
    expect(accommodate).toBeDefined();
    expect(accommodate?.idempotencyKey).toBe('TSL:accommodate:verb');
    expect(accommodate?.crossListRef).toBe('NGSL');

    // Market is only in NGSL
    const market = normalized.find((e) => e.word === 'market');
    expect(market).toBeDefined();
    expect(market?.idempotencyKey).toBe('NGSL:market:noun');
  });
});
