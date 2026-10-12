# Feature Specification: Extension Due Cards Badge (`US-ECO-05`)

**Feature Branch**: `feat/extension-due-badge`  
**Feature Slug**: `extension-due-badge`  
**Backlog Reference**: `US-ECO-05` (EPIC-06: Browser Extension & Ecosystem — Smart Reminders & Toolbar Badge)  
**Created**: 2026-10-12  
**Status**: Approved (Phase 2 - Specify)  
**Domain Baseline**: [`baseline.md`](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/.specify/features/extension-due-badge/baseline.md) (`SIGNED-OFF v1.0`)  
**Formal Requirements & User Stories**: [`spec/srs.md`](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/.specify/features/extension-due-badge/spec/srs.md), [`spec/user-stories.md`](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/.specify/features/extension-due-badge/spec/user-stories.md)

---

## 1. Executive Summary & Value Proposition

Learners who have the WordStreak Chrome Extension installed currently have no passive visual indicator on their browser toolbar showing how many vocabulary flashcards are due for review (`dueCount`) or whether their study streak is in danger of expiring (`streakAtRisk`). Unless they actively remember to open the WordStreak Web App, due cards accumulate and multi-day streaks are lost.

This specification defines the **Extension Due Cards Toolbar Badge & Dual-Alarm Synchronization Engine (`US-ECO-05`)**. Building on the lightweight `GET /api/reviews/summary` endpoint (`US-REM-01`), the Extension MV3 background service worker:
1. Renders a clean numeric toolbar badge (`"1"`..`"99"`, `"99+"`, or hidden `""` when `dueCount === 0` or logged out).
2. Shifts badge background color from Brand Purple (`#863BFF`) to Danger Red (`#EF4444`) when `streakAtRisk === true`.
3. Schedules a 30-minute periodic fallback alarm (`"ws-badge-periodic"`) plus a precision one-shot alarm (`"ws-badge-next-due"`) derived from `summary.nextDueAt`.
4. Persists Weak `ETag` and summary state (`ws_review_summary_cache`) in `chrome.storage.local` to achieve `0-byte` `304 Not Modified` revalidation and resilient offline fallback.
5. Synchronizes in near real-time (`<= 3.5s` via a 3,000ms trailing debounce) whenever the learner completes online or offline-synced reviews in the WordStreak Web App (`WORDSTREAK_REVIEW_SYNC`).

---

## 2. User Scenarios & Testing *(mandatory)*

### User Story 1 — Ambient Due Cards Toolbar Badge & Multi-Trigger Synchronization (`US-ECO-05`, Priority: P1 - MVP)

**As an** Authenticated Learner with the WordStreak Chrome Extension installed  
**I want to** see the number of flashcards currently due for review on the Extension toolbar icon (and see it update automatically when I open the browser, open the popup, complete reviews on the Web App, or when scheduled cards become due)  
**So that** I have a frictionless visual reminder of pending reviews and streak urgency without having to open the Web App manually, while keeping the icon clean (`""`) when `dueCount = 0` or when I am logged out.

**Why this priority**: Delivers the primary visual habit-retention cue of EPIC-06 on the browser toolbar while establishing the MV3 alarm, ETag cache, and Web App sync foundation required by downstream reminder stories (`US-ECO-06`..`08`).

**Independent Test**:
- Load the unpacked Extension in Chrome or run the Vitest suite for `badge-manager`, `api-client`, `storage`, and `useReviewSession`/`reconnectionSyncEngine`.
- Verify that authenticating sets the badge text (`"1"`..`"99"`, `"99+"`, or `""`) and color (`#863BFF` or `#EF4444`), schedules `"ws-badge-periodic"` and `"ws-badge-next-due"`, revalidates with `If-None-Match` (`304 Not Modified`), updates within ~3 seconds of Web App review grading, and clears on logout.

**Acceptance Scenarios**:

