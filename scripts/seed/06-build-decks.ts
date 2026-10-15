import path from 'node:path';
import { atomicWriteJson, readJsonIfExists } from './lib/file-utils';
import type { EnrichedWordEntry } from './03-enrich';

export interface BuiltCard {
  word: string;
  partOfSpeech: string;
  phonetic: string;
  meaningVi: string;
  meaningEn: string;
  exampleSentence: string;
  exampleTranslation: string;
  collocations: string[];
  mnemonic: string;
  audioUrl?: string | null;
}

export interface BuiltDeck {
  slug: string;
  titleEn: string;
  titleVi: string;
  topicCategory: string;
  level: 'T1' | 'T2' | 'T3';
  listCode: string;
  cards: BuiltCard[];
}

export interface BuildDeckOptions {
  deckSize?: number;
  minDeckSize?: number;
}

const TOPIC_VI_MAP: Record<string, string> = {
  'Finance & Accounting': 'Tài chính & Kế toán',
  'Sales & Marketing': 'Bán hàng & Tiếp thị',
  'HR & Recruitment': 'Nhân sự & Tuyển dụng',
  'Office & Administration': 'Giao tiếp Văn phòng',
  'Office Communication': 'Giao tiếp Văn phòng',
  'Management & Strategy': 'Quản trị & Chiến lược',
  'Legal & Compliance': 'Pháp lý & Tuân thủ',
  'Technology & Systems': 'Công nghệ & Hệ thống',
  'Technology': 'Công nghệ & Hệ thống',
  'Logistics & Operations': 'Hậu cần & Vận hành',
  'Travel & Hospitality': 'Du lịch & Khách sạn',
  'Customer Service': 'Dịch vụ Khách hàng',
};

function kebabCase(str: string): string {
  return str
    .toLowerCase()
    .replace(/&/g, ' ')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

/**
 * Generates an SEO-compliant slug: `${listCode.toLowerCase()}-${level.toLowerCase()}-${kebabCase(topic)}-${pad2(deckIndex)}`
 */
export function generateDeckSlug(
  listCode: string,
  level: string,
  topic: string,
  deckIndex: number
): string {
  const padIndex = String(deckIndex).padStart(2, '0');
  return `${listCode.toLowerCase()}-${level.toLowerCase()}-${kebabCase(topic)}-${padIndex}`;
}

/**
 * Builds cohesive 25-word decks partitioned by topic category and tier level.
 */
export function buildDecks(
  entries: EnrichedWordEntry[],
  options: BuildDeckOptions = {}
): BuiltDeck[] {
  const deckSize = options.deckSize ?? 25;
  const minDeckSize = options.minDeckSize ?? 15;

  // Filter out rejected or flagged entries if status is defined
  const eligibleEntries = entries.filter(
    (e) => !e.status || e.status === 'APPROVED' || e.status === 'APPROVED_CANDIDATE'
  );

  // Group by composite key: listCode::level::topicCategory
  const groups = new Map<string, EnrichedWordEntry[]>();
  for (const entry of eligibleEntries) {
    const listCode = entry.idempotencyKey.split(':')[0] || 'TSL';
    const groupKey = `${listCode}::${entry.level}::${entry.topicCategory}`;
    if (!groups.has(groupKey)) {
      groups.set(groupKey, []);
    }
    groups.get(groupKey)!.push(entry);
  }

  const decks: BuiltDeck[] = [];

  for (const [groupKey, groupEntries] of groups.entries()) {
    const [listCode, levelStr, topicCategory] = groupKey.split('::');
    const level = levelStr as 'T1' | 'T2' | 'T3';

    // Sort words by frequency rank
    groupEntries.sort((a, b) => a.freqRank - b.freqRank);

    let deckIndex = 1;
    let i = 0;

    while (i < groupEntries.length) {
      const remaining = groupEntries.length - i;

      // Handle remainder (EC-LIB-005)
      if (remaining < deckSize) {
        if (remaining >= minDeckSize || decks.length === 0) {
          // Allowed as final deck
          const chunk = groupEntries.slice(i);
          decks.push(createDeckObject(listCode, level, topicCategory, deckIndex, chunk));
        } else {
          // Merge into the previous deck in this group if any
          const prevDeck = decks[decks.length - 1];
          if (prevDeck && prevDeck.topicCategory === topicCategory && prevDeck.level === level) {
            const extraCards = groupEntries.slice(i).map(toBuiltCard);
            prevDeck.cards.push(...extraCards);
          } else {
            const chunk = groupEntries.slice(i);
            decks.push(createDeckObject(listCode, level, topicCategory, deckIndex, chunk));
          }
        }
        break;
      } else {
        const chunk = groupEntries.slice(i, i + deckSize);
        decks.push(createDeckObject(listCode, level, topicCategory, deckIndex, chunk));
        deckIndex++;
        i += deckSize;
      }
    }
  }

  return decks;
}

function toBuiltCard(entry: EnrichedWordEntry): BuiltCard {
  return {
    word: entry.word,
    partOfSpeech: entry.partOfSpeech,
    phonetic: entry.phonetic,
    meaningVi: entry.meaningVi,
    meaningEn: entry.meaningEn,
    exampleSentence: entry.exampleSentence,
    exampleTranslation: entry.exampleTranslation,
    collocations: entry.collocations,
    mnemonic: entry.mnemonic,
    audioUrl: entry.audioUrl || null,
  };
}

function createDeckObject(
  listCode: string,
  level: 'T1' | 'T2' | 'T3',
  topicCategory: string,
  deckIndex: number,
  entries: EnrichedWordEntry[]
): BuiltDeck {
  const slug = generateDeckSlug(listCode, level, topicCategory, deckIndex);
  const titleViPrefix = TOPIC_VI_MAP[topicCategory] || topicCategory;

  return {
    slug,
    titleEn: `${topicCategory} - Part ${deckIndex}`,
    titleVi: `${titleViPrefix} - Phần ${deckIndex}`,
    topicCategory,
    level,
    listCode,
    cards: entries.map(toBuiltCard),
  };
}

export interface Stage6Options {
  inputPath?: string;
  outputPath?: string;
}

/**
 * Stage 6 Runner: Builds decks of 25 cards with SEO slugs to 06-built-decks.json
 */
export async function runStage6(options: Stage6Options = {}): Promise<BuiltDeck[]> {
  const reviewedPath = path.resolve(__dirname, 'data/stages/05-reviewed-checkpoint.json');
  const checkpointPath = path.resolve(__dirname, 'data/stages/03-enrichment-checkpoint.json');
  const inputPath =
    options.inputPath ||
    ((await readJsonIfExists(reviewedPath)) ? reviewedPath : checkpointPath);
  const outputPath =
    options.outputPath || path.resolve(__dirname, 'data/stages/06-built-decks.json');

  const entries = (await readJsonIfExists<EnrichedWordEntry[]>(inputPath)) || [];
  if (entries.length === 0) {
    console.warn(`[Stage 6] No entries found at ${inputPath}`);
    return [];
  }

  const decks = buildDecks(entries);
  await atomicWriteJson(outputPath, decks);
  console.log(`[Stage 6] Built ${decks.length} decks -> ${outputPath}`);

  return decks;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  runStage6().catch((err) => {
    console.error('[Stage 6] Execution failed:', err);
    process.exit(1);
  });
}
