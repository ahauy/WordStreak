import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { PracticeService } from './practice.service';
import { QuizGeneratorService } from './quiz-generator.service';
import { GetQuizQuestionsDto } from './dto/get-quiz-questions.dto';
import { SubmitQuizDto } from './dto/submit-quiz.dto';
import type { JwtPayload, ApiResponse } from '@wordstreak/shared-types';

@Controller('practice')
@UseGuards(JwtAuthGuard)
export class PracticeController {
  constructor(
    private readonly practiceService: PracticeService,
    private readonly quizGeneratorService: QuizGeneratorService,
  ) {}

  @Get('multiple-choice')
  async getMultipleChoiceQuiz(
    @CurrentUser() user: JwtPayload,
    @Query() query: GetQuizQuestionsDto,
  ): Promise<ApiResponse> {
    const userId = user?.sub || (user as any)?.id;
    const questions = await this.quizGeneratorService.generateQuestions(
      userId,
      query,
    );
    return {
      success: true,
      data: questions,
    };
  }

  @Post('submit-quiz')
  @HttpCode(HttpStatus.OK)
  async submitQuiz(
    @CurrentUser() user: JwtPayload,
    @Body() dto: SubmitQuizDto,
  ): Promise<ApiResponse> {
    const userId = user?.sub || (user as any)?.id;
    const result = await this.practiceService.submitQuiz(userId, dto);
    return {
      success: true,
      data: result,
      message: 'Quiz session submitted successfully',
    };
  }
}
