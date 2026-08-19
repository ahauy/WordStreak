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
