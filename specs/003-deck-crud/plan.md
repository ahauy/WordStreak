# Implementation Plan: Deck CRUD & Management

**Branch**: `003-deck-crud`  
**Spec**: [spec.md](./spec.md)  
**Data Model**: [data-model.md](./data-model.md)  
**Contracts**: [contracts/decks.json](./contracts/decks.json)

---

## 1. Architecture & Design Decisions

### 1.1 Backend Architecture (NestJS)

- **Database Schema**:
  - Extend `Deck` model in `apps/api/prisma/schema.prisma` with `color`, `icon`, `coverImageUrl`, `tags`, `isArchived`.
  - Add index `@@index([userId, isArchived])`.
  - Run `prisma migrate dev` or `prisma db push` / `prisma generate`.
- **Decks Module (`apps/api/src/modules/decks/`)**:
  - `DecksModule`: Registers `DecksController`, `DecksService`, `PrismaService`.
  - `DecksController`:
    - `POST /api/v1/decks` (`@UseGuards(JwtAuthGuard)`)
    - `GET /api/v1/decks` (`@UseGuards(JwtAuthGuard)`) with query parameters
    - `GET /api/v1/decks/:id` (`@UseGuards(JwtAuthGuard)`)
    - `PATCH /api/v1/decks/:id` (`@UseGuards(JwtAuthGuard)`)
    - `PATCH /api/v1/decks/:id/archive` (`@UseGuards(JwtAuthGuard)`)
    - `PATCH /api/v1/decks/:id/restore` (`@UseGuards(JwtAuthGuard)`)
    - `DELETE /api/v1/decks/:id` (`@UseGuards(JwtAuthGuard)`)
  - `DecksService`:
    - `create(userId, dto)`
    - `findAll(userId, query)` (computes card counts and learning status breakdown)
    - `findOne(userId, id)`
    - `update(userId, id, dto)`
    - `archive(userId, id)`
    - `restore(userId, id)`
    - `remove(userId, id)` (cascade delete in transaction)
  - DTOs (`apps/api/src/modules/decks/dto/`):
    - `create-deck.dto.ts`
    - `update-deck.dto.ts`
    - `query-decks.dto.ts`

### 1.2 Shared Types (`packages/shared-types`)

- Export `DeckResponse`, `DeckStats`, `CreateDeckDto`, `UpdateDeckDto`, `QueryDecksDto` in `packages/shared-types/src/decks.ts` and re-export in `index.ts`.

### 1.3 Frontend Architecture (React + Vite)

- **Feature Directory (`apps/web/src/features/decks/`)**:
  - `types/deck.ts` (re-export or extended client types)
  - `services/decksService.ts` (Axios API client for `/api/v1/decks`)
  - `hooks/useDecks.ts` (custom hook for fetching, creating, updating, archiving, deleting decks)
  - `constants/deckThemes.ts` (Cosmos 8 preset colors + 12 curated Lucide icons)
  - `components/`:
    - `DeckCard.tsx` (Cosmos themed deck card with color banner/cover image, icon, card count chip, due badge, progress bar, action menu)
    - `CreateDeckModal.tsx` (Theme picker, custom hex, title, description, cover image URL, isPublic toggle)
    - `EditDeckModal.tsx` (Pre-filled form for updating deck details)
    - `DeleteDeckConfirmModal.tsx` (Danger alert showing exact number of affected cards with clear warning)
    - `DeckEmptyState.tsx` (Empty state illustration and call to action)
  - `pages/`:
    - `DecksListPage.tsx` (Hero header, search bar, sort dropdown, Active/Archived tabs, grid of `DeckCard`s, floating action button)
- **App Routing & Navigation (`apps/web/src/App.tsx`)**:
  - Register route `/decks` mapped to `DecksListPage` wrapped in `ProtectedRoute`.
  - Connect Top Navigation / Sidebar to `/decks`.

---

## 2. Test Strategy

- **Backend Tests (Jest)**:
  - `decks.service.spec.ts`: Unit test CRUD, ownership protection, filtering by active/archived, search, stats calculation, cascade delete.
  - `decks.controller.spec.ts`: Controller endpoint mapping, validation pipes, JWT guard.
- **Frontend Tests (Vitest + React Testing Library)**:
  - `DecksListPage.spec.tsx`: Test rendering list of decks, search filtering, tab switching, opening modals.
  - `CreateDeckModal.spec.tsx`: Test form validation, preset selection, submission.
  - `DeleteDeckConfirmModal.spec.tsx`: Test cascade warning display and confirmation.
