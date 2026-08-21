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
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { XpService } from './services/xp.service';
import { XpHistoryQueryDto } from './dto/xp-history-query.dto';
import { AwardPracticeXpDto } from './dto/award-practice-xp.dto';
import type {
  JwtPayload,
  ApiResponse,
  XpSummaryResponseDto,
  XpHistoryResponseDto,
  PracticeQuizXpRewardDto,
} from '@wordstreak/shared-types';

@Controller('gamification/xp')
@UseGuards(JwtAuthGuard)
export class XpController {
  constructor(private readonly xpService: XpService) {}

  @Get('summary')
  async getXpSummary(
    @CurrentUser() user: JwtPayload,
    @Headers('x-timezone') timezone?: string,
  ): Promise<ApiResponse<XpSummaryResponseDto>> {
    const data = await this.xpService.getXpSummary(user.sub, timezone);
    return {
      success: true,
      data,
    };
  }

  @Get('history')
  async getXpHistory(
    @CurrentUser() user: JwtPayload,
    @Query() query: XpHistoryQueryDto,
  ): Promise<ApiResponse<XpHistoryResponseDto>> {
    const result = await this.xpService.getXpHistory(user.sub, query);
    return {
      success: true,
      data: result,
    };
  }

  @Post('practice')
  @HttpCode(HttpStatus.OK)
  async awardPracticeQuizXp(
    @CurrentUser() user: JwtPayload,
    @Body() dto: AwardPracticeXpDto,
    @Headers('x-timezone') timezone?: string,
  ): Promise<ApiResponse<PracticeQuizXpRewardDto>> {
    const data = await this.xpService.awardPracticeQuizXp(
      user.sub,
      dto,
      timezone,
    );
    return {
      success: true,
      data,
      message: 'Practice quiz XP awarded successfully',
    };
  }
}
