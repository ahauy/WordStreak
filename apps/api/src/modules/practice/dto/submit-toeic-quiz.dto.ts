import {
  IsNotEmpty,
  IsString,
  IsArray,
  ValidateNested,
  IsBoolean,
  IsOptional,
  IsInt,
  Min,
  IsIn,
} from 'class-validator';
import { Type } from 'class-transformer';
import type {
  SubmitToeicQuizDto as ISubmitToeicQuizDto,
  SubmitToeicQuizAnswerDto as ISubmitToeicQuizAnswerDto,
  ToeicQuizType,
} from '@wordstreak/shared-types';

export class SubmitToeicQuizAnswerDto implements ISubmitToeicQuizAnswerDto {
  @IsNotEmpty()
  @IsString()
  cardId!: string;

  @IsOptional()
  @IsString()
  questionId?: string;

  @IsNotEmpty()
  @IsIn(['MINI_PART_5', 'WORD_FAMILY', 'PARAPHRASE', 'LISTENING_TYPING'])
  type!: ToeicQuizType;

  @IsBoolean()
  isCorrect!: boolean;

  @IsInt()
  @Min(0)
  timeSpentMs!: number;

  @IsOptional()
  @IsString()
  submittedAnswer?: string;
}

export class SubmitToeicQuizDto implements ISubmitToeicQuizDto {
  @IsOptional()
  @IsString()
  deckId?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SubmitToeicQuizAnswerDto)
  answers!: SubmitToeicQuizAnswerDto[];
}