1. **Scenario 1 (Browser startup or Extension install displays normal due count `1..99` in Brand Purple — `REQ-EDB-001`, `REQ-EDB-002`, `REQ-EDB-005`, `REQ-EDB-009`)**:
   - **Given** the learner is authenticated (`ws_token` is present in `chrome.storage.local`) and `GET /api/reviews/summary` returns `200 OK` with `dueCount: 18`, `streakAtRisk: false`, and `nextDueAt: null`,
   - **When** Chrome fires `chrome.runtime.onStartup` or `chrome.runtime.onInstalled`,
   - **Then** the Extension ensures the `"ws-badge-periodic"` alarm (`periodInMinutes: 30`) is registered and sets the toolbar badge text to `"18"` with background color `#863BFF` (Brand Purple) and text color `#FFFFFF`.

2. **Scenario 2 (Badge caps at `"99+"` and shifts to Danger Red when `streakAtRisk` is true — `REQ-EDB-001`, `REQ-EDB-002`)**:
   - **Given** the learner is authenticated,
   - **When** `GET /api/reviews/summary` returns `dueCount: 142` and `streakAtRisk: true`,
   - **Then** the Extension sets the toolbar badge text to `"99+"` and sets the toolbar badge background color to `#EF4444` (Danger Red) with text color `#FFFFFF`.

3. **Scenario 3 (Badge hides `""` when `dueCount === 0` — `REQ-EDB-001`)**:
   - **Given** the toolbar badge currently displays `"5"`,
   - **When** `GET /api/reviews/summary` returns `dueCount: 0` (regardless of `newAvailable` or `streakAtRisk`),
   - **Then** the Extension calls `chrome.action.setBadgeText({ text: "" })` so no badge overlay is shown on the toolbar icon.

4. **Scenario 4 (Dynamic one-shot alarm `ws-badge-next-due` scheduled from `nextDueAt` — `REQ-EDB-006`)**:
   - **Given** `GET /api/reviews/summary` returns `dueCount: 0` and `nextDueAt` equal to 12 minutes in the future (`now + 12m`),
   - **When** the summary response is processed by the background service worker,
   - **Then** the Extension schedules the one-shot alarm `"ws-badge-next-due"` with `when` equal to `Date.parse(nextDueAt)` (clamped to `>= Date.now() + 60_000` if `< 60s` away), and when `"ws-badge-next-due"` fires in `chrome.alarms.onAlarm`, the Extension immediately refreshes `GET /api/reviews/summary` and updates the badge.

5. **Scenario 5 (Conditional ETag `If-None-Match` caching & `304 Not Modified` on cold startup — `REQ-EDB-007`)**:
   - **Given** `ws_review_summary_cache` in `chrome.storage.local` holds `{ summary: { dueCount: 7, streakAtRisk: false, nextDueAt: null, ... }, etag: 'W/"hash123"', fetchedAt: '...' }`,
   - **When** a periodic alarm or cold browser startup triggers a badge refresh,
   - **Then** the Extension sends `GET /api/reviews/summary` with headers `If-None-Match: W/"hash123"` and `X-Timezone: <IANA timezone>`, and when the backend responds with `304 Not Modified`, the Extension re-applies badge text `"7"` and background color `#863BFF` from `ws_review_summary_cache.summary` without downloading a response body.

6. **Scenario 6 (Real-time Web App review sync with 3-second trailing debounce — `REQ-EDB-008`, `REQ-EDB-009`)**:
   - **Given** the learner has the WordStreak Web App open in a browser tab and grades 4 flashcards in rapid succession (within 2 seconds) or completes an offline batch sync,
   - **When** the Web App posts `window.postMessage({ type: "WORDSTREAK_REVIEW_SYNC" }, "*")` after each review submission and the content script relays `{ type: "REFRESH_BADGE" }`,
   - **Then** the background service worker coalesces the burst using a 3,000ms trailing debounce timer so `GET /api/reviews/summary` is called only once after 3 seconds of quiet, and updates the toolbar badge to the new `dueCount` (or clears it to `""` if `dueCount === 0`).

