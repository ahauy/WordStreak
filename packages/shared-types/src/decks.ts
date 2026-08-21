export interface DeckStats {
  totalCards: number;
  newCards: number;
  learningCards: number;
  masteredCards: number;
  dueCards: number;
}

export interface DeckResponse {
  id: string;
  userId: string;
  title: string;
  description: string | null;
  color: string;
  icon: string;
  coverImageUrl: string | null;
  tags: string[] | null;
  isPublic: boolean;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
  stats?: DeckStats;
}

export interface CreateDeckDto {
  title: string;
  description?: string;
  color?: string;
  icon?: string;
  coverImageUrl?: string;
  tags?: string[];
  isPublic?: boolean;
}

export interface UpdateDeckDto {
  title?: string;
  description?: string;
  color?: string;
  icon?: string;
  coverImageUrl?: string;
  tags?: string[];
  isPublic?: boolean;
}

export interface QueryDecksDto {
  status?: "active" | "archived" | "all";
  search?: string;
  sortBy?: "createdAt" | "title" | "cardCount";
  sortOrder?: "asc" | "desc";
}

export type ExportFormat = "CSV" | "APKG" | "csv" | "apkg";
export type ExportMasteryFilter =
  | "ALL"
  | "MASTERED"
  | "LEARNING"
  | "NEW"
  | "all"
  | "mastered"
  | "learning"
  | "new";
export type DeckExportFormat = ExportFormat;
export type DeckExportFilter = ExportMasteryFilter;

export interface DeckExportQueryDto {
  format?: ExportFormat;
  status?: ExportMasteryFilter;
}

export interface DeckExportCardItem {
  id: string;
  word: string;
  meaning: string;
  phonetic: string | null;
  exampleSentence: string | null;
  collocations: string | null;
  mnemonic: string | null;
  imageUrl: string | null;
  audioUrl: string | null;
  status: string;
}

export interface DeckExportDataResponse {
  deck: {
    id: string;
    title: string;
    description: string | null;
    tags: string[] | null;
    isPublic: boolean;
    totalCards: number;
  };
  cards: DeckExportCardItem[];
}
