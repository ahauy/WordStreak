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
    const {
      rating,
      repetitions,
      easeFactor,
      interval,
      isBeginner,
      currentLearningStep,
    } = input;

    // Beginner Intra-session Learning Steps: 1 min (Step 1) -> 5 mins (Step 2) -> Graduate (1 day)
    if (
      isBeginner &&
      (repetitions === 0 ||
        (currentLearningStep !== undefined && currentLearningStep !== null))
    ) {
      const step = currentLearningStep ?? 0;

      if (rating < 3) {
        // Again (1) or Hard (2) resets to Step 1 (1 min)
        const nextReviewDate = new Date(Date.now() + 1 * 60 * 1000);
        return {
          interval: 0,
          intervalMinutes: 1,
          easeFactor: Math.max(
            SrsService.MIN_EASE_FACTOR,
            Number((easeFactor - 0.2).toFixed(2)),
          ),
          repetitions: 0,
          nextReviewDate,
          status: 'LEARNING_STEP',
          learningStep: 0,
          graduated: false,
        };
      }

      // Rating >= 3 (Good or Easy)
      if (rating === 4 || step >= 1) {
        // Easy (4) graduates directly, or Good (3) on Step 2 graduates
        const nextReviewDate = new Date();
        nextReviewDate.setDate(nextReviewDate.getDate() + 1);
        return {
          interval: 1,
          easeFactor:
            rating === 4
              ? Number((easeFactor + 0.15).toFixed(2))
              : easeFactor,
          repetitions: 1,
          nextReviewDate,
          status: 'LEARNING',
          learningStep: null,
          graduated: true,
        };
      } else {
        // Good (3) on Step 1 moves to Step 2 (5 mins)
        const nextReviewDate = new Date(Date.now() + 5 * 60 * 1000);
        return {
          interval: 0,
          intervalMinutes: 5,
          easeFactor,
          repetitions: 0,
          nextReviewDate,
          status: 'LEARNING_STEP',
          learningStep: 1,
          graduated: false,
        };
      }
    }

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
