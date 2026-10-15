import { describe, it, expect, vi } from 'vitest';
import {
  calculateBackoffDelay,
  callGeminiBatchWithRetry,
  parseGeminiJsonResponse,
} from '../lib/gemini-batch-client';
import type { NormalizedWordEntry } from '../02-normalize';

describe('TC-LIB-004: Gemini Batch Enricher Mock', () => {
  const dummyEntries: NormalizedWordEntry[] = Array.from({ length: 10 }, (_, i) => ({
    idempotencyKey: `TSL:word${i}:noun`,
    word: `word${i}`,
    partOfSpeech: 'noun',
    freqRank: i + 1,
    level: 'T1',
    topicCategory: 'Office & Administration',
  }));

  it('should successfully parse standard JSON and fenced markdown codeblock (EC-LIB-002)', () => {
    const rawFenced = `\`\`\`json
[
  {
    "word": "accommodate",
    "partOfSpeech": "verb",
    "phonetic": "/əˈkɑː.mə.deɪt/",
    "meaningVi": "cung cấp chỗ ở, đáp ứng nhu cầu",
    "meaningEn": "to provide with something desired, needed, or suited",
    "exampleSentence": "The hotel can easily accommodate up to 500 guests.",
    "exampleTranslation": "Khách sạn có thể dễ dàng chứa tới 500 khách.",
    "collocations": ["accommodate needs", "accommodate requests"],
    "mnemonic": "Ắc quy com-mơ-đáp ứng được hết mọi nhu cầu"
  }
]
\`\`\``;

    const parsed = parseGeminiJsonResponse(rawFenced);
    expect(parsed).toHaveLength(1);
    expect(parsed[0].word).toBe('accommodate');
    expect(parsed[0].phonetic).toBe('/əˈkɑː.mə.deɪt/');
    expect(parsed[0].collocations.length).toBeGreaterThanOrEqual(2);
  });

  it('should enrich a batch of 10 words and return complete attributes', async () => {
    const mockResponseArray = dummyEntries.map((e) => ({
      word: e.word,
      partOfSpeech: e.partOfSpeech,
      phonetic: `/${e.word}/`,
      meaningVi: `Nghĩa của ${e.word}`,
      meaningEn: `English definition of ${e.word}`,
      exampleSentence: `Here is a sentence with ${e.word} included.`,
      exampleTranslation: `Bản dịch câu chứa ${e.word}.`,
      collocations: [`${e.word} one`, `${e.word} two`],
      mnemonic: `Mẹo nhớ cho ${e.word}`,
    }));

    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        candidates: [
          {
            content: {
              parts: [{ text: JSON.stringify(mockResponseArray) }],
            },
          },
        ],
      }),
    });

    const results = await callGeminiBatchWithRetry(dummyEntries, {
      apiKey: 'test-api-key',
      fetchFn: mockFetch as unknown as typeof fetch,
      sleepFn: vi.fn(),
    });

    expect(results).toHaveLength(10);
    expect(results[0].phonetic).toBe('/word0/');
    expect(results[0].collocations).toHaveLength(2);
    expect(results[0].exampleSentence).toContain('word0');

    expect(mockFetch).toHaveBeenCalledWith(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent',
      expect.objectContaining({
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': 'test-api-key',
        },
      })
    );
  });
});

describe('TC-LIB-005: Exponential Backoff with Jitter', () => {
  it('should calculate delay within Base * 2^retry + [0, 500]ms', () => {
    // Retry 0: 1000 * 2^0 + [0, 500] => [1000, 1500]
    for (let i = 0; i < 20; i++) {
      const delay0 = calculateBackoffDelay(0, 1000, 500);
      expect(delay0).toBeGreaterThanOrEqual(1000);
      expect(delay0).toBeLessThanOrEqual(1500);
    }

    // Retry 1: 1000 * 2^1 + [0, 500] => [2000, 2500]
    for (let i = 0; i < 20; i++) {
      const delay1 = calculateBackoffDelay(1, 1000, 500);
      expect(delay1).toBeGreaterThanOrEqual(2000);
      expect(delay1).toBeLessThanOrEqual(2500);
    }

    // Retry 2: 1000 * 2^2 + [0, 500] => [4000, 4500]
    const delay2 = calculateBackoffDelay(2, 1000, 500);
    expect(delay2).toBeGreaterThanOrEqual(4000);
    expect(delay2).toBeLessThanOrEqual(4500);
  });

  it('should retry on network errors (TypeError fetch failed) and HTTP 429 exactly up to maxRetries and record jittered delays', async () => {
    const singleEntry: NormalizedWordEntry[] = [
      {
        idempotencyKey: 'TSL:retry:verb',
        word: 'retry',
        partOfSpeech: 'verb',
        freqRank: 1,
        level: 'T1',
        topicCategory: 'Technology',
      },
    ];

    const sleepCalls: number[] = [];
    const mockSleep = vi.fn(async (ms: number) => {
      sleepCalls.push(ms);
    });

    let attempts = 0;
    const mockFetch = vi.fn(async () => {
      attempts++;
      if (attempts === 1) {
        throw new TypeError('fetch failed');
      }
      if (attempts === 2) {
        return {
          ok: false,
          status: 429,
          statusText: 'Too Many Requests',
          text: async () => 'Rate limit exceeded',
        };
      }
      return {
        ok: true,
        status: 200,
        json: async () => ({
          candidates: [
            {
              content: {
                parts: [
                  {
                    text: JSON.stringify([
                      {
                        word: 'retry',
                        partOfSpeech: 'verb',
                        phonetic: '/riːˈtraɪ/',
                        meaningVi: 'thử lại',
                        meaningEn: 'to try again',
                        exampleSentence: 'Please retry the failed operation.',
                        exampleTranslation: 'Vui lòng thử lại thao tác bị lỗi.',
                        collocations: ['retry attempt', 'retry request'],
                        mnemonic: 'Re là lại, try là thử -> thử lại',
                      },
                    ]),
                  },
                ],
              },
            },
          ],
        }),
      };
    });

    const results = await callGeminiBatchWithRetry(singleEntry, {
      apiKey: 'test-api-key',
      fetchFn: mockFetch as unknown as typeof fetch,
      sleepFn: mockSleep,
      maxRetries: 5,
    });

    expect(attempts).toBe(3);
    expect(results).toHaveLength(1);
    expect(results[0].word).toBe('retry');
    expect(sleepCalls).toHaveLength(2);
    expect(sleepCalls[0]).toBeGreaterThanOrEqual(1000);
    expect(sleepCalls[0]).toBeLessThanOrEqual(1500);
    expect(sleepCalls[1]).toBeGreaterThanOrEqual(2000);
    expect(sleepCalls[1]).toBeLessThanOrEqual(2500);
  });
});
