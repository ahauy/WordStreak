# Software Requirements Specification (SRS): Extension Due Cards Badge (`US-ECO-05`)

- **Feature Slug**: `extension-due-badge`
- **Version**: `1.0`
- **Date**: 2026-10-12
- **Upstream References**: [01-elicitation.md](../01-elicitation.md), [03-domain-model.md](../03-domain-model.md), [04-risk-scope.md](../04-risk-scope.md)

---

## Functional & Technical Requirements (`REQ-EDB-###`)

### REQ-EDB-001: Badge Text Formatting & 4-Character Cap
- **Category**: Extension Toolbar UI
- **Priority**: Must-Have (P0)
- **Status**: Approved
- **Description**: The Extension background service worker SHALL set the toolbar badge text (`chrome.action.setBadgeText`) based on `ReviewSummaryDto.dueCount`: `""` (hidden) when `dueCount <= 0` or when unauthenticated (`ws_token === null`); `String(dueCount)` when `1 <= dueCount <= 99`; and `"99+"` when `dueCount > 99`.
- **Derived from**: `BR-EDB-001`, `ASM-EDB-001`, `ASM-EDB-002`
- **Business Rules**: `BR-EDB-001`
- **Non-Functional Requirements**: Badge render execution `< 50ms`.
- **Dependencies**: None

---

### REQ-EDB-002: Badge Background & Text Color Semantics (`streakAtRisk`)
- **Category**: Extension Toolbar UI
- **Priority**: Must-Have (P0)
- **Status**: Approved
- **Description**: When `dueCount > 0`, the Extension background service worker SHALL set the toolbar badge background color (`chrome.action.setBadgeBackgroundColor`) to Brand Purple `#863BFF` when `streakAtRisk === false`, and to Danger Red `#EF4444` when `streakAtRisk === true`, with badge text color `#FFFFFF` via `chrome.action.setBadgeTextColor` (guarded for cross-browser compatibility).
- **Derived from**: `BR-EDB-002`, `ASM-EDB-003`, `RISK-EDB-005`
- **Business Rules**: `BR-EDB-002`
- **Non-Functional Requirements**: High-contrast `#FFFFFF` foreground text on `#863BFF` and `#EF4444` backgrounds.
- **Dependencies**: `REQ-EDB-001`

---

### REQ-EDB-003: Unauthenticated, Logout & `401` Session Expiry Cleanup
- **Category**: Authentication & Security
- **Priority**: Must-Have (P0)
- **Status**: Approved
- **Description**: When `ws_token` is `null` in `chrome.storage.local`, when a `LOGOUT` message is handled, or when `GET /api/reviews/summary` returns HTTP `401 Unauthorized`, the Extension SHALL remove `ws_token`, `ws_user`, and `ws_review_summary_cache` from `chrome.storage.local`, clear the `"ws-badge-next-due"` alarm, cancel any pending debounce timer, and set the toolbar badge text to `""`.
- **Derived from**: `BR-EDB-003`, `ASM-EDB-002`
- **Business Rules**: `BR-EDB-003`
- **Non-Functional Requirements**: Zero unauthenticated requests sent to `GET /api/reviews/summary` when `ws_token === null`.
- **Dependencies**: `REQ-EDB-001`

---

### REQ-EDB-004: Offline & Transient `5xx` Network Error Resilience
- **Category**: Resiliency & Offline Fallback
- **Priority**: Must-Have (P0)
- **Status**: Approved
- **Description**: When `GET /api/reviews/summary` fails due to a network error (`TypeError` / offline) or an HTTP `5xx` status while `ws_token` is valid, the Extension SHALL preserve `ws_review_summary_cache` in `chrome.storage.local` and retain or re-apply the badge state derived from `ws_review_summary_cache.summary` without clearing the badge or throwing an unhandled promise rejection.
- **Derived from**: `BR-EDB-004`, `RISK-EDB-004`
- **Business Rules**: `BR-EDB-004`
- **Non-Functional Requirements**: Zero uncaught promise rejections in MV3 service worker inspector during offline browsing.
- **Dependencies**: `REQ-EDB-001`, `REQ-EDB-007`

---

### REQ-EDB-005: Periodic Fallback Alarm (`ws-badge-periodic`)
- **Category**: Background Scheduling (`chrome.alarms`)
- **Priority**: Must-Have (P0)
- **Status**: Approved
- **Description**: `apps/extension/manifest.json` SHALL include the `"alarms"` permission, and the background service worker SHALL ensure a recurring alarm named `"ws-badge-periodic"` with `periodInMinutes: 30` is registered on both `chrome.runtime.onInstalled` and `chrome.runtime.onStartup`.
- **Derived from**: `BR-EDB-005`, `ASM-EDB-004`
- **Business Rules**: `BR-EDB-005`
- **Non-Functional Requirements**: Complies with Chrome MV3 minimum alarm period (`>= 1` minute).
- **Dependencies**: None

