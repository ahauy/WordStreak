import { apiClient } from "../../../common/api/axios";
import type { AiGeneratedCardData } from "@wordstreak/shared-types";

export interface PublicWordResponse {
  card?: AiGeneratedCardData;
  data?: AiGeneratedCardData;
  word?: string;
  partOfSpeech?: string;
  phonetic?: string;
  meaningVi?: string;
  meaningEn?: string;
  exampleSentence?: string;
  exampleTranslation?: string;
  collocations?: string[];
  mnemonic?: string;
  audioUrl?: string | null;
}

export const publicWordService = {
  async getWordDetails(word: string): Promise<AiGeneratedCardData> {
    const encoded = encodeURIComponent(word.trim().toLowerCase());
    
    // Attempt primary route /api/v1/ai/public/word/:word then fallback
    let responseData: unknown;
    try {
      const res = await apiClient.get<PublicWordResponse>(`/v1/ai/public/word/${encoded}`);
      responseData = res.data;
    } catch {
      // Fallback to /ai/public/word/:word if v1 prefix is not used in router
      const res = await apiClient.get<PublicWordResponse>(`/ai/public/word/${encoded}`);
      responseData = res.data;
    }

    const dataObj = responseData as Record<string, unknown>;
    const cardData = (dataObj?.card || dataObj?.data || dataObj) as AiGeneratedCardData;

    return {
      word: cardData.word || word,
      partOfSpeech: cardData.partOfSpeech || "noun",
      phonetic: cardData.phonetic || "",
      meaningVi: cardData.meaningVi || "",
      meaningEn: cardData.meaningEn || "",
      exampleSentence: cardData.exampleSentence || "",
      exampleTranslation: cardData.exampleTranslation || "",
      collocations: Array.isArray(cardData.collocations) ? cardData.collocations : [],
      mnemonic: cardData.mnemonic || "",
      audioUrl: cardData.audioUrl || null,
    };
  },
};
