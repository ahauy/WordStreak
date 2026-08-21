# Elicitation Interview: Community Decks Marketplace (US-ECO-02)

- **Date**: 2026-08-22
- **Feature Slug**: `community-decks`
- **User Story**: `US-ECO-02: Chia sẻ Bộ từ vựng cộng đồng (Community Decks Marketplace)`
- **Epic**: Epic 09: Import/Export, Community & Ecosystem | Sprint 6 (Community & Data Portability)
- **Status**: COMPLETED

---

## Stage 1 — Business Value & Personas

### 1. Problem Statement & Pain Points

Learners on WordStreak currently study in siloed private environments. Creating rich vocabulary decks with high-quality phonetic transcriptions, example sentences, collocations, and mnemonics requires significant time and effort. Many learners want ready-to-use, high-quality curated vocabulary lists created by teachers, polyglots, and successful test-takers (e.g., IELTS 8.0, Oxford 3000, Business English).

Without a Community Marketplace:

- Learners duplicate effort recreating the same vocabulary sets.
- High-quality deck creators have no platform to share their expertise.
- Platform viral growth and social proof remain underutilized.

### 2. Target Personas

- **Alex (IELTS/TOEIC Aspirant - Consumer)**: Wants to find top-rated IELTS 8.0 decks, preview vocabulary words, and clone them into his personal library in 1 click to start spaced repetition immediately.
- **Teacher Sarah (Content Creator / Polyglot)**: Curates comprehensive Oxford 3000 & Business English decks. Wants to publish them publicly, track clone counts, and receive star ratings from active learners.
- **Minh (Casual Learner - Explorer)**: Browses popular community decks by category (Daily, Travel, Slang) and reads learner reviews before deciding which deck to clone.

### 3. Success Metrics & KPIs

- **Primary Metric**: > 40% of newly registered learners clone at least 1 community deck in their first 7 days.
- **Content Density**: > 50 public curated decks published within the first 30 days of launch.
- **Performance**: Marketplace browse / search / filter P95 response time < 80ms; 1-Click Clone transaction P95 < 500ms for decks up to 500 cards.
- **Data Integrity**: 100% deep copy isolation with zero side-effects on original creator decks.

---

## Stage 3 — The 6 Domain Pillars

### Pillar 1 — Personas, Actors & RBAC

- **Q1: Deck Visibility & Publishing Permissions**
  - **Decision**: Authenticated Deck Owners can toggle their deck's visibility between `Private` (`isPublic = false`) and `Public` (`isPublic = true`). Only decks with `isPublic = true` and `isArchived = false` with at least 1 card appear in the Community Marketplace.
- **Q2: Community Browse & Clone Permissions**
  - **Decision**:
    - **Guest / Unauthenticated Users**: Can browse the marketplace, search/filter decks, view deck metadata and preview the first 10 cards. Prompted to sign up/sign in when attempting to clone or rate.
    - **Authenticated Learners**: Can browse all public decks, preview all cards, clone any public deck to their personal library, and rate/review decks they have cloned.
    - **Deck Authors**: Can edit/archive their own public decks, view analytics (clone count, average rating), but cannot rate or clone their own decks.

### Pillar 2 — State Machine & Processing Lifecycle

- **Q3: Deck Publishing Lifecycle**
  - **Decision**: Deck publishing transitions:
    - `PRIVATE` -> `PUBLIC`: Deck becomes discoverable in Community Marketplace.
    - `PUBLIC` -> `PRIVATE`: Deck is hidden from marketplace; existing cloned decks remain unaffected in users' libraries.
    - `PUBLIC` -> `ARCHIVED` (or Deleted): Original deck is soft-deleted or archived; existing cloned decks remain intact with isolated ownership.
- **Q4: 1-Click Clone Lifecycle**
  - **Decision**:
    1. User clicks "Clone to My Decks" (Sao chép vào Bộ từ của tôi).
    2. Server verifies `isPublic === true` and target deck exists.
    3. Server creates a new `Deck` record for the requesting user with title `[Copy] <Original Title>` or original title, resetting `isPublic = false`.
    4. Server deep-copies all `Card` records in an atomic `$transaction`.
    5. Server creates `UserCardProgress` for every cloned card in `NEW` state (`interval = 0`, `easeFactor = 2.5`, `repetitions = 0`).
    6. Server increments `cloneCount` on the source deck by 1.

### Pillar 3 — Business Rules & Algorithms

