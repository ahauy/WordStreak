import type {
  DiffSpan,
  VoicePronunciationTier,
} from '@wordstreak/shared-types';

/**
 * Normalizes input string by lowercasing, trimming, and stripping punctuation.
 */
export function normalizePronunciationText(text: string): string {
  if (!text) return '';
  return text
    .toLowerCase()
    .trim()
    .replace(/[.,/#!$%^&*;:{}=\-_`~()?"'’]/g, '')
    .replace(/\s+/g, ' ');
}

/**
 * Computes Levenshtein edit distance between two strings using 2-row dynamic programming.
 */
export function computeLevenshteinDistance(a: string, b: string): number {
  if (a === b) return 0;
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  let prevRow = Array.from({ length: b.length + 1 }, (_, i) => i);
  const currRow = new Array<number>(b.length + 1);

  for (let i = 0; i < a.length; i++) {
    currRow[0] = i + 1;
    for (let j = 0; j < b.length; j++) {
      const cost = a[i] === b[j] ? 0 : 1;
      currRow[j + 1] = Math.min(
        currRow[j] + 1, // Insertion
        prevRow[j + 1] + 1, // Deletion
        prevRow[j] + cost, // Substitution
      );
    }
    prevRow = [...currRow];
  }

  return prevRow[b.length];
}

/**
 * Calculates normalized pronunciation accuracy percentage (0-100), grading tier, and pass status.
 */
export function computePronunciationScore(
  targetWord: string,
  spokenTranscript: string,
): {
  score: number;
  tier: VoicePronunciationTier;
  isPassed: boolean;
} {
  const normTarget = normalizePronunciationText(targetWord);
  const normSpoken = normalizePronunciationText(spokenTranscript);

  if (!normTarget && !normSpoken) {
    return { score: 100, tier: 'EXACT', isPassed: true };
  }
  if (!normTarget || !normSpoken) {
    return { score: 0, tier: 'RETRY', isPassed: false };
  }
  if (normTarget === normSpoken) {
    return { score: 100, tier: 'EXACT', isPassed: true };
  }

  const distance = computeLevenshteinDistance(normTarget, normSpoken);
  const maxLen = Math.max(normTarget.length, normSpoken.length);
  const rawScore = Math.round((1 - distance / maxLen) * 100);
  const score = Math.max(0, Math.min(100, rawScore));

  if (score === 100) {
    return { score: 100, tier: 'EXACT', isPassed: true };
  }
  if (score >= 80) {
    return { score, tier: 'CLOSE', isPassed: true };
  }
  return { score, tier: 'RETRY', isPassed: false };
}

/**
 * Computes character-level differences using Longest Common Subsequence (LCS).
 * Produces diff spans with types: MATCH, MISSING, EXTRA, WRONG.
 */
export function computeDiffSpans(
  targetWord: string,
  spokenTranscript: string,
): DiffSpan[] {
  const normTarget = normalizePronunciationText(targetWord);
  const normSpoken = normalizePronunciationText(spokenTranscript);

  if (normTarget === normSpoken) {
    return normTarget.split('').map((char) => ({ char, type: 'MATCH' }));
  }

  const n = normSpoken.length;
  const m = normTarget.length;
  const dp: number[][] = Array.from({ length: n + 1 }, () =>
    new Array<number>(m + 1).fill(0),
  );

  for (let i = 1; i <= n; i++) {
    for (let j = 1; j <= m; j++) {
      if (normSpoken[i - 1] === normTarget[j - 1]) {
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
    if (i > 0 && j > 0 && normSpoken[i - 1] === normTarget[j - 1]) {
      diffSpans.push({ char: normSpoken[i - 1], type: 'MATCH' });
      i--;
      j--;
    } else if (
      i > 0 &&
      j > 0 &&
      dp[i - 1][j - 1] === dp[i - 1][j] &&
      dp[i - 1][j - 1] === dp[i][j - 1]
    ) {
      diffSpans.push({ char: normSpoken[i - 1], type: 'WRONG' });
      i--;
      j--;
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      diffSpans.push({ char: normTarget[j - 1], type: 'MISSING' });
      j--;
    } else if (i > 0 && (j === 0 || dp[i - 1][j] >= dp[i][j - 1])) {
      diffSpans.push({ char: normSpoken[i - 1], type: 'EXTRA' });
      i--;
    }
  }

  return diffSpans.reverse();
}
