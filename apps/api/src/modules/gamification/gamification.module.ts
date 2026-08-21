import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { LevelEngineService } from './services/level-engine.service';
import { XpRateLimiterService } from './services/xp-rate-limiter.service';
import { XpService } from './services/xp.service';
import { XpController } from './xp.controller';

@Module({
  imports: [PrismaModule],
  controllers: [XpController],
  providers: [LevelEngineService, XpRateLimiterService, XpService],
  exports: [LevelEngineService, XpRateLimiterService, XpService],
})
export class GamificationModule {}
