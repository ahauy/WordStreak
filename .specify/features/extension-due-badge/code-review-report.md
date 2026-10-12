# Adversarial Code Review Report: Extension Due Cards Badge (`US-ECO-05`)

- **Feature Slug**: `extension-due-badge`
- **User Story**: `US-ECO-05` — Badge số thẻ đến hạn trên icon Extension
- **Reviewer**: `code-reviewer` (Phase 6A Adversarial Review — Fresh Context)
- **Date**: 2026-10-12
- **Review Verdict**: **APPROVED (0 Critical, 0 High, 0 Medium, 4 Low Findings)**

---

## 1. Executive Summary

An adversarial, line-by-line inspection was conducted across all 19 modified and newly created source and test files for **US-ECO-05 (`extension-due-badge`)** against:
1. [`baseline.md`](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/.specify/features/extension-due-badge/baseline.md) (`SIGNED-OFF v1.0`), [`spec.md`](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/.specify/features/extension-due-badge/spec.md), [`plan.md`](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/.specify/features/extension-due-badge/plan.md), and [`contracts/extension-badge-sync.contract.md`](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/.specify/features/extension-due-badge/contracts/extension-badge-sync.contract.md).
2. WordStreak Engineering & Governance Rules ([`GEMINI.md`](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/GEMINI.md)): immutable data patterns, KISS/DRY/YAGNI, file `< 800` lines, function `< 50` lines, boundary security validation, and explicit MV3 promise rejection safety.

### Severity Summary

| Severity | Count | Status |
| :--- | :---: | :--- |
| **Critical** | `0` | PASS (Zero Critical Permitted) |
| **High** | `0` | PASS |
| **Medium** | `0` | PASS |
| **Low** | `4` | Non-blocking hygiene & minor DRY observations |

---

## 2. Requirements & Business Rules Compliance Matrix (`BR-EDB-001`..`009` / `REQ-EDB-001`..`009`)

