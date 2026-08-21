# Feature Specification: Streak Freeze Protection Mechanic (US-GAME-02)

- **Feature**: Streak Freeze Protection Mechanic
- **Slug**: `streak-freeze`
- **Sprint**: Sprint 4 (EPIC-05: Gamification, Streaks & Daily Habits)
- **Status**: APPROVED

---

## 1. Context & Business Value

Learners frequently experience unforeseen circumstances (travel, illness, emergencies) where they cannot complete their daily study goal. Without protection, losing a multi-week streak causes immediate demotivation and drop-off. The Streak Freeze mechanic provides an automated safety shield (default 1 freeze, capped at 2) that preserves the learner's active streak across missed calendar days ($\Delta d = 2$ or $3$).

---

## 2. User Scenarios

### US1: Automatic Streak Preservation on Missed Day

- **Trigger**: Learner accesses the app (`GET /api/v1/streaks/me`) or completes a study activity (`POST /api/v1/streaks/record-activity` or `/api/v1/reviews/submit`) after missing yesterday ($\Delta d = 2$) with $\ge 1$ streak freeze.
- **Outcome**:
  - System auto-consumes 1 freeze (`streakFreezes -= 1`, `totalFreezesUsed += 1`).
  - `currentStreak` is preserved intact.
  - Returns `wasProtectedByFreeze: true`, `freezesUsed: 1`, `streakFreezes: N - 1`.
  - Dashboard presents a Frost Shield alert acknowledging that the streak was saved.

### US2: Multi-Day Gap Exceeding Freeze Quota

- **Trigger**: Learner was inactive for 3 days ($\Delta d = 4$) with only 1 freeze.
- **Outcome**:
  - System determines gap cannot be bridged ($\Delta d > \text{streakFreezes} + 1$).
  - `currentStreak` resets to 0 (or 1 upon new review).
  - Unused freeze is not consumed fruitlessly.

### US3: Milestone & Monthly Refill

- **Trigger**: Learner achieves a 7-day or 30-day streak milestone, or logs in on the 1st of a new calendar month.
- **Outcome**:
  - System awards +1 freeze up to the max cap of 2 (`MAX_STREAK_FREEZES = 2`).
  - Congratulatory toast/badge update confirms earned shield.

### US4: Visual Frost Shield Indicator

- **Trigger**: Learner views Dashboard streak widget.
- **Outcome**:
  - Displays frost shield icon showing available freezes (e.g. `1/2 🧊`).
  - Tooltip explains freeze rules and protection status.

---

## 3. Requirements

- `REQ-FREEZE-001`: `UserStreak` schema updated with `streakFreezes Int @default(1)`, `lastFreezeDate DateTime?`, `totalFreezesUsed Int @default(0)`.
- `REQ-FREEZE-002`: `StreakService.getStreak()` and `StreakService.recordActivity()` lazily evaluate $\Delta d$ and auto-consume freezes when $2 \le \Delta d \le \text{streakFreezes} + 1$.
- `REQ-FREEZE-003`: Milestone rewards (+1 freeze at 7 and 30 days) and monthly refill capped at `MAX_STREAK_FREEZES = 2`.
- `REQ-FREEZE-004`: Shared DTOs (`UserStreakDto`, `StreakActivityResponseDto`) extended with freeze metadata.
- `REQ-FREEZE-005`: Dashboard `StreakWidget` with frost shield badge and `StreakSavedModal` notification adhering to `apps/web/DESIGN.md`.

---

## 4. Success Criteria

- 100% unit test coverage for freeze evaluation algorithms (single missed day, consecutive missed days, max quota capping, milestone awards).
- Non-blocking, zero-downtime database migration.
- Sub-25ms evaluation overhead on API responses.
