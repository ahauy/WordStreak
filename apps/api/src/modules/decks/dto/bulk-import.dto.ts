import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import type {
  BulkImportCardsDto as IBulkImportCardsDto,
  CardBatchItemDto as ICardBatchItemDto,
  ConflictStrategy,
  RowConflictAction,
} from '@wordstreak/shared-types';

export class CardBatchItemDto implements ICardBatchItemDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  word!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(2000)
  meaning!: string;

  @IsString()
  @IsOptional()
  @MaxLength(200)
  phonetic?: string | null;

  @IsString()
  @IsOptional()
  @MaxLength(2000)
  exampleSentence?: string | null;

  @IsString()
  @IsOptional()
  @MaxLength(1000)
  collocations?: string | null;

  @IsString()
  @IsOptional()
  @MaxLength(2000)
  mnemonic?: string | null;

  @IsString()
  @IsOptional()
  @MaxLength(1000)
  imageUrl?: string | null;

  @IsString()
  @IsOptional()
  @MaxLength(1000)
  audioUrl?: string | null;

  @IsEnum(['DEFAULT', 'SKIP', 'OVERWRITE', 'KEEP_BOTH'])
  @IsOptional()
  rowConflictAction?: RowConflictAction;

  @IsEnum(['SKIP', 'OVERWRITE', 'KEEP_BOTH'])
  @IsOptional()
  conflictAction?: ConflictStrategy;
}

export class BulkImportCardsDto implements IBulkImportCardsDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CardBatchItemDto)
  cards!: CardBatchItemDto[];

  @IsEnum(['SKIP', 'OVERWRITE', 'KEEP_BOTH'])
  @IsOptional()
  conflictStrategy?: ConflictStrategy;

  @IsEnum(['SKIP', 'OVERWRITE', 'KEEP_BOTH'])
  @IsOptional()
  defaultStrategy?: ConflictStrategy;

  @IsBoolean()
  @IsOptional()
  createAsNewDeck?: boolean;

  @IsString()
  @IsOptional()
  @MaxLength(200)
  newDeckTitle?: string;
}
