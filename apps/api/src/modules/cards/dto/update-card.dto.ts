import { IsString, IsOptional, MaxLength } from 'class-validator';

export class UpdateCardDto {
  @IsString()
  @IsOptional()
  @MaxLength(100, { message: 'Từ vựng tối đa 100 ký tự' })
  word?: string;

  @IsString()
  @IsOptional()
  @MaxLength(500, { message: 'Nghĩa của từ tối đa 500 ký tự' })
  meaning?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100, { message: 'Phiên âm IPA tối đa 100 ký tự' })
  phonetic?: string;

  @IsString()
  @IsOptional()
  @MaxLength(500, { message: 'Audio URL tối đa 500 ký tự' })
  audioUrl?: string;

  @IsString()
  @IsOptional()
  @MaxLength(1000, { message: 'Câu ví dụ tối đa 1000 ký tự' })
  exampleSentence?: string;

  @IsString()
  @IsOptional()
  @MaxLength(500, { message: 'Collocations tối đa 500 ký tự' })
  collocations?: string;

  @IsString()
  @IsOptional()
  @MaxLength(1000, { message: 'Mẹo nhớ từ tối đa 1000 ký tự' })
  mnemonic?: string;

  @IsString()
  @IsOptional()
  @MaxLength(500, { message: 'Image URL tối đa 500 ký tự' })
  imageUrl?: string;
}
