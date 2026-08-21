# Software Requirements Specification (SRS): Gamification XP & Learner Levels System

- **Feature**: Experience Points (XP) & Learner Levels System
- **Slug**: `gamification-xp-levels`
- **Target Backlog Item**: `US-GAME-03`
- **Date**: 2026-08-21
- **Status**: Draft (BA Stage 6 Specification)

---

## 1. Functional Requirements

### REQ-XP-001: Card Review XP Awarding

- **Category**: Gamification Core / Review Engine
- **Priority**: Must-Have (P0)
- **Status**: Draft
- **Description**: When an authenticated user submits a card review (`POST /api/v1/reviews`), the system shall evaluate the review rating:
  - If `rating` is `3 (GOOD)` or `4 (EASY)`, award **+10 XP**.
  - If `rating` is `2 (HARD)`, award **+5 XP**.
  - If `rating` is `1 (AGAIN)`, award **0 XP**.
- **Derived from**: `BR-XP-001`, `BR-XP-002`, `ASM-XP-001`, `ASM-XP-002`
- **Business Rules**: `BR-XP-001`, `BR-XP-002`, `BR-XP-009`, `BR-XP-010`
- **Non-Functional Requirements**: P95 latency overhead $< 50\text{ ms}$; atomic database write.
- **Dependencies**: `ReviewsService.submitReview`

---

### REQ-XP-002: Daily Goal Completion Bonus

- **Category**: Gamification Core / Daily Habit
- **Priority**: Must-Have (P0)
- **Status**: Draft
- **Description**: When an authenticated user completes the number of card reviews equal to their configured `user.dailyGoal` on the current local calendar date (calculated in their verified IANA timezone), the system shall award a one-time bonus of **+50 XP**.
- **Derived from**: `BR-XP-003`, `ASM-XP-003`, `01-elicitation.md` §3 Pillar 3
- **Business Rules**: `BR-XP-003`, `BR-XP-011`, `BR-XP-012`
- **Non-Functional Requirements**: Single grant per user per local date; sub-millisecond date comparison.
- **Dependencies**: `REQ-XP-001`, `User.dailyGoal`

---

### REQ-XP-003: 7-Day Streak Milestone XP Bonus

- **Category**: Gamification Core / Streak Engine
- **Priority**: Must-Have (P0)
- **Status**: Draft
- **Description**: When a learner's daily streak increments to a multiple of 7 (e.g. 7, 14, 21, 28... days), the system shall award a milestone bonus of **+100 XP**. The system shall ensure this bonus is not re-granted during streak freeze maintenance without a genuine streak count increase.
- **Derived from**: `BR-XP-004`, `ASM-XP-004`, `03-domain-model.md` §3
- **Business Rules**: `BR-XP-004`, `BR-XP-012`
- **Non-Functional Requirements**: Deduplicated against existing `UserActivityLog` milestone records.
- **Dependencies**: `StreakService.recordActivity`

---

### REQ-XP-004: 30-Day Streak Milestone XP Bonus

- **Category**: Gamification Core / Streak Engine
- **Priority**: Must-Have (P0)
- **Status**: Draft
- **Description**: When a learner's daily streak increments to a multiple of 30 (e.g. 30, 60, 90... days), the system shall award a milestone bonus of **+500 XP**.
- **Derived from**: `BR-XP-005`, `ASM-XP-005`, `03-domain-model.md` §3
- **Business Rules**: `BR-XP-005`, `BR-XP-012`
- **Non-Functional Requirements**: Deduplicated against existing milestone records.
- **Dependencies**: `StreakService.recordActivity`

---

### REQ-XP-005: Deterministic Level & Tier Calculation Engine

- **Category**: Gamification Core / Level Engine
- **Priority**: Must-Have (P0)
- **Status**: Draft
- **Description**: The system shall compute the user's Level $L$ and Tier deterministically from lifetime `totalXp`:
  - Formula threshold: $\text{threshold}(L) = \text{floor}\left( 50 \times (L - 1)^{1.5} + 50 \times (L - 1) \right)$
  - Mastery Tiers:
    - **Bronze**: Levels 1–5 (0–809 XP)
    - **Silver**: Levels 6–15 (810–3,649 XP)
    - **Gold**: Levels 16–30 (3,650–9,709 XP)
    - **Diamond**: Levels 31–45 (9,710–17,339 XP)
    - **Master**: Levels 46–50+ (17,340+ XP)
- **Derived from**: `BR-XP-007`, `BR-XP-008`, `ASM-XP-006`, `ASM-XP-007`
- **Business Rules**: `BR-XP-007`, `BR-XP-008`, `BR-XP-009`
- **Non-Functional Requirements**: Pure deterministic function; zero rounding inconsistencies.
- **Dependencies**: `User.totalXp`

---

### REQ-XP-006: Immutable XP Activity Transaction Ledger

