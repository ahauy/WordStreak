# Implementation Plan: Contextual Card Creation

**Feature Slug**: `card-creation`  
**Spec**: `specs/004-card-creation/spec.md`

## Phase 1: Shared Types & DTO Contracts

- Add `packages/shared-types/src/cards.ts` with `CardDto`, `CreateCardDto`, `UpdateCardDto`.
- Export from `packages/shared-types/src/index.ts`.

## Phase 2: Backend Module (`apps/api/src/modules/cards`)

- Create `dto/create-card.dto.ts` and `dto/update-card.dto.ts` with `class-validator` decorators.
- Implement `CardsService` with:
  - `createCard(userId, deckId, dto)`: Validates deck ownership, runs transaction to create `Card` and `UserCardProgress (status: 'NEW', easeFactor: 2.5)`.
  - `getDeckCards(userId, deckId)`: Verifies deck access and returns cards with their progress status.
  - `getCardById(userId, cardId)`: Returns single card.
  - `updateCard(userId, cardId, dto)`: Updates card fields with ownership validation.
  - `deleteCard(userId, cardId)`: Deletes card with cascade progress deletion.
- Implement `CardsController` with endpoints under `/api/v1/decks/:deckId/cards` and `/api/v1/cards/:id` protected by `JwtAuthGuard`.
- Register `CardsModule` in `AppModule`.
- Write Unit Tests in `cards.service.spec.ts` and `cards.controller.spec.ts`.

## Phase 3: Frontend Feature (`apps/web/src/features/cards`)

- Implement `cardsService.ts` (`createCard`, `getDeckCards`, `updateCard`, `deleteCard`).
- Implement custom hook `useCards(deckId)` using React state / TanStack Query pattern.
- Implement `CardPreview.tsx` with 3D flip card animation, Front/Back view, and audio speaker button.
- Implement `AddCardModal.tsx` with:
  - Split layout: Form (Core required fields + Accordion for rich contextual fields) & Live 3D Preview.
  - Soft duplicate warning badge.
  - "Lưu & Thêm từ tiếp" (Save & Add Another) quick entry.
  - Web Speech API fallback helper (`useSpeechSynthesis` / audio helper).
- Implement `EditCardModal.tsx` and `DeleteCardConfirmModal.tsx`.
- Implement `CardListItem.tsx` / `CardItemCard.tsx` for displaying individual cards inside a deck.

## Phase 4: Deck Detail Integration (`apps/web/src/features/decks`)

- Implement `DeckDetailPage.tsx` (`/decks/:id`) with:
  - Back to decks navigation, Deck theme header, Stats pill (Total, New, Learning, Mastered).
  - Search cards within deck.
  - "+ Thêm thẻ mới" button opening `AddCardModal`.
  - Grid / List of cards with quick actions (Preview flip, Edit, Delete, Audio pronounce).
  - Empty state when deck has 0 cards.
- Add route `/decks/:id` in `App.tsx` protected by `ProtectedRoute`.

## Phase 5: Verification & Review

- Run backend unit tests (`pnpm --filter api test`).
- Run frontend typecheck & build (`pnpm build`).
- Verify live user flows in browser.
- Create feature documentation in `docs/features/card-creation/README.md`.
