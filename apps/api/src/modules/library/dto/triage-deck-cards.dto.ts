import { IsArray, ValidateNested, IsString, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';

export class TriageCardItemDto {
  @IsString()
  cardId: string;

  @IsBoolean()
  isKnown: boolean;
}

export class TriageDeckCardsDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TriageCardItemDto)
  items: TriageCardItemDto[];
}
