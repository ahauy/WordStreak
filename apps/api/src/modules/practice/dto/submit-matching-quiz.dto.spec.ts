import 'reflect-metadata';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import {
  SubmitMatchingQuizDto,
  MatchingAnswerSubmissionDto,
} from './submit-matching-quiz.dto';

describe('SubmitMatchingQuizDto', () => {
  it('should validate valid matching submission payload', async () => {
    const dto = plainToInstance(SubmitMatchingQuizDto, {
      deckId: 'deck-123',
      mode: 'MATCHING',
      quizType: 'matching',
      roundsCompleted: 2,
      totalPairs: 10,
      correctPairs: 10,
      maxCombo: 10,
      totalTimeMs: 25000,
      answers: [
        {
          cardId: 'c1',
          matchedInMs: 2500,
          attempts: 1,
          isCorrectFirstTry: true,
          isCorrect: true,
        },
      ],
    });
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should fail if deckId is missing or empty', async () => {
    const dto = plainToInstance(SubmitMatchingQuizDto, {
      deckId: '',
      totalPairs: 5,
      totalTimeMs: 10000,
    });
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('deckId');
  });

  it('should fail if totalPairs is less than 1', async () => {
    const dto = plainToInstance(SubmitMatchingQuizDto, {
      deckId: 'deck-1',
      totalPairs: 0,
      totalTimeMs: 10000,
    });
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });

  it('should fail if answer attempts is less than 1', async () => {
    const answer = plainToInstance(MatchingAnswerSubmissionDto, {
      cardId: 'c1',
      attempts: 0,
    });
    const errors = await validate(answer);
    expect(errors.length).toBeGreaterThan(0);
  });
});
