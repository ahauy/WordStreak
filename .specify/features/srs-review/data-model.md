# Data Model: Spaced Repetition System (SRS Review)

## Entities & Schemas

### `UserCardProgress` (Existing Table: `user_card_progress`)

```prisma
model UserCardProgress {
  id             String    @id @default(uuid())
  userId         String
  cardId         String
  interval       Int       @default(0)
  easeFactor     Float     @default(2.5)
  repetitions    Int       @default(0)
  lastReviewedAt DateTime?
  nextReviewDate DateTime  @default(now())
  status         String    @default("NEW") // "NEW" | "LEARNING" | "MASTERED"
  user           User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  card           Card      @relation(fields: [cardId], references: [id], onDelete: Cascade)

  @@unique([userId, cardId])
  @@index([userId, nextReviewDate])
  @@index([userId, status])
  @@map("user_card_progress")
}
```

### Shared Types & Enums (`packages/shared-types/src/reviews.ts`)

```typescript
export enum SrsRating {
  AGAIN = 1,
  HARD = 2,
  GOOD = 3,
  EASY = 4,
}

export enum CardLearningStatus {
  NEW = "NEW",
  LEARNING = "LEARNING",
  MASTERED = "MASTERED",
}

export interface SrsCalculationInput {
  rating: SrsRating;
  repetitions: number;
  easeFactor: number;
  interval: number;
}

export interface SrsCalculationResult {
  interval: number;
  easeFactor: number;
  repetitions: number;
  nextReviewDate: Date;
  status: CardLearningStatus;
}

export interface DueCardItem {
  id: string;
  cardId: string;
  deckId: string;
  deckTitle: string;
  word: string;
  meaning: string;
  phonetic: string | null;
  audioUrl: string | null;
  exampleSentence: string | null;
  collocations: string | null;
  mnemonic: string | null;
  imageUrl: string | null;
  status: CardLearningStatus;
  interval: number;
  repetitions: number;
  easeFactor: number;
  nextReviewDate: string;
}

export interface SubmitReviewDto {
  cardId: string;
  rating: SrsRating;
}

export interface ReviewStatsResponse {
  dueCount: number;
  learningCount: number;
  masteredCount: number;
  newCount: number;
}
```
