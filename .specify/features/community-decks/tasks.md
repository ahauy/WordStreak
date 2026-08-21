# Tasks: Community Decks Marketplace (US-ECO-02)

**Input**: Design documents from `.specify/features/community-decks/` (`spec.md`, `plan.md`, `data-model.md`, `contracts/`)  
**Prerequisites**: Shared types contracts, NestJS API architecture, React web app  
**Organization**: Grouped into Setup, Foundational, and User Story phases (P1 through P4) for independent implementation and testing.

---

## Format: `- [ ] [TaskID] [P?] [Story?] Description with file path`

- **[P]**: Can run in parallel (different files, no blocking dependencies)
- **[Story]**: User story label (`[US1]`, `[US2]`, `[US3]`, `[US4]`)
- Every task includes the exact file path and clear implementation actions.

---

## Phase 1: Setup (Shared Types & Database Schema)

**Purpose**: Establish shared TypeScript contracts and Prisma schema extensions.

- [ ] T001 Define community interfaces (`CommunityDeckItem`, `CommunityDeckDetailResponse`, `CommunityDecksQueryDto`, `PaginatedCommunityDecksResponse`, `CloneDeckResponse`, `RateDeckDto`, `RateDeckResponse`, `CommunityDeckSort`, `CommunityCategory`) in `packages/shared-types/src/community.ts`
- [ ] T002 Re-export community types in `packages/shared-types/src/index.ts` and verify build with `pnpm --filter @wordstreak/shared-types build`
- [ ] T003 [P] Update `apps/api/prisma/schema.prisma` with `DeckRating` model, `Deck` extensions (`cloneCount`, `averageRating`, `totalRatings`, `category`, `originalDeckId`), relations, and compound indexes

---

## Phase 2: Foundational (Backend Community Module & Services)

**Purpose**: Core backend REST endpoints, validation DTOs, and transaction services.

- [ ] T004 Create `GetCommunityDecksDto` and `RateDeckDto` with `class-validator` in `apps/api/src/modules/community/dto/`
- [ ] T005 Write unit tests for `CommunityService` covering all business rules (`BR-COMM-001` to `BR-COMM-008`) in `apps/api/src/modules/community/community.service.spec.ts`
- [ ] T006 Implement `CommunityService.getPublicDecks()` with search, category filtering, cursor/offset pagination, and sorting (`POPULAR`, `TOP_RATED`, `NEWEST`) in `apps/api/src/modules/community/community.service.ts`
- [ ] T007 Implement `CommunityService.getPublicDeckDetail()` with card list and author profile projection in `apps/api/src/modules/community/community.service.ts`
- [ ] T008 Implement `CommunityService.cloneDeck()` using atomic Prisma interactive `$transaction` (deep copy cards, initialize `UserCardProgress` in `NEW` state, increment source `cloneCount`, prevent self-cloning) in `apps/api/src/modules/community/community.service.ts`
- [ ] T009 Implement `CommunityService.rateDeck()` with anti-abuse (block self-rate, 1-to-5 star validation, atomic recalculation of `averageRating` and `totalRatings`) in `apps/api/src/modules/community/community.service.ts`
- [ ] T010 Expose endpoints in `CommunityController` (`GET /api/v1/community/decks`, `GET /api/v1/community/decks/:id`, `POST /api/v1/community/decks/:id/clone`, `POST /api/v1/community/decks/:id/rate`) in `apps/api/src/modules/community/community.controller.ts`
- [ ] T011 Register `CommunityModule` in `apps/api/src/app.module.ts`

**Checkpoint**: Backend community API is fully functional, tested, and passing all unit tests.

---

## Phase 3: User Story 1 & 2 - Community Discovery Page & Deck Preview Modal (Priority: P1) 🎯 MVP

**Goal**: Enable learners to browse public vocabulary decks, search, filter by category, sort by popularity/rating/newest, and preview card content in a modal.  
**Independent Test**: Load `/community`, test category chips, search input, sort selector, and click a deck card to preview cards and audio.

### Tests for User Story 1 & 2

- [ ] T012 [P] [US1] Write unit tests for `communityService.ts` in `apps/web/src/features/community/services/communityService.spec.ts`
- [ ] T013 [P] [US1] Write component tests for `CommunityDecksPage` and `CommunityDeckCard` in `apps/web/src/features/community/pages/CommunityDecksPage.spec.tsx`

### Implementation for User Story 1 & 2

- [ ] T014 [US1] Implement Axios client `communityService.ts` in `apps/web/src/features/community/services/communityService.ts`
- [ ] T015 [P] [US1] Implement `CategoryFilterBar` component for standardized category chip navigation in `apps/web/src/features/community/components/CategoryFilterBar.tsx`
- [ ] T016 [P] [US1] Implement `CommunityDeckCard` component with cover, author avatar, stats badges, star rating, clone count, and CTA in `apps/web/src/features/community/components/CommunityDeckCard.tsx`
- [ ] T017 [P] [US2] Implement `CommunityDeckPreviewModal` showing metadata, card list preview with audio pronunciation, and sticky clone CTA in `apps/web/src/features/community/components/CommunityDeckPreviewModal.tsx`
- [ ] T018 [US1] Implement `CommunityDecksPage` with responsive grid, search bar, sort dropdown, and empty states in `apps/web/src/features/community/pages/CommunityDecksPage.tsx`
- [ ] T019 [US1] Register `/community` route in `apps/web/src/App.tsx` and add "Khám phá" navigation link in the top Navbar

---

## Phase 4: User Story 3 & 4 - 1-Click Clone & 5-Star Rating System (Priority: P1 & P2)

**Goal**: Enable learners to clone community decks in 1 click and submit/update 5-star ratings with review comments.  
**Independent Test**: Click "Sao chép" on a public deck, verify toast and redirect to new cloned deck in personal library; click "Đánh giá", submit 5 stars, and verify aggregate rating updates immediately.

### Tests for User Story 3 & 4

- [ ] T020 [P] [US3] Write component tests for clone flow and feedback toasts in `apps/web/src/features/community/components/CommunityDeckPreviewModal.spec.tsx`
- [ ] T021 [P] [US4] Write component tests for `RateDeckModal` in `apps/web/src/features/community/components/RateDeckModal.spec.tsx`

### Implementation for User Story 3 & 4

- [ ] T022 [US3] Wire 1-Click Clone action in `CommunityDeckCard` and `CommunityDeckPreviewModal` with loading spinner, success toast, and navigation link
- [ ] T023 [P] [US4] Implement `RateDeckModal` with interactive star selector, character-counted comment textarea, and submit handler in `apps/web/src/features/community/components/RateDeckModal.tsx`
- [ ] T024 [US4] Connect `RateDeckModal` to deck card and preview modal with live average rating update

---

## Phase 5: Polish, End-to-End Verification & Technical Documentation

**Purpose**: Verify all unit/component tests pass, anti-AI-slop design system adherence, create feature documentation and user guide.

- [ ] T025 Run full monorepo test suites (`pnpm test`) and resolve any test/lint regressions
- [ ] T026 Create technical feature documentation in `docs/features/community-decks/README.md`
- [ ] T027 Create end-user guide with step-by-step instructions in `docs/user-guides/community-decks.md`
- [ ] T028 Update `docs/PRODUCT_BACKLOG_ROADMAP.md` marking `US-ECO-02` as completed (`[x]`)
