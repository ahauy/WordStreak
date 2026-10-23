import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { LibraryController } from './library.controller';
import { LibraryService } from './library.service';
import { LibraryFeedbackService } from './services/library-feedback.service';

@Module({
  imports: [PrismaModule],
  controllers: [LibraryController],
  providers: [LibraryService, LibraryFeedbackService],
  exports: [LibraryService, LibraryFeedbackService],
})
export class LibraryModule {}
