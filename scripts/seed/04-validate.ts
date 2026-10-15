import path from 'node:path';
import { atomicWriteJson, readJsonIfExists } from './lib/file-utils';
import { validateEnrichedWord } from './lib/validation-rules';
import type { EnrichedWordEntry } from './03-enrich';

export interface ValidationReport {
  totalCount: number;
  approvedCount: number;
  flaggedCount: number;
  approvedEntries: EnrichedWordEntry[];
  flaggedEntries: Array<EnrichedWordEntry & { errors: string[] }>;
}

/**
 * Runs validation checks on all enriched words and generates a detailed report.
 */
export function runValidationReport(entries: EnrichedWordEntry[]): ValidationReport {
  const approvedEntries: EnrichedWordEntry[] = [];
  const flaggedEntries: Array<EnrichedWordEntry & { errors: string[] }> = [];

  for (const entry of entries) {
    // If curator has already manually approved it, preserve APPROVED status
    if (entry.status === 'APPROVED') {
      approvedEntries.push(entry);
      continue;
    }

    const result = validateEnrichedWord(entry);
    if (result.isValid) {
      entry.status = 'APPROVED_CANDIDATE';
      entry.validationErrors = [];
      approvedEntries.push(entry);
    } else {
      entry.status = 'FLAGGED';
      entry.validationErrors = result.errors;
      flaggedEntries.push({
        ...entry,
        errors: result.errors,
      });
    }
  }

  return {
    totalCount: entries.length,
    approvedCount: approvedEntries.length,
    flaggedCount: flaggedEntries.length,
    approvedEntries,
    flaggedEntries,
  };
}

export interface Stage4Options {
  checkpointPath?: string;
  reportPath?: string;
}

/**
 * Stage 4 Runner: Validates all entries in 03-enrichment-checkpoint.json and writes 04-validation-report.json
 */
export async function runStage4(options: Stage4Options = {}): Promise<ValidationReport> {
  const checkpointPath =
    options.checkpointPath ||
    path.resolve(__dirname, 'data/stages/03-enrichment-checkpoint.json');
  const reportPath =
    options.reportPath ||
    path.resolve(__dirname, 'data/stages/04-validation-report.json');

  const entries = (await readJsonIfExists<EnrichedWordEntry[]>(checkpointPath)) || [];
  if (entries.length === 0) {
    console.warn(`[Stage 4] No entries found at ${checkpointPath}`);
    return {
      totalCount: 0,
      approvedCount: 0,
      flaggedCount: 0,
      approvedEntries: [],
      flaggedEntries: [],
    };
  }

  const report = runValidationReport(entries);

  // Update checkpoint with new status tags
  await atomicWriteJson(checkpointPath, entries);
  // Write validation report
  await atomicWriteJson(reportPath, report);

  console.log(
    `[Stage 4] Validation complete. Total: ${report.totalCount}, Approved: ${report.approvedCount}, Flagged: ${report.flaggedCount}`
  );

  return report;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  runStage4().catch((err) => {
    console.error('[Stage 4] Execution failed:', err);
    process.exit(1);
  });
}
