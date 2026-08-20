import { Module } from '@nestjs/common';
import { ReviewsController } from './reviews.controller';
import { ReviewsService } from './reviews.service';
import { SrsService } from './srs.service';
import { PrismaModule } from '../prisma/prisma.module';
import { StreakModule } from '../streaks/streak.module';

@Module({
  imports: [PrismaModule, StreakModule],
  controllers: [ReviewsController],
  providers: [ReviewsService, SrsService],
  exports: [ReviewsService, SrsService],
})
export class ReviewsModule {}
