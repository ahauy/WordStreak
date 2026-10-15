import { describe, it, expect } from 'vitest';
import {
  isValidIpaFormat,
  sentenceContainsLemma,
  validateEnrichedWord,
} from '../lib/validation-rules';
import { runValidationReport } from '../04-validate';
import type { EnrichedWordEntry } from '../03-enrich';

describe('TC-LIB-007: Strict IPA Regex & Lemma Validation', () => {
  it('should validate IPA format strictly adhering to /^\\/[^\\/]+\\/$/', () => {
    expect(isValidIpaFormat('/əˈkɑː.mə.deɪt/')).toBe(true);
    expect(isValidIpaFormat('/ˌben.ɪˈfɪʃ.əl/')).toBe(true);

    // Invalid formats
    expect(isValidIpaFormat('əˈkɑː.mə.deɪt')).toBe(false); // missing slashes
    expect(isValidIpaFormat('/əˈkɑː.mə.deɪt')).toBe(false); // missing trailing slash
    expect(isValidIpaFormat('//')).toBe(false); // empty
    expect(isValidIpaFormat('')).toBe(false);
  });

  it('should detect if example sentence contains headword lemma or its regular inflections', () => {
    // Exact match
    expect(
      sentenceContainsLemma('accommodate', 'The hall can accommodate 200 people.')
    ).toBe(true);

    // Inflected forms
    expect(
      sentenceContainsLemma('accommodate', 'The company accommodated all client requests.')
    ).toBe(true);
    expect(
      sentenceContainsLemma('accommodate', 'We are accommodating new team members.')
    ).toBe(true);
    expect(
      sentenceContainsLemma('strategy', 'Our business strategies must adapt quickly.')
    ).toBe(true);

    // Missing lemma
    expect(
      sentenceContainsLemma('accommodate', 'The hotel was very nice and clean.')
    ).toBe(false);
  });

  it('should flag Case A with INVALID_IPA_FORMAT', () => {
    const entry: EnrichedWordEntry = {
      idempotencyKey: 'TSL:benefit:noun',
      word: 'benefit',
      partOfSpeech: 'noun',
      freqRank: 200,
      level: 'T1',
      topicCategory: 'Finance',
      phonetic: 'ˈben.ɪ.fɪt', // Missing slashes
      meaningVi: 'Lợi ích',
      meaningEn: 'An advantage or profit',
      exampleSentence: 'The health plan offers many benefits to employees.',
      exampleTranslation: 'Gói bảo hiểm cung cấp nhiều lợi ích cho nhân viên.',
      collocations: ['mutual benefit', 'fringe benefits'],
      mnemonic: 'Bé né vịt vì lợi ích sức khỏe',
    };

    const result = validateEnrichedWord(entry);
    expect(result.isValid).toBe(false);
    expect(result.status).toBe('FLAGGED');
    expect(result.errors).toContain('INVALID_IPA_FORMAT');
  });

  it('should flag Case B with EXAMPLE_MISSING_HEADWORD', () => {
    const entry: EnrichedWordEntry = {
      idempotencyKey: 'TSL:accommodate:verb',
      word: 'accommodate',
      partOfSpeech: 'verb',
      freqRank: 120,
      level: 'T1',
      topicCategory: 'Hospitality',
      phonetic: '/əˈkɑː.mə.deɪt/',
      meaningVi: 'đáp ứng, cung cấp chỗ ở',
      meaningEn: 'to provide room for',
      exampleSentence: 'The hotel was very nice.', // Does not contain accommodate
      exampleTranslation: 'Khách sạn rất đẹp.',
      collocations: ['accommodate needs', 'accommodate guests'],
      mnemonic: 'Ắc quy đáp ứng nhu cầu',
    };

    const result = validateEnrichedWord(entry);
    expect(result.isValid).toBe(false);
    expect(result.status).toBe('FLAGGED');
    expect(result.errors).toContain('EXAMPLE_MISSING_HEADWORD');
  });

  it('should mark Case C as APPROVED_CANDIDATE when all rules are satisfied', () => {
    const entry: EnrichedWordEntry = {
      idempotencyKey: 'TSL:accommodate:verb',
      word: 'accommodate',
      partOfSpeech: 'verb',
      freqRank: 120,
      level: 'T1',
      topicCategory: 'Hospitality',
      phonetic: '/əˈkɑː.mə.deɪt/',
      meaningVi: 'đáp ứng nhu cầu, cung cấp chỗ ở',
      meaningEn: 'to fit in, or provide lodging for',
      exampleSentence: 'We can easily accommodate special requests.',
      exampleTranslation: 'Chúng tôi có thể dễ dàng đáp ứng các yêu cầu đặc biệt.',
      collocations: ['accommodate needs', 'accommodate guests'],
      mnemonic: 'Ắc quy đáp ứng nhu cầu',
    };

    const result = validateEnrichedWord(entry);
    expect(result.isValid).toBe(true);
    expect(result.status).toBe('APPROVED_CANDIDATE');
    expect(result.errors).toHaveLength(0);
  });

  it('should generate complete validation report with counts', () => {
    const entries: EnrichedWordEntry[] = [
      {
        idempotencyKey: 'TSL:valid:noun',
        word: 'valid',
        partOfSpeech: 'noun',
        freqRank: 10,
        level: 'T1',
        topicCategory: 'Office',
        phonetic: '/ˈvæl.ɪd/',
        meaningVi: 'hợp lệ',
        meaningEn: 'legally or officially acceptable',
        exampleSentence: 'This passport is still valid.',
        exampleTranslation: 'Hộ chiếu này vẫn còn hợp lệ.',
        collocations: ['valid ticket', 'valid reason'],
        mnemonic: 'Va vào đĩa hợp lệ',
      },
      {
        idempotencyKey: 'TSL:invalid:noun',
        word: 'invalid',
        partOfSpeech: 'noun',
        freqRank: 11,
        level: 'T1',
        topicCategory: 'Office',
        phonetic: 'invalid_ipa', // bad
        meaningVi: 'v', // too short (<2 chars)
        meaningEn: 'not valid',
        exampleSentence: 'Unrelated sentence.',
        exampleTranslation: 'Câu không liên quan.',
        collocations: ['one'], // only 1 collocation (< 2)
        mnemonic: 'mẹo',
      },
    ];

    const report = runValidationReport(entries);
    expect(report.totalCount).toBe(2);
    expect(report.approvedCount).toBe(1);
    expect(report.flaggedCount).toBe(1);
    expect(report.flaggedEntries[0].idempotencyKey).toBe('TSL:invalid:noun');
    expect(report.flaggedEntries[0].errors).toContain('INVALID_IPA_FORMAT');
    expect(report.flaggedEntries[0].errors).toContain('MEANING_VI_TOO_SHORT');
    expect(report.flaggedEntries[0].errors).toContain('EXAMPLE_MISSING_HEADWORD');
    expect(report.flaggedEntries[0].errors).toContain('INSUFFICIENT_COLLOCATIONS');
  });
});
