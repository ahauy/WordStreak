import 'reflect-metadata';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { GetListeningQuizDto } from './get-listening-quiz.dto';

describe('GetListeningQuizDto', () => {
  it('should validate valid payload', async () => {
    const dto = plainToInstance(GetListeningQuizDto, {
      deckId: 'deck-123',
      limit: 20,
    });
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should fail if deckId is missing or empty', async () => {
    const dto = plainToInstance(GetListeningQuizDto, {
      deckId: '',
    });
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('deckId');
  });

  it('should fail if limit is less than 1 or greater than 100', async () => {
    const dtoMin = plainToInstance(GetListeningQuizDto, {
      deckId: 'deck-123',
      limit: 0,
    });
    const errorsMin = await validate(dtoMin);
    expect(errorsMin.length).toBeGreaterThan(0);

    const dtoMax = plainToInstance(GetListeningQuizDto, {
      deckId: 'deck-123',
      limit: 101,
    });
    const errorsMax = await validate(dtoMax);
    expect(errorsMax.length).toBeGreaterThan(0);
  });
});
