# Elicitation Record: Streak Freeze Protection Mechanic (US-GAME-02)

- **Feature**: Streak Freeze Protection Mechanic
- **Slug**: `streak-freeze`
- **Date**: 2026-08-21
- **Status**: Completed

---

## Stage 1 — Business Value

- **Problem & Pain Point**: Learners lose their multi-day streak and morale when unexpected events prevent studying for 1-2 days. Without freeze protection, a broken streak causes churn.
- **Target Personas**: Learner (Free & Active Users).
- **Success Metrics**:
  - Increase 14-day user retention by +20%.
  - Reduce streak drop-off churn by 35% after missed days.
  - Sub-50ms latency overhead on streak evaluation and auto-freeze check.

---

## Pillar 1 — Personas, Actors & RBAC

- **Roles**:
  - `Learner (Authenticated)`: Can view remaining freeze quota, receive automatic streak preservation when days are missed, earn milestone freezes, and see freeze usage history / notifications.
  - `Guest (Unauthenticated)`: Cannot store streak freezes or preserve streaks across sessions.
- **Ownership**: Each learner owns their `UserStreak` and freeze quota; one user cannot modify or view another user's freeze balance.

---

## Pillar 2 — State Machine & Lifecycle

- **Freeze States**:
  - `FULL` (Quota = 2 / Max)
  - `AVAILABLE` (Quota = 1)
  - `DEPLETED` (Quota = 0)
- **Lifecycle Events**:
  1. `ACCOUNT_CREATED` → Quota initialized to 1 (`@default(1)`).
  2. `MISSED_DAY_EVALUATED` →
     - If missed 1 day and `streakFreezes >= 1`: consume 1 freeze, preserve `currentStreak`, log freeze usage event, set `wasProtectedByFreeze = true`.
     - If missed 2 consecutive days and `streakFreezes == 2`: consume 2 freezes, preserve `currentStreak`, log freeze usage.
     - If missed days > available freezes: consume available freezes or reset streak to 0 (or 1 if recording new activity).
  3. `MILESTONE_REACHED` (e.g. 7-day or 30-day streak) → Increment `streakFreezes = min(maxQuota, streakFreezes + 1)`.
  4. `MONTHLY_RESET_OR_REFILL` → On 1st of month, grant +1 freeze up to cap of 2.

---

## Pillar 3 — Business Rules & Algorithms

- **BR-FREEZE-001**: Maximum freeze capacity is strictly capped at `2` (`MAX_STREAK_FREEZES = 2`).
- **BR-FREEZE-002**: Initial default quota for every new user streak profile is `1`.
- **BR-FREEZE-003**: A single streak freeze protects exactly 1 calendar day of inactivity within the user's local timezone.
- **BR-FREEZE-004**: Lazy evaluation occurs on both `getStreak` and `recordActivity`:
  - Let $\Delta d = \text{daysBetween}(\text{lastActiveDay}, \text{todayStr})$.
  - If $\Delta d == 0$: Active today.
  - If $\Delta d == 1$: Pending today (streak intact from yesterday).
  - If $\Delta d == 2$: Missed 1 day (yesterday). If `streakFreezes >= 1`, auto-consume 1 freeze: streak remains active/pending, freeze quota decreases by 1, and `lastActiveDate` / freeze tracking bridges the gap.
  - If $\Delta d == 3$: Missed 2 days. If `streakFreezes >= 2`, auto-consume 2 freezes.
  - If $\Delta d > \text{streakFreezes} + 1$: Insufficient freezes to bridge the gap; streak resets to 0 (or 1 on new activity).
- **BR-FREEZE-005**: Reaching streak milestones (7 days, 30 days) awards +1 freeze up to maximum capacity of 2.

---

## Pillar 4 — Workflows & Edge Cases

- **Workflow 1 (Lazy Freeze Auto-Bridge on Read / getStreak)**:
  - User visits dashboard after missing yesterday.
  - `getStreak` runs, detects $\Delta d = 2$.
  - User has 1 freeze → Database updates `streakFreezes -= 1`, saves last freeze timestamp, flags response with `streakProtected: true`, `consumedFreezes: 1`.
  - UI displays cyan/ice frost notification banner: "Your streak of X days was saved by Streak Freeze! 🧊".
- **Workflow 2 (Study Submission on Missed Day Bridge)**:
  - User completes review on day after missed day.
  - Streak increases seamlessly from preserved count ($N + 1$).
- **Edge Cases**:
  - Timezone shift: All day calculations use client IANA timezone with UTC fallback.
  - Race condition: Atomic database transaction or conditional update ensures freeze cannot be double-consumed.

---

## Pillar 5 — Entities, Data Boundaries & Privacy

- **Schema Modifications**:
  - Extend `UserStreak` model:
    - `streakFreezes Int @default(1)`
    - `lastFreezeDate DateTime?`
    - `totalFreezesUsed Int @default(0)`
- **Data Privacy**: No PII in streak/freeze records. Soft cascade on user deletion.

---

## Pillar 6 — UX & Non-Functional Requirements

- **Design Tokens & Anti-AI-Slop**:
  - Frost Ice badge: Minimal cyan/ice accent (`#06B6D4` / `#0891B2` subtle highlight on pure white/gray canvas, obsidian pill geometry `#000000` buttons).
  - Stable outer anchor hover physics on streak badge and freeze counter.
  - Modal notification with Lucide `ShieldAlert` / `Snowflake` icon and clear copy.
- **Accessibility**: ARIA live region for streak protection alerts, full keyboard navigation for modals.
- **Performance**: Zero additional DB roundtrips during normal streak fetching (embedded in single `UserStreak` query).

---

## Assumptions Confirmed

- **ASM-FREEZE-001**: User starts with 1 default freeze, maximum capacity is 2.
- **ASM-FREEZE-002**: Lazy auto-consumption is used to bridge missed days up to available freeze count.
- **ASM-FREEZE-003**: 7-day and 30-day streak milestones award 1 bonus freeze (capped at 2).
- **ASM-FREEZE-004**: Monthly refill provides 1 freeze on 1st of month if quota < 2.

---

## Open Questions (Resolved)

- None blocking.
