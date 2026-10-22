import { IsIn, IsInt, IsOptional, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';
import type { OfficialCardFeedbackStatus } from '@wordstreak/shared-types';

const VALID_STATUSES: OfficialCardFeedbackStatus[] = [
  'OPEN',
  'RESOLVED',
  'REJECTED',
];

export class GetFeedbacksQueryDto {
  @IsOptional()
  @IsIn(VALID_STATUSES, {
    message: `status must be one of: ${VALID_STATUSES.join(', ')}`,
  })
  status?: OfficialCardFeedbackStatus;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;
}
