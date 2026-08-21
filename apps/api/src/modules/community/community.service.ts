import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { GetCommunityDecksDto } from './dto/get-community-decks.dto';
import { RateDeckDto } from './dto/rate-deck.dto';
import type {
  CommunityDeckItem,
  CommunityDeckDetailResponse,
  PaginatedCommunityDecksResponse,
  CloneDeckResponse,
  RateDeckResponse,
  PublicAuthorDto,
} from '@wordstreak/shared-types';
import type { Prisma } from '@prisma/client';

@Injectable()
export class CommunityService {
  constructor(private readonly prisma: PrismaService) {}

  async getPublicDecks(
    query: GetCommunityDecksDto,
    currentUserId?: string,
  ): Promise<PaginatedCommunityDecksResponse> {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.min(50, Math.max(1, Number(query.limit) || 12));
    const skip = (page - 1) * limit;

    const where: Prisma.DeckWhereInput = {
      isPublic: true,
      isArchived: false,
      cards: {
        some: {},
      },
    };

    if (query.category && query.category !== 'ALL') {
      where.OR = [
        { category: { equals: query.category, mode: 'insensitive' } },
        { tags: { contains: query.category, mode: 'insensitive' } },
      ];
    }

    if (query.tag) {
      where.tags = { contains: query.tag, mode: 'insensitive' };
    }

    if (query.search?.trim()) {
      const term = query.search.trim();
      where.AND = [
        {
          OR: [
            { title: { contains: term, mode: 'insensitive' } },
            { description: { contains: term, mode: 'insensitive' } },
            { tags: { contains: term, mode: 'insensitive' } },
            { user: { username: { contains: term, mode: 'insensitive' } } },
            { user: { email: { contains: term, mode: 'insensitive' } } },
          ],
        },
      ];
    }

    let orderBy: Prisma.DeckOrderByWithRelationInput[] = [
      { cloneCount: 'desc' },
      { totalRatings: 'desc' },
      { createdAt: 'desc' },
    ];

    if (query.sort === 'TOP_RATED') {
      orderBy = [
        { averageRating: 'desc' },
        { totalRatings: 'desc' },
        { cloneCount: 'desc' },
      ];
    } else if (query.sort === 'NEWEST') {
      orderBy = [{ createdAt: 'desc' }];
    }

    const [totalItems, decks] = await Promise.all([
      this.prisma.deck.count({ where }),
      this.prisma.deck.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              username: true,
              avatarUrl: true,
            },
          },
          _count: {
            select: {
              cards: true,
            },
          },
        },
      }),
    ]);

    const items: CommunityDeckItem[] = decks.map((deck) => ({
      id: deck.id,
      title: deck.title,
      description: deck.description,
      color: deck.color,
      icon: deck.icon,
      coverImageUrl: deck.coverImageUrl,
      category: deck.category,
      tags: this.parseTags(deck.tags),
      totalCards: deck._count.cards,
      cloneCount: deck.cloneCount,
      averageRating: deck.averageRating,
      totalRatings: deck.totalRatings,
      author: this.mapAuthor(deck.user),
      createdAt: deck.createdAt.toISOString(),
      updatedAt: deck.updatedAt.toISOString(),
      isOwner: currentUserId ? deck.userId === currentUserId : false,
    }));

    return {
      items,
      meta: {
        totalItems,
        itemCount: items.length,
        itemsPerPage: limit,
        totalPages: Math.ceil(totalItems / limit) || 1,
        currentPage: page,
      },
    };
  }

  async getPublicDeckDetail(
    deckId: string,
    currentUserId?: string,
  ): Promise<CommunityDeckDetailResponse> {
    const deck = await this.prisma.deck.findUnique({
      where: { id: deckId },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            avatarUrl: true,
          },
        },
        cards: {
          orderBy: { createdAt: 'asc' },
        },
        _count: {
          select: {
            cards: true,
          },
        },
      },
    });

    if (!deck || !deck.isPublic || deck.isArchived) {
      throw new NotFoundException('Không tìm thấy bộ từ vựng cộng đồng');
    }

    let userRating: CommunityDeckDetailResponse['userRating'] = null;
    let hasCloned = false;

    if (currentUserId) {
      const [rating, cloneCheck] = await Promise.all([
        this.prisma.deckRating.findUnique({
          where: {
            deckId_userId: {
              deckId,
              userId: currentUserId,
            },
          },
        }),
        this.prisma.deck.findFirst({
          where: {
            userId: currentUserId,
            originalDeckId: deckId,
            isArchived: false,
          },
          select: { id: true },
        }),
      ]);

      if (rating) {
        userRating = {
          rating: rating.rating,
          comment: rating.comment,
          createdAt: rating.createdAt.toISOString(),
        };
      }
      hasCloned = Boolean(cloneCheck);
    }

    const deckItem: CommunityDeckItem = {
      id: deck.id,
      title: deck.title,
      description: deck.description,
      color: deck.color,
      icon: deck.icon,
      coverImageUrl: deck.coverImageUrl,
      category: deck.category,
      tags: this.parseTags(deck.tags),
      totalCards: deck._count.cards,
      cloneCount: deck.cloneCount,
      averageRating: deck.averageRating,
      totalRatings: deck.totalRatings,
      author: this.mapAuthor(deck.user),
      createdAt: deck.createdAt.toISOString(),
      updatedAt: deck.updatedAt.toISOString(),
      isOwner: currentUserId ? deck.userId === currentUserId : false,
    };

    return {
      deck: deckItem,
      cards: deck.cards.map((c) => ({
        id: c.id,
        word: c.word,
        meaning: c.meaning,
        phonetic: c.phonetic,
        audioUrl: c.audioUrl,
        exampleSentence: c.exampleSentence,
        collocations: c.collocations,
        mnemonic: c.mnemonic,
      })),
      userRating,
      hasCloned,
    };
  }

  async cloneDeck(
    userId: string,
    targetDeckId: string,
  ): Promise<CloneDeckResponse> {
    const targetDeck = await this.prisma.deck.findUnique({
      where: { id: targetDeckId },
      include: {
        cards: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!targetDeck || !targetDeck.isPublic || targetDeck.isArchived) {
      throw new NotFoundException('Không tìm thấy bộ từ vựng cộng đồng');
    }

    if (targetDeck.userId === userId) {
      throw new BadRequestException(
        'Bạn không thể sao chép bộ từ của chính mình',
      );
    }

    const result = await this.prisma.$transaction(
      async (tx) => {
        const clonedTitle = `${targetDeck.title} (Bản sao)`;
        const clonedDeck = await tx.deck.create({
          data: {
            userId,
            title: clonedTitle,
            description: targetDeck.description,
            color: targetDeck.color,
            icon: targetDeck.icon,
            coverImageUrl: targetDeck.coverImageUrl,
            category: targetDeck.category,
            tags: targetDeck.tags,
            isPublic: false,
            isArchived: false,
            originalDeckId: targetDeck.id,
          },
        });

        for (const card of targetDeck.cards) {
          const createdCard = await tx.card.create({
            data: {
              deckId: clonedDeck.id,
              word: card.word,
              meaning: card.meaning,
              phonetic: card.phonetic,
              audioUrl: card.audioUrl,
              exampleSentence: card.exampleSentence,
              collocations: card.collocations,
              mnemonic: card.mnemonic,
              imageUrl: card.imageUrl,
            },
          });

          await tx.userCardProgress.create({
            data: {
              userId,
              cardId: createdCard.id,
              status: 'NEW',
              interval: 0,
              easeFactor: 2.5,
              repetitions: 0,
              nextReviewDate: new Date(),
            },
          });
        }

        await tx.deck.update({
          where: { id: targetDeckId },
          data: {
            cloneCount: { increment: 1 },
          },
        });

        return {
          clonedDeckId: clonedDeck.id,
          clonedDeckTitle: clonedTitle,
          totalCardsCloned: targetDeck.cards.length,
        };
      },
      { timeout: 15000 },
    );

    return {
      success: true,
      clonedDeckId: result.clonedDeckId,
      clonedDeckTitle: result.clonedDeckTitle,
      totalCardsCloned: result.totalCardsCloned,
      message: `Đã sao chép thành công bộ từ "${result.clonedDeckTitle}" (${result.totalCardsCloned} thẻ) vào thư viện cá nhân!`,
    };
  }

  async rateDeck(
    userId: string,
    deckId: string,
    dto: RateDeckDto,
  ): Promise<RateDeckResponse> {
    const deck = await this.prisma.deck.findUnique({
      where: { id: deckId },
      select: {
        id: true,
        userId: true,
        isPublic: true,
        isArchived: true,
      },
    });

    if (!deck || !deck.isPublic || deck.isArchived) {
      throw new NotFoundException('Không tìm thấy bộ từ vựng cộng đồng');
    }

    if (deck.userId === userId) {
      throw new ForbiddenException(
        'Tác giả không thể tự đánh giá bộ từ của mình',
      );
    }

    return this.prisma.$transaction(
      async (tx) => {
        const ratingRecord = await tx.deckRating.upsert({
          where: {
            deckId_userId: {
              deckId,
              userId,
            },
          },
          create: {
            deckId,
            userId,
            rating: dto.rating,
            comment: dto.comment?.trim() || null,
          },
          update: {
            rating: dto.rating,
            comment: dto.comment?.trim() || null,
          },
        });

        const allRatings = await tx.deckRating.findMany({
          where: { deckId },
          select: { rating: true },
        });

        const totalRatings = allRatings.length;
        const sum = allRatings.reduce((acc, r) => acc + r.rating, 0);
        const averageRating =
          totalRatings > 0 ? Math.round((sum / totalRatings) * 10) / 10 : 0.0;

        await tx.deck.update({
          where: { id: deckId },
          data: {
            averageRating,
            totalRatings,
          },
        });

        return {
          success: true,
          averageRating,
          totalRatings,
          userRating: {
            rating: ratingRecord.rating,
            comment: ratingRecord.comment,
          },
          message: 'Đánh giá bộ từ vựng thành công!',
        };
      },
      { timeout: 10000 },
    );
  }

  private mapAuthor(user: {
    id: string;
    username: string;
    avatarUrl: string | null;
  }): PublicAuthorDto {
    return {
      id: user.id,
      name: user.username,
      username: user.username,
      avatarUrl: user.avatarUrl,
    };
  }

  private parseTags(tags: string | null): string[] | null {
    if (!tags) return null;
    try {
      const parsed = JSON.parse(tags) as unknown;
      if (Array.isArray(parsed)) {
        return parsed.filter(
          (item): item is string => typeof item === 'string',
        );
      }
      return tags.split(',').map((t) => t.trim());
    } catch {
      return tags.split(',').map((t) => t.trim());
    }
  }
}
