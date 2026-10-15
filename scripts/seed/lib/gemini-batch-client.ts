import { setTimeout as sleep } from 'node:timers/promises';
import type { NormalizedWordEntry } from '../02-normalize';

export interface GeminiBatchItemResult {
  word: string;
  partOfSpeech: string;
  phonetic: string;
  meaningVi: string;
  meaningEn: string;
  exampleSentence: string;
  exampleTranslation: string;
  collocations: string[];
  mnemonic: string;
  audioUrl?: string | null;
}

export interface GeminiClientOptions {
  apiKey?: string;
  model?: string;
  fetchFn?: typeof fetch;
  sleepFn?: (ms: number) => Promise<void>;
  maxRetries?: number;
  baseDelayMs?: number;
  jitterMaxMs?: number;
}

/**
 * Calculates exponential backoff delay with random jitter.
 * Formula: Base * (2 ^ retryCount) + Random(0, jitterMaxMs)
 */
export function calculateBackoffDelay(
  retryCount: number,
  baseMs = 1000,
  jitterMaxMs = 500
): number {
  const exponential = baseMs * Math.pow(2, retryCount);
  const jitter = Math.floor(Math.random() * (jitterMaxMs + 1));
  return exponential + jitter;
}

/**
 * Extracts JSON array from LLM response text, safely handling markdown code blocks (EC-LIB-002).
 */
export function parseGeminiJsonResponse(rawText: string): GeminiBatchItemResult[] {
  let cleaned = rawText.trim();

  // Strip markdown fenced blocks if present
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/, '').trim();
  }

  // Find array boundaries if extra text exists
  const startIdx = cleaned.indexOf('[');
  const endIdx = cleaned.lastIndexOf(']');
  if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
    cleaned = cleaned.substring(startIdx, endIdx + 1);
  }

  const parsed = JSON.parse(cleaned);
  if (!Array.isArray(parsed)) {
    throw new Error('Gemini response did not return a JSON array');
  }

  return parsed;
}

/**
 * Calls Google Gemini Flash API in batches of words with retry backoff + jitter for HTTP 429 and network errors.
 */
export async function callGeminiBatchWithRetry(
  entries: NormalizedWordEntry[],
  options: GeminiClientOptions = {}
): Promise<GeminiBatchItemResult[]> {
  const apiKey = options.apiKey || process.env.GEMINI_API_KEY || '';
  const model = options.model || 'gemini-2.5-flash';
  const fetchFn = options.fetchFn || globalThis.fetch;
  const sleepFn = options.sleepFn || sleep;
  const maxRetries = options.maxRetries ?? 5;
  const baseDelayMs = options.baseDelayMs ?? 1000;
  const jitterMaxMs = options.jitterMaxMs ?? 500;

  const wordsPrompt = entries
    .map((e) => `- ${e.word} (${e.partOfSpeech}) [Topic: ${e.topicCategory}, Level: ${e.level}]`)
    .join('\n');

  const promptText = `You are a lexicographer for WordStreak. Enrich these ${entries.length} English words for Vietnamese learners.
Output ONLY a strict JSON array of objects matching:
[
  {
    "word": "headword in lowercase",
    "partOfSpeech": "canonical pos (noun, verb, adjective, adverb, etc.)",
    "phonetic": "/.../ (valid IPA enclosed in forward slashes)",
    "meaningVi": "nghĩa tiếng Việt ngắn gọn, chuẩn xác",
    "meaningEn": "concise English definition",
    "exampleSentence": "A professional sentence containing the exact word or its inflected form",
    "exampleTranslation": "Bản dịch tiếng Việt của câu ví dụ",
    "collocations": ["collocation 1", "collocation 2"],
    "mnemonic": "Mẹo nhớ từ trực quan cho người Việt"
  }
]

Words to enrich:
${wordsPrompt}`;

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (apiKey) {
    headers['x-goog-api-key'] = apiKey;
  }

  let attempt = 0;
  while (attempt <= maxRetries) {
    try {
      const response = await fetchFn(url, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          contents: [{ parts: [{ text: promptText }] }],
          generationConfig: {
            temperature: 0.2,
            responseMimeType: 'application/json',
          },
        }),
      });

      if (!response.ok) {
        if (response.status === 429 || response.status >= 500) {
          if (attempt < maxRetries) {
            const delay = calculateBackoffDelay(attempt, baseDelayMs, jitterMaxMs);
            console.warn(
              `[GeminiBatch] HTTP ${response.status} Rate Limit. Retry ${attempt + 1}/${maxRetries} after ${delay}ms...`
            );
            await sleepFn(delay);
            attempt++;
            continue;
          }
        }
        const errText = await response.text().catch(() => '');
        throw new Error(`Gemini API error (HTTP ${response.status}): ${errText}`);
      }

      const data = await response.json();
      const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!rawText) {
        throw new Error('Empty response content received from Gemini API');
      }

      return parseGeminiJsonResponse(rawText);
    } catch (err: any) {
      const isRetryableNetworkError =
        err?.message?.includes('429') ||
        err?.name === 'FetchError' ||
        (err instanceof TypeError && err?.message?.includes('fetch failed')) ||
        err?.message?.includes('fetch failed') ||
        err?.code === 'ETIMEDOUT' ||
        err?.code === 'ENOTFOUND' ||
        err?.code === 'ECONNRESET' ||
        err?.cause?.code === 'ETIMEDOUT' ||
        err?.cause?.code === 'ENOTFOUND' ||
        err?.cause?.code === 'ECONNRESET';

      if (attempt < maxRetries && isRetryableNetworkError) {
        const delay = calculateBackoffDelay(attempt, baseDelayMs, jitterMaxMs);
        console.warn(`[GeminiBatch] Network error (${err.message}). Retry ${attempt + 1}/${maxRetries} after ${delay}ms...`);
        await sleepFn(delay);
        attempt++;
      } else {
        throw err;
      }
    }
  }

  throw new Error(`Exceeded maximum retries (${maxRetries}) calling Gemini API.`);
}
