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
} from '@nestjs/common';
import { CardsService } from './cards.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { CreateCardDto } from './dto/create-card.dto';
import { UpdateCardDto } from './dto/update-card.dto';
import { QueryCardsDto } from './dto/query-cards.dto';
import { BulkCardActionDto } from './dto/bulk-card-action.dto';
import type {
  JwtPayload,
  CardResponse,
  PaginatedCardsResponse,
  BulkCardActionResult,
} from '@wordstreak/shared-types';

@Controller()
@UseGuards(JwtAuthGuard)
export class CardsController {
  constructor(private readonly cardsService: CardsService) {}

  @Post('decks/:deckId/cards')
  async create(
    @CurrentUser() user: JwtPayload,
    @Param('deckId') deckId: string,
    @Body() dto: CreateCardDto,
  ): Promise<CardResponse> {
    return this.cardsService.create(user.sub, deckId, dto);
  }

  @Get('decks/:deckId/cards')
  async findAllByDeck(
    @CurrentUser() user: JwtPayload,
    @Param('deckId') deckId: string,
    @Query() query?: QueryCardsDto,
  ): Promise<PaginatedCardsResponse> {
    return this.cardsService.findAllByDeck(user.sub, deckId, query);
  }

  @Post('decks/:deckId/cards/bulk-action')
  @HttpCode(HttpStatus.OK)
  async bulkAction(
    @CurrentUser() user: JwtPayload,
    @Param('deckId') deckId: string,
    @Body() dto: BulkCardActionDto,
  ): Promise<BulkCardActionResult> {
    return this.cardsService.bulkAction(user.sub, deckId, dto);
  }

  @Get('cards/:id')
  async findOne(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
  ): Promise<CardResponse> {
    return this.cardsService.findOne(user.sub, id);
  }

  @Patch('cards/:id')
  async update(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() dto: UpdateCardDto,
  ): Promise<CardResponse> {
    return this.cardsService.update(user.sub, id, dto);
  }

  @Delete('cards/:id')
  @HttpCode(HttpStatus.OK)
  async remove(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
  ): Promise<{ message: string; deletedCardId: string }> {
    return this.cardsService.remove(user.sub, id);
  }
}
