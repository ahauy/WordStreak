import {
  IsString,
  IsNotEmpty,
  IsOptional,
  MaxLength,
  IsUUID,
} from 'class-validator';

export class QuickCaptureCardDto {
  @IsString({ message: 'Từ vựng phải là chuỗi ký tự' })
  @IsNotEmpty({ message: 'Từ vựng không được để trống' })
  @MaxLength(100, { message: 'Từ vựng không được vượt quá 100 ký tự' })
  word: string;

  @IsOptional()
  @IsUUID('4', { message: 'ID bộ từ không hợp lệ' })
  deckId?: string;

  @IsOptional()
  @IsString({ message: 'Câu ngữ cảnh phải là chuỗi ký tự' })
  @MaxLength(500, { message: 'Câu ngữ cảnh không được vượt quá 500 ký tự' })
  contextSentence?: string;

  @IsOptional()
  @IsString({ message: 'Source URL phải là chuỗi ký tự' })
  @MaxLength(1000, { message: 'URL không được vượt quá 1000 ký tự' })
  sourceUrl?: string;

  @IsOptional()
  @IsString({ message: 'Nghĩa tùy chỉnh phải là chuỗi ký tự' })
  @MaxLength(500, { message: 'Nghĩa tùy chỉnh không được vượt quá 500 ký tự' })
  customDefinition?: string;
}