| ID | Requirement / Rule Summary | Implementation Evidence | Verdict |
| :--- | :--- | :--- | :---: |
| **REQ-EDB-001 / BR-EDB-001** | Badge text `""` when unauthenticated or `dueCount <= 0`; `"1".."99"` for `1..99`; `"99+"` for `> 99` (`newAvailable` excluded) | [`formatBadgeText`](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/apps/extension/src/background/badge-manager.ts#L6-L17) & [`applyBadgeVisuals`](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/apps/extension/src/background/badge-manager.ts#L46-L65); verified in [`badge-manager.spec.ts`](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/apps/extension/src/background/badge-manager.spec.ts#L31-L59) | ✅ PASS |
| **REQ-EDB-002 / BR-EDB-002** | Brand Purple `#863BFF` when `dueCount > 0 && !streakAtRisk`; Danger Red `#EF4444` when `dueCount > 0 && streakAtRisk`; white text `#FFFFFF` with `setBadgeTextColor` try/catch safeguard | [`resolveBadgeColor`](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/apps/extension/src/background/badge-manager.ts#L19-L21) & [`applyBadgeVisuals`](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/apps/extension/src/background/badge-manager.ts#L53-L64); verified in [`badge-manager.spec.ts`](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/apps/extension/src/background/badge-manager.spec.ts#L61-L131) | ✅ PASS |
| **REQ-EDB-003 / BR-EDB-003** | Missing `ws_token`, `LOGOUT`, or `401 Unauthorized` clears `ws_token`, `ws_user`, `ws_review_summary_cache`, cancels `"ws-badge-next-due"`, cancels debounce timer, and sets badge text `""` | [`extensionStorage.clearAuth`](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/apps/extension/src/shared/storage.ts#L91-L103), [`handleSummaryError`](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/apps/extension/src/background/api-client.ts#L173-L181), [`clearAuthAndBadge`](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/apps/extension/src/background/badge-manager.ts#L85-L93), [`handleRefreshError`](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/apps/extension/src/background/badge-manager.ts#L159-L167); verified in [`api-client.spec.ts`](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/apps/extension/src/background/api-client.spec.ts#L113-L136) & [`badge-manager.spec.ts`](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/apps/extension/src/background/badge-manager.spec.ts#L356-L401) | ✅ PASS |
| **REQ-EDB-004 / BR-EDB-004** | Offline (`TypeError`) or `5xx` errors preserve `ws_review_summary_cache` and retain/re-apply cached badge state without unhandled promise rejections | [`handleRefreshError`](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/apps/extension/src/background/badge-manager.ts#L169-L175); verified in [`badge-manager.spec.ts`](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/apps/extension/src/background/badge-manager.spec.ts#L403-L468) | ✅ PASS |
| **REQ-EDB-005 / BR-EDB-005** | `"alarms"` permission in `manifest.json` + `"ws-badge-periodic"` (`periodInMinutes: 30`) ensured on `onInstalled` and `onStartup` | [`manifest.json`](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/apps/extension/manifest.json#L6), [`ensurePeriodicAlarm`](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/apps/extension/src/background/badge-manager.ts#L67-L71), [`background/index.ts`](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/apps/extension/src/background/index.ts#L18-L53); verified in [`badge-manager.spec.ts`](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/apps/extension/src/background/badge-manager.spec.ts#L133-L157) | ✅ PASS |
| **REQ-EDB-006 / BR-EDB-006** | Dynamic one-shot alarm `"ws-badge-next-due"` scheduled when `0 < nextDueMs - now < 30m`, clamped to `Math.max(now + 60_000, nextDueMs)`, and cleared otherwise | [`computeNextDueAlarmTime`](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/apps/extension/src/background/badge-manager.ts#L23-L39) & [`syncNextDueAlarm`](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/apps/extension/src/background/badge-manager.ts#L73-L83); verified in [`badge-manager.spec.ts`](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/apps/extension/src/background/badge-manager.spec.ts#L159-L223) | ✅ PASS |
| **REQ-EDB-007 / BR-EDB-007** | Persistent `ws_review_summary_cache` (`{ summary, etag, fetchedAt }`), `X-Timezone` + `If-None-Match` headers, CORS `exposedHeaders: ['ETag']`, `304 Not Modified` 0-byte body handling & cold-startup badge re-application | [`getCorsOptions`](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/apps/api/src/main.ts#L54-L69), [`storage.ts`](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/apps/extension/src/shared/storage.ts#L54-L89), [`getReviewSummary`](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/apps/extension/src/background/api-client.ts#L193-L222), [`handleNotModifiedResult`](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/apps/extension/src/background/badge-manager.ts#L144-L157); verified in [`main.spec.ts`](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/apps/api/src/main.spec.ts#L179-L208), [`api-client.spec.ts`](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/apps/extension/src/background/api-client.spec.ts#L30-L111), [`badge-manager.spec.ts`](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/apps/extension/src/background/badge-manager.spec.ts#L225-L283) | ✅ PASS |
| **REQ-EDB-008 / BR-EDB-008** | Web App emits `WORDSTREAK_REVIEW_SYNC` after online `submitReview` and offline batch sync; content script verifies `event.source === window` and relays `REFRESH_BADGE`; background worker coalesces via 3,000ms trailing debounce & single-flight lock | [`useReviewSession.ts`](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/apps/web/src/features/reviews/hooks/useReviewSession.ts#L247-L249), [`reconnectionSyncEngine.ts`](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/apps/web/src/services/offline/reconnectionSyncEngine.ts#L166-L168), [`message-relay.ts`](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/apps/extension/src/content/message-relay.ts#L1-L19), [`scheduleDebouncedRefresh`](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/apps/extension/src/background/badge-manager.ts#L95-L103); verified in [`content-relay.spec.ts`](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/apps/extension/src/content/content-relay.spec.ts#L19-L42), [`useReviewSession.spec.ts`](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/apps/web/src/features/reviews/hooks/useReviewSession.spec.ts#L31-L89), [`reconnectionSyncEngine.spec.ts`](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/apps/web/src/services/offline/__tests__/reconnectionSyncEngine.spec.ts#L117-L154) | ✅ PASS |
| **REQ-EDB-009 / BR-EDB-009** | Immediate (un-debounced) badge refresh on `onInstalled`, `onStartup`, `onAlarm`, `LOGIN`, `SET_AUTH_TOKEN`, `GET_AUTH_STATUS`, `QUICK_CAPTURE`, and `{ type: "REFRESH_BADGE", payload: { immediate: true } }` | [`background/index.ts`](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/apps/extension/src/background/index.ts#L18-L221) & [`refreshBadgeNow`](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/apps/extension/src/background/badge-manager.ts#L105-L127) | ✅ PASS |

---

## 3. Security, Boundary Validation & Code Quality Audit

### 3.1. Security & Trust Boundaries
- **Cross-Frame `postMessage` Isolation (`EC-EDB-08`, `RISK-EDB-002`)**: [`handleWindowMessage`](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/apps/extension/src/content/message-relay.ts#L1-L4) enforces `if (typeof window !== "undefined" && event.source !== window) return;` before inspecting `event.data`. Embedded third-party iframes cannot trigger `REFRESH_BADGE` or `WORDSTREAK_AUTH_SYNC`.
- **Zero Trust on `postMessage` Data (`RISK-EDB-002`)**: `WORDSTREAK_REVIEW_SYNC` carries no payload that the extension trusts; it triggers a 3,000ms trailing-debounced `REFRESH_BADGE` signal, which fetches authoritative data from `GET /api/reviews/summary` using the stored `Bearer` JWT.
- **Session Expiry & Logout Cleanup (`BR-EDB-003`)**: Both explicit `LOGOUT` and `401 Unauthorized` responses atomically purge `ws_token`, `ws_user`, and `ws_review_summary_cache` from `chrome.storage.local`, cancel `"ws-badge-next-due"`, clear any pending debounce timer, and reset the badge text to `""`.
- **CORS Header Exposure (`RISK-EDB-003`)**: [`getCorsOptions`](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/apps/api/src/main.ts#L54-L69) exposes only `['ETag']` while preserving strict origin allowlist validation (`isOriginAllowed`).

### 3.2. Governance & Structural Limits (`GEMINI.md`)
- **File Size (`< 800` lines)**: All 19 inspected files are well below the 800-line ceiling (largest source file: `useReviewSession.ts` at 358 lines; largest new source file: `badge-manager.ts` at 201 lines; largest test file: `badge-manager.spec.ts` at 527 lines).
- **Function Size (`< 50` lines)**: Every newly added function and method in `badge-manager.ts`, `api-client.ts`, `storage.ts`, `message-relay.ts`, and `main.ts` is between 3 and 30 lines.
- **Immutability**: Cache updates in [`handleNotModifiedResult`](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/apps/extension/src/background/badge-manager.ts#L148-L152) and settings updates in [`storage.ts`](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/apps/extension/src/shared/storage.ts#L125) use immutable object spreads (`{ ...cached, ... }`) with zero in-place mutation.
- **MV3 Promise Rejection Safety**: All background `refreshBadgeNow()` invocations catch transient network/server errors internally inside [`executeRefresh`](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/apps/extension/src/background/badge-manager.ts#L185-L196), and `chrome.action.setBadgeTextColor` is guarded with optional chaining and `try/catch`.

---

## 4. Detailed Findings (`Low` Severity Only)

### [LOW-01] Redundant `typeof window !== "undefined"` check in `reconnectionSyncEngine.ts`
- **File**: [`apps/web/src/services/offline/reconnectionSyncEngine.ts`](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/apps/web/src/services/offline/reconnectionSyncEngine.ts#L163-L168)
- **Description**: `dispatchSyncCompleted` already returns early at line 164 (`if (typeof window === "undefined") return;`), making the nested `if (typeof window !== "undefined")` guard on line 166 redundant.
- **Recommendation**: Call `window.postMessage({ type: "WORDSTREAK_REVIEW_SYNC" }, "*");` directly after line 164 on a future cleanup pass.

### [LOW-02] Reuse `extensionStorage.clearAuth()` inside `ExtensionApiClient` `401` handlers
- **File**: [`apps/extension/src/background/api-client.ts`](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/apps/extension/src/background/api-client.ts#L63-L66) and [`lines 174-177`](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/apps/extension/src/background/api-client.ts#L174-L177)
- **Description**: `handleSummaryError` calls `setToken(null)`, `setUser(null)`, and `setReviewSummaryCache(null)` sequentially, and the generic `request()` method calls `setToken(null)` and `setUser(null)` on `401`. Delegating both to `await extensionStorage.clearAuth()` would batch the removal into a single `chrome.storage.local.remove` call and ensure a `401` on any other endpoint also purges `ws_review_summary_cache`.
- **Recommendation**: Replace manual `setToken(null)` / `setUser(null)` / `setReviewSummaryCache(null)` sequences on `401` with `await extensionStorage.clearAuth()`.

### [LOW-03] Residual `as any` casts in TDD unit test files
- **Files**: [`apps/extension/src/shared/storage.spec.ts`](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/apps/extension/src/shared/storage.spec.ts#L63-L111), [`apps/extension/src/background/api-client.spec.ts`](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/apps/extension/src/background/api-client.spec.ts#L43-L129), [`apps/extension/src/background/badge-manager.spec.ts`](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/apps/extension/src/background/badge-manager.spec.ts#L258-L265)
- **Description**: Several test assertions retain `(extensionStorage as any).getReviewSummaryCache()` and `(apiClient as any).getReviewSummary()` casts from the TDD Red phase before the methods were added to the implementation types.
- **Recommendation**: Remove the `as any` casts in test files so test calls benefit from direct TypeScript signature checking.

### [LOW-04] Defensive `Number.isFinite(dueCount)` guard in `formatBadgeText`
- **File**: [`apps/extension/src/background/badge-manager.ts`](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/apps/extension/src/background/badge-manager.ts#L6-L17)
- **Description**: If a malformed payload ever passed `NaN` for `dueCount`, `dueCount <= 0` and `dueCount > 99` would both evaluate to `false` and return `"NaN"`.
- **Recommendation**: Change `if (!isAuthenticated || dueCount <= 0)` to `if (!isAuthenticated || !Number.isFinite(dueCount) || dueCount <= 0)` for defense-in-depth.

---

## 5. Final Sign-Off

All 9 functional requirements (`REQ-EDB-001`..`REQ-EDB-009`), 9 business rules (`BR-EDB-001`..`BR-EDB-009`), 8 user story scenarios, and 8 boundary edge cases (`EC-EDB-01`..`EC-EDB-08`) are accurately implemented and covered by automated unit and integration tests with **zero Critical, High, or Medium defects**. The feature is approved to proceed to Phase 6B documentation and final sign-off.
