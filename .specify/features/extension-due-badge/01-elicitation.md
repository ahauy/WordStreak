# Elicitation Record: Extension Due Cards Badge (`US-ECO-05`)

- **Feature Slug**: `extension-due-badge`
- **Protocol Depth**: Bounded Task (Business Value + 3 Targeted Pillar Questions)
- **Date**: 2026-10-12
- **Status**: Complete (0 Open Questions)

---

## Stage 1 — Business Value

- **Problem & Pain Point**: Even when learners install the WordStreak Chrome Extension (`US-ECO-03`) to capture vocabulary while browsing, they receive zero passive visual cues on the browser toolbar when flashcards become due for Spaced Repetition (SM-2) review or when their multi-day study streak is at risk of breaking. Without an ambient badge indicator on the Extension icon, learners forget to review until after their streak expires or cards pile up into an overwhelming backlog.
- **Target Personas**:
  - **Authenticated Learner** (Persona B - Minh, busy professional; Persona C - Linh, daily web reader) with the WordStreak Chrome Extension (Manifest V3) installed.
  - **Unauthenticated / Logged-Out User**: Extension installed but no active session token (`ws_token === null` or expired `401`); badge must remain hidden (`""`).
- **Success Metrics**:
  - **Primary Product Metric**: +15% increase in daily review session initiation from Extension users and reduced streak-break rate among active Extension installs.
  - **Operational & NFR Metrics**:
    - Badge update latency `< 500ms` on Popup open / Auth sync and `< 3.5s` (including 3s trailing debounce) after completing a review on the Web App.
    - Background network overhead `< 500 bytes` on `200 OK` and `0 bytes` body on `304 Not Modified` via `If-None-Match` ETag caching.
    - Zero unnecessary background polling wakes beyond the 30-minute fallback heartbeat (`ws-badge-periodic`) and dynamic `nextDueAt` one-shot alarm (`ws-badge-next-due`).

---

## Targeted Pillar Interview Decisions

### Pillar 2 & 6 — State Machine, Badge Formatting, Color Semantics & Offline Fallback
**Q1: Badge Display Formatting, Color Semantics & Unauthenticated/Offline Fallback** → **Decision**: **Option A (Confirmed)**
- **Badge Text Formatting**:
  - Hide badge (`chrome.action.setBadgeText({ text: "" })`) when `dueCount === 0` or when unauthenticated/logged out (`token === null` or `401 Unauthorized`).
  - Display exact integer string `"1"`..`"99"` when `1 <= dueCount <= 99`.
  - Cap display text at `"99+"` when `dueCount > 99` to fit Chrome's 4-character toolbar badge limit cleanly across macOS/Windows/Linux.
- **Badge Color Semantics**:
  - Default Due State (`dueCount > 0 && streakAtRisk === false`): Brand Purple background `#863BFF` with white text `#FFFFFF`.
  - Streak-At-Risk Urgency State (`dueCount > 0 && streakAtRisk === true`): Danger Red background `#EF4444` with white text `#FFFFFF`.
- **Transient Offline / Network Error Fallback**:
  - On `401 Unauthorized`: Clear `ws_token`, `ws_user`, and `ws_review_summary_cache` in `chrome.storage.local`, cancel `ws-badge-next-due` alarm, and clear the badge (`""`).
  - On transient network errors (`TypeError: Failed to fetch` / offline) or `5xx` server errors: Retain the last cached badge state from `ws_review_summary_cache` in `chrome.storage.local` (or leave the current toolbar badge unchanged) without wiping it out.

