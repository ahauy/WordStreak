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
import { DecksService } from './decks.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { CreateDeckDto } from './dto/create-deck.dto';
import { UpdateDeckDto } from './dto/update-deck.dto';
import { QueryDecksDto } from './dto/query-decks.dto';
import type { JwtPayload, DeckResponse } from '@wordstreak/shared-types';

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

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async remove(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
  ): Promise<{ message: string; deletedCardsCount: number }> {
    return this.decksService.remove(user.sub, id);
  }
}
