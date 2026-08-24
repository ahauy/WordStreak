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
import { ReviewsService } from './reviews.service';
import { ReviewsSyncService } from './reviews-sync.service';
import { SubmitReviewDto } from './dto/submit-review.dto';
import { QueryDueReviewsDto } from './dto/query-due-reviews.dto';
import { SyncReviewBatchDto } from './dto/sync-review-batch.dto';
import type {
  JwtPayload,
  ApiResponse,
  SyncReviewResponseDto,
} from '@wordstreak/shared-types';

@Controller('reviews')
@UseGuards(JwtAuthGuard)
export class ReviewsController {
  constructor(
    private readonly reviewsService: ReviewsService,
    private readonly reviewsSyncService: ReviewsSyncService,
  ) {}

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
