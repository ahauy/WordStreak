import type { DiffSpan, DiffSpanType } from "@wordstreak/shared-types";

/**
 * Normalizes spelling for active recall comparison.
 * Trims whitespace, converts to lowercase, replaces curly apostrophes,
 * removes non-alphanumeric punctuation and collapses multiple spaces.
 */
export function normalizeSpelling(str: string): string {
  if (!str) return "";
  return str
    .trim()
    .toLowerCase()
    .replace(/[’‘]/g, "'")
    .replace(/[!?,;:.()"']/g, "")
    .replace(/[-_]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Validates user submission against the target word.
 * Performs relaxed comparison taking punctuation, hyphens, and contractions into account.
 */
export function checkAnswer(submitted: string, target: string): boolean {
  if (!submitted || !target) return false;

  const sNorm = normalizeSpelling(submitted);
  const tNorm = normalizeSpelling(target);

  if (sNorm === tNorm) return true;

  // Also check stripped alphanumeric representation (e.g. dont vs don't, state-of-the-art vs state of the art)
  const stripAll = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");
  return stripAll(submitted) === stripAll(target);
}

/**
 * Computes character-level differences using Longest Common Subsequence (LCS).
 * Classifies each character as MATCH, MISSING (omitted by user), EXTRA (extra typed), or WRONG (substituted).
 */
export function computeCharacterDiff(
  submitted: string,
  target: string,
): DiffSpan[] {
  if (submitted === target) {
    return Array.from(submitted).map((char) => ({
      char,
      type: "MATCH" as DiffSpanType,
    }));
  }

  const s = submitted.toLowerCase();
  const t = target.toLowerCase();
  const n = s.length;
  const m = t.length;

  // DP table for LCS
  const dp: number[][] = Array.from({ length: n + 1 }, () =>
    Array(m + 1).fill(0),
  );

  for (let i = 1; i <= n; i++) {
    for (let j = 1; j <= m; j++) {
      if (s[i - 1] === t[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }

  // Backtracking to construct diff
  const diffSpans: DiffSpan[] = [];
  let i = n;
  let j = m;

  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && s[i - 1] === t[j - 1]) {
      diffSpans.push({ char: s[i - 1], type: "MATCH" });
      i--;
      j--;
    } else if (
      i > 0 &&
      j > 0 &&
      dp[i - 1][j - 1] === dp[i - 1][j] &&
      dp[i - 1][j - 1] === dp[i][j - 1]
    ) {
      // Substitution (user typed wrong character)
      diffSpans.push({ char: s[i - 1], type: "WRONG" });
      i--;
      j--;
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      // Target character missing from user input
      diffSpans.push({ char: t[j - 1], type: "MISSING" });
      j--;
    } else if (i > 0 && (j === 0 || dp[i - 1][j] >= dp[i][j - 1])) {
      // Extra character typed by user
      diffSpans.push({ char: s[i - 1], type: "EXTRA" });
      i--;
    }
  }

  return diffSpans.reverse();
}
