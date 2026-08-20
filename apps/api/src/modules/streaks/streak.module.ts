import { Module } from '@nestjs/common';
import { StreakController } from './streak.controller';
import { StreakService } from './streak.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [StreakController],
  providers: [StreakService],
  exports: [StreakService],
})
export class StreakModule {}
