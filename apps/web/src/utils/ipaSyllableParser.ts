import type { IpaSyllableToken } from "@wordstreak/shared-types";

/**
 * Normalizes and cleans raw IPA strings by stripping phonetic delimiters.
 */
function cleanIpaWrapper(ipa: string): string {
  if (!ipa) return "";
  return ipa
    .trim()
    .replace(/^[/[]+/, "")
    .replace(/[/\]]+$/, "")
    .trim();
}

/**
 * Splits a normalized IPA string into raw syllable fragments.
 * Handles dots (.), hyphens (-), whitespace, and stress boundary splits.
 */
function splitIpaFragments(cleanIpa: string): string[] {
  if (!cleanIpa) return [];

  // Insert syllable boundary delimiter before stress markers if preceded by a letter/symbol
  const withStressBoundaries = cleanIpa.replace(
    /([^\s.\-ˈˌ/])([ˈˌ])/g,
    "$1.$2",
  );

  // Split on dots, hyphens, and whitespace
  return withStressBoundaries
    .split(/[.\-\s]+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

/**
 * Parses an individual IPA syllable fragment into an IpaSyllableToken.
 */
function parseToken(rawFragment: string): IpaSyllableToken | null {
  const isPrimary = rawFragment.includes("ˈ");
  const isSecondary = !isPrimary && rawFragment.includes("ˌ");

  // Clean the syllable text
  const cleanSyllable = rawFragment.replace(/[ˈˌ.\-\s/[\]]/g, "").trim();

  if (!cleanSyllable) return null;

  return {
    syllable: cleanSyllable,
    isPrimaryStress: isPrimary,
    isSecondaryStress: isSecondary,
    rawIpa: rawFragment,
  };
}

/**
 * Parses an IPA phonetic representation into structured syllable tokens.
 * Handles primary stress (' / ˈ), secondary stress (ˌ), and syllable dots (.).
 *
 * @example
 * parseIpaSyllables("/ˈel.ɪ.kwənt/")
 * // => [
 * //   { syllable: 'el', isPrimaryStress: true, isSecondaryStress: false },
 * //   { syllable: 'ɪ', isPrimaryStress: false, isSecondaryStress: false },
 * //   { syllable: 'kwənt', isPrimaryStress: false, isSecondaryStress: false }
 * // ]
 */
export function parseIpaSyllables(ipa?: string | null): IpaSyllableToken[] {
  if (!ipa) return [];

  const clean = cleanIpaWrapper(ipa);
  if (!clean) return [];

  const fragments = splitIpaFragments(clean);
  const tokens: IpaSyllableToken[] = [];

  for (const fragment of fragments) {
    const token = parseToken(fragment);
    if (token) {
      tokens.push(token);
    }
  }

  return tokens;
}
