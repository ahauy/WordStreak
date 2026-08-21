import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDeckDto } from './dto/create-deck.dto';
import { UpdateDeckDto } from './dto/update-deck.dto';
import { QueryDecksDto } from './dto/query-decks.dto';
import { BulkImportCardsDto } from './dto/bulk-import.dto';
import { DeckExportQueryDto } from './dto/export-deck.dto';
import type {
  DeckResponse,
  DeckStats,
  BulkImportCardsResult,
  BulkImportErrorItem,
  DeckExportCardItem,
  DeckExportDataResponse,
  ExportMasteryFilter,
} from '@wordstreak/shared-types';

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

  async bulkImportCards(
    userId: string,
    deckId: string,
    dto: BulkImportCardsDto,
  ): Promise<BulkImportCardsResult> {
    if (!dto.cards || !Array.isArray(dto.cards) || dto.cards.length === 0) {
      throw new BadRequestException('Danh sách thẻ không được để trống');
    }
    if (dto.cards.length > 2000) {
      throw new BadRequestException(
        'Số lượng thẻ vượt quá giới hạn tối đa (2000 thẻ)',
      );
    }

    let targetDeckId = deckId;
    if (dto.createAsNewDeck) {
      const createdDeck = await this.prisma.deck.create({
        data: {
          userId,
          title: dto.newDeckTitle?.trim() || 'Imported Deck',
        },
      });
      targetDeckId = createdDeck.id;
    } else {
      await this.verifyOwnership(userId, targetDeckId);
    }

    return this.prisma.$transaction(
      async (tx) => {
        const existingCards = await tx.card.findMany({
          where: { deckId: targetDeckId },
        });
        const existingCardsMap = new Map<string, (typeof existingCards)[0]>();
        for (const card of existingCards) {
          existingCardsMap.set(card.word.trim().toLowerCase(), card);
        }

        let imported = 0;
        let skipped = 0;
        let overwritten = 0;
        const errors: BulkImportErrorItem[] = [];

        for (let i = 0; i < dto.cards.length; i++) {
          const item = dto.cards[i];
          const rawWord = item.word?.trim();
          const rawMeaning = item.meaning?.trim();

          if (!rawWord || !rawMeaning) {
            errors.push({
              index: i + 1,
              word: rawWord || '',
              reason: 'Từ vựng và ý nghĩa không được để trống',
            });
            continue;
          }

          const word = this.sanitizeFormula(rawWord) || rawWord;
          const meaning = this.sanitizeFormula(rawMeaning) || rawMeaning;
          const normalizedWord = word.trim().toLowerCase();

          const cardData = {
            word,
            meaning,
            phonetic: this.sanitizeFormula(item.phonetic),
            exampleSentence: this.sanitizeFormula(item.exampleSentence),
            collocations: this.sanitizeFormula(item.collocations),
            mnemonic: this.sanitizeFormula(item.mnemonic),
            imageUrl: item.imageUrl?.trim() || null,
            audioUrl: item.audioUrl?.trim() || null,
          };

          const existing = existingCardsMap.get(normalizedWord);
          const action =
            item.rowConflictAction && item.rowConflictAction !== 'DEFAULT'
              ? item.rowConflictAction
              : item.conflictAction ||
                dto.conflictStrategy ||
                dto.defaultStrategy ||
                'SKIP';

          if (existing && action === 'SKIP') {
            skipped++;
            continue;
          }

          if (existing && action === 'OVERWRITE') {
            await tx.card.update({
              where: { id: existing.id },
              data: cardData,
            });
            overwritten++;
            continue;
          }

          // action === 'KEEP_BOTH' or not a duplicate
          const created = await tx.card.create({
            data: {
              deckId: targetDeckId,
              ...cardData,
            },
          });

          await tx.userCardProgress.create({
            data: {
              userId,
              cardId: created.id,
              status: 'NEW',
              interval: 0,
              easeFactor: 2.5,
              repetitions: 0,
              nextReviewDate: new Date(),
            },
          });

          if (!existing) {
            existingCardsMap.set(normalizedWord, created);
          }
          imported++;
        }

        return {
          success: true,
          deckId: targetDeckId,
          totalSubmitted: dto.cards.length,
          imported,
          skipped,
          overwritten,
          errors: errors.length > 0 ? errors : undefined,
          message: `Nhập thành công ${imported} thẻ, cập nhật ${overwritten} thẻ, bỏ qua ${skipped} thẻ.`,
        };
      },
      { timeout: 15000 },
    );
  }

  async exportDeck(
    userId: string,
    deckId: string,
    query: DeckExportQueryDto,
  ): Promise<{
    deck: DeckExportDataResponse['deck'];
    cards: DeckExportCardItem[];
    csvContent: string;
    content: string;
    format: string;
    filename: string;
  }> {
    const deck = await this.prisma.deck.findUnique({
      where: { id: deckId },
      include: {
        cards: {
          include: {
            progress: {
              where: { userId },
              select: {
                status: true,
                interval: true,
                repetitions: true,
              },
            },
          },
          orderBy: { createdAt: 'asc' },
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

    const filter =
      query.status || (query as { filter?: ExportMasteryFilter }).filter;
    const filteredCards = this.filterCardsByStatus(deck.cards, filter);

    const cardItems: DeckExportCardItem[] = filteredCards.map((c) => ({
      id: c.id,
      word: c.word,
      meaning: c.meaning,
      phonetic: c.phonetic,
      exampleSentence: c.exampleSentence,
      collocations: c.collocations,
      mnemonic: c.mnemonic,
      imageUrl: c.imageUrl,
      audioUrl: c.audioUrl,
      status: c.progress?.[0]?.status ?? 'NEW',
    }));

    const csvContent = this.buildCsvContent(cardItems);
    const safeTitle =
      deck.title.replace(/[^a-zA-Z0-9_\u00C0-\u1EF9-]/g, '_') || 'deck';
    const filename = `deck-${safeTitle}.csv`;

    return {
      deck: {
        id: deck.id,
        title: deck.title,
        description: deck.description,
        tags: this.parseTags(deck.tags),
        isPublic: deck.isPublic,
        totalCards: cardItems.length,
      },
      cards: cardItems,
      csvContent,
      content: csvContent,
      format: (query.format || 'CSV').toLowerCase(),
      filename,
    };
  }

  private sanitizeFormula(val?: string | null): string | null {
    if (!val) return val ?? null;
    const trimmed = val.trim();
    if (/^[=+\-@\t\r]/.test(trimmed)) {
      return trimmed.replace(/^[=+\-@\t\r]+/, '').trim();
    }
    return trimmed;
  }

  private escapeCsvCell(val?: string | null): string {
    if (val === null || val === undefined) return '';
    let str = String(val);
    if (/^[=+\-@\t\r]/.test(str)) {
      str = "'" + str;
    }
    if (/[",\n\r]/.test(str)) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  }

  private buildCsvContent(cards: DeckExportCardItem[]): string {
    const headers = [
      'Word',
      'Meaning',
      'Phonetic',
      'Example Sentence',
      'Collocations',
      'Mnemonic',
      'Image URL',
      'Audio URL',
      'Status',
    ];

    const rows = cards.map((card) =>
      [
        this.escapeCsvCell(card.word),
        this.escapeCsvCell(card.meaning),
        this.escapeCsvCell(card.phonetic),
        this.escapeCsvCell(card.exampleSentence),
        this.escapeCsvCell(card.collocations),
        this.escapeCsvCell(card.mnemonic),
        this.escapeCsvCell(card.imageUrl),
        this.escapeCsvCell(card.audioUrl),
        this.escapeCsvCell(card.status),
      ].join(','),
    );

    return '\uFEFF' + [headers.join(','), ...rows].join('\r\n');
  }

  private filterCardsByStatus(
    cards: Array<{
      id: string;
      word: string;
      meaning: string;
      phonetic: string | null;
      audioUrl: string | null;
      exampleSentence: string | null;
      collocations: string | null;
      mnemonic: string | null;
      imageUrl: string | null;
      progress?: Array<{
        status: string;
        interval: number;
        repetitions: number;
      }>;
    }>,
    status?: ExportMasteryFilter,
  ) {
    if (!status || status === 'ALL') {
      return cards;
    }
    if (status === 'MASTERED') {
      return cards.filter((c) => {
        const p = c.progress?.[0];
        return (
          p &&
          (p.status === 'MASTERED' || p.interval >= 21 || p.repetitions >= 5)
        );
      });
    }
    if (status === 'LEARNING') {
      return cards.filter((c) => {
        const p = c.progress?.[0];
        return (
          p &&
          (p.status === 'LEARNING' ||
            p.status === 'REVIEW' ||
            (p.status !== 'NEW' &&
              p.status !== 'MASTERED' &&
              p.interval < 21 &&
              p.repetitions < 5))
        );
      });
    }
    if (status === 'NEW') {
      return cards.filter((c) => {
        const p = c.progress?.[0];
        return !p || p.status === 'NEW';
      });
    }
    return cards;
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
    const parsedTags = this.parseTags(deck.tags);

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
