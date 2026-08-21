import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import type { ListeningQuestionDto } from '@wordstreak/shared-types';

interface GenerateOptions {
  deckId: string;
  limit?: number;
}

@Injectable()
export class ListeningGeneratorService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Generates a randomized list of listening & typing questions from the specified deck.
   */
  async generateQuestions(
    userId: string,
    options: GenerateOptions,
  ): Promise<ListeningQuestionDto[]> {
    const { deckId, limit = 10 } = options;

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

    const deckCards = deck.cards;
    if (deckCards.length === 0) {
      throw new BadRequestException('Deck has no cards to practice');
    }

    // Shuffle cards and take up to limit
    const shuffledCards = this.shuffle([...deckCards]);
    const targetCards = shuffledCards.slice(0, limit);

    return targetCards.map((card, index) => {
      const trimmedWord = card.word.trim();
      return {
        id: `lq_${card.id}_${index}`,
        cardId: card.id,
        word: card.word,
        phonetic: card.phonetic,
        meaning: card.meaning,
        audioUrl: card.audioUrl || null,
        wordLength: trimmedWord.length,
        firstLetterHint: trimmedWord.charAt(0).toLowerCase(),
      };
    });
  }

  /**
   * Fisher-Yates array shuffling.
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
