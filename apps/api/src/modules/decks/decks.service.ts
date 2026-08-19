import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDeckDto } from './dto/create-deck.dto';
import { UpdateDeckDto } from './dto/update-deck.dto';
import { QueryDecksDto } from './dto/query-decks.dto';
import type { DeckResponse, DeckStats } from '@wordstreak/shared-types';

interface DeckWithCards {
  id: string;
  userId: string;
  title: string;
  description: string | null;
  color: string;
  icon: string;
  coverImageUrl: string | null;
  tags: string | null;
  isPublic: boolean;
  isArchived: boolean;
  createdAt: Date;
  updatedAt: Date;
  cards?: Array<{
    id: string;
    progress?: Array<{
      status: string;
      interval: number;
      repetitions: number;
      nextReviewDate: Date;
    }>;
  }>;
}

@Injectable()
export class DecksService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, dto: CreateDeckDto): Promise<DeckResponse> {
    const deck = await this.prisma.deck.create({
      data: {
        userId,
        title: dto.title,
        description: dto.description,
        color: dto.color ?? '#6366F1',
        icon: dto.icon ?? 'Book',
        coverImageUrl: dto.coverImageUrl,
        tags: dto.tags ? JSON.stringify(dto.tags) : null,
        isPublic: dto.isPublic ?? false,
      },
    });

