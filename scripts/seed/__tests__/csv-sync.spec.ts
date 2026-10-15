import { describe, it, expect } from 'vitest';
import { exportReviewCsv } from '../05-review-export';
import { importReviewCsv } from '../05-review-import';
import type { EnrichedWordEntry } from '../03-enrich';

describe('TC-LIB-008: Two-Way CSV Export/Import Sync', () => {
  it('should export FLAGGED words to standard CSV format with required headers', () => {
    const flaggedEntries: EnrichedWordEntry[] = [
      {
        idempotencyKey: 'TSL:beneficial:adjective',
        word: 'beneficial',
        partOfSpeech: 'adjective',
        freqRank: 350,
        level: 'T1',
        topicCategory: 'Finance',
        phonetic: 'ˌben.ɪˈfɪʃ.əl', // Missing slash
        meaningVi: 'có lợi',
        meaningEn: 'resulting in good',
        exampleSentence: 'Regular exercise is beneficial to health.',
        exampleTranslation: 'Tập thể dục thường xuyên có lợi cho sức khỏe.',
        collocations: ['beneficial effect', 'mutually beneficial'],
        mnemonic: 'Bé né phi thuyền có lợi',
        status: 'FLAGGED',
        validationErrors: ['INVALID_IPA_FORMAT'],
      },
    ];

    const csvOutput = exportReviewCsv(flaggedEntries);
    const lines = csvOutput.trim().split('\n');

    expect(lines[0]).toBe(
      'idempotencyKey,word,partOfSpeech,phonetic,meaningVi,exampleSentence,status,curatorNotes'
    );
    expect(lines[1]).toContain('TSL:beneficial:adjective');
    expect(lines[1]).toContain('FLAGGED');
  });

  it('should import edited CSV, update checkpoint entry to APPROVED, and merge changes', () => {
    const existingCheckpoint: EnrichedWordEntry[] = [
      {
        idempotencyKey: 'TSL:beneficial:adjective',
        word: 'beneficial',
        partOfSpeech: 'adjective',
        freqRank: 350,
        level: 'T1',
        topicCategory: 'Finance',
        phonetic: 'ˌben.ɪˈfɪʃ.əl',
        meaningVi: 'có lợi',
        meaningEn: 'resulting in good',
        exampleSentence: 'Regular exercise is beneficial to health.',
        exampleTranslation: 'Tập thể dục thường xuyên có lợi cho sức khỏe.',
        collocations: ['beneficial effect', 'mutually beneficial'],
        mnemonic: 'Bé né phi thuyền có lợi',
        status: 'FLAGGED',
      },
      {
        idempotencyKey: 'TSL:invoice:noun',
        word: 'invoice',
        partOfSpeech: 'noun',
        freqRank: 420,
        level: 'T2',
        topicCategory: 'Accounting',
        phonetic: '/ˈɪn.vɔɪs/',
        meaningVi: 'hóa đơn',
        meaningEn: 'a list of goods sent or services provided, with a statement of the sum due',
        exampleSentence: 'Please send the invoice to accounting.',
        exampleTranslation: 'Vui lòng gửi hóa đơn cho phòng kế toán.',
        collocations: ['issue invoice', 'unpaid invoice'],
        mnemonic: 'In voi lên hóa đơn',
        status: 'APPROVED_CANDIDATE',
      },
    ];

    // Curator edited the CSV: fixed phonetic and marked APPROVED
    const editedCsv = `idempotencyKey,word,partOfSpeech,phonetic,meaningVi,exampleSentence,status,curatorNotes
TSL:beneficial:adjective,beneficial,adjective,/ˌben.ɪˈfɪʃ.əl/,có lợi ích to lớn,Regular exercise is beneficial to health.,APPROVED,Fixed IPA and polished meaning
`;

    const updatedCheckpoint = importReviewCsv(editedCsv, existingCheckpoint);

    expect(updatedCheckpoint).toHaveLength(2);

    const updatedBeneficial = updatedCheckpoint.find(
      (e) => e.idempotencyKey === 'TSL:beneficial:adjective'
    );
    expect(updatedBeneficial).toBeDefined();
    expect(updatedBeneficial?.phonetic).toBe('/ˌben.ɪˈfɪʃ.əl/');
    expect(updatedBeneficial?.meaningVi).toBe('có lợi ích to lớn');
    expect(updatedBeneficial?.status).toBe('APPROVED');
    expect(updatedBeneficial?.curatorNotes).toBe('Fixed IPA and polished meaning');

    // Unmodified entry remains unchanged
    const invoice = updatedCheckpoint.find((e) => e.idempotencyKey === 'TSL:invoice:noun');
    expect(invoice?.status).toBe('APPROVED_CANDIDATE');
  });
});
