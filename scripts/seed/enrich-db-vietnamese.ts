import fs from 'node:fs';
import readline from 'node:readline';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

const connectionString =
  process.env.DATABASE_URL ||
  'postgresql://postgres:23012005@localhost:5432/wordstreak_db?schema=public';

const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

function cleanMeaning(m: string): string {
  if (!m) return '';
  return m
    .replace(/\([^)]*\)/g, '')
    .replace(/\s+/g, ' ')
    .replace(/\/\/.*/g, '')
    .trim()
    .replace(/^[,;.\s]+|[,;.\s]+$/g, '');
}

async function loadDictionary(): Promise<Map<string, { ipa: string; meaning: string }>> {
  const dict = new Map<string, { ipa: string; meaning: string }>();
  if (!fs.existsSync('/tmp/ev_dict.txt')) {
    console.error('Missing /tmp/ev_dict.txt');
    return dict;
  }

  const fileStream = fs.createReadStream('/tmp/ev_dict.txt', { encoding: 'utf-8' });
  const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });

  let currentWord: string | null = null;
  let currentIpa = '';
  let currentMeanings: string[] = [];

  for await (const line of rl) {
    if (line.startsWith('@')) {
      if (currentWord && currentMeanings.length > 0) {
        const cleaned = currentMeanings
          .map(cleanMeaning)
          .filter(Boolean)
          .slice(0, 2)
          .join('; ');
        if (cleaned) {
          dict.set(currentWord.toLowerCase(), { ipa: currentIpa, meaning: cleaned });
        }
      }
      const parts = line.substring(1).trim().split('/');
      currentWord = parts[0].trim();
      currentIpa = parts[1] ? '/' + parts[1].trim() + '/' : '';
      currentMeanings = [];
    } else if (line.startsWith('-')) {
      const m = line.substring(1).trim();
      if (m && !m.startsWith('=')) {
        currentMeanings.push(m);
      }
    }
  }

  if (currentWord && currentMeanings.length > 0) {
    const cleaned = currentMeanings.map(cleanMeaning).filter(Boolean).slice(0, 2).join('; ');
    if (cleaned) {
      dict.set(currentWord.toLowerCase(), { ipa: currentIpa, meaning: cleaned });
    }
  }

  console.log(`Loaded ${dict.size} words from Anh-Việt dictionary.`);
  return dict;
}

async function main() {
  const dict = await loadDictionary();

  const officialCards = await prisma.officialCard.findMany();
  console.log(`Found ${officialCards.length} official cards in database to enrich.`);

  let updatedCount = 0;
  for (const card of officialCards) {
    const word = card.headword.toLowerCase();
    const entry = dict.get(word);
    const content = (card.content as any) || {};

    if (entry && entry.meaning) {
      const meaningVi = entry.meaning.charAt(0).toUpperCase() + entry.meaning.slice(1);
      const ipa = entry.ipa || content.ipa_us || `/${word}/`;

      const newContent = {
        ...content,
        word: card.headword,
        meaning_vi: meaningVi,
        ipa_us: ipa,
        example_vi: `Người quản lý đã rà soát chính sách về ${meaningVi.toLowerCase()} trong cuộc họp quý.`,
      };

      await prisma.officialCard.update({
        where: { id: card.id },
        data: {
          content: newContent,
        },
      });

      // Also upsert into global dictionary cache
      await prisma.globalDictionaryCache.upsert({
        where: { word: card.headword },
        update: {
          meaningVi,
          phonetic: ipa,
          exampleTranslation: newContent.example_vi,
        },
        create: {
          word: card.headword,
          partOfSpeech: card.pos || 'noun',
          phonetic: ipa,
          meaningVi,
          exampleSentence: content.example_en || `The company implemented the ${card.headword} strategy.`,
          exampleTranslation: newContent.example_vi,
          source: 'TSL_OFFICIAL',
        },
      });

      updatedCount++;
    } else {
      // If word not directly in dict, capitalize and make a clean label
      const currentMeaning = content.meaning_vi || '';
      if (currentMeaning.startsWith('Thuật ngữ TOEIC:')) {
        const cleanLabel = `Thuật ngữ nghiệp vụ: ${card.headword}`;
        await prisma.officialCard.update({
          where: { id: card.id },
          data: {
            content: { ...content, meaning_vi: cleanLabel },
          },
        });
      }
    }
  }

  console.log(`✅ Successfully enriched ${updatedCount}/${officialCards.length} official cards with real Vietnamese meanings!`);
}

main()
  .catch(console.error)
  .finally(() => pool.end());
