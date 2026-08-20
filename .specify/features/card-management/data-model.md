# Data Model: Card List Management & Search/Filter (US-CARD-02)

## 1. Entities & Schema Representation

```prisma
// Relevant existing schema entities in prisma/schema.prisma

model Card {
  id              String   @id @default(uuid())
  deckId          String   @map("deck_id")
  word            String
  meaning         String
  phonetic        String?
  audioUrl        String?  @map("audio_url")
  exampleSentence String?  @map("example_sentence")
  collocations    String?
  mnemonic        String?
  imageUrl        String?  @map("image_url")
  createdAt       DateTime @default(now()) @map("created_at")
  updatedAt       DateTime @updatedAt @map("updated_at")

  deck     Deck               @relation(fields: [deckId], references: [id], onDelete: Cascade)
  progress UserCardProgress[]

  @@index([deckId])
  @@index([deckId, word])
  @@map("cards")
}

model UserCardProgress {
  id             String    @id @default(uuid())
  userId         String    @map("user_id")
  cardId         String    @map("card_id")
  status         String    @default("NEW") // NEW, LEARNING, REVIEW, MASTERED
  interval       Int       @default(0)
  easeFactor     Float     @default(2.5) @map("ease_factor")
  repetitions    Int       @default(0)
  nextReviewDate DateTime  @default(now()) @map("next_review_date")
  lastReviewedAt DateTime? @map("last_reviewed_at")
  createdAt      DateTime  @default(now()) @map("created_at")
  updatedAt      DateTime  @updatedAt @map("updated_at")

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
  card Card @relation(fields: [cardId], references: [id], onDelete: Cascade)

  @@unique([userId, cardId])
  @@index([userId, status])
  @@index([userId, nextReviewDate])
  @@map("user_card_progress")
}
```

## 2. Query & DTO Contracts

- **`QueryCardsDto`**:
  - `page?: number` (default `1`, min `1`)
  - `limit?: number` (default `20`, min `1`, max `100`)
  - `search?: string` (optional, trimmed)
  - `status?: 'ALL' | 'NEW' | 'LEARNING' | 'MASTERED'` (default `'ALL'`)
- **`PaginatedCardsResponse`**:
  - `data: CardResponse[]`
  - `meta: { total: number; page: number; limit: number; totalPages: number; hasNextPage: boolean; hasPrevPage: boolean }`
- **`BulkCardActionDto`**:
  - `action: 'DELETE' | 'MOVE' | 'RESET_PROGRESS'`
  - `cardIds: string[]` (min 1, max 100)
  - `targetDeckId?: string` (required if action === 'MOVE')
