import fs from 'node:fs/promises';
import path from 'node:path';
import { atomicWriteJson, parseCsvLine } from './lib/file-utils';

export interface RawWordEntry {
  headword: string;
  pos: string;
  freqRank: number;
  freqValue: number;
  listCode: 'TSL' | 'NGSL';
}

/**
 * Parses raw CSV content with flexible header detection (e.g. freq_rank vs freqRank).
 */
export function parseRawCsv(csvContent: string, listCode: 'TSL' | 'NGSL'): RawWordEntry[] {
  const lines = csvContent
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  if (lines.length === 0) return [];

  const headerLine = lines[0];
  const headers = parseCsvLine(headerLine).map((h) => h.toLowerCase());

  const headwordIdx = headers.findIndex((h) => h === 'headword' || h === 'word');
  const posIdx = headers.findIndex((h) => h === 'pos' || h === 'partofspeech');
  const rankIdx = headers.findIndex((h) => h === 'freq_rank' || h === 'freqrank' || h === 'rank');
  const valueIdx = headers.findIndex((h) => h === 'freq_value' || h === 'freqvalue' || h === 'frequency');

  const entries: RawWordEntry[] = [];

  for (let i = 1; i < lines.length; i++) {
    const cols = parseCsvLine(lines[i]);
    if (cols.length < headers.length) continue;

    const headword = cols[headwordIdx >= 0 ? headwordIdx : 0];
    const pos = cols[posIdx >= 0 ? posIdx : 1];
    const freqRank = Number.parseInt(cols[rankIdx >= 0 ? rankIdx : 2], 10) || i;
    const freqValue = Number.parseFloat(cols[valueIdx >= 0 ? valueIdx : 3]) || 0;

    if (headword) {
      entries.push({
        headword,
        pos,
        freqRank,
        freqValue,
        listCode,
      });
    }
  }

  return entries;
}

export interface Stage1Options {
  rawDir?: string;
  outputDir?: string;
}

/**
 * Stage 1 Runner: Ingests raw TSL and NGSL CSV datasets and outputs 01-raw-entries.json
 */
export async function runStage1(options: Stage1Options = {}): Promise<RawWordEntry[]> {
  const rawDir = options.rawDir || path.resolve(__dirname, 'data/raw');
  const outputDir = options.outputDir || path.resolve(__dirname, 'data/stages');

  const tslPath = path.join(rawDir, 'tsl-1.2.csv');
  const ngslPath = path.join(rawDir, 'ngsl-1.2.csv');

  const results: RawWordEntry[] = [];

  try {
    const tslContent = await fs.readFile(tslPath, 'utf-8');
    results.push(...parseRawCsv(tslContent, 'TSL'));
  } catch (err: any) {
    console.warn(`[Stage 1] Could not read ${tslPath}: ${err.message}`);
  }

  try {
    const ngslContent = await fs.readFile(ngslPath, 'utf-8');
    results.push(...parseRawCsv(ngslContent, 'NGSL'));
  } catch (err: any) {
    console.warn(`[Stage 1] Could not read ${ngslPath}: ${err.message}`);
  }

  const outputPath = path.join(outputDir, '01-raw-entries.json');
  await atomicWriteJson(outputPath, results);
  console.log(`[Stage 1] Ingested ${results.length} raw entries -> ${outputPath}`);

  return results;
}

// Allow direct execution
if (import.meta.url === `file://${process.argv[1]}`) {
  runStage1().catch((err) => {
    console.error('[Stage 1] Execution failed:', err);
    process.exit(1);
  });
}
