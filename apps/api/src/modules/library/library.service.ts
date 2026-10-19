import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ForkOfficialCardDto } from './dto/fork-official-card.dto';
import { GetOfficialDecksDto } from './dto/get-official-decks.dto';
import { Prisma } from '@prisma/client';
import type {
  ForkOfficialCardResponse,
  OfficialCardContent,
  OfficialDeckDto,
  OfficialDeckCardItemDto,
  PaginatedOfficialDecksResponse,
  OfficialDeckDetailResponse,
  EnrollOfficialDeckResponse,
} from '@wordstreak/shared-types';

@Injectable()
export class LibraryService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Retrieves official decks with filtering, pagination, and user enrollment/mastery status.
   */
  async getDecks(
    userId: string | undefined,
    query: GetOfficialDecksDto,
  ): Promise<PaginatedOfficialDecksResponse> {
    const page = Math.max(1, query.page || 1);
    const limit = Math.min(100, Math.max(1, query.limit || 20));
    const skip = (page - 1) * limit;

    const where: Prisma.OfficialDeckWhereInput = {};
    if (query.pathCode) {
      where.pathCode = query.pathCode;
    }
    if (query.level) {
      where.level = query.level;
    }
    if (query.topic) {
      where.OR = [
        { title: { contains: query.topic, mode: 'insensitive' } },
        { titleVi: { contains: query.topic, mode: 'insensitive' } },
        { description: { contains: query.topic, mode: 'insensitive' } },
      ];
    }

    const [total, rawDecks] = await Promise.all([
      this.prisma.officialDeck.count({ where }),
      this.prisma.officialDeck.findMany({
        where,
        orderBy: [{ order: 'asc' }, { createdAt: 'asc' }],
        skip,
        take: limit,
      }),
    ]);

    const enrolledDeckIds = new Set<string>();
    const masteredMap = new Map<string, number>();
    if (userId && rawDecks.length > 0) {
      const deckIds = rawDecks.map((d) => d.id);

      const enrollments = await this.prisma.userDeckEnrollment.findMany({
        where: {
          userId,
          deckId: { in: deckIds },
        },
        select: { deckId: true },
      });
      enrollments.forEach((e) => enrolledDeckIds.add(e.deckId));

      const deckCards = await this.prisma.officialDeckCard.findMany({
        where: { deckId: { in: deckIds } },
        select: { deckId: true, cardId: true },
      });
      const cardIds = deckCards.map((dc) => dc.cardId);
      const masteredProgresses =
        await this.prisma.userOfficialCardProgress.findMany({
          where: {
            userId,
            cardId: { in: cardIds },
            status: 'MASTERED',
          },
          select: { cardId: true },
        });
      const masteredCardSet = new Set(masteredProgresses.map((p) => p.cardId));
      for (const dc of deckCards) {
        if (masteredCardSet.has(dc.cardId)) {
          masteredMap.set(dc.deckId, (masteredMap.get(dc.deckId) || 0) + 1);
        }
      }
    }

    const decks: OfficialDeckDto[] = rawDecks.map((d) => ({
      id: d.id,
      slug: d.slug,
      title: d.title,
      titleVi: d.titleVi,
      description: d.description,
      pathCode: d.pathCode,
      level: d.level,
      order: d.order,
      listCode: d.listCode,
      cardCount: d.cardCount,
      isEnrolled: enrolledDeckIds.has(d.id),
      masteredCount: masteredMap.get(d.id) ?? 0,
    }));

    return {
      decks,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  /**
   * Retrieves official deck details by unique slug along with its card previews.
   */
  async getDeckBySlug(
    userId: string | undefined,
    slug: string,
  ): Promise<OfficialDeckDetailResponse> {
    const deck = await this.prisma.officialDeck.findUnique({
      where: { slug },
      include: {
        cards: {
          orderBy: { order: 'asc' },
          include: {
            card: true,
          },
        },
        enrollments: userId
          ? {
              where: { userId },
              select: { id: true },
            }
          : false,
      },
    });

    if (!deck) {
      throw new NotFoundException(
        `Official deck with slug "${slug}" not found`,
      );
    }

    const userProgressMap = new Map<string, string>();
    if (userId) {
      const cardIds = deck.cards.map((c) => c.cardId);
      const progresses = await this.prisma.userOfficialCardProgress.findMany({
        where: {
          userId,
          cardId: { in: cardIds },
        },
        select: { cardId: true, status: true },
      });
      progresses.forEach((p) => userProgressMap.set(p.cardId, p.status));
    }

    const cards: OfficialDeckCardItemDto[] = deck.cards.map((c) => ({
      cardId: c.cardId,
      order: c.order,
      headword: c.card.headword,
      pos: c.card.pos,
      content: c.card.content as unknown as OfficialCardContent,
      userStatus: userProgressMap.get(c.cardId) || null,
    }));

    const masteredCount = Array.from(userProgressMap.values()).filter(
      (s) => s === 'MASTERED',
    ).length;

    return {
      deck: {
        id: deck.id,
        slug: deck.slug,
        title: deck.title,
        titleVi: deck.titleVi,
        description: deck.description,
        pathCode: deck.pathCode,
        level: deck.level,
        order: deck.order,
        listCode: deck.listCode,
        cardCount: deck.cardCount,
        isEnrolled: userId ? (deck.enrollments?.length ?? 0) > 0 : false,
        masteredCount,
      },
      cards,
      isEnrolled: userId ? (deck.enrollments?.length ?? 0) > 0 : false,
      masteredCount,
      totalCards: cards.length,
    };
  }

  /**
   * Enrolls a user in an official deck.
   */
  async enrollDeck(
    userId: string,
    deckId: string,
  ): Promise<EnrollOfficialDeckResponse> {
    const deck = await this.prisma.officialDeck.findUnique({
      where: { id: deckId },
    });

    if (!deck) {
      throw new NotFoundException(`Official deck with ID ${deckId} not found`);
    }

    const enrollment = await this.prisma.userDeckEnrollment.upsert({
      where: {
        userId_deckId: { userId, deckId },
      },
      update: {
        lastStudiedAt: new Date(),
      },
      create: {
        userId,
        deckId,
      },
    });

    return {
      success: true,
      deckId,
      enrolledAt: enrollment.startedAt,
    };
  }

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