    return this.mapToResponse(deck, {
      totalCards: 0,
      newCards: 0,
      learningCards: 0,
      masteredCards: 0,
      dueCards: 0,
    });
  }

  async findAll(userId: string, query: QueryDecksDto): Promise<DeckResponse[]> {
    const where: Record<string, unknown> = { userId };

    if (query.status === 'active') {
      where.isArchived = false;
    } else if (query.status === 'archived') {
      where.isArchived = true;
    }

    if (query.search) {
      where.OR = [
        { title: { contains: query.search, mode: 'insensitive' } },
        { description: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const orderBy: Record<string, string> = {};
    const sortOrder = query.sortOrder || 'desc';
    if (query.sortBy === 'title') {
      orderBy.title = sortOrder;
    } else {
      orderBy.createdAt = sortOrder;
    }

    const decks = await this.prisma.deck.findMany({
      where,
      orderBy,
      include: {
        cards: {
          select: {
            id: true,
            progress: {
              where: { userId },
              select: {
                status: true,
                interval: true,
                repetitions: true,
                nextReviewDate: true,
              },
            },
          },
        },
      },
    });

    const mapped = decks.map((deck) => {
      const stats = this.computeStats(deck.cards || []);
      return this.mapToResponse(deck, stats);
    });

    if (query.sortBy === 'cardCount') {
      mapped.sort((a, b) => {
        const countA = a.stats?.totalCards ?? 0;
        const countB = b.stats?.totalCards ?? 0;
        return sortOrder === 'asc' ? countA - countB : countB - countA;
      });
    }

    return mapped;
  }

  async findOne(userId: string, id: string): Promise<DeckResponse> {
    const deck = await this.prisma.deck.findUnique({
      where: { id },
      include: {
        cards: {
          select: {
            id: true,
            progress: {
              where: { userId },
              select: {
                status: true,
                interval: true,
                repetitions: true,
                nextReviewDate: true,
              },
            },
          },
        },
      },
    });

    if (!deck) {
      throw new NotFoundException('Không tìm thấy bộ từ vựng');
    }

    if (deck.userId !== userId && !deck.isPublic) {
      throw new ForbiddenException(
        'Bạn không có quyền truy cập bộ từ vựng này',
      );
    }

    const stats = this.computeStats(deck.cards || []);
    return this.mapToResponse(deck, stats);
  }

  async update(
    userId: string,
    id: string,
    dto: UpdateDeckDto,
  ): Promise<DeckResponse> {
    const existing = await this.prisma.deck.findUnique({
      where: { id },
      include: {
        cards: {
          select: {
            id: true,
            progress: {
              where: { userId },
              select: {
                status: true,
                interval: true,
                repetitions: true,
                nextReviewDate: true,
              },
            },
          },
        },
      },
    });

    if (!existing) {
      throw new NotFoundException('Không tìm thấy bộ từ vựng');
    }

    if (existing.userId !== userId) {
      throw new ForbiddenException(
        'Bạn không có quyền chỉnh sửa bộ từ vựng này',
      );
    }

    const updated = await this.prisma.deck.update({
      where: { id },
      data: {
        title: dto.title,
        description: dto.description,
        color: dto.color,
        icon: dto.icon,
        coverImageUrl: dto.coverImageUrl,
        tags: dto.tags !== undefined ? JSON.stringify(dto.tags) : undefined,
        isPublic: dto.isPublic,
      },
      include: {
        cards: {
          select: {
            id: true,
            progress: {
              where: { userId },
              select: {
                status: true,
                interval: true,
                repetitions: true,
                nextReviewDate: true,
              },
            },
          },
        },
      },
    });

    const stats = this.computeStats(updated.cards || []);
    return this.mapToResponse(updated, stats);
  }

  async archive(userId: string, id: string): Promise<DeckResponse> {
    await this.verifyOwnership(userId, id);

    const updated = await this.prisma.deck.update({
      where: { id },
      data: { isArchived: true },
      include: {
        cards: {
          select: {
            id: true,
            progress: {
              where: { userId },
              select: {
                status: true,
                interval: true,
                repetitions: true,
                nextReviewDate: true,
              },
            },
          },
        },
      },
    });

    const stats = this.computeStats(updated.cards || []);
    return this.mapToResponse(updated, stats);
  }

  async restore(userId: string, id: string): Promise<DeckResponse> {
    await this.verifyOwnership(userId, id);

    const updated = await this.prisma.deck.update({
      where: { id },
      data: { isArchived: false },
      include: {
        cards: {
          select: {
            id: true,
            progress: {
              where: { userId },
              select: {
                status: true,
                interval: true,
                repetitions: true,
                nextReviewDate: true,
              },
            },
          },
        },
      },
    });

    const stats = this.computeStats(updated.cards || []);
    return this.mapToResponse(updated, stats);
  }

  async remove(
    userId: string,
    id: string,
  ): Promise<{ message: string; deletedCardsCount: number }> {
    await this.verifyOwnership(userId, id);

    const cardsCount = await this.prisma.card.count({
      where: { deckId: id },
    });

    await this.prisma.deck.delete({
      where: { id },
    });

    return {
      message: 'Bộ từ vựng đã được xóa vĩnh viễn thành công',
      deletedCardsCount: cardsCount,
    };
  }

  private async verifyOwnership(userId: string, deckId: string) {
    const deck = await this.prisma.deck.findUnique({
      where: { id: deckId },
    });

    if (!deck) {
      throw new NotFoundException('Không tìm thấy bộ từ vựng');
    }

    if (deck.userId !== userId) {
      throw new ForbiddenException(
        'Bạn không có quyền thao tác trên bộ từ vựng này',
      );
    }

    return deck;
  }

  private computeStats(cards: NonNullable<DeckWithCards['cards']>): DeckStats {
    const now = new Date();
    let newCards = 0;
    let learningCards = 0;
    let masteredCards = 0;
    let dueCards = 0;

    for (const card of cards) {
      const progress = card.progress?.[0];
      if (!progress || progress.status === 'NEW') {
        newCards++;
      } else if (
        progress.status === 'MASTERED' ||
        progress.interval >= 21 ||
        progress.repetitions >= 5
      ) {
        masteredCards++;
      } else {
        learningCards++;
      }

      if (progress && new Date(progress.nextReviewDate) <= now) {
        dueCards++;
      }
    }

    return {
      totalCards: cards.length,
      newCards,
      learningCards,
      masteredCards,
      dueCards,
    };
  }

  private mapToResponse(deck: DeckWithCards, stats?: DeckStats): DeckResponse {
    let parsedTags: string[] | null = null;
    if (deck.tags) {
      try {
        parsedTags = JSON.parse(deck.tags);
      } catch {
        parsedTags = deck.tags.split(',').map((t) => t.trim());
      }
    }

    return {
      id: deck.id,
      userId: deck.userId,
      title: deck.title,
      description: deck.description,
      color: deck.color,
      icon: deck.icon,
      coverImageUrl: deck.coverImageUrl,
      tags: parsedTags,
      isPublic: deck.isPublic,
      isArchived: deck.isArchived,
      createdAt:
        deck.createdAt instanceof Date
          ? deck.createdAt.toISOString()
          : deck.createdAt
            ? new Date(deck.createdAt).toISOString()
            : new Date().toISOString(),
      updatedAt:
        deck.updatedAt instanceof Date
          ? deck.updatedAt.toISOString()
          : deck.updatedAt
            ? new Date(deck.updatedAt).toISOString()
            : new Date().toISOString(),
      stats,
    };
  }
}
