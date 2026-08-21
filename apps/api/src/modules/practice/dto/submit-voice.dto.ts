import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
  IsIn,
} from 'class-validator';
import type {
  VoicePronunciationSubmitDto,
  VoiceEvaluationMode,
} from '@wordstreak/shared-types';

export class SubmitVoiceDto implements VoicePronunciationSubmitDto {
  @IsUUID('4', { message: 'cardId must be a valid UUID' })
  @IsNotEmpty({ message: 'cardId is required' })
  cardId: string;

  @IsString({ message: 'spokenTranscript must be a string' })
  @IsNotEmpty({ message: 'spokenTranscript is required' })
  spokenTranscript: string;

  @IsOptional()
  @IsNumber({}, { message: 'accuracyScore must be a number' })
  @Min(0, { message: 'accuracyScore cannot be less than 0' })
  @Max(100, { message: 'accuracyScore cannot be greater than 100' })
  accuracyScore?: number;

  @IsOptional()
  @IsString({ message: 'targetWord must be a string' })
  targetWord?: string;

  @IsOptional()
  @IsString({ message: 'accent must be a string' })
  @IsIn(['en-US', 'en-GB'], { message: 'accent must be en-US or en-GB' })
  accent?: string;

  @IsOptional()
  @IsNumber({}, { message: 'timeSpentMs must be a number' })
  @Min(0, { message: 'timeSpentMs cannot be negative' })
  timeSpentMs?: number;

  @IsOptional()
  @IsIn(['STRICT', 'LENIENT'], {
    message: 'evaluationMode must be STRICT or LENIENT',
  })
  evaluationMode?: VoiceEvaluationMode;
}

export type SubmitVoicePronunciationDto = SubmitVoiceDto;
export type SubmitVoicePracticeDto = SubmitVoiceDto;
