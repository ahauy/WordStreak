# Changelog: Audio-First Mode & Vietnamese Ending Sound Tips

All notable changes to `audio-first-mode` (`US-LIB-14`) will be documented here.

## [v1.0.0] - 2026-10-21 - Implemented & Verified
- **Shared Types**: Added `stressSyllable` and `endingSoundTipVi` to `DueCardItem` contract in `packages/shared-types`.
- **Backend Service**: Updated `ReviewsService` to map `stress_syllable` and `ending_sound_tip_vi` from official cards into review queue items.
- **Frontend Flashcard**:
  - Implemented `isAudioFirstMode` in `FlashcardReviewCard` with auto-play on card appearance and hidden English word on front face.
  - Implemented `PhoneticWordBreakdown` with stress syllable visualization on back face.
  - Added Vietnamese ending sound tip badge (`ending_sound_tip_vi`) with amber pill indicator.
- **Frontend Session**: Added Audio-First mode toggle button in `ReviewSessionPage` header.
- **Automated Verification**: Added 100% passing tests in `FlashcardReviewCard.spec.tsx`.
