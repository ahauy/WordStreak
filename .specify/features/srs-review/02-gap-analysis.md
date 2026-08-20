# Gap Analysis: Spaced Repetition System & Flashcard Review Flow (SRS Review)

## AS-IS (Current State)

- **Database**:
  - `UserCardProgress` table exists in `apps/api/prisma/schema.prisma` with fields: `id`, `userId`, `cardId`, `interval`, `easeFactor`, `repetitions`, `lastReviewedAt`, `nextReviewDate`, `status`.
  - When cards are created via `POST /api/v1/decks/:deckId/cards`, a `UserCardProgress` record is initialized with default values (`interval: 0`, `easeFactor: 2.5`, `repetitions: 0`, `status: "NEW"`, `nextReviewDate: now()`).
- **Backend**:
  - No `ReviewsModule`, `ReviewsController`, or `SrsService` in `apps/api/src/modules/`.
  - No endpoints to query due cards (`/api/v1/reviews/due`) or submit review ratings (`/api/v1/reviews/submit`).
- **Frontend**:
  - Users can view and manage decks (`/decks`, `/decks/:id`), but clicking "Review" or navigating to review sessions has no functional screen or route.
  - `apps/web/src/features/reviews/` contains empty directory stubs (`components/`, `hooks/`, `pages/`, `services/`).
  - No 3D flashcard flip component or keyboard navigation handlers for SRS ratings.

---

## TO-BE (Target State)

- **Backend**:
  - `ReviewsModule` providing:
    - `SrsService`: Pure, mathematically verified implementation of SuperMemo-2 (SM-2) algorithm.
    - `GET /api/v1/reviews/due`: Returns due cards for review session (supports optional `deckId` filter, sorts overdue -> due today -> new cards up to `dailyGoal`).
    - `POST /api/v1/reviews/submit`: Accepts `{ cardId, rating: 1 | 2 | 3 | 4 }`, executes SM-2 calculation, atomically updates `UserCardProgress`, and logs review activity.
    - `GET /api/v1/reviews/stats`: Returns count of due, learning, and mastered cards for dashboard widgets.
- **Frontend**:
  - `/review` (Global review) and `/decks/:deckId/review` (Deck-scoped review) routes registered in `App.tsx`.
  - Premium Minimalist 3D Flashcard UI adhering to `apps/web/DESIGN.md`:
    - Front face: Word, IPA phonetics, native audio play button, part of speech tag, flip prompt (`Space`).
    - Back face: Meaning, example sentence with context translation, collocations, mnemonic tip.
    - 4-tier Obsidian rating buttons with keyboard bindings: `1` (Again), `2` (Hard), `3` (Good), `4` (Easy).
    - Session progress bar (`X / Total Remaining`).
    - End-of-session summary card with retention rate, cards reviewed, and streak trigger.

---

## Functional Gaps

1. **SM-2 Engine Implementation**: `SrsService` in backend to compute next interval, ease factor, and review timestamp.
2. **Review Queue Query Engine**: Query builder filtering by `userId`, `nextReviewDate <= NOW()` and `status == 'NEW'` (respecting daily goal limits and deck scope).
3. **Rating Submission & Progress Persistence API**: Endpoint validating rating bounds (1..4) and ownership.
4. **Interactive Flashcard UI & Audio**: React component with 3D flip transform, keyboard listener, and speech synthesis/audio playback.
5. **Session State Store / Hook**: Client-side queue manager handling intra-session repeat for failed cards (`Again`) and final score tallying.

---

## Data Gaps

- `UserCardProgress` table already exists in PostgreSQL, but needs indexing on `[userId, nextReviewDate]` and `[userId, status]` to ensure sub-10ms queue queries.

---

## User Impact

- Existing users gain immediate access to the Core Learning Loop from the Dashboard and Deck Detail pages.
- Zero data loss for existing cards (they are already in `UserCardProgress` with `status: "NEW"`).

---

## Transition Requirements

- **Migration & Indexing**: Add compound index to Prisma schema if needed.
- **Backward Compatibility**: Fully backward compatible with existing decks and cards.
