import { describe, it, expect } from "vitest";
import {
  SPOKEN_24_DECKS_CATALOG,
  SAMPLE_SPOKEN_WORDS,
  getSpokenDecksByContext,
  getTotalSpokenWordsCount,
} from "../data/spokenDecks";

describe("NGSL-S Spoken Decks Dataset (Slice 12.2)", () => {
  it("should contain official 24 spoken decks with complete metadata", () => {
    expect(SPOKEN_24_DECKS_CATALOG.length).toBe(24);

    for (const deck of SPOKEN_24_DECKS_CATALOG) {
      expect(deck.id).toBeTruthy();
      expect(deck.slug).toBeTruthy();
      expect(deck.title).toBeTruthy();
      expect(deck.titleVi).toBeTruthy();
      expect(["DAILY_LIFE", "WORKPLACE", "TRAVEL", "EMOTIONS", "SOCIALIZING"]).toContain(deck.context);
      expect(deck.cardsCount).toBeGreaterThanOrEqual(30);
    }
  });

  it("should calculate total spoken words count to 721 words", () => {
    const total = getTotalSpokenWordsCount();
    expect(total).toBe(721);
  });

  it("should filter decks accurately by conversational context", () => {
    const all = getSpokenDecksByContext("ALL");
    expect(all.length).toBe(24);

    const workplace = getSpokenDecksByContext("WORKPLACE");
    expect(workplace.length).toBe(5);
    expect(workplace.every((d) => d.context === "WORKPLACE")).toBe(true);

    const emotions = getSpokenDecksByContext("EMOTIONS");
    expect(emotions.length).toBe(4);
    expect(emotions.every((d) => d.context === "EMOTIONS")).toBe(true);
  });

  it("should contain enriched sample spoken cards with two-way dialogues", () => {
    expect(SAMPLE_SPOKEN_WORDS.length).toBeGreaterThanOrEqual(5);

    for (const card of SAMPLE_SPOKEN_WORDS) {
      expect(card.word.length).toBeGreaterThan(1);
      expect(card.ipa).toMatch(/^\/.*\/$/);
      expect(card.meaningVi.length).toBeGreaterThan(3);
      expect(card.dialogue.speakerA.length).toBeGreaterThan(10);
      expect(card.dialogue.speakerAVi.length).toBeGreaterThan(10);
      expect(card.dialogue.speakerB.length).toBeGreaterThan(10);
      expect(card.dialogue.speakerBVi.length).toBeGreaterThan(10);
      expect(Array.isArray(card.collocations)).toBe(true);
    }
  });
});
