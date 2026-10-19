import {
  Controller,
  Post,
  Param,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { LibraryService } from './library.service';
import { ForkOfficialCardDto } from './dto/fork-official-card.dto';
import type {
  ForkOfficialCardResponse,
  JwtPayload,
} from '@wordstreak/shared-types';

@Controller('library')
@UseGuards(JwtAuthGuard)
export class LibraryController {
  constructor(private readonly libraryService: LibraryService) {}

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
