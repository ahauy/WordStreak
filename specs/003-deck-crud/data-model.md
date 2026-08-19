# Data Model: Deck CRUD & Management

**Feature**: `003-deck-crud`  
**Prisma Schema Target**: `apps/api/prisma/schema.prisma`

---

## 1. Entity Definitions

### `Deck` Model

```prisma
model Deck {
  id            String    @id @default(uuid())
  userId        String
  title         String
  description   String?
  color         String    @default("#6366F1")
  icon          String    @default("Book")
  coverImageUrl String?
  tags          String?   // JSON array string e.g. '["IELTS", "Writing"]'
  isPublic      Boolean   @default(false)
  isArchived    Boolean   @default(false)
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  user          User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  cards         Card[]

  @@index([userId, isArchived])
  @@map("decks")
}
```

---

## 2. DTOs & Response Interfaces (`packages/shared-types`)

```typescript
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
```
