import {
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import type { OfficialCardFeedbackReason } from '@wordstreak/shared-types';

const VALID_REASONS: OfficialCardFeedbackReason[] = [
  'WRONG_MEANING',
  'TYPO',
  'AUDIO_ERROR',
  'EXAMPLE_UNNATURAL',
  'OTHER',
];

export class CreateCardFeedbackDto {
  @IsNotEmpty()
  @IsIn(VALID_REASONS, {
    message: `reason must be one of: ${VALID_REASONS.join(', ')}`,
  })
  reason!: OfficialCardFeedbackReason;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  comment?: string;
}
