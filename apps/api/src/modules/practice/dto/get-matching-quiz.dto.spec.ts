import 'reflect-metadata';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { GetMatchingQuizDto } from './get-matching-quiz.dto';

describe('GetMatchingQuizDto', () => {
  it('should validate valid payload with limit', async () => {
    const dto = plainToInstance(GetMatchingQuizDto, {
      deckId: 'deck-123',
      limit: 10,
    });
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should validate valid payload with roundsCount', async () => {
    const dto = plainToInstance(GetMatchingQuizDto, {
      deckId: 'deck-123',
      roundsCount: 2,
    });
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should fail if deckId is missing or empty', async () => {
    const dto = plainToInstance(GetMatchingQuizDto, {
      deckId: '',
    });
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('deckId');
  });

  it('should fail if limit is less than 5 or greater than 50', async () => {
    const dtoMin = plainToInstance(GetMatchingQuizDto, {
      deckId: 'deck-123',
      limit: 4,
    });
    const errorsMin = await validate(dtoMin);
    expect(errorsMin.length).toBeGreaterThan(0);

    const dtoMax = plainToInstance(GetMatchingQuizDto, {
      deckId: 'deck-123',
      limit: 51,
    });
    const errorsMax = await validate(dtoMax);
    expect(errorsMax.length).toBeGreaterThan(0);
  });

  it('should fail if roundsCount is less than 1 or greater than 10', async () => {
    const dtoMin = plainToInstance(GetMatchingQuizDto, {
      deckId: 'deck-123',
      roundsCount: 0,
    });
    const errorsMin = await validate(dtoMin);
    expect(errorsMin.length).toBeGreaterThan(0);

    const dtoMax = plainToInstance(GetMatchingQuizDto, {
      deckId: 'deck-123',
      roundsCount: 11,
    });
    const errorsMax = await validate(dtoMax);
    expect(errorsMax.length).toBeGreaterThan(0);
  });
});