- **Category**: Data Model & Auditing
- **Priority**: Must-Have (P0)
- **Status**: Draft
- **Description**: Every XP grant shall create an immutable row in the `user_activity_logs` table containing: `id`, `userId`, `activityType`, `xpEarned`, `metadata` (JSONB: `{ cardId, rating, streakCount, localDate }`), and `createdAt`. The user's `totalXp`, `level`, and `tier` shall be updated atomically in the same database transaction.
- **Derived from**: `BR-XP-012`, `ASM-XP-008`, `02-gap-analysis.md` §3.2
- **Business Rules**: `BR-XP-012`
- **Non-Functional Requirements**: PostgreSQL `$transaction`; indexed by `[userId, createdAt]` and `[userId, activityType]`.
- **Dependencies**: `PrismaService`

---

### REQ-XP-007: XP Velocity Rate Limiting & Anti-Abuse

- **Category**: Security & Anti-Abuse
- **Priority**: Must-Have (P0)
- **Status**: Draft
- **Description**: The system shall enforce velocity limits on XP earned from card reviews:
  - Maximum **500 XP per rolling 1-hour window**.
  - Maximum **2,000 XP per rolling 24-hour window**.
  - Reviews exceeding the rate limit shall still be processed for SRS intervals and review logs, but will earn 0 XP.
- **Derived from**: `BR-XP-010`, `ASM-XP-009`, `RISK-XP-001`
- **Business Rules**: `BR-XP-010`
- **Non-Functional Requirements**: In-memory Redis or lightweight SQL aggregate window check.
- **Dependencies**: `XpService`

---

### REQ-XP-008: Topbar Level & Progress Bar Widget

- **Category**: Frontend UI / Navigation
- **Priority**: Must-Have (P0)
- **Status**: Draft
- **Description**: The application top navigation bar shall render a dynamic Gamification Widget displaying:
  - Tier crest icon (styled according to current tier color tokens).
  - Current level (`Lv. X`).
  - Progress bar illustrating percentage toward the next level (`currentLevelXp / nextLevelRequiredXp`).
  - Interactive tooltip popover detailing exact XP counts and next tier milestone.
- **Derived from**: `03-domain-model.md` §6, `spec/PRD.md` §6
- **Business Rules**: `BR-XP-007`, `BR-XP-008`
- **Non-Functional Requirements**: Responsive layout down to 320px mobile viewport; WCAG 2.1 AA text contrast.
- **Dependencies**: `User.level`, `User.totalXp`, `User.tier`

---

### REQ-XP-009: Study Flow Floating XP Micro-Animation

- **Category**: Frontend UI / Study Flow
- **Priority**: Must-Have (P0)
- **Status**: Draft
- **Description**: Upon rating a flashcard, the study interface shall render a non-blocking floating badge (e.g. `+10 XP` or `+5 XP`) that ascends 24px and fades out over 800ms adjacent to the selected rating button.
- **Derived from**: `01-elicitation.md` §6 Pillar 6, `spec/PRD.md` §4
- **Business Rules**: `BR-XP-001`, `BR-XP-002`
- **Non-Functional Requirements**: Non-blocking CSS/Framer Motion animation; disabled when `prefers-reduced-motion: reduce`.
- **Dependencies**: `REQ-XP-001`

---

### REQ-XP-010: Level-Up Celebration Modal with Confetti

- **Category**: Frontend UI / Celebration
- **Priority**: Must-Have (P0)
- **Status**: Draft
- **Description**: When a review response contains `xp.levelUp.isLevelUp === true`, the client shall trigger a `LevelUpCelebrationModal` modal dialog displaying:
  - Animated tier crest and glowing halo.
  - Heading: "Level Up! Level X Reached" (and tier promotion banner if `isTierPromotion === true`).
  - Full-screen canvas confetti particle explosion (dismissable via Escape or Close button).
- **Derived from**: `03-domain-model.md` §2.1, `01-elicitation.md` §6
- **Business Rules**: `BR-XP-007`, `BR-XP-008`
- **Non-Functional Requirements**: Keyboard accessible (`Tab`, `Escape`); respects `prefers-reduced-motion`.
- **Dependencies**: `REQ-XP-005`

---

### REQ-XP-011: Practice Quiz Completion XP Bonus

- **Category**: Gamification Core / Practice Module
- **Priority**: Should-Have (P1)
- **Status**: Draft
- **Description**: When a learner completes a Practice Quiz session (`/practice/quiz`), the system shall award **+30 XP** if the final score is $\ge 80\%$, or **+10 XP** for scores $< 80\%$, capped at 5 quiz grants per calendar day.
- **Derived from**: `BR-XP-006`, `03-domain-model.md` §3
- **Business Rules**: `BR-XP-006`
- **Non-Functional Requirements**: Deduplication key `practiceSessionId`.
- **Dependencies**: `PracticeModule`

---

### REQ-XP-012: Historical User XP Migration & Backfill

- **Category**: Data Migration & Transition
- **Priority**: Should-Have (P1)
- **Status**: Draft
- **Description**: The system shall provide an automated database backfill script (or lazy initialization upon first login) that computes initial `totalXp` and `level` for existing active learners from their historical `ReviewLog` entries with rating $\ge 2$ and past streak records.
- **Derived from**: `ASM-XP-010`, `02-gap-analysis.md` §3.4, `RISK-XP-004`
- **Business Rules**: `BR-XP-007`, `BR-XP-008`
- **Non-Functional Requirements**: Idempotent script execution; handles millions of logs in batches of 1,000 users.
- **Dependencies**: `ReviewLog`, `User`
