import { IsString, IsNotEmpty } from 'class-validator';
import type { LoginDto as ILoginDto } from '@wordstreak/shared-types';

export class LoginDto implements ILoginDto {
  @IsString()
  @IsNotEmpty()
  username!: string;

  @IsString()
  @IsNotEmpty()
  password!: string;
}
