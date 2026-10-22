import { IsNotEmpty, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class PushSubscriptionKeysDto {
  @IsString()
  @IsNotEmpty({ message: 'p256dh key không được để trống' })
  p256dh: string;

  @IsString()
  @IsNotEmpty({ message: 'auth key không được để trống' })
  auth: string;
}

export class PushSubscribeDto {
  @IsString()
  @IsNotEmpty({ message: 'endpoint không được để trống' })
  endpoint: string;

  @ValidateNested()
  @Type(() => PushSubscriptionKeysDto)
  keys: PushSubscriptionKeysDto;
}
