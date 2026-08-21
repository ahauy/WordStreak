# Feature Specification: Community Decks Marketplace (US-ECO-02)

**Feature Branch**: `feat/community-decks`  
**Created**: 2026-08-22  
**Status**: Ready for Planning (Gate 2)  
**Input**: US-ECO-02: Chia sẻ Bộ từ vựng cộng đồng (Community Decks Marketplace) — Baseline & SRS Specifications

---

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Discover Public Decks via Category & Sort Filters (Priority: P1) 🎯 MVP

**User Journey**:  
As a Learner, I want to visit the `/community` marketplace page, browse public vocabulary decks with key metrics (average rating, clone count, card count, creator name), filter by standardized category chips (`IELTS`, `TOEIC`, `Business`, `Daily Conversation`), search by keywords, and sort by Popularity, Rating, or Newest, so that I can quickly find high-quality vocabulary decks to study.

**Why this priority**:  
P1 is the absolute minimum viable product (MVP). Without a discoverable, searchable, and structured catalog of public decks, the marketplace cannot function.

**Independent Test**:  
Can be verified by loading `/community`, selecting "IELTS", filtering by "Top Rated", searching "Oxford", and verifying that only public, non-archived decks with cards matching the criteria are displayed with accurate metadata.

**Acceptance Scenarios**:

1. **Given** 10 public decks across various categories, **When** the user navigates to `/community`, **Then** the page displays a responsive grid of deck cards showing title, description, category badge, card count, star rating (`★ 4.8 (24)`), clone count (`📥 142`), and creator avatar.
2. **Given** a learner searching for "Business", **When** they type "business" in the search input, **Then** results are filtered in real-time (< 100ms) by title, description, and tags.
3. **Given** a user sorting by "Phổ biến nhất" (Most Cloned), **When** selected, **Then** decks with the highest `cloneCount` appear first.

---

### User Story 2 - Preview Public Deck Cards & Audio (Priority: P1) 🎯 MVP

**User Journey**:  
As a Learner, I want to click on any community deck card to open an interactive Preview Modal displaying full metadata, tags, author info, and a scrollable list of all cards with phonetic IPA and audio playback, so that I can inspect the content quality before deciding to clone it.

**Why this priority**:  
Learners must be able to inspect card accuracy, phonetic transcriptions, and example sentences before adding a deck to their personal library.

**Independent Test**:  
Can be verified by clicking a deck card on `/community`, verifying modal launch, testing audio playback on word cards, verifying pagination/scrolling of large card lists, and ensuring unauthenticated guests can preview safely.

**Acceptance Scenarios**:

1. **Given** a public deck with 50 cards, **When** the user clicks "Xem trước" (Preview), **Then** a modal opens displaying deck title, description, category, creator info, and a table/list of cards.
2. **Given** cards in the preview modal with audio URLs, **When** the user clicks the speaker icon, **Then** native audio plays or falls back gracefully to Web Speech Synthesis.
3. **Given** the bottom of the preview modal, **Then** a prominent sticky CTA button "Sao chép vào Bộ từ của tôi" (Clone to My Decks) is displayed.

---

### User Story 3 - 1-Click Clone with Deep Copy & SM-2 Initialization (Priority: P1) 🎯 MVP

**User Journey**:  
As an Authenticated Learner, I want to click "Sao chép vào Bộ từ của tôi" (Clone to My Decks) on a public deck to create an exact, independent copy of the deck and all its cards in my personal library with fresh SM-2 spaced repetition progress, so that I can immediately begin studying without affecting the original deck.

**Why this priority**:  
P1 is the primary value proposition of the marketplace. Deep copy isolation ensures zero cross-user mutation conflicts while giving learners full autonomy over their cloned decks.

**Independent Test**:  
Can be verified by clicking "Sao chép" on a public deck, verifying backend `POST /api/v1/community/decks/:id/clone`, checking that a new `Deck` and duplicate `Card` records are created in PostgreSQL with `userId = learner.id`, verifying `UserCardProgress` records are initialized in `NEW` state (`interval = 0`, `repetitions = 0`), and confirming that editing the cloned deck does not mutate the source deck.

**Acceptance Scenarios**:

1. **Given** an authenticated user viewing a 30-card public deck, **When** they click "Sao chép vào Bộ từ của tôi", **Then** an atomic `$transaction` creates the cloned deck with title `[Copy] <Original Title>` or original title, copies all 30 cards, initializes `UserCardProgress` in `NEW` status, and increments the source deck's `cloneCount` by 1.
2. **Given** an author viewing their own public deck on `/community`, **When** looking at the clone button, **Then** it shows "Bộ từ của bạn" in a disabled state, and backend rejects self-clone with `400 Bad Request`.
3. **Given** an unauthenticated guest clicking "Sao chép", **When** clicked, **Then** the system prompts them to log in or register before proceeding.

---

### User Story 4 - 5-Star Rating & Anti-Abuse Review System (Priority: P2)

**User Journey**:  
As an Authenticated Learner who has cloned or studied a community deck, I want to submit a 1-to-5 star rating and optional feedback comment, so that I can reward great creators and help other learners identify the best decks.

**Why this priority**:  
P2 provides social proof and quality signaling, enabling the community to organically curate the best vocabulary resources.

**Independent Test**:  
Can be verified by rating a cloned deck with 5 stars, checking `POST /api/v1/community/decks/:id/rate`, verifying upsert in `DeckRating`, checking recalculation of `averageRating` and `totalRatings` on `Deck`, and testing anti-abuse rules (author blocked with 403 Forbidden, non-studying users blocked).

**Acceptance Scenarios**:

1. **Given** a learner who has cloned deck `D-1`, **When** they submit a 5-star rating with comment "Great deck!", **Then** `DeckRating` is created/updated, `Deck.averageRating` and `Deck.totalRatings` are recalculated atomically, and the UI updates immediately.
2. **Given** the author of deck `D-1`, **When** they attempt to rate `D-1`, **Then** backend returns `403 Forbidden` (`"Tác giả không thể tự đánh giá bộ từ của mình"`).

---

## Technical Constraints & Anti-AI-Slop Governance

1. **Design System & Aesthetics (`apps/web/DESIGN.md` & `apps/web/MEMORY.md`)**:
   - Pure white canvas (`#ffffff`), 1px hairline borders (`#e5e5e5`), Obsidian black pills (`#000000`, `rounded-full`) for primary CTAs.
   - Zero unrequested neon gradients or dark glassmorphism.
   - Typography: `Nunito` headings, `Inter` body text, `JetBrains Mono` for badges/counts.
   - Stable outer anchor hover physics to eliminate 60Hz jitter.
2. **Performance & Reliability**:
   - Marketplace listing API response time P95 < 80ms using compound indexes `[isPublic, isArchived, cloneCount]` and `[isPublic, isArchived, averageRating]`.
   - Clone batch transaction P95 < 400ms for decks up to 500 cards.
