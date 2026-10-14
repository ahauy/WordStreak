# Changelog — US-ECO-08: Ôn nhanh trong Popup (Micro-review) (`extension-micro-review`)

## [1.0.0] - 2026-10-14 — SIGNED-OFF

### Added
- **Lean Canonical Specifications**: Added `baseline.md`, `spec.md`, `plan.md`, `test-plan.md`, and `CHANGELOG.md` in `.specify/features/extension-micro-review/`.
- **Shared Types**: Added `FETCH_DUE_CARDS` and `SUBMIT_MICRO_REVIEW` extension message types in `packages/shared-types/src/extension.ts`.
- **Extension Background**:
  - Implemented `getDueCards(limit, deckId)` and `submitReview(dto)` in `apps/extension/src/background/api-client.ts`.
  - Added background message listeners for `FETCH_DUE_CARDS` and `SUBMIT_MICRO_REVIEW` with immediate badge refresh in `apps/extension/src/background/index.ts`.
- **Extension Popup Components**:
  - `MicroReviewBanner.tsx`: Sticky quick-action banner when `dueCount > 0`.
  - `MicroCard.tsx`: Two-sided flip card with word, IPA, audio, Vietnamese meaning, example sentence, and 4 SRS rating buttons.
  - `MicroReviewSession.tsx`: Session manager with optimistic grading, keyboard shortcuts (`Space`, `R`, `1-4`), progress bar, and completion celebration screen.
- **PopupApp Integration**: Added view mode switching (`'home' | 'review'`) and automatic badge/cache refresh in `apps/extension/src/popup/PopupApp.tsx`.
- **Automated Tests**: Comprehensive test suite `MicroReviewSession.spec.tsx` covering test cases `TC-MICREV-001` through `TC-MICREV-018`.
