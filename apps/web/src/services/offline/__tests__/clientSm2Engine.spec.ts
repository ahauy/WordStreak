import { describe, it, expect } from "vitest";
import { clientSm2Engine } from "../clientSm2Engine";
import type { SrsCalculationInput } from "@wordstreak/shared-types";

describe("ClientSm2Engine", () => {
  it("TC-SRS-001: rating Good (3) on new card sets repetition=1, interval=1, and easeFactor=2.5", () => {
    const input: SrsCalculationInput = {
      rating: 3,
      repetitions: 0,
      easeFactor: 2.5,
      interval: 0,
    };

    const result = clientSm2Engine.calculateSm2(input);

    expect(result.repetitions).toBe(1);
    expect(result.interval).toBe(1);
    expect(result.easeFactor).toBe(2.5);
    expect(result.status).toBe("LEARNING");
  });

  it("TC-SRS-002: rating Easy (4) on new card sets repetition=1, interval=1, and increases easeFactor to 2.6", () => {
    const input: SrsCalculationInput = {
      rating: 4,
      repetitions: 0,
      easeFactor: 2.5,
      interval: 0,
    };

    const result = clientSm2Engine.calculateSm2(input);

    expect(result.repetitions).toBe(1);
    expect(result.interval).toBe(1);
    expect(result.easeFactor).toBe(2.6);
    expect(result.status).toBe("LEARNING");
  });

  it("TC-SRS-003: rating Again (1) resets repetitions to 0, interval to 1, and decreases easeFactor to 2.18", () => {
    const input: SrsCalculationInput = {
      rating: 1,
      repetitions: 3,
      easeFactor: 2.5,
      interval: 15,
    };

    const result = clientSm2Engine.calculateSm2(input);

    expect(result.repetitions).toBe(0);
    expect(result.interval).toBe(1);
    expect(result.easeFactor).toBe(2.18);
    expect(result.status).toBe("LEARNING");
  });

  it("TC-SRS-004: rating Hard (2) resets repetitions to 0 and interval to 1, decreasing easeFactor to 2.36", () => {
    const input: SrsCalculationInput = {
      rating: 2,
      repetitions: 2,
      easeFactor: 2.5,
      interval: 6,
    };

    const result = clientSm2Engine.calculateSm2(input);

    expect(result.repetitions).toBe(0);
    expect(result.interval).toBe(1);
    expect(result.easeFactor).toBe(2.36);
    expect(result.status).toBe("LEARNING");
  });

  it("TC-SRS-005: easeFactor never drops below MIN_EASE_FACTOR (1.3)", () => {
    const input: SrsCalculationInput = {
      rating: 1,
      repetitions: 1,
      easeFactor: 1.35,
      interval: 1,
    };

    const result = clientSm2Engine.calculateSm2(input);

    expect(result.easeFactor).toBe(1.3);
  });

  it("TC-SRS-006: multi-repetition calculation with Easy bonus multiplier", () => {
    // 2nd repetition
    const rep2 = clientSm2Engine.calculateSm2({
      rating: 3,
      repetitions: 1,
      easeFactor: 2.5,
      interval: 1,
    });
    expect(rep2.repetitions).toBe(2);
    expect(rep2.interval).toBe(6);

    // 3rd repetition with rating 4 (Easy) -> baseInterval = 6 * 2.6 = 15.6, easy bonus = 15.6 * 1.3 = 20.28 -> round = 20
    const rep3 = clientSm2Engine.calculateSm2({
      rating: 4,
      repetitions: 2,
      easeFactor: rep2.easeFactor,
      interval: rep2.interval,
    });
    expect(rep3.repetitions).toBe(3);
    expect(rep3.easeFactor).toBe(2.6);
    expect(rep3.interval).toBe(20);

    // 4th repetition with rating 4 (Easy) -> baseInterval = 20 * 2.7 = 54, easy bonus = 54 * 1.3 = 70.2 -> round = 70
    const rep4 = clientSm2Engine.calculateSm2({
      rating: 4,
      repetitions: 3,
      easeFactor: rep3.easeFactor,
      interval: rep3.interval,
    });
    expect(rep4.repetitions).toBe(4);
    expect(rep4.interval).toBe(70);
    expect(rep4.status).toBe("MASTERED");
  });
});
