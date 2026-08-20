# Implementation Tasks: Daily Streak Engine (US-GAME-01)

**Slug**: `daily-streak-engine`  
**Status**: COMPLETED ✅

---

## Phase 1: Shared Types & Contracts

- [x] `T-01` [P] [US-GAME-01] Export `UserStreakDto`, `RecordStreakActivityDto`, and `StreakActivityResponseDto` in `packages/shared-types/src/streaks.ts`.
- [x] `T-02` [US-GAME-01] Export streaks from `packages/shared-types/src/index.ts` and build shared types package.

---

## Phase 2: Backend Streak Engine Module (TDD)

- [x] `T-03` [P] [US-GAME-01] Create DTOs in `apps/api/src/modules/streaks/dto/record-streak-activity.dto.ts`.
- [x] `T-04` [US-GAME-01] Create comprehensive unit tests `apps/api/src/modules/streaks/streak.service.spec.ts` for timezone date calculations, initial streak creation, today no-op, yesterday increment, broken streak reset, and clock drift protection.
- [x] `T-05` [US-GAME-01] Implement `apps/api/src/modules/streaks/streak.service.ts` with timezone calendar formatting and streak calculation algorithms.
- [x] `T-06` [US-GAME-01] Create `apps/api/src/modules/streaks/streak.controller.ts` with `GET /api/v1/streaks/me` and `POST /api/v1/streaks/record-activity` protected by `JwtAuthGuard`.
- [x] `T-07` [US-GAME-01] Create `apps/api/src/modules/streaks/streak.module.ts` and register in `apps/api/src/app.module.ts`.
- [x] `T-08` [US-GAME-01] Integrate `StreakService` into `apps/api/src/modules/reviews/reviews.service.ts` to automatically record activity on review submit, and update `reviews.service.spec.ts`.

---

## Phase 3: Frontend Streak Client & State Hook

- [x] `T-09` [P] [US-GAME-01] Implement `apps/web/src/features/dashboard/services/streakService.ts` to query `/api/v1/streaks/me` and `/api/v1/streaks/record-activity`.
- [x] `T-10` [US-GAME-01] Implement `useStreak` hook in `apps/web/src/features/dashboard/hooks/useStreak.ts` for state management, live refresh, and celebratory event triggers.

---

## Phase 4: Frontend UI Components & Celebration Modal

- [x] `T-11` [P] [US-GAME-01] Update `apps/web/src/features/dashboard/components/StreakFlame.tsx` and `StreakHeroBanner.tsx` to bind to dynamic `useStreak` data and render dynamic flame tiers per `apps/web/MEMORY.md`.
- [x] `T-12` [P] [US-GAME-01] Update `apps/web/src/features/dashboard/components/DashboardNavbar.tsx` to display live streak counter and glowing flame status.
- [x] `T-13` [US-GAME-01] Implement `apps/web/src/features/dashboard/components/StreakCelebrationModal.tsx` with animated Electric Violet Flame and confetti particles.
- [x] `T-14` [US-GAME-01] Connect celebration modal trigger in `apps/web/src/features/reviews/pages/ReviewSessionPage.tsx` and practice quiz completion.

---

## Phase 5: Quality Review, Tech Docs & Verification

- [x] `T-15` [US-GAME-01] Adversarial UI/UX review against `apps/web/DESIGN.md` and `apps/web/MEMORY.md` (no generic AI slop, pure white canvas, Obsidian black pills, stable outer hover anchors).
- [x] `T-16` [US-GAME-01] Create feature documentation in `docs/features/daily-streak-engine/README.md` and update features index.
- [x] `T-17` [US-GAME-01] Create user guide in `docs/user-guides/daily-streak-engine.md`.
- [x] `T-18` [US-GAME-01] Run full test suites and update roadmap `US-GAME-01` in `docs/PRODUCT_BACKLOG_ROADMAP.md` to `[x]`.
