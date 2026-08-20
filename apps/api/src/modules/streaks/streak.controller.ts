import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  Headers,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { StreakService } from './streak.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { RecordStreakActivityDto } from './dto/record-streak-activity.dto';
import type {
  JwtPayload,
  ApiResponse,
  UserStreakDto,
  StreakActivityResponseDto,
} from '@wordstreak/shared-types';

@Controller('streaks')
@UseGuards(JwtAuthGuard)
export class StreakController {
  constructor(private readonly streakService: StreakService) {}

  @Get('me')
  async getMyStreak(
    @CurrentUser() user: JwtPayload,
    @Headers('x-timezone') headerTimezone?: string,
    @Query('timezone') queryTimezone?: string,
  ): Promise<ApiResponse<UserStreakDto>> {
    const timezone = headerTimezone || queryTimezone;
    const data = await this.streakService.getStreak(user.sub, timezone);
    return {
      success: true,
      data,
    };
  }

  @Post('record-activity')
  @HttpCode(HttpStatus.OK)
  async recordActivity(
    @CurrentUser() user: JwtPayload,
    @Body() dto: RecordStreakActivityDto,
    @Headers('x-timezone') headerTimezone?: string,
  ): Promise<ApiResponse<StreakActivityResponseDto>> {
    const payload: RecordStreakActivityDto = {
      ...dto,
      timezone: dto.timezone || headerTimezone,
    };
    const data = await this.streakService.recordActivity(user.sub, payload);
    return {
      success: true,
      data,
      message: data.message,
    };
  }
}
