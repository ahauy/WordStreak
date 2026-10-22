import {
  Controller,
  Post,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { PushSubscribeDto } from './dto/push-subscribe.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { JwtPayload } from '@wordstreak/shared-types';

@Controller(['notifications', 'v1/notifications'])
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post('push-subscribe')
  @HttpCode(HttpStatus.OK)
  async pushSubscribe(
    @CurrentUser() user: JwtPayload,
    @Body() dto: PushSubscribeDto,
  ): Promise<{ success: boolean; message: string }> {
    return this.notificationsService.registerSubscription(user.sub, dto);
  }

  @Post('test-push')
  @HttpCode(HttpStatus.OK)
  async testPush(
    @CurrentUser() user: JwtPayload,
  ): Promise<{ success: boolean }> {
    const result = await this.notificationsService.sendTestPush(user.sub);
    return { success: result.success };
  }
}
