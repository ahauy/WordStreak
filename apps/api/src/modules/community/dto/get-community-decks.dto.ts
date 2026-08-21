import { IsOptional, IsString, IsEnum, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import type { CommunityDeckSort } from '@wordstreak/shared-types';

export class GetCommunityDecksDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsString()
  tag?: string;

  @IsOptional()
  @IsEnum(['POPULAR', 'TOP_RATED', 'NEWEST'], {
    message: 'sort must be one of POPULAR, TOP_RATED, NEWEST',
  })
  sort?: CommunityDeckSort = 'POPULAR';

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  limit?: number = 12;
}
