import { describe, it, expect } from "vitest";
import {
  escapeCsvCellForExport,
  filterCardsForExport,
  generateCardsCsv,
  generateSampleCsvTemplate,
} from "../exportGenerator";
import type { CardResponse } from "@wordstreak/shared-types";

describe("exportGenerator", () => {
  describe("escapeCsvCellForExport", () => {
    it("escapes formula injection characters with single quote", () => {
      expect(escapeCsvCellForExport("=CMD|' /C calc'!A0")).toBe(
        "'=CMD|' /C calc'!A0",
      );
      expect(escapeCsvCellForExport("@SUM(A1:A10)")).toBe("'@SUM(A1:A10)");
      expect(escapeCsvCellForExport("+1+1")).toBe("'+1+1");
    });

    it("preserves plain numbers without prepending quotes", () => {
      expect(escapeCsvCellForExport("-5")).toBe("-5");
      expect(escapeCsvCellForExport("+10")).toBe("+10");
    });

    it("quotes cells containing commas, newlines, or quotes per RFC 4180", () => {
      expect(escapeCsvCellForExport('Hello, "World"')).toBe(
        '"Hello, ""World"""',
      );
      expect(escapeCsvCellForExport("Line 1\nLine 2")).toBe('"Line 1\nLine 2"');
    });

    it("returns empty string for null or undefined", () => {
      expect(escapeCsvCellForExport(null)).toBe("");
      expect(escapeCsvCellForExport(undefined)).toBe("");
    });
  });

  describe("filterCardsForExport", () => {
    const mockCards: CardResponse[] = [
      {
        id: "c-1",
        deckId: "d-1",
        word: "MasteredWord",
        meaning: "Đã thuộc",
        createdAt: new Date(),
        updatedAt: new Date(),
        progress: {
          status: "MASTERED",
          interval: 30,
          easeFactor: 2.5,
          repetitions: 5,
          nextReviewDate: new Date(),
        },
      },
      {
        id: "c-2",
        deckId: "d-1",
        word: "LearningWord",
        meaning: "Đang học",
        createdAt: new Date(),
        updatedAt: new Date(),
        progress: {
          status: "LEARNING",
          interval: 2,
          easeFactor: 2.5,
          repetitions: 1,
          nextReviewDate: new Date(),
        },
      },
    ];

    it("filters correctly by MASTERED and LEARNING", () => {
      const all = filterCardsForExport(mockCards, "ALL");
      expect(all).toHaveLength(2);

      const mastered = filterCardsForExport(mockCards, "MASTERED");
      expect(mastered).toHaveLength(1);
      expect(mastered[0].word).toBe("MasteredWord");

      const learning = filterCardsForExport(mockCards, "LEARNING");
      expect(learning).toHaveLength(1);
      expect(learning[0].word).toBe("LearningWord");
    });
  });

  describe("generateCardsCsv", () => {
    it("generates CSV with UTF-8 BOM and headers", () => {
      const mockCards: CardResponse[] = [
        {
          id: "c-1",
          deckId: "d-1",
          word: "Resilient",
          meaning: "Kiên cường",
          phonetic: "/rɪˈzɪliənt/",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      const csv = generateCardsCsv(mockCards);
      expect(csv.startsWith("\uFEFF")).toBe(true);
      expect(csv).toContain("Word,Meaning,Phonetic,Example Sentence");
      expect(csv).toContain("Resilient,Kiên cường,/rɪˈzɪliənt/");
    });
  });

  describe("generateSampleCsvTemplate", () => {
    it("generates valid sample CSV template with BOM", () => {
      const template = generateSampleCsvTemplate();
      expect(template.startsWith("\uFEFF")).toBe(true);
      expect(template).toContain("Resilient");
      expect(template).toContain("Ephemeral");
    });
  });
});
