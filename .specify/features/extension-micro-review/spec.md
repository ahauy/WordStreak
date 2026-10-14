# Technical Specification — US-ECO-08: Ôn nhanh trong Popup (Micro-review) (`extension-micro-review`)

- **Feature Slug**: `extension-micro-review`
- **Backlog ID**: `US-ECO-08`
- **Baseline Reference**: `.specify/features/extension-micro-review/baseline.md`

---

## 1. Functional Requirements (`REQ-MICREV-###`)

| ID | Requirement Statement | Derived From |
| :--- | :--- | :--- |
| **REQ-MICREV-01** | `ExtensionMessage` type SHALL include `FETCH_DUE_CARDS` (`payload?: { limit?: number; deckId?: string }`) and `SUBMIT_MICRO_REVIEW` (`payload: SubmitReviewDto`). | `ASM-MICREV-001`, `ASM-MICREV-005` |
| **REQ-MICREV-02** | `ExtensionApiClient` SHALL provide `getDueCards(limit: number = 5)` calling `GET /reviews/due?limit=...` and `submitReview(dto: SubmitReviewDto)` calling `POST /reviews/submit`. Background service worker SHALL route these messages and call `badgeManager.refreshBadgeNow(true)` upon review submission. | `ASM-MICREV-001`, `ASM-MICREV-005`, `BR-MICREV-05` |
| **REQ-MICREV-03** | `MicroReviewBanner` SHALL render in `PopupApp.tsx` below `AuthStatusCard` when an authenticated user has `dueCount > 0`, displaying `🔥 Có {dueCount} thẻ cần ôn` and a CTA button `Ôn nhanh 5 thẻ →` (or count if < 5). Clicking it SHALL switch `viewMode` to `'review'`. | `ASM-MICREV-002`, `BR-MICREV-07` |
| **REQ-MICREV-04** | `MicroCard` SHALL render a 2-sided card with smooth flip interaction. Front face displays deck badge, headword (Nunito bold), IPA phonetic, audio speaker button, and `[Nhấn Space hoặc click để lật]`. Back face displays Vietnamese meaning, example sentence, replay audio button, and 4 rating buttons (1: Again, 2: Hard, 3: Good, 4: Easy). | `ASM-MICREV-003`, `BR-MICREV-07` |
| **REQ-MICREV-05** | Global hotkeys SHALL be active during review session: `Space` flips card, `R` / `r` plays audio, and `1`-`4` submit SRS ratings ONLY when back face is revealed. Hotkeys SHALL NOT trigger when user is typing in inputs or textareas. | `ASM-MICREV-004`, `BR-MICREV-02`, `BR-MICREV-06` |
| **REQ-MICREV-06** | `MicroReviewSession` SHALL orchestrate session state (loading, reviewing, empty, complete). Submitting ratings SHALL be optimistic, advancing immediately to the next card. Completing the session SHALL display a celebration screen with reviewed card count, streak info, a button to open Web App (`/dashboard`), and a button to return to popup home. | `ASM-MICREV-005`, `ASM-MICREV-006`, `BR-MICREV-04` |

---

## 2. User Stories & Given-When-Then Scenarios (`US-MICREV-###`)

### US-MICREV-01: Micro-Review Banner Visibility & Launch
- **Scenario 1.1 (Banner shown when cards are due)**:
  - **Given** an authenticated user opens the extension popup
  - **And** the review summary indicates `dueCount = 7`
  - **When** the popup view renders
  - **Then** `MicroReviewBanner` is displayed with text `"🔥 Có 7 thẻ cần ôn"` and button `"Ôn nhanh 5 thẻ →"`.
- **Scenario 1.2 (Banner hidden when dueCount is 0)**:
  - **Given** an authenticated user has `dueCount = 0`
  - **When** the popup view renders
  - **Then** `MicroReviewBanner` is not rendered.
- **Scenario 1.3 (Banner hidden when unauthenticated)**:
  - **Given** the extension has no active session (`user == null`)
  - **When** the popup view renders
  - **Then** `MicroReviewBanner` is not rendered.
