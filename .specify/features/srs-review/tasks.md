# Tasks Breakdown: Spaced Repetition System (SRS Review)

## Phase 1: Shared Contracts & Types

- [ ] **Task 1.1**: Define SRS shared types and DTOs in `packages/shared-types/src/reviews.ts` (`SrsRating`, `CardLearningStatus`, `DueCardItem`, `SubmitReviewDto`, `ReviewStatsResponse`) and export from `packages/shared-types/src/index.ts`.

## Phase 2: Backend Implementation (TDD)

- [ ] **Task 2.1**: Implement `SrsService` unit tests (`apps/api/src/modules/reviews/srs.service.spec.ts`) testing SM-2 calculations for all ratings 1..4 and boundary clamping $EF \ge 1.3$.
- [ ] **Task 2.2**: Implement `SrsService` (`apps/api/src/modules/reviews/srs.service.ts`).
- [ ] **Task 2.3**: Implement `ReviewsService` and unit tests (`apps/api/src/modules/reviews/reviews.service.spec.ts`) covering `getDueCards`, `submitReview`, and `getReviewStats`.
- [ ] **Task 2.4**: Implement `ReviewsController` and DTOs (`apps/api/src/modules/reviews/dto/submit-review.dto.ts`, `apps/api/src/modules/reviews/reviews.controller.ts`) with `JwtAuthGuard`.
- [ ] **Task 2.5**: Register `ReviewsModule` in `apps/api/src/app.module.ts`.

## Phase 3: Frontend API & Session State Machine

- [ ] **Task 3.1**: Create `reviewsApi.ts` in `apps/web/src/features/reviews/services/reviewsApi.ts`.
- [ ] **Task 3.2**: Implement `useReviewSession` custom hook (`apps/web/src/features/reviews/hooks/useReviewSession.ts`) with queue management, intra-session repeat for `Again` ratings, and accuracy/time tracking.

## Phase 4: Frontend UI Components & Views

- [ ] **Task 4.1**: Implement `FlashcardReviewCard` (`apps/web/src/features/reviews/components/FlashcardReviewCard.tsx`) adhering to `DESIGN.md` with 3D flip transform, audio button, keyboard listeners, and Obsidian rating pills.
- [ ] **Task 4.2**: Implement `ReviewProgressBar`, `ReviewEmptyState`, and `ReviewSummaryModal` components.
- [ ] **Task 4.3**: Create `ReviewSessionPage` (`apps/web/src/features/reviews/pages/ReviewSessionPage.tsx`) handling both global (`/review`) and deck-scoped (`/decks/:id/review`) modes.
- [ ] **Task 4.4**: Register `/review` and `/decks/:id/review` routes in `apps/web/src/App.tsx` with `ProtectedRoute`.
- [ ] **Task 4.5**: Add "Start Review" action triggers on `DashboardPage` and `DeckDetailPage`.

## Phase 5: Verification, Docs & User Guide

- [ ] **Task 5.1**: Run backend and frontend automated test suites.
- [ ] **Task 5.2**: Create user guide `docs/user-guides/srs-review.md` and feature technical doc `docs/features/srs-review/README.md`.
- [ ] **Task 5.3**: Update `docs/PRODUCT_BACKLOG_ROADMAP.md` marking `US-SRS-01`, `US-SRS-02`, `US-SRS-03` as `[x]`.
