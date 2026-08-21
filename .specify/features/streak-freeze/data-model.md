# Data Model: Streak Freeze Protection Mechanic (US-GAME-02)

- **Feature**: Streak Freeze Protection Mechanic
- **Date**: 2026-08-21
- **Status**: COMPLETE

---

## 1. Entity Definitions

### `UserStreak` (Updated Schema in `apps/api/prisma/schema.prisma`)

```prisma
model UserStreak {
  id               String    @id @default(uuid())
  userId           String
  currentStreak    Int       @default(0)
  bestStreak       Int       @default(0)
  lastActiveDate   DateTime?

  // New Streak Freeze fields:
  streakFreezes    Int       @default(1)
  lastFreezeDate   DateTime?
  totalFreezesUsed Int       @default(0)

  user             User      @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("user_streaks")
}
```

---

## 2. Field Specifications

| Field              | Type       | Default | Nullable | Description                                                                      |
| :----------------- | :--------- | :------ | :------: | :------------------------------------------------------------------------------- |
| `streakFreezes`    | `Int`      | `1`     |    No    | Current number of available streak freezes ($0 \le \text{streakFreezes} \le 2$). |
| `lastFreezeDate`   | `DateTime` | `null`  |   Yes    | Timestamp of the most recent automated streak freeze consumption.                |
| `totalFreezesUsed` | `Int`      | `0`     |    No    | Lifetime counter of streak freezes consumed by this user.                        |

---

## 3. Computed DTO State

From `UserStreak`, `StreakService` calculates runtime properties:

- `streakFreezes: number` $\rightarrow$ Current available inventory ($0 \dots 2$).
- `maxStreakFreezes: number` $\rightarrow$ Constant $2$.
- `wasProtectedByFreeze: boolean` $\rightarrow$ `true` if current request auto-consumed a freeze to preserve streak.
- `freezesUsed: number` $\rightarrow$ Number of freezes consumed during the current evaluation (0, 1, or 2).
- `earnedMilestoneFreeze: boolean` $\rightarrow$ `true` if 7-day or 30-day streak milestone awarded a bonus freeze.
