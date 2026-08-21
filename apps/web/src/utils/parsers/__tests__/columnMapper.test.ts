import { describe, it, expect } from "vitest";
import {
  detectFieldForHeader,
  autoMapColumns,
  rowToCardData,
  validateAllRows,
  buildCardBatch,
} from "../columnMapper";
import type { CardResponse } from "@wordstreak/shared-types";

describe("columnMapper", () => {
  describe("detectFieldForHeader", () => {
    it("maps English aliases accurately", () => {
      expect(detectFieldForHeader("Word")).toBe("word");
      expect(detectFieldForHeader("Front")).toBe("word");
      expect(detectFieldForHeader("term")).toBe("word");
      expect(detectFieldForHeader("Vocabulary")).toBe("word");

      expect(detectFieldForHeader("Meaning")).toBe("meaning");
      expect(detectFieldForHeader("Back")).toBe("meaning");
      expect(detectFieldForHeader("Definition")).toBe("meaning");

      expect(detectFieldForHeader("IPA")).toBe("phonetic");
      expect(detectFieldForHeader("Pronunciation")).toBe("phonetic");

      expect(detectFieldForHeader("Example")).toBe("exampleSentence");
      expect(detectFieldForHeader("Sentence")).toBe("exampleSentence");

      expect(detectFieldForHeader("Collocations")).toBe("collocations");
      expect(detectFieldForHeader("Phrasal")).toBe("collocations");

      expect(detectFieldForHeader("Mnemonic")).toBe("mnemonic");
      expect(detectFieldForHeader("Hint")).toBe("mnemonic");
    });

    it("maps Vietnamese aliases accurately", () => {
      expect(detectFieldForHeader("từ vựng")).toBe("word");
      expect(detectFieldForHeader("tu_vung")).toBe("word");
      expect(detectFieldForHeader("từ")).toBe("word");

      expect(detectFieldForHeader("nghĩa")).toBe("meaning");
      expect(detectFieldForHeader("định nghĩa")).toBe("meaning");
      expect(detectFieldForHeader("nghĩa tiếng việt")).toBe("meaning");

      expect(detectFieldForHeader("phiên âm")).toBe("phonetic");
      expect(detectFieldForHeader("phát âm")).toBe("phonetic");

      expect(detectFieldForHeader("ví dụ")).toBe("exampleSentence");
      expect(detectFieldForHeader("câu ví dụ")).toBe("exampleSentence");

      expect(detectFieldForHeader("cụm từ")).toBe("collocations");
      expect(detectFieldForHeader("mẹo nhớ")).toBe("mnemonic");
      expect(detectFieldForHeader("ghi chú")).toBe("mnemonic");
    });

    it("returns ignore for unknown headers", () => {
      expect(detectFieldForHeader("RandomColumn123")).toBe("ignore");
      expect(detectFieldForHeader("")).toBe("ignore");
    });
  });

  describe("autoMapColumns", () => {
    it("maps multiple distinct headers into a ColumnMapping", () => {
      const headers = ["Front", "Back", "IPA", "Example", "Notes"];
      const mapping = autoMapColumns(headers);

      expect(mapping[0]).toBe("word");
      expect(mapping[1]).toBe("meaning");
      expect(mapping[2]).toBe("phonetic");
      expect(mapping[3]).toBe("exampleSentence");
      expect(mapping[4]).toBe("mnemonic");
    });

    it("handles generic columns by positional assignment", () => {
      const genericHeaders = ["Column 1", "Column 2", "Column 3"];
      const mapping = autoMapColumns(genericHeaders);

      expect(mapping[0]).toBe("word");
      expect(mapping[1]).toBe("meaning");
      expect(mapping[2]).toBe("phonetic");
    });
  });

  describe("validateAllRows", () => {
    const mapping = {
      0: "word" as const,
      1: "meaning" as const,
      2: "phonetic" as const,
    };

    const mockExistingCards: CardResponse[] = [
      {
        id: "c-1",
        deckId: "d-1",
        word: "Resilient",
        meaning: "Kiên cường",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    it("identifies valid, duplicate, and invalid rows", () => {
      const rows = [
        ["Eloquent", "Hùng biện", "/ˈeləkwənt/"], // Valid
        ["Resilient", "Kiên cường", "/rɪˈzɪliənt/"], // Duplicate of existing
        ["", "Chỉ có nghĩa không có từ", ""], // Invalid (missing word)
        ["WordOnly", "", ""], // Invalid (missing meaning)
        ["Eloquent", "Từ trùng lặp trong cùng file", ""], // Duplicate intra-file
      ];

      const validated = validateAllRows(
        rows,
        mapping,
        mockExistingCards,
        "SKIP",
      );

      expect(validated[0].status).toBe("VALID");
      expect(validated[0].isDuplicate).toBe(false);

      expect(validated[1].status).toBe("DUPLICATE");
      expect(validated[1].isDuplicate).toBe(true);

      expect(validated[2].status).toBe("INVALID");
      expect(validated[2].errors).toContain("Thiếu từ vựng (Word)");

      expect(validated[3].status).toBe("INVALID");
      expect(validated[3].errors).toContain("Thiếu nghĩa (Meaning)");

      expect(validated[4].status).toBe("DUPLICATE");
    });
  });

  describe("buildCardBatch", () => {
    it("excludes invalid rows and builds DTOs", () => {
      const mapping = { 0: "word" as const, 1: "meaning" as const };
      const rows = [
        ["Tenacious", "Kiên trì"],
        ["", "Thiếu từ"],
      ];

      const validated = validateAllRows(rows, mapping, [], "OVERWRITE");
      const batch = buildCardBatch(validated, "OVERWRITE");

      expect(batch).toHaveLength(1);
      expect(batch[0].word).toBe("Tenacious");
      expect(batch[0].meaning).toBe("Kiên trì");
      expect(batch[0].conflictAction).toBe("OVERWRITE");
    });
  });
});
