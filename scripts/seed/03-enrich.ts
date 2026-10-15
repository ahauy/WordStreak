import path from 'node:path';
import { atomicWriteJson, readJsonIfExists } from './lib/file-utils';
import {
  callGeminiBatchWithRetry,
  type GeminiBatchItemResult,
} from './lib/gemini-batch-client';
import type { NormalizedWordEntry } from './02-normalize';

export interface EnrichedWordEntry extends NormalizedWordEntry {
  phonetic: string;
  meaningVi: string;
  meaningEn: string;
  exampleSentence: string;
  exampleTranslation: string;
  collocations: string[];
  mnemonic: string;
  audioUrl?: string | null;
  status?: 'PENDING' | 'APPROVED' | 'APPROVED_CANDIDATE' | 'FLAGGED' | 'REJECTED';
  validationErrors?: string[];
  curatorNotes?: string;
}

export interface EnrichmentOptions {
  checkpointPath?: string;
  enrichBatchFn?: (batch: NormalizedWordEntry[]) => Promise<GeminiBatchItemResult[]>;
  batchSize?: number;
}

/**
 * Runs progressive enrichment using disk checkpoints.
 * If checkpoint already contains words, skips them and only enriches remaining words.
 * Saves checkpoint atomically after each batch.
 */
export async function runEnrichmentWithCheckpoint(
  allEntries: NormalizedWordEntry[],
  options: EnrichmentOptions = {}
): Promise<EnrichedWordEntry[]> {
  const checkpointPath =
    options.checkpointPath ||
    path.resolve(__dirname, 'data/stages/03-enrichment-checkpoint.json');
  const batchSize = options.batchSize || 10;
  const enrichBatch =
    options.enrichBatchFn || ((batch) => callGeminiBatchWithRetry(batch));

  const existingCheckpoint =
    (await readJsonIfExists<EnrichedWordEntry[]>(checkpointPath)) || [];

  const existingKeySet = new Set(existingCheckpoint.map((e) => e.idempotencyKey));
  const pendingEntries = allEntries.filter((e) => !existingKeySet.has(e.idempotencyKey));

  console.log(
    `[Stage 3] Total: ${allEntries.length}, Cached/Done: ${existingCheckpoint.length}, Pending: ${pendingEntries.length}`
  );

  const enrichedList: EnrichedWordEntry[] = [...existingCheckpoint];

  for (let i = 0; i < pendingEntries.length; i += batchSize) {
    const chunk = pendingEntries.slice(i, i + batchSize);
    console.log(
      `[Stage 3] Enriching batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(
        pendingEntries.length / batchSize
      )} (${chunk.length} words)...`
    );

    const batchResults = await enrichBatch(chunk);

    for (const chunkItem of chunk) {
      const match = batchResults.find(
        (r) => r.word.toLowerCase() === chunkItem.word.toLowerCase()
      );

      const enriched: EnrichedWordEntry = {
        ...chunkItem,
        phonetic: match?.phonetic || '',
        meaningVi: match?.meaningVi || '',
        meaningEn: match?.meaningEn || '',
        exampleSentence: match?.exampleSentence || '',
        exampleTranslation: match?.exampleTranslation || '',
        collocations: match?.collocations || [],
        mnemonic: match?.mnemonic || '',
        audioUrl: match?.audioUrl || null,
        status: 'PENDING',
      };

      enrichedList.push(enriched);
    }

    // Save checkpoint atomically after each batch
    await atomicWriteJson(checkpointPath, enrichedList);
  }

  return enrichedList;
}

export interface Stage3Options {
  inputPath?: string;
  checkpointPath?: string;
}

/**
 * Stage 3 Runner: Reads 02-normalized.json and enriches using Gemini batching
 */
export async function runStage3(options: Stage3Options = {}): Promise<EnrichedWordEntry[]> {
  const inputPath =
    options.inputPath || path.resolve(__dirname, 'data/stages/02-normalized.json');
  const checkpointPath =
    options.checkpointPath ||
    path.resolve(__dirname, 'data/stages/03-enrichment-checkpoint.json');

  const normalized = (await readJsonIfExists<NormalizedWordEntry[]>(inputPath)) || [];
  if (normalized.length === 0) {
    console.warn(`[Stage 3] No normalized entries found at ${inputPath}`);
    return [];
  }

  return runEnrichmentWithCheckpoint(normalized, { checkpointPath });
}

if (import.meta.url === `file://${process.argv[1]}`) {
  runStage3().catch((err) => {
    console.error('[Stage 3] Execution failed:', err);
    process.exit(1);
  });
}
