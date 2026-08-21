import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { CommunityService } from './community.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { GetCommunityDecksDto } from './dto/get-community-decks.dto';
import { RateDeckDto } from './dto/rate-deck.dto';
import type {
  JwtPayload,
  PaginatedCommunityDecksResponse,
  CommunityDeckDetailResponse,
  CloneDeckResponse,
  RateDeckResponse,
} from '@wordstreak/shared-types';

@Controller('community/decks')
@UseGuards(JwtAuthGuard)
export class CommunityController {
  constructor(private readonly communityService: CommunityService) {}

  @Public()
  @Get()
  async getPublicDecks(
    @Query() query: GetCommunityDecksDto,
    @CurrentUser() user: JwtPayload | null,
  ): Promise<PaginatedCommunityDecksResponse> {
    return this.communityService.getPublicDecks(query, user?.sub);
  }

  @Public()
  @Get(':id')
  async getPublicDeckDetail(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload | null,
  ): Promise<CommunityDeckDetailResponse> {
    return this.communityService.getPublicDeckDetail(id, user?.sub);
  }

  @Post(':id/clone')
  @HttpCode(HttpStatus.CREATED)
  async cloneDeck(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
  ): Promise<CloneDeckResponse> {
    return this.communityService.cloneDeck(user.sub, id);
  }

  @Post(':id/rate')
  @HttpCode(HttpStatus.OK)
  async rateDeck(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
    @Body() dto: RateDeckDto,
  ): Promise<RateDeckResponse> {
    return this.communityService.rateDeck(user.sub, id, dto);
  }
}
