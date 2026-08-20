import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import type {
  SubmitQuizDto,
  QuizResultResponseDto,
  MissedCardDto,
} from '@wordstreak/shared-types';

@Injectable()
export class PracticeService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Evaluates quiz submission, computes score/combos/XP, and fetches missed cards.
   */
  async submitQuiz(
    userId: string,
    dto: SubmitQuizDto,
  ): Promise<QuizResultResponseDto> {
    const { answers, totalQuestions } = dto;
    const totalCount = totalQuestions || answers.length;

    let correctCount = 0;
    let currentStreak = 0;
    let maxCombo = 0;
    let totalXpEarned = 0;
    let totalTimeMs = 0;
    const missedCardIds: string[] = [];

    for (const ans of answers) {
      totalTimeMs += ans.timeSpentMs || 0;

      if (ans.isCorrect) {
        correctCount++;
        currentStreak++;
        if (currentStreak > maxCombo) {
          maxCombo = currentStreak;
        }

        const base = 10;
        const speedBonus = ans.timeSpentMs && ans.timeSpentMs <= 5000 ? 5 : 0;
        const multiplier =
          currentStreak >= 5 ? 1.5 : currentStreak >= 3 ? 1.2 : 1.0;

        totalXpEarned += Math.round((base + speedBonus) * multiplier);
      } else {
        currentStreak = 0;
        if (ans.cardId && !missedCardIds.includes(ans.cardId)) {
          missedCardIds.push(ans.cardId);
        }
      }
    }

    // Anti-abuse check: Underhuman submission speed (<3000ms for >=5 questions)
    if (answers.length >= 5 && totalTimeMs < 3000) {
      totalXpEarned = 0;
    }

    const accuracyPercentage =
      totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 0;

    // Fetch details of missed cards
    let missedCards: MissedCardDto[] = [];
    if (missedCardIds.length > 0) {
      const cards = await this.prisma.card.findMany({
        where: {
          id: { in: missedCardIds },
        },
        select: {
          id: true,
          word: true,
          meaning: true,
          phonetic: true,
          audioUrl: true,
        },
      });

      missedCards = cards.map((c) => ({
        cardId: c.id,
        word: c.word,
        meaning: c.meaning,
        phonetic: c.phonetic,
        audioUrl: c.audioUrl,
      }));
    }

    return {
      totalQuestions: totalCount,
      correctCount,
      accuracyPercentage,
      totalXpEarned,
      maxCombo,
      missedCards,
    };
  }
}
