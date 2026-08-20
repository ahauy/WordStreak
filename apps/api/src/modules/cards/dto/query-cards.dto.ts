import { IsOptional, IsString, IsInt, Min, Max, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import type { CardStatusFilter } from '@wordstreak/shared-types';

export class QueryCardsDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Page phải là số nguyên' })
  @Min(1, { message: 'Page tối thiểu là 1' })
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Limit phải là số nguyên' })
  @Min(1, { message: 'Limit tối thiểu là 1' })
  @Max(100, { message: 'Limit tối đa là 100' })
  limit?: number = 20;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsEnum(['ALL', 'NEW', 'LEARNING', 'MASTERED'], {
    message: 'Trạng thái phải là ALL, NEW, LEARNING, hoặc MASTERED',
  })
  status?: CardStatusFilter = 'ALL';
}
