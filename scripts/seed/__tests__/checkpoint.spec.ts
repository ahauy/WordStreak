import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { atomicWriteJson, readJsonIfExists } from '../lib/file-utils';
import { runEnrichmentWithCheckpoint } from '../03-enrich';
import type { NormalizedWordEntry } from '../02-normalize';
import type { EnrichedWordEntry } from '../03-enrich';

describe('TC-LIB-006: Progressive Checkpoint Persistence', () => {
  let tempDir: string;
  let checkpointPath: string;

  beforeEach(async () => {
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'checkpoint-test-'));
    checkpointPath = path.join(tempDir, '03-enrichment-checkpoint.json');
  });

  afterEach(async () => {
    await fs.rm(tempDir, { recursive: true, force: true });
  });

  it('should write JSON atomically without corrupting file', async () => {
    const data = { test: 'atomic', count: 42 };
    await atomicWriteJson(checkpointPath, data);

    const readBack = await readJsonIfExists<typeof data>(checkpointPath);
    expect(readBack).toEqual(data);
  });

  it('should resume from existing 20-word checkpoint and only enrich the remaining 10 words', async () => {
    // 1. Prepare initial 20 enriched entries
    const initialEnriched: EnrichedWordEntry[] = Array.from({ length: 20 }, (_, i) => ({
      idempotencyKey: `TSL:word${i}:noun`,
      word: `word${i}`,
      partOfSpeech: 'noun',
      freqRank: i + 1,
      level: 'T1',
      topicCategory: 'Office & Administration',
      phonetic: `/${i}/`,
      meaningVi: `Nghĩa ${i}`,
      meaningEn: `Meaning ${i}`,
      exampleSentence: `Sentence for word${i}`,
      exampleTranslation: `Bản dịch cho word${i}`,
      collocations: [`word${i} a`, `word${i} b`],
      mnemonic: `Mẹo ${i}`,
    }));

    await atomicWriteJson(checkpointPath, initialEnriched);

    // 2. Prepare 30 total normalized entries (20 existing + 10 new)
    const allNormalized: NormalizedWordEntry[] = Array.from({ length: 30 }, (_, i) => ({
      idempotencyKey: `TSL:word${i}:noun`,
      word: `word${i}`,
      partOfSpeech: 'noun',
      freqRank: i + 1,
      level: 'T1',
      topicCategory: 'Office & Administration',
    }));

    // 3. Mock batch enrichment function
    const mockBatchEnricher = vi.fn(async (batch: NormalizedWordEntry[]) => {
      return batch.map((item) => ({
        ...item,
        phonetic: `/${item.word}/`,
        meaningVi: `Nghĩa mới ${item.word}`,
        meaningEn: `Meaning new ${item.word}`,
        exampleSentence: `New sentence with ${item.word}`,
        exampleTranslation: `Dịch câu ${item.word}`,
        collocations: [`${item.word} x`, `${item.word} y`],
        mnemonic: `Mẹo ${item.word}`,
      }));
    });

    // 4. Run enrichment with checkpoint
    const finalEntries = await runEnrichmentWithCheckpoint(allNormalized, {
      checkpointPath,
      enrichBatchFn: mockBatchEnricher,
      batchSize: 10,
    });

    // 5. Verify assertions
    expect(mockBatchEnricher).toHaveBeenCalledTimes(1); // Only 1 batch of 10 remaining words
    expect(finalEntries).toHaveLength(30);

    const savedCheckpoint = await readJsonIfExists<EnrichedWordEntry[]>(checkpointPath);
    expect(savedCheckpoint).toHaveLength(30);
    expect(savedCheckpoint?.[0].word).toBe('word0');
    expect(savedCheckpoint?.[29].word).toBe('word29');
  });
});
