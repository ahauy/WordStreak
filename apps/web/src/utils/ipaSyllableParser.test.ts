import { describe, it, expect } from "vitest";
import { parseIpaSyllables } from "./ipaSyllableParser";

describe("ipaSyllableParser utility", () => {
  it("should return empty array for null/empty input", () => {
    expect(parseIpaSyllables("")).toEqual([]);
    expect(parseIpaSyllables(null)).toEqual([]);
    expect(parseIpaSyllables(undefined)).toEqual([]);
  });

  it("should parse multi-syllable word with primary stress (/ˈel.ɪ.kwənt/)", () => {
    const tokens = parseIpaSyllables("/ˈel.ɪ.kwənt/");
    expect(tokens).toHaveLength(3);
    expect(tokens[0]).toEqual({
      syllable: "el",
      isPrimaryStress: true,
      isSecondaryStress: false,
      rawIpa: "ˈel",
    });
    expect(tokens[1]).toEqual({
      syllable: "ɪ",
      isPrimaryStress: false,
      isSecondaryStress: false,
      rawIpa: "ɪ",
    });
    expect(tokens[2]).toEqual({
      syllable: "kwənt",
      isPrimaryStress: false,
      isSecondaryStress: false,
      rawIpa: "kwənt",
    });
  });

  it("should parse multi-syllable word with secondary and primary stress (/ˌʌn.dərˈstænd/)", () => {
    const tokens = parseIpaSyllables("/ˌʌn.dərˈstænd/");
    expect(tokens).toHaveLength(3);
    expect(tokens[0]).toEqual({
      syllable: "ʌn",
      isPrimaryStress: false,
      isSecondaryStress: true,
      rawIpa: "ˌʌn",
    });
    expect(tokens[1]).toEqual({
      syllable: "dər",
      isPrimaryStress: false,
      isSecondaryStress: false,
      rawIpa: "dər",
    });
    expect(tokens[2]).toEqual({
      syllable: "stænd",
      isPrimaryStress: true,
      isSecondaryStress: false,
      rawIpa: "ˈstænd",
    });
  });

  it("should parse unstressed first syllable word (bəˈnæn.ə)", () => {
    const tokens = parseIpaSyllables("bəˈnæn.ə");
    expect(tokens).toHaveLength(3);
    expect(tokens[0].syllable).toBe("bə");
    expect(tokens[0].isPrimaryStress).toBe(false);
    expect(tokens[1].syllable).toBe("næn");
    expect(tokens[1].isPrimaryStress).toBe(true);
    expect(tokens[2].syllable).toBe("ə");
    expect(tokens[2].isPrimaryStress).toBe(false);
  });

  it("should handle single syllable words (/kæt/)", () => {
    const tokens = parseIpaSyllables("/kæt/");
    expect(tokens).toHaveLength(1);
    expect(tokens[0]).toEqual({
      syllable: "kæt",
      isPrimaryStress: false,
      isSecondaryStress: false,
      rawIpa: "kæt",
    });
  });
});
