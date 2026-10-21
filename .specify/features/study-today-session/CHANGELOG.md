# Changelog — Feature: "Học hôm nay" Button & Combined Session (US-UX-01)

All notable changes to this feature specification and implementation are documented here.

## [v1.0] - 2026-10-21
### Completed
- Added `TodaySessionResponse` and `TodaySessionSummary` contracts to `@wordstreak/shared-types`.
- Implemented backend endpoint `GET /api/v1/reviews/today-session` in `ReviewsController` and `getTodaySession` in `ReviewsService`:
  - Automatically merges due cards and new cards capped by `dailyGoal`.
  - Prioritizes overdue -> due today -> new cards.
  - Returns combined list and summary metadata.
  - Verified with 44 passing unit tests in `apps/api/src/modules/reviews/`.
- Implemented `StudyTodayButton` component with Obsidian pill geometry (`rounded-full`, hairline borders, `#000000` CTA background, stable outer anchor):
  - Shows dynamic counter based on due cards vs new cards.
  - Shows completed state `CheckCircle2` when `totalCount === 0`.
  - Navigates directly into `/review` with `{ autoMix: true, todaySession: true }`.
  - Unit tests in `StudyTodayButton.spec.tsx` (3 tests passed).
- Integrated `StudyTodayButton` into `DashboardPage.tsx` with async data fetching from `reviewsService.getTodaySession()`.
- Verified 100% test pass: 81 test files, 458 tests passing in `apps/web`.
