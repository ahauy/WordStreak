import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import type {
  GetMatchingQuizQueryDto,
  MatchingQuizResponseDto,
  MatchingRoundDto,
  MatchingCardItemDto,
} from '@wordstreak/shared-types';

interface GenerateCardSource {
  id: string;
  word: string;
  meaning: string;
  phonetic?: string | null;
  audioUrl?: string | null;
}

@Injectable()
export class MatchingGeneratorService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Generates a 5-pair chunked matching quiz session from deck cards.
   */
  async generateQuiz(
    userId: string,
    query: GetMatchingQuizQueryDto,
  ): Promise<MatchingQuizResponseDto> {
    const { deckId, limit, roundsCount } = query;

    const deck = await this.prisma.deck.findUnique({
      where: { id: deckId },
      include: {
        cards: true,
      },
    });

    if (!deck || deck.isArchived) {
      throw new NotFoundException(`Deck with ID ${deckId} not found`);
    }

    if (deck.userId !== userId && !deck.isPublic) {
      throw new ForbiddenException('You do not have access to this deck');
    }

    if (deck.cards.length < 5) {
      throw new BadRequestException('INSUFFICIENT_CARDS_FOR_MATCHING');
    }

    const targetCardCount = this.resolveTargetCardCount(
      deck.cards.length,
      limit,
      roundsCount,
    );

    const shuffledCards = this.shuffle([...deck.cards]);
    const candidateCards = shuffledCards.slice(0, targetCardCount);
    const totalRounds = Math.floor(candidateCards.length / 5);

    const rounds: MatchingRoundDto[] = [];
    for (let r = 0; r < totalRounds; r++) {
      const slice = candidateCards.slice(r * 5, (r + 1) * 5);
      rounds.push(this.buildRound(r, totalRounds, slice));
    }

    return {
      deckId: deck.id,
      deckTitle: deck.title,
      totalCards: totalRounds * 5,
      totalRounds,
      rounds,
    };
  }

  /**
   * Alias for generateQuiz to maintain backward compatibility.
   */
  async generateQuestions(
    userId: string,
    query: GetMatchingQuizQueryDto,
  ): Promise<MatchingQuizResponseDto> {
    return this.generateQuiz(userId, query);
  }

  /**
   * Calculates target card count bounded to 5-pair increments.
   */
  private resolveTargetCardCount(
    availableCards: number,
    limit?: number,
    roundsCount?: number,
  ): number {
    let desired = 10;
    if (roundsCount !== undefined && roundsCount > 0) {
      desired = roundsCount * 5;
    } else if (limit !== undefined && limit > 0) {
      desired = limit;
    }

    const clamped = Math.min(
      Math.max(desired, 5),
      Math.min(availableCards, 50),
    );
    return Math.floor(clamped / 5) * 5;
  }

  /**
   * Constructs an individual round with dual independent Fisher-Yates shuffled columns.
   */
  private buildRound(
    roundIndex: number,
    totalRounds: number,
    cards: GenerateCardSource[],
  ): MatchingRoundDto {
    const wordTiles: MatchingCardItemDto[] = cards.map((card) => ({
      id: `tile_w_${card.id}`,
      cardId: card.id,
      text: card.word,
      type: 'WORD',
      phonetic: card.phonetic || null,
      audioUrl: card.audioUrl || null,
    }));

    const meaningTiles: MatchingCardItemDto[] = cards.map((card) => ({
      id: `tile_m_${card.id}`,
      cardId: card.id,
      text: card.meaning,
      type: 'MEANING',
      phonetic: null,
      audioUrl: null,
    }));

    const shuffledWordTiles = this.shuffle(wordTiles);
    const shuffledMeaningTiles = this.shuffle(meaningTiles);

    return {
      roundIndex,
      totalRounds,
      wordTiles: shuffledWordTiles,
      meaningTiles: shuffledMeaningTiles,
      columnA: shuffledWordTiles,
      columnB: shuffledMeaningTiles,
    };
  }

  /**
   * Fisher-Yates array shuffling algorithm.
   */
  private shuffle<T>(array: T[]): T[] {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }
}
