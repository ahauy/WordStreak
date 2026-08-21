import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AiVocabularyController } from './ai-vocabulary.controller';
import { AiVocabularyService } from './ai-vocabulary.service';
import { DictionaryCacheRepository } from './repositories/dictionary-cache.repository';
import { GeminiProvider } from './providers/gemini.provider';
import { FreeDictionaryProvider } from './providers/free-dictionary.provider';
import { AiQuotaService } from './services/ai-quota.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [ConfigModule, PrismaModule],
  controllers: [AiVocabularyController],
  providers: [
    AiVocabularyService,
    DictionaryCacheRepository,
    GeminiProvider,
    FreeDictionaryProvider,
    AiQuotaService,
  ],
  exports: [AiVocabularyService],
})
export class AiVocabularyModule {}
