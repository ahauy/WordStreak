import { IsNotEmpty, IsUUID, IsInt, Min, Max } from 'class-validator';
import type { SrsRating } from '@wordstreak/shared-types';

export class SubmitReviewDto {
  @IsUUID()
  @IsNotEmpty()
  cardId: string;

  @IsInt()
  @Min(1)
  @Max(4)
  rating: SrsRating;
}
