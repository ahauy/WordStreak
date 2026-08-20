# Elicitation: Daily Streak Engine & Timezone Logic (US-GAME-01)

- **Feature**: Daily Streak Engine & Timezone-Aware Retention Logic
- **Date**: 2026-08-20
- **Status**: COMPLETE

---

## Stage 1 — Business Value

- **Problem**: Learners lose motivation and abandon vocabulary retention routines when their consecutive daily learning habits are not recognized in real-time, or when timezone shifts (travel, local midnight) corrupt streak calculations or cause unwarranted streak resets.
- **Personas**:
  - **Persona A (Alex - Exam Prep)**: Studies 20-30 words daily; expects immediate visual confirmation and streak increment when finishing daily flashcards.
  - **Persona B (Minh - Busy Professional)**: Studies late at night (11:30 PM - 12:15 AM); requires accurate local timezone calendar day boundary detection so crossing midnight counts for the appropriate day.
  - **Persona C (Linh - Remote/Traveler)**: Travels across timezones; needs timezone-aware calculations without being penalized or exploiting artificial timezone changes.
- **Success Metrics**:
  - 7-day user retention lift $+20\%$
  - Daily active study session completion $+30\%$
  - Zero false-positive streak resets due to timezone discrepancies ($<0.01\%$ support tickets)

---

## Pillar 1 — Personas, Actors & RBAC

- **Learner Role**: Can view personal streak status, earn streak increments by completing daily learning sessions (SM-2 reviews, quizzes), and configure local timezone.
- **System Admin / Engine**: Manages streak verification and calculations; ensures idempotent execution on review submission.
- **Guest / Unauthenticated**: Cannot earn or persist streaks; prompted to sign in to save streak progress.

---

## Pillar 2 — State Machine & Lifecycle

- **Daily Streak State Transitions**:
  - `NO_STREAK` ($Streak = 0, lastActiveDate = null$)
  - `ACTIVE_TODAY` (User completed a qualifying study session today in their local timezone; flame burns brightly)
  - `PENDING_TODAY` (User had an active streak yesterday, but has not completed study session today; flame shows prompt/warning)
  - `BROKEN_STREAK` (User missed $\ge 1$ calendar day in local timezone; reset to 0 upon check or 1 upon new study activity)
- **Streak Activity Evaluation**:
  - Triggered automatically on `POST /api/v1/reviews/submit` (SM-2 review) or manual sync `POST /api/v1/streaks/record-activity` or practice quiz completion.

---

## Pillar 3 — Business Rules & Algorithms

- **Q1 (Qualifying Activity Definition)**:
  - Any completed SM-2 flashcard review rating submission (`POST /api/v1/reviews/submit`), practice quiz completion, or studying cards counts as daily activity.
- **Q2 (Timezone-Aware Date Boundary Calculation)**:
  - Evaluates calendar date in user's IANA timezone (e.g. `Intl.DateTimeFormat` or `date-fns-tz` / `dayjs.tz` format `YYYY-MM-DD`).
  - Compares local `today`, `yesterday`, and `lastActiveDay`.
  - If `lastActiveDay == today`: Idempotent no-op (streak unchanged, `streakIncreased: false`).
  - If `lastActiveDay == yesterday`: Streak increments: `currentStreak += 1`, `bestStreak = max(bestStreak, currentStreak)`, `lastActiveDate = now()`.
  - If `lastActiveDay < yesterday` (or null): Streak resets/starts at `1`, `bestStreak = max(bestStreak, 1)`, `lastActiveDate = now()`.
- **Q3 (Anti-Abuse & Clock Drift Protection)**:
  - Future timestamps rejected ($now + 5\text{ mins}$ threshold).
  - Timezone hopping exploit prevention: Minimum 4-hour cooldown between distinct calendar day streak increments to prevent manipulating timezones back and forth within a single sitting.
- **Q4 (Mascot Tiers & Visual Feedback)**:
  - Tier 1: 1–6 Days (Spark / Baby Violet Flame)
  - Tier 2: 7–13 Days (Ember Blaze / Growing Violet Flame)
  - Tier 3: 14–29 Days (Radiant Violet Inferno)
  - Tier 4: 30+ Days (Cosmic Violet Nova)
  - Immediate celebratory modal / toast with particle bursts on streak increase.

---

## Pillar 4 — Workflows & Edge Cases

- **Late Night Study Crossing Midnight**: If user studies at 11:55 PM (counts for yesterday) and continues at 12:05 AM (counts for today), streak increments twice in natural progression across the 2 calendar days.
- **Offline / Network Reconnect**: When client reconnects, recorded timestamp is validated against server time to prevent local clock manipulation.
- **Idempotent Multi-card Reviews**: In a 20-card review session, only the first card completed today increments the streak; remaining 19 cards update progress idempotently without double-incrementing streak.

---

## Pillar 5 — Entities, Data Boundaries & Privacy

- `UserStreak` entity:
  - `id`: String (UUID)
  - `userId`: String (Unique FK to User)
  - `currentStreak`: Int
  - `bestStreak`: Int
  - `lastActiveDate`: DateTime?
  - `timezone`: String? (Default: `'UTC'`)
  - `streakFreezes`: Int (Default: 1)
- Privacy: Streak data is private to the user account by default.

---

## Pillar 6 — UX & Non-Functional Requirements

- **Design System Compliance**: Obsidian pure black pills, hairline `#e5e5e5` borders, Electric Violet `#9333ea` flame accents, stable outer anchor hover physics (per `apps/web/MEMORY.md`).
- **Performance**: Streak lookup & calculation overhead $< 20\text{ms}$ on review submission.
- **Accessibility**: ARIA live regions for streak announcements, WCAG AA contrast for flame badge and text.

---

## Assumptions Confirmed

- `ASM-STREAK-001`: Daily streak evaluates calendar days according to the user's local IANA timezone (`x-timezone` header or user preference, fallback to UTC).
- `ASM-STREAK-002`: Any completed SM-2 review rating or practice session qualifies as daily study activity.
- `ASM-STREAK-003`: Streak increments are strictly idempotent within the same calendar day in the user's timezone.
- `ASM-STREAK-004`: If last active day was yesterday, streak increments by +1; if earlier, streak resets to 1 upon new study activity.
- `ASM-STREAK-005`: Visual mascot tiers (1-6, 7-13, 14-29, 30+) reflect current streak level with electric violet flame physics.
