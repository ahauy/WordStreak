import { IsEnum, IsOptional } from 'class-validator';
import type {
  DeckExportQueryDto as IDeckExportQueryDto,
  ExportFormat,
  ExportMasteryFilter,
} from '@wordstreak/shared-types';

export class DeckExportQueryDto implements IDeckExportQueryDto {
  @IsEnum(['CSV', 'APKG', 'csv', 'apkg'])
  @IsOptional()
  format?: ExportFormat;

  @IsEnum(['ALL', 'MASTERED', 'LEARNING', 'NEW'])
  @IsOptional()
  status?: ExportMasteryFilter;
}
