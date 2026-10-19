import { IsIn, IsInt, IsOptional, Max, Min } from 'class-validator';
import type {
  OnboardingDto as IOnboardingDto,
  LearningGoal,
  StartingLevel,
} from '@wordstreak/shared-types';

export class OnboardingDto implements IOnboardingDto {
  @IsIn(['TOEIC', 'IELTS', 'COMMUNICATION', 'WORK'], {
    message: 'learningGoal must be one of: TOEIC, IELTS, COMMUNICATION, WORK',
  })
  learningGoal: LearningGoal;

  @IsIn(['ZERO', 'BEGINNER', 'INTERMEDIATE', 'ADVANCED'], {
    message:
      'startingLevel must be one of: ZERO, BEGINNER, INTERMEDIATE, ADVANCED',
  })
  startingLevel: StartingLevel;

  @IsOptional()
  @IsInt({ message: 'dailyGoal must be an integer' })
  @Min(1, { message: 'dailyGoal must be at least 1' })
  @Max(100, { message: 'dailyGoal must not exceed 100' })
  dailyGoal?: number;
}
