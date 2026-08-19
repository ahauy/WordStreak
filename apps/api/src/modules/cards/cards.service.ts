import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCardDto } from './dto/create-card.dto';
import { UpdateCardDto } from './dto/update-card.dto';
import type { CardResponse, CardProgressInfo } from '@wordstreak/shared-types';

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

  async findAllByDeck(userId: string, deckId: string): Promise<CardResponse[]> {
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

    const cards = await this.prisma.card.findMany({
      where: { deckId },
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
    });

    return cards.map((c) => this.mapToResponse(c));
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
