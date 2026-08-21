# Technical Implementation Plan: Community Decks Marketplace (US-ECO-02)

**Feature Slug**: `community-decks`  
**Date**: 2026-08-22  
**Status**: Ready for Tasks Breakdown (Gate 2)  
**Target User Story**: `US-ECO-02: Chia sẻ Bộ từ vựng cộng đồng (Community Decks Marketplace)`

---

## 1. Technical Architecture Overview

The Community Decks Marketplace feature spans all layers of the WordStreak fullstack monorepo:

1. **Shared Types (`packages/shared-types/src/community.ts`)**:
   - Centralized definitions for DTOs, query contracts, response objects, and category enums.
2. **Database & ORM (`apps/api/prisma/schema.prisma`)**:
   - Add fields to `Deck`: `cloneCount`, `averageRating`, `totalRatings`, `category`, `originalDeckId`.
   - Add `DeckRating` model with `@@unique([deckId, userId])`.
   - Add compound indexes for sub-50ms query performance.
3. **Backend API (`apps/api/src/modules/community/`)**:
   - `CommunityModule`, `CommunityController`, `CommunityService`.
   - Optional JWT authentication guard on public discovery endpoints to compute personalized `isOwner` and `hasCloned` flags.
   - Atomic Prisma `$transaction` on deck cloning with bulk card inserts and SM-2 `UserCardProgress` initialization.
   - Atomic rating calculation and average denormalization in `CommunityService.rateDeck`.
4. **Frontend UI (`apps/web/src/features/community/`)**:
   - Route: `/community` in React Router.
   - Navigation Link in Top Navbar ("Khám phá").
   - `CommunityDecksPage`, `CommunityDeckCard`, `CommunityDeckPreviewModal`, `RateDeckModal`, `CategoryFilterBar`, `SortDropdown`.
   - Strictly adhere to `apps/web/DESIGN.md` (White canvas `#ffffff`, 1px hairline border `#e5e5e5`, Obsidian black pills `#000000`, 0 unrequested neon/glassmorphism slop).

---

## 2. Vertical Slices Breakdown

```
┌────────────────────────────────────────────────────────────────────────┐
│                        VERTICAL IMPLEMENTATION SLICES                   │
└────────────────────────────────────────────────────────────────────────┘

 [ Slice 1: Shared Types & Database Schema ]
   ├── packages/shared-types: Define community DTOs & contracts
   └── apps/api/prisma: Update schema.prisma & generate Prisma Client

 [ Slice 2: Backend API & Service Layer ]
   ├── apps/api/src/modules/community: CommunityModule, Controller, Service
   ├── apps/api: Implement GET /decks, GET /decks/:id, POST /clone, POST /rate
   └── apps/api/src/modules/community: Unit test suite (community.service.spec.ts)

 [ Slice 3: Frontend Services & State Management ]
   ├── apps/web/src/features/community/services: communityService.ts
   └── apps/web/src/features/community/hooks: useCommunityDecks.ts, useDeckClone.ts

 [ Slice 4: Frontend UI & Components ]
   ├── apps/web/src/features/community/components: DeckCard, CategoryFilter, SortSelect
   ├── apps/web/src/features/community/components: DeckPreviewModal, RateDeckModal
   ├── apps/web/src/features/community/pages: CommunityDecksPage.tsx
   └── apps/web: Register /community route and navbar link

 [ Slice 5: Quality Verification & Tech Docs ]
   ├── Vitest component specs & Jest backend tests
   ├── docs/features/community-decks/README.md
   └── docs/user-guides/community-decks.md
```

---

## 3. Detailed File Changes

### 3.1 Shared Types

- `[NEW] packages/shared-types/src/community.ts`: Export all community interfaces and types.
- `[MODIFY] packages/shared-types/src/index.ts`: Re-export `community.ts`.

### 3.2 Backend Module (`apps/api`)

- `[MODIFY] apps/api/prisma/schema.prisma`: Add `DeckRating`, update `Deck` model with clone and rating fields and indexes.
- `[NEW] apps/api/src/modules/community/community.module.ts`: NestJS module registration.
- `[NEW] apps/api/src/modules/community/community.controller.ts`: Endpoints `/api/v1/community/decks...`.
- `[NEW] apps/api/src/modules/community/community.service.ts`: Business logic and database transactions.
- `[NEW] apps/api/src/modules/community/dto/get-community-decks.dto.ts`: Query DTO with validation.
- `[NEW] apps/api/src/modules/community/dto/rate-deck.dto.ts`: Body DTO for rating submission.
- `[NEW] apps/api/src/modules/community/community.service.spec.ts`: Unit tests covering all business rules (`BR-COMM-001` to `BR-COMM-008`).
- `[MODIFY] apps/api/src/app.module.ts`: Import `CommunityModule`.

### 3.3 Frontend Feature (`apps/web`)

- `[NEW] apps/web/src/features/community/services/communityService.ts`: Axios API client for community endpoints.
- `[NEW] apps/web/src/features/community/hooks/useCommunityDecks.ts`: React hook for querying and filtering marketplace decks.
- `[NEW] apps/web/src/features/community/components/CommunityDeckCard.tsx`: Individual marketplace card.
- `[NEW] apps/web/src/features/community/components/CategoryFilterBar.tsx`: Category selector chips.
- `[NEW] apps/web/src/features/community/components/CommunityDeckPreviewModal.tsx`: Card preview and clone dialog.
- `[NEW] apps/web/src/features/community/components/RateDeckModal.tsx`: 5-star rating dialog.
- `[NEW] apps/web/src/features/community/pages/CommunityDecksPage.tsx`: Main marketplace discovery page.
- `[NEW] apps/web/src/features/community/pages/CommunityDecksPage.spec.tsx`: Vitest component tests.
- `[MODIFY] apps/web/src/App.tsx`: Add `/community` route.
- `[MODIFY] apps/web/src/components/layout/Navbar.tsx` (or top navigation): Add "Khám phá" navigation link.

---

## 4. Verification Plan

1. **Automated Unit Tests**:
   - Backend: `pnpm --filter api test` (testing `community.service.spec.ts` for all sorting, search, deep copy cloning, and anti-abuse rating rules).
   - Frontend: `pnpm --filter web test` (testing `CommunityDecksPage.spec.tsx` and modal components).
2. **Integration Verification**:
   - Full monorepo test run: `pnpm test` (all 37+ backend test suites and 48+ frontend test suites passing).
   - TypeScript build check: `pnpm build`.
