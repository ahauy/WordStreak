import { Module } from '@nestjs/common';
import { PracticeController } from './practice.controller';
import { PracticeService } from './practice.service';
import { QuizGeneratorService } from './quiz-generator.service';
import { FillBlankGeneratorService } from './fill-blank-generator.service';
import { ListeningGeneratorService } from './listening-generator.service';
import { MatchingGeneratorService } from './matching-generator.service';
import { PrismaModule } from '../prisma/prisma.module';
import { StreakModule } from '../streaks/streak.module';

@Module({
  imports: [PrismaModule, StreakModule],
  controllers: [PracticeController],
  providers: [
    PracticeService,
    QuizGeneratorService,
    FillBlankGeneratorService,
    ListeningGeneratorService,
    MatchingGeneratorService,
  ],
  exports: [
    PracticeService,
    QuizGeneratorService,
    FillBlankGeneratorService,
    ListeningGeneratorService,
    MatchingGeneratorService,
  ],
})
export class PracticeModule {}
