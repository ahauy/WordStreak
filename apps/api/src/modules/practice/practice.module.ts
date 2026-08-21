import { Module } from '@nestjs/common';
import { PracticeController } from './practice.controller';
import { PracticeService } from './practice.service';
import { QuizGeneratorService } from './quiz-generator.service';
import { FillBlankGeneratorService } from './fill-blank-generator.service';
import { ListeningGeneratorService } from './listening-generator.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [PracticeController],
  providers: [
    PracticeService,
    QuizGeneratorService,
    FillBlankGeneratorService,
    ListeningGeneratorService,
  ],
  exports: [
    PracticeService,
    QuizGeneratorService,
    FillBlankGeneratorService,
    ListeningGeneratorService,
  ],
})
export class PracticeModule {}
