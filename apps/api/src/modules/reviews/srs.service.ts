import { Injectable } from '@nestjs/common';
import type {
  SrsCalculationInput,
  SrsCalculationResult,
  CardLearningStatus,
} from '@wordstreak/shared-types';

@Injectable()
export class SrsService {
  private static readonly MIN_EASE_FACTOR = 1.3;
  private static readonly EASY_BONUS_MULTIPLIER = 1.3;

  /**
   * Calculates the next SRS interval, ease factor, repetition count, and next review date
   * based on the SuperMemo-2 (SM-2) algorithm.
   * Maps 4-button ratings (1: Again, 2: Hard, 3: Good, 4: Easy) to SM-2 grades (2, 3, 4, 5).
   */
  calculateSm2(input: SrsCalculationInput): SrsCalculationResult {
    const { rating, repetitions, easeFactor, interval } = input;

    // 1. Map WordStreak 1..4 scale to SM-2 quality grade (2..5)
    // 1 (Again) -> 2 (Incorrect response)
    // 2 (Hard)  -> 3 (Correct with serious difficulty)
    // 3 (Good)  -> 4 (Correct after hesitation)
    // 4 (Easy)  -> 5 (Perfect recall)
    const grade = rating === 1 ? 2 : rating === 2 ? 3 : rating === 3 ? 4 : 5;
    const diff = 5 - grade;
    let nextEaseFactor = easeFactor + (0.1 - diff * (0.08 + diff * 0.02));
    nextEaseFactor = Math.max(SrsService.MIN_EASE_FACTOR, nextEaseFactor);
    nextEaseFactor = Number(nextEaseFactor.toFixed(2));

    // 2. Update Repetitions and Interval
    let nextRepetitions = repetitions;
    let nextInterval = interval;

    if (rating < 3) {
      // Again (1) or Hard (2) resets streak
      nextRepetitions = 0;
      nextInterval = 1;
    } else {
      // Good (3) or Easy (4) increments streak
      nextRepetitions = repetitions + 1;

      if (nextRepetitions === 1) {
        nextInterval = 1;
      } else if (nextRepetitions === 2) {
        nextInterval = 6;
      } else {
        const baseInterval = interval * nextEaseFactor;
        if (rating === 4) {
          nextInterval = Math.round(
            baseInterval * SrsService.EASY_BONUS_MULTIPLIER,
          );
        } else {
          nextInterval = Math.round(baseInterval);
        }
      }
    }

    // 3. Compute Next Review Date
    const nextReviewDate = new Date();
    nextReviewDate.setDate(nextReviewDate.getDate() + nextInterval);

    // 4. Derive Status
    let status: CardLearningStatus = 'LEARNING';
    if (nextInterval >= 21 && nextRepetitions >= 4) {
      status = 'MASTERED';
    } else if (nextRepetitions === 0 && interval === 0) {
      status = 'NEW';
    }

    return {
      interval: nextInterval,
      easeFactor: nextEaseFactor,
      repetitions: nextRepetitions,
      nextReviewDate,
      status,
    };
  }
}
