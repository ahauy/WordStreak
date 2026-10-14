# Test Plan — US-ECO-08: Ôn nhanh trong Popup (Micro-review) (`extension-micro-review`)

- **Feature Slug**: `extension-micro-review`
- **Backlog ID**: `US-ECO-08`
- **Target Test File**: `apps/extension/src/popup/components/__tests__/MicroReviewSession.spec.tsx`

---

## 1. Test Suite Overview & Coverage Strategy

The test suite validates the end-to-end functionality of the micro-review feature inside the extension popup:
1. Banner presentation and click handling.
2. Background API client methods and background message routing.
3. Card flipping on click and `Space` key.
4. Audio playback with Web Speech fallback and `R` key shortcut.
5. Hotkey suppression on card front and within input elements.
6. SRS rating buttons and keys `1`-`4` triggering optimistic submissions.
7. Progress bar synchronization across cards.
8. Empty card backlog handling.
9. Celebration/completion screen metrics and action buttons.
10. Session cancellation and back-to-home navigation.

---

## 2. Test Cases (`TC-MICREV-001` to `TC-MICREV-018`)

| Test Case ID | Category | Description | Expected Outcome |
| :--- | :--- | :--- | :--- |
| **TC-MICREV-001** | Banner | Render banner when `dueCount > 0` and user is logged in | Banner renders `"🔥 Có 8 thẻ cần ôn"` and `"Ôn nhanh 5 thẻ →"`. |
| **TC-MICREV-002** | Banner | Banner displays custom count when `dueCount < 5` (e.g. 3) | Banner renders `"🔥 Có 3 thẻ cần ôn"` and `"Ôn nhanh 3 thẻ →"`. |
| **TC-MICREV-003** | Banner | Hide banner when `dueCount === 0` | Banner returns null / does not render. |
| **TC-MICREV-004** | Banner | Hide banner when user is unauthenticated (`user === null`) | Banner returns null even if `dueCount > 0`. |
| **TC-MICREV-005** | Session Launch | Click on banner triggers review session | `onStartReview` callback is called to transition `viewMode` to `'review'`. |
| **TC-MICREV-006** | Session Fetch | `MicroReviewSession` dispatches `FETCH_DUE_CARDS` on mount | Dispatches `{ type: "FETCH_DUE_CARDS", payload: { limit: 5 } }` and renders card 1. |
| **TC-MICREV-007** | Card Flip | Card flips on click | Clicking card changes state from front to back, showing Vietnamese meaning. |
| **TC-MICREV-008** | Card Flip | Card flips on `Space` key | Pressing `Space` changes card state from front to back. |
| **TC-MICREV-009** | Audio Playback | Speaker icon plays audio when `audioUrl` is present | Instantiates `Audio` and calls `.play()`. |
| **TC-MICREV-010** | Audio Fallback | Falls back to Web Speech API when `audioUrl` is null or fails | Calls `window.speechSynthesis.speak(utterance)` with target word. |
| **TC-MICREV-011** | Hotkey Audio | Pressing `R` or `r` triggers audio replay | Replays audio on both front and back faces. |
| **TC-MICREV-012** | Hotkey Guard | Rating keys `1`-`4` are ignored when card is on front face | Pressing `1`, `2`, `3`, or `4` on front face does NOT submit review. |
| **TC-MICREV-013** | Input Isolation | Hotkeys are suppressed when focus is inside an input | Pressing `Space`, `R`, `1`-`4` while focused on an input performs no action. |
| **TC-MICREV-014** | Rating Submit | Clicking rating button or pressing `1`-`4` on back submits review optimistically | Dispatches `SUBMIT_MICRO_REVIEW` with `{ cardId, rating }` and advances to next card. |
| **TC-MICREV-015** | Progress Bar | Progress updates correctly as cards advance | Displays `Thẻ 1/5`, `Thẻ 2/5`, and adjusts width percentage. |
| **TC-MICREV-016** | Back Navigation | Clicking `← Quay lại` exits session to home view | Invokes `onExit` callback and cleans up keyboard listeners. |
| **TC-MICREV-017** | Empty Backlog | Displays friendly empty state when 0 due cards are returned | Renders `"Không còn thẻ nào cần ôn hôm nay"` with return home button. |
| **TC-MICREV-018** | Completion Screen | Completing all cards renders celebration screen & triggers badge refresh | Renders `"🎉 Hoàn thành phiên ôn nhanh!"`, card count, streak, opens `/dashboard` on CTA, and dispatches `REFRESH_BADGE`. |
