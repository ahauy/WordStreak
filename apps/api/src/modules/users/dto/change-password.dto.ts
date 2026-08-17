import { IsString, Length, Matches } from 'class-validator';
import { ChangePasswordDto as IChangePasswordDto } from '@wordstreak/shared-types';

export class ChangePasswordDto implements IChangePasswordDto {
  @IsString({ message: 'Current password must be a string' })
  @Length(1, 100, { message: 'Current password is required' })
  currentPassword!: string;

  @IsString({ message: 'New password must be a string' })
  @Length(8, 100, {
    message: 'New password must be at least 8 characters long',
  })
  @Matches(/^(?=.*[A-Z])(?=.*\d)/, {
    message:
      'New password must contain at least 1 uppercase letter and 1 number',
  })
  newPassword!: string;
}
