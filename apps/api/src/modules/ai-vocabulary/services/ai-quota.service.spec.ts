import { HttpStatus, HttpException } from '@nestjs/common';
import { AiQuotaService } from './ai-quota.service';

describe('AiQuotaService', () => {
  let service: AiQuotaService;

  beforeEach(() => {
    service = new AiQuotaService();
  });

  it('should initialize with full 30 daily quota', () => {
    const quota = service.getRemainingQuota('user-1');
    expect(quota.remaining).toBe(30);
    expect(quota.max).toBe(30);
  });

  it('should decrement daily quota on consumption', () => {
    const quota1 = service.checkAndConsume('user-1');
    expect(quota1.remaining).toBe(29);

    const quota2 = service.checkAndConsume('user-1');
    expect(quota2.remaining).toBe(28);
  });

  it('should throw 429 when burst limit of 5 requests per minute is exceeded', () => {
    for (let i = 0; i < 5; i++) {
      service.checkAndConsume('user-burst');
    }

    expect(() => {
      service.checkAndConsume('user-burst');
    }).toThrow(HttpException);

    try {
      service.checkAndConsume('user-burst');
    } catch (err: unknown) {
      if (err instanceof HttpException) {
        expect(err.getStatus()).toBe(HttpStatus.TOO_MANY_REQUESTS);
        const res = err.getResponse() as { error?: string };
        expect(res.error).toBe('AI_RATE_LIMITED');
      }
    }
  });

  it('should throw 429 when daily limit of 30 is reached', () => {
    const realDateNow = Date.now;
    let fakeTime = 1000000;
    jest.spyOn(Date, 'now').mockImplementation(() => {
      fakeTime += 70000; // 70 seconds between calls to avoid burst limit
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
    } catch (err: unknown) {
      if (err instanceof HttpException) {
        expect(err.getStatus()).toBe(HttpStatus.TOO_MANY_REQUESTS);
        const res = err.getResponse() as { error?: string };
        expect(res.error).toBe('AI_DAILY_QUOTA_EXCEEDED');
      }
    }

    Date.now = realDateNow;
  });
});
