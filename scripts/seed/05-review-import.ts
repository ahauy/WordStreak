import fs from 'node:fs/promises';
import path from 'node:path';
import { atomicWriteJson, readJsonIfExists, parseCsvLine } from './lib/file-utils';
import type { EnrichedWordEntry } from './03-enrich';

/**
 * Parses reviewed CSV and merges curator edits into existing checkpoint.
 */
export function importReviewCsv(
  csvContent: string,
  existingCheckpoint: EnrichedWordEntry[]
): EnrichedWordEntry[] {
  const lines = csvContent
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  if (lines.length <= 1) return [...existingCheckpoint];

  const headerCols = parseCsvLine(lines[0]).map((h) => h.toLowerCase());
  const keyIdx = headerCols.indexOf('idempotencykey');
  const wordIdx = headerCols.indexOf('word');
  const phoneticIdx = headerCols.indexOf('phonetic');
  const meaningViIdx = headerCols.indexOf('meaningvi');
  const exampleIdx = headerCols.indexOf('examplesentence');
  const statusIdx = headerCols.indexOf('status');
  const notesIdx = headerCols.indexOf('curatornotes');

  const updateMap = new Map<
    string,
    {
      phonetic?: string;
      meaningVi?: string;
      exampleSentence?: string;
      status?: EnrichedWordEntry['status'];
      curatorNotes?: string;
    }
  >();

  for (let i = 1; i < lines.length; i++) {
    const cols = parseCsvLine(lines[i]);
    const key = cols[keyIdx];
    if (!key) continue;

    updateMap.set(key, {
      phonetic: phoneticIdx >= 0 ? cols[phoneticIdx] : undefined,
      meaningVi: meaningViIdx >= 0 ? cols[meaningViIdx] : undefined,
      exampleSentence: exampleIdx >= 0 ? cols[exampleIdx] : undefined,
      status: (statusIdx >= 0 ? cols[statusIdx] : undefined) as EnrichedWordEntry['status'],
      curatorNotes: notesIdx >= 0 ? cols[notesIdx] : undefined,
    });
  }

  return existingCheckpoint.map((entry) => {
    const update = updateMap.get(entry.idempotencyKey);
    if (!update) return entry;

    const newStatus = update.status || entry.status;
    const isApproved = newStatus === 'APPROVED' || newStatus === 'APPROVED_CANDIDATE';

    return {
      ...entry,
      phonetic: update.phonetic !== undefined && update.phonetic !== '' ? update.phonetic : entry.phonetic,
      meaningVi: update.meaningVi !== undefined && update.meaningVi !== '' ? update.meaningVi : entry.meaningVi,
      exampleSentence:
        update.exampleSentence !== undefined && update.exampleSentence !== ''
          ? update.exampleSentence
          : entry.exampleSentence,
      status: newStatus,
      curatorNotes: update.curatorNotes !== undefined ? update.curatorNotes : entry.curatorNotes,
      validationErrors: isApproved ? [] : entry.validationErrors,
    };
  });
}

export interface Stage5ImportOptions {
  csvInputPath?: string;
  checkpointPath?: string;
  reviewedCheckpointPath?: string;
}

/**
 * Stage 5 Import Runner: Reads reviewed CSV and updates checkpoint
 */
export async function runReviewImport(
  options: Stage5ImportOptions = {}
): Promise<EnrichedWordEntry[]> {
  const csvInputPath =
    options.csvInputPath ||
    path.resolve(__dirname, 'data/stages/tsl-review-pending.csv');
  const checkpointPath =
    options.checkpointPath ||
    path.resolve(__dirname, 'data/stages/03-enrichment-checkpoint.json');
  const reviewedCheckpointPath =
    options.reviewedCheckpointPath ||
    path.resolve(__dirname, 'data/stages/05-reviewed-checkpoint.json');

  const existingCheckpoint =
    (await readJsonIfExists<EnrichedWordEntry[]>(checkpointPath)) || [];

  let csvContent = '';
  try {
    csvContent = await fs.readFile(csvInputPath, 'utf-8');
  } catch (err: any) {
    console.warn(`[Stage 5 Import] No review CSV file at ${csvInputPath}`);
    return existingCheckpoint;
  }

  const updatedCheckpoint = importReviewCsv(csvContent, existingCheckpoint);

  await atomicWriteJson(checkpointPath, updatedCheckpoint);
  await atomicWriteJson(reviewedCheckpointPath, updatedCheckpoint);

  console.log(
    `[Stage 5 Import] Synced curator edits for ${updatedCheckpoint.length} entries -> ${reviewedCheckpointPath}`
  );

  return updatedCheckpoint;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  runReviewImport().catch((err) => {
    console.error('[Stage 5 Import] Execution failed:', err);
    process.exit(1);
  });
}
