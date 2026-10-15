import path from 'node:path';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import { atomicWriteJson, readJsonIfExists } from './lib/file-utils';
import type { BuiltDeck, BuiltCard } from './06-build-decks';

export interface PublishOptions {
  prismaClient?: PrismaClient | any;
  outputArtifactPath?: string;
}

export interface PublishResult {
  upsertedCount: number;
  skippedCount: number;
  totalCards: number;
  totalDecks: number;
  artifactPath: string;
}

export interface StarterLibraryArtifact {
  version: string;
  generatedAt: string;
  totalDecks: number;
  totalCards: number;
  decks: BuiltDeck[];
}

/**
 * Publishes built decks to PostgreSQL GlobalDictionaryCache and exports starter-library-decks.json artifact.
 */
export async function publishToDatabaseAndArtifact(
  decks: BuiltDeck[],
  options: PublishOptions = {}
): Promise<PublishResult> {
  const artifactPath =
    options.outputArtifactPath ||
    path.resolve(__dirname, 'data/output/starter-library-decks.json');

  let upsertedCount = 0;
  let skippedCount = 0;
  let totalCards = 0;

  const prisma = options.prismaClient;

  // Flatten unique cards across all decks
  const uniqueCards = new Map<string, BuiltCard>();
  for (const deck of decks) {
    for (const card of deck.cards) {
      totalCards++;
      if (!uniqueCards.has(card.word.toLowerCase())) {
        uniqueCards.set(card.word.toLowerCase(), card);
      }
    }
  }

  if (prisma?.globalDictionaryCache) {
    for (const [_, card] of uniqueCards.entries()) {
      // BR-LIB-008: Check if existing record is MANUAL_CURATED before overwriting
      const existing = await prisma.globalDictionaryCache.findUnique({
        where: { word: card.word },
      });

      if (existing?.source === 'MANUAL_CURATED') {
        skippedCount++;
        continue;
      }

      const collocationsJson = Array.isArray(card.collocations)
        ? JSON.stringify(card.collocations)
        : null;

      await prisma.globalDictionaryCache.upsert({
        where: { word: card.word },
        update: {
          partOfSpeech: card.partOfSpeech,
          phonetic: card.phonetic,
          meaningVi: card.meaningVi,
          meaningEn: card.meaningEn,
          exampleSentence: card.exampleSentence,
          exampleTranslation: card.exampleTranslation,
          collocations: collocationsJson,
          mnemonic: card.mnemonic,
          audioUrl: card.audioUrl,
          source: 'TSL_OFFICIAL',
          updatedAt: new Date(),
        },
        create: {
          word: card.word,
          partOfSpeech: card.partOfSpeech,
          phonetic: card.phonetic,
          meaningVi: card.meaningVi,
          meaningEn: card.meaningEn,
          exampleSentence: card.exampleSentence,
          exampleTranslation: card.exampleTranslation,
          collocations: collocationsJson,
          mnemonic: card.mnemonic,
          audioUrl: card.audioUrl,
          source: 'TSL_OFFICIAL',
          hitCount: 1,
        },
      });

      upsertedCount++;
    }
  }

  // Export artifact JSON file
  const artifact: StarterLibraryArtifact = {
    version: '1.0.0',
    generatedAt: new Date().toISOString(),
    totalDecks: decks.length,
    totalCards,
    decks,
  };

  await atomicWriteJson(artifactPath, artifact);

  console.log(
    `[Stage 7] Published: ${upsertedCount} cards upserted, ${skippedCount} skipped (curated), ${decks.length} decks exported -> ${artifactPath}`
  );

  return {
    upsertedCount,
    skippedCount,
    totalCards,
    totalDecks: decks.length,
    artifactPath,
  };
}

export interface Stage7Options {
  inputPath?: string;
  outputArtifactPath?: string;
  prismaClient?: PrismaClient | any;
}

/**
 * Stage 7 Runner: Publishes to DB and creates final starter library artifact
 */
export async function runStage7(options: Stage7Options = {}): Promise<PublishResult> {
  const inputPath =
    options.inputPath || path.resolve(__dirname, 'data/stages/06-built-decks.json');
  const decks = (await readJsonIfExists<BuiltDeck[]>(inputPath)) || [];

  if (decks.length === 0) {
    console.warn(`[Stage 7] No built decks found at ${inputPath}`);
    return {
      upsertedCount: 0,
      skippedCount: 0,
      totalCards: 0,
      totalDecks: 0,
      artifactPath: '',
    };
  }

  let prisma: PrismaClient | null = options.prismaClient ?? null;
  if (!prisma) {
    const connectionString = process.env.DATABASE_URL;
    if (connectionString) {
      try {
        const pool = new pg.Pool({ connectionString });
        const adapter = new PrismaPg(pool);
        prisma = new PrismaClient({ adapter });
      } catch (err: any) {
        console.warn(`[Stage 7] Notice: Prisma connection not initialized (${err.message}). Skipping DB upsert.`);
      }
    } else {
      console.warn('[Stage 7] Notice: DATABASE_URL is not set. Skipping DB upsert.');
    }
  }

  return publishToDatabaseAndArtifact(decks, {
    prismaClient: prisma,
    outputArtifactPath: options.outputArtifactPath,
  });
}

if (import.meta.url === `file://${process.argv[1]}`) {
  runStage7().catch((err) => {
    console.error('[Stage 7] Execution failed:', err);
    process.exit(1);
  });
}
