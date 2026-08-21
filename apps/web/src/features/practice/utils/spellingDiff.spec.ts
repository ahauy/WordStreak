import { describe, it, expect } from "vitest";
import {
  normalizeSpelling,
  checkAnswer,
  computeCharacterDiff,
} from "./spellingDiff";

describe("spellingDiff Utility", () => {
  describe("TC-LISTEN-001: Text Normalization and Spelling Validation", () => {
    it("normalizes basic whitespace and case", () => {
      expect(normalizeSpelling("  Efficient  ")).toBe("efficient");
      expect(normalizeSpelling("EFFICIENT")).toBe("efficient");
      expect(normalizeSpelling("efficient")).toBe("efficient");
      expect(checkAnswer("  Efficient  ", "efficient")).toBe(true);
      expect(checkAnswer("EFFICIENT", "efficient")).toBe(true);
      expect(checkAnswer("efficient", "efficient")).toBe(true);
    });

    it("handles hyphens, punctuation and extra spaces", () => {
      expect(checkAnswer("State-of-the-art!", "state-of-the-art")).toBe(true);
      expect(checkAnswer("State of the art", "state-of-the-art")).toBe(true);
      expect(checkAnswer("state-of-the-art", "State of the art")).toBe(true);
    });

    it("handles contractions and curly vs straight apostrophes", () => {
      expect(checkAnswer("dont", "don't")).toBe(true);
      expect(checkAnswer("don’t", "don't")).toBe(true);
      expect(checkAnswer("don't", "don't")).toBe(true);
      expect(checkAnswer("it's", "it’s")).toBe(true);
      expect(checkAnswer("its", "it's")).toBe(true);
    });

    it("returns false for incorrect spellings", () => {
      expect(checkAnswer("eficient", "efficient")).toBe(false);
      expect(checkAnswer("acomodation", "accommodation")).toBe(false);
      expect(checkAnswer("seperate", "separate")).toBe(false);
    });
  });

  describe("TC-LISTEN-002: Character-Level LCS Diff Computation", () => {
    it("identifies missing characters in 'acomodation' for 'accommodation'", () => {
      const diff = computeCharacterDiff("acomodation", "accommodation");

      const matches = diff.filter((d) => d.type === "MATCH");
      const missing = diff.filter((d) => d.type === "MISSING");

      expect(matches.map((m) => m.char)).toEqual([
        "a",
        "c",
        "o",
        "m",
        "o",
        "d",
        "a",
        "t",
        "i",
        "o",
        "n",
      ]);
      expect(missing.map((m) => m.char)).toEqual(["c", "m"]);
    });

    it("identifies wrong/substituted character in 'seperate' vs 'separate'", () => {
      const diff = computeCharacterDiff("seperate", "separate");

      const wrong = diff.filter((d) => d.type === "WRONG");
      expect(wrong.length).toBeGreaterThanOrEqual(1);
      expect(wrong.some((w) => w.char === "e")).toBe(true);
    });

    it("identifies extra characters when user types too many letters", () => {
      const diff = computeCharacterDiff("appeall", "appeal");

      const extra = diff.filter((d) => d.type === "EXTRA");
      expect(extra.length).toBe(1);
      expect(extra[0].char).toBe("l");
    });

    it("handles transpositions in 'recieve' vs 'receive'", () => {
      const diff = computeCharacterDiff("recieve", "receive");

      expect(
        diff.some(
          (d) =>
            d.type === "WRONG" || d.type === "EXTRA" || d.type === "MISSING",
        ),
      ).toBe(true);
      expect(
        diff
          .filter((d) => d.type === "MATCH")
          .map((d) => d.char)
          .join(""),
      ).toBe("receve");
    });

    it("returns all MATCH spans for identical words", () => {
      const diff = computeCharacterDiff("efficient", "efficient");

      expect(diff.every((d) => d.type === "MATCH")).toBe(true);
      expect(diff.map((d) => d.char).join("")).toBe("efficient");
    });
  });
});
