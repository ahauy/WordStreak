export interface CardProgressInfo {
  status: "NEW" | "LEARNING" | "REVIEW" | "MASTERED" | string;
  interval: number;
  easeFactor: number;
  repetitions: number;
  nextReviewDate: string | Date;
  lastReviewedAt?: string | Date | null;
}

export interface CardResponse {
  id: string;
  deckId: string;
  word: string;
  meaning: string;
  phonetic?: string | null;
  audioUrl?: string | null;
  exampleSentence?: string | null;
  collocations?: string | null;
  mnemonic?: string | null;
  imageUrl?: string | null;
  createdAt: string | Date;
  updatedAt: string | Date;
  progress?: CardProgressInfo | null;
}

export interface CreateCardDto {
  word: string;
  meaning: string;
  phonetic?: string;
  audioUrl?: string;
  exampleSentence?: string;
  collocations?: string;
  mnemonic?: string;
  imageUrl?: string;
}

export interface UpdateCardDto {
  word?: string;
  meaning?: string;
  phonetic?: string;
  audioUrl?: string;
  exampleSentence?: string;
  collocations?: string;
  mnemonic?: string;
  imageUrl?: string;
}

export type CardStatusFilter = "ALL" | "NEW" | "LEARNING" | "MASTERED";

export interface QueryCardsDto {
  page?: number;
  limit?: number;
  search?: string;
  status?: CardStatusFilter;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface PaginatedCardsResponse {
  data: CardResponse[];
  meta: PaginationMeta;
}

export type BulkCardActionType = "DELETE" | "MOVE" | "RESET_PROGRESS";

export interface BulkCardActionDto {
  action: BulkCardActionType;
  cardIds: string[];
  targetDeckId?: string;
}

export interface BulkCardActionResult {
  success: boolean;
  action: BulkCardActionType;
  affectedCount: number;
  message: string;
}
