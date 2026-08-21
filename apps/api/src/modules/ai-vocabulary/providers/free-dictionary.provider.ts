import { Injectable, Logger } from '@nestjs/common';
import { AiGeneratedCardData } from '@wordstreak/shared-types';

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

      const data = await response.json();
      if (!Array.isArray(data) || data.length === 0) {
        return null;
      }

      const entry = data[0];
      const phonetic = entry.phonetic || entry.phonetics?.find((p: any) => p.text)?.text || '';
      const audioUrl = entry.phonetics?.find((p: any) => p.audio && p.audio.endsWith('.mp3'))?.audio || null;

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
        meaningVi: definition, // Free dictionary provides English definitions
        meaningEn: definition,
        exampleSentence: example,
        exampleTranslation: '',
        collocations,
        mnemonic: '',
        audioUrl,
      };
    } catch (err: any) {
      if (err.name === 'AbortError') {
        this.logger.warn(`Free Dictionary API timed out for word: ${word}`);
      } else {
        this.logger.debug(`Free Dictionary API lookup failed for "${word}": ${err.message}`);
      }
      return null;
    } finally {
      clearTimeout(timeoutId);
    }
  }
}
