import { Module } from '@nestjs/common';
import { CardsController } from './cards.controller';
import { CardsService } from './cards.service';
import { PrismaModule } from '../prisma/prisma.module';
import { AiVocabularyModule } from '../ai-vocabulary/ai-vocabulary.module';

@Module({
  imports: [PrismaModule, AiVocabularyModule],
  controllers: [CardsController],
  providers: [CardsService],
  exports: [CardsService],
})
export class CardsModule {}
