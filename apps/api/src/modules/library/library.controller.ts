import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { LibraryService } from './library.service';
import { ForkOfficialCardDto } from './dto/fork-official-card.dto';
import { GetOfficialDecksDto } from './dto/get-official-decks.dto';
import { TriageDeckCardsDto } from './dto/triage-deck-cards.dto';
import { CreateCardFeedbackDto } from './dto/create-card-feedback.dto';
import { GetFeedbacksQueryDto } from './dto/get-feedbacks-query.dto';
import { UpdateOfficialCardDto } from './dto/update-official-card.dto';
import type {
  ForkOfficialCardResponse,
  JwtPayload,
  PaginatedOfficialDecksResponse,
  OfficialDeckDetailResponse,
  EnrollOfficialDeckResponse,
  TriageDeckCardsResponse,
  ToeicPathProgressResponse,
  CardFeedbackResponse,
  PaginatedOfficialCardFeedbacksResponse,
  UpdateOfficialCardResponse,
  LibraryAnalyticsSummaryResponse,
} from '@wordstreak/shared-types';

@Controller('library')
@UseGuards(JwtAuthGuard)
export class LibraryController {
  constructor(private readonly libraryService: LibraryService) {}

  @Get('decks')
  async getDecks(
    @CurrentUser() user: JwtPayload,
    @Query() query: GetOfficialDecksDto,
  ): Promise<PaginatedOfficialDecksResponse> {
    return this.libraryService.getDecks(user?.sub, query);
  }

  @Get('paths/toeic/progress')
  async getToeicPathProgress(
    @CurrentUser() user: JwtPayload,
  ): Promise<ToeicPathProgressResponse> {
    return this.libraryService.getToeicPathProgress(user.sub);
  }

  @Get('decks/:slug')
  async getDeckBySlug(
    @CurrentUser() user: JwtPayload,
    @Param('slug') slug: string,
  ): Promise<OfficialDeckDetailResponse> {
    return this.libraryService.getDeckBySlug(user?.sub, slug);
  }

  @Post('decks/:id/enroll')
  @HttpCode(HttpStatus.OK)
  async enrollDeck(
    @CurrentUser() user: JwtPayload,
    @Param('id') deckId: string,
  ): Promise<EnrollOfficialDeckResponse> {
    return this.libraryService.enrollDeck(user.sub, deckId);
  }

  @Post('decks/:id/triage')
  @HttpCode(HttpStatus.OK)
  async triageDeckCards(
    @CurrentUser() user: JwtPayload,
    @Param('id') deckId: string,
    @Body() dto: TriageDeckCardsDto,
  ): Promise<TriageDeckCardsResponse> {
    return this.libraryService.triageDeckCards(user.sub, deckId, dto);
  }

  @Post('cards/:id/fork')
  @HttpCode(HttpStatus.CREATED)
  async forkCard(
    @CurrentUser() user: JwtPayload,
    @Param('id') cardId: string,
    @Body() dto: ForkOfficialCardDto,
  ): Promise<ForkOfficialCardResponse> {
    return this.libraryService.forkCard(user.sub, cardId, dto);
  }

  @Post('cards/:id/feedback')
  @HttpCode(HttpStatus.CREATED)
  async submitCardFeedback(
    @CurrentUser() user: JwtPayload,
    @Param('id') cardId: string,
    @Body() dto: CreateCardFeedbackDto,
  ): Promise<CardFeedbackResponse> {
    return this.libraryService.submitCardFeedback(user.sub, cardId, dto);
  }

  @Get('admin/feedback')
  async getFeedbacks(
    @Query() query: GetFeedbacksQueryDto,
  ): Promise<PaginatedOfficialCardFeedbacksResponse> {
    return this.libraryService.getFeedbacks(query);
  }

  @Patch('admin/cards/:id')
  async updateOfficialCard(
    @Param('id') cardId: string,
    @Body() dto: UpdateOfficialCardDto,
  ): Promise<UpdateOfficialCardResponse> {
    return this.libraryService.updateOfficialCard(cardId, dto);
  }

  @Get('admin/analytics')
  async getLibraryAnalytics(): Promise<LibraryAnalyticsSummaryResponse> {
    return this.libraryService.getLibraryAnalytics();
  }
}
