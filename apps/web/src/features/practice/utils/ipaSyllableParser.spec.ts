import { describe, it, expect } from "vitest";
import { parseIpaSyllables } from "./ipaSyllableParser";

describe("ipaSyllableParser feature utility", () => {
  it("splits syllables correctly and identifies primary stress", () => {
    const tokens = parseIpaSyllables("/ˈel.ɪ.kwənt/");
    expect(tokens.length).toBe(3);
    expect(tokens[0].isPrimaryStress).toBe(true);
    expect(tokens[1].isPrimaryStress).toBe(false);
  });

  it("handles secondary stress properly", () => {
    const tokens = parseIpaSyllables("ˌʌn.dərˈstænd");
    expect(tokens[0].isSecondaryStress).toBe(true);
    expect(tokens[2].isPrimaryStress).toBe(true);
  });
});
