import { Injectable } from '@nestjs/common';
import { ApiResponse } from '@wordstreak/shared-types';

@Injectable()
export class AppService {
  getHello(): ApiResponse<string> {
    return {
      success: true,
      data: 'Hello World from WordStreak API!',
    };
  }
}
