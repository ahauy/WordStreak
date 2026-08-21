import {
  VoicePronunciationTier,
  type DiffSpan,
  type DiffSpanType,
} from "@wordstreak/shared-types";

/**
 * Normalizes speech recognition transcript and target words for comparison.
 * Lowercases, strips punctuation (except inner apostrophes), collapses multiple whitespace.
 */
export function normalizeTranscript(text: string): string {
  if (!text) return "";
  return text
    .toLowerCase()
    .replace(/[’‘]/g, "'")
    .replace(/[“”"«»]/g, "")
    .replace(/[!?,;:.()#*~`]/g, "")
    .replace(/[-_]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Computes classic Levenshtein edit distance between two strings.
 */
export function levenshteinDistance(a: string, b: string): number {
  if (a === b) return 0;
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  const matrix: number[][] = Array.from({ length: a.length + 1 }, () =>
    Array(b.length + 1).fill(0),
  );

  for (let i = 0; i <= a.length; i++) matrix[i][0] = i;
  for (let j = 0; j <= b.length; j++) matrix[0][j] = j;

  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1, // deletion
        matrix[i][j - 1] + 1, // insertion
        matrix[i - 1][j - 1] + cost, // substitution
      );
    }
  }

  return matrix[a.length][b.length];
}

/**
 * Calculates normalized pronunciation accuracy score from 0 to 100.
 * 100 for exact match, 0 for completely mismatched strings.
 */
export function calculateAccuracyScore(target: string, spoken: string): number {
  const normTarget = normalizeTranscript(target);
  const normSpoken = normalizeTranscript(spoken);

  if (!normTarget && !normSpoken) return 100;
  if (!normTarget || !normSpoken) return 0;
  if (normTarget === normSpoken) return 100;

  const maxLen = Math.max(normTarget.length, normSpoken.length);
  if (maxLen === 0) return 100;

  const distance = levenshteinDistance(normTarget, normSpoken);
  const rawScore = (1 - distance / maxLen) * 100;
  return Math.max(0, Math.min(100, Math.round(rawScore)));
}

/**
 * Maps numerical accuracy score (0-100) to standard VoicePronunciationTier.
 * - EXACT: 100%
 * - CLOSE: 80% to 99%
 * - RETRY: < 80%
 */
export function getPronunciationTier(score: number): VoicePronunciationTier {
  if (score >= 100) {
    return VoicePronunciationTier.EXACT;
  }
  if (score >= 80) {
    return VoicePronunciationTier.CLOSE;
  }
  return VoicePronunciationTier.RETRY;
}

/**
 * Computes character-level differences using Longest Common Subsequence (LCS).
 * Produces diff tokens with types: MATCH, MISSING, EXTRA, WRONG.
 */
export function computePronunciationDiff(
  target: string,
  spoken: string,
): DiffSpan[] {
  const t = normalizeTranscript(target);
  const s = normalizeTranscript(spoken);

  if (t === s) {
    return Array.from(t).map((char) => ({
      char,
      type: "MATCH" as DiffSpanType,
    }));
  }

  const n = s.length;
  const m = t.length;
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
      diffSpans.push({ char: s[i - 1], type: "WRONG" });
      i--;
      j--;
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      diffSpans.push({ char: t[j - 1], type: "MISSING" });
      j--;
    } else if (i > 0 && (j === 0 || dp[i - 1][j] >= dp[i][j - 1])) {
      diffSpans.push({ char: s[i - 1], type: "EXTRA" });
      i--;
    }
  }

  return diffSpans.reverse();
}
