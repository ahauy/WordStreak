import { Injectable, HttpException, HttpStatus } from '@nestjs/common';

interface UserQuotaState {
  dateStr: string; // YYYY-MM-DD UTC
  count: number;
  burstTimestamps: number[];
}

@Injectable()
export class AiQuotaService {
  public static readonly DAILY_LIMIT = 30;
  public static readonly BURST_LIMIT = 5;
  public static readonly BURST_WINDOW_MS = 60 * 1000; // 1 minute

  private readonly userQuotas = new Map<string, UserQuotaState>();

  private getTodayUtcString(): string {
    const now = new Date();
    return now.toISOString().slice(0, 10);
  }

  private getUserState(userId: string): UserQuotaState {
    const todayStr = this.getTodayUtcString();
    let state = this.userQuotas.get(userId);

    if (!state || state.dateStr !== todayStr) {
      state = {
        dateStr: todayStr,
        count: 0,
        burstTimestamps: [],
      };
      this.userQuotas.set(userId, state);
    }

    return state;
  }

  getRemainingQuota(userId: string): { remaining: number; max: number } {
    const state = this.getUserState(userId);
    const remaining = Math.max(0, AiQuotaService.DAILY_LIMIT - state.count);
    return {
      remaining,
      max: AiQuotaService.DAILY_LIMIT,
    };
  }

  checkAndConsume(userId: string): { remaining: number; max: number } {
    const state = this.getUserState(userId);
    const now = Date.now();

    // 1. Check Burst Rate Limit (max 5 requests per 60 seconds)
    state.burstTimestamps = state.burstTimestamps.filter(
      (ts) => now - ts < AiQuotaService.BURST_WINDOW_MS,
    );

    if (state.burstTimestamps.length >= AiQuotaService.BURST_LIMIT) {
      throw new HttpException(
        {
          statusCode: HttpStatus.TOO_MANY_REQUESTS,
          message: 'Bạn đã thực hiện quá nhiều yêu cầu tạo AI. Vui lòng chờ 1 phút.',
          error: 'AI_RATE_LIMITED',
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    // 2. Check Daily Quota (max 30 requests per UTC day)
    if (state.count >= AiQuotaService.DAILY_LIMIT) {
      throw new HttpException(
        {
          statusCode: HttpStatus.TOO_MANY_REQUESTS,
          message: 'Bạn đã dùng hết 30 lượt tạo AI hôm nay. Các từ đã lưu trong bộ nhớ đệm vẫn hoàn toàn miễn phí!',
          error: 'AI_DAILY_QUOTA_EXCEEDED',
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    // 3. Consume quota
    state.count += 1;
    state.burstTimestamps.push(now);

    const remaining = Math.max(0, AiQuotaService.DAILY_LIMIT - state.count);
    return {
      remaining,
      max: AiQuotaService.DAILY_LIMIT,
    };
  }

  resetForTesting(): void {
    this.userQuotas.clear();
  }
}
