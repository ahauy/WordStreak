import {
  Injectable,
  Logger,
  NotFoundException,
  ForbiddenException,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { StreakService } from '../streaks/streak.service';
import {
  computePronunciationScore,
  computeDiffSpans,
} from './utils/pronunciation-scoring.util';
import type {
  SubmitQuizDto,
  QuizResultResponseDto,
  MissedCardDto,
  SubmitMatchingQuizDto,
  MatchingQuizResultDto,
  MatchingMissedCardDto,
  SubmitVoiceDto,
  VoicePronunciationResultDto,
} from '@wordstreak/shared-types';

@Injectable()
export class PracticeService {
  private readonly logger = new Logger(PracticeService.name);
  private readonly voiceCooldownMap = new Map<string, number>();

  constructor(
    private readonly prisma: PrismaService,
    private readonly streakService: StreakService,
  ) {}

  /**
   * Resets voice cooldown map (useful for testing).
   */
  clearVoiceCooldown(userId?: string): void {
    if (userId) {
      this.voiceCooldownMap.delete(userId);
    } else {
      this.voiceCooldownMap.clear();
    }
  }

  /**
   * Validates voice pronunciation submission, verifies similarity, updates streaks, and rewards XP.
   */
  async submitVoicePronunciation(
    userId: string,
    dto: SubmitVoiceDto,
  ): Promise<VoicePronunciationResultDto> {
    this.checkVoiceCooldown(userId);

    const card = await this.prisma.card.findUnique({
      where: { id: dto.cardId },
      include: { deck: true },
    });

    if (!card) {
      throw new NotFoundException(`Card with ID ${dto.cardId} not found`);
    }

    if (card.deck && card.deck.userId !== userId && !card.deck.isPublic) {
      throw new ForbiddenException('You do not have access to this card');
    }

    const {
      score: accuracyScore,
      tier,
      isPassed,
    } = computePronunciationScore(card.word, dto.spokenTranscript);
    const diffSpans = computeDiffSpans(card.word, dto.spokenTranscript);

    const baseXp = isPassed ? 10 : 0;
    const { finalXp: xpAwarded, isDailyCapped } =
      await this.enforceDailyPracticeCap(userId, baseXp);

    let streakAdvanced = false;
    if (isPassed) {
      const streakResult = await this.streakService.recordActivity(userId);
      streakAdvanced =
        streakResult.streakIncreased || streakResult.isActiveToday;
    }

    if (xpAwarded > 0) {
      await this.recordVoiceActivityAndXp(
        userId,
        card,
        dto,
        accuracyScore,
        tier,
        xpAwarded,
      );
    }

    return {
      isPassed,
      accuracyScore,
      tier,
      xpAwarded,
      isDailyCapped,
      streakAdvanced,
      diffSpans,
    };
  }

  /**
   * Enforces 1500ms anti-abuse cooldown per user for voice submissions.
   */
  private checkVoiceCooldown(userId: string): void {
    const now = Date.now();
    const lastTime = this.voiceCooldownMap.get(userId) ?? 0;
    if (now - lastTime < 1500) {
      throw new HttpException(
        'Too many requests. Please wait 1.5 seconds before submitting another voice attempt.',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }
    this.voiceCooldownMap.set(userId, now);
  }

  /**
   * Logs voice practice activity and increments user total XP.
   */
  private async recordVoiceActivityAndXp(
    userId: string,
    card: { id: string; word: string },
    dto: SubmitVoiceDto,
    accuracyScore: number,
    tier: string,
    xpAwarded: number,
  ): Promise<void> {
    await this.prisma.userActivityLog.create({
      data: {
        userId,
        activityType: 'VOICE_PRONUNCIATION',
        xpEarned: xpAwarded,
        metadata: {
          cardId: card.id,
          targetWord: card.word,
          spokenTranscript: dto.spokenTranscript,
          accuracyScore,
          tier,
          accent: dto.accent,
        },
      },
    });

    await this.prisma.user.update({
      where: { id: userId },
      data: { totalXp: { increment: xpAwarded } },
    });
  }

  /**
   * Evaluates standard/listening quiz submissions, calculates XP and fetches missed cards.
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
   * Evaluates word matching game submissions, computes XP/combos/bonuses, and applies anti-abuse guards.
   */
  async submitMatchingQuiz(
    userId: string,
    dto: SubmitMatchingQuizDto,
  ): Promise<MatchingQuizResultDto> {
    const answers = dto.answers ?? [];
    const totalPairs = dto.totalPairs || answers.length;
    const { totalTimeMs } = dto;

    const {
      matchedCount,
      maxCombo,
      comboBonusSum,
      hasFastPair,
      missedCardIds,
      cardErrorMap,
    } = this.processMatchingAnswers(answers);

    const finalMaxCombo = Math.max(maxCombo, dto.maxCombo ?? 0);
    const accuracyPercentage =
      totalPairs > 0 ? Math.round((matchedCount / totalPairs) * 100) : 0;
    const totalRounds = Math.max(1, Math.floor(totalPairs / 5));
    const hasZeroErrors =
      missedCardIds.length === 0 && matchedCount === totalPairs;

    const isBotFlagged = this.validateMatchingVelocity(
      totalPairs,
      totalTimeMs,
      totalRounds,
      hasFastPair,
    );

    if (isBotFlagged) {
      this.logger.warn(
        `[Anti-Abuse] Flagged suspicious bot velocity matching submission from user ${userId}`,
      );
    }

    const { baseXp, comboBonusXp, speedBonusXp, perfectBonusXp, totalXp } =
      this.calculateMatchingXp({
        matchedCount,
        totalRounds,
        comboBonusSum,
        totalTimeMs,
        hasZeroErrors,
        isBotFlagged,
      });

    const { finalXp, isDailyCapped } = await this.enforceDailyPracticeCap(
      userId,
      totalXp,
    );

    const missedCards = await this.fetchMatchingMissedCards(
      missedCardIds,
      cardErrorMap,
    );

    return {
      submissionId: `wm_sub_${Date.now()}`,
      score: matchedCount,
      accuracy: accuracyPercentage,
      totalPairs,
      matchedCount,
      accuracyPercentage,
      maxCombo: finalMaxCombo,
      totalTimeMs,
      totalXpEarned: finalXp,
      totalXp: finalXp,
      isBotFlagged,
      xpBreakdown: {
        baseXp,
        comboBonusXp,
        speedBonusXp,
        perfectBonusXp,
        totalXp: finalXp,
        isDailyCapped,
        isBotDetected: isBotFlagged,
        isBotFlagged,
      },
      missedCards,
    };
  }

  /**
   * Processes matching game answers to compute streak, combo bonuses, error counts and missed card IDs.
   */
  private processMatchingAnswers(
    answers: NonNullable<SubmitMatchingQuizDto['answers']>,
  ): {
    matchedCount: number;
    maxCombo: number;
    comboBonusSum: number;
    hasFastPair: boolean;
    missedCardIds: string[];
    cardErrorMap: Record<string, number>;
  } {
    let matchedCount = 0;
    let currentStreak = 0;
    let maxCombo = 0;
    let comboBonusSum = 0;
    let hasFastPair = false;
    const missedCardIds: string[] = [];
    const cardErrorMap: Record<string, number> = {};

    for (const ans of answers) {
      if (
        (ans.matchedInMs !== undefined && ans.matchedInMs < 200) ||
        (ans.responseTimeMs !== undefined && ans.responseTimeMs < 200)
      ) {
        hasFastPair = true;
      }

      const isCorrect = ans.isCorrect !== false;
      const isFirstTry =
        ans.isCorrectFirstTry ??
        (ans.attempts === undefined || ans.attempts === 1);

      if (isCorrect) {
        matchedCount++;
        if (isFirstTry) {
          currentStreak++;
          if (currentStreak > maxCombo) {
            maxCombo = currentStreak;
          }
          const multiplier =
            currentStreak >= 10
              ? 2.0
              : currentStreak >= 5
                ? 1.5
                : currentStreak >= 3
                  ? 1.2
                  : 1.0;
          comboBonusSum += 2 * (multiplier - 1.0);
        } else {
          currentStreak = 0;
          if (ans.cardId && !missedCardIds.includes(ans.cardId)) {
            missedCardIds.push(ans.cardId);
          }
          cardErrorMap[ans.cardId] =
            (ans.attempts ?? 2) - (ans.isCorrect !== false ? 1 : 0) || 1;
        }
      } else {
        currentStreak = 0;
        if (ans.cardId && !missedCardIds.includes(ans.cardId)) {
          missedCardIds.push(ans.cardId);
        }
        cardErrorMap[ans.cardId] = ans.attempts ?? 1;
      }
    }

    return {
      matchedCount,
      maxCombo,
      comboBonusSum,
      hasFastPair,
      missedCardIds,
      cardErrorMap,
    };
  }

  /**
   * Evaluates if submission velocity triggers anti-abuse bot detection.
   */
  private validateMatchingVelocity(
    totalPairs: number,
    totalTimeMs: number,
    totalRounds: number,
    hasFastPair: boolean,
  ): boolean {
    if (totalPairs >= 5 && totalTimeMs < 1500) {
      return true;
    }
    if (totalPairs >= 5 && totalTimeMs < 1500 * totalRounds) {
      return true;
    }
    return hasFastPair;
  }

  /**
   * Calculates base XP, combo bonus, speed bonus, and perfect bonuses.
   */
  private calculateMatchingXp(params: {
    matchedCount: number;
    totalRounds: number;
    comboBonusSum: number;
    totalTimeMs: number;
    hasZeroErrors: boolean;
    isBotFlagged: boolean;
  }): {
    baseXp: number;
    comboBonusXp: number;
    speedBonusXp: number;
    perfectBonusXp: number;
    totalXp: number;
  } {
    const {
      matchedCount,
      totalRounds,
      comboBonusSum,
      totalTimeMs,
      hasZeroErrors,
      isBotFlagged,
    } = params;

    if (isBotFlagged) {
      return {
        baseXp: 0,
        comboBonusXp: 0,
        speedBonusXp: 0,
        perfectBonusXp: 0,
        totalXp: 0,
      };
    }

    const baseXp = matchedCount * 2;
    const comboBonusXp = Math.round(comboBonusSum);
    const speedBonusXp =
      hasZeroErrors && totalTimeMs <= totalRounds * 15000
        ? 10 * totalRounds
        : 0;
    const perfectBonusXp = hasZeroErrors ? 5 * totalRounds : 0;
    const totalXp = baseXp + comboBonusXp + speedBonusXp + perfectBonusXp;

    return {
      baseXp,
      comboBonusXp,
      speedBonusXp,
      perfectBonusXp,
      totalXp,
    };
  }

  /**
   * Applies daily 500 XP cap for non-SRS practice modes.
   */
  private async enforceDailyPracticeCap(
    userId: string,
    prospectiveXp: number,
  ): Promise<{ finalXp: number; isDailyCapped: boolean }> {
    if (!this.prisma.userActivityLog || prospectiveXp <= 0) {
      return { finalXp: prospectiveXp, isDailyCapped: false };
    }

    const todayStart = new Date();
    todayStart.setUTCHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setUTCHours(23, 59, 59, 999);

    const agg = await this.prisma.userActivityLog.aggregate({
      where: {
        userId,
        activityType: {
          in: ['VOICE_PRONUNCIATION', 'PRACTICE_QUIZ', 'WORD_MATCHING'],
        },
        createdAt: { gte: todayStart, lte: todayEnd },
      },
      _sum: { xpEarned: true },
    });

    const todayXp = agg._sum?.xpEarned ?? 0;
    if (todayXp >= 500) {
      return { finalXp: 0, isDailyCapped: true };
    }
    if (todayXp + prospectiveXp > 500) {
      return { finalXp: 500 - todayXp, isDailyCapped: true };
    }

    return { finalXp: prospectiveXp, isDailyCapped: false };
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

  /**
   * Fetches missed cards with error attempts for matching game review.
   */
  private async fetchMatchingMissedCards(
    missedCardIds: string[],
    cardErrorMap: Record<string, number>,
  ): Promise<MatchingMissedCardDto[]> {
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
      errorAttempts: cardErrorMap[c.id] ?? 1,
    }));
  }
}
