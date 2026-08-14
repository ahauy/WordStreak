import { IsOptional, IsString, MinLength } from 'class-validator';
import { LoginDto as ILoginDto } from '@wordstreak/shared-types';

export class LoginDto implements ILoginDto {
  @IsString({ message: 'Email or username is required' })
  @MinLength(1, { message: 'Email or username cannot be empty' })
  identifier!: string;

  @IsOptional()
  @IsString()
  email?: string;

  @IsString({ message: 'Password must be a string' })
  @MinLength(1, { message: 'Password is required' })
  password!: string;
}
