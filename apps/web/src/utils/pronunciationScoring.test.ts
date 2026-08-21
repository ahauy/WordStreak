import { describe, it, expect } from "vitest";
import {
  normalizeTranscript,
  levenshteinDistance,
  calculateAccuracyScore,
  getPronunciationTier,
  computePronunciationDiff,
} from "./pronunciationScoring";
import { VoicePronunciationTier } from "@wordstreak/shared-types";

describe("pronunciationScoring utility", () => {
  describe("normalizeTranscript", () => {
    it("should handle empty or null string", () => {
      expect(normalizeTranscript("")).toBe("");
      expect(normalizeTranscript("   ")).toBe("");
    });

    it("should lowercase and strip punctuation", () => {
      expect(normalizeTranscript("Hello, World!")).toBe("hello world");
      expect(normalizeTranscript("state-of-the-art")).toBe("state of the art");
      expect(normalizeTranscript("Don't give up.")).toBe("don't give up");
      expect(normalizeTranscript("“Eloquent”")).toBe("eloquent");
    });
  });

  describe("levenshteinDistance", () => {
    it("should return 0 for identical strings", () => {
      expect(levenshteinDistance("eloquent", "eloquent")).toBe(0);
    });

    it("should calculate correct edit distance", () => {
      expect(levenshteinDistance("kitten", "sitting")).toBe(3);
      expect(levenshteinDistance("preliminary", "preliminry")).toBe(1);
      expect(levenshteinDistance("", "test")).toBe(4);
      expect(levenshteinDistance("test", "")).toBe(4);
    });
  });

  describe("calculateAccuracyScore", () => {
    it("should return 100 for exact match", () => {
      expect(calculateAccuracyScore("eloquent", "eloquent")).toBe(100);
      expect(calculateAccuracyScore("Eloquent!", "eloquent")).toBe(100);
    });

    it("should calculate close scores between 80 and 99", () => {
      // 1 deletion in 11-char string: 1 - 1/11 = 90.9% -> 91%
      const score = calculateAccuracyScore("preliminary", "preliminry");
      expect(score).toBeGreaterThanOrEqual(80);
      expect(score).toBeLessThan(100);
    });

    it("should return <80 for heavily mismatched strings", () => {
      const score = calculateAccuracyScore("epitome", "ep-tomb");
      expect(score).toBeLessThan(80);
    });

    it("should handle empty strings cleanly", () => {
      expect(calculateAccuracyScore("", "")).toBe(100);
      expect(calculateAccuracyScore("word", "")).toBe(0);
      expect(calculateAccuracyScore("", "word")).toBe(0);
    });
  });

  describe("getPronunciationTier", () => {
    it("should return EXACT for score 100", () => {
      expect(getPronunciationTier(100)).toBe(VoicePronunciationTier.EXACT);
    });

    it("should return CLOSE for scores 80 to 99", () => {
      expect(getPronunciationTier(99)).toBe(VoicePronunciationTier.CLOSE);
      expect(getPronunciationTier(80)).toBe(VoicePronunciationTier.CLOSE);
    });

    it("should return RETRY for scores below 80", () => {
      expect(getPronunciationTier(79)).toBe(VoicePronunciationTier.RETRY);
      expect(getPronunciationTier(0)).toBe(VoicePronunciationTier.RETRY);
    });
  });

  describe("computePronunciationDiff", () => {
    it("should return all MATCH for exact identical strings", () => {
      const diff = computePronunciationDiff("cat", "cat");
      expect(diff).toEqual([
        { char: "c", type: "MATCH" },
        { char: "a", type: "MATCH" },
        { char: "t", type: "MATCH" },
      ]);
    });

    it("should identify missing and extra characters", () => {
      const diff = computePronunciationDiff("cats", "cat");
      // target is cats, spoken is cat -> missing 's'
      expect(diff.some((d) => d.char === "s" && d.type === "MISSING")).toBe(
        true,
      );
    });

    it("should identify substituted characters as WRONG", () => {
      const diff = computePronunciationDiff("cat", "cot");
      expect(diff.some((d) => d.type === "WRONG")).toBe(true);
    });
  });
});
