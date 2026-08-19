import { IsOptional, IsString, IsIn } from 'class-validator';
import { Transform } from 'class-transformer';

export class QueryDecksDto {
  @IsOptional()
  @IsString()
  @IsIn(['active', 'archived', 'all'])
  status?: 'active' | 'archived' | 'all' = 'active';

  @IsOptional()
  @IsString()
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  search?: string;

  @IsOptional()
  @IsString()
  @IsIn(['createdAt', 'title', 'cardCount'])
  sortBy?: 'createdAt' | 'title' | 'cardCount' = 'createdAt';

  @IsOptional()
  @IsString()
  @IsIn(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc' = 'desc';
}
