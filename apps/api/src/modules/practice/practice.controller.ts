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
import { ListeningGeneratorService } from './listening-generator.service';
import { MatchingGeneratorService } from './matching-generator.service';
import { GetQuizQuestionsDto } from './dto/get-quiz-questions.dto';
import { GetFillBlankQuestionsDto } from './dto/get-fill-blank-questions.dto';
import { GetListeningQuizDto } from './dto/get-listening-quiz.dto';
import { GetMatchingQuizDto } from './dto/get-matching-quiz.dto';
import { SubmitQuizDto } from './dto/submit-quiz.dto';
import { SubmitMatchingQuizDto } from './dto/submit-matching-quiz.dto';
import type { JwtPayload, ApiResponse } from '@wordstreak/shared-types';

function isMatchingSubmission(
  dto: SubmitQuizDto | SubmitMatchingQuizDto,
): dto is SubmitMatchingQuizDto {
  return (
    dto.mode === 'MATCHING' ||
    ('quizType' in dto && dto.quizType === 'matching') ||
    'totalPairs' in dto
  );
}

@Controller('practice')
@UseGuards(JwtAuthGuard)
export class PracticeController {
  constructor(
    private readonly practiceService: PracticeService,
    private readonly quizGeneratorService: QuizGeneratorService,
    private readonly fillBlankGeneratorService: FillBlankGeneratorService,
    private readonly listeningGeneratorService: ListeningGeneratorService,
    private readonly matchingGeneratorService: MatchingGeneratorService,
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

  @Get('listening')
  async getListeningQuiz(
    @CurrentUser() user: JwtPayload,
    @Query() query: GetListeningQuizDto,
  ): Promise<ApiResponse> {
    const questions = await this.listeningGeneratorService.generateQuestions(
      user.sub,
      query,
    );
    return {
      success: true,
      data: questions,
    };
  }

  @Get('matching')
  async getMatchingQuiz(
    @CurrentUser() user: JwtPayload,
    @Query() query: GetMatchingQuizDto,
  ): Promise<ApiResponse> {
    const quiz = await this.matchingGeneratorService.generateQuiz(
      user.sub,
      query,
    );
    return {
      success: true,
      data: quiz,
    };
  }

  @Post('matching/submit')
  @HttpCode(HttpStatus.OK)
  async submitMatchingQuiz(
    @CurrentUser() user: JwtPayload,
    @Body() dto: SubmitMatchingQuizDto,
  ): Promise<ApiResponse> {
    const result = await this.practiceService.submitMatchingQuiz(user.sub, dto);
    return {
      success: true,
      data: result,
      message: 'Matching quiz session submitted successfully',
    };
  }

  @Post('submit')
  @HttpCode(HttpStatus.OK)
  async submitPractice(
    @CurrentUser() user: JwtPayload,
    @Body() dto: SubmitQuizDto | SubmitMatchingQuizDto,
  ): Promise<ApiResponse> {
    if (isMatchingSubmission(dto)) {
      const result = await this.practiceService.submitMatchingQuiz(
        user.sub,
        dto,
      );
      return {
        success: true,
        data: result,
        message: 'Matching quiz session submitted successfully',
      };
    }

    const result = await this.practiceService.submitQuiz(user.sub, dto);
    return {
      success: true,
      data: result,
      message: 'Quiz session submitted successfully',
    };
  }

  @Post('submit-quiz')
  @HttpCode(HttpStatus.OK)
  async submitQuiz(
    @CurrentUser() user: JwtPayload,
    @Body() dto: SubmitQuizDto | SubmitMatchingQuizDto,
  ): Promise<ApiResponse> {
    if (isMatchingSubmission(dto)) {
      const result = await this.practiceService.submitMatchingQuiz(
        user.sub,
        dto,
      );
      return {
        success: true,
        data: result,
        message: 'Matching quiz session submitted successfully',
      };
    }

    const result = await this.practiceService.submitQuiz(user.sub, dto);
    return {
      success: true,
      data: result,
      message: 'Quiz session submitted successfully',
    };
  }
}
