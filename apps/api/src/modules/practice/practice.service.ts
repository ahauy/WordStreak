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
    const { answers, totalQuestions, mode } = dto;
    const totalCount = totalQuestions || answers.length;
    const isListeningMode = mode === 'LISTENING';

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
        const speedBonus = this.calculateSpeedBonus(ans, isListeningMode);
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

    if (this.isBotSubmission(answers, totalTimeMs)) {
      totalXpEarned = 0;
    }

    const accuracyPercentage =
      totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 0;

    const missedCards = await this.fetchMissedCards(missedCardIds);

    return {
      totalQuestions: totalCount,
      correctCount,
      accuracyPercentage,
      totalXpEarned,
      maxCombo,
      missedCards,
    };
  }

  /**
   * Calculates speed bonus (+15 for listening drill, +5 for standard quiz).
   */
  private calculateSpeedBonus(
    ans: SubmitQuizDto['answers'][0],
    isListeningMode: boolean,
  ): number {
    const isListeningItem =
      isListeningMode ||
      ans.hintsUsed !== undefined ||
      ans.replayCount !== undefined ||
      ans.audioSpeedUsed !== undefined ||
      ans.submittedWord !== undefined;

    if (isListeningItem) {
      const withinTime =
        ans.timeSpentMs !== undefined && ans.timeSpentMs <= 8000;
      const noHints = (ans.hintsUsed ?? 0) === 0;
      const lowReplay = (ans.replayCount ?? 0) <= 2;

      return withinTime && noHints && lowReplay ? 15 : 0;
    }

    return ans.timeSpentMs !== undefined && ans.timeSpentMs <= 5000 ? 5 : 0;
  }

  /**
   * Detects automated bot scripts submitting at underhuman velocity.
   */
  private isBotSubmission(
    answers: SubmitQuizDto['answers'],
    totalTimeMs: number,
  ): boolean {
    if (answers.length >= 5 && totalTimeMs < 3000) {
      return true;
    }

    if (
      answers.length > 0 &&
      answers.some(
        (ans) => ans.timeSpentMs !== undefined && ans.timeSpentMs < 400,
      )
    ) {
      return true;
    }

    return false;
  }

  /**
   * Fetches missed card details without mutating any SRS state.
   */
  private async fetchMissedCards(
    missedCardIds: string[],
  ): Promise<MissedCardDto[]> {
    if (missedCardIds.length === 0) {
      return [];
    }

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

    return cards.map((c) => ({
      cardId: c.id,
      word: c.word,
      meaning: c.meaning,
      phonetic: c.phonetic,
      audioUrl: c.audioUrl,
    }));
  }
}
