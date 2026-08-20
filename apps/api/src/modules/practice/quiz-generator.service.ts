import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import type {
  QuizQuestionDto,
  QuizOptionDto,
  QuizQuestionFormat,
} from '@wordstreak/shared-types';

interface GenerateOptions {
  deckId: string;
  limit?: number;
}

@Injectable()
export class QuizGeneratorService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Generates a randomized list of 4-choice questions from the specified deck.
   */
  async generateQuestions(
    userId: string,
    options: GenerateOptions,
  ): Promise<QuizQuestionDto[]> {
    const { deckId, limit = 10 } = options;

    // 1. Fetch deck and verify accessibility
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

    // 2. Fetch all user cards for distractor fallback pooling
    let poolCards = deckCards;
    if (deckCards.length < 4) {
      const allUserCards = await this.prisma.card.findMany({
        where: {
          deck: {
            userId,
            isArchived: false,
          },
        },
      });

      if (allUserCards.length < 4) {
        throw new BadRequestException(
          'At least 4 cards across your decks are required to generate multiple choice options',
        );
      }
      poolCards = allUserCards;
    }

    // 3. Shuffle cards and pick up to limit questions
    const shuffledDeckCards = this.shuffle([...deckCards]);
    const targetCards = shuffledDeckCards.slice(0, limit);

    // 4. Generate balanced 4-choice question for each card
    return targetCards.map((card, index) => {
      // 50/50 format: even index -> EN_TO_VI, odd index -> VI_TO_EN
      const format: QuizQuestionFormat =
        index % 2 === 0 ? 'EN_TO_VI' : 'VI_TO_EN';

      const questionOptions = this.generateDistractors(card, poolCards, format);

      let prompt = '';
      let phonetic: string | null | undefined = null;
      let audioUrl: string | null | undefined = null;
      let exampleContext: string | null | undefined = null;

      if (format === 'EN_TO_VI') {
        prompt = card.word;
        phonetic = card.phonetic;
        audioUrl = card.audioUrl;
      } else {
        prompt = card.meaning;
        if (card.exampleSentence) {
          exampleContext = this.maskWordInSentence(
            card.exampleSentence,
            card.word,
          );
        }
      }

      return {
        id: `q_${card.id}_${index}`,
        cardId: card.id,
        format,
        prompt,
        phonetic,
        audioUrl,
        exampleContext,
        options: questionOptions,
      };
    });
  }

  /**
   * Generates 4 options: 1 correct option and 3 unique distractor options.
   */
  private generateDistractors(
    correctCard: { id: string; word: string; meaning: string },
    poolCards: Array<{ id: string; word: string; meaning: string }>,
    format: QuizQuestionFormat,
  ): QuizOptionDto[] {
    const isEnToVi = format === 'EN_TO_VI';
    const correctText = isEnToVi ? correctCard.meaning : correctCard.word;

    // Filter candidate cards that are distinct from correct card and have non-duplicate text
    const candidates = poolCards.filter(
      (c) =>
        c.id !== correctCard.id &&
        (isEnToVi ? c.meaning : c.word).trim().toLowerCase() !==
          correctText.trim().toLowerCase(),
    );

    // Deduplicate candidates by text
    const uniqueCandidatesMap = new Map<string, (typeof poolCards)[0]>();
    for (const cand of candidates) {
      const textKey = (isEnToVi ? cand.meaning : cand.word)
        .trim()
        .toLowerCase();
      if (!uniqueCandidatesMap.has(textKey)) {
        uniqueCandidatesMap.set(textKey, cand);
      }
    }

    const uniqueCandidates = Array.from(uniqueCandidatesMap.values());
    const shuffledDistractors = this.shuffle(uniqueCandidates).slice(0, 3);

    const distractorOptions: QuizOptionDto[] = shuffledDistractors.map(
      (cand, idx) => ({
        id: `opt_dist_${cand.id}_${idx}`,
        text: isEnToVi ? cand.meaning : cand.word,
        isCorrect: false,
      }),
    );

    const correctOption: QuizOptionDto = {
      id: `opt_corr_${correctCard.id}`,
      text: correctText,
      isCorrect: true,
    };

    return this.shuffle([correctOption, ...distractorOptions]);
  }

  /**
   * Masks occurrences of target word in example sentence.
   */
  private maskWordInSentence(sentence: string, word: string): string {
    const escapedWord = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`\\b${escapedWord}\\b`, 'gi');
    return sentence.replace(regex, '_____');
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
