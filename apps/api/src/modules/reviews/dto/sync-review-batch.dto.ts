import {
  IsArray,
  IsInt,
  IsISO8601,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
  ArrayMaxSize,
  ArrayMinSize,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import type { ReviewRating } from '@wordstreak/shared-types';

export class SyncReviewItemDto {
  @IsUUID('4', { message: 'idempotencyKey must be a valid UUID v4' })
  idempotencyKey!: string;

  @IsUUID('4', { message: 'cardId must be a valid UUID v4' })
  cardId!: string;

  @IsInt()
  @Min(1)
  @Max(4)
  rating!: ReviewRating;

  @IsInt()
  @Min(0)
  interval!: number;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(1.3)
  easeFactor!: number;

  @IsInt()
  @Min(0)
  repetitions!: number;

  @IsISO8601(
    {},
    { message: 'reviewedAtClient must be a valid ISO-8601 string' },
  )
  reviewedAtClient!: string;
}

export class SyncReviewBatchDto {
  @IsString()
  @IsOptional()
  clientTimezone?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SyncReviewItemDto)
  @ArrayMinSize(1)
  @ArrayMaxSize(100)
  reviews!: SyncReviewItemDto[];
}