7. **Scenario 7 (Unauthenticated state, Web SSO Logout, or `401 Unauthorized` clears badge & cache — `REQ-EDB-003`)**:
   - **Given** the Extension currently displays badge `"12"` and holds cached summary data in `ws_review_summary_cache`,
   - **When** the learner logs out on the Web App (`WORDSTREAK_AUTH_SYNC` with `token: null` → `LOGOUT`), logs out in the Extension Popup, or `GET /api/reviews/summary` returns `401 Unauthorized`,
   - **Then** the Extension clears `ws_token`, `ws_user`, and `ws_review_summary_cache` from `chrome.storage.local`, clears the `"ws-badge-next-due"` alarm, cancels any pending debounce timer, and sets the badge text to `""`.

8. **Scenario 8 (Offline / transient `5xx` network failure retains last cached badge — `REQ-EDB-004`)**:
   - **Given** the learner is authenticated and `ws_review_summary_cache` has `dueCount: 9, streakAtRisk: false`,
   - **When** an alarm fires while the computer is offline (`Failed to fetch`) or the API returns `503 Service Unavailable`,
   - **Then** the Extension does not clear `ws_token` or `ws_review_summary_cache` and retains/re-applies the badge text `"9"` (`#863BFF`) from `ws_review_summary_cache` without throwing an unhandled promise rejection.

---

## 3. Edge Cases & Boundary Matrix

