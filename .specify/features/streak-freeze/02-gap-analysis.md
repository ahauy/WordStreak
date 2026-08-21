# Gap Analysis: Streak Freeze Protection Mechanic (US-GAME-02)

## 1. AS-IS (Current State)

- Currently, `UserStreak` records `currentStreak`, `bestStreak`, and `lastActiveDate`.
- `StreakService.getStreak()` and `StreakService.recordActivity()` strictly evaluate whether `lastActiveDate` was today or yesterday.
- If `lastActiveDate` was before yesterday ($\Delta d \ge 2$), `effectiveStreak` is immediately reduced to `0` on read and reset to `1` on study activity.
- The user has no protection against a single missed day (e.g. traveling, illness, emergency), resulting in immediate loss of long-term streaks and emotional frustration.
- The UI displays the purple flame widget and active/pending status, but provides no shield/freeze indicators or freeze recovery alerts.

## 2. TO-BE (Target State)

- Users have a `streakFreezes` inventory (starting with 1 by default, capped at 2).
- When a user misses a day ($\Delta d = 2$) or 2 consecutive days ($\Delta d = 3$ with 2 freezes):
  - On `getStreak` or `recordActivity`, available streak freezes are consumed automatically to bridge the missed calendar days.
  - `currentStreak` remains intact and continuous.
  - The user receives an informative notification / badge state ("Streak Saved by Freeze! 🧊").
- Users earn milestone freeze replenishments (upon completing 7-day or 30-day streak milestones) and receive a monthly refill (+1 on the 1st of each month if below capacity).
- The Dashboard Streak Widget displays the freeze shield icon and remaining freeze count alongside the flame mascot.

## 3. Gap Analysis

### 3.1. Functional Gaps

- **Streak Evaluation Logic**: Update `StreakService` to calculate gap days ($\Delta d$) and auto-consume `streakFreezes` when $\Delta d \ge 2$ and $\Delta d \le \text{streakFreezes} + 1$.
- **Freeze Quota & Milestone Rewards**: Add logic to grant +1 freeze when a streak hits 7 or 30 days, or on monthly refill checks.
- **DTOs & API Contracts**: Extend `UserStreakDto` and `StreakActivityResponseDto` with `streakFreezes`, `maxStreakFreezes`, `wasProtectedByFreeze`, and `freezesUsed`.
- **UI Components**: Add Streak Freeze shield indicator in `StreakWidget.tsx` and a freeze celebration / alert modal in `apps/web`.

### 3.2. Data Gaps

- Schema changes in `apps/api/prisma/schema.prisma`:
  - `UserStreak`: Add `streakFreezes Int @default(1)`
  - `UserStreak`: Add `lastFreezeDate DateTime?`
  - `UserStreak`: Add `totalFreezesUsed Int @default(0)`
- Backfill / Migration: Existing `UserStreak` records in DB will default to `streakFreezes = 1` via `@default(1)`.

### 3.3. User Impact

- Existing users gain 1 free Streak Freeze immediately.
- Users who missed 1 day will see their streak preserved instead of reset, accompanied by a clear explanation.
- No disruptive changes to existing review or streak submission flows.

### 3.4. Transition Requirements

- Prisma migration `add_streak_freeze_fields` with automatic default values (`@default(1)` for `streakFreezes`, `@default(0)` for `totalFreezesUsed`).
- Shared types version bump/sync in `@wordstreak/shared-types`.
- Backwards compatible API response (existing frontend clients can read `currentStreak` safely while new fields are additive).
