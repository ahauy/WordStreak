import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ForkOfficialCardDto } from './dto/fork-official-card.dto';
import { GetOfficialDecksDto } from './dto/get-official-decks.dto';
import { TriageDeckCardsDto } from './dto/triage-deck-cards.dto';
import { Prisma } from '@prisma/client';
import type {
  ForkOfficialCardResponse,
  OfficialCardContent,
  OfficialDeckDto,
  OfficialDeckCardItemDto,
  PaginatedOfficialDecksResponse,
  OfficialDeckDetailResponse,
  EnrollOfficialDeckResponse,
  TriageDeckCardsResponse,
  ToeicPathProgressResponse,
  ToeicLevelProgressDto,
  ToeicDeckProgressDto,
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

  /**
   * Triages official cards for a deck (marking known cards as KNOWN_SKIPPED so they are excluded
   * from SM-2 repetition queue but count towards vocabulary coverage).
   */
  async triageDeckCards(
    userId: string,
    deckId: string,
    dto: TriageDeckCardsDto,
  ): Promise<TriageDeckCardsResponse> {
    const deck = await this.prisma.officialDeck.findUnique({
      where: { id: deckId },
      include: {
        cards: { select: { cardId: true } },
      },
    });

    if (!deck) {
      throw new NotFoundException(`Official deck with ID ${deckId} not found`);
    }

    const validCardIds = new Set(deck.cards.map((c) => c.cardId));
    const items = dto.items.filter((item) => validCardIds.has(item.cardId));

    // Ensure enrollment exists
    await this.prisma.userDeckEnrollment.upsert({
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

    const knownItems = items.filter((item) => item.isKnown);
    const unknownItems = items.filter((item) => !item.isKnown);

    const operations: Prisma.PrismaPromise<unknown>[] = [];

    for (const item of knownItems) {
      operations.push(
        this.prisma.userOfficialCardProgress.upsert({
          where: {
            userId_cardId: { userId, cardId: item.cardId },
          },
          update: {
            status: 'KNOWN_SKIPPED',
            nextReviewDate: null,
          },
          create: {
            userId,
            cardId: item.cardId,
            status: 'KNOWN_SKIPPED',
            nextReviewDate: null,
            repetitions: 0,
            interval: 0,
            easeFactor: 2.5,
          },
        }),
      );
    }

    for (const item of unknownItems) {
      operations.push(
        this.prisma.userOfficialCardProgress.upsert({
          where: {
            userId_cardId: { userId, cardId: item.cardId },
          },
          update: {
            status: 'NEW',
            nextReviewDate: null,
          },
          create: {
            userId,
            cardId: item.cardId,
            status: 'NEW',
            nextReviewDate: null,
            repetitions: 0,
            interval: 0,
            easeFactor: 2.5,
          },
        }),
      );
    }

    if (operations.length > 0) {
      await this.prisma.$transaction(operations);
    }

    return {
      success: true,
      deckId,
      knownCount: knownItems.length,
      unknownCount: unknownItems.length,
      totalTriaged: items.length,
    };
  }

  /**
   * Retrieves TOEIC path overall progress, coverage percentage (NGSL max 94% + TSL max 4.5%),
   * completed decks count, and estimated days remaining based on daily goal.
   */
  async getToeicPathProgress(
    userId: string,
  ): Promise<ToeicPathProgressResponse> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { dailyGoal: true },
    });
    const dailyGoal = user?.dailyGoal || 10;

    // Fetch all TOEIC / TSL decks
    const decks = await this.prisma.officialDeck.findMany({
      where: {
        OR: [{ pathCode: 'TOEIC' }, { listCode: 'TSL' }],
      },
      orderBy: [{ level: 'asc' }, { order: 'asc' }],
      include: {
        cards: {
          select: { cardId: true },
        },
      },
    });

    const allCardIds = decks.flatMap((d) => d.cards.map((c) => c.cardId));

    // Get user progress on all cards in TOEIC decks
    const progresses = await this.prisma.userOfficialCardProgress.findMany({
      where: {
        userId,
        cardId: { in: allCardIds },
      },
      select: {
        cardId: true,
        status: true,
      },
    });

    const statusMap = new Map<string, string>();
    progresses.forEach((p) => statusMap.set(p.cardId, p.status));

    // Also get count of NGSL words mastered/known by user
    const ngslProgressCount = await this.prisma.userOfficialCardProgress.count({
      where: {
        userId,
        status: { in: ['MASTERED', 'KNOWN_SKIPPED'] },
        card: {
          deckCards: {
            some: {
              deck: { listCode: 'NGSL' },
            },
          },
        },
      },
    });

    const TOTAL_NGSL_WORDS = 2809;
    const TOTAL_TSL_WORDS = 1200;

    let totalMasteredInPath = 0;
    let totalKnownSkippedInPath = 0;
    let completedDecksCount = 0;

    const deckProgressDtos: ToeicDeckProgressDto[] = decks.map((deck) => {
      let masteredCount = 0;
      let knownSkippedCount = 0;
      let learningCount = 0;

      for (const c of deck.cards) {
        const s = statusMap.get(c.cardId);
        if (s === 'MASTERED') masteredCount++;
        else if (s === 'KNOWN_SKIPPED') knownSkippedCount++;
        else if (s === 'LEARNING') learningCount++;
      }

      totalMasteredInPath += masteredCount;
      totalKnownSkippedInPath += knownSkippedCount;

      const isCompleted =
        deck.cards.length > 0 &&
        masteredCount + knownSkippedCount >= deck.cards.length;
      if (isCompleted) {
        completedDecksCount++;
      }

      return {
        deckId: deck.id,
        slug: deck.slug,
        title: deck.title,
        titleVi: deck.titleVi,
        level: deck.level || 'T1',
        order: deck.order,
        totalCards: deck.cards.length,
        masteredCount,
        knownSkippedCount,
        learningCount,
        isCompleted,
      };
    });

    // Group into levels
    const levelConfigs = [
      {
        level: 'T1',
        title: 'Cơ bản - Nền tảng văn phòng (400 từ đầu)',
      },
      {
        level: 'T2',
        title: 'Trung cấp - Hoạt động thương mại (401-800)',
      },
      {
        level: 'T3',
        title: 'Nâng cao - Quản trị & Chiến lược (801-1200)',
      },
    ];

    const levels: ToeicLevelProgressDto[] = levelConfigs.map((cfg) => {
      const levelDecks = deckProgressDtos.filter((d) => d.level === cfg.level);
      const totalDecks = levelDecks.length;
      const completedDecks = levelDecks.filter((d) => d.isCompleted).length;
      const totalCards = levelDecks.reduce((sum, d) => sum + d.totalCards, 0);
      const learnedCards = levelDecks.reduce(
        (sum, d) => sum + d.masteredCount + d.knownSkippedCount,
        0,
      );
      const progressPercent =
        totalCards > 0
          ? Number(((learnedCards / totalCards) * 100).toFixed(1))
          : 0;

      return {
        level: cfg.level,
        title: cfg.title,
        totalDecks,
        completedDecks,
        totalCards,
        learnedCards,
        progressPercent,
        decks: levelDecks,
      };
    });

    // Coverage calculation: NGSL max 94.0%, TSL max 4.5%
    const ngslRatio = Math.min(1, ngslProgressCount / TOTAL_NGSL_WORDS);
    const ngslCoveragePercent = Number((ngslRatio * 94.0).toFixed(1));

    const tslLearnedCount = totalMasteredInPath + totalKnownSkippedInPath;
    const tslRatio = Math.min(
      1,
      tslLearnedCount / (allCardIds.length || TOTAL_TSL_WORDS),
    );
    const tslCoveragePercent = Number((tslRatio * 4.5).toFixed(1));

    const coveragePercent = Number(
      Math.min(98.5, ngslCoveragePercent + tslCoveragePercent).toFixed(1),
    );

    const totalWords = allCardIds.length || TOTAL_TSL_WORDS;
    const remainingWords = Math.max(0, totalWords - tslLearnedCount);
    const estimatedDaysRemaining = Math.ceil(
      remainingWords / Math.max(1, dailyGoal),
    );

    return {
      coveragePercent,
      ngslCoveragePercent,
      tslCoveragePercent,
      maxEstimatedCoverage: 98.5,
      totalDecks: decks.length,
      completedDecks: completedDecksCount,
      totalWords,
      masteredWords: totalMasteredInPath,
      knownSkippedWords: totalKnownSkippedInPath,
      estimatedDaysRemaining,
      dailyGoal,
      levels,
    };
  }
}
