import {
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  Matches,
  IsIn,
} from 'class-validator';
import type {
  UpdateProfileDto as IUpdateProfileDto,
  AppLanguage,
} from '@wordstreak/shared-types';

export class UpdateProfileDto implements IUpdateProfileDto {
  @IsOptional()
  @IsInt({ message: 'dailyGoal must be an integer' })
  @Min(1, { message: 'dailyGoal must be at least 1' })
  @Max(100, { message: 'dailyGoal must not exceed 100' })
  dailyGoal?: number;

  @IsOptional()
  @IsString({ message: 'avatarUrl must be a string' })
  @MaxLength(500, { message: 'avatarUrl must not exceed 500 characters' })
  @Matches(/^(preset:[a-zA-Z0-9_-]+|https?:\/\/.+)$/, {
    message:
      'avatarUrl must be a valid preset identifier (preset:...) or HTTP(S) URL',
  })
  avatarUrl?: string;

  @IsOptional()
  @IsIn(['vi', 'en'], {
    message: 'preferredLanguage must be one of the following values: vi, en',
  })
  preferredLanguage?: AppLanguage;
}
