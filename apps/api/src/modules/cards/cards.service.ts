import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCardDto } from './dto/create-card.dto';
import { UpdateCardDto } from './dto/update-card.dto';
import { QueryCardsDto } from './dto/query-cards.dto';
import { BulkCardActionDto } from './dto/bulk-card-action.dto';
import type {
  CardResponse,
  CardProgressInfo,
  PaginatedCardsResponse,
  BulkCardActionResult,
} from '@wordstreak/shared-types';

interface CardWithProgress {
  id: string;
  deckId: string;
  word: string;
  meaning: string;
  phonetic: string | null;
  audioUrl: string | null;
  exampleSentence: string | null;
  collocations: string | null;
  mnemonic: string | null;
  imageUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
  progress?: Array<{
    status: string;
    interval: number;
    easeFactor: number;
    repetitions: number;
    nextReviewDate: Date;
    lastReviewedAt: Date | null;
  }>;
}

@Injectable()
export class CardsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    userId: string,
    deckId: string,
    dto: CreateCardDto,
  ): Promise<CardResponse> {
    const deck = await this.prisma.deck.findUnique({
      where: { id: deckId },
    });

    if (!deck) {
      throw new NotFoundException('Không tìm thấy bộ từ vựng');
    }

    if (deck.userId !== userId) {
      throw new ForbiddenException(
        'Bạn không có quyền thêm thẻ vào bộ từ vựng này',
      );
    }

    const { card, progress } = await this.prisma.$transaction(async (tx) => {
      const createdCard = await tx.card.create({
        data: {
          deckId,
          word: dto.word.trim(),
          meaning: dto.meaning.trim(),
          phonetic: dto.phonetic?.trim() || null,
          audioUrl: dto.audioUrl?.trim() || null,
          exampleSentence: dto.exampleSentence?.trim() || null,
          collocations: dto.collocations?.trim() || null,
          mnemonic: dto.mnemonic?.trim() || null,
          imageUrl: dto.imageUrl?.trim() || null,
        },
      });

      const initialProgress = await tx.userCardProgress.create({
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

      return { card: createdCard, progress: initialProgress };
    });

    return this.mapToResponse({
      ...card,
      progress: [progress],
    });
  }

  async findAllByDeck(
    userId: string,
    deckId: string,
    query?: QueryCardsDto,
  ): Promise<PaginatedCardsResponse> {
    const deck = await this.prisma.deck.findUnique({
      where: { id: deckId },
    });

    if (!deck) {
      throw new NotFoundException('Không tìm thấy bộ từ vựng');
    }

    if (deck.userId !== userId && !deck.isPublic) {
      throw new ForbiddenException(
        'Bạn không có quyền truy cập bộ từ vựng này',
      );
    }

    const page = Math.max(1, query?.page ?? 1);
    const limit = Math.min(100, Math.max(1, query?.limit ?? 20));
    const skip = (page - 1) * limit;

    const andConditions: Prisma.CardWhereInput[] = [{ deckId }];

    if (query?.search && query.search.trim()) {
      const term = query.search.trim();
      andConditions.push({
        OR: [
          { word: { contains: term, mode: 'insensitive' } },
          { meaning: { contains: term, mode: 'insensitive' } },
          { exampleSentence: { contains: term, mode: 'insensitive' } },
        ],
      });
    }

    if (query?.status && query.status !== 'ALL') {
      if (query.status === 'NEW') {
        andConditions.push({
          progress: {
            some: {
              userId,
              status: 'NEW',
            },
          },
        });
      } else if (query.status === 'LEARNING') {
        andConditions.push({
          progress: {
            some: {
              userId,
              status: { in: ['LEARNING', 'REVIEW'] },
            },
          },
        });
      } else if (query.status === 'MASTERED') {
        andConditions.push({
          progress: {
            some: {
              userId,
              status: 'MASTERED',
            },
          },
        });
      }
    }

    const whereClause: Prisma.CardWhereInput = { AND: andConditions };

    const [total, cards] = await Promise.all([
      this.prisma.card.count({ where: whereClause }),
      this.prisma.card.findMany({
        where: whereClause,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          progress: {
            where: { userId },
            select: {
              status: true,
              interval: true,
              easeFactor: true,
              repetitions: true,
              nextReviewDate: true,
              lastReviewedAt: true,
            },
          },
        },
      }),
    ]);

    const totalPages = Math.ceil(total / limit) || 1;

    return {
      data: cards.map((c) => this.mapToResponse(c)),
      meta: {
        total,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    };
  }

  async findOne(userId: string, id: string): Promise<CardResponse> {
    const card = await this.prisma.card.findUnique({
      where: { id },
      include: {
        deck: true,
        progress: {
          where: { userId },
          select: {
            status: true,
            interval: true,
            easeFactor: true,
            repetitions: true,
            nextReviewDate: true,
            lastReviewedAt: true,
          },
        },
      },
    });

    if (!card) {
      throw new NotFoundException('Không tìm thấy thẻ từ vựng');
    }

    if (card.deck.userId !== userId && !card.deck.isPublic) {
      throw new ForbiddenException(
        'Bạn không có quyền truy cập thẻ từ vựng này',
      );
    }

    return this.mapToResponse(card);
  }

  async update(
    userId: string,
    id: string,
    dto: UpdateCardDto,
  ): Promise<CardResponse> {
    await this.verifyCardOwnership(userId, id);

    const updated = await this.prisma.card.update({
      where: { id },
      data: {
        word: dto.word !== undefined ? dto.word.trim() : undefined,
        meaning: dto.meaning !== undefined ? dto.meaning.trim() : undefined,
        phonetic:
          dto.phonetic !== undefined ? dto.phonetic.trim() || null : undefined,
        audioUrl:
          dto.audioUrl !== undefined ? dto.audioUrl.trim() || null : undefined,
        exampleSentence:
          dto.exampleSentence !== undefined
            ? dto.exampleSentence.trim() || null
            : undefined,
        collocations:
          dto.collocations !== undefined
            ? dto.collocations.trim() || null
            : undefined,
        mnemonic:
          dto.mnemonic !== undefined ? dto.mnemonic.trim() || null : undefined,
        imageUrl:
          dto.imageUrl !== undefined ? dto.imageUrl.trim() || null : undefined,
      },
      include: {
        progress: {
          where: { userId },
          select: {
            status: true,
            interval: true,
            easeFactor: true,
            repetitions: true,
            nextReviewDate: true,
            lastReviewedAt: true,
          },
        },
      },
    });

    return this.mapToResponse(updated);
  }

  async remove(
    userId: string,
    id: string,
  ): Promise<{ message: string; deletedCardId: string }> {
    await this.verifyCardOwnership(userId, id);

    await this.prisma.card.delete({
      where: { id },
    });

    return {
      message: 'Thẻ từ vựng đã được xóa thành công',
      deletedCardId: id,
    };
  }

  async bulkAction(
    userId: string,
    deckId: string,
    dto: BulkCardActionDto,
  ): Promise<BulkCardActionResult> {
    if (dto.action === 'MOVE') {
      if (!dto.targetDeckId) {
        throw new BadRequestException('Vui lòng chọn bộ từ đích để di chuyển');
      }

      if (dto.targetDeckId === deckId) {
        throw new BadRequestException(
          'Bộ từ đích phải khác với bộ từ hiện tại',
        );
      }
    }

    const originDeck = await this.prisma.deck.findUnique({
      where: { id: deckId },
    });

    if (!originDeck) {
      throw new NotFoundException('Không tìm thấy bộ từ vựng nguồn');
    }

    if (originDeck.userId !== userId) {
      throw new ForbiddenException(
        'Bạn không có quyền thao tác trên bộ từ vựng này',
      );
    }

    // Verify all cards belong to origin deck
    const existingCards =
      (await this.prisma.card.findMany({
        where: {
          id: { in: dto.cardIds },
          deckId,
        },
        select: { id: true },
      })) || [];

    const validCardIds = existingCards.map((c) => c.id);
    if (validCardIds.length === 0) {
      return {
        success: true,
        action: dto.action,
        affectedCount: 0,
        message: 'Không tìm thấy thẻ hợp lệ để xử lý',
      };
    }

    if (dto.action === 'DELETE') {
      const result = await this.prisma.$transaction(async (tx) => {
        const deleted = await tx.card.deleteMany({
          where: { id: { in: validCardIds } },
        });
        return deleted.count;
      });

      return {
        success: true,
        action: 'DELETE',
        affectedCount: result,
        message: `Đã xóa thành công ${result} thẻ từ vựng`,
      };
    }

    if (dto.action === 'MOVE') {
      if (!dto.targetDeckId) {
        throw new BadRequestException('Vui lòng chọn bộ từ đích để di chuyển');
      }

      if (dto.targetDeckId === deckId) {
        throw new BadRequestException(
          'Bộ từ đích phải khác với bộ từ hiện tại',
        );
      }

      const targetDeck = await this.prisma.deck.findUnique({
        where: { id: dto.targetDeckId },
      });

      if (!targetDeck) {
        throw new NotFoundException('Không tìm thấy bộ từ đích');
      }

      if (targetDeck.userId !== userId) {
        throw new ForbiddenException('Bạn không sở hữu bộ từ đích');
      }

      const result = await this.prisma.$transaction(async (tx) => {
        const updated = await tx.card.updateMany({
          where: { id: { in: validCardIds } },
          data: { deckId: dto.targetDeckId! },
        });
        return updated.count;
      });

      return {
        success: true,
        action: 'MOVE',
        affectedCount: result,
        message: `Đã chuyển thành công ${result} thẻ sang "${targetDeck.title}"`,
      };
    }

    if (dto.action === 'RESET_PROGRESS') {
      const result = await this.prisma.$transaction(async (tx) => {
        const updated = await tx.userCardProgress.updateMany({
          where: {
            cardId: { in: validCardIds },
            userId,
          },
          data: {
            status: 'NEW',
            interval: 0,
            easeFactor: 2.5,
            repetitions: 0,
            nextReviewDate: new Date(),
            lastReviewedAt: null,
          },
        });
        return updated.count;
      });

      return {
        success: true,
        action: 'RESET_PROGRESS',
        affectedCount: result,
        message: `Đã đặt lại tiến độ học của ${result} thẻ về trạng thái Mới`,
      };
    }

    throw new BadRequestException('Hành động không được hỗ trợ');
  }

  private async verifyCardOwnership(userId: string, cardId: string) {
    const card = await this.prisma.card.findUnique({
      where: { id: cardId },
      include: { deck: true },
    });

    if (!card) {
      throw new NotFoundException('Không tìm thấy thẻ từ vựng');
    }

    if (card.deck.userId !== userId) {
      throw new ForbiddenException(
        'Bạn không có quyền thao tác trên thẻ từ vựng này',
      );
    }

    return card;
  }

  private mapToResponse(card: CardWithProgress): CardResponse {
    const rawProgress = card.progress?.[0];
    const progress: CardProgressInfo | null = rawProgress
      ? {
          status: rawProgress.status,
          interval: rawProgress.interval,
          easeFactor: rawProgress.easeFactor,
          repetitions: rawProgress.repetitions,
          nextReviewDate:
            rawProgress.nextReviewDate instanceof Date
              ? rawProgress.nextReviewDate.toISOString()
              : new Date(rawProgress.nextReviewDate).toISOString(),
          lastReviewedAt: rawProgress.lastReviewedAt
            ? rawProgress.lastReviewedAt instanceof Date
              ? rawProgress.lastReviewedAt.toISOString()
              : new Date(rawProgress.lastReviewedAt).toISOString()
            : null,
        }
      : null;

    return {
      id: card.id,
      deckId: card.deckId,
      word: card.word,
      meaning: card.meaning,
      phonetic: card.phonetic,
      audioUrl: card.audioUrl,
      exampleSentence: card.exampleSentence,
      collocations: card.collocations,
      mnemonic: card.mnemonic,
      imageUrl: card.imageUrl,
      createdAt:
        card.createdAt instanceof Date
          ? card.createdAt.toISOString()
          : new Date(card.createdAt).toISOString(),
      updatedAt:
        card.updatedAt instanceof Date
          ? card.updatedAt.toISOString()
          : new Date(card.updatedAt).toISOString(),
      progress,
    };
  }
}
