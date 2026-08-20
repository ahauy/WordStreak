# Implementation Plan: Spaced Repetition System (SRS Review)

## 1. Technical Architecture & Component Slices

### Slice 1: Core Domain Logic & Shared Contracts (`packages/shared-types`)

- Define `SrsRating`, `CardLearningStatus`, `DueCardItem`, `SubmitReviewDto`, `ReviewStatsResponse` in `packages/shared-types/src/reviews.ts`.
- Export from `packages/shared-types/src/index.ts`.

### Slice 2: Backend SRS Module (`apps/api`)

- **`SrsService`**: Pure SuperMemo-2 mathematical calculator.
  - Unit tests covering 100% of ratings (1: Again, 2: Hard, 3: Good, 4: Easy) and boundary conditions ($EF \ge 1.3$).
- **`ReviewsService`**:
  - `getDueCards(userId, deckId?, limit?)`: Computes due queue with index optimization and daily goal limits.
  - `submitReview(userId, dto: SubmitReviewDto)`: Validates ownership, calls `SrsService`, atomically saves progress to PostgreSQL via Prisma.
  - `getReviewStats(userId)`: Aggregates counts by card learning status.
- **`ReviewsController`**: REST controller exposing `/api/v1/reviews/*` protected by `JwtAuthGuard`.
- **`ReviewsModule`**: Registers controller and services, imports `PrismaModule`.

### Slice 3: Frontend Review Engine & UI (`apps/web`)

- **Review Service & Hook**:
  - `reviewsApi.ts`: Axios client calls (`fetchDueCards`, `submitReviewRating`, `fetchReviewStats`).
  - `useReviewSession.ts`: State machine hook managing active card index, intra-session repeat queue for `Again` ratings, session duration, and accuracy metrics.
- **Components**:
  - `FlashcardReviewCard.tsx`: Minimalist 3D flip card with front/back faces, IPA phonetics, native audio/WebSpeech player, and Obsidian rating buttons.
  - `ReviewProgressBar.tsx`: Clean top bar showing cards completed / remaining.
  - `ReviewSummaryModal.tsx`: Celebration dialog with accuracy %, reviewed count, time spent, and Purple Flame animation.
  - `ReviewEmptyState.tsx`: "All caught up" view with navigation back to Decks.
- **Pages & Routes**:
  - `ReviewSessionPage.tsx`: Full-screen study page mounted at `/review` and `/decks/:id/review`.
  - Update `App.tsx` routes with `ProtectedRoute`.
  - Add "Start Review" action triggers on `DashboardPage` and `DeckDetailPage`.

---

## 2. Risk & Migration Strategy

- **Prisma Schema**: Ensure compound index on `UserCardProgress` (`[userId, nextReviewDate]`).
- **Zero Breaking Changes**: Existing card and deck functionality remains intact.
