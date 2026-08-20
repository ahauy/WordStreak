# Tasks: Card List Management & Search/Filter (US-CARD-02)

## Phase 1: Setup & Shared Contracts

- [x] T001 [P] Define `QueryCardsDto`, `PaginationMeta`, `PaginatedCardsResponse`, `BulkCardActionDto`, and `BulkCardActionResult` in `packages/shared-types/src/index.ts`
- [x] T002 Build shared-types package with `pnpm --filter @wordstreak/shared-types build`

## Phase 2: Backend Implementation (US1 & US3)

- [x] T003 [US1] Create validation DTOs in `apps/api/src/modules/cards/dto/query-cards.dto.ts` and `apps/api/src/modules/cards/dto/bulk-card-action.dto.ts`
- [x] T004 [US1] Implement unit tests for paginated search and status filtering in `apps/api/src/modules/cards/cards.service.spec.ts` and `cards.controller.spec.ts`
- [x] T005 [US1] Implement paginated `findAllByDeck` query in `apps/api/src/modules/cards/cards.service.ts` with keyword search and status filtering
- [x] T006 [US3] Implement unit tests for bulk actions (`DELETE`, `MOVE`, `RESET_PROGRESS`) in `apps/api/src/modules/cards/cards.service.spec.ts`
- [x] T007 [US3] Implement `bulkAction` method in `apps/api/src/modules/cards/cards.service.ts` using Prisma `$transaction`
- [x] T008 [US1] [US3] Expose bulk action and paginated endpoints in `apps/api/src/modules/cards/cards.controller.ts`

## Phase 3: Frontend Implementation (US1, US2, US3)

- [x] T009 [US1] Update `apps/web/src/features/cards/services/cardsService.ts` to support paginated query and bulk action endpoints
- [x] T010 [US1] Update `apps/web/src/features/cards/hooks/useCards.ts` with pagination state, debounce search, status filtering, and bulk action mutations
- [x] T011 [US2] Create `CardDataTable.tsx` component in `apps/web/src/features/cards/components/CardDataTable.tsx` for high-density tabular row view with audio preview and row checkboxes
- [x] T012 [US3] Create `BulkActionsToolbar.tsx` and `BulkMoveModal.tsx` in `apps/web/src/features/cards/components/`
- [x] T013 [US1] [US2] [US3] Integrate Dual View Mode switcher, Status Filter Chips, Pagination Bar, and Bulk Actions Toolbar in `apps/web/src/features/decks/pages/DeckDetailPage.tsx`

## Phase 4: Verification, Review & Documentation

- [x] T014 Run backend and frontend automated test suites (`pnpm --filter api test`, `pnpm --filter web test`)
- [x] T015 Verify build correctness (`pnpm build`)
- [x] T016 Create/update user guide and technical documentation in `docs/features/card-management/README.md`
