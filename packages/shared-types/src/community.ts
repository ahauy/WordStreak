export type CommunityDeckSort = "POPULAR" | "TOP_RATED" | "NEWEST";

export type CommunityCategory =
  | "ALL"
  | "IELTS"
  | "TOEIC"
  | "TOEFL"
  | "General English"
  | "Business English"
  | "Academic"
  | "Daily Conversation"
  | "Grammar & Vocab";

export interface PublicAuthorDto {
  id: string;
  name: string | null;
  username: string;
  avatarUrl: string | null;
}

export interface CommunityDeckItem {
  id: string;
  title: string;
  description: string | null;
  color: string | null;
  icon: string | null;
  coverImageUrl: string | null;
  category: string | null;
  tags: string[] | null;
  totalCards: number;
  cloneCount: number;
  averageRating: number;
  totalRatings: number;
  author: PublicAuthorDto;
  createdAt: string;
  updatedAt: string;
  isOwner?: boolean;
}

export interface CommunityDeckCardPreview {
  id: string;
  word: string;
  meaning: string;
  phonetic: string | null;
  audioUrl: string | null;
  exampleSentence: string | null;
  collocations: string | null;
  mnemonic: string | null;
}

export interface CommunityDeckDetailResponse {
  deck: CommunityDeckItem;
  cards: CommunityDeckCardPreview[];
  userRating?: {
    rating: number;
    comment: string | null;
    createdAt: string;
  } | null;
  hasCloned?: boolean;
}

export interface CommunityDecksQueryDto {
  search?: string;
  category?: string;
  tag?: string;
  sort?: CommunityDeckSort;
  page?: number;
  limit?: number;
}

export interface PaginatedCommunityDecksResponse {
  items: CommunityDeckItem[];
  meta: {
    totalItems: number;
    itemCount: number;
    itemsPerPage: number;
    totalPages: number;
    currentPage: number;
  };
}

export interface CloneDeckResponse {
  success: boolean;
  clonedDeckId: string;
  clonedDeckTitle: string;
  totalCardsCloned: number;
  message: string;
}

export interface RateDeckDto {
  rating: number; // 1 to 5
  comment?: string;
}

export interface RateDeckResponse {
  success: boolean;
  averageRating: number;
  totalRatings: number;
  userRating: {
    rating: number;
    comment: string | null;
  };
  message: string;
}
