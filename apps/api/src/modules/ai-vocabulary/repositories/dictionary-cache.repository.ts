import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { GlobalDictionaryCacheRecord, AiCardSource } from '@wordstreak/shared-types';

export interface SaveDictionaryCacheDto {
  word: string;
  partOfSpeech?: string | null;
  phonetic?: string | null;
  meaningVi: string;
  meaningEn?: string | null;
  exampleSentence?: string | null;
  exampleTranslation?: string | null;
  collocations?: string[];
  mnemonic?: string | null;
  audioUrl?: string | null;
  source?: AiCardSource;
}

@Injectable()
export class DictionaryCacheRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByWord(normalizedWord: string): Promise<GlobalDictionaryCacheRecord | null> {
    const record = await this.prisma.globalDictionaryCache.findUnique({
      where: { word: normalizedWord },
    });

    if (!record) {
      return null;
    }

    return this.mapToRecord(record);
  }

  async incrementHitCount(id: string): Promise<void> {
    try {
      await this.prisma.globalDictionaryCache.update({
        where: { id },
        data: {
          hitCount: { increment: 1 },
        },
      });
    } catch {
      // Non-critical background hit count update
    }
  }

  async saveToCache(dto: SaveDictionaryCacheDto): Promise<GlobalDictionaryCacheRecord> {
    const serializedCollocations = dto.collocations ? JSON.stringify(dto.collocations) : null;

    const record = await this.prisma.globalDictionaryCache.upsert({
      where: { word: dto.word },
      update: {
        partOfSpeech: dto.partOfSpeech ?? undefined,
        phonetic: dto.phonetic ?? undefined,
        meaningVi: dto.meaningVi,
        meaningEn: dto.meaningEn ?? undefined,
        exampleSentence: dto.exampleSentence ?? undefined,
        exampleTranslation: dto.exampleTranslation ?? undefined,
        collocations: serializedCollocations ?? undefined,
        mnemonic: dto.mnemonic ?? undefined,
        audioUrl: dto.audioUrl ?? undefined,
        source: dto.source ?? 'GEMINI_FLASH',
      },
      create: {
        word: dto.word,
        partOfSpeech: dto.partOfSpeech ?? null,
        phonetic: dto.phonetic ?? null,
        meaningVi: dto.meaningVi,
        meaningEn: dto.meaningEn ?? null,
        exampleSentence: dto.exampleSentence ?? null,
        exampleTranslation: dto.exampleTranslation ?? null,
        collocations: serializedCollocations,
        mnemonic: dto.mnemonic ?? null,
        audioUrl: dto.audioUrl ?? null,
        source: dto.source ?? 'GEMINI_FLASH',
        hitCount: 1,
      },
    });

    return this.mapToRecord(record);
  }

  private mapToRecord(record: any): GlobalDictionaryCacheRecord {
    let collocations: string[] = [];
    if (record.collocations) {
      try {
        collocations = JSON.parse(record.collocations);
      } catch {
        collocations = record.collocations.split(',').map((s: string) => s.trim());
      }
    }

    return {
      id: record.id,
      word: record.word,
      partOfSpeech: record.partOfSpeech,
      phonetic: record.phonetic,
      meaningVi: record.meaningVi,
      meaningEn: record.meaningEn,
      exampleSentence: record.exampleSentence,
      exampleTranslation: record.exampleTranslation,
      collocations,
      mnemonic: record.mnemonic,
      audioUrl: record.audioUrl,
      source: record.source as AiCardSource,
      hitCount: record.hitCount,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    };
  }
}
