import { IsObject, IsOptional, IsString } from 'class-validator';
import type { OfficialCardContent } from '@wordstreak/shared-types';

export class UpdateOfficialCardDto {
  @IsOptional()
  @IsString()
  headword?: string;

  @IsOptional()
  @IsString()
  pos?: string;

  @IsOptional()
  @IsObject()
  content?: Partial<OfficialCardContent>;

  @IsOptional()
  @IsString()
  status?: string;
}
