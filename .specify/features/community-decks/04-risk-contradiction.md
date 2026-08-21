# Risk & Contradiction Scanner: Community Decks Marketplace (US-ECO-02)

- **Date**: 2026-08-22
- **Feature Slug**: `community-decks`
- **User Story**: `US-ECO-02: Chia sẻ Bộ từ vựng cộng đồng (Community Decks Marketplace)`
- **Status**: COMPLETED

---

## 1. Contradiction & Deadlock Analysis

1. **Contradiction Check 1: Deck Deletion / Archive vs Cloned Decks**:
   - _Risk_: If an author deletes or archives their original public deck, what happens to learners who have already cloned it?
   - _Resolution_: Under **BR-COMM-002 (Deep Copy Isolation)**, cloned decks are completely independent. Deleting the source deck does NOT cascade to or delete cloned decks. The `originalDeckId` simply retains the historical reference or becomes a loose identifier.
2. **Contradiction Check 2: Rating Race Conditions & Average Calculation**:
   - _Risk_: Multiple users rating the same deck simultaneously could produce inconsistent `averageRating` and `totalRatings`.
   - _Resolution_: Rating submission uses a single Prisma transaction that recalculates `AVG(rating)` and `COUNT(*)` from the `DeckRating` table before updating the `Deck` record, ensuring strict transactional consistency.
3. **Contradiction Check 3: Private Deck Link Access**:
   - _Risk_: What if a user attempts to call `GET /api/v1/community/decks/:id` or clone a deck that was previously public but has been switched to `isPublic = false`?
   - _Resolution_: The endpoint strictly verifies `isPublic === true` and `isArchived === false`. If false, returns `404 NotFound` to prevent unauthorized discovery.

---

## 2. Risk Register

| Risk ID           | Risk Description                                                                                                     |        Category         | Severity | Probability | Mitigation Strategy                                                                                                             |
| :---------------- | :------------------------------------------------------------------------------------------------------------------- | :---------------------: | :------: | :---------: | :------------------------------------------------------------------------------------------------------------------------------ |
| **RISK-COMM-001** | **Spam / Low-Quality Decks** in marketplace (e.g. 1-card dummy decks).                                               |    Product / Quality    |  Medium  |   Medium    | Require at least 1 valid card; sort defaults to `POPULAR` and `TOP_RATED` so high-quality community decks float to the top.     |
| **RISK-COMM-002** | **Self-Rating / Vote Manipulation** by malicious users creating sockpuppet accounts to boost ratings.                |  Security / Integrity   |  Medium  |     Low     | Disallow author self-ratings (`userId !== deck.userId`), require study/clone activity before rating, enforce 1 rating per user. |
| **RISK-COMM-003** | **Clone Flooding / DoS**: A bot rapidly clones large decks (e.g. 500 cards) causing DB connection pool starvation.   | Technical / Performance |   High   |     Low     | Rate-limiting (5 clones/min/user), maximum batch limit of 1,000 cards per cloned deck, indexed batch insert in transaction.     |
| **RISK-COMM-004** | **PII Exposure in Public Endpoints**: Author email or personal settings accidentally serialized in public responses. |   Security / Privacy    |   High   |  Very Low   | Strict DTO projection mapping (`PublicAuthorDto`) returning only `id`, `name`, `username`, `avatarUrl`.                         |

---

## 3. Scope Boundary & MoSCoW Prioritization

### Must-Have (v1 - Current Scope)

- [x] Public deck discovery endpoint `GET /api/v1/community/decks` with search, category, and sorting (`POPULAR`, `TOP_RATED`, `NEWEST`).
- [x] Public deck detail & card preview endpoint `GET /api/v1/community/decks/:id`.
- [x] 1-Click Clone endpoint `POST /api/v1/community/decks/:id/clone` with atomic deep copy and SM-2 progress initialization.
- [x] 5-Star Rating & Review submission `POST /api/v1/community/decks/:id/rate` with anti-abuse rules.
- [x] Frontend `/community` page with minimal cards grid, category chips, rating stars, and Deck Preview modal.
- [x] Unit and component tests for backend services, controllers, and frontend pages.

### Should-Have (v1.1)

- User reviews list drawer with pagination and author responses.
- Verified Teacher / Creator badge on author profiles.

### Could-Have (v2)

- Social share link generation (Twitter/Facebook/Copy link) with OpenGraph metadata.
- Community leaderboard of top deck creators.

### Won't-Have (v1 - Explicitly Excluded)

- ❌ Paid/monetized decks or creator marketplace revenue share (WordStreak is 100% free forever).
- ❌ Real-time live collaboration on a shared deck (violates deep copy isolation principle).
- ❌ Deck version control / fork-merge pull request system for flashcards.
