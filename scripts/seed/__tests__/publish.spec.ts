import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { publishToDatabaseAndArtifact } from '../07-publish';
import type { BuiltDeck } from '../06-build-decks';

describe('TC-LIB-010: Database Upsert & Artifact Export', () => {
  let tempDir: string;
  let artifactPath: string;

  beforeEach(async () => {
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'publish-test-'));
    artifactPath = path.join(tempDir, 'starter-library-decks.json');
  });

  afterEach(async () => {
    await fs.rm(tempDir, { recursive: true, force: true });
  });

  it('should upsert records into GlobalDictionaryCache with source TSL_OFFICIAL', async () => {
    const mockDecks: BuiltDeck[] = [
      {
        slug: 'tsl-t1-office-communication-01',
        titleEn: 'Office Communication - Part 1',
        titleVi: 'Giao tiếp Văn phòng - Phần 1',
        topicCategory: 'Office Communication',
        level: 'T1',
        listCode: 'TSL',
        cards: [
          {
            word: 'accommodate',
            partOfSpeech: 'verb',
            phonetic: '/əˈkɑː.mə.deɪt/',
            meaningVi: 'đáp ứng nhu cầu, cung cấp chỗ ở',
            meaningEn: 'to provide lodging or adapt to needs',
            exampleSentence: 'The hall can accommodate 500 guests.',
            exampleTranslation: 'Hội trường có thể chứa 500 khách.',
            collocations: ['accommodate needs', 'accommodate guests'],
            mnemonic: 'Ắc quy đáp ứng nhu cầu',
          },
        ],
      },
    ];

    const upsertSpy = vi.fn().mockResolvedValue({ id: 'mock-uuid-1', word: 'accommodate' });
    const findUniqueSpy = vi.fn().mockResolvedValue(null); // Not existing yet

    const mockPrisma = {
      globalDictionaryCache: {
        findUnique: findUniqueSpy,
        upsert: upsertSpy,
      },
    };

    const result = await publishToDatabaseAndArtifact(mockDecks, {
      prismaClient: mockPrisma as any,
      outputArtifactPath: artifactPath,
    });

    expect(result.upsertedCount).toBe(1);
    expect(upsertSpy).toHaveBeenCalledTimes(1);
    expect(upsertSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { word: 'accommodate' },
        create: expect.objectContaining({
          word: 'accommodate',
          partOfSpeech: 'verb',
          phonetic: '/əˈkɑː.mə.deɪt/',
          meaningVi: 'đáp ứng nhu cầu, cung cấp chỗ ở',
          source: 'TSL_OFFICIAL',
          hitCount: 1,
        }),
      })
    );

    // Verify disk artifact is valid JSON
    const fileContent = await fs.readFile(artifactPath, 'utf-8');
    const parsedArtifact = JSON.parse(fileContent);
    expect(parsedArtifact).toHaveProperty('version');
    expect(parsedArtifact.decks).toHaveLength(1);
    expect(parsedArtifact.decks[0].slug).toBe('tsl-t1-office-communication-01');
  });

  it('should NOT overwrite records where source is MANUAL_CURATED (BR-LIB-008)', async () => {
    const mockDecks: BuiltDeck[] = [
      {
        slug: 'tsl-t1-office-01',
        titleEn: 'Office 1',
        titleVi: 'Văn phòng 1',
        topicCategory: 'Office',
        level: 'T1',
        listCode: 'TSL',
        cards: [
          {
            word: 'curated-word',
            partOfSpeech: 'noun',
            phonetic: '/ˈkjuː.reɪt/',
            meaningVi: 'Từ do curator biên tập đặc biệt',
            meaningEn: 'Specially curated',
            exampleSentence: 'This is a curated word.',
            exampleTranslation: 'Đây là từ được biên tập.',
            collocations: ['curated content', 'curated list'],
            mnemonic: 'mẹo nhớ',
          },
        ],
      },
    ];

    const findUniqueSpy = vi.fn().mockResolvedValue({
      id: 'existing-id',
      word: 'curated-word',
      source: 'MANUAL_CURATED',
    });
    const upsertSpy = vi.fn();

    const mockPrisma = {
      globalDictionaryCache: {
        findUnique: findUniqueSpy,
        upsert: upsertSpy,
      },
    };

    const result = await publishToDatabaseAndArtifact(mockDecks, {
      prismaClient: mockPrisma as any,
      outputArtifactPath: artifactPath,
    });

    expect(findUniqueSpy).toHaveBeenCalledWith({ where: { word: 'curated-word' } });
    expect(upsertSpy).not.toHaveBeenCalled();
    expect(result.skippedCount).toBe(1);
  });
});