| Edge Case ID | Boundary / Trigger Condition | Expected System Behavior | Business Rule |
| :--- | :--- | :--- | :--- |
| **EC-EDB-01** | **Badge 3-Digit Overflow (`dueCount === 99` vs `100`)**: `dueCount` transitions from `99` to `100` | `dueCount === 99` renders `"99"`; `dueCount >= 100` renders `"99+"` (never exceeding 3 chars in Chrome's 4-char badge slot). | `BR-EDB-001` |
| **EC-EDB-02** | **Zero Due Cards with `streakAtRisk === true` or `newAvailable > 0`**: `dueCount === 0`, `newAvailable === 25`, `streakAtRisk === true` | Badge text is set to `""` (hidden). `newAvailable` is excluded from badge text, and `BR-EDB-002` color shift applies only when `dueCount > 0`. | `BR-EDB-001`, `BR-EDB-002` |
| **EC-EDB-03** | **`nextDueAt` Less Than 60 Seconds in the Future (`0 < nextDueMs - now < 60_000`)**: Card becomes due in 25 seconds | `"ws-badge-next-due"` alarm is scheduled with `when: Date.now() + 60_000` (clamped to Chrome MV3's 60-second minimum delay floor). | `BR-EDB-006`, `RISK-EDB-001` |
| **EC-EDB-04** | **`nextDueAt` in the Past, `null`, or `>= 30 Minutes` Away**: `nextDueAt` is `null`, `<= now`, or `>= now + 30m` | Existing `"ws-badge-next-due"` alarm is cleared via `chrome.alarms.clear("ws-badge-next-due")`; `"ws-badge-periodic"` (30m) remains untouched. | `BR-EDB-005`, `BR-EDB-006` |
| **EC-EDB-05** | **Cold Browser Startup + `304 Not Modified`**: Chrome resets volatile toolbar badge state on restart while `ws_review_summary_cache` persists and server returns `304` | Service worker reads `ws_review_summary_cache.summary` from `chrome.storage.local` and explicitly re-applies `setBadgeText` and `setBadgeBackgroundColor`. | `BR-EDB-007`, `RISK-EDB-004` |
| **EC-EDB-06** | **Rapid Web App Review Burst + Immediate Trigger Interleaving**: 5 `REFRESH_BADGE` messages arrive within 2s, followed by Popup open (`GET_AUTH_STATUS`) | The immediate trigger cancels the pending 3s debounce timer and executes `refreshBadgeNow()` immediately, sharing any in-flight fetch Promise. | `BR-EDB-008`, `BR-EDB-009` |
| **EC-EDB-07** | **Cross-Browser `setBadgeTextColor` Availability**: Chromium derivative does not support `chrome.action.setBadgeTextColor` | Guarded via optional chaining and `try/catch` so `setBadgeText` and `setBadgeBackgroundColor` always succeed. | `BR-EDB-002`, `RISK-EDB-005` |
| **EC-EDB-08** | **Untrusted Cross-Frame `postMessage`**: An embedded third-party iframe posts `WORDSTREAK_REVIEW_SYNC` | Content script checks `event.source === window` before relaying, and background worker treats `REFRESH_BADGE` strictly as a debounced cache-invalidation signal. | `BR-EDB-008`, `RISK-EDB-002` |

---

## 4. Requirements *(mandatory)*

### Functional & Technical Requirements

- **REQ-EDB-001 (Badge Text Formatting & 4-Character Cap)**:
  - The Extension background service worker SHALL set the toolbar badge text (`chrome.action.setBadgeText`) based on `ReviewSummaryDto.dueCount`: `""` (hidden) when `dueCount <= 0` or when unauthenticated (`ws_token === null`); `String(dueCount)` when `1 <= dueCount <= 99`; and `"99+"` when `dueCount > 99`.
  - *Traces to*: `BR-EDB-001`, `ASM-EDB-001`, `ASM-EDB-002`.

- **REQ-EDB-002 (Badge Background & Text Color Semantics — `streakAtRisk`)**:
  - When `dueCount > 0`, the Extension background service worker SHALL set the toolbar badge background color (`chrome.action.setBadgeBackgroundColor`) to Brand Purple `#863BFF` when `streakAtRisk === false`, and to Danger Red `#EF4444` when `streakAtRisk === true`, with badge text color `#FFFFFF` via `chrome.action.setBadgeTextColor` (guarded for cross-browser compatibility).
  - *Traces to*: `BR-EDB-002`, `ASM-EDB-003`, `RISK-EDB-005`.

- **REQ-EDB-003 (Unauthenticated, Logout & `401` Session Expiry Cleanup)**:
  - When `ws_token` is `null` in `chrome.storage.local`, when a `LOGOUT` message is handled, or when `GET /api/reviews/summary` returns HTTP `401 Unauthorized`, the Extension SHALL remove `ws_token`, `ws_user`, and `ws_review_summary_cache` from `chrome.storage.local`, clear the `"ws-badge-next-due"` alarm, cancel any pending debounce timer, and set the toolbar badge text to `""`.
  - *Traces to*: `BR-EDB-003`, `ASM-EDB-002`.

- **REQ-EDB-004 (Offline & Transient `5xx` Network Error Resilience)**:
  - When `GET /api/reviews/summary` fails due to a network error (`TypeError` / offline) or an HTTP `5xx` status while `ws_token` is valid, the Extension SHALL preserve `ws_review_summary_cache` in `chrome.storage.local` and retain or re-apply the badge state derived from `ws_review_summary_cache.summary` without clearing the badge or throwing an unhandled promise rejection.
  - *Traces to*: `BR-EDB-004`, `RISK-EDB-004`.

- **REQ-EDB-005 (Periodic Fallback Alarm `ws-badge-periodic`)**:
  - `apps/extension/manifest.json` SHALL include the `"alarms"` permission, and the background service worker SHALL ensure a recurring alarm named `"ws-badge-periodic"` with `periodInMinutes: 30` is registered on both `chrome.runtime.onInstalled` and `chrome.runtime.onStartup`.
  - *Traces to*: `BR-EDB-005`, `ASM-EDB-004`.

- **REQ-EDB-006 (Dynamic One-Shot `nextDueAt` Alarm `ws-badge-next-due`)**:
  - After every `200 OK` or `304 Not Modified` summary check, if `summary.nextDueAt` is a valid future timestamp sooner than 30 minutes (`0 < Date.parse(nextDueAt) - Date.now() < 30 * 60 * 1000`), the service worker SHALL schedule a one-shot alarm named `"ws-badge-next-due"` with `when: Math.max(Date.now() + 60_000, Date.parse(nextDueAt))`; otherwise, it SHALL clear `"ws-badge-next-due"`.
  - *Traces to*: `BR-EDB-006`, `ASM-EDB-004`, `RISK-EDB-001`.

- **REQ-EDB-007 (Conditional ETag Caching `If-None-Match` / `304` & Timezone Header)**:
  - The Extension SHALL persist `ReviewSummaryCacheState` (`{ summary, etag, fetchedAt }`) under `ws_review_summary_cache` in `chrome.storage.local` and send `X-Timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC"` plus `If-None-Match: <etag>` (when `etag` is cached) to `GET /api/reviews/summary` (with backend CORS exposing `ETag`). On `200 OK`, it SHALL update `ws_review_summary_cache` with the new `summary` and `ETag`; on `304 Not Modified`, it SHALL reuse the cached `summary` to re-apply the badge and reschedule `"ws-badge-next-due"`.
  - *Traces to*: `BR-EDB-007`, `ASM-EDB-005`, `RISK-EDB-003`, `RISK-EDB-004`.

- **REQ-EDB-008 (Real-Time Web App → Extension Sync Bridge & 3-Second Trailing Debounce)**:
  - The Web App (`apps/web`) SHALL emit `window.postMessage({ type: "WORDSTREAK_REVIEW_SYNC" }, "*")` after online review submission (`submitReview`) and offline batch sync completion (`syncReviewBatch`). The Extension content script SHALL verify `event.source === window` and relay `{ type: "REFRESH_BADGE" }` to the background service worker, which SHALL coalesce non-immediate `REFRESH_BADGE` requests using a 3,000ms trailing debounce timer and single-flight request deduplication.
  - *Traces to*: `BR-EDB-008`, `RISK-EDB-002`.

- **REQ-EDB-009 (Immediate Lifecycle & User Action Refresh Triggers)**:
  - The Extension background service worker SHALL trigger an immediate (un-debounced) badge refresh on `chrome.runtime.onInstalled`, `chrome.runtime.onStartup`, `chrome.alarms.onAlarm` (`"ws-badge-periodic"` and `"ws-badge-next-due"`), `LOGIN`, `SET_AUTH_TOKEN`, `GET_AUTH_STATUS` (Popup open), and successful `QUICK_CAPTURE`.
  - *Traces to*: `BR-EDB-009`.

### Key Entities *(0 Database Schema Migrations)*

- **`ReviewSummaryCacheState`** (`packages/shared-types/src/extension.ts` & `chrome.storage.local["ws_review_summary_cache"]`): Stores `{ summary: ReviewSummaryDto, etag: string | null, fetchedAt: string }`.
- **`ExtensionMessage`** (`packages/shared-types/src/extension.ts`): Discriminated union extended with `{ type: "REFRESH_BADGE"; payload?: { immediate?: boolean } }`.
- **Chrome Alarms (`chrome.alarms`)**: `"ws-badge-periodic"` (`periodInMinutes: 30`) and `"ws-badge-next-due"` (`when: epochMs`).

---

## 5. Traceability Matrix

| Requirement ID | Business Rules | Assumptions / Risks | User Story / Scenarios | Target Files |
| :--- | :--- | :--- | :--- | :--- |
| **REQ-EDB-001** | `BR-EDB-001` | `ASM-EDB-001`, `ASM-EDB-002` | `US-ECO-05` (Scenarios 1, 2, 3) | `apps/extension/src/background/badge-manager.ts`, `badge-manager.spec.ts` |
| **REQ-EDB-002** | `BR-EDB-002` | `ASM-EDB-003`, `RISK-EDB-005` | `US-ECO-05` (Scenarios 1, 2) | `apps/extension/src/background/badge-manager.ts`, `badge-manager.spec.ts` |
| **REQ-EDB-003** | `BR-EDB-003` | `ASM-EDB-002` | `US-ECO-05` (Scenario 7) | `apps/extension/src/background/api-client.ts`, `badge-manager.ts`, `index.ts` |
| **REQ-EDB-004** | `BR-EDB-004` | `RISK-EDB-004` | `US-ECO-05` (Scenario 8) | `apps/extension/src/background/badge-manager.ts`, `badge-manager.spec.ts` |
| **REQ-EDB-005** | `BR-EDB-005` | `ASM-EDB-004` | `US-ECO-05` (Scenario 1) | `apps/extension/manifest.json`, `badge-manager.ts`, `index.ts` |
| **REQ-EDB-006** | `BR-EDB-006` | `ASM-EDB-004`, `RISK-EDB-001` | `US-ECO-05` (Scenario 4) | `apps/extension/src/background/badge-manager.ts`, `badge-manager.spec.ts` |
| **REQ-EDB-007** | `BR-EDB-007` | `ASM-EDB-005`, `RISK-EDB-003`, `RISK-EDB-004` | `US-ECO-05` (Scenario 5) | `apps/api/src/main.ts`, `apps/extension/src/shared/storage.ts`, `api-client.ts`, `badge-manager.ts` |
| **REQ-EDB-008** | `BR-EDB-008` | `RISK-EDB-002` | `US-ECO-05` (Scenario 6) | `apps/web/src/features/reviews/hooks/useReviewSession.ts`, `apps/web/src/services/offline/reconnectionSyncEngine.ts`, `apps/extension/src/content/index.ts`, `badge-manager.ts` |
| **REQ-EDB-009** | `BR-EDB-009` | — | `US-ECO-05` (Scenarios 1, 4, 6) | `apps/extension/src/background/index.ts`, `badge-manager.ts` |

---

## 6. Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001 (Fast Local Badge Rendering & Immediate Triggers)**: 100% of badge visual updates execute in `< 50ms` after receiving `200 OK` or `304 Not Modified`, with end-to-end badge refresh `< 500ms` on immediate triggers (`onStartup`, `onInstalled`, Popup open, Auth sync).
- **SC-002 (Near Real-Time Web App Review Sync & Coalescing)**: Completing 1 or more reviews on the Web App updates the Extension badge within `<= 3.5s` (`3,000ms` trailing debounce + fetch), while coalescing rapid card ratings to at most `1` API request per `3` seconds.
- **SC-003 (Zero-Byte Conditional Revalidation)**: Unchanged summary polls return HTTP `304 Not Modified` (`0 bytes` response body) using persistent `ws_review_summary_cache.etag` and re-apply the badge on cold browser startup.
- **SC-004 (100% Scenario & Branch Test Coverage)**: Automated unit tests cover all 8 Gherkin scenarios of `US-ECO-05` and edge cases `EC-EDB-01`..`EC-EDB-08` with zero unhandled promise rejections during offline/error states.

---

## 7. Assumptions & Scope Boundaries

- **Confirmed Assumptions**: `ASM-EDB-001` through `ASM-EDB-006` as signed off in [`baseline.md`](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/.specify/features/extension-due-badge/baseline.md) and [`04-risk-scope.md`](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/.specify/features/extension-due-badge/04-risk-scope.md).
- **In Scope (Must-Have P0)**:
  - `"alarms"` permission in `apps/extension/manifest.json`.
  - Shared types `ReviewSummaryCacheState` and `REFRESH_BADGE` in `packages/shared-types/src/extension.ts`.
  - Backend CORS `exposedHeaders: ['ETag']` in `apps/api/src/main.ts`.
  - Storage helpers (`getReviewSummaryCache`, `setReviewSummaryCache`) in `apps/extension/src/shared/storage.ts`.
  - `ExtensionApiClient.getReviewSummary` in `apps/extension/src/background/api-client.ts`.
  - `BadgeManager` in `apps/extension/src/background/badge-manager.ts` + lifecycle wiring in `apps/extension/src/background/index.ts`.
  - `WORDSTREAK_REVIEW_SYNC` postMessage bridge in `apps/web/src/features/reviews/hooks/useReviewSession.ts`, `apps/web/src/services/offline/reconnectionSyncEngine.ts`, and `apps/extension/src/content/index.ts`.
- **Out of Scope (Won't-Have in `US-ECO-05`)**:
  - OS desktop notifications & `reminderRules.ts` (`US-ECO-06`).
  - Extension Options Page UI for reminder/badge toggles (`US-ECO-07`).
  - In-Popup 5-card micro-review flashcard flow (`US-ECO-08`).
  - Web Push / Email notifications (`US-ECO-09`).