- **Q5: Clone Mechanism (Deep Copy vs Shared Reference)**
  - **Decision**: **Deep Copy độc lập 100%** (Option A). The cloned deck is a completely separate entity. Modifying, adding, or deleting cards in the cloned deck never affects the original author's deck or other users' clones.
- **Q6: Rating System & Anti-Abuse Rules**
  - **Decision**: **5-Star Rating with Anti-Abuse Protection** (Option A):
    - Rating scale: 1 to 5 integer stars (`rating` between 1 and 5) + optional text comment (max 500 chars).
    - Unique constraint: Exactly 1 rating per `(userId, deckId)` pair. Users can update their existing rating.
    - Anti-Abuse: Deck author cannot rate their own deck (`userId !== deck.userId`).
    - Eligibility Gate: User must have cloned the deck or completed at least 1 study session on it before submitting a rating.
    - Aggregate Caching: `averageRating` (Float, 1 decimal place) and `totalRatings` (Int) are cached directly on the `Deck` table, updated atomically via database triggers or transaction hooks.
- **Q7: Category Taxonomy & Tags**
  - **Decision**: Standardized category taxonomy (Option A) combined with flexible tags:
    - Primary Categories: `IELTS`, `TOEIC`, `TOEFL`, `General English`, `Business English`, `Academic`, `Daily Conversation`, `Grammar & Vocab`.
    - Custom Tags: Array of lowercase strings (e.g., `["idioms", "phrasal-verbs", "oxford-3000"]`).

### Pillar 4 — Workflows & Edge Cases

- **Q8: Marketplace Querying, Filtering & Sorting**
  - **Decision**: Endpoint `GET /api/v1/community/decks` supports:
    - `search`: Case-insensitive substring matching on `title`, `description`, `author.name`.
    - `category`: Filter by primary category.
    - `tag`: Filter by specific tag.
    - `sort`: `POPULAR` (descending `cloneCount`), `TOP_RATED` (descending `averageRating`, minimum 1 rating), `NEWEST` (descending `createdAt`).
    - `page` & `limit`: Cursor/offset pagination (default 12 items/page).
- **Q9: Concurrency & Idempotency**
  - **Decision**: Rapid double-clicking on "Clone" is protected by frontend debounce/loading state and backend rate-limiting (max 5 clones per user per minute). Cloned deck titles default to `${originalTitle}` or `${originalTitle} (Bản sao)` if a deck with the same title already exists in the user's library.

### Pillar 5 — Entities, Data Boundaries & Privacy

- **Q10: Database Schema Extensions**
  - **Decision**:
    - Extend `Deck` model: `cloneCount Int @default(0)`, `averageRating Float @default(0.0)`, `totalRatings Int @default(0)`, `category String?`, `originalDeckId String?`.
    - New `DeckRating` model: `id`, `deckId`, `userId`, `rating Int (1-5)`, `comment String?`, `createdAt`, `updatedAt`, unique composite index `@@unique([deckId, userId])`.
    - Author information: Safe projection (`id`, `name`, `username`, `avatarUrl`) exposed publicly; email and private settings strictly omitted.

### Pillar 6 — UX & Non-Functional Requirements

- **Q11: Community Marketplace UX & Aesthetics**
  - **Decision**:
    - Dedicated Navigation Tab `/community` ("Khám phá" / "Cộng đồng").
    - Clean, modern minimal card grid layout adhering strictly to `apps/web/DESIGN.md` (white canvas `#ffffff`, 1px hairline borders `#e5e5e5`, Obsidian black CTA `#000000`, 0 unrequested neon slop).
    - Deck Cards feature: Title, Category pill, Creator avatar & name, Card count badge, Star rating (`★ 4.8 (24)`), Clone count (`📥 142`), and 1-Click "Sao chép" button.
    - Deck Detail Preview Modal: Displays deck metadata, full card list preview, learner ratings list, and prominent "Sao chép vào Bộ từ của tôi" sticky CTA.

---

## Assumptions Confirmed

- **ASM-COMM-001**: Cloned decks are 100% deep copies with zero ongoing synchronization to source deck.
- **ASM-COMM-002**: Rating requires authentication and is restricted to non-authors who have cloned or studied the deck.
- **ASM-COMM-003**: `averageRating` and `totalRatings` are denormalized on `Deck` for sub-50ms browse performance.
- **ASM-COMM-004**: Only non-archived public decks (`isPublic = true`, `isArchived = false`, `cards.length > 0`) are listed in community search.

---

## Open Questions & Resolutions

- _All core domain decisions confirmed by user (1-A, 2-A, 3-A) — zero blocking questions._
