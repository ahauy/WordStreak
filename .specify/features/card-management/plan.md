# Implementation Plan: Card List Management & Search/Filter (US-CARD-02)

## 1. Technical Context & Architecture Decisions

- **Fullstack Stack**:
  - `packages/shared-types`: Add `QueryCardsDto`, `PaginationMeta`, `PaginatedCardsResponse`, `BulkCardActionDto`, `BulkCardActionResult`.
  - `apps/api`:
    - Extend `CardsController.findAllByDeck` to support `@Query() query: QueryCardsDto` and return `PaginatedCardsResponse`.
    - Add endpoint `POST /api/v1/decks/:deckId/cards/bulk-action` in `CardsController`.
    - Implement `CardsService.findAllByDeck` with Prisma filtering (ILIKE/contains on word, meaning, exampleSentence, and progress status filter) and pagination (`skip`, `take`, `count`).
    - Implement `CardsService.bulkAction` executing inside `this.prisma.$transaction`.
  - `apps/web`:
    - Update `cardsService.ts` and `useCards.ts` to support server-side pagination, search debounce, status filter, and bulk operations.
    - Create `CardDataTable.tsx` component for high-density tabular view with multi-select checkboxes, status badges, audio trigger, and quick actions.
    - Update `DeckDetailPage.tsx` to include View Mode Toggle (Grid/Table), Status Filter Chips, Pagination Bar, and Sticky Bulk Action Bar with confirmation modals.

## 2. API Contracts & Endpoints

1. `GET /api/v1/decks/:deckId/cards?page=1&limit=20&search=...&status=...`
   - Returns `{ data: CardResponse[], meta: PaginationMeta }`
2. `POST /api/v1/decks/:deckId/cards/bulk-action`
   - Body: `{ action: 'DELETE' | 'MOVE' | 'RESET_PROGRESS', cardIds: string[], targetDeckId?: string }`
   - Returns `{ success: true, action: string, affectedCount: number, message: string }`

## 3. Risk & Mitigation

- **Performance on large decks**: Indexed fields `(deck_id, word)` and `(user_id, status)` ensure quick indexed lookups.
- **Race conditions / partial deletes**: Handled by Prisma `$transaction` ensuring atomicity.
