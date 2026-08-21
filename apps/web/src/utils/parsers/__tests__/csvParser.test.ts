import { describe, it, expect } from "vitest";
import {
  stripBom,
  sanitizeCsvCell,
  parseCsvText,
  parseCsv,
} from "../csvParser";

describe("csvParser", () => {
  describe("stripBom", () => {
    it("strips UTF-8 BOM if present", () => {
      const withBom = "\uFEFFword,meaning";
      expect(stripBom(withBom)).toBe("word,meaning");
    });

    it("returns unchanged text if no BOM", () => {
      const normal = "word,meaning";
      expect(stripBom(normal)).toBe("word,meaning");
    });
  });

  describe("sanitizeCsvCell", () => {
    it("strips formula injection trigger characters (=, +, -, @)", () => {
      expect(sanitizeCsvCell("=1+1")).toBe("1+1");
      expect(sanitizeCsvCell("@SUM(A1:A10)")).toBe("SUM(A1:A10)");
      expect(sanitizeCsvCell("=CMD|' /C calc'!A0")).toBe("CMD|' /C calc'!A0");
    });

    it("strips single-quote escaped formulas", () => {
      expect(sanitizeCsvCell("'=SUM(A1)")).toBe("SUM(A1)");
      expect(sanitizeCsvCell("'+test")).toBe("test");
    });

    it("preserves normal negative and positive numbers", () => {
      expect(sanitizeCsvCell("-5")).toBe("-5");
      expect(sanitizeCsvCell("+10.5")).toBe("+10.5");
    });

    it("preserves regular text without formula triggers", () => {
      expect(sanitizeCsvCell("Hello World")).toBe("Hello World");
      expect(sanitizeCsvCell("Kiên cường")).toBe("Kiên cường");
    });
  });

  describe("parseCsvText", () => {
    it("parses comma-separated CSV with header row", () => {
      const csv = `Front,Back,IPA\nResilient,Kiên cường,/rɪˈzɪliənt/\nEphemeral,Phù du,/ɪˈfemərəl/`;
      const result = parseCsvText(csv);

      expect(result.headers).toEqual(["Front", "Back", "IPA"]);
      expect(result.rows).toHaveLength(2);
      expect(result.rows[0]).toEqual([
        "Resilient",
        "Kiên cường",
        "/rɪˈzɪliənt/",
      ]);
      expect(result.rows[1]).toEqual(["Ephemeral", "Phù du", "/ɪˈfemərəl/"]);
      expect(result.errors).toHaveLength(0);
    });

    it("auto-detects semicolon and tab delimiters", () => {
      const semiCsv = `Word;Meaning;Example\nUbiquitous;Phổ biến;Everywhere`;
      const semiResult = parseCsvText(semiCsv);
      expect(semiResult.headers).toEqual(["Word", "Meaning", "Example"]);
      expect(semiResult.rows[0]).toEqual([
        "Ubiquitous",
        "Phổ biến",
        "Everywhere",
      ]);

      const tabCsv = `Term\tDefinition\nSerendipity\tSự tình cờ may mắn`;
      const tabResult = parseCsvText(tabCsv);
      expect(tabResult.headers).toEqual(["Term", "Definition"]);
      expect(tabResult.rows[0]).toEqual(["Serendipity", "Sự tình cờ may mắn"]);
    });

    it("handles empty or whitespace text gracefully", () => {
      const emptyResult = parseCsvText("   \n\n  ");
      expect(emptyResult.errors.length).toBeGreaterThan(0);
      expect(emptyResult.rows).toHaveLength(0);
    });

    it("sanitizes CWE-1236 formulas in parsed rows", () => {
      const formulaCsv = `Word,Meaning\nSafeWord,=cmd|' /C calc'!A0`;
      const result = parseCsvText(formulaCsv);
      expect(result.rows[0][1]).toBe("cmd|' /C calc'!A0");
    });
  });

  describe("parseCsv (object records)", () => {
    it("parses CSV into array of records with headers and metadata", () => {
      const csv = `word,meaning,phonetic\nUbiquitous,Phổ biến,/juːˈbɪkwɪtəs/`;
      const result = parseCsv(csv);

      expect(result.headers).toEqual(["word", "meaning", "phonetic"]);
      expect(result.data).toHaveLength(1);
      expect(result.data[0]).toEqual({
        word: "Ubiquitous",
        meaning: "Phổ biến",
        phonetic: "/juːˈbɪkwɪtəs/",
      });
      expect(result.errors).toHaveLength(0);
    });

    it("sanitizes CWE-1236 formulas in parseCsv records", () => {
      const formulaCsv = `word,meaning\nFormula,=1+1\nMalicious,@SUM(A1:A10)`;
      const result = parseCsv(formulaCsv);

      expect(result.data[0].meaning).toBe("1+1");
      expect(result.data[1].meaning).toBe("SUM(A1:A10)");
    });
  });
});
