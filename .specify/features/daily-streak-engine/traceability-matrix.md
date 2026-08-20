# Traceability Matrix: Daily Streak Engine (US-GAME-01)

- **Feature**: Daily Streak Engine & Timezone Logic
- **Date**: 2026-08-20
- **Status**: VALIDATED

---

## 1. Requirement Traceability Matrix (RTM)

| Business Goal               | Requirement ID   | User Story              | Business Rule                                     | Test / Verification Target                                              |
| :-------------------------- | :--------------- | :---------------------- | :------------------------------------------------ | :---------------------------------------------------------------------- |
| **BG-01** (Retention Lift)  | `REQ-STREAK-001` | `US-GAME-01` (Sc. 5)    | `BR-STREAK-004`, `BR-STREAK-006`                  | Unit & E2E: GET `/api/v1/streaks/me` returns streak stats & flame tier  |
| **BG-02** (Daily Active)    | `REQ-STREAK-002` | `US-GAME-01` (Sc. 1-4)  | `BR-STREAK-001`, `BR-STREAK-002`, `BR-STREAK-003` | Unit: Streak increment, reset, and idempotent algorithms                |
| **BG-02** (Study Loop)      | `REQ-STREAK-003` | `US-GAME-01` (Sc. 1, 3) | `BR-STREAK-001`                                   | Integration: Review submission automatically logs streak activity       |
| **BG-03** (Timezone Safety) | `REQ-STREAK-004` | `US-GAME-01` (Sc. 6)    | `BR-STREAK-002`, `BR-STREAK-005`                  | Unit: Midnight rollover and timezone conversion test cases              |
| **BG-04** (Free & Robust)   | `REQ-STREAK-005` | `US-GAME-01` (Sc. 1)    | `BR-STREAK-003`                                   | Unit: Lazy `UserStreak` creation on first access                        |
| **BG-01** (Visual Habit)    | `REQ-STREAK-006` | `US-GAME-01` (Sc. 5)    | `BR-STREAK-006`                                   | Frontend: `useStreak` hook queries & refreshes streak state             |
| **BG-01** (Visual Habit)    | `REQ-STREAK-007` | `US-GAME-01` (Sc. 5)    | `BR-STREAK-006`                                   | Frontend: `StreakFlame` & Navbar display accurate tier & count          |
| **BG-02** (Celebration)     | `REQ-STREAK-008` | `US-GAME-01` (Sc. 1, 3) | `BR-STREAK-007`                                   | Frontend: `StreakCelebrationModal` triggers on `streakIncreased = true` |
