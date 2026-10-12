# Domain Decision Baseline: Extension Due Cards Badge (`US-ECO-05`)

- **Status**: `SIGNED-OFF (Ready for Confirmation Gate 1)`
- **Version**: `1.0`
- **Feature Slug**: `extension-due-badge`
- **Signed off by**: Customer (Stage 2 Interview Confirmed) & `business-analyst` (2026-10-12)

---

## 1. Business Summary & Problem Statement (Stages 1 & 2)

- **Classification**: **Bounded Task** (`0` new DB entities, `0` schema migrations, `1` Chrome Extension MV3 badge & alarm synchronization flow, `1` persona `Authenticated Learner`). See [00-intake.md](./00-intake.md).
- **Problem**: Learners with the WordStreak Chrome Extension installed lack an ambient toolbar badge showing how many flashcards are due (`dueCount`) or whether their study streak is at risk (`streakAtRisk`), leading to missed reviews unless they manually open the Web App.
- **Target Metrics**:
  - `+15%` daily review session initiation among Extension users.
  - Badge refresh latency `< 500ms` on immediate triggers (`onStartup`, `onInstalled`, Popup open, Auth sync) and `<= 3.5s` (3s trailing debounce + fetch) after Web App review activity.
  - Bandwidth overhead `< 500 bytes` on `200 OK` and `0 bytes` on `304 Not Modified` via persistent ETag caching.
- **Elicitation Record**: See [01-elicitation.md](./01-elicitation.md).

---

## 2. Approved Domain Model Summary (Stage 4)

- **Badge Text Formatting (`BR-EDB-001`)**:
  - `""` (hidden) when `dueCount <= 0` or when unauthenticated (`ws_token === null`).
  - `String(dueCount)` (`"1"`..`"99"`) when `1 <= dueCount <= 99`.
  - `"99+"` when `dueCount > 99`.
- **Badge Color Semantics (`BR-EDB-002`)**:
  - Brand Purple `#863BFF` (white text `#FFFFFF`) when `dueCount > 0 && streakAtRisk === false`.
  - Danger Red `#EF4444` (white text `#FFFFFF`) when `dueCount > 0 && streakAtRisk === true`.
- **Auth Cleanup & Offline Resilience (`BR-EDB-003`, `BR-EDB-004`)**:
  - Missing `ws_token`, `LOGOUT`, or `401 Unauthorized` clears `ws_token`, `ws_user`, and `ws_review_summary_cache` in `chrome.storage.local`, cancels `"ws-badge-next-due"`, and clears badge text (`""`).
  - Transient network errors (`Failed to fetch` / offline) or `5xx` responses preserve `ws_review_summary_cache` and retain the last cached badge state.
- **Dual-Alarm Scheduling (`BR-EDB-005`, `BR-EDB-006`)**:
  - Add `"alarms"` permission to `apps/extension/manifest.json`.
  - Recurring fallback alarm `"ws-badge-periodic"` (`periodInMinutes: 30`) ensured on `onInstalled` and `onStartup`.
  - Dynamic one-shot alarm `"ws-badge-next-due"` scheduled at `when: Math.max(Date.now() + 60_000, Date.parse(nextDueAt))` whenever `summary.nextDueAt` is in the future and `< 30` minutes away; cleared otherwise.
- **Persistent ETag Cache & Timezone (`BR-EDB-007`)**:
  - Cache `{ summary, etag, fetchedAt }` under `ws_review_summary_cache` in `chrome.storage.local`.
  - Send `X-Timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC"` and `If-None-Match: <etag>` on `GET /api/reviews/summary` (with backend CORS `exposedHeaders: ['ETag']`).
  - Reuse cached `summary` on `304 Not Modified` to re-render the badge and reschedule `"ws-badge-next-due"`.
- **Real-Time Web App → Extension Sync & Immediate Triggers (`BR-EDB-008`, `BR-EDB-009`)**:
  - Web App (`apps/web`) emits `window.postMessage({ type: "WORDSTREAK_REVIEW_SYNC" }, "*")` after online `submitReview` and offline `syncReviewBatch`.
  - Content script relays `{ type: "REFRESH_BADGE" }` to the background service worker, which applies a 3,000ms trailing debounce and single-flight deduplication.
  - Immediate (un-debounced) refresh runs on `onInstalled`, `onStartup`, `alarms.onAlarm`, Popup open (`GET_AUTH_STATUS`), `LOGIN`, `SET_AUTH_TOKEN`, and `QUICK_CAPTURE`.
- **Full Domain Model**: See [03-domain-model.md](./03-domain-model.md).

