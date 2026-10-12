# User Stories & Acceptance Criteria: Extension Due Cards Badge (`US-ECO-05`)

- **Feature Slug**: `extension-due-badge`
- **Version**: `1.0`
- **Date**: 2026-10-12
- **Upstream References**: [spec/srs.md](./srs.md), [03-domain-model.md](../03-domain-model.md), [04-risk-scope.md](../04-risk-scope.md)

---

### US-ECO-05: Badge số thẻ đến hạn trên icon Extension (Due Cards Toolbar Badge)

- **As an** Authenticated Learner with the WordStreak Chrome Extension installed
- **I want to** see the number of flashcards currently due for review on the Extension toolbar icon (and see it update automatically when I open the browser, open the popup, complete reviews on the Web App, or when scheduled cards become due)
- **So that** I have a frictionless visual reminder of pending reviews and streak urgency without having to open the Web App manually, while keeping the icon clean (`""`) when `dueCount = 0` or when I am logged out.
- **Traces to**: `REQ-EDB-001`, `REQ-EDB-002`, `REQ-EDB-003`, `REQ-EDB-004`, `REQ-EDB-005`, `REQ-EDB-006`, `REQ-EDB-007`, `REQ-EDB-008`, `REQ-EDB-009`

#### Acceptance Criteria (Given-When-Then)

- **Scenario 1: Browser startup or Extension install displays normal due count (`1..99`) in Brand Purple (`REQ-EDB-001`, `REQ-EDB-002`, `REQ-EDB-005`, `REQ-EDB-009`)**
  - **Given** the learner is authenticated (`ws_token` is present in `chrome.storage.local`)
  - **And** `GET /api/reviews/summary` returns `200 OK` with `dueCount: 18`, `streakAtRisk: false`, and `nextDueAt: null`
  - **When** Chrome fires `chrome.runtime.onStartup` or `chrome.runtime.onInstalled`
  - **Then** the Extension ensures the `"ws-badge-periodic"` alarm (`periodInMinutes: 30`) is registered
  - **And** sets the toolbar badge text to `"18"` with background color `#863BFF` (Brand Purple) and text color `#FFFFFF`.

- **Scenario 2: Badge caps at `"99+"` and shifts to Danger Red when `streakAtRisk` is true (`REQ-EDB-001`, `REQ-EDB-002`)**
  - **Given** the learner is authenticated
  - **When** `GET /api/reviews/summary` returns `dueCount: 142` and `streakAtRisk: true`
  - **Then** the Extension sets the toolbar badge text to `"99+"`
  - **And** sets the toolbar badge background color to `#EF4444` (Danger Red) with text color `#FFFFFF`.

- **Scenario 3: Badge hides (`""`) when `dueCount === 0` (`REQ-EDB-001`)**
  - **Given** the toolbar badge currently displays `"5"`
  - **When** `GET /api/reviews/summary` returns `dueCount: 0` (regardless of `newAvailable` or `streakAtRisk`)
  - **Then** the Extension calls `chrome.action.setBadgeText({ text: "" })` so no badge overlay is shown on the toolbar icon.

- **Scenario 4: Dynamic one-shot alarm (`ws-badge-next-due`) scheduled from `nextDueAt` (`REQ-EDB-006`)**
  - **Given** `GET /api/reviews/summary` returns `dueCount: 0` and `nextDueAt` equal to 12 minutes in the future (`now + 12m`)
  - **When** the summary response is processed by the background service worker
  - **Then** the Extension schedules the one-shot alarm `"ws-badge-next-due"` with `when` equal to `Date.parse(nextDueAt)` (clamped to `>= Date.now() + 60_000` if `< 60s` away)
  - **And** when `"ws-badge-next-due"` fires in `chrome.alarms.onAlarm`, the Extension immediately refreshes `GET /api/reviews/summary` and updates the badge.

- **Scenario 5: Conditional ETag (`If-None-Match`) caching & `304 Not Modified` on cold startup (`REQ-EDB-007`)**
  - **Given** `ws_review_summary_cache` in `chrome.storage.local` holds `{ summary: { dueCount: 7, streakAtRisk: false, nextDueAt: null, ... }, etag: 'W/"hash123"' }`
  - **When** a periodic alarm or cold browser startup triggers a badge refresh
  - **Then** the Extension sends `GET /api/reviews/summary` with headers `If-None-Match: W/"hash123"` and `X-Timezone: <IANA timezone>`
  - **And** when the backend responds with `304 Not Modified`, the Extension re-applies badge text `"7"` and background color `#863BFF` from `ws_review_summary_cache.summary` without downloading a response body.

- **Scenario 6: Real-time Web App review sync with 3-second trailing debounce (`REQ-EDB-008`, `REQ-EDB-009`)**
  - **Given** the learner has the WordStreak Web App open in a browser tab and grades 4 flashcards in rapid succession (within 2 seconds) or completes an offline batch sync
  - **When** the Web App posts `window.postMessage({ type: "WORDSTREAK_REVIEW_SYNC" }, "*")` after each review submission and the content script relays `{ type: "REFRESH_BADGE" }`
  - **Then** the background service worker coalesces the burst using a 3,000ms trailing debounce timer so `GET /api/reviews/summary` is called only once after 3 seconds of quiet
  - **And** updates the toolbar badge to the new `dueCount` (or clears it to `""` if `dueCount === 0`).

- **Scenario 7: Unauthenticated state, Web SSO Logout, or `401 Unauthorized` clears badge & cache (`REQ-EDB-003`)**
  - **Given** the Extension currently displays badge `"12"` and holds cached summary data in `ws_review_summary_cache`
  - **When** the learner logs out on the Web App (`WORDSTREAK_AUTH_SYNC` with `token: null` → `LOGOUT`), logs out in the Extension Popup, or `GET /api/reviews/summary` returns `401 Unauthorized`
  - **Then** the Extension clears `ws_token`, `ws_user`, and `ws_review_summary_cache` from `chrome.storage.local`, clears the `"ws-badge-next-due"` alarm, and sets the badge text to `""`.

- **Scenario 8: Offline / transient `5xx` network failure retains last cached badge (`REQ-EDB-004`)**
  - **Given** the learner is authenticated and `ws_review_summary_cache` has `dueCount: 9, streakAtRisk: false`
  - **When** an alarm fires while the computer is offline (`Failed to fetch`) or the API returns `503 Service Unavailable`
  - **Then** the Extension does not clear `ws_token` or `ws_review_summary_cache`
  - **And** retains the badge text `"9"` (`#863BFF`) from `ws_review_summary_cache` until the next successful online refresh.
