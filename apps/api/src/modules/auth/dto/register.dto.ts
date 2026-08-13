import { IsString, Length, Matches } from 'class-validator';
import type { RegisterDto as IRegisterDto } from '@wordstreak/shared-types';

export class RegisterDto implements IRegisterDto {
  @IsString()
  @Length(3, 30, { message: 'Username must be between 3 and 30 characters long' })
  @Matches(/^[a-zA-Z0-9_]+$/, {
    message: 'Username can only contain letters, numbers, and underscores',
  })
  username!: string;

  @IsString()
  @Length(8, 72, { message: 'Password must be between 8 and 72 characters long' })
  password!: string;
}
