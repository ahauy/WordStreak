import path from 'node:path';
import { atomicWriteFile, readJsonIfExists } from './lib/file-utils';
import type { EnrichedWordEntry } from './03-enrich';

function escapeCsvField(val: string | null | undefined): string {
  if (val === null || val === undefined) return '';
  const str = String(val);
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/**
 * Serializes flagged entries to CSV format for human curator review.
 */
export function exportReviewCsv(entries: EnrichedWordEntry[]): string {
  const headers = [
    'idempotencyKey',
    'word',
    'partOfSpeech',
    'phonetic',
    'meaningVi',
    'exampleSentence',
    'status',
    'curatorNotes',
  ];

  const rows = entries.map((e) =>
    [
      escapeCsvField(e.idempotencyKey),
      escapeCsvField(e.word),
      escapeCsvField(e.partOfSpeech),
      escapeCsvField(e.phonetic),
      escapeCsvField(e.meaningVi),
      escapeCsvField(e.exampleSentence),
      escapeCsvField(e.status || 'FLAGGED'),
      escapeCsvField(e.curatorNotes || ''),
    ].join(',')
  );

  return [headers.join(','), ...rows].join('\n');
}

export interface Stage5ExportOptions {
  checkpointPath?: string;
  csvOutputPath?: string;
}

/**
 * Stage 5 Export Runner: Extracts FLAGGED words and outputs tsl-review-pending.csv
 */
export async function runReviewExport(options: Stage5ExportOptions = {}): Promise<string> {
  const checkpointPath =
    options.checkpointPath ||
    path.resolve(__dirname, 'data/stages/03-enrichment-checkpoint.json');
  const csvOutputPath =
    options.csvOutputPath ||
    path.resolve(__dirname, 'data/stages/tsl-review-pending.csv');

  const entries = (await readJsonIfExists<EnrichedWordEntry[]>(checkpointPath)) || [];
  const flagged = entries.filter((e) => e.status === 'FLAGGED');

  const csvContent = exportReviewCsv(flagged);
  await atomicWriteFile(csvOutputPath, csvContent);

  console.log(`[Stage 5 Export] Exported ${flagged.length} FLAGGED words -> ${csvOutputPath}`);
  return csvContent;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  runReviewExport().catch((err) => {
    console.error('[Stage 5 Export] Execution failed:', err);
    process.exit(1);
  });
}
