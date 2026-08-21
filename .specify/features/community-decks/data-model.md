# Data Model: Community Decks Marketplace (US-ECO-02)

**Feature Slug**: `community-decks`  
**Date**: 2026-08-22  
**Status**: APPROVED

---

## 1. Database Schema Extensions (Prisma)

```prisma
model Deck {
  id            String       @id @default(uuid())
  userId        String
  title         String
  description   String?
  color         String?
  icon          String?
  coverImageUrl String?
  category      String?      // e.g., 'IELTS', 'TOEIC', 'Business English', 'Daily Conversation'
  tags          String?      // JSON array of strings or comma-separated
  isPublic      Boolean      @default(false)
  isArchived    Boolean      @default(false)
  cloneCount    Int          @default(0)
  averageRating Float        @default(0.0)
  totalRatings  Int          @default(0)
  originalDeckId String?     // ID of the source deck if this deck was cloned

  user          User         @relation(fields: [userId], references: [id], onDelete: Cascade)
  cards         Card[]
  ratings       DeckRating[]
  sourceDeck    Deck?        @relation("DeckClones", fields: [originalDeckId], references: [id], onDelete: SetNull)
  clones        Deck[]       @relation("DeckClones")

  createdAt     DateTime     @default(now())
  updatedAt     DateTime     @updatedAt

  @@index([userId])
  @@index([isPublic, isArchived, cloneCount])
  @@index([isPublic, isArchived, averageRating])
  @@index([category])
  @@map("decks")
}

model DeckRating {
  id        String   @id @default(uuid())
  deckId    String
  userId    String
  rating    Int      // 1 to 5 stars
  comment   String?  @db.VarChar(500)

  deck      Deck     @relation(fields: [deckId], references: [id], onDelete: Cascade)
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@unique([deckId, userId])
  @@index([deckId])
  @@index([userId])
  @@map("deck_ratings")
}
```

---

## 2. Enums & Value Objects

```typescript
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
```

---

## 3. Data Transfer Objects (DTOs) & Contracts

### 3.1 Community Query & Response DTOs (`packages/shared-types/src/community.ts`)

```typescript
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
  sort?: CommunityDeckSort; // Default: 'POPULAR'
  page?: number; // Default: 1
  limit?: number; // Default: 12
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
```
