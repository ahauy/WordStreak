# Domain Decision Baseline: Daily Streak Engine & Timezone Logic

**Status**: SIGNED-OFF v1.0  
**Version**: 1.0  
**Feature Slug**: `daily-streak-engine`  
**User Story**: `US-GAME-01` (Epic 5: Gamification, Streaks & Daily Habits)

---

## 1. Executive Summary & Business Goals

WordStreak requires an accurate, habit-forming daily streak tracking engine. It rewards learners for daily vocabulary study while preventing timezone boundary errors, rapid clock drift exploits, or accidental streak resets across midnight transitions.

- **Primary Goal**: Lift 7-day retention by $+20\%$ through visual streak reinforcement.
- **Operational Goal**: P95 streak retrieval $< 15\text{ms}$, streak record overhead $< 25\text{ms}$.
- **Core Principle**: 100% Free forever; zero paywalled streak recovery.

---

## 2. Personas & RBAC

- **Authenticated Learner**: Can retrieve own streak stats, trigger streak increments via study activities (SM-2 reviews, quizzes), and provide client timezone.
- **System Admin / Engine**: Controls streak calculation and ensures idempotency.
- **Guest**: Redirected to login; streak is not saved anonymously.

---

## 3. Business Rules & Calculation Formulas

- `BR-STREAK-001` (**Qualifying Activity**): Flashcard SRS rating submission, Quiz completion, or direct streak record endpoint.
- `BR-STREAK-002` (**Timezone Evaluation**): Compares local calendar date `YYYY-MM-DD` in user's IANA timezone (fallback: UTC).
- `BR-STREAK-003` (**Streak Increment Algorithm**):
  - If `lastActiveDay == today`: Idempotent no-op (`streakIncreased: false`).
  - If `lastActiveDay == yesterday`: Consecutive day! `currentStreak += 1`, `bestStreak = max(bestStreak, currentStreak)`, `streakIncreased: true`.
  - If `lastActiveDay < yesterday` (or null): Reset/start at `currentStreak = 1`, `bestStreak = max(bestStreak, 1)`, `streakIncreased: true`.
- `BR-STREAK-004` (**Lazy Status Calculation**): Querying `GET /api/v1/streaks/me` computes real-time pending/active status for today.
- `BR-STREAK-005` (**Anti-Abuse**): Clock drift cap (5 mins) and multi-day hop cooldown (4 hours).
- `BR-STREAK-006` (**Mascot Tiers**):
  - Tier 1: 1–6 Days (Baby Violet Flame)
  - Tier 2: 7–13 Days (Ember Flame)
  - Tier 3: 14–29 Days (Radiant Inferno)
  - Tier 4: 30+ Days (Cosmic Violet Nova)
- `BR-STREAK-007` (**Celebration Modal**): Celebratory confetti & animation triggered when `streakIncreased: true`.

---

## 4. Requirement & User Story Traceability

- `REQ-STREAK-001` $\rightarrow$ `US-GAME-01` (Scenario 5): Streak status query endpoint.
- `REQ-STREAK-002` $\rightarrow$ `US-GAME-01` (Scenario 1–4): Activity record endpoint with timezone.
- `REQ-STREAK-003` $\rightarrow$ `US-GAME-01` (Scenario 1, 3): Automatic review submission hook.
- `REQ-STREAK-004` $\rightarrow$ `US-GAME-01` (Scenario 6): Timezone-aware date calculations.
- `REQ-STREAK-005` $\rightarrow$ `US-GAME-01` (Scenario 1): Lazy `UserStreak` creation.
- `REQ-STREAK-006` $\rightarrow$ `US-GAME-01` (Scenario 5): Frontend `useStreak` hook.
- `REQ-STREAK-007` $\rightarrow$ `US-GAME-01` (Scenario 5): Live `StreakFlame` & Navbar widget.
- `REQ-STREAK-008` $\rightarrow$ `US-GAME-01` (Scenario 1, 3): `StreakCelebrationModal` on streak increase.

---

## 5. Scope & Won't-Have

- **Won't-Have**: Paid streak restores, social leaderboards, or non-deterministic client-calculated streaks.
