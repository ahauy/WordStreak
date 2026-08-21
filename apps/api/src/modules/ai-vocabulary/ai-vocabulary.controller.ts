import {
  Controller,
  Post,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AiVocabularyService } from './ai-vocabulary.service';
import { GenerateCardDto } from './dto/generate-card.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type {
  JwtPayload,
  GenerateCardResponseDto,
} from '@wordstreak/shared-types';

@Controller('ai')
@UseGuards(JwtAuthGuard)
export class AiVocabularyController {
  constructor(private readonly aiVocabularyService: AiVocabularyService) {}

  @Post('generate-card')
  @HttpCode(HttpStatus.OK)
  async generateCard(
    @CurrentUser() user: JwtPayload,
    @Body() dto: GenerateCardDto,
  ): Promise<GenerateCardResponseDto> {
    return this.aiVocabularyService.generateCard(dto, user.sub);
  }
}
