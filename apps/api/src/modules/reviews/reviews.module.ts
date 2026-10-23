import { Module } from '@nestjs/common';
import { ReviewsController } from './reviews.controller';
import { ReviewsService } from './reviews.service';
import { ReviewsSyncService } from './reviews-sync.service';
import { ReviewsSummaryService } from './services/reviews-summary.service';
import { SrsService } from './srs.service';
import { PrismaModule } from '../prisma/prisma.module';
import { StreakModule } from '../streaks/streak.module';
import { GamificationModule } from '../gamification/gamification.module';

@Module({
  imports: [PrismaModule, StreakModule, GamificationModule],
  controllers: [ReviewsController],
  providers: [
    ReviewsService,
    ReviewsSyncService,
    ReviewsSummaryService,
    SrsService,
  ],
  exports: [
    ReviewsService,
    ReviewsSyncService,
    ReviewsSummaryService,
    SrsService,
  ],
})
export class ReviewsModule {}
