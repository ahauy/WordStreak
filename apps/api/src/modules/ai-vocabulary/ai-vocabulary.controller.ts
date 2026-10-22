import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AiVocabularyService } from './ai-vocabulary.service';
import { GenerateCardDto } from './dto/generate-card.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type {
  JwtPayload,
  GenerateCardResponseDto,
} from '@wordstreak/shared-types';

@Controller(['ai', 'v1/ai'])
@UseGuards(JwtAuthGuard)
export class AiVocabularyController {
  constructor(private readonly aiVocabularyService: AiVocabularyService) {}

  @Public()
  @Get('public/word/:word')
  async getPublicWord(@Param('word') word: string) {
    return this.aiVocabularyService.getPublicWord(word);
  }

  @Post('generate-card')
  @HttpCode(HttpStatus.OK)
  async generateCard(
    @CurrentUser() user: JwtPayload,
    @Body() dto: GenerateCardDto,
  ): Promise<GenerateCardResponseDto> {
    return this.aiVocabularyService.generateCard(dto, user.sub);
  }
}
