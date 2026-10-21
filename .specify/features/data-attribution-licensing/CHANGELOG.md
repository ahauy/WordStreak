# Changelog — Feature: Data Attribution & CC BY-SA 4.0 Licensing (US-LIB-08)

All notable changes to this feature specification and implementation are documented here.

## [v1.0] - 2026-10-20
### Completed
- Implemented `SourceAttributionBadge` component with Obsidian pill geometry (`rounded-full`, `#fafafa` background, `#e5e5e5` hairline border).
- Implemented `DataSourcesPage` at `/sources` providing comprehensive details on:
  - NGSL 1.2 (2,809 words ~92% general English text coverage) by Dr. Charles Browne, Dr. Brent Culligan & Joseph Phillips.
  - TSL 1.2 (1,200 words ~98.5% TOEIC test coverage when combined with NGSL) by Dr. Charles Browne, Dr. Brent Culligan & Joseph Phillips.
  - Creative Commons Attribution-ShareAlike 4.0 International (CC BY-SA 4.0) license terms and official links.
  - Transparent legal disclaimers stating no affiliation or endorsement with Educational Testing Service (ETS, TOEIC®) or Cambridge/British Council/IDP (IELTS®).
- Added public route `/sources` in `apps/web/src/App.tsx`.
- Integrated `SourceAttributionBadge` across `OfficialDeckCard.tsx`, `OfficialDeckDetailPage.tsx`, and `LibraryPage.tsx` footer.
- Added bilingual i18n support in `apps/web/src/locales/en/common.json` and `apps/web/src/locales/vi/common.json` with 100% parity pass.
- Verified test coverage:
  - `SourceAttributionBadge.spec.tsx` (4 tests passed).
  - `DataSourcesPage.spec.tsx` (4 tests passed).
  - Full web test suite: 80 test files, 455 tests passed.
  - Monorepo full build `pnpm build`: exit code 0.
