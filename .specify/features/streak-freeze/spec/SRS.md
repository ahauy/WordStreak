# Software Requirements Specification (SRS): Streak Freeze Protection Mechanic

## 1. Requirements

### REQ-FREEZE-001: Automatic Streak Preservation upon Missed Days

- **Category**: Gamification Core / Streaks
- **Priority**: Must-Have (P0)
- **Status**: Draft
- **Description**: When a learner queries their streak status (`GET /api/v1/streaks`) or records a study activity (`POST /api/v1/streaks/activity`), the system shall evaluate the calendar days elapsed since `lastActiveDate`. If exactly 1 day was missed ($\Delta d = 2$) and the user has $\ge 1$ streak freeze, 1 freeze shall be consumed and `currentStreak` shall be preserved. If 2 consecutive days were missed ($\Delta d = 3$) and the user has 2 streak freezes, 2 freezes shall be consumed and `currentStreak` shall be preserved.
- **Derived from**: BR-FREEZE-003, BR-FREEZE-004, ASM-FREEZE-004
- **Business Rules**: BR-FREEZE-003, BR-FREEZE-004
- **Non-Functional Requirements**: Evaluation overhead < 25ms; atomic database transaction.

### REQ-FREEZE-002: Default Quota and Maximum Capacity

- **Category**: Gamification Data
- **Priority**: Must-Have (P0)
- **Status**: Draft
- **Description**: The system shall initialize every user's `UserStreak` profile with a default `streakFreezes` count of `1`. The maximum number of streak freezes a user can hold at any time shall be capped at `2` (`MAX_STREAK_FREEZES = 2`).
- **Derived from**: BR-FREEZE-001, BR-FREEZE-002, ASM-FREEZE-001, ASM-FREEZE-002
- **Business Rules**: BR-FREEZE-001, BR-FREEZE-002
- **Non-Functional Requirements**: Database default `@default(1)` on `streakFreezes`.

### REQ-FREEZE-003: Milestone Freeze Rewards and Monthly Refill

- **Category**: Gamification Rewards
- **Priority**: Must-Have (P0)
- **Status**: Draft
- **Description**: The system shall award +1 streak freeze (up to the maximum capacity of 2) when a user's `currentStreak` reaches milestone thresholds of 7 days or 30 days. Additionally, on the first activity of each calendar month, users with $< 2$ freezes shall be refilled by +1 freeze.
- **Derived from**: BR-FREEZE-005, ASM-FREEZE-005, ASM-FREEZE-006
- **Business Rules**: BR-FREEZE-005
- **Non-Functional Requirements**: Anti-abuse idempotent reward trigger.

### REQ-FREEZE-004: API Contract & Freeze Metadata Response

- **Category**: API Contracts
- **Priority**: Must-Have (P0)
- **Status**: Draft
- **Description**: The system shall return `streakFreezes`, `maxStreakFreezes`, `wasProtectedByFreeze` (boolean), and `freezesUsed` (number) in `UserStreakDto` and `StreakActivityResponseDto`.
- **Derived from**: Gap Analysis §3.1, BR-FREEZE-004
- **Business Rules**: BR-FREEZE-004
- **Non-Functional Requirements**: TypeScript shared types package compatibility.

### REQ-FREEZE-005: Frontend Streak Freeze Shield & Alert Feedback

- **Category**: UI / UX
- **Priority**: Must-Have (P0)
- **Status**: Draft
- **Description**: The frontend dashboard streak widget shall display a frost ice shield badge indicating the user's available streak freezes. If the user's streak was preserved by auto-consuming a freeze, the UI shall render a "Streak Protected" toast/modal acknowledging the save and showing remaining freezes.
- **Derived from**: Pillar 6 UX NFRs, RISK-FREEZE-002
- **Business Rules**: BR-FREEZE-004
- **Non-Functional Requirements**: WCAG 2.1 AA compliant contrast, Framer motion smooth reveal, stable outer anchor hover physics.
