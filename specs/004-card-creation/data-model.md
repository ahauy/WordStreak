# Data Model: Contextual Card Creation

## Prisma Entities

```prisma
model Card {
  id              String             @id @default(uuid())
  deckId          String
  word            String
  meaning         String
  phonetic        String?
  audioUrl        String?
  exampleSentence String?
  collocations    String?
  mnemonic        String?
  imageUrl        String?
  createdAt       DateTime           @default(now())
  updatedAt       DateTime           @updatedAt
  deck            Deck               @relation(fields: [deckId], references: [id], onDelete: Cascade)
  progress        UserCardProgress[]

  @@map("cards")
}

model UserCardProgress {
  id             String    @id @default(uuid())
  userId         String
  cardId         String
  interval       Int       @default(0)
  easeFactor     Float     @default(2.5)
  repetitions    Int       @default(0)
  lastReviewedAt DateTime?
  nextReviewDate DateTime  @default(now())
  status         String    @default("NEW")
  user           User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  card           Card      @relation(fields: [cardId], references: [id], onDelete: Cascade)

  @@unique([userId, cardId])
  @@map("user_card_progress")
}
```

## Shared TypeScript Interfaces (`packages/shared-types/src/cards.ts`)

```typescript
export interface CardDto {
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
  createdAt: string;
  updatedAt: string;
  progress?: {
    status: "NEW" | "LEARNING" | "REVIEW" | "MASTERED";
    interval: number;
    easeFactor: number;
    repetitions: number;
    nextReviewDate: string;
    lastReviewedAt?: string | null;
  } | null;
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
```