---

### REQ-EDB-006: Dynamic One-Shot `nextDueAt` Alarm (`ws-badge-next-due`)
- **Category**: Background Scheduling (`chrome.alarms`)
- **Priority**: Must-Have (P0)
- **Status**: Approved
- **Description**: After every `200 OK` or `304 Not Modified` summary check, if `summary.nextDueAt` is a valid future timestamp sooner than 30 minutes (`0 < Date.parse(nextDueAt) - Date.now() < 30 * 60 * 1000`), the service worker SHALL schedule a one-shot alarm named `"ws-badge-next-due"` with `when: Math.max(Date.now() + 60_000, Date.parse(nextDueAt))`; otherwise, it SHALL clear `"ws-badge-next-due"`.
- **Derived from**: `BR-EDB-006`, `ASM-EDB-004`, `RISK-EDB-001`
- **Business Rules**: `BR-EDB-006`
- **Non-Functional Requirements**: Clamps `when` to at least `Date.now() + 60_000` (60s floor) to avoid MV3 alarm warnings.
- **Dependencies**: `REQ-EDB-005`, `REQ-EDB-007`

---

### REQ-EDB-007: Conditional ETag Caching (`If-None-Match` / `304`) & Timezone Header
- **Category**: API Integration & Caching
- **Priority**: Must-Have (P0)
- **Status**: Approved
- **Description**: The Extension SHALL persist `ReviewSummaryCacheState` (`{ summary, etag, fetchedAt }`) under `ws_review_summary_cache` in `chrome.storage.local` and send `X-Timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC"` plus `If-None-Match: <etag>` (when `etag` is cached) to `GET /api/reviews/summary` (with backend CORS exposing `ETag`). On `200 OK`, it SHALL update `ws_review_summary_cache` with the new `summary` and `ETag`; on `304 Not Modified`, it SHALL reuse the cached `summary` to re-apply the badge and reschedule `"ws-badge-next-due"`.
- **Derived from**: `BR-EDB-007`, `ASM-EDB-005`, `RISK-EDB-003`, `RISK-EDB-004`
- **Business Rules**: `BR-EDB-007`
- **Non-Functional Requirements**: Response payload size `0 bytes` on `304 Not Modified`; `< 500 bytes` on `200 OK`.
- **Dependencies**: `REQ-EDB-001`, `REQ-EDB-002`, `REQ-EDB-006`

---

### REQ-EDB-008: Real-Time Web App → Extension Sync Bridge & 3-Second Trailing Debounce
- **Category**: Cross-Context Synchronization
- **Priority**: Must-Have (P0)
- **Status**: Approved
- **Description**: The Web App (`apps/web`) SHALL emit `window.postMessage({ type: "WORDSTREAK_REVIEW_SYNC" }, "*")` after online review submission (`submitReview`) and offline batch sync completion (`syncReviewBatch`). The Extension content script SHALL verify `event.source === window` and relay `{ type: "REFRESH_BADGE" }` to the background service worker, which SHALL coalesce non-immediate `REFRESH_BADGE` requests using a 3,000ms trailing debounce timer and single-flight request deduplication.
- **Derived from**: `BR-EDB-008`, `RISK-EDB-002`
- **Business Rules**: `BR-EDB-008`
- **Non-Functional Requirements**: End-to-end badge sync after Web App review completion `<= 3.5s`; maximum 1 API request per 3 seconds during rapid card grading.
- **Dependencies**: `REQ-EDB-007`

---

### REQ-EDB-009: Immediate Lifecycle & User Action Refresh Triggers
- **Category**: Extension Lifecycle
- **Priority**: Must-Have (P0)
- **Status**: Approved
- **Description**: The Extension background service worker SHALL trigger an immediate (un-debounced) badge refresh on `chrome.runtime.onInstalled`, `chrome.runtime.onStartup`, `chrome.alarms.onAlarm` (`"ws-badge-periodic"` and `"ws-badge-next-due"`), `LOGIN`, `SET_AUTH_TOKEN`, `GET_AUTH_STATUS` (Popup open), and successful `QUICK_CAPTURE`.
- **Derived from**: `BR-EDB-009`
- **Business Rules**: `BR-EDB-009`
- **Non-Functional Requirements**: Immediate trigger cancels any pending 3s debounce timer and shares any in-flight fetch Promise.
- **Dependencies**: `REQ-EDB-005`, `REQ-EDB-006`, `REQ-EDB-007`, `REQ-EDB-008`
