# Feature Specification: Guest Flashcard Preview & Post-Registration Transfer (US-START-03)

- **User Story:** `US-START-03: Học thử trước khi đăng ký (Guest Preview)`
- **Epic:** `EPIC 11: Starter Decks & Onboarding`
- **Sprint:** `Sprint 9 / 10 Backlog`
- **Status:** In Progress
- **Execution Tier:** Tier 1: Fast-Track

---

## 1. Requirements & Acceptance Criteria

### Problem Statement
New prospective users visiting WordStreak often hesitate to register before experiencing the spaced repetition study flow. Allowing guests to study 5 sample contextual cards directly on the landing page without friction, saving their progress locally, and transferring that progress when they register dramatically increases visitor-to-active-learner activation rate (0 → 60+%).

### Functional Requirements
- **`REQ-START-03-01: Guest 5-Card Flashcard Preview`**
  - Displays a curated set of 5 sample vocabulary words (`resilient`, `ubiquitous`, `serendipity`, `diligent`, `pragmatic`) with IPA, Audio, Meaning (VI/EN), and Example sentence.
  - Interactive 3D flip card with 4 SM-2 grading actions: Again (1), Hard (2), Good (3), Easy (4).
  - Maintains state without registration in `localStorage` key `wordstreak_guest_preview`.
  - When all 5 cards are reviewed, displays a celebratory completion screen with a direct CTA to register and preserve progress.

- **`REQ-START-03-02: Post-Registration Progress Transfer`**
  - When user registers and navigates to the dashboard, checks `localStorage` for completed guest review session.
  - Displays a welcoming Obsidian Pill banner: "🎉 Bạn đã hoàn thành 5 từ học thử trước khi đăng ký! Tiến độ đã được ghi nhận vào tài khoản của bạn."
  - Provides a single-click action to acknowledge and clear the guest state.

- **`REQ-START-03-03: Design System & Anti-Slop Compliance`**
  - Strictly follows `apps/web/DESIGN.md`: `#ffffff` canvas, hairline border `#e5e5e5`, Obsidian black pill (`#000000`, `rounded-full`) CTAs, `Nunito`/`Inter` typography.
  - Stable outer anchor on all interactive cards to prevent 60Hz hover jitter.

---

## 2. Technical Approach (`ponytail` Simplicity)

### Files to Touch / Create:
- `apps/web/src/features/landing/utils/guestStorage.ts`: Pure functions for reading, updating, and clearing guest review state in `localStorage`.
- `apps/web/src/features/landing/components/GuestFlashcardPreview.tsx`: The 5-word interactive preview component.
- `apps/web/src/features/dashboard/components/GuestTransferBanner.tsx`: Dashboard notification banner acknowledging guest review upon login.
- `apps/web/src/features/landing/pages/LandingPage.tsx`: Mounts `GuestFlashcardPreview`.
- `apps/web/src/features/dashboard/pages/DashboardPage.tsx`: Mounts `GuestTransferBanner`.

---

## 3. Test Plan & Test Cases

- `TC-GUEST-001`: `getGuestPreviewState()` returns empty/initial state when localStorage has no data.
- `TC-GUEST-002`: `recordGuestCardRating()` updates reviewed cards, progress count, and marks completed when reaching 5 cards.
- `TC-GUEST-003`: `clearGuestPreviewState()` resets storage cleanly.
- `TC-GUEST-004`: `GuestFlashcardPreview` renders current card, flips on button/card click, and advances on rating.
- `TC-GUEST-005`: `GuestFlashcardPreview` displays completion state when 5 cards are finished with "Sign Up" CTA.
- `TC-GUEST-006`: `GuestTransferBanner` renders on dashboard when guest preview was completed and can be dismissed.
