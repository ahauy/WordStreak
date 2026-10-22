import { describe, it, expect } from "vitest";
import {
  NAWL_ACADEMIC_DECKS,
  getAcademicDecksByBand,
  getAcademicDecksByTopic,
  getTotalAcademicWordsCount,
} from "../data/nawlDecks";

describe("NAWL Academic Decks Dataset (Slice 11.1)", () => {
  it("should contain official academic decks with complete metadata", () => {
    expect(NAWL_ACADEMIC_DECKS.length).toBeGreaterThanOrEqual(4);

    for (const deck of NAWL_ACADEMIC_DECKS) {
      expect(deck.id).toBeTruthy();
      expect(deck.slug).toBeTruthy();
      expect(deck.title).toBeTruthy();
      expect(deck.titleVi).toBeTruthy();
      expect(deck.topic).toBeTruthy();
      expect(["5.5-6.5", "6.5-7.5", "7.5+"]).toContain(deck.bandTarget);
      expect(deck.cards.length).toBe(deck.cardsCount);
    }
  });

  it("should contain enriched academic words with valid IPA, definitions and examples", () => {
    for (const deck of NAWL_ACADEMIC_DECKS) {
      for (const card of deck.cards) {
        expect(card.word.length).toBeGreaterThan(1);
        expect(card.pos).toMatch(/noun|verb|adj|adverb|conjunction/);
        expect(card.ipa).toMatch(/^\/.*\/$/);
        expect(card.meaningVi.length).toBeGreaterThan(3);
        expect(card.defEn.length).toBeGreaterThan(5);
        expect(card.exampleEn.length).toBeGreaterThan(10);
        expect(card.exampleVi.length).toBeGreaterThan(10);
        expect(Array.isArray(card.collocations)).toBe(true);
        expect(card.collocations.length).toBeGreaterThanOrEqual(2);
      }
    }
  });

  it("should correctly filter decks by IELTS target band", () => {
    const all = getAcademicDecksByBand("ALL");
    expect(all.length).toBe(NAWL_ACADEMIC_DECKS.length);

    const band5to6 = getAcademicDecksByBand("5.5-6.5");
    expect(band5to6.length).toBeGreaterThan(0);
    expect(band5to6.every((d) => d.bandTarget === "5.5-6.5")).toBe(true);

    const band7Plus = getAcademicDecksByBand("7.5+");
    expect(band7Plus.length).toBeGreaterThan(0);
    expect(band7Plus.every((d) => d.bandTarget === "7.5+")).toBe(true);
  });

  it("should correctly filter decks by academic topic", () => {
    const researchDecks = getAcademicDecksByTopic("Research");
    expect(researchDecks.length).toBeGreaterThan(0);
    expect(researchDecks[0].topic).toBe("Research");

    const nonExistent = getAcademicDecksByTopic("NonExistent");
    expect(nonExistent.length).toBe(0);
  });

  it("should calculate total words count accurately", () => {
    const total = getTotalAcademicWordsCount();
    const expected = NAWL_ACADEMIC_DECKS.reduce((acc, d) => acc + d.cardsCount, 0);
    expect(total).toBe(expected);
    expect(total).toBeGreaterThanOrEqual(34);
  });
});
