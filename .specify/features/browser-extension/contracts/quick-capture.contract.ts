/**
 * Contract: Quick Capture Card API
 * Endpoint: POST /api/v1/cards/quick-capture
 */

export interface QuickCaptureCardDto {
  word: string;
  deckId?: string;
  contextSentence?: string;
  sourceUrl?: string;
  customDefinition?: string;
}

export interface QuickCaptureResponseDto {
  message: string;
  card: {
    id: string;
    deckId: string;
    front: string;
    back: string;
    phonetic: string | null;
    partOfSpeech: string | null;
    example: string | null;
    notes: string | null;
    state: string;
    easeFactor: number;
    interval: number;
    repetitions: number;
    createdAt: string;
  };
  isDuplicate: boolean;
  deck: {
    id: string;
    title: string;
  };
}
