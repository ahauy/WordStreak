# Tasks: Contextual Card Creation

## Phase 1: Shared Types & DTO Contracts

- [x] Task 1.1: Add `packages/shared-types/src/cards.ts` with `CardDto`, `CreateCardDto`, `UpdateCardDto` and export in `index.ts`.

## Phase 2: Backend Cards Module (TDD)

- [x] Task 2.1: Write failing unit test `apps/api/src/modules/cards/cards.service.spec.ts` (Red).
- [x] Task 2.2: Implement `CreateCardDto` and `UpdateCardDto` with validation rules in `apps/api/src/modules/cards/dto/`.
- [x] Task 2.3: Implement `CardsService` with atomic `Card` + `UserCardProgress` creation and deck ownership checks (Green).
- [x] Task 2.4: Write failing unit test `apps/api/src/modules/cards/cards.controller.spec.ts` (Red).
- [x] Task 2.5: Implement `CardsController` and `CardsModule`, register in `AppModule` (Green).
- [x] Task 2.6: Run `pnpm --filter api test` to verify backend suite passes.

## Phase 3: Frontend Cards Feature Components

- [x] Task 3.1: Create `apps/web/src/features/cards/services/cardsService.ts` and `hooks/useCards.ts`.
- [x] Task 3.2: Implement `utils/speech.ts` for Web Speech API fallback.
- [x] Task 3.3: Implement `CardPreview.tsx` with 3D flip animation and audio preview button.
- [x] Task 3.4: Implement `AddCardModal.tsx` with rich form fields, duplicate warning badge, and "Save & Add Another" mode.
- [x] Task 3.5: Implement `EditCardModal.tsx` and `DeleteCardConfirmModal.tsx`.
- [x] Task 3.6: Implement `CardItemCard.tsx` (card view in deck detail).

## Phase 4: Deck Detail Page & Navigation Integration

- [x] Task 4.1: Implement `apps/web/src/features/decks/pages/DeckDetailPage.tsx` with header, stats, search/filter, and card grid.
- [x] Task 4.2: Update `App.tsx` routes to include `/decks/:id` (DeckDetailPage).
- [x] Task 4.3: Update `DeckCard.tsx` and `DecksListPage.tsx` to link to `/decks/:id` when clicking a deck card.

## Phase 5: Verification, Quality Gate & Tech Docs

- [x] Task 5.1: Run `pnpm build` and verify full workspace builds cleanly.
- [x] Task 5.2: Create technical documentation in `docs/features/card-creation/README.md` and update `docs/PRODUCT_BACKLOG_ROADMAP.md`.
