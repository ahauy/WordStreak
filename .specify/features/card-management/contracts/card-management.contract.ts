export interface QueryCardsDto {
  page?: number;
  limit?: number;
  search?: string;
  status?: "ALL" | "NEW" | "LEARNING" | "MASTERED";
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
