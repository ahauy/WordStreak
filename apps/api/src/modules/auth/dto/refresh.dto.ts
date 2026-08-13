import { IsString, IsNotEmpty } from 'class-validator';
import type { RefreshTokenDto as IRefreshTokenDto } from '@wordstreak/shared-types';

export class RefreshTokenDto implements IRefreshTokenDto {
  @IsString()
  @IsNotEmpty()
  refreshToken!: string;
}
