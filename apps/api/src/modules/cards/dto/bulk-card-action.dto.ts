import {
  IsEnum,
  IsArray,
  IsString,
  ArrayMinSize,
  ArrayMaxSize,
  IsOptional,
  IsUUID,
} from 'class-validator';
import type { BulkCardActionType } from '@wordstreak/shared-types';

export class BulkCardActionDto {
  @IsEnum(['DELETE', 'MOVE', 'RESET_PROGRESS'], {
    message: 'Thao tác không hợp lệ. Phải là DELETE, MOVE hoặc RESET_PROGRESS',
  })
  action!: BulkCardActionType;

  @IsArray({ message: 'Danh sách cardIds phải là một mảng' })
  @ArrayMinSize(1, { message: 'Cần chọn ít nhất 1 thẻ' })
  @ArrayMaxSize(100, {
    message: 'Tối đa 100 thẻ cho mỗi lần thao tác hàng loạt',
  })
  @IsUUID('4', { each: true, message: 'ID thẻ không hợp lệ' })
  cardIds!: string[];

  @IsOptional()
  @IsUUID('4', { message: 'ID bộ từ đích không hợp lệ' })
  targetDeckId?: string;
}
