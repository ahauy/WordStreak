# Changelog: Library Discovery UI (US-LIB-03)

## [1.0.0] - 2026-10-19

### Added
- **Backend (`apps/api`)**:
  - Implemented `GET /api/v1/library/decks` supporting filtering by `pathCode`, `level`, and `topic`, with pagination and user enrollment/mastery calculation.
  - Implemented `GET /api/v1/library/decks/:slug` returning comprehensive official deck metadata, card previews with IPA, meanings, examples, and collocations, plus user status.
  - Implemented `POST /api/v1/library/decks/:id/enroll` recording idempotent user enrollment (`UserDeckEnrollment`).
  - Added unit test suite in `apps/api/src/modules/library/library.service.spec.ts` (TC-LIB-03-001 to TC-LIB-03-004).
- **Shared Contracts (`packages/shared-types`)**:
  - Exported `GetOfficialDecksQuery`, `PaginatedOfficialDecksResponse`, `OfficialDeckCardItemDto`, `OfficialDeckDetailResponse`, and `EnrollOfficialDeckResponse`.
- **Frontend (`apps/web`)**:
  - Built `libraryService.ts` for API communication.
  - Built `OfficialDeckCard.tsx` complying with `DESIGN.md` (paper-white canvas, hairline border, obsidian pills, stable outer anchor hover physics).
  - Built `LibraryPage.tsx` (`/library`) with path tabs (TOEIC, Foundation, Core, Academic, Communication), level filter, topic search, and responsive grid.
  - Built `OfficialDeckDetailPage.tsx` (`/library/decks/:slug`) with deck summary, vocabulary card list, instant Web Speech pronunciation, and 1-click enroll.
  - Registered `/library` and `/library/decks/:slug` in `App.tsx`.
  - Added "Library" navigation item with `BookOpen` icon to desktop and mobile menus in `DashboardNavbar.tsx`.
  - Added unit tests in `LibraryPage.spec.tsx` and `OfficialDeckDetailPage.spec.tsx` (TC-LIB-03-005, TC-LIB-03-006).

### Verification
- `pnpm --filter api test apps/api/src/modules/library/library.service.spec.ts` (9/9 passed).
- `pnpm --filter web test src/features/library` (5/5 passed).
- `pnpm test` (75 test suites, 433 tests passed across all apps).
- `pnpm build` (All workspaces built cleanly).
