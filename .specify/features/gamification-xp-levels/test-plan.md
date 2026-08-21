# Test Plan: Gamification XP & Learner Levels System

- **Feature**: Experience Points (XP) & Learner Levels System
- **Feature Slug**: `gamification-xp-levels`
- **Target Backlog Item**: `US-GAME-03`
- **Author**: WordStreak Senior QA & Database Engineer
- **Date**: 2026-08-21
- **Status**: **APPROVED**

---

## 1. Traceability Matrix (User Stories to Test Cases)

| User Story / Requirement       | Description                                               | Target Test Cases                                  | Component / Scope                              |
| :----------------------------- | :-------------------------------------------------------- | :------------------------------------------------- | :--------------------------------------------- |
| **US-XP-001 (REQ-XP-001)**     | Card Review XP Award Engine (+10/+5/0 XP)                 | `TC-XP-001`, `TC-XP-002`, `TC-XP-003`              | `XpService`, `ReviewsService`                  |
| **US-XP-002 (REQ-XP-002)**     | Daily Goal Completion Bonus (+50 XP)                      | `TC-XP-004`, `TC-XP-005`                           | `XpService`, `ReviewsService`                  |
| **US-XP-003 (REQ-XP-003/004)** | Streak Milestone Bonuses (+100 XP / +500 XP)              | `TC-XP-006`, `TC-XP-007`, `TC-XP-008`              | `XpService`, `ReviewsService`, `StreakService` |
| **US-XP-004 (REQ-XP-005)**     | Monotonic Level & 5-Tier Calculation Engine               | `TC-XP-009`, `TC-XP-010`, `TC-XP-011`, `TC-XP-012` | `LevelEngineService`, `shared-types`           |
| **US-XP-005 (REQ-XP-007)**     | Anti-Abuse Velocity Rate Limiter (500 XP/hr, 2000 XP/day) | `TC-XP-013`, `TC-XP-014`, `TC-XP-015`              | `XpRateLimiterService`, `XpService`            |
| **US-XP-006 (REQ-XP-006)**     | Atomic Single PostgreSQL Transaction Ledger               | `TC-XP-016`, `TC-XP-017`                           | `XpService`, `PrismaService`                   |
| **US-XP-007 (REQ-XP-011)**     | Practice Quiz XP Bonus & Daily Cap                        | `TC-XP-018`, `TC-XP-019`, `TC-XP-020`              | `XpService`, `PracticeService`                 |
| **US-XP-008 (REQ-XP-012)**     | Idempotent Historical XP Backfill Script                  | `TC-XP-021`, `TC-XP-022`                           | `backfill-xp.ts`                               |

---

## 2. Detailed Test Cases

### 2.1 Card Review XP Awards (US-XP-001)

#### `TC-XP-001`: Rating 3 (Good) or 4 (Easy) awards +10 XP

- **Preconditions**: User is authenticated, rate limit not exceeded.
- **Action**: Submit review with `rating = 3` or `rating = 4`.
- **Expected Outcome**: `xpEarned = 10`, breakdown contains `{ type: 'CARD_REVIEW', xp: 10 }`, `totalXp` increments by 10.

#### `TC-XP-002`: Rating 2 (Hard) awards +5 XP

- **Preconditions**: User is authenticated.
- **Action**: Submit review with `rating = 2`.
- **Expected Outcome**: `xpEarned = 5`, breakdown contains `{ type: 'CARD_REVIEW', xp: 5 }`, `totalXp` increments by 5.

#### `TC-XP-003`: Rating 1 (Again) awards 0 XP

- **Preconditions**: User is authenticated.
- **Action**: Submit review with `rating = 1`.
- **Expected Outcome**: `xpEarned = 0`, breakdown contains `{ type: 'CARD_REVIEW', xp: 0 }`, `totalXp` unchanged.

---

### 2.2 Daily Goal Completion Bonus (US-XP-002)

#### `TC-XP-004`: First time reaching daily goal awards +50 XP bonus

- **Preconditions**: User has `dailyGoal = 10`, completed 9 reviews today. No prior `DAILY_GOAL_COMPLETED` log exists for today.
- **Action**: Submit 10th review today (`rating = 3`).
- **Expected Outcome**: `xpEarned = 60` (10 review + 50 goal), breakdown includes `{ type: 'DAILY_GOAL_COMPLETED', xp: 50 }`, activity log created with metadata `{ localDate: 'YYYY-MM-DD' }`.

#### `TC-XP-005`: Subsequent reviews on the same calendar date do NOT duplicate goal bonus

- **Preconditions**: User has already completed 10 reviews today and earned goal bonus.
- **Action**: Submit 11th review today.
- **Expected Outcome**: `xpEarned = 10` (no second `DAILY_GOAL_COMPLETED`), goal bonus skipped.

---

### 2.3 Streak Milestones (US-XP-003)

#### `TC-XP-006`: 7-Day streak milestone awards +100 XP

- **Preconditions**: User reaches `currentStreak = 7` with `streakIncreased = true`.
- **Action**: Submit review triggering 7-day milestone.
- **Expected Outcome**: Breakdown includes `{ type: 'STREAK_7_DAYS', xp: 100 }`.

#### `TC-XP-007`: 30-Day streak milestone awards +500 XP

