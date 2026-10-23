import { Test, TestingModule } from '@nestjs/testing';
import { NotificationsService } from './notifications.service';
import { PushSubscribeDto } from './dto/push-subscribe.dto';

describe('NotificationsService', () => {
  let service: NotificationsService;

  const mockDto: PushSubscribeDto = {
    endpoint: 'https://updates.push.services.mozilla.com/wpush/v2/test',
    keys: {
      p256dh: 'BNcRdreALRF8FsII-ABC-456',
      auth: 'authSecret456',
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [NotificationsService],
    }).compile();

    service = module.get<NotificationsService>(NotificationsService);
    service.clearSubscriptions();
  });

  describe('registerSubscription', () => {
    it('TC-NOTIF-SVC-001: should save a new push subscription in memory', async () => {
      const result = await service.registerSubscription('user-1', mockDto);

      expect(result).toEqual({
        success: true,
        message: 'Đăng ký nhận thông báo thành công',
      });

      const stored = service.getSubscription('user-1');
      expect(stored).toBeDefined();
      expect(stored?.userId).toBe('user-1');
      expect(stored?.endpoint).toBe(mockDto.endpoint);
      expect(stored?.keys).toEqual(mockDto.keys);
    });

    it('TC-NOTIF-SVC-002: should update existing subscription preserving createdAt', async () => {
      await service.registerSubscription('user-1', mockDto);
      const initialStored = service.getSubscription('user-1');
      const initialCreatedAt = initialStored?.createdAt;

      const updatedDto: PushSubscribeDto = {
        endpoint:
          'https://updates.push.services.mozilla.com/wpush/v2/new-token',
        keys: {
          p256dh: 'NEW_KEY_P256DH',
          auth: 'NEW_AUTH_SECRET',
        },
      };

      await service.registerSubscription('user-1', updatedDto);
      const updatedStored = service.getSubscription('user-1');

      expect(updatedStored?.endpoint).toBe(updatedDto.endpoint);
      expect(updatedStored?.createdAt).toEqual(initialCreatedAt);
    });
  });

  describe('isQuietHours', () => {
    it('TC-NOTIF-SVC-003: should return true during quiet hours (22:00 - 07:00)', () => {
      const lateNight = new Date('2026-10-22T23:30:00');
      const midnight = new Date('2026-10-22T00:15:00');
      const earlyMorning = new Date('2026-10-22T06:45:00');

      expect(service.isQuietHours(lateNight, 22, 7)).toBe(true);
      expect(service.isQuietHours(midnight, 22, 7)).toBe(true);
      expect(service.isQuietHours(earlyMorning, 22, 7)).toBe(true);
    });

    it('TC-NOTIF-SVC-004: should return false during active hours', () => {
      const morning = new Date('2026-10-22T08:00:00');
      const afternoon = new Date('2026-10-22T14:30:00');
      const evening = new Date('2026-10-22T21:59:00');

      expect(service.isQuietHours(morning, 22, 7)).toBe(false);
      expect(service.isQuietHours(afternoon, 22, 7)).toBe(false);
      expect(service.isQuietHours(evening, 22, 7)).toBe(false);
    });

    it('TC-NOTIF-SVC-005: should support same-day start and end hour ranges', () => {
      const midday = new Date('2026-10-22T13:00:00');
      const morning = new Date('2026-10-22T10:00:00');

      expect(service.isQuietHours(midday, 12, 14)).toBe(true);
      expect(service.isQuietHours(morning, 12, 14)).toBe(false);
    });
  });

  describe('sendTestPush', () => {
    it('TC-NOTIF-SVC-006: should deliver test push if subscription exists', async () => {
      await service.registerSubscription('user-1', mockDto);

      const result = await service.sendTestPush('user-1');

      expect(result.success).toBe(true);
      expect(result.delivered).toBe(true);
    });

    it('TC-NOTIF-SVC-007: should simulate test push when no subscription exists', async () => {
      const result = await service.sendTestPush('user-unknown');

      expect(result.success).toBe(true);
      expect(result.delivered).toBe(false);
    });
  });
});
