import { Module } from '@nestjs/common';
import { ReviewsController } from './reviews.controller';
import { ReviewsService } from './reviews.service';
import { ReviewsSyncService } from './reviews-sync.service';
import { SrsService } from './srs.service';
import { PrismaModule } from '../prisma/prisma.module';
import { StreakModule } from '../streaks/streak.module';
import { GamificationModule } from '../gamification/gamification.module';

@Module({
  imports: [PrismaModule, StreakModule, GamificationModule],
  controllers: [ReviewsController],
  providers: [ReviewsService, ReviewsSyncService, SrsService],
  exports: [ReviewsService, ReviewsSyncService, SrsService],
})
export class ReviewsModule {}
