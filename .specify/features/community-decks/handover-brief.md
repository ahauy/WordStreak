# Handover Brief: Community Decks Marketplace (US-ECO-02)

- **Feature**: Community Decks Marketplace (`community-decks`)
- **Epic**: EPIC-09 (Import/Export, Community & Ecosystem)
- **Target Sprint**: Sprint 6
- **Status**: HANDED OVER TO SYSTEM ARCHITECT (Speckit Pipeline)

---

## 1. Executive Summary

This feature delivers the complete Community Decks Marketplace for WordStreak, enabling learners to discover, preview, rate, and clone curated public vocabulary decks in 1 click.

## 2. Key Technical Directives for System Architect

1. **Database Schema Additions**:
   - Add `cloneCount Int @default(0)`, `averageRating Float @default(0.0)`, `totalRatings Int @default(0)`, `category String?`, `originalDeckId String?` to `Deck` model.
   - Create `DeckRating` model with compound index `@@unique([deckId, userId])` and foreign keys to `Deck` and `User`.
   - Add compound indexes: `@@index([isPublic, isArchived, cloneCount])`, `@@index([isPublic, isArchived, averageRating])`, `@@index([category])`.

2. **Backend Architecture (`apps/api/src/modules/community/`)**:
   - `CommunityController`:
     - `GET /api/v1/community/decks` (Public/Auth optional): search, category filter, pagination, sorting (`POPULAR`, `TOP_RATED`, `NEWEST`).
     - `GET /api/v1/community/decks/:id` (Public/Auth optional): detailed view with author info and card previews.
     - `POST /api/v1/community/decks/:id/clone` (Auth required): atomic deep copy, `UserCardProgress` initialization in `NEW` state, increments `cloneCount`.
     - `POST /api/v1/community/decks/:id/rate` (Auth required): submit/update rating, anti-abuse checks, atomic recalculation of `averageRating` and `totalRatings`.
   - `CommunityService`: Business logic implementation with strict unit tests (`community.service.spec.ts`).

3. **Frontend Architecture (`apps/web/src/features/community/`)**:
   - Route: `/community` in `App.tsx` or router.
   - Components: `CommunityDecksPage`, `CommunityDeckCard`, `CommunityDeckPreviewModal`, `RateDeckModal`, `CategoryFilterBar`, `SortDropdown`.
   - Strictly follow `apps/web/DESIGN.md` (White canvas `#ffffff`, 1px hairline border `#e5e5e5`, Obsidian black `#000000` buttons, Nunito & Inter typography).

4. **Shared Types (`packages/shared-types/src/community.ts`)**:
   - `CommunityDeckItem`, `CommunityDeckDetailResponse`, `CloneDeckResponse`, `RateDeckDto`, `RateDeckResponse`, `CommunityDecksQueryDto`.