### Pillar 3 & 4 — Business Rules, Smart `chrome.alarms` Scheduling & ETag Caching
**Q2: Smart `chrome.alarms` Scheduling (`nextDueAt` vs. Periodic Fallback) & ETag Caching** → **Decision**: **Option A (Confirmed)**
- **Dual-Alarm Architecture**:
  - **Periodic Fallback Alarm (`ws-badge-periodic`)**: Created on `chrome.runtime.onInstalled` and ensured on `chrome.runtime.onStartup` with `periodInMinutes: 30` to catch external changes (reviews on mobile/other browsers or local midnight rollovers).
  - **Dynamic One-Shot Due Alarm (`ws-badge-next-due`)**: Whenever `summary.nextDueAt` is non-null, in the future (`Date.parse(nextDueAt) > Date.now()`), and sooner than the next 30-minute window (`Date.parse(nextDueAt) - Date.now() < 30 * 60 * 1000`), schedule/replace a one-shot alarm `ws-badge-next-due` with `when: Math.max(Date.now() + 60_000, Date.parse(nextDueAt))` (respecting Chrome MV3's 1-minute minimum alarm floor). If `nextDueAt` is `null` or `>= 30` minutes away, clear any existing `ws-badge-next-due` alarm.
- **Persistent ETag & Summary Cache (`ws_review_summary_cache`)**:
  - Store `{ summary: ReviewSummaryDto, etag: string | null, fetchedAt: string }` in `chrome.storage.local`.
  - On every `GET /api/reviews/summary` request, send `X-Timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC"` and, if cached `etag` exists, `If-None-Match: <etag>`.
  - On `200 OK`: Parse `ApiResponse<ReviewSummaryDto>`, read response `ETag` header, update `ws_review_summary_cache`, render badge, and reschedule `ws-badge-next-due`.
  - On `304 Not Modified`: Read `summary` from `ws_review_summary_cache`, update `fetchedAt`, re-verify badge state, and reschedule `ws-badge-next-due` without re-downloading payload.

### Pillar 4 — Workflows & Real-Time Web App → Extension Sync Bridge
**Q3: Web App → Extension Real-Time Badge Sync Trigger** → **Decision**: **Option A (Confirmed)**
- **Web App (`apps/web`) Event Emission**:
  - Emit `window.postMessage({ type: "WORDSTREAK_REVIEW_SYNC" }, "*")` after:
    1. Online flashcard review submission (`submitReview` in `useReviewSession.ts`).
    2. Offline review batch synchronization completion (`syncReviewBatch` in `reconnectionSyncEngine.ts`).
- **Content Script (`apps/extension/src/content/index.ts`) Relay**:
  - Listen for `event.data?.type === "WORDSTREAK_REVIEW_SYNC"` ( verifying `event.source === window`) and forward `{ type: "REFRESH_BADGE" }` via `chrome.runtime.sendMessage`.
- **Service Worker Debounce & Immediate Lifecycle Triggers**:
  - Rapid `REFRESH_BADGE` messages from content scripts are coalesced using a **3-second trailing debounce** (`3000ms`) in the background service worker so rapid card-by-card grading (`Space` + `1..4`) triggers a single summary fetch after the burst settles.
  - **Immediate (un-debounced) badge refresh** runs on:
    1. `chrome.runtime.onInstalled` and `chrome.runtime.onStartup`.
    2. `chrome.alarms.onAlarm` (`ws-badge-periodic` or `ws-badge-next-due`).
    3. Extension Popup open (`PopupApp` mount / `GET_AUTH_STATUS` or explicit `REFRESH_BADGE` with `immediate: true`).
    4. Quick-capture card creation (`QUICK_CAPTURE` in background or context menu).
    5. Authentication state changes (`LOGIN`, `SET_AUTH_TOKEN` via `WORDSTREAK_AUTH_SYNC`, and `LOGOUT` which immediately clears badge & cache).

---

## Assumptions Confirmed (`ASM-EDB-###`)

- **ASM-EDB-001**: `dueCount` from `GET /api/reviews/summary` (`ReviewSummaryDto.dueCount`) is the sole numeric source for the badge text (cards in active, non-archived decks with `status !== 'NEW'` and `nextReviewDate <= now`). `newAvailable` is not added to the badge count so the badge strictly reflects due reviews (`US-ECO-05` AC).
- **ASM-EDB-002**: Badge text is capped at `"99+"` for `dueCount > 99`, shows `"1"`..`"99"` for `1 <= dueCount <= 99`, and is set to `""` (hidden) when `dueCount === 0` or when unauthenticated.
- **ASM-EDB-003**: Badge background color uses `#863BFF` (Brand Purple) for normal due state (`dueCount > 0 && !streakAtRisk`) and `#EF4444` (Danger Red) for urgent streak-at-risk state (`dueCount > 0 && streakAtRisk`), with `#FFFFFF` badge text color where `chrome.action.setBadgeTextColor` is supported.
- **ASM-EDB-004**: Chrome MV3 imposes a 1-minute minimum delay on `chrome.alarms.create`; therefore any future `nextDueAt` timestamp less than 60 seconds away is clamped to `Date.now() + 60_000`, and any `nextDueAt` `>= 30` minutes away relies on the 30-minute `ws-badge-periodic` alarm until the window narrows.
- **ASM-EDB-005**: Backend CORS configuration (`apps/api/src/main.ts`) and `ReviewsController` expose the `ETag` response header so both `chrome-extension://` fetch requests and test clients can read `response.headers.get('etag')` and send `If-None-Match` on subsequent summary checks.
- **ASM-EDB-006**: User-configurable toggle to disable the badge (`US-ECO-07: Cài đặt nhắc học`) is deferred to `US-ECO-07`, though the storage settings model can optionally honor a default-true `showDueBadge?: boolean` flag if present.

---

## Open Questions (Not Yet Answered)

- None. All business value, UX, scheduling, caching, and cross-context sync rules are confirmed.
