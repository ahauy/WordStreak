import {
  Controller,
  Get,
  Param,
  Query,
  Headers,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AnalyticsService } from './analytics.service';
import {
  QueryMasterySummaryDto,
  QueryHeatmapDto,
} from './dto/query-analytics.dto';
import type { JwtPayload, ApiResponse } from '@wordstreak/shared-types';

@Controller('analytics')
@UseGuards(JwtAuthGuard)
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('overview')
  async getOverview(@CurrentUser() user: JwtPayload): Promise<ApiResponse> {
    const data = await this.analyticsService.getOverview(user.sub);
    return {
      success: true,
      data,
    };
  }

  @Get('mastery-summary')
  async getMasterySummary(
    @CurrentUser() user: JwtPayload,
    @Query() query: QueryMasterySummaryDto,
  ): Promise<ApiResponse> {
    const data = await this.analyticsService.getMasterySummary(
      user.sub,
      query.deckId,
    );
    return {
      success: true,
      data,
    };
  }

  @Get('activity-heatmap')
  async getActivityHeatmap(
    @CurrentUser() user: JwtPayload,
    @Query() query: QueryHeatmapDto,
    @Headers('x-timezone') headerTimezone?: string,
  ): Promise<ApiResponse> {
    const timezone = query.timezone || headerTimezone;
    const data = await this.analyticsService.getActivityHeatmap(
      user.sub,
      timezone,
    );
    return {
      success: true,
      data,
    };
  }

  @Get('deck-forecast/:deckId')
  async getDeckForecast(
    @CurrentUser() user: JwtPayload,
    @Param('deckId') deckId: string,
  ): Promise<ApiResponse> {
    const data = await this.analyticsService.getDeckForecast(user.sub, deckId);
    return {
      success: true,
      data,
    };
  }

  @Get('decks-progress')
  async getDecksProgress(
    @CurrentUser() user: JwtPayload,
  ): Promise<ApiResponse> {
    const data = await this.analyticsService.getDecksProgress(user.sub);
    return {
      success: true,
      data,
    };
  }
}
