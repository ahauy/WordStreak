import { Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import {
  calculateLevelFromXp,
  calculateTierFromLevel,
} from '@wordstreak/shared-types';

const logger = new Logger('BackfillXp');

export async function backfillHistoricalXp(prisma: PrismaClient) {
  logger.log('--- Starting Gamification XP Historical Backfill ---');

  const users = await prisma.user.findMany({
    select: { id: true, username: true, totalXp: true },
  });

  let processedCount = 0;

  for (const user of users) {
    const existingLogsCount = await prisma.userActivityLog.count({
      where: { userId: user.id },
    });

    if (user.totalXp > 0 || existingLogsCount > 0) {
      continue;
    }

    const validReviewsCount = await prisma.reviewLog.count({
      where: {
        userId: user.id,
        rating: { gte: 2 },
      },
    });
    const reviewXp = validReviewsCount * 10;

    const streak = await prisma.userStreak.findUnique({
      where: { userId: user.id },
    });
    const bestStreak = streak?.bestStreak ?? 0;
    const streak7Milestones = Math.floor(bestStreak / 7);
    const streak30Milestones = Math.floor(bestStreak / 30);
    const streakXp = streak7Milestones * 100 + streak30Milestones * 500;

    const totalCalculatedXp = reviewXp + streakXp;
    const level = calculateLevelFromXp(totalCalculatedXp);
    const tier = calculateTierFromLevel(level);

    if (totalCalculatedXp > 0) {
      await prisma.$transaction([
        prisma.userActivityLog.create({
          data: {
            userId: user.id,
            activityType: 'HISTORICAL_BACKFILL',
            xpEarned: totalCalculatedXp,
            metadata: {
              validReviewsCount,
              reviewXp,
              bestStreak,
              streakXp,
              backfilledAt: new Date().toISOString(),
            },
          },
        }),
        prisma.user.update({
          where: { id: user.id },
          data: {
            totalXp: totalCalculatedXp,
            level,
            tier,
          },
        }),
      ]);
      processedCount++;
    }
  }

  logger.log(`Successfully backfilled XP for ${processedCount} users.`);
  return processedCount;
}

if (process.env.NODE_ENV !== 'test' && require.main === module) {
  const connectionString =
    process.env.DATABASE_URL ||
    'postgresql://postgres:23012005@localhost:5432/wordstreak_db?schema=public';
  const pool = new pg.Pool({ connectionString });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  backfillHistoricalXp(prisma)
    .catch((err: unknown) => {
      logger.error('Backfill failed:', err);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
      await pool.end();
    });
}