---

## 3. Scope Boundaries & Risk Register Summary (Stage 5)

- **Contradiction Scan**: Zero logic contradictions, zero state deadlocks, zero backward-compatibility breaks, zero DB migrations.
- **MoSCoW Summary**:
  - **Must-Have (P0)**: `"alarms"` permission in `manifest.json`; `ReviewSummaryCacheState` & `REFRESH_BADGE` in `@wordstreak/shared-types`; `ws_review_summary_cache` storage helper; `ExtensionApiClient.getReviewSummary` with `If-None-Match` / `X-Timezone` / `304` support + CORS `exposedHeaders: ['ETag']`; `badge-manager.ts` implementing `BR-EDB-001`..`009`; `WORDSTREAK_REVIEW_SYNC` emission in `apps/web` (`useReviewSession.ts`, `reconnectionSyncEngine.ts`) and content script relay; unit tests.
  - **Won't-Have (Out of Scope)**: OS notification popups & reminder rules engine (`US-ECO-06`), Extension Options Page reminder settings UI (`US-ECO-07`), In-Popup 5-card micro-review (`US-ECO-08`), Web Push / Email reminders (`US-ECO-09`).
- **Full Risk Assessment & Scope**: See [04-risk-scope.md](./04-risk-scope.md).

---

## 4. Specification & IEEE 29148 Validation Summary (Stages 6 & 7)

- **Formal Requirements & User Stories**: `REQ-EDB-001` through `REQ-EDB-009` in [spec/srs.md](./spec/srs.md) and Gherkin `US-ECO-05` (8 Given-When-Then scenarios) in [spec/user-stories.md](./spec/user-stories.md).
- **Validation Result**: `PASS` (8/8 IEEE 29148 criteria passed across all 9 REQs and `US-ECO-05`; unbroken traceability matrix). See [06-validation-report.md](./06-validation-report.md).

---

## 5. Handover Brief (Stage 8 — For Phase 2–4 `system-architect` & Phase 5 Implementation)

### What's Being Built
1. **Shared Types (`packages/shared-types/src/extension.ts`)**: Add `ReviewSummaryCacheState` interface and `{ type: "REFRESH_BADGE"; payload?: { immediate?: boolean } }` to `ExtensionMessage`.
2. **Backend CORS Header Exposure (`apps/api/src/main.ts`)**: Add `exposedHeaders: ['ETag']` to `app.enableCors(...)` so extension/browser fetch clients can read the `ETag` response header.
3. **Extension Storage & API Client (`apps/extension/src/shared/constants.ts`, `storage.ts`, `src/background/api-client.ts`)**: Add `STORAGE_KEYS.REVIEW_SUMMARY_CACHE = "ws_review_summary_cache"` storage getters/setters and `apiClient.getReviewSummary(options)` supporting `X-Timezone`, `If-None-Match`, `200 OK`, and `304 Not Modified`.
4. **Extension Badge & Alarm Manager (`apps/extension/manifest.json`, `src/background/badge-manager.ts`, `src/background/index.ts`)**: Add `"alarms"` permission, implement badge text/color formatting (`"1".."99"`, `"99+"`, `""`, `#863BFF`, `#EF4444`), dual alarms (`ws-badge-periodic` 30m + `ws-badge-next-due` dynamic one-shot), 3s trailing debounce, single-flight deduplication, and lifecycle hooks (`onInstalled`, `onStartup`, `onAlarm`, Auth, Popup open, Quick Capture).
5. **Web App → Extension Review Sync Bridge (`apps/web/src/features/reviews/hooks/useReviewSession.ts`, `apps/web/src/features/pwa-offline/services/reconnectionSyncEngine.ts`, `apps/extension/src/content/index.ts`)**: Post `WORDSTREAK_REVIEW_SYNC` after online review submission and offline batch sync, and relay `{ type: "REFRESH_BADGE" }` from the content script.

### What's Explicitly Out of Scope
- OS desktop notifications & `reminderRules.ts` (`US-ECO-06`).
- Options Page UI for reminder/badge toggles (`US-ECO-07`).
- Popup 5-card micro-review flashcard flow (`US-ECO-08`).

### Known Accepted Risks / Gaps
- None. All risks (`RISK-EDB-001`..`005`) have concrete code-level mitigations in [04-risk-scope.md](./04-risk-scope.md).

### Next Step
Present **Confirmation Gate 1** to the user, then dispatch `system-architect` (Phase 2–4) to generate `spec.md`, `plan.md`, and `tasks.md` in `.specify/features/extension-due-badge/`.
