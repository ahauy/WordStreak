# Elicitation Record: Card List Management & Search/Filter (US-CARD-02)

## Stage 1 — Business Value

- **Problem & Pain Point**: When a deck grows to dozens or hundreds of vocabulary cards, learners struggle to quickly find specific words, filter by mastery status (New, Learning, Mastered), and manage cards in bulk. Without pagination and server-side filtering, performance degrades and maintenance is cumbersome.
- **Target Personas**: Persona A (Exam Prep Learner - managing large vocabulary lists), Persona B (Busy Learner - quick review and status filtering).
- **Success Metrics**:
  - P95 query response time < 100ms for paginated card search and filtering.
  - 100% reduction in client-side memory bloat for large decks (> 500 cards) via server-side pagination.
  - Zero accidental data loss during bulk operations via confirmation gates.

## Pillar 1 — Personas, Actors & RBAC

- **Q1: Access and permissions** → **Decision**: Only the deck owner can perform CRUD, status filtering, and bulk actions (Bulk Delete, Bulk Move, Bulk Reset Progress). Guests and non-owners of public decks can only view paginated public cards in read-only mode without mutating operations.

## Pillar 2 — State Machine & Lifecycle

- **Q2: Card Progress Lifecycle in Bulk Actions**:
  - `Bulk Reset`: Resets `UserCardProgress` of selected cards to `status: 'NEW'`, `repetitions: 0`, `interval: 0`, `easeFactor: 2.5`, `nextReviewDate: now()`, `lastReviewedAt: null`.
  - `Bulk Move`: Moves selected cards to target deck ID owned by the same user, preserving existing `UserCardProgress`.
  - `Bulk Delete`: Cascade deletes selected cards and their `UserCardProgress` records after explicit modal confirmation.

## Pillar 3 — Business Rules & Algorithms

- **BR-CARD-001 (Server-side Pagination & Filtering)**:
  - Default `page = 1`, `limit = 20` (options: 10, 20, 50).
  - Search query matches case-insensitively across `word`, `meaning`, `exampleSentence`.
  - Status filter supports: `ALL`, `NEW`, `LEARNING`, `MASTERED`.
- **BR-CARD-002 (Bulk Operations Integrity)**:
  - All bulk operations (`DELETE`, `MOVE`, `RESET_PROGRESS`) must execute inside an ACID database transaction (`$transaction`).
  - Target deck for bulk move must belong to the authenticated user.
  - Maximum 100 cards selectable per batch operation.

## Pillar 4 — Workflows & Edge Cases

- **View Mode Switching**: Toggle between 3D Cards Grid and Dense Data Table (Row layout), saved in `localStorage`.
- **Empty Filter State**: Distinct visual feedback when a filter/search yields 0 cards vs when the deck itself has 0 cards.
- **Pagination Boundary**: Deleting the last card on page N redirects automatically to page N-1 if page N becomes empty.

## Assumptions Confirmed

- **ASM-CARD-001**: Server-side pagination (`limit=20`, `page=1`) is enforced on `GET /api/v1/decks/:deckId/cards` with query params `page`, `limit`, `search`, `status`.
- **ASM-CARD-002**: UI supports both 3D Grid view and Dense Data Table (Row view) with localStorage toggle persistence.
- **ASM-CARD-003**: Bulk actions supported: Bulk Delete, Bulk Move to Deck, and Bulk Reset Progress.
- **ASM-CARD-004**: Non-owners viewing public decks have read-only access (no bulk actions, no add/edit/delete buttons).

## Open Questions

- None.
