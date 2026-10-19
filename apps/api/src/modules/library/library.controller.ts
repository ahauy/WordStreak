import {
  Controller,
  Get,
  Post,
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
import type {
  ForkOfficialCardResponse,
  JwtPayload,
  PaginatedOfficialDecksResponse,
  OfficialDeckDetailResponse,
  EnrollOfficialDeckResponse,
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

  @Post('cards/:id/fork')
  @HttpCode(HttpStatus.CREATED)
  async forkCard(
    @CurrentUser() user: JwtPayload,
    @Param('id') cardId: string,
    @Body() dto: ForkOfficialCardDto,
  ): Promise<ForkOfficialCardResponse> {
    return this.libraryService.forkCard(user.sub, cardId, dto);
  }
}
