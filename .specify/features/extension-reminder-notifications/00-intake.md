# Intake: Conditional Study Reminder Notifications (`US-ECO-06`)

- **Date**: 2026-10-13
- **Requested by**: Product Owner / Product Backlog Roadmap (`EPIC-09 / US-ECO-06`)
- **Feature Slug**: `extension-reminder-notifications`
- **Classification**: Bounded Task
- **Classification signals**:
  - **New or changed domain entities**: `1` (Zero backend database entities; introduces client-side `ReminderState` in `chrome.storage.local` and pure rule evaluation contracts `ReminderSettings` / `ReminderDecision` consuming `ReviewSummaryDto` from `@wordstreak/shared-types`).
  - **Existing DB schema change required**: `No` (Zero Prisma migrations; backend endpoint `GET /api/reviews/summary` from `US-REM-01` and badge refresh infrastructure from `US-ECO-05` are already live).
  - **Screens/flows touched**: `1` (Chrome Extension MV3 background notification & alarm lifecycle across `apps/extension/manifest.json`, `reminderRules.ts`, `reminder-manager.ts`, `background/index.ts`, and `/review` tab navigation).
  - **User roles affected**: `1` (`Authenticated Learner` with the WordStreak Chrome Extension installed; unauthenticated/logged-out users receive zero notifications).
  - **Cross-cutting (auth, billing, gamification core)**: `No` (Read-only consumption of `ReviewSummaryDto`; does not alter SM-2 scheduling, XP awards, or server-side streak persistence).
  - **Reversible without user-facing consequence**: `Yes` (Additive MV3 `notifications` permission, pure `reminderRules.ts` evaluator, `daily-reminder` / snooze `chrome.alarms`, and `chrome.storage.local` state; completely reversible with zero backend data impact).
- **Protocol selected**: Bounded Task (Stages 1 → 2 rapid interview [3 targeted questions] → 4 light domain model → 5 light risk & contradiction scan → 6 User Stories & requirements → 7 IEEE 29148 validation → 8 handover; Stage 3 Gap Analysis skipped).
- **Override**: None

## One-line problem statement

Deliver intelligent, non-intrusive system notifications in the WordStreak Chrome Extension (Manifest V3) driven by a pure rule evaluator (`reminderRules.ts`) that checks the learner's study summary (`dueCount`, `goalReached`, `streakAtRisk`), quiet hours, daily notification cap (max 3/day), and anti-spam frequency backoff (3 consecutive ignored notifications → max 1/day), complete with localized EN/VI copy and actionable **Học ngay (Study Now)** / **Để sau (Snooze)** buttons.
