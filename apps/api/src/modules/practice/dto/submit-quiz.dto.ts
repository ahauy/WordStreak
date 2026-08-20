import {
  IsNotEmpty,
  IsString,
  IsArray,
  ValidateNested,
  IsBoolean,
  IsOptional,
  IsInt,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class QuizAnswerItemDto {
  @IsNotEmpty()
  @IsString()
  questionId!: string;

  @IsNotEmpty()
  @IsString()
  cardId!: string;

  @IsOptional()
  @IsString()
  selectedOptionId!: string | null;

  @IsBoolean()
  isCorrect!: boolean;

  @IsOptional()
  @IsInt()
  @Min(0)
  timeSpentMs!: number;
}

export class SubmitQuizDto {
  @IsNotEmpty()
  @IsString()
  deckId!: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  totalQuestions?: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => QuizAnswerItemDto)
  answers!: QuizAnswerItemDto[];
}
