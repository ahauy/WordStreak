import { IsOptional, IsString, IsInt, Min, Max, IsIn } from 'class-validator';
import { Type } from 'class-transformer';
import type {
  GetToeicQuizQueryDto,
  ToeicQuizType,
} from '@wordstreak/shared-types';

export class GetToeicQuizDto implements GetToeicQuizQueryDto {
  @IsOptional()
  @IsString()
  deckId?: string;

  @IsOptional()
  @IsString()
  pathCode?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  limit?: number = 10;

  @IsOptional()
  @IsIn(['MINI_PART_5', 'WORD_FAMILY', 'PARAPHRASE', 'LISTENING_TYPING'])
  type?: ToeicQuizType;
}
