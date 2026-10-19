# Feature Specification: Library Discovery UI (US-LIB-03)

## Section 1: Requirements & Acceptance Criteria

### Context & Goal
Provide learners with a frictionless, high-speed official vocabulary discovery experience (`/library`) and deep deck preview (`/library/decks/:slug`). Users can browse curated curriculum paths (TOEIC TSL, Foundation NGSL, IELTS NAWL, Communication NGSL-S), filter by proficiency level, preview 25-word deck lists with IPA and Vietnamese meanings, and enroll or start studying with 1 click.

### Acceptance Criteria Tracing
- **US-LIB-03**: Trang Thư viện và Chi tiết Deck (Library Discovery UI)
  - **REQ-LIB-03-01 (Path Discovery & Filtering)**: `/library` displays tab navigation for curriculum paths: All, TOEIC (`TSL`), Nền tảng (`NGSL`), IELTS (`NAWL`), Giao tiếp (`NGSL-S`), with level filters (T1, T2, T3).
  - **REQ-LIB-03-02 (Official Deck Card)**: Each card renders Title, TitleVi, 25-word count badge, estimated study time (~10 mins), personal progress bar if enrolled, and CC BY-SA 4.0 official attribution badge.
  - **REQ-LIB-03-03 (1-Click Enrollment & Study)**: 1-click "Thêm vào thư viện" (`POST /api/v1/library/decks/:id/enroll`) or "Học ngay" for seamless start.
  - **REQ-LIB-03-04 (Deck Detail & Card Previews)**: `/library/decks/:slug` presents deck overview, full list of 25 official cards with IPA phonetic, Vietnamese definition, English example, and instant audio pronunciation.

### Assumptions & Constraints
- `ASM-library-discovery-ui-001`: Data tables `OfficialDeck`, `OfficialCard`, `OfficialDeckCard`, and `UserDeckEnrollment` were established in US-LIB-02. No DB schema migration required.
- `ASM-library-discovery-ui-002`: Official decks are public to browse; enrollment and progress tracking require JWT authentication.
- `ASM-library-discovery-ui-003`: Web Speech API (`window.speechSynthesis`) is used for instant zero-latency English word audio pronunciation in the deck preview without third-party audio dependencies.

---

## Section 2: Technical Approach

### Architecture & Simplicity (Ponytail Principle)
- **Backend (`apps/api`)**:
  - Add `getDecks(userId, query)` to `LibraryService` with search/filter by `pathCode`, `level`, `topic`, pagination, and user enrollment/mastery join.
  - Add `getDeckBySlug(userId, slug)` to `LibraryService` returning deck metadata, card previews, and user progress.
  - Add `enrollDeck(userId, deckId)` to `LibraryService` creating a `UserDeckEnrollment` record.
  - Expose `GET /api/v1/library/decks`, `GET /api/v1/library/decks/:slug`, `POST /api/v1/library/decks/:id/enroll` on `LibraryController`.
- **Frontend (`apps/web`)**:
  - Strict adherence to `DESIGN.md` (paper-white canvas `#ffffff`, 1px hairline `#e5e5e5`, Obsidian black pill buttons `#000000`, `Nunito`/`Inter`/`JetBrains Mono`).
  - Strict adherence to `MEMORY.md` (Zero hover flicker: stable outer anchor, no generic AI gradients).
  - `LibraryPage.tsx` with Path tabs, level selector, and deck card grid.
  - `OfficialDeckDetailPage.tsx` with word list, IPA sound previews, and 1-click enroll.
  - Integration into `DashboardNavbar.tsx` and `App.tsx` routes.

---

## Section 3: Test Plan & Test Cases

- **TC-LIB-03-001 (Backend - List Decks)**: Verify `GET /api/v1/library/decks` returns paginated official decks with `isEnrolled` and `masteredCount` computed.
- **TC-LIB-03-002 (Backend - Filter by Path & Level)**: Verify `pathCode` and `level` query filters restrict returned decks correctly.
- **TC-LIB-03-003 (Backend - Deck Details by Slug)**: Verify `GET /api/v1/library/decks/:slug` returns 404 for unknown slug and returns deck with sorted cards for valid slug.
- **TC-LIB-03-004 (Backend - Enroll Deck)**: Verify `POST /api/v1/library/decks/:id/enroll` creates `UserDeckEnrollment` idempotently.
- **TC-LIB-03-005 (Frontend - LibraryPage)**: Verify `LibraryPage` renders path tabs, decks grid, and switches filter tabs cleanly.
- **TC-LIB-03-006 (Frontend - DeckDetailPage)**: Verify `OfficialDeckDetailPage` renders deck info, cards preview table, and audio buttons.
