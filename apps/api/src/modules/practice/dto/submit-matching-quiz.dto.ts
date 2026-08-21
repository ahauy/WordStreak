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

export class MatchingAnswerSubmissionDto {
  @IsNotEmpty()
  @IsString()
  cardId!: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  matchedInMs?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  responseTimeMs?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  attempts?: number;

  @IsOptional()
  @IsBoolean()
  isCorrectFirstTry?: boolean;

  @IsOptional()
  @IsString()
  termCardId?: string;

  @IsOptional()
  @IsString()
  definitionCardId?: string;

  @IsOptional()
  @IsBoolean()
  isCorrect?: boolean;
}

export class SubmitMatchingQuizDto {
  @IsNotEmpty()
  @IsString()
  deckId!: string;

  @IsOptional()
  @IsString()
  mode?: string;

  @IsOptional()
  @IsString()
  quizType?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  roundsCompleted?: number;

  @IsNotEmpty()
  @IsInt()
  @Min(1)
  totalPairs!: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  correctPairs?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  maxCombo?: number;

  @IsNotEmpty()
  @IsInt()
  @Min(0)
  totalTimeMs!: number;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MatchingAnswerSubmissionDto)
  answers?: MatchingAnswerSubmissionDto[];

  @IsOptional()
  roundDetails?: unknown;
}
