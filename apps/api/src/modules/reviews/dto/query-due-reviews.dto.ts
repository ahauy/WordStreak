import { IsOptional, IsUUID, IsInt, Min, Max, IsIn } from 'class-validator';
import { Type } from 'class-transformer';

export class QueryDueReviewsDto {
  @IsOptional()
  @IsUUID()
  deckId?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 50;

  @IsOptional()
  @IsIn(['express', 'standard'])
  mode?: 'express' | 'standard';
}
