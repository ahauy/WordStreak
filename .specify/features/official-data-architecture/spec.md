# 📑 Functional Specification: Official Data Architecture & Enrollment (US-LIB-02)

- **Feature ID**: US-LIB-02
- **Status**: APPROVED (Smart Clarification from Roadmap)
- **Standard**: IEEE 29148 Compliant Living Specification
- **Target**: Backend Data Architecture & Review Engine (`apps/api`, `packages/shared-types`)

---

## 1. System Requirements & Acceptance Criteria

### REQ-ODA-001 (Official Data Models & Prisma Schema)
The system must define 7 relational models in `apps/api/prisma/schema.prisma` alongside relations to `User`:
1. `WordList`: Catalog of standardized word lists (`TSL`, `NGSL`, `NAWL`, `BSL`).
2. `WordListEntry`: Metadata per word in a list (`headword`, `freqRank`, `freqValue`, `level`, `topic`).
3. `OfficialCard`: Shared immutable flashcard content (`headword`, `pos`, `content` JSON, `status`, `contentVersion`).
4. `OfficialDeck`: Official curated deck definition (`slug`, `title`, `titleVi`, `pathCode`, `level`, `cardCount`).
5. `OfficialDeckCard`: Join table linking `OfficialDeck` and `OfficialCard` with order.
6. `UserDeckEnrollment`: Lightweight tracking of user enrollment in an official deck (`userId`, `deckId`, `startedAt`, `lastStudiedAt`).
7. `UserOfficialCardProgress`: Lazy-loaded user SM-2 progress record for official cards (`userId`, `cardId`, `repetitions`, `interval`, `easeFactor`, `nextReviewDate`, `status`, `personalNote`).
8. `OfficialCardFeedback`: User issue reporting for official card corrections (`userId`, `cardId`, `reason`, `comment`, `status`).

### REQ-ODA-002 (Lazy-Loaded Progress Tracking)
- The system MUST NOT clone or deep copy cards when a user enrolls in an official deck (`UserDeckEnrollment`).
- A `UserOfficialCardProgress` record is only created when an official card is first reviewed or explicitly triaged.

### REQ-ODA-003 (Unified Due Review Queue)
- `GET /api/v1/reviews/due` must query both custom cards (`UserCardProgress`) and official cards (`UserOfficialCardProgress` and enrolled unstudied official cards).
- Overdue cards, due today cards, and new cards must be merged and sorted consistently according to the user's `dailyGoal`.

### REQ-ODA-004 (Unified Review Submission & Gamification)
- `POST /api/v1/reviews/submit` must handle card IDs corresponding to either `Card` (custom) or `OfficialCard` (shared).
- If submitting an official card without prior progress, the system lazily initializes `UserOfficialCardProgress`.
- Review submission for official cards awards XP via `XpService` and records streak activity via `StreakService` identically to custom cards.

### REQ-ODA-005 (Official Card Forking)
- `POST /api/v1/library/cards/:id/fork` allows a user to clone an `OfficialCard` into one of their custom `Deck`s as an independent `Card`.
- If `deckId` is not provided in the request body, the card is forked into the user's first active deck or a default deck is created.

---

## 2. Technical Approach & Design

### Architecture & Simplicity (`ponytail`)
- **No speculative abstractions**: Reuse existing `SrsService` for SM-2 calculation.
- **Unified Review Types**: Extend `@wordstreak/shared-types` so frontend components receive the exact same `DueCardItem` structure whether a card is custom or official.
- **Clean Module Organization**:
  - `LibraryModule` in `apps/api/src/modules/library/` containing `LibraryService` and `LibraryController`.
  - Update `ReviewsService` in `apps/api/src/modules/reviews/reviews.service.ts` to seamlessly integrate official cards into review operations.

---

## 3. Test Plan & Test Cases

- **TC-ODA-001 (Prisma Schema & Client)**: Verify that Prisma schema generates valid client with all 8 new models and relations.
- **TC-ODA-002 (Unified Due Reviews)**: Verify `ReviewsService.getDueCards` returns custom cards and official cards in a single prioritized queue.
- **TC-ODA-003 (Official Card Review Submission & Lazy Progress)**: Verify submitting a rating for an official card creates `UserOfficialCardProgress` lazily, updates SM-2, records streak, and awards XP.
- **TC-ODA-004 (Review Stats & Summary)**: Verify `getReviewStats` and `getReviewSummary` count both custom and official cards.
- **TC-ODA-005 (Official Card Forking)**: Verify `POST /api/v1/library/cards/:id/fork` copies an official card into a custom deck with status `NEW`.
