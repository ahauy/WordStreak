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
import { FillBlankGeneratorService } from './fill-blank-generator.service';
import { GetQuizQuestionsDto } from './dto/get-quiz-questions.dto';
import { GetFillBlankQuestionsDto } from './dto/get-fill-blank-questions.dto';
import { SubmitQuizDto } from './dto/submit-quiz.dto';
import type { JwtPayload, ApiResponse } from '@wordstreak/shared-types';

@Controller('practice')
@UseGuards(JwtAuthGuard)
export class PracticeController {
  constructor(
    private readonly practiceService: PracticeService,
    private readonly quizGeneratorService: QuizGeneratorService,
    private readonly fillBlankGeneratorService: FillBlankGeneratorService,
  ) {}

  @Get('multiple-choice')
  async getMultipleChoiceQuiz(
    @CurrentUser() user: JwtPayload,
    @Query() query: GetQuizQuestionsDto,
  ): Promise<ApiResponse> {
    const questions = await this.quizGeneratorService.generateQuestions(
      user.sub,
      query,
    );
    return {
      success: true,
      data: questions,
    };
  }

  @Get('fill-in-the-blank')
  async getFillBlankQuiz(
    @CurrentUser() user: JwtPayload,
    @Query() query: GetFillBlankQuestionsDto,
  ): Promise<ApiResponse> {
    const questions = await this.fillBlankGeneratorService.generateQuestions(
      user.sub,
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
    const result = await this.practiceService.submitQuiz(user.sub, dto);
    return {
      success: true,
      data: result,
      message: 'Quiz session submitted successfully',
    };
  }
}
