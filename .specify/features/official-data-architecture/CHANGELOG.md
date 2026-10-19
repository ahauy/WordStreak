# 📝 Changelog: Official Data Architecture & Enrollment (US-LIB-02)

## [v1.0.0] - 2026-10-19
### Added
- Created Prisma schema models for 7 official tables: `WordList`, `WordListEntry`, `OfficialCard`, `OfficialDeck`, `OfficialDeckCard`, `UserDeckEnrollment`, `UserOfficialCardProgress`, `OfficialCardFeedback` with foreign keys, cascade rules, and indexes.
- Added database migration `20261019000000_add_official_library_models`.
- Added shared TypeScript contracts in `packages/shared-types/src/official-library.ts`.
- Integrated official cards into `ReviewsService`:
  - Unified due review queue (`getDueCards`) merging custom cards and enrolled official cards sorted chronologically.
  - Unified review submission (`submitReview`) with lazy-loaded `UserOfficialCardProgress` creation, SM-2 updates, streak tracking, and XP awards.
  - Aggregated stats (`getReviewStats`) and 10-field summary (`getReviewSummary`).
- Created `LibraryModule`, `LibraryController`, and `LibraryService` with `POST /api/v1/library/cards/:id/fork` endpoint allowing users to clone official cards into custom decks.
- Added comprehensive unit tests covering all `TC-ODA-001` through `TC-ODA-005` test cases with 100% pass rate.
