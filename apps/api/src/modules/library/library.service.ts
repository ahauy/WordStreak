import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ForkOfficialCardDto } from './dto/fork-official-card.dto';
import type {
  ForkOfficialCardResponse,
  OfficialCardContent,
} from '@wordstreak/shared-types';

@Injectable()
export class LibraryService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Clones an OfficialCard into a user-owned custom Deck as an independent Card.
   */
  async forkCard(
    userId: string,
    officialCardId: string,
    dto: ForkOfficialCardDto = {},
  ): Promise<ForkOfficialCardResponse> {
    const officialCard = await this.prisma.officialCard.findUnique({
      where: { id: officialCardId },
    });

    if (!officialCard) {
      throw new NotFoundException(
        `Official card with ID ${officialCardId} not found`,
      );
    }

    let targetDeckId = dto.targetDeckId;

    if (targetDeckId) {
      const existingDeck = await this.prisma.deck.findFirst({
        where: { id: targetDeckId, userId, isArchived: false },
      });
      if (!existingDeck) {
        throw new NotFoundException('Target deck not found or access denied');
      }
    } else {
      const firstActiveDeck = await this.prisma.deck.findFirst({
        where: { userId, isArchived: false },
        orderBy: { createdAt: 'asc' },
      });

      if (firstActiveDeck) {
        targetDeckId = firstActiveDeck.id;
      } else {
        const createdDeck = await this.prisma.deck.create({
          data: {
            userId,
            title: 'My Library Cards',
            description: 'Cards forked from official library',
            color: '#6366F1',
            icon: 'Book',
          },
        });
        targetDeckId = createdDeck.id;
      }
    }

    const content =
      (officialCard.content as unknown as Partial<OfficialCardContent>) || {};
    const collocations = Array.isArray(content.collocations)
      ? content.collocations.join(', ')
      : typeof content.collocations === 'string'
        ? (content.collocations as string)
        : null;

    const newCard = await this.prisma.card.create({
      data: {
        deckId: targetDeckId,
        word: officialCard.headword,
        meaning: content.meaning_vi ?? officialCard.headword,
        phonetic: content.ipa_us ?? null,
        audioUrl: null,
        exampleSentence: content.example_en ?? null,
        collocations,
        mnemonic: content.tip_vi ?? null,
        progress: {
          create: {
            userId,
            interval: 0,
            repetitions: 0,
            easeFactor: 2.5,
            status: 'NEW',
            nextReviewDate: new Date(),
          },
        },
      },
    });

    return {
      cardId: newCard.id,
      deckId: targetDeckId,
      word: newCard.word,
      meaning: newCard.meaning,
      status: 'NEW',
    };
  }
}
