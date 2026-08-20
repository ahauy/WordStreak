import { IsOptional, IsString } from 'class-validator';
import type { RecordStreakActivityDto as IRecordStreakActivityDto } from '@wordstreak/shared-types';

export class RecordStreakActivityDto implements IRecordStreakActivityDto {
  @IsOptional()
  @IsString()
  timezone?: string;
}
