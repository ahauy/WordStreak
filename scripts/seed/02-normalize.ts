import path from 'node:path';
import { atomicWriteJson, readJsonIfExists } from './lib/file-utils';
import { canonicalizePOS, type CanonicalPOS } from './lib/validation-rules';
import type { RawWordEntry } from './01-import';

export { canonicalizePOS, type CanonicalPOS };

export interface NormalizedWordEntry {
  idempotencyKey: string;
  word: string;
  partOfSpeech: CanonicalPOS;
  freqRank: number;
  level: 'T1' | 'T2' | 'T3';
  topicCategory: string;
  crossListRef?: string;
}

// 10 TOEIC standard business categories mapped to keywords
const CATEGORY_MAP: Record<string, string[]> = {
  'Finance & Accounting': ['deficit', 'invoice', 'shareholder', 'revenue', 'quarterly', 'accounting', 'budget', 'tax'],
  'Sales & Marketing': ['market', 'competitor', 'campaign', 'promotion', 'customer', 'client', 'branding'],
  'HR & Recruitment': ['compensation', 'reimbursement', 'recruitment', 'person', 'staff', 'employee', 'hire'],
  'Office & Administration': ['agenda', 'accommodate', 'beneficial', 'deadline', 'workplace', 'collaboration', 'schedule'],
  'Management & Strategy': ['strategy', 'restructure', 'synergy', 'merger', 'monopoly', 'feasibility', 'diversification'],
  'Legal & Compliance': ['compliance', 'contract', 'agreement', 'regulation', 'clause', 'liability'],
  'Technology & Systems': ['system', 'software', 'network', 'data', 'digital', 'device', 'security', 'retry'],
  'Logistics & Operations': ['procurement', 'inventory', 'warehouse', 'shipping', 'delivery', 'transport'],
  'Travel & Hospitality': ['hotel', 'flight', 'ticket', 'tourism', 'hospitality', 'reservation'],
  'Customer Service': ['service', 'feedback', 'satisfaction', 'complaint', 'support', 'assistance'],
};

function assignTopicCategory(word: string): string {
  const lower = word.toLowerCase();
  for (const [category, keywords] of Object.entries(CATEGORY_MAP)) {
    if (keywords.some((kw) => lower.includes(kw) || kw.includes(lower))) {
      return category;
    }
  }
  return 'Office & Administration';
}

/**
 * Normalizes raw word entries, applies POS canonical mapping, tier stratification,
 * and handles cross-list deduplication (TSL vs NGSL).
 */
export function normalizeEntries(rawEntries: RawWordEntry[]): NormalizedWordEntry[] {
  const tslMap = new Map<string, NormalizedWordEntry>();
  const ngslMap = new Map<string, NormalizedWordEntry>();

  for (const raw of rawEntries) {
    const cleanWord = raw.headword.toLowerCase().trim();
    const canonicalPos = canonicalizePOS(raw.pos);
    const key = `${raw.listCode}:${cleanWord}:${canonicalPos}`;

    let level: 'T1' | 'T2' | 'T3';
    if (raw.freqRank <= 400) {
      level = 'T1';
    } else if (raw.freqRank <= 800) {
      level = 'T2';
    } else {
      level = 'T3';
    }

    const normalized: NormalizedWordEntry = {
      idempotencyKey: key,
      word: cleanWord,
      partOfSpeech: canonicalPos,
      freqRank: raw.freqRank,
      level,
      topicCategory: assignTopicCategory(cleanWord),
    };

    if (raw.listCode === 'TSL') {
      tslMap.set(cleanWord, normalized);
    } else {
      ngslMap.set(cleanWord, normalized);
    }
  }

  // Cross-list deduplication: Prioritize TSL, mark crossListRef = 'NGSL' if found in NGSL
  const merged: NormalizedWordEntry[] = [];

  for (const [word, tslEntry] of tslMap.entries()) {
    if (ngslMap.has(word)) {
      tslEntry.crossListRef = 'NGSL';
      ngslMap.delete(word); // Remove from NGSL so it's not added twice
    }
    merged.push(tslEntry);
  }

  // Add remaining NGSL entries
  for (const ngslEntry of ngslMap.values()) {
    merged.push(ngslEntry);
  }

  return merged;
}

export interface Stage2Options {
  inputPath?: string;
  outputPath?: string;
}

/**
 * Stage 2 Runner: Normalizes raw entries to 02-normalized.json
 */
export async function runStage2(options: Stage2Options = {}): Promise<NormalizedWordEntry[]> {
  const inputPath =
    options.inputPath || path.resolve(__dirname, 'data/stages/01-raw-entries.json');
  const outputPath =
    options.outputPath || path.resolve(__dirname, 'data/stages/02-normalized.json');

  const rawEntries = (await readJsonIfExists<RawWordEntry[]>(inputPath)) || [];
  if (rawEntries.length === 0) {
    console.warn(`[Stage 2] No raw entries found at ${inputPath}`);
    return [];
  }

  const normalized = normalizeEntries(rawEntries);
  await atomicWriteJson(outputPath, normalized);
  console.log(`[Stage 2] Normalized ${normalized.length} entries -> ${outputPath}`);

  return normalized;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  runStage2().catch((err) => {
    console.error('[Stage 2] Execution failed:', err);
    process.exit(1);
  });
}
