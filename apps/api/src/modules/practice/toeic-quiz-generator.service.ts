import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import type {
  ToeicQuizQuestionDto,
  ToeicQuizType,
  QuizOptionDto,
  OfficialCardContent,
} from '@wordstreak/shared-types';
import { GetToeicQuizDto } from './dto/get-toeic-quiz.dto';

interface CandidateCard {
  id: string;
  headword: string;
  pos: string;
  meaningVi: string;
  definitionEn?: string;
  exampleEn?: string;
  audioUrl?: string | null;
  phonetic?: string | null;
  confusables?: string[];
  wordFamily?: string[];
}

@Injectable()
export class ToeicQuizGeneratorService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Generates specialized TOEIC practice questions (Mini Part 5, Word Family, Paraphrase, Listening).
   */
  async generateQuestions(
    query: GetToeicQuizDto,
  ): Promise<ToeicQuizQuestionDto[]> {
    const { deckId, pathCode = 'TOEIC', limit = 10, type } = query;

    // 1. Fetch cards either from OfficialDeck or standard Deck
    const candidateCards = await this.fetchCandidateCards(deckId, pathCode);

    if (candidateCards.length === 0) {
      throw new BadRequestException(
        'No vocabulary cards found to generate TOEIC quiz',
      );
    }

    // 2. Select target cards up to limit
    const shuffledCards = this.shuffleArray([...candidateCards]);
    const selectedCards = shuffledCards.slice(
      0,
      Math.min(limit, shuffledCards.length),
    );

    // 3. Generate questions for each card
    const questions: ToeicQuizQuestionDto[] = [];
    const quizTypes: ToeicQuizType[] = [
      'MINI_PART_5',
      'WORD_FAMILY',
      'PARAPHRASE',
      'LISTENING_TYPING',
    ];

    selectedCards.forEach((card, index) => {
      const qType = type || quizTypes[index % quizTypes.length];
      const question = this.buildQuestion(card, qType, candidateCards);
      questions.push(question);
    });

    return questions;
  }

  /**
   * Fetches candidate cards from OfficialDeck or Deck.
   */
  private async fetchCandidateCards(
    deckId?: string,
    pathCode = 'TOEIC',
  ): Promise<CandidateCard[]> {
    if (deckId) {
      // Check OfficialDeck first
      const officialDeck = await this.prisma.officialDeck.findFirst({
        where: { OR: [{ id: deckId }, { slug: deckId }] },
        include: {
          cards: {
            include: { card: true },
            orderBy: { order: 'asc' },
          },
        },
      });

      if (officialDeck) {
        if (officialDeck.cards.length === 0) {
          throw new BadRequestException('Deck has no cards to practice');
        }
        return officialDeck.cards.map((odc) =>
          this.mapOfficialCardToCandidate(odc.card),
        );
      }

      // Fallback to custom Deck
      const customDeck = await this.prisma.deck.findUnique({
        where: { id: deckId },
        include: { cards: true },
      });

      if (customDeck) {
        if (customDeck.cards.length === 0) {
          throw new BadRequestException('Deck has no cards to practice');
        }
        return customDeck.cards.map((c) => ({
          id: c.id,
          headword: c.word,
          pos: 'unknown',
          meaningVi: c.meaning,
          exampleEn: c.exampleSentence || undefined,
          audioUrl: c.audioUrl,
          phonetic: c.phonetic,
          confusables: [],
          wordFamily: [],
        }));
      }

      throw new NotFoundException(`Deck with ID ${deckId} not found`);
    }

    // If no deckId provided, fetch all published official cards in the specified pathCode
    const officialCards = await this.prisma.officialCard.findMany({
      where: {
        deckCards: {
          some: {
            deck: { pathCode },
          },
        },
      },
      take: 100,
    });

    return officialCards.map((c) => this.mapOfficialCardToCandidate(c));
  }

  /**
   * Maps an OfficialCard database record into a CandidateCard.
   */
  private mapOfficialCardToCandidate(card: {
    id: string;
    headword: string;
    pos: string;
    content: any;
  }): CandidateCard {
    const content = (card.content as OfficialCardContent) || {};
    const confusables = Array.isArray(content.confusables)
      ? content.confusables.map((c) => (typeof c === 'string' ? c : c.word))
      : [];
    const wordFamily = Array.isArray(content.word_family)
      ? content.word_family
      : [];

    return {
      id: card.id,
      headword: card.headword,
      pos: card.pos || content.pos || 'n',
      meaningVi: content.meaning_vi || card.headword,
      definitionEn: content.definition_en,
      exampleEn: content.example_en || content.example_easy_en || undefined,
      audioUrl: null,
      phonetic: content.ipa_us,
      confusables,
      wordFamily,
    };
  }

  /**
   * Constructs a specific question type for a given card.
   */
  private buildQuestion(
    card: CandidateCard,
    type: ToeicQuizType,
    allCards: CandidateCard[],
  ): ToeicQuizQuestionDto {
    switch (type) {
      case 'MINI_PART_5':
        return this.buildMiniPart5Question(card, allCards);
      case 'WORD_FAMILY':
        return this.buildWordFamilyQuestion(card, allCards);
      case 'PARAPHRASE':
        return this.buildParaphraseQuestion(card, allCards);
      case 'LISTENING_TYPING':
      default:
        return this.buildListeningQuestion(card);
    }
  }

  /**
   * Builds a Mini Part 5 sentence completion question.
   */
  private buildMiniPart5Question(
    card: CandidateCard,
    allCards: CandidateCard[],
  ): ToeicQuizQuestionDto {
    const sentence =
      card.exampleEn || `The manager decided to ______ the project deadline.`;
    const regex = new RegExp(`\\b${this.escapeRegex(card.headword)}\\b`, 'gi');
    const sentenceWithBlank = regex.test(sentence)
      ? sentence.replace(regex, '______')
      : `${sentence} (Target: ______)`;

    // Priority 1 distractors: confusables
    const distractorCandidates =
      card.confusables && card.confusables.length > 0
        ? [...card.confusables]
        : [];

    // Priority 2 distractors: peer cards
    const peerDistractors = allCards
      .filter((c) => c.headword.toLowerCase() !== card.headword.toLowerCase())
      .map((c) => c.headword);

    const mergedDistractors = Array.from(
      new Set([...distractorCandidates, ...peerDistractors]),
    ).filter((w) => w.toLowerCase() !== card.headword.toLowerCase());

    const chosenDistractors = this.shuffleArray(mergedDistractors).slice(0, 3);

    // If still < 3 distractors, pad with dummy variations
    while (chosenDistractors.length < 3) {
      chosenDistractors.push(
        `${card.headword}_alt${chosenDistractors.length + 1}`,
      );
    }

    const options: QuizOptionDto[] = this.shuffleArray([
      { id: 'opt_correct', text: card.headword, isCorrect: true },
      ...chosenDistractors.map((dist, idx) => ({
        id: `opt_dist_${idx}`,
        text: dist,
        isCorrect: false,
      })),
    ]);

    return {
      id: `toeic_part5_${card.id}`,
      cardId: card.id,
      type: 'MINI_PART_5',
      prompt:
        'Complete the sentence with the most appropriate word (TOEIC Part 5 format):',
      sentence: sentenceWithBlank,
      targetWord: card.headword,
      vietnameseMeaning: card.meaningVi,
      phonetic: card.phonetic,
      options,
      explanation: `"${card.headword}" (${card.pos}) means "${card.meaningVi}".`,
    };
  }

  /**
   * Builds a Word Family morphological question.
   */
  private buildWordFamilyQuestion(
    card: CandidateCard,
    allCards: CandidateCard[],
  ): ToeicQuizQuestionDto {
    const sentence =
      card.exampleEn ||
      `Please provide the ______ requested by the department.`;
    const regex = new RegExp(`\\b${this.escapeRegex(card.headword)}\\b`, 'gi');
    const sentenceWithBlank = regex.test(sentence)
      ? sentence.replace(regex, '______')
      : `Complete the sentence with the correct form of "${card.headword}": ______`;

    const familyDerivations =
      card.wordFamily && card.wordFamily.length > 0
        ? card.wordFamily.filter(
            (w) => w.toLowerCase() !== card.headword.toLowerCase(),
          )
        : [];

    const peerWords = allCards
      .filter((c) => c.headword.toLowerCase() !== card.headword.toLowerCase())
      .map((c) => c.headword);

    const pool = Array.from(new Set([...familyDerivations, ...peerWords]));
    const distractors = this.shuffleArray(pool).slice(0, 3);

    while (distractors.length < 3) {
      distractors.push(`${card.headword}ly`);
    }

    const options: QuizOptionDto[] = this.shuffleArray([
      { id: 'opt_wf_correct', text: card.headword, isCorrect: true },
      ...distractors.map((d, i) => ({
        id: `opt_wf_${i}`,
        text: d,
        isCorrect: false,
      })),
    ]);

    return {
      id: `toeic_wf_${card.id}`,
      cardId: card.id,
      type: 'WORD_FAMILY',
      prompt: `Choose the correct word form for the blank in the sentence:`,
      sentence: sentenceWithBlank,
      targetWord: card.headword,
      vietnameseMeaning: card.meaningVi,
      phonetic: card.phonetic,
      options,
      explanation: `Correct form is "${card.headword}" (${card.pos}). Word family: ${[card.headword, ...familyDerivations].join(', ')}.`,
    };
  }

  /**
   * Builds a Paraphrase question in workplace context.
   */
  private buildParaphraseQuestion(
    card: CandidateCard,
    allCards: CandidateCard[],
  ): ToeicQuizQuestionDto {
    const distractorMeanings = allCards
      .filter((c) => c.headword.toLowerCase() !== card.headword.toLowerCase())
      .map((c) => c.meaningVi);

    const chosenDistractors = this.shuffleArray(
      Array.from(new Set(distractorMeanings)),
    ).slice(0, 3);

    while (chosenDistractors.length < 3) {
      chosenDistractors.push(
        `Ý nghĩa dự phòng ${chosenDistractors.length + 1}`,
      );
    }

    const options: QuizOptionDto[] = this.shuffleArray([
      { id: 'opt_para_correct', text: card.meaningVi, isCorrect: true },
      ...chosenDistractors.map((d, idx) => ({
        id: `opt_para_${idx}`,
        text: d,
        isCorrect: false,
      })),
    ]);

    return {
      id: `toeic_para_${card.id}`,
      cardId: card.id,
      type: 'PARAPHRASE',
      prompt: `What is the closest meaning of "${card.headword}" in business context?`,
      sentence: card.exampleEn ? `Context: "${card.exampleEn}"` : undefined,
      targetWord: card.headword,
      vietnameseMeaning: card.meaningVi,
      phonetic: card.phonetic,
      options,
      explanation: `"${card.headword}" means "${card.meaningVi}".`,
    };
  }

  /**
   * Builds a Listening/Typing practice question.
   */
  private buildListeningQuestion(card: CandidateCard): ToeicQuizQuestionDto {
    return {
      id: `toeic_listen_${card.id}`,
      cardId: card.id,
      type: 'LISTENING_TYPING',
      prompt:
        'Listen to the pronunciation and spell the target word correctly:',
      targetWord: card.headword,
      vietnameseMeaning: card.meaningVi,
      phonetic: card.phonetic,
      audioUrl: card.audioUrl,
      explanation: `Word: "${card.headword}" (${card.phonetic || ''}) - ${card.meaningVi}`,
    };
  }

  private shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  private escapeRegex(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
}
