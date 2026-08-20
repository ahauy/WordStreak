# Data Model: Daily Streak Engine (US-GAME-01)

- **Feature**: Daily Streak Engine & Timezone Logic
- **Date**: 2026-08-20
- **Status**: COMPLETE

---

## 1. Entity Definitions

### `UserStreak` (Existing in `apps/api/prisma/schema.prisma`)

```prisma
model UserStreak {
  id             String    @id @default(uuid())
  userId         String    @unique
  currentStreak  Int       @default(0)
  bestStreak     Int       @default(0)
  lastActiveDate DateTime?
  user           User      @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("user_streaks")
}
```

_Note_: If `userId` in `prisma/schema.prisma` is currently non-unique in the schema definition, we can ensure unique 1-to-1 relationship or query with `findFirst` / `upsert` on `userId`. Let's check `schema.prisma`:
`user User @relation(fields: [userId], references: [id], onDelete: Cascade)` and in `User`: `streaks UserStreak[]`. We can add `@unique` or query safely by `userId`.

---

## 2. Dynamic Computed State

From `UserStreak`, the service computes runtime attributes:

- `isActiveToday: boolean` $\rightarrow$ `lastActiveDateInTz === todayInTz`
- `isPendingToday: boolean` $\rightarrow$ `lastActiveDateInTz === yesterdayInTz`
- `flameTier: 1 | 2 | 3 | 4`
  - $1 \le currentStreak \le 6 \rightarrow \text{Tier 1}$
  - $7 \le currentStreak \le 13 \rightarrow \text{Tier 2}$
  - $14 \le currentStreak \le 29 \rightarrow \text{Tier 3}$
  - $currentStreak \ge 30 \rightarrow \text{Tier 4}$
