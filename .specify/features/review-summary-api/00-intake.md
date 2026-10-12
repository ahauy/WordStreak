# Intake: Review Summary API for Extension (`US-REM-01`)

- **Date**: 2026-10-12
- **Requested by**: Product Owner / Product Backlog Roadmap (`EPIC-09 / US-REM-01`)
- **Feature Slug**: `review-summary-api`
- **Classification**: Bounded Task
- **Classification signals**:
  - **New or changed domain entities**: `0` (Reuses existing `User`, `Deck`, `Card`, `UserCardProgress`, `ReviewLog`, and `UserStreak` models; adds shared DTO `ReviewSummaryDto` in `@wordstreak/shared-types`).
  - **Existing DB schema change required**: `No` (Zero database migrations required; all required indexes on `user_card_progress`, `decks(userId, isArchived)`, `review_logs(userId, reviewedAt)`, and `user_streaks(userId)` already exist).
  - **Screens/flows touched**: `1` (Single lightweight read-only REST endpoint `GET /api/v1/reviews/summary` inside `ReviewsController` / `ReviewsService` for Chrome Extension MV3 polling and Web client consumption).
  - **User roles affected**: `1` (`Authenticated Learner` protected via `JwtAuthGuard`).
  - **Cross-cutting (auth, billing, gamification core)**: `No` (Read-only aggregation reusing `StreakService.getStreak(userId, tz)` without modifying SM-2 scheduling or XP award formulas).
  - **Reversible without user-facing consequence**: `Yes` (Additive read-only endpoint and shared DTO).
- **Protocol selected**: Bounded Task (Stages 1 → 2 interactive interview → 4 light domain model → 5 risk & contradiction scan → 6 User Stories & requirements → 7 IEEE 29148 validation → 8 handover; Stage 3 Gap Analysis skipped).
- **Override**: None

## One-line problem statement

Provide a lightweight, timezone-aware, ETag-cacheable `GET /api/v1/reviews/summary` endpoint that returns aggregated learning status counts (`dueCount`, `newAvailable`, `studiedToday`, `dailyGoal`, `goalReached`, `currentStreak`, `streakAtRisk`, `timezone`, `endOfDayAt`, `nextDueAt`) without transferring full flashcard payloads, enabling the WordStreak Chrome Extension (Manifest V3) to update its badge and evaluate conditional study reminders efficiently.
