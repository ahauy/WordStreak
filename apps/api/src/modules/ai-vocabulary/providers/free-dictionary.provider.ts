import { Injectable, Logger } from '@nestjs/common';
import { AiGeneratedCardData } from '@wordstreak/shared-types';

interface FreeDictionaryPhonetic {
  text?: string;
  audio?: string;
}

interface FreeDictionaryDefinition {
  definition?: string;
  example?: string;
}

interface FreeDictionaryMeaning {
  partOfSpeech?: string;
  definitions?: FreeDictionaryDefinition[];
  synonyms?: string[];
}

interface FreeDictionaryEntry {
  word?: string;
  phonetic?: string;
  phonetics?: FreeDictionaryPhonetic[];
  meanings?: FreeDictionaryMeaning[];
}

@Injectable()
export class FreeDictionaryProvider {
  private readonly logger = new Logger(FreeDictionaryProvider.name);

  async lookup(word: string): Promise<AiGeneratedCardData | null> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    try {
      const url = `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`;
      const response = await fetch(url, { signal: controller.signal });

      if (!response.ok) {
        return null;
      }

      const data = (await response.json()) as unknown;
      if (!Array.isArray(data) || data.length === 0) {
        return null;
      }

      const entry = data[0] as FreeDictionaryEntry;
      const phonetic =
        entry.phonetic ||
        entry.phonetics?.find((p) => Boolean(p.text))?.text ||
        '';
      const audioUrl =
        entry.phonetics?.find((p) =>
          Boolean(p.audio && p.audio.endsWith('.mp3')),
        )?.audio || null;

      const firstMeaning = entry.meanings?.[0];
      const partOfSpeech = firstMeaning?.partOfSpeech || 'word';
      const firstDef = firstMeaning?.definitions?.[0];
      const definition = firstDef?.definition || '';
      const example = firstDef?.example || '';

      const synonyms = firstMeaning?.synonyms || [];
      const collocations = Array.isArray(synonyms) ? synonyms.slice(0, 3) : [];

      if (!definition) {
        return null;
      }

      return {
        word: entry.word || word,
        partOfSpeech,
        phonetic,
        meaningVi: definition,
        meaningEn: definition,
        exampleSentence: example,
        exampleTranslation: '',
        collocations,
        mnemonic: '',
        audioUrl,
      };
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'AbortError') {
        this.logger.warn(`Free Dictionary API timed out for word: ${word}`);
      } else {
        const errorMsg = err instanceof Error ? err.message : String(err);
        this.logger.debug(
          `Free Dictionary API lookup failed for "${word}": ${errorMsg}`,
        );
      }
      return null;
    } finally {
      clearTimeout(timeoutId);
    }
  }
}
