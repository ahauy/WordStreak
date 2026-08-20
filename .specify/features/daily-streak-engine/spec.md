# Feature Specification: Daily Streak Engine & Timezone Logic (US-GAME-01)

- **Feature**: Daily Streak Engine & Timezone Logic
- **Slug**: `daily-streak-engine`
- **Sprint**: Sprint 3 (EPIC-05: Gamification, Streaks & Daily Habits)
- **Status**: APPROVED

---

## 1. Context & Business Value

WordStreak empowers English language learners to build resilient, long-term memory via spaced repetition and contextual practice. To reinforce this daily learning habit, the Daily Streak Engine tracks consecutive days of active study, calculating calendar day boundaries using the learner's local timezone.

---

## 2. User Scenarios

### US1: Daily Study Activity Triggers Streak Increment

- **Trigger**: Learner submits a flashcard rating (`POST /api/v1/reviews/submit`) or completes a quiz session.
- **Outcome**: If the user has not completed a study activity yet today in their local timezone:
  - If last active day was yesterday: `currentStreak += 1`, `bestStreak = max(bestStreak, currentStreak)`.
  - If last active day was 2+ days ago (or null): `currentStreak = 1`, `bestStreak = max(bestStreak, 1)`.
  - Returns `streakIncreased: true` and activates `StreakCelebrationModal`.

### US2: Idempotent Study Within the Same Day

- **Trigger**: Learner completes multiple cards or quizzes throughout the day.
- **Outcome**: The streak engine detects `lastActiveDay == today` in the local timezone, preserving `currentStreak` without double-incrementing (`streakIncreased: false`).

### US3: Real-Time Dashboard & Navbar Streak Flame

- **Trigger**: Learner views Dashboard or navigates between pages.
- **Outcome**: `useStreak` queries `GET /api/v1/streaks/me`, rendering the live Electric Violet Flame mascot with appropriate tier and today's status.

---

## 3. Requirements

- `REQ-STREAK-001`: `GET /api/v1/streaks/me` returns streak statistics, status for today, timezone, and flame tier.
- `REQ-STREAK-002`: `POST /api/v1/streaks/record-activity` accepts `{ timezone?: string }` and processes streak updates.
- `REQ-STREAK-003`: `ReviewsService.submitReview` automatically calls streak recording.
- `REQ-STREAK-004`: Timezone-aware date calculations with UTC fallbacks and anti-clock-drift safeguards.
- `REQ-STREAK-005`: Dynamic 4-tier flame mascot progression per `apps/web/MEMORY.md`.
- `REQ-STREAK-006`: `StreakCelebrationModal` modal on streak increment.

---

## 4. Success Criteria

- 100% test coverage for streak service edge cases (today, yesterday, skipped days, invalid timezone, midnight transitions).
- Sub-25ms response overhead on review submission.
- Zero hover jitter and full adherence to `apps/web/DESIGN.md` and `apps/web/MEMORY.md`.
