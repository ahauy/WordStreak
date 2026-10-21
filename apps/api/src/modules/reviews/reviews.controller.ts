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
  Res,
} from '@nestjs/common';
import { createHash } from 'node:crypto';
import type { Response } from 'express';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ReviewsService } from './reviews.service';
import { ReviewsSyncService } from './reviews-sync.service';
import { SubmitReviewDto } from './dto/submit-review.dto';
import { QueryDueReviewsDto } from './dto/query-due-reviews.dto';
import { SyncReviewBatchDto } from './dto/sync-review-batch.dto';
import type {
  JwtPayload,
  ApiResponse,
  SyncReviewResponseDto,
  ReviewSummaryDto,
  TodaySessionResponse,
} from '@wordstreak/shared-types';

export function computeReviewSummaryEtag(summary: ReviewSummaryDto): string {
  const canonicalPayload = {
    dueCount: summary.dueCount,
    newAvailable: summary.newAvailable,
    studiedToday: summary.studiedToday,
    dailyGoal: summary.dailyGoal,
    goalReached: summary.goalReached,
    currentStreak: summary.currentStreak,
    streakAtRisk: summary.streakAtRisk,
    timezone: summary.timezone,
    endOfDayAt: summary.endOfDayAt,
    nextDueAt: summary.nextDueAt,
  };
  const hash = createHash('sha256')
    .update(JSON.stringify(canonicalPayload))
    .digest('hex');
  return `W/"${hash}"`;
}

export function isEtagMatch(
  ifNoneMatchHeader: string | undefined,
  currentEtag: string,
): boolean {
  if (!ifNoneMatchHeader) {
    return false;
  }
  const trimmed = ifNoneMatchHeader.trim();
  if (trimmed === '*') {
    return true;
  }
  const currentClean = currentEtag.replace(/^W\//, '');
  const tokens = trimmed.split(',').map((t) => t.trim());
  return tokens.some((token) => {
    const tokenClean = token.replace(/^W\//, '');
    return token === currentEtag || tokenClean === currentClean;
  });
}

@Controller('reviews')
@UseGuards(JwtAuthGuard)
export class ReviewsController {
  constructor(
    private readonly reviewsService: ReviewsService,
    private readonly reviewsSyncService: ReviewsSyncService,
  ) {}

  @Get('summary')
  async getReviewSummary(
    @CurrentUser() user: JwtPayload,
    @Query('timezone') queryTimezone?: string,
    @Headers('x-timezone') headerTimezone?: string,
    @Headers('if-none-match') ifNoneMatch?: string,
    @Res({ passthrough: true }) res?: Response,
  ): Promise<ApiResponse<ReviewSummaryDto> | void> {
    const summary = await this.reviewsService.getReviewSummary(
      user.sub,
      queryTimezone,
      headerTimezone,
    );
    const etag = computeReviewSummaryEtag(summary);

    res?.setHeader('ETag', etag);
    res?.setHeader('Cache-Control', 'private, must-revalidate, max-age=0');

    if (isEtagMatch(ifNoneMatch, etag)) {
      res?.status(HttpStatus.NOT_MODIFIED);
      return;
    }

    return {
      success: true,
      data: summary,
    };
  }

  @Get('today-session')
  async getTodaySession(
    @CurrentUser() user: JwtPayload,
  ): Promise<ApiResponse<TodaySessionResponse>> {
    const data = await this.reviewsService.getTodaySession(user.sub);
    return {
      success: true,
      data,
    };
  }

  @Get('due')
  async getDueCards(
    @CurrentUser() user: JwtPayload,
    @Query() query: QueryDueReviewsDto,
  ): Promise<ApiResponse> {
    const result = await this.reviewsService.getDueCards(user.sub, query);
    return {
      success: true,
      data: result.data,
      ...(result.meta ? { message: JSON.stringify(result.meta) } : {}),
    };
  }

  @Post('submit')
  @HttpCode(HttpStatus.OK)
  async submitReview(
    @CurrentUser() user: JwtPayload,
    @Body() dto: SubmitReviewDto,
    @Headers('x-timezone') timezone?: string,
  ): Promise<ApiResponse> {
    const data = await this.reviewsService.submitReview(
      user.sub,
      dto,
      timezone,
    );
    return {
      success: true,
      data,
      message: 'Review rating recorded successfully',
    };
  }

  @Post(['sync-batch', 'sync-offline'])
  @HttpCode(HttpStatus.OK)
  async syncReviewBatch(
    @CurrentUser() user: JwtPayload,
    @Body() dto: SyncReviewBatchDto,
    @Headers('x-timezone') timezone?: string,
  ): Promise<ApiResponse<SyncReviewResponseDto>> {
    const data = await this.reviewsSyncService.syncReviews(
      user.sub,
      dto,
      timezone,
    );
    return {
      success: true,
      data,
      message: 'Batch reviews synchronized successfully',
    };
  }

  @Get('stats')
  async getReviewStats(@CurrentUser() user: JwtPayload): Promise<ApiResponse> {
    const stats = await this.reviewsService.getReviewStats(user.sub);
    return {
      success: true,
      data: stats,
    };
  }
}
