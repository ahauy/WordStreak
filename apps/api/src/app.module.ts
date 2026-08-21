import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './modules/prisma/prisma.module';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { DecksModule } from './modules/decks/decks.module';
import { CardsModule } from './modules/cards/cards.module';
import { ReviewsModule } from './modules/reviews/reviews.module';
import { PracticeModule } from './modules/practice/practice.module';
import { StreakModule } from './modules/streaks/streak.module';
import { AiVocabularyModule } from './modules/ai-vocabulary/ai-vocabulary.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ['.env', '../../.env'],
      isGlobal: true,
    }),
    PrismaModule,
    UsersModule,
    AuthModule,
    DecksModule,
    CardsModule,
    ReviewsModule,
    PracticeModule,
    StreakModule,
    AiVocabularyModule,
    AnalyticsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