- **Preconditions**: User reaches `currentStreak = 30` with `streakIncreased = true`.
- **Action**: Submit review triggering 30-day milestone.
- **Expected Outcome**: Breakdown includes `{ type: 'STREAK_30_DAYS', xp: 500 }`.

#### `TC-XP-008`: Streak already maintained today (`streakIncreased = false`) awards 0 milestone XP

- **Preconditions**: User does multiple reviews in same day where streak was already counted.
- **Action**: Submit another review.
- **Expected Outcome**: No duplicate streak milestone XP awarded.

---

### 2.4 Monotonic Level & Tier Progression (US-XP-004)

#### `TC-XP-009`: Polynomial Level formula accuracy

- **Test Matrix**:
  - `0 XP` $\rightarrow$ Level 1 (Bronze)
  - `100 XP` $\rightarrow$ Level 2 (Bronze)
  - `600 XP` $\rightarrow$ Level 5 (Bronze)
  - `810 XP` $\rightarrow$ Level 6 (Silver)
  - `3,650 XP` $\rightarrow$ Level 16 (Gold)
  - `9,710 XP` $\rightarrow$ Level 31 (Diamond)
  - `17,340 XP` $\rightarrow$ Level 46 (Master)

#### `TC-XP-010`: Tier boundaries transition detection

- **Action**: Cross threshold from 809 XP to 810 XP.
- **Expected Outcome**: `levelUp.isLevelUp = true`, `previousTier = 'BRONZE'`, `currentTier = 'SILVER'`, `isTierPromotion = true`.

#### `TC-XP-011`: Level progress percentage and remaining XP calculation

- **Action**: Evaluate progress for 500 XP at Level 4 (Threshold Lv4 = 429 XP, Lv5 = 600 XP).
- **Expected Outcome**: `currentLevelXp = 71`, `nextLevelRequiredXp = 171`, `progressPercent = 41.52%`.

#### `TC-XP-012`: Defensive clamping for edge cases (negative XP, 0 XP, max levels)

- **Expected Outcome**: `calculateLevelFromXp(-10)` returns Level 1 with 0% progress; no runtime throws.

---

### 2.5 Anti-Abuse Rate Limiting (US-XP-005)

#### `TC-XP-013`: Hourly review XP limit (500 XP/hr)

- **Preconditions**: User has accrued 500 review XP within last 60 minutes.
- **Action**: Submit another review (`rating = 3`).
- **Expected Outcome**: SM-2 review progress is saved normally, but XP is suppressed (`xpEarned = 0`, breakdown includes `{ type: 'RATE_LIMITED', xp: 0 }`).

#### `TC-XP-014`: 24-Hour review XP limit (2,000 XP/day)

- **Preconditions**: User has accrued 2,000 review XP within last 24 hours.
- **Action**: Submit another review.
- **Expected Outcome**: Review saved, XP suppressed with rate limit indicator.

#### `TC-XP-015`: Rolling window expiry restores XP earning

- **Preconditions**: User waited > 1 hour after hitting 500 XP cap.
- **Action**: Submit new review.
- **Expected Outcome**: XP awards normally (+10 XP).

---

### 2.6 Atomic Database Transactions (US-XP-006)

#### `TC-XP-016`: All-or-nothing atomicity for XP and activity logs

- **Preconditions**: User finishes review that yields review XP + daily goal + streak milestone.
- **Action**: Perform `awardReviewXp`.
- **Expected Outcome**: `User.totalXp`, `User.level`, `User.tier` and corresponding `UserActivityLog` entries are committed in a single `$transaction`.

#### `TC-XP-017`: Rollback on failure preserves consistency

- **Action**: Simulate error during activity log creation or user update.
- **Expected Outcome**: Entire transaction rolls back; `totalXp` remains unchanged and no partial logs remain.

---

### 2.7 Practice Quiz XP Rewards (US-XP-007)

#### `TC-XP-018`: Quiz score $\ge 80\%$ awards +30 XP

- **Action**: Submit quiz with score 8/10 (80%).
- **Expected Outcome**: `xpEarned = 30`, `UserActivityLog` created with `PRACTICE_QUIZ`.

#### `TC-XP-019`: Quiz score $< 80\%$ awards +10 XP

- **Action**: Submit quiz with score 5/10 (50%).
- **Expected Outcome**: `xpEarned = 10`.

#### `TC-XP-020`: Daily practice quiz cap of 5 sessions per day

- **Preconditions**: User already received 5 practice quiz XP grants today.
- **Action**: Submit 6th practice quiz.
- **Expected Outcome**: 429 Too Many Requests or 0 XP reward according to business rules.

---

### 2.8 Idempotent Historical Backfill (US-XP-008)

#### `TC-XP-021`: Backfills legacy reviews and best streak for users with 0 totalXp

- **Action**: Execute `backfillHistoricalXp()` on seed data.
- **Expected Outcome**: Users receive calculated XP from past `review_logs` and `bestStreak`, with `HISTORICAL_BACKFILL` log.

#### `TC-XP-022`: Idempotency on repeated execution

- **Action**: Run `backfillHistoricalXp()` a second time.
- **Expected Outcome**: 0 users modified, total XP and logs unaltered.
