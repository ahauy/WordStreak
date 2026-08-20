import type {
  SrsCalculationInput,
  SrsCalculationResult,
} from '@wordstreak/shared-types';
import { SrsService } from './srs.service';

describe('SrsService (SuperMemo-2 Algorithm Engine)', () => {
  let service: SrsService;

  beforeEach(() => {
    service = new SrsService();
  });

  describe('calculateSm2', () => {
    it('TC-SRS-001: rating Good (3) on card with repetitions=1 produces repetitions=2 and interval=6 days with stable EF', () => {
      const result = service.calculateSm2({
        rating: 3,
        repetitions: 1,
        easeFactor: 2.5,
        interval: 1,
      });

      expect(result.repetitions).toBe(2);
      expect(result.interval).toBe(6);
      expect(result.easeFactor).toBe(2.5);
      expect(result.status).toBe('LEARNING');
      expect(result.nextReviewDate).toBeInstanceOf(Date);
    });

    it('TC-SRS-002: rating Easy (4) applies ease bonus multiplier and increases ease factor to 2.6', () => {
      const result = service.calculateSm2({
        rating: 4,
        repetitions: 2,
        easeFactor: 2.5,
        interval: 6,
      });

      expect(result.repetitions).toBe(3);
      expect(result.easeFactor).toBe(2.6);
      expect(result.interval).toBe(Math.round(6 * 2.6 * 1.3)); // 20 days
      expect(result.status).toBe('LEARNING');
    });

    it('TC-SRS-003: rating Again (1) resets repetitions to 0, interval to 1, and decreases easeFactor to 2.18', () => {
      const result = service.calculateSm2({
        rating: 1,
        repetitions: 4,
        easeFactor: 2.5,
        interval: 25,
      });

      expect(result.repetitions).toBe(0);
      expect(result.interval).toBe(1);
      expect(result.easeFactor).toBe(2.18);
      expect(result.status).toBe('LEARNING');
    });

    it('TC-SRS-004: rating Hard (2) resets repetitions to 0 and interval to 1, decreasing easeFactor to 2.36', () => {
      const result = service.calculateSm2({
        rating: 2,
        repetitions: 2,
        easeFactor: 2.5,
        interval: 6,
      });

      expect(result.repetitions).toBe(0);
      expect(result.interval).toBe(1);
      expect(result.easeFactor).toBe(2.36);
      expect(result.status).toBe('LEARNING');
    });

    it('TC-SRS-005: ease factor does not drop below 1.30 minimum bound', () => {
      const result = service.calculateSm2({
        rating: 1,
        repetitions: 1,
        easeFactor: 1.35,
        interval: 1,
      });

      expect(result.easeFactor).toBe(1.3);
    });

    it('TC-SRS-006: marks card as MASTERED when interval >= 21 and repetitions >= 4', () => {
      const result = service.calculateSm2({
        rating: 3,
        repetitions: 3,
        easeFactor: 2.5,
        interval: 10,
      });

      expect(result.repetitions).toBe(4);
      expect(result.interval).toBe(25); // round(10 * 2.5)
      expect(result.status).toBe('MASTERED');
    });
  });
});
