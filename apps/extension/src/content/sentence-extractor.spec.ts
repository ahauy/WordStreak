import { describe, it, expect } from "vitest";
import { extractSentence, isValidSelection } from "./sentence-extractor";

describe("sentence-extractor", () => {
  it("TC-EXT-004: should extract the exact enclosing sentence around selected word", () => {
    const text =
      "First sentence. Economic resilience is crucial for long-term growth. Third sentence.";
    const word = "resilience";

    const result = extractSentence(word, text);
    expect(result).toBe("Economic resilience is crucial for long-term growth.");
  });

  it("TC-EXT-005: should truncate sentence exceeding max length with ellipsis", () => {
    const longText = "A".repeat(300) + " keyword " + "B".repeat(50);
    const result = extractSentence("keyword", longText, 100);

    expect(result.length).toBeLessThanOrEqual(104);
    expect(result.endsWith("...")).toBe(true);
  });

  it("should handle single-sentence containers cleanly", () => {
    const text =
      "Serendipity often leads to surprising scientific discoveries.";
    const result = extractSentence("Serendipity", text);

    expect(result).toBe(
      "Serendipity often leads to surprising scientific discoveries.",
    );
  });

  it("should validate selection correctly", () => {
    expect(isValidSelection("ubiquitous")).toBe(true);
    expect(isValidSelection("spontaneous combustion")).toBe(true);
    expect(isValidSelection("a")).toBe(false); // too short
    expect(isValidSelection("https://google.com")).toBe(false); // url
    expect(isValidSelection("user@wordstreak.com")).toBe(false); // email
    expect(isValidSelection("123456")).toBe(false); // digits only
    expect(isValidSelection("one two three four five six seven")).toBe(false); // > 5 words
  });
});
