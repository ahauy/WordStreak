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
  phonetic?: string | null;
  audioUrl?: string | null;
  exampleSentence?: string | null;
  collocations?: string | null;
  mnemonic?: string | null;
  imageUrl?: string | null;
}

export interface UpdateCardDto {
  word?: string;
  meaning?: string;
  phonetic?: string | null;
  audioUrl?: string | null;
  exampleSentence?: string | null;
  collocations?: string | null;
  mnemonic?: string | null;
  imageUrl?: string | null;
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

export type ConflictStrategy = "SKIP" | "OVERWRITE" | "KEEP_BOTH";
export type RowConflictAction = "DEFAULT" | "SKIP" | "OVERWRITE" | "KEEP_BOTH";

export interface CardBatchItemDto {
  word: string;
  meaning: string;
  phonetic?: string | null;
  audioUrl?: string | null;
  exampleSentence?: string | null;
  collocations?: string | null;
  mnemonic?: string | null;
  imageUrl?: string | null;
  conflictStrategy?: ConflictStrategy;
  conflictAction?: ConflictStrategy;
  rowConflictAction?: RowConflictAction;
}

export interface BulkImportCardsDto {
  cards: CardBatchItemDto[];
  defaultConflictStrategy?: ConflictStrategy;
  conflictStrategy?: ConflictStrategy;
  defaultStrategy?: ConflictStrategy;
  createAsNewDeck?: boolean;
  newDeckTitle?: string;
}

export interface BulkImportErrorItem {
  index: number;
  word: string;
  reason: string;
}

export interface BulkImportCardsResult {
  success: boolean;
  deckId: string;
  totalSubmitted: number;
  imported: number;
  skipped: number;
  overwritten: number;
  errors?: BulkImportErrorItem[];
  message: string;
}

export interface ImportBatchResult {
  totalSubmitted: number;
  imported: number;
  overwritten: number;
  skipped: number;
  errors?: string[];
}

export type StandardCardField =
  | "word"
  | "meaning"
  | "phonetic"
  | "exampleSentence"
  | "collocations"
  | "mnemonic"
  | "imageUrl"
  | "audioUrl";
