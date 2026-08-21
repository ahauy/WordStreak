import { describe, it, expect } from "vitest";
import {
  calculateAccuracyScore,
  getPronunciationTier,
  computePronunciationDiff,
  normalizeTranscript,
} from "./pronunciationScorer";
import { VoicePronunciationTier } from "@wordstreak/shared-types";

describe("pronunciationScorer feature utility", () => {
  it("normalizes transcripts correctly", () => {
    expect(normalizeTranscript("  Eloquent!  ")).toBe("eloquent");
  });

  it("calculates accuracy score properly", () => {
    expect(calculateAccuracyScore("eloquent", "eloquent")).toBe(100);
    expect(
      calculateAccuracyScore("preliminary", "preliminry"),
    ).toBeGreaterThanOrEqual(80);
  });

  it("assigns appropriate pronunciation tier", () => {
    expect(getPronunciationTier(100)).toBe(VoicePronunciationTier.EXACT);
    expect(getPronunciationTier(85)).toBe(VoicePronunciationTier.CLOSE);
    expect(getPronunciationTier(60)).toBe(VoicePronunciationTier.RETRY);
  });

  it("computes character difference spans", () => {
    const spans = computePronunciationDiff("hello", "helo");
    expect(spans.length).toBeGreaterThan(0);
  });
});
