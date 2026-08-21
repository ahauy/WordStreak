# Data Model: Learning Analytics & Retention Dashboard

**Feature Slug**: `learning-analytics`  
**Date**: 2026-08-21

---

## 1. Schema Additions (`apps/api/prisma/schema.prisma`)

```prisma
model ReviewLog {
  id         String   @id @default(uuid())
  userId     String
  cardId     String
  rating     Int      // 1: Again, 2: Hard, 3: Good, 4: Easy
  interval   Int      // New interval computed in days
  reviewedAt DateTime @default(now())

  user       User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  card       Card     @relation(fields: [cardId], references: [id], onDelete: Cascade)

  @@index([userId, reviewedAt])
  @@index([cardId])
  @@map("review_logs")
}
```

### Relations Added:

- `User`: `reviewLogs ReviewLog[]`
- `Card`: `reviewLogs ReviewLog[]`

---

## 2. Indices & Query Optimization

- `ReviewLog`: `@@index([userId, reviewedAt])` enables sub-50ms range scan for `reviewedAt >= (now - 365 days)` without reading other users' data.
- `UserCardProgress`: `@@unique([userId, cardId])` ensures exact 1 progress row per card per user.

---

## 3. Data Migration & Historical Backfill Script

```sql
-- Migration: Add ReviewLog table
CREATE TABLE "review_logs" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "cardId" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "interval" INTEGER NOT NULL,
    "reviewedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "review_logs_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "review_logs_userId_reviewedAt_idx" ON "review_logs"("userId", "reviewedAt");
CREATE INDEX "review_logs_cardId_idx" ON "review_logs"("cardId");

ALTER TABLE "review_logs" ADD CONSTRAINT "review_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "review_logs" ADD CONSTRAINT "review_logs_cardId_fkey" FOREIGN KEY ("cardId") REFERENCES "cards"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Backfill initial review logs from existing UserCardProgress records with lastReviewedAt
INSERT INTO "review_logs" ("id", "userId", "cardId", "rating", "interval", "reviewedAt")
SELECT
    gen_random_uuid()::text,
    "userId",
    "cardId",
    3 AS "rating",
    "interval",
    COALESCE("lastReviewedAt", CURRENT_TIMESTAMP)
FROM "user_card_progress"
WHERE "lastReviewedAt" IS NOT NULL;
```
