# Gap Analysis: Daily Streak Engine (US-GAME-01)

- **Feature**: Daily Streak Engine & Timezone Logic
- **Date**: 2026-08-20
- **Status**: COMPLETE

---

## 1. AS-IS State (Current Implementation)

- **Database**:
  - `UserStreak` model exists in `apps/api/prisma/schema.prisma` with fields: `id`, `userId`, `currentStreak` (default 0), `bestStreak` (default 0), `lastActiveDate` (DateTime?).
  - `UserCardProgress` logs `lastReviewedAt`, but streak records are not automatically updated when `submitReview` is called in `ReviewsService`.
- **Backend API**:
  - No dedicated `StreakService` or `StreakController` exists.
  - `ReviewsService.submitReview` contains a comment `// 4. Update progress record in DB ... -> update streak` but streak logic was deferred to Epic 5.
- **Frontend UI**:
  - `apps/web/src/features/dashboard/components/StreakFlame.tsx`, `StreakHeroBanner.tsx`, and `DraggableFlameMascot.tsx` exist with hardcoded or mocked streak values.
  - Navbar streak counter displays static/mocked flame count.

---

## 2. TO-BE State (Target Experience)

- **Database**:
  - `UserStreak` extended with optional `timezone` field (default 'UTC') or handled dynamically with client timezone header.
- **Backend API**:
  - Dedicated `StreakModule` with `StreakService` and `StreakController` (`GET /api/v1/streaks/me`, `POST /api/v1/streaks/record-activity`).
  - Integration in `ReviewsService.submitReview` and practice quiz completion to automatically trigger `StreakService.recordActivity(userId, timezone)`.
  - Comprehensive timezone calculation logic with anti-abuse and idempotency guards.
- **Frontend UI**:
  - Real-time `useStreak` hook backed by `streakService` and Axios query.
  - Dynamic `StreakFlame` with glowing purple flame animations and live streak count.
  - `StreakCelebrationModal` triggering celebratory fireworks/confetti when daily streak increments.
  - Navbar streak indicator updates in real-time.

---

## 3. Gap Breakdown

| Gap ID     | Category        | AS-IS                                 | TO-BE                                                       | Remediation                                       |
| :--------- | :-------------- | :------------------------------------ | :---------------------------------------------------------- | :------------------------------------------------ |
| **GAP-01** | Backend Service | No streak calculation engine          | Timezone-aware `StreakService` with calendar day evaluation | Implement `StreakService` with full unit tests    |
| **GAP-02** | Integration     | `submitReview` does not update streak | `submitReview` invokes `StreakService.recordActivity`       | Inject `StreakService` into `ReviewsService`      |
| **GAP-03** | API Endpoints   | No `/api/v1/streaks/me` route         | REST endpoints for fetching streak status & manual sync     | Create `StreakController` & DTO contracts         |
| **GAP-04** | Frontend State  | Mocked streak in UI components        | Live `useStreak` hook with auto-refresh on review           | Connect `useStreak` to API & update Mascot/Navbar |
| **GAP-05** | Visual Feedback | No milestone celebration popup        | Animated celebration modal on streak increment              | Implement `StreakCelebrationModal`                |

---

## 4. Transition & Migration Plan

- **Backward Compatibility**: Existing users without a `UserStreak` record will have one lazily created upon login or first activity query with `currentStreak: 0, bestStreak: 0`.
- **Database Migration**: Non-breaking additive migration if adding `timezone` or `streakFreezes` column to `UserStreak`.
