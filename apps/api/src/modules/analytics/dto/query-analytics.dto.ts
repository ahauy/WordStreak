import { IsOptional, IsString, IsUUID } from 'class-validator';

export class QueryMasterySummaryDto {
  @IsOptional()
  @IsUUID()
  deckId?: string;
}

export class QueryHeatmapDto {
  @IsOptional()
  @IsString()
  timezone?: string;
}
