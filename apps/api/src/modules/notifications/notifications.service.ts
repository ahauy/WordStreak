import { Injectable, Logger } from '@nestjs/common';
import { PushSubscribeDto } from './dto/push-subscribe.dto';

export interface StoredPushSubscription {
  userId: string;
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);
  private readonly subscriptions = new Map<string, StoredPushSubscription>();

  registerSubscription(
    userId: string,
    dto: PushSubscribeDto,
  ): Promise<{ success: boolean; message: string }> {
    const existing = this.subscriptions.get(userId);
    const now = new Date();

    this.subscriptions.set(userId, {
      userId,
      endpoint: dto.endpoint,
      keys: {
        p256dh: dto.keys.p256dh,
        auth: dto.keys.auth,
      },
      createdAt: existing ? existing.createdAt : now,
      updatedAt: now,
    });

    this.logger.log(`Push subscription registered for user: ${userId}`);
    return Promise.resolve({
      success: true,
      message: 'Đăng ký nhận thông báo thành công',
    });
  }

  isQuietHours(date = new Date(), startHour = 22, endHour = 7): boolean {
    const hour = date.getHours();
    if (startHour > endHour) {
      return hour >= startHour || hour < endHour;
    }
    return hour >= startHour && hour < endHour;
  }

  sendTestPush(
    userId: string,
  ): Promise<{ success: boolean; delivered: boolean; inQuietHours: boolean }> {
    const quiet = this.isQuietHours();
    if (quiet) {
      this.logger.warn(
        `Test push triggered during quiet hours for user: ${userId}`,
      );
    }

    const subscription = this.subscriptions.get(userId);
    if (!subscription) {
      this.logger.log(
        `Test push simulated: no subscription for user ${userId}`,
      );
      return Promise.resolve({
        success: true,
        delivered: false,
        inQuietHours: quiet,
      });
    }

    this.logger.log(`Test push delivered to ${subscription.endpoint}`);
    return Promise.resolve({
      success: true,
      delivered: true,
      inQuietHours: quiet,
    });
  }

  getSubscription(userId: string): StoredPushSubscription | undefined {
    return this.subscriptions.get(userId);
  }

  clearSubscriptions(): void {
    this.subscriptions.clear();
  }
}
