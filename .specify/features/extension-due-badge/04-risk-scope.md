# Risk Register & Scope Boundaries: Extension Due Cards Badge (`US-ECO-05`)

- **Feature Slug**: `extension-due-badge`
- **Stage**: Stage 5 — Risk & Contradiction Scanner
- **Date**: 2026-10-12
- **Source Artifacts**: [00-intake.md](./00-intake.md), [01-elicitation.md](./01-elicitation.md), [03-domain-model.md](./03-domain-model.md)

---

## 1. Contradiction Scan

- **Logic Contradictions**: **None found (0 unresolved).**
  - *Checked*: `BR-EDB-001` (hide badge when `dueCount === 0`) vs. `BR-EDB-002` (color shift when `streakAtRisk === true`). Because `BR-EDB-002` explicitly requires `dueCount > 0`, a user who has `dueCount === 0` (even if `studiedToday === 0`) will always have an empty badge `""` per `US-ECO-05` AC ("Ẩn khi `dueCount = 0`").
  - *Checked*: `BR-EDB-005` (`ws-badge-periodic` every 30 min) vs. `BR-EDB-006` (`ws-badge-next-due` one-shot alarm). Using two distinct alarm names (`"ws-badge-periodic"` and `"ws-badge-next-due"`) ensures that scheduling or clearing the dynamic one-shot alarm never cancels the 30-minute fallback heartbeat.
- **State Deadlocks**: **None found (0 unresolved).**
  - *Checked*: All states in the `AUTHENTICATED` composite state (`ZERO_DUE_HIDDEN`, `DUE_NORMAL_PURPLE`, `DUE_AT_RISK_RED`, `OFFLINE_STALE_PRESERVED`) transition back to `FETCHING_SUMMARY` on any alarm, Popup open, or `REFRESH_BADGE` message, and exit cleanly to `UNAUTHENTICATED_HIDDEN` on `LOGOUT` or `401 Unauthorized`.
- **Backward-Compatibility Risks**: **None found (0 unresolved).**
  - *Checked*: Extending `ExtensionMessage` union with `{ type: "REFRESH_BADGE"; payload?: { immediate?: boolean } }` and adding `STORAGE_KEYS.REVIEW_SUMMARY_CACHE` (`"ws_review_summary_cache"`) in `chrome.storage.local` are strictly additive and do not break existing `QUICK_CAPTURE`, `LOGIN`, `SET_AUTH_TOKEN`, or `FETCH_DECKS` flows.

---

## 2. Risk Register (`RISK-EDB-###`)

| ID | Category | Risk Description | Prob. | Impact | Mitigation Strategy |
| :--- | :--- | :--- | :---: | :---: | :--- |
| **RISK-EDB-001** | Technical (MV3 Alarms) | `summary.nextDueAt` is less than 60 seconds in the future or already in the past when received, causing `chrome.alarms.create` to delay or log a MV3 minimum-interval warning. | Med | Low | Per `BR-EDB-006`, only schedule `"ws-badge-next-due"` when `nextDueMs > Date.now()` and clamp `when: Math.max(Date.now() + 60_000, nextDueMs)`. |
| **RISK-EDB-002** | Technical / Anti-Abuse | Rapid flashcard grading on the Web App (or a malicious script posting `WORDSTREAK_REVIEW_SYNC` in a tight loop) floods the service worker and backend `GET /api/reviews/summary`. | Med | Med | Per `BR-EDB-008`, content script events are coalesced by a 3,000ms trailing debounce timer in the background service worker plus an in-flight Promise lock; payload data from `window.postMessage` is never trusted. |
| **RISK-EDB-003** | Technical (CORS / ETag) | `fetch()` in browser/extension contexts may not see the `ETag` response header if `Access-Control-Expose-Headers: ETag` is not configured in NestJS CORS. | Med | Low | Per `BR-EDB-007` and `ASM-EDB-005`, add `exposedHeaders: ['ETag']` to `app.enableCors(...)` in `apps/api/src/main.ts` so `response.headers.get('etag')` works reliably across all origins. |
| **RISK-EDB-004** | Operational (Browser Restart) | On cold browser startup (`chrome.runtime.onStartup`), Chrome resets the toolbar badge to `""` in memory, while `GET /api/reviews/summary` with `If-None-Match` returns `304 Not Modified`. | High | Med | Per `BR-EDB-007`, on `304 Not Modified`, the service worker always reads `ws_review_summary_cache.summary` from `chrome.storage.local` and explicitly calls `setBadgeText` and `setBadgeBackgroundColor`. |
| **RISK-EDB-005** | Technical (Browser API Compat) | Older Chromium forks may not implement `chrome.action.setBadgeTextColor`. | Low | Low | Guard `chrome.action.setBadgeTextColor?.({ color: '#FFFFFF' })` with optional chaining / try-catch so `setBadgeText` and `setBadgeBackgroundColor` always succeed. |