- **Scenario 1.4 (Clicking banner initiates review session)**:
  - **Given** the banner is displayed
  - **When** the user clicks `"Ôn nhanh 5 thẻ →"`
  - **Then** `viewMode` switches to `'review'`, loading indicator appears, and `FETCH_DUE_CARDS` is dispatched with `{ limit: 5 }`.

### US-MICREV-02: Card Flipping and Audio Pronunciation
- **Scenario 2.1 (Flip card on Space or Click)**:
  - **Given** card 1 is displayed on its front face
  - **When** the user presses `Space` or clicks the card surface
  - **Then** the card flips to reveal the back face with meaning and rating buttons.
- **Scenario 2.2 (Audio playback with fallback to Web Speech)**:
  - **Given** a card has an `audioUrl`
  - **When** the user clicks the speaker icon or presses `R`
  - **Then** `Audio.play()` is invoked.
  - **And** if `audioUrl` is missing or fails, `window.speechSynthesis.speak` is invoked with the word.

### US-MICREV-03: SRS Rating Submission & Progression
- **Scenario 3.1 (Pressing rating hotkey on back face)**:
  - **Given** card 1 is flipped to its back face
  - **When** the user presses key `3` (Good) or clicks rating button 3
  - **Then** `SUBMIT_MICRO_REVIEW` is optimistically dispatched with `{ cardId: "card-1", rating: 3 }`
  - **And** the session immediately advances to card 2 on its front face.
- **Scenario 3.2 (Rating hotkeys ignored on front face)**:
  - **Given** card 1 is on its front face
  - **When** the user presses key `3`
  - **Then** no review is submitted and the card remains on the front face.
- **Scenario 3.3 (Hotkeys ignored inside input elements)**:
  - **Given** an input element has focus
  - **When** the user presses `Space` or `1`-`4`
  - **Then** hotkey listeners do not trigger flip or review submission.

### US-MICREV-04: Session Completion & Post-Review Actions
- **Scenario 4.1 (Complete 5-card session)**:
  - **Given** the user rates the 5th and final card
  - **When** the rating is recorded
  - **Then** the completion celebration screen appears showing `"🎉 Hoàn thành phiên ôn nhanh!"` and `"5 thẻ đã được ôn tập"`.
  - **And** badge refresh is requested.
- **Scenario 4.2 (Open Web App for further study)**:
  - **Given** the completion screen is displayed
  - **When** the user clicks `"🚀 Mở app để học tiếp"`
  - **Then** a new tab opens pointing to `${WEB_APP_URL}/dashboard`.
- **Scenario 4.3 (Return to popup home)**:
  - **Given** the completion screen is displayed (or `← Quay lại` button is clicked during review)
  - **When** the user clicks `"Hoàn tất"` or `"Quay lại"`
  - **Then** `viewMode` switches back to `'home'`.

---

## 3. Edge Case Matrix

| Edge Case ID | Scenario / Condition | Expected Behavior |
| :--- | :--- | :--- |
| **ECM-MICREV-01** | Backend returns fewer than 5 cards (e.g. 2 cards due) | Session smoothly runs for 2 cards (`X/2` progress), and finishes after 2 cards. |
| **ECM-MICREV-02** | Backend returns 0 cards (due cards cleared between banner click and fetch) | Displays an empty backlog state `"Tuyệt vời! Không còn thẻ nào cần ôn hôm nay."` with button to return home. |
| **ECM-MICREV-03** | `audioUrl` is null, empty string, or network 404 | Seamlessly calls `window.speechSynthesis.speak(new SpeechSynthesisUtterance(word))` with zero unhandled exceptions. |
| **ECM-MICREV-04** | User presses rating keys repeatedly and rapidly | Each card advances index synchronously; cardId is mapped to the current index at time of click, preventing double-ratings. |
| **ECM-MICREV-05** | Network error during optimistic review submit | Background logs error, does not crash popup session. Badge refresh will sync latest backend state on next cycle. |
| **ECM-MICREV-06** | User clicks `← Quay lại` midway through session | Review session safely unmounts, event listeners are cleaned up, and popup returns to home view without errors. |
