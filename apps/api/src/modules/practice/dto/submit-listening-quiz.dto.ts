import {
  IsNotEmpty,
  IsString,
  IsArray,
  ValidateNested,
  IsBoolean,
  IsOptional,
  IsInt,
  IsNumber,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';

export class ListeningAnswerSubmissionDto {
  @IsNotEmpty()
  @IsString()
  cardId!: string;

  @IsOptional()
  @IsString()
  submittedWord?: string;

  @IsBoolean()
  isCorrect!: boolean;

  @IsOptional()
  @IsInt()
  @Min(0)
  timeSpentMs?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(3)
  hintsUsed?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  replayCount?: number;

  @IsOptional()
  @IsNumber()
  audioSpeedUsed?: number;
}

export class SubmitListeningQuizDto {
  @IsNotEmpty()
  @IsString()
  deckId!: string;

  @IsOptional()
  @IsString()
  mode?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  totalQuestions?: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ListeningAnswerSubmissionDto)
  answers!: ListeningAnswerSubmissionDto[];
}
