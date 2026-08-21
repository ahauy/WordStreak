import 'reflect-metadata';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import {
  SubmitListeningQuizDto,
  ListeningAnswerSubmissionDto,
} from './submit-listening-quiz.dto';

describe('SubmitListeningQuizDto', () => {
  it('should validate valid payload', async () => {
    const dto = plainToInstance(SubmitListeningQuizDto, {
      deckId: 'deck-123',
      mode: 'LISTENING',
      totalQuestions: 5,
      answers: [
        {
          cardId: 'card-1',
          submittedWord: 'efficient',
          isCorrect: true,
          timeSpentMs: 3000,
          hintsUsed: 0,
          replayCount: 1,
          audioSpeedUsed: 1.0,
        },
      ],
    });
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should fail if deckId is empty', async () => {
    const dto = plainToInstance(SubmitListeningQuizDto, {
      deckId: '',
      answers: [],
    });
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });

  it('should fail if answer has invalid hintsUsed (>3 or <0)', async () => {
    const answer = plainToInstance(ListeningAnswerSubmissionDto, {
      cardId: 'c1',
      isCorrect: true,
      hintsUsed: 4,
    });
    const errors = await validate(answer);
    expect(errors.length).toBeGreaterThan(0);
  });
});
