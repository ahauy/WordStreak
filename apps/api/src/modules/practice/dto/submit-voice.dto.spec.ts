import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { SubmitVoiceDto } from './submit-voice.dto';

describe('SubmitVoiceDto', () => {
  it('should validate a valid voice submission payload successfully', async () => {
    const payload = {
      cardId: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
      spokenTranscript: 'eloquent',
      accuracyScore: 100,
      targetWord: 'eloquent',
      accent: 'en-US',
      timeSpentMs: 1420,
      evaluationMode: 'LENIENT',
    };

    const dto = plainToInstance(SubmitVoiceDto, payload);
    const errors = await validate(dto);

    expect(errors.length).toBe(0);
  });

  it('should fail when cardId is missing or not a valid UUID', async () => {
    const payload = {
      cardId: 'invalid-uuid',
      spokenTranscript: 'eloquent',
    };

    const dto = plainToInstance(SubmitVoiceDto, payload);
    const errors = await validate(dto);

    expect(errors.length).toBeGreaterThan(0);
    expect(errors.some((e) => e.property === 'cardId')).toBe(true);
  });

  it('should fail when spokenTranscript is empty', async () => {
    const payload = {
      cardId: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
      spokenTranscript: '',
    };

    const dto = plainToInstance(SubmitVoiceDto, payload);
    const errors = await validate(dto);

    expect(errors.length).toBeGreaterThan(0);
    expect(errors.some((e) => e.property === 'spokenTranscript')).toBe(true);
  });

  it('should fail when accuracyScore is out of bounds (0-100)', async () => {
    const payload = {
      cardId: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
      spokenTranscript: 'eloquent',
      accuracyScore: 150,
    };

    const dto = plainToInstance(SubmitVoiceDto, payload);
    const errors = await validate(dto);

    expect(errors.length).toBeGreaterThan(0);
    expect(errors.some((e) => e.property === 'accuracyScore')).toBe(true);
  });

  it('should fail when accent is not en-US or en-GB', async () => {
    const payload = {
      cardId: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
      spokenTranscript: 'eloquent',
      accent: 'fr-FR',
    };

    const dto = plainToInstance(SubmitVoiceDto, payload);
    const errors = await validate(dto);

    expect(errors.length).toBeGreaterThan(0);
    expect(errors.some((e) => e.property === 'accent')).toBe(true);
  });
});
