import {
  IsEmail,
  IsOptional,
  IsString,
  Length,
  Matches,
  IsIn,
} from 'class-validator';
import type {
  RegisterDto as IRegisterDto,
  AppLanguage,
} from '@wordstreak/shared-types';

export class RegisterDto implements IRegisterDto {
  @IsEmail({}, { message: 'Invalid email address format' })
  email!: string;

  @IsString({ message: 'Username must be a string' })
  @Length(3, 30, { message: 'Username must be between 3 and 30 characters' })
  @Matches(/^[a-zA-Z0-9_]+$/, {
    message:
      'Username can only contain alphanumeric characters and underscores',
  })
  username!: string;

  @IsString({ message: 'Password must be a string' })
  @Length(8, 100, { message: 'Password must be at least 8 characters long' })
  @Matches(/^(?=.*[A-Z])(?=.*\d)/, {
    message: 'Password must contain at least 1 uppercase letter and 1 number',
  })
  password!: string;

  @IsOptional()
  @IsIn(['vi', 'en'], {
    message: 'preferredLanguage must be one of the following values: vi, en',
  })
  preferredLanguage?: AppLanguage;
}
