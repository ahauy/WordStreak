import { Module } from '@nestjs/common';
import { PracticeController } from './practice.controller';
import { PracticeService } from './practice.service';
import { QuizGeneratorService } from './quiz-generator.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [PracticeController],
  providers: [PracticeService, QuizGeneratorService],
  exports: [PracticeService, QuizGeneratorService],
})
export class PracticeModule {}
