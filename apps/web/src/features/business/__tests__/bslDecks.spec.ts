import { describe, it, expect } from "vitest";
import {
  BSL_50_DECKS_CATALOG,
  SAMPLE_BSL_WORDS,
  getBslDecksBySector,
  getTotalBslWordsCount,
} from "../data/bslDecks";

describe("BSL Business Decks Dataset (Slice 12.1)", () => {
  it("should contain official 50 business decks with complete metadata", () => {
    expect(BSL_50_DECKS_CATALOG.length).toBe(50);

    for (const deck of BSL_50_DECKS_CATALOG) {
      expect(deck.id).toBeTruthy();
      expect(deck.slug).toBeTruthy();
      expect(deck.title).toBeTruthy();
      expect(deck.titleVi).toBeTruthy();
      expect(["MANAGEMENT", "FINANCE", "MARKETING", "HR", "OPERATIONS"]).toContain(deck.sector);
      expect(deck.cardsCount).toBe(34);
    }
  });

  it("should calculate total business words count to 1.700 words", () => {
    const total = getTotalBslWordsCount();
    expect(total).toBe(1700);
  });

  it("should filter decks accurately by corporate sector", () => {
    const all = getBslDecksBySector("ALL");
    expect(all.length).toBe(50);

    const finance = getBslDecksBySector("FINANCE");
    expect(finance.length).toBe(10);
    expect(finance.every((d) => d.sector === "FINANCE")).toBe(true);

    const operations = getBslDecksBySector("OPERATIONS");
    expect(operations.length).toBe(10);
    expect(operations.every((d) => d.sector === "OPERATIONS")).toBe(true);
  });

  it("should contain enriched sample business cards with valid IPA, definitions and examples", () => {
    expect(SAMPLE_BSL_WORDS.length).toBeGreaterThanOrEqual(8);

    for (const card of SAMPLE_BSL_WORDS) {
      expect(card.word.length).toBeGreaterThan(1);
      expect(card.ipa).toMatch(/^\/.*\/$/);
      expect(card.meaningVi.length).toBeGreaterThan(3);
      expect(card.defEn.length).toBeGreaterThan(5);
      expect(card.exampleEn.length).toBeGreaterThan(10);
      expect(card.exampleVi.length).toBeGreaterThan(10);
      expect(Array.isArray(card.collocations)).toBe(true);
      expect(card.collocations.length).toBeGreaterThanOrEqual(2);
    }
  });
});
