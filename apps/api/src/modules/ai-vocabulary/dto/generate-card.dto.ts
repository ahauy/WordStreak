import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { GenerateCardRequestDto } from '@wordstreak/shared-types';

export class GenerateCardDto implements GenerateCardRequestDto {
  @IsString()
  @IsNotEmpty({ message: 'Từ vựng không được để trống' })
  @MaxLength(64, { message: 'Từ vựng không được vượt quá 64 ký tự' })
  word: string;
}
