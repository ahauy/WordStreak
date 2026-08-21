import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  Res,
} from '@nestjs/common';
import type { Response } from 'express';
import { DecksService } from './decks.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { CreateDeckDto } from './dto/create-deck.dto';
import { UpdateDeckDto } from './dto/update-deck.dto';
import { QueryDecksDto } from './dto/query-decks.dto';
import { BulkImportCardsDto } from './dto/bulk-import.dto';
import { DeckExportQueryDto } from './dto/export-deck.dto';
import type {
  JwtPayload,
  DeckResponse,
  BulkImportCardsResult,
} from '@wordstreak/shared-types';

@Controller('decks')
@UseGuards(JwtAuthGuard)
export class DecksController {
  constructor(private readonly decksService: DecksService) {}

  @Post()
  async create(
    @CurrentUser() user: JwtPayload,
    @Body() dto: CreateDeckDto,
  ): Promise<DeckResponse> {
    return this.decksService.create(user.sub, dto);
  }

  @Get()
  async findAll(
    @CurrentUser() user: JwtPayload,
    @Query() query: QueryDecksDto,
  ): Promise<DeckResponse[]> {
    return this.decksService.findAll(user.sub, query);
  }

  @Get(':id')
  async findOne(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
  ): Promise<DeckResponse> {
    return this.decksService.findOne(user.sub, id);
  }

  @Patch(':id')
  async update(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() dto: UpdateDeckDto,
  ): Promise<DeckResponse> {
    return this.decksService.update(user.sub, id, dto);
  }

  @Patch(':id/archive')
  async archive(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
  ): Promise<DeckResponse> {
    return this.decksService.archive(user.sub, id);
  }

  @Patch(':id/restore')
  async restore(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
  ): Promise<DeckResponse> {
    return this.decksService.restore(user.sub, id);
  }

  @Post(':id/cards/bulk')
  async bulkImport(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() dto: BulkImportCardsDto,
  ): Promise<BulkImportCardsResult> {
    return this.decksService.bulkImportCards(user.sub, id, dto);
  }

  @Get(':id/export')
  async exportDeck(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Query() query: DeckExportQueryDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.decksService.exportDeck(user.sub, id, query);
    const format = (query.format || 'CSV').toUpperCase();

    if (format === 'CSV') {
      const sanitizedTitle = (result.deck.title || 'deck')
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '-');
      const filename = `deck-${sanitizedTitle}.csv`;

      if (typeof res?.set === 'function') {
        res.set({
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="${filename}"`,
        });
      } else if (typeof res?.setHeader === 'function') {
        res.setHeader('Content-Type', 'text/csv; charset=utf-8');
        res.setHeader(
          'Content-Disposition',
          `attachment; filename="${filename}"`,
        );
      }
      return result.csvContent ?? result.content ?? '';
    }

    return {
      data: {
        deck: result.deck,
        cards: result.cards,
      },
    };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async remove(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
  ): Promise<{ message: string; deletedCardsCount: number }> {
    return this.decksService.remove(user.sub, id);
  }
}
