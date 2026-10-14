# Implementation Plan — US-ECO-08: Ôn nhanh trong Popup (Micro-review) (`extension-micro-review`)

- **Feature Slug**: `extension-micro-review`
- **Backlog ID**: `US-ECO-08`
- **Baseline Reference**: `.specify/features/extension-micro-review/baseline.md`
- **Technical Spec Reference**: `.specify/features/extension-micro-review/spec.md`

---

## 1. Ponytail 7-Rung Simplicity Ladder Evaluation

1. **Rung 1 — Native platform capabilities**: Use native Chrome Messaging (`chrome.runtime.sendMessage`), standard `HTML5 Audio` and `window.speechSynthesis` for text-to-speech fallback, and vanilla CSS transitions for card flips.
2. **Rung 2 — Standard Library first**: Zero external review or carousel libraries. State is managed with clean React primitives (`useState`, `useEffect`, `useCallback`).
3. **Rung 3 — Reusing existing domain types**: Reuse `DueCardItem`, `SubmitReviewDto`, `SrsRating` from `@wordstreak/shared-types`.
4. **Rung 4 — Fewest files & minimal indirection**: 3 cohesive UI components (`MicroReviewBanner.tsx`, `MicroCard.tsx`, `MicroReviewSession.tsx`), background API extension in existing files, 1 test file.
5. **Rung 5 — Zero unneeded abstractions**: No Redux/Zustand store in popup; direct message sending to service worker.
6. **Rung 6 — Robust error handling**: Defensive guards around audio playback, storage access, and unmounted listeners.
7. **Rung 7 — Clean Red-Green-Refactor verification**: Comprehensive unit and integration test coverage across all 18 test cases.

---

## 2. Component & Data Flow Architecture

```
                                      +------------------------+
                                      |   Extension Storage    |
                                      | (ReviewSummaryCache)   |
                                      +-----------+------------+
                                                  |
                                                  v
+------------------+    dueCount > 0   +------------------------+
|   PopupApp.tsx   +------------------>|  MicroReviewBanner.tsx |
+--------+---------+                   +-----------+------------+
         |                                         |
         | viewMode === 'review'                   | Click "Ôn nhanh 5 thẻ →"
         v                                         v
+---------------------------------------------------------------+
|                    MicroReviewSession.tsx                     |
|                                                               |
|  - Manages card list: DueCardItem[]                           |
|  - Current index (0..N-1), isFlipped, isComplete              |
|  - Dispatches FETCH_DUE_CARDS on mount                        |
|  - Optimistically dispatches SUBMIT_MICRO_REVIEW              |
|                                                               |
|  +---------------------------------------------------------+  |
|  |                     MicroCard.tsx                       |  |
|  |  Front: Word, IPA, Audio button, Flip hint              |  |
|  |  Back:  Meaning, Example, Replay audio, 4 Rating buttons |  |
|  +---------------------------------------------------------+  |
|                                                               |
|  Progress Bar, Header Back button, Celebration Screen         |
+-------------------------------+-------------------------------+
                                |
                                | chrome.runtime.sendMessage
                                v
               +----------------------------------+
               |     Background Service Worker    |
               |                                  |
               | - FETCH_DUE_CARDS -> API client  |
               | - SUBMIT_MICRO_REVIEW -> API     |
               | - badgeManager.refreshBadgeNow() |
               +----------------------------------+
```

---

## 3. Contracts & Message Schemas

### 3.1 Extension Message Union Addition
```ts
// packages/shared-types/src/extension.ts
import type { DueCardItem, SubmitReviewDto } from "./reviews.js";

export type ExtensionMessage =
  | ... existing types
  | { type: "FETCH_DUE_CARDS"; payload?: { limit?: number; deckId?: string } }
  | { type: "SUBMIT_MICRO_REVIEW"; payload: SubmitReviewDto };
```

### 3.2 Background API Client Additions
```ts
// apps/extension/src/background/api-client.ts
async getDueCards(limit: number = 5, deckId?: string): Promise<DueCardItem[]>
async submitReview(dto: SubmitReviewDto): Promise<any>
```

---

## 4. Work Breakdown & Implementation Tasks

- [x] **Task 1: Specifications**: Draft 5 Lean Canonical specification files (`baseline.md`, `spec.md`, `plan.md`, `test-plan.md`, `CHANGELOG.md`).
- [ ] **Task 2: Shared Types**: Update `packages/shared-types/src/extension.ts` with `FETCH_DUE_CARDS` and `SUBMIT_MICRO_REVIEW` and build package.
- [ ] **Task 3: Background Service Worker & API Client**: Implement `getDueCards` and `submitReview` in `ExtensionApiClient` and wire handlers in `apps/extension/src/background/index.ts`.
- [ ] **Task 4: MicroReviewBanner Component**: Create `MicroReviewBanner.tsx` displaying due count and Obsidian pill button.
- [ ] **Task 5: MicroCard Component**: Create `MicroCard.tsx` with front/back flip, audio pronunciation, phonetic, meaning, example, and 4 rating buttons.
- [ ] **Task 6: MicroReviewSession Component**: Create `MicroReviewSession.tsx` with session lifecycle, progress bar, hotkeys (`Space`, `R`, `1-4`), optimistic submit, and celebration screen.
- [ ] **Task 7: PopupApp Integration**: Wire `viewMode: 'home' | 'review'` and banner display in `PopupApp.tsx`.
- [ ] **Task 8: Test Suite Implementation**: Implement all test cases TC-MICREV-001 through TC-MICREV-018 in `apps/extension/src/popup/components/__tests__/MicroReviewSession.spec.tsx`.
- [ ] **Task 9: Verification & Build**: Run vitest test suite and production build.
