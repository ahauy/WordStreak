import { Test, TestingModule } from '@nestjs/testing';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { JwtPayload } from '@wordstreak/shared-types';
import { PushSubscribeDto } from './dto/push-subscribe.dto';

describe('NotificationsController', () => {
  let controller: NotificationsController;
  let service: {
    registerSubscription: jest.Mock;
    sendTestPush: jest.Mock;
  };

  const mockUser: JwtPayload = {
    sub: 'user-sub-123',
    email: 'user@example.com',
    sessionId: 'session-123',
  };

  const mockDto: PushSubscribeDto = {
    endpoint: 'https://fcm.googleapis.com/fcm/send/test-token',
    keys: {
      p256dh: 'BNcRdreALRF8FsII-ABC-123',
      auth: 'authSecret123',
    },
  };

  beforeEach(async () => {
    service = {
      registerSubscription: jest.fn().mockResolvedValue({
        success: true,
        message: 'Đăng ký nhận thông báo thành công',
      }),
      sendTestPush: jest.fn().mockResolvedValue({
        success: true,
        delivered: true,
        inQuietHours: false,
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [NotificationsController],
      providers: [{ provide: NotificationsService, useValue: service }],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<NotificationsController>(NotificationsController);
  });

  describe('pushSubscribe', () => {
    it('TC-NOTIF-001: should register push subscription with user id and dto', async () => {
      const result = await controller.pushSubscribe(mockUser, mockDto);

      expect(service.registerSubscription).toHaveBeenCalledWith(
        'user-sub-123',
        mockDto,
      );
      expect(result).toEqual({
        success: true,
        message: 'Đăng ký nhận thông báo thành công',
      });
    });
  });

  describe('testPush', () => {
    it('TC-NOTIF-002: should trigger test push notification for user', async () => {
      const result = await controller.testPush(mockUser);

      expect(service.sendTestPush).toHaveBeenCalledWith('user-sub-123');
      expect(result).toEqual({ success: true });
    });
  });
});
