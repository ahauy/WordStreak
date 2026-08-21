import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AiGeneratedCardData } from '@wordstreak/shared-types';

@Injectable()
export class GeminiProvider {
  private readonly logger = new Logger(GeminiProvider.name);
  private readonly apiKey: string | undefined;
  private readonly modelName: string;

  constructor(private readonly configService: ConfigService) {
    this.apiKey = this.configService.get<string>('GEMINI_API_KEY');
    this.modelName =
      this.configService.get<string>('GEMINI_MODEL') || 'gemini-2.5-flash';
  }

  async generate(word: string): Promise<AiGeneratedCardData | null> {
    if (!this.apiKey) {
      this.logger.debug('No GEMINI_API_KEY found, skipping Gemini provider');
      return null;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    try {
      const prompt = `You are an expert English-Vietnamese lexicographer for the WordStreak spaced repetition flashcard app.
The user provided the input: "${word}".
- If the input is an English word or phrase (e.g. "serendipity", "resilient"), generate the full flashcard for that word.
- If the input is in Vietnamese (e.g. "trang giấy", "kiên cường"), determine the most natural English vocabulary word/phrase (e.g. "sheet of paper", "resilient") and generate the flashcard for that English word.

Generate a JSON object matching this exact schema:
{
  "word": "Target English word or phrase (e.g. serendipity, sheet of paper)",
  "partOfSpeech": "noun | verb | adjective | adverb | phrase",
  "phonetic": "/IPA transcription/",
  "meaningVi": "accurate, natural Vietnamese translation/definition",
  "meaningEn": "concise English definition with usage nuance",
  "exampleSentence": "natural English sentence using the word",
  "exampleTranslation": "Vietnamese translation of the example sentence",
  "collocations": ["collocation 1", "collocation 2", "collocation 3"],
  "mnemonic": "clever Vietnamese memory hook, pun, or etymology tip"
}
Respond strictly with a single valid JSON object. Do not include markdown code block syntax (like \`\`\`json), comments, or introductory text.`;

      const url = `https://generativelanguage.googleapis.com/v1beta/models/${this.modelName}:generateContent?key=${this.apiKey}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: prompt }],
            },
          ],
          generationConfig: {
            temperature: 0.2,
            responseMimeType: 'application/json',
            thinkingConfig: {
              thinkingBudget: 0,
            },
          },
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        this.logger.warn(
          `Gemini API returned status ${response.status}: ${response.statusText}`,
        );
        return null;
      }

      const data = await response.json();
      const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!rawText) {
        this.logger.warn('Gemini API returned empty text');
        return null;
      }

      const cleanedText = rawText
        .trim()
        .replace(/^```json\s*/i, '')
        .replace(/\s*```$/i, '');
      const parsed = JSON.parse(cleanedText);

      return this.validateAndNormalize(parsed, word);
    } catch (err: any) {
      if (err.name === 'AbortError') {
        this.logger.warn(`Gemini generation timed out for word: ${word}`);
      } else {
        this.logger.warn(
          `Gemini generation error for "${word}": ${err.message}`,
        );
      }
      return null;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  private validateAndNormalize(
    parsed: any,
    originalWord: string,
  ): AiGeneratedCardData | null {
    if (!parsed || typeof parsed !== 'object') {
      return null;
    }

    const word = String(parsed.word || originalWord).trim();
    const meaningVi = String(parsed.meaningVi || '').trim();

    if (!meaningVi) {
      return null;
    }

    let collocations: string[] = [];
    if (Array.isArray(parsed.collocations)) {
      collocations = parsed.collocations
        .map((c: any) => String(c).trim())
        .filter(Boolean);
    }

    return {
      word,
      partOfSpeech: String(parsed.partOfSpeech || 'word').trim(),
      phonetic: String(parsed.phonetic || '').trim(),
      meaningVi,
      meaningEn: String(parsed.meaningEn || '').trim(),
      exampleSentence: String(parsed.exampleSentence || '').trim(),
      exampleTranslation: String(parsed.exampleTranslation || '').trim(),
      collocations,
      mnemonic: String(parsed.mnemonic || '').trim(),
      audioUrl: null,
    };
  }
}