---

## 3. Consolidated Assumptions & Constraints

### Assumptions (`ASM-EDB-###`)
- **ASM-EDB-001**: `ReviewSummaryDto.dueCount` from `GET /api/reviews/summary` is the sole numeric source for the badge text (`newAvailable` is excluded).
- **ASM-EDB-002**: Badge text is `""` when `dueCount <= 0` or unauthenticated, `"1".."99"` for `1 <= dueCount <= 99`, and `"99+"` for `dueCount > 99`.
- **ASM-EDB-003**: Badge background color is `#863BFF` (Brand Purple) when `dueCount > 0 && !streakAtRisk` and `#EF4444` (Danger Red) when `dueCount > 0 && streakAtRisk`, with `#FFFFFF` text color.
- **ASM-EDB-004**: Periodic alarm `"ws-badge-periodic"` runs every 30 minutes (`periodInMinutes: 30`), complemented by one-shot alarm `"ws-badge-next-due"` clamped to `[now + 60s, now + 30m)`.
- **ASM-EDB-005**: Backend CORS exposes `ETag` (`exposedHeaders: ['ETag']`), and the Extension caches `{ summary, etag, fetchedAt }` in `chrome.storage.local` (`ws_review_summary_cache`) to send `If-None-Match` and `X-Timezone`.
- **ASM-EDB-006**: User-facing toggle to enable/disable the badge UI is deferred to `US-ECO-07` (Options Page), though badge logic defaults to enabled.

### Technical & Architectural Constraints
- **CON-EDB-001**: Chrome Extension Manifest V3 service workers are ephemeral and cannot rely on global in-memory variables surviving across alarm wakeups (`ws_review_summary_cache` MUST live in `chrome.storage.local`).
- **CON-EDB-002**: Zero database schema or migration changes allowed (`US-REM-01` backend endpoint is already deployed).

---

## 4. MoSCoW Scope Table

### Must-Have (P0 — Required for `US-ECO-05` Sign-Off)
- Add `"alarms"` permission to `apps/extension/manifest.json`.
- Shared contract updates in `packages/shared-types/src/extension.ts` (`ReviewSummaryCacheState`, `REFRESH_BADGE` message type).
- Persistent summary & ETag cache (`ws_review_summary_cache`) in `apps/extension/src/shared/storage.ts`.
- `ExtensionApiClient.getReviewSummary(etag?, timezone?)` in `apps/extension/src/background/api-client.ts` supporting `X-Timezone`, `If-None-Match`, `200 OK`, and `304 Not Modified` (plus `exposedHeaders: ['ETag']` in `apps/api/src/main.ts`).
- Dedicated badge & alarm manager module (`apps/extension/src/background/badge-manager.ts`) implementing `BR-EDB-001` through `BR-EDB-009` (badge text `"1".."99"` / `"99+"` / `""`, `#863BFF` / `#EF4444` colors, `ws-badge-periodic` 30-min alarm, `ws-badge-next-due` dynamic alarm, 3s trailing debounce, and offline stale cache fallback).
- Wire badge refresh into `onInstalled`, `onStartup`, `alarms.onAlarm`, `LOGIN`, `SET_AUTH_TOKEN`, `LOGOUT`, `GET_AUTH_STATUS`, and `QUICK_CAPTURE` in `apps/extension/src/background/index.ts`.
- Emit `window.postMessage({ type: "WORDSTREAK_REVIEW_SYNC" }, "*")` in `apps/web` after online review submission (`useReviewSession.ts`) and offline batch sync (`reconnectionSyncEngine.ts`), and relay via `apps/extension/src/content/index.ts`.
- Unit tests covering badge formatting, color selection, ETag `304` handling, `nextDueAt` alarm calculation, offline fallback, and 3s debounce.

### Should-Have (P1)
- Defensive optional chaining on `chrome.action.setBadgeTextColor` for cross-browser Chromium compatibility.

### Could-Have (P2)
- Honor optional `settings.showDueBadge !== false` flag in `ExtensionSettingsPayload` so `US-ECO-07` can wire its toggle without refactoring `badge-manager.ts`.

### Won't-Have (Explicitly Out of Scope for `US-ECO-05`)
- **System OS Notifications & Reminder Rules Engine** (`reminderRules.ts`, quiet hours, snooze buttons) — covered in `US-ECO-06`.
- **Extension Options Page UI for Reminder/Badge Settings** — covered in `US-ECO-07`.
- **In-Popup Micro-Review Flashcard UI (5-card quick study)** — covered in `US-ECO-08`.
- **Web Push / Email Notifications for Mobile/PWA** — covered in `US-ECO-09`.
