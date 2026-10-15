import { describe, it, expect } from 'vitest';
import { buildDecks, generateDeckSlug } from '../06-build-decks';
import type { EnrichedWordEntry } from '../03-enrich';

describe('TC-LIB-009: Deck Sizing & SEO Slugs', () => {
  it('should generate valid SEO slug according to standard pattern', () => {
    const slug1 = generateDeckSlug('TSL', 'T1', 'Office Communication', 1);
    expect(slug1).toBe('tsl-t1-office-communication-01');

    const slug2 = generateDeckSlug('TSL', 'T2', 'Sales & Marketing', 12);
    expect(slug2).toBe('tsl-t2-sales-marketing-12');
  });

  it('should chunk 50 words of same topic and level into exactly 2 decks of 25 words each', () => {
    const entries: EnrichedWordEntry[] = Array.from({ length: 50 }, (_, i) => ({
      idempotencyKey: `TSL:word${i}:noun`,
      word: `word${i}`,
      partOfSpeech: 'noun',
      freqRank: i + 1,
      level: 'T1',
      topicCategory: 'Office Communication',
      phonetic: `/${i}/`,
      meaningVi: `Nghĩa ${i}`,
      meaningEn: `Meaning ${i}`,
      exampleSentence: `Sentence for word${i}`,
      exampleTranslation: `Dịch cho word${i}`,
      collocations: [`colloc ${i} a`, `colloc ${i} b`],
      mnemonic: `Mẹo ${i}`,
      status: 'APPROVED',
    }));

    const decks = buildDecks(entries, { deckSize: 25 });

    expect(decks).toHaveLength(2);
    expect(decks[0].cards).toHaveLength(25);
    expect(decks[1].cards).toHaveLength(25);

    expect(decks[0].slug).toBe('tsl-t1-office-communication-01');
    expect(decks[1].slug).toBe('tsl-t1-office-communication-02');

    expect(decks[0].titleEn).toContain('Office Communication');
    expect(decks[0].titleVi).toBeDefined();
    expect(decks[0].level).toBe('T1');
  });

  it('should handle EC-LIB-005 when remainder words is >= 15 by allowing last deck', () => {
    const entries: EnrichedWordEntry[] = Array.from({ length: 43 }, (_, i) => ({
      idempotencyKey: `TSL:word${i}:noun`,
      word: `word${i}`,
      partOfSpeech: 'noun',
      freqRank: i + 1,
      level: 'T1',
      topicCategory: 'Technology',
      phonetic: `/${i}/`,
      meaningVi: `Nghĩa ${i}`,
      meaningEn: `Meaning ${i}`,
      exampleSentence: `Sentence for word${i}`,
      exampleTranslation: `Dịch cho word${i}`,
      collocations: [`colloc ${i} a`, `colloc ${i} b`],
      mnemonic: `Mẹo ${i}`,
      status: 'APPROVED',
    }));

    // 43 = 25 + 18 (18 >= 15 min remainder)
    const decks = buildDecks(entries, { deckSize: 25, minDeckSize: 15 });
    expect(decks).toHaveLength(2);
    expect(decks[0].cards).toHaveLength(25);
    expect(decks[1].cards).toHaveLength(18);
  });
});
