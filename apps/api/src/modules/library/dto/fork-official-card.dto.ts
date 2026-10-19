import { IsOptional, IsString } from 'class-validator';

export class ForkOfficialCardDto {
  @IsOptional()
  @IsString()
  targetDeckId?: string;
}
