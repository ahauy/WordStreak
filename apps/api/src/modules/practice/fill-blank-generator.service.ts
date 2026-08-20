import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import type { FillBlankQuestionDto } from '@wordstreak/shared-types';

interface GenerateOptions {
  deckId: string;
  limit?: number;
}

@Injectable()
export class FillBlankGeneratorService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Generates a randomized list of fill-in-the-blank questions from the specified deck.
   */
  async generateQuestions(
    userId: string,
    options: GenerateOptions,
  ): Promise<FillBlankQuestionDto[]> {
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
      const masked = this.maskSentence(card);
      const scrambledLetters = this.generateAnagram(
        masked.targetInflection || masked.targetWord,
      );

      return {
        id: `fb_q_${card.id}_${index}`,
        cardId: card.id,
        sentenceWithBlank: masked.sentenceWithBlank,
        sentencePrefix: masked.sentencePrefix,
        sentenceSuffix: masked.sentenceSuffix,
        targetWord: masked.targetWord,
        targetInflection: masked.targetInflection,
        meaning: card.meaning,
        phonetic: card.phonetic,
        audioUrl: card.audioUrl,
        scrambledLetters,
        wordLength: (masked.targetInflection || masked.targetWord).length,
      };
    });
  }

  /**
   * Identifies target word or common inflections in exampleSentence and produces masked components.
   */
  private maskSentence(card: {
    word: string;
    meaning: string;
    exampleSentence?: string | null;
  }): {
    sentenceWithBlank: string;
    sentencePrefix: string;
    sentenceSuffix: string;
    targetWord: string;
    targetInflection?: string;
  } {
    const targetWord = card.word.trim();
    const sentence = card.exampleSentence?.trim();

    if (sentence) {
      const escapedWord = targetWord.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      // Match base word with standard regular inflections (-s, -es, -ed, -d, -ing, -ly)
      const regex = new RegExp(
        `\\b(${escapedWord}(?:s|es|ed|d|ing|ly)?)\\b`,
        'i',
      );
      const match = sentence.match(regex);

      if (match && match.index !== undefined) {
        const matchedToken = match[1];
        const prefix = sentence.slice(0, match.index);
        const suffix = sentence.slice(match.index + matchedToken.length);

        return {
          sentenceWithBlank: `${prefix}[ _____ ]${suffix}`,
          sentencePrefix: prefix,
          sentenceSuffix: suffix,
          targetWord,
          targetInflection: matchedToken,
        };
      }
    }

    // Graceful fallback for missing example sentence or non-matching sentence
    const prefix = `Complete the word: "${card.meaning}" `;
    const suffix = '';
    return {
      sentenceWithBlank: `${prefix}[ _____ ]${suffix}`,
      sentencePrefix: prefix,
      sentenceSuffix: suffix,
      targetWord,
      targetInflection: targetWord,
    };
  }

  /**
   * Generates randomized scrambled letter tiles (anagrams).
   */
  generateAnagram(word: string): string[] {
    const letters = word
      .replace(/[^a-zA-Z]/g, '')
      .toLowerCase()
      .split('');

    if (letters.length < 2) {
      return letters;
    }

    let shuffled = this.shuffle([...letters]);

    // Ensure shuffled result isn't identical to original word if there are multiple unique characters
    const hasMultipleUnique = new Set(letters).size > 1;
    if (hasMultipleUnique && shuffled.join('') === letters.join('')) {
      for (let i = 0; i < shuffled.length - 1; i++) {
        if (shuffled[i] !== shuffled[i + 1]) {
          [shuffled[i], shuffled[i + 1]] = [shuffled[i + 1], shuffled[i]];
          break;
        }
      }
    }

    return shuffled;
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
