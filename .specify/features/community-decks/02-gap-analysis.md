# Gap Analysis: Community Decks Marketplace (US-ECO-02)

- **Date**: 2026-08-22
- **Feature Slug**: `community-decks`
- **User Story**: `US-ECO-02: Chia sẻ Bộ từ vựng cộng đồng (Community Decks Marketplace)`
- **Status**: COMPLETED

---

## 1. Current State (AS-IS)

In WordStreak today:

1. **Siloed Deck Ownership**: Decks have an `isPublic Boolean @default(false)` field in Prisma schema, but there is no public discovery endpoint, no community browse UI, and no way for other learners to discover or access public decks.
2. **No 1-Click Clone**: Learners wishing to study another user's vocabulary list must manually copy cards or export/import CSV files.
3. **No Social Proof or Quality Signals**: There is no star rating, review comments, or clone counter to distinguish high-quality decks from incomplete or spam decks.
4. **No Category Taxonomy**: Decks only store freeform tags; there is no standardized category system (`IELTS`, `TOEIC`, `Business English`, etc.) for structured marketplace navigation.

---

## 2. Target State (TO-BE)

1. **Community Decks Marketplace (`/community`)**:
   - High-performance, SEO-friendly public catalog of curated vocabulary decks.
   - Rich filtering by category, search by keywords/author, and sorting by Popularity (`cloneCount`), Rating (`averageRating`), or Newest (`createdAt`).
2. **1-Click Clone Engine (`POST /api/v1/community/decks/:id/clone`)**:
   - Atomic deep copy of the deck and all associated cards into the user's personal library.
   - Automatic initialization of SM-2 spaced repetition progress (`UserCardProgress`) in `NEW` state.
   - Real-time increment of `cloneCount` on source deck.
3. **5-Star Community Rating & Review System (`POST /api/v1/community/decks/:id/rate`)**:
   - 1-to-5 star rating + optional review feedback.
   - Anti-abuse verification: Authors cannot rate own decks; user must clone/study before rating; 1 rating per user with update support.
   - Atomic denormalized `averageRating` & `totalRatings` caching on `Deck` entity for sub-50ms response times.
4. **Public Deck Preview & Creator Attribution**:
   - Full card preview modal with audio pronunciation and IPA display.
   - Safe author profile exposure (`name`, `username`, `avatarUrl`) without sensitive PII leaks.

---

## 3. Four Gap Categories

| Gap Category             | AS-IS (Current)                                                 | TO-BE (Target)                                                                                                                                       | Action Required                                                                                        |
| :----------------------- | :-------------------------------------------------------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------- | :----------------------------------------------------------------------------------------------------- |
| **Functional Gaps**      | No marketplace endpoint; no clone endpoint; no rating endpoint. | `GET /api/v1/community/decks`, `GET /api/v1/community/decks/:id`, `POST /api/v1/community/decks/:id/clone`, `POST /api/v1/community/decks/:id/rate`. | Implement `CommunityModule` with controller, service, and DTOs in NestJS.                              |
| **Data / Schema Gaps**   | `Deck` has only `isPublic`. No rating model, no clone tracking. | Extend `Deck` schema with `cloneCount`, `averageRating`, `totalRatings`, `category`, `originalDeckId`. New `DeckRating` model.                       | Create Prisma schema migration and update `@wordstreak/shared-types`.                                  |
| **User Experience Gaps** | User only sees personal decks on `/decks` and `/dashboard`.     | New `/community` page with search bar, category chips, sorting dropdown, deck cards with rating/clone badges, and Deck Preview modal.                | Implement `CommunityDecksPage`, `CommunityDeckCard`, `CommunityDeckPreviewModal`, and `RateDeckModal`. |
| **Non-Functional Gaps**  | No marketplace rate-limiting or anti-abuse protection.          | Anti-spam rating validation, rate-limiting on clone actions (5/min), database indexes on `[isPublic, isArchived, cloneCount, averageRating]`.        | Add compound indexes in Prisma, implement RateLimiter guard, and optimize queries.                     |

---

## 4. Transition & Migration Strategy

- **Backward Compatibility**: Existing private and public decks are preserved. Existing `isPublic = true` decks with cards will seamlessly appear in the community catalog with initial `cloneCount = 0`, `averageRating = 0.0`, `totalRatings = 0`.
- **Database Migration**: Non-destructive additive migration via `prisma migrate dev --name add_community_marketplace_models`.
