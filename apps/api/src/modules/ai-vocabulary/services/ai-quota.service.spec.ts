import { AiQuotaService } from './ai-quota.service';
import { HttpException, HttpStatus } from '@nestjs/common';

describe('AiQuotaService', () => {
  let service: AiQuotaService;

  beforeEach(() => {
    service = new AiQuotaService();
    service.resetForTesting();
  });

  it('should return default full quota for a new user', () => {
    const quota = service.getRemainingQuota('user-1');
    expect(quota.remaining).toBe(30);
    expect(quota.max).toBe(30);
  });

  it('should decrement quota upon consumption', () => {
    const res1 = service.checkAndConsume('user-1');
    expect(res1.remaining).toBe(29);

    const res2 = service.checkAndConsume('user-1');
    expect(res2.remaining).toBe(28);

    const check = service.getRemainingQuota('user-1');
    expect(check.remaining).toBe(28);
  });

  it('should throw 429 when burst limit of 5 requests/minute is exceeded', () => {
    for (let i = 0; i < 5; i++) {
      service.checkAndConsume('user-burst');
    }

    expect(() => {
      service.checkAndConsume('user-burst');
    }).toThrow(HttpException);

    try {
      service.checkAndConsume('user-burst');
    } catch (err: any) {
      expect(err.getStatus()).toBe(HttpStatus.TOO_MANY_REQUESTS);
      expect(err.getResponse().error).toBe('AI_RATE_LIMITED');
    }
  });

  it('should throw 429 when daily limit of 30 is reached', () => {
    // Mock Date.now to avoid burst limiter triggering
    const realDateNow = Date.now;
    let fakeTime = 1000000;
    jest.spyOn(Date, 'now').mockImplementation(() => {
      fakeTime += 70000; // 70 seconds between calls
      return fakeTime;
    });

    for (let i = 0; i < 30; i++) {
      service.checkAndConsume('user-daily');
    }

    expect(() => {
      service.checkAndConsume('user-daily');
    }).toThrow(HttpException);

    try {
      service.checkAndConsume('user-daily');
    } catch (err: any) {
      expect(err.getStatus()).toBe(HttpStatus.TOO_MANY_REQUESTS);
      expect(err.getResponse().error).toBe('AI_DAILY_QUOTA_EXCEEDED');
    }

    Date.now = realDateNow;
  });
});
