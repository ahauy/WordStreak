# Implementation Tasks: Learning Analytics & Retention Dashboard

**Feature Slug**: `learning-analytics`  
**Date**: 2026-08-21

---

## Phase 1: Shared Types & Schema Migration

- [x] **Task 1.1**: Add Analytics DTOs and Response Interfaces to `packages/shared-types/src/index.ts`.
- [x] **Task 1.2**: Update `apps/api/prisma/schema.prisma` with `ReviewLog` model and relations on `User` and `Card`.
- [x] **Task 1.3**: Run `npx prisma migrate dev --name add_review_logs` and `prisma generate`.
- [x] **Task 1.4**: Update `ReviewsService.submitReview` to create `ReviewLog` entry on review submission.

---

## Phase 2: Backend Analytics Engine & TDD

- [x] **Task 2.1**: Create `AnalyticsService` in `apps/api/src/modules/analytics/analytics.service.ts` with mastery calculation, 365-day rolling heatmap with timezone conversion, and deck forecast velocity algorithms.
- [x] **Task 2.2**: Create `AnalyticsController` in `apps/api/src/modules/analytics/analytics.controller.ts` with `JwtAuthGuard` endpoints:
  - `GET /api/v1/analytics/overview`
  - `GET /api/v1/analytics/mastery-summary`
  - `GET /api/v1/analytics/activity-heatmap`
  - `GET /api/v1/analytics/deck-forecast/:deckId`
  - `GET /api/v1/analytics/decks-progress`
- [x] **Task 2.3**: Create `AnalyticsModule` and register in `app.module.ts`.
- [x] **Task 2.4**: Write unit tests `analytics.service.spec.ts` and `analytics.controller.spec.ts` (100% pass).

---

## Phase 3: Frontend UI Components & Pages

- [x] **Task 3.1**: Create `useAnalytics` hook in `apps/web/src/features/analytics/hooks/useAnalytics.ts` with timezone detection (`Intl.DateTimeFormat().resolvedOptions().timeZone`).
- [x] **Task 3.2**: Create `ActivityHeatmap.tsx` component (52-week horizontal grid, accessible tooltips, intensity levels 0–4).
- [x] **Task 3.3**: Create `MasteryDistributionCard.tsx` (Donut / Progress breakdown of Mastered/Learning/New).
- [x] **Task 3.4**: Create `DeckForecastCard.tsx` and `DeckProgressTable.tsx`.
- [x] **Task 3.5**: Create `AnalyticsPage.tsx` at route `/analytics` and add link to navigation header/sidebar.
- [x] **Task 3.6**: Embed compact Analytics Overview Widget on `DashboardPage.tsx`.
- [x] **Task 3.7**: Write frontend unit/integration tests in `AnalyticsPage.spec.tsx` and `ActivityHeatmap.spec.tsx`.

---

## Phase 4: Anti-AI-Slop Review, Docs & Verification

- [x] **Task 4.1**: UI visual review against `DESIGN.md` and `MEMORY.md`.
- [x] **Task 4.2**: Generate Technical Documentation in `docs/features/learning-analytics/README.md`.
- [x] **Task 4.3**: Generate User Guide in `docs/user-guides/learning-analytics.md`.
- [x] **Task 4.4**: Update `docs/PRODUCT_BACKLOG_ROADMAP.md` marking US-STAT-01 and US-STAT-02 as `[x]`.
- [x] **Task 4.5**: Run full workspace test suites (`pnpm test`).
