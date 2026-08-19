# Tasks: Deck CRUD & Vocabulary Deck Management

**Feature Branch**: `003-deck-crud`  
**Spec**: [spec.md](./spec.md)  
**Plan**: [plan.md](./plan.md)  
**Data Model**: [data-model.md](./data-model.md)

---

## Phase 1: Shared Types & Database Schema

- [x] **Task 1.1**: Update `apps/api/prisma/schema.prisma` with `color`, `icon`, `coverImageUrl`, `tags`, `isArchived` fields on `Deck` model and generate Prisma client.
- [x] **Task 1.2**: Define and export `DeckResponse`, `DeckStats`, `CreateDeckDto`, `UpdateDeckDto`, `QueryDecksDto` in `packages/shared-types/src/decks.ts` and export from `packages/shared-types/src/index.ts`.

---

## Phase 2: Backend Implementation (TDD)

- [x] **Task 2.1**: Write unit tests in `apps/api/src/modules/decks/decks.service.spec.ts` covering CRUD, ownership security, filtering, and cascade deletion.
- [x] **Task 2.2**: Implement `DecksService` in `apps/api/src/modules/decks/decks.service.ts` with statistics aggregation.
- [x] **Task 2.3**: Create DTOs (`create-deck.dto.ts`, `update-deck.dto.ts`, `query-decks.dto.ts`) with `class-validator` in `apps/api/src/modules/decks/dto/`.
- [x] **Task 2.4**: Implement and test `DecksController` in `apps/api/src/modules/decks/decks.controller.ts` with `@UseGuards(JwtAuthGuard)`.
- [x] **Task 2.5**: Register `DecksModule` in `apps/api/src/app.module.ts`.

---

## Phase 3: Frontend Implementation (TDD)

- [x] **Task 3.1**: Create Cosmos deck theme definitions (`deckThemes.ts`) in `apps/web/src/features/decks/constants/deckThemes.ts`.
- [x] **Task 3.2**: Implement API client service `decksService.ts` and custom hook `useDecks.ts` in `apps/web/src/features/decks/`.
- [x] **Task 3.3**: Build UI components: `DeckCard.tsx`, `DeckEmptyState.tsx`, `CreateDeckModal.tsx`, `EditDeckModal.tsx`, `DeleteDeckConfirmModal.tsx`.
- [x] **Task 3.4**: Build `DecksListPage.tsx` with search, filter tabs, sorting, and modal integrations.
- [x] **Task 3.5**: Register route `/decks` in `App.tsx` and connect navigation links.

---

## Phase 4: Quality Verification, Documentation & Backlog Sync

- [x] **Task 4.1**: Execute backend and frontend test suites and verify 100% pass rate.
- [x] **Task 4.2**: Update `docs/PRODUCT_BACKLOG_ROADMAP.md` checking off `US-DECK-01`.
- [x] **Task 4.3**: Create feature documentation at `docs/features/deck-crud/README.md` and update `docs/features/README.md`.
