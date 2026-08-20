# Implementation Plan: Daily Streak Engine & Timezone Logic (US-GAME-01)

**Slug**: `daily-streak-engine`  
**Status**: APPROVED

---

## 1. Technical Architecture & Component Slices

### Slice 1: Shared Types & DTOs (`packages/shared-types`)

- Define streak interfaces:
  - `UserStreakDto`: Current streak, best streak, last active timestamp, active today flag, pending today flag, timezone, flame tier.
  - `RecordStreakActivityDto`: `{ timezone?: string }`.
  - `StreakActivityResponseDto`: `{ currentStreak, bestStreak, streakIncreased, isActiveToday, flameTier, message }`.
- Export in `packages/shared-types/src/streaks.ts` and `packages/shared-types/src/index.ts`.
- Build package via `pnpm --filter @wordstreak/shared-types build`.

### Slice 2: Backend Streak Engine Module (`apps/api`)

- Create `StreakModule`, `StreakController`, and `StreakService` in `apps/api/src/modules/streaks/`.
- Implement `StreakService`:
  - `getStreak(userId: string, clientTimezone?: string): Promise<UserStreakDto>`
  - `recordActivity(userId: string, dto?: RecordStreakActivityDto): Promise<StreakActivityResponseDto>`
  - Date calculation helper to format date strings (`YYYY-MM-DD`) in specified IANA timezone with UTC fallback.
  - Unit tests in `apps/api/src/modules/streaks/streak.service.spec.ts` covering all branches (initial record, today no-op, yesterday increment, missed day reset, midnight transitions, invalid timezone).
- Integrate `StreakService` into `ReviewsService.submitReview`:
  - Automatically invoke `this.streakService.recordActivity(userId, { timezone })` when user reviews a card.
  - Unit test review submission with streak integration in `reviews.service.spec.ts`.
- Register `StreakModule` in `app.module.ts`.

### Slice 3: Frontend Streak Client & State Hook (`apps/web`)

- Create `streakService.ts` in `apps/web/src/features/dashboard/services/streakService.ts` calling `/api/v1/streaks/me` and `/api/v1/streaks/record-activity` with client timezone header/payload.
- Create `useStreak` hook in `apps/web/src/features/dashboard/hooks/useStreak.ts`:
  - Provides `{ streak, isLoading, recordActivity, refreshStreak }`.
  - Auto-subscribes or refetches upon review/quiz completion events.

### Slice 4: Frontend UI Components & Celebration Modal (`apps/web`)

- Update `apps/web/src/features/dashboard/components/StreakFlame.tsx` to accept live streak props and render appropriate dynamic flame tiers per `apps/web/MEMORY.md`.
- Update `apps/web/src/features/dashboard/components/StreakHeroBanner.tsx` and `DashboardNavbar.tsx` to bind to live `useStreak` data.
- Create `apps/web/src/features/dashboard/components/StreakCelebrationModal.tsx` for celebratory confetti bursts and flame tier announcements on streak increment.
- Wire celebration trigger into `ReviewSessionPage` and quiz completions.

### Slice 5: Quality Review, Tech Docs & Verification

- Run adversarial UI/UX audit against `DESIGN.md` and `MEMORY.md` (no generic AI slop, pure white canvas, Obsidian black pills, stable outer hover anchors).
- Create `docs/features/daily-streak-engine/README.md`.
- Create user guide with screenshot placeholders in `docs/user-guides/daily-streak-engine.md`.
- Update `docs/PRODUCT_BACKLOG_ROADMAP.md` marking `US-GAME-01` as completed `[x]`.
