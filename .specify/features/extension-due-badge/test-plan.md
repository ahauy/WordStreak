# Test Plan: Extension Due Cards Badge (`US-ECO-05`)

**Feature slug**: `extension-due-badge`  
**Baseline version**: 1.0 (SIGNED-OFF)  
**Written by**: AI (Antigravity) — Stage TDD (Code Explorer)  
**Traces to**: [`.specify/features/extension-due-badge/spec/user-stories.md`](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/.specify/features/extension-due-badge/spec/user-stories.md), [`spec/srs.md`](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/.specify/features/extension-due-badge/spec/srs.md), [`spec.md`](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/.specify/features/extension-due-badge/spec.md), [`plan.md`](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/.specify/features/extension-due-badge/plan.md)

> **Mục đích**: Tài liệu này định nghĩa toàn bộ 14 automated test cases (`TC-EDB-001`..`TC-EDB-014`) dưới chuẩn Gherkin BDD, bao quát toàn bộ 8 User Story Scenarios (`US-ECO-05`), 9 Yêu cầu Kỹ thuật (`REQ-EDB-001`..`REQ-EDB-009`), và 8 Boundary Edge Cases (`EC-EDB-01`..`EC-EDB-08`) trước khi implement code.
> Cung cấp hướng dẫn cụ thể về mock strategy, file paths và assertion criteria cho `backend-developer` và `frontend-developer`.

---

## Unit Tests

### 1. Extension Storage Module (`apps/extension/src/shared/`)

#### TC-EDB-001: Review Summary Cache Storage Persistence & Retrieval
```gherkin
Given chrome.storage.local (or localStorage fallback environment) is initialized
When  setReviewSummaryCache({ summary, etag: 'W/"hash123"', fetchedAt: '2026-10-12T08:00:00.000Z' }) is called
Then  chrome.storage.local persists data under key "ws_review_summary_cache"
  And getReviewSummaryCache() returns the exact cached state
  And getAll() includes reviewSummaryCache in its returned ExtensionStorageState
When  setReviewSummaryCache(null) is called
Then  getReviewSummaryCache() resolves to null
```
- **File**: [`apps/extension/src/shared/storage.spec.ts`](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/apps/extension/src/shared/storage.spec.ts)
- **Priority**: Must-Have (P0)
- **Status**: [x] Passed
- **Traces to**: `REQ-EDB-003`, `REQ-EDB-007`, `BR-EDB-007`
- **Mock Strategy**: Mock `chrome.storage.local.get`, `set`, and `remove` with an in-memory dictionary. Verify fallback when `chrome` is undefined.

---

### 2. Extension Background API Client (`apps/extension/src/background/`)

#### TC-EDB-002: API Client sends Authorization, X-Timezone, and If-None-Match headers on 200 OK
```gherkin
Given the learner is authenticated with valid ws_token "jwt-token-123"
  And fetch is mocked to return HTTP 200 OK with ReviewSummaryDto and header ETag 'W/"rev-abc"'
When  apiClient.getReviewSummary({ etag: 'W/"prev-etag"', timezone: "Asia/Ho_Chi_Minh" }) is called
Then  fetch is called with URL "http://localhost:3000/api/reviews/summary"
  And headers contain "Authorization: Bearer jwt-token-123"
  And headers contain "X-Timezone: Asia/Ho_Chi_Minh"
  And headers contain "If-None-Match: W/\"prev-etag\""
  And response resolves to { status: 200, summary: ReviewSummaryDto, etag: 'W/"rev-abc"' }
```
- **File**: [`apps/extension/src/background/api-client.spec.ts`](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/apps/extension/src/background/api-client.spec.ts)
- **Priority**: Must-Have (P0)
- **Status**: [x] Passed
- **Traces to**: `US-ECO-05` Scenario 1, `REQ-EDB-007`, `BR-EDB-007`
- **Mock Strategy**: Mock global `fetch` with `vi.fn()`, mock `extensionStorage.getToken()` returning `"jwt-token-123"`.

---

#### TC-EDB-003: API Client handles 304 Not Modified without JSON body parsing
```gherkin
Given the learner is authenticated with ws_token "jwt-token-123"
  And fetch is mocked to return HTTP 304 Not Modified with empty body and header ETag 'W/"cached-etag"'
When  apiClient.getReviewSummary({ etag: 'W/"cached-etag"' }) is called
Then  fetch response.json() is NOT called
  And response resolves to { status: 304, etag: 'W/"cached-etag"' }
```
- **File**: [`apps/extension/src/background/api-client.spec.ts`](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/apps/extension/src/background/api-client.spec.ts)
- **Priority**: Must-Have (P0)
- **Status**: [x] Passed
- **Traces to**: `US-ECO-05` Scenario 5, `REQ-EDB-007`, `BR-EDB-007`, `SC-003`
- **Mock Strategy**: Mock `fetch` returning `{ status: 304, ok: false, headers: new Headers({ etag: 'W/"cached-etag"' }) }`. Spy on `response.json` to verify zero invocations.

---

#### TC-EDB-004: API Client clears session storage and throws UNAUTHORIZED on 401
```gherkin
Given the learner has token "expired-token" and cached summary in chrome.storage.local
  And fetch is mocked to return HTTP 401 Unauthorized
When  apiClient.getReviewSummary() is called
Then  extensionStorage.setToken(null) is called
  And extensionStorage.setUser(null) is called
  And extensionStorage.setReviewSummaryCache(null) is called
  And the call rejects with an error matching /UNAUTHORIZED/
```
- **File**: [`apps/extension/src/background/api-client.spec.ts`](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/apps/extension/src/background/api-client.spec.ts)
- **Priority**: Must-Have (P0)
- **Status**: [x] Passed
- **Traces to**: `US-ECO-05` Scenario 7, `REQ-EDB-003`, `BR-EDB-003`
- **Mock Strategy**: Mock `fetch` returning `status: 401`, spy on `extensionStorage.setToken`, `setUser`, and `setReviewSummaryCache`.

---

### 3. Extension Badge Manager (`apps/extension/src/background/`)

#### TC-EDB-005: Badge Text Formatting & 4-Character Cap (`formatBadgeText`)
```gherkin
Given authentication state and dueCount values
When  formatBadgeText(dueCount, isAuthenticated) is evaluated
Then  it returns "" when isAuthenticated is false
  And it returns "" when dueCount <= 0 (e.g. 0, -1)
  And it returns exact string for 1..99 (e.g. 1 -> "1", 18 -> "18", 99 -> "99")
  And it returns "99+" when dueCount >= 100 (e.g. 100 -> "99+", 142 -> "99+")
```
- **File**: [`apps/extension/src/background/badge-manager.spec.ts`](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/apps/extension/src/background/badge-manager.spec.ts)
- **Priority**: Must-Have (P0)
- **Status**: [x] Passed
- **Traces to**: `US-ECO-05` Scenarios 1, 2, 3; `REQ-EDB-001`, `BR-EDB-001`, `EC-EDB-01`, `EC-EDB-02`
- **Mock Strategy**: Pure function unit testing against parameterized test table (`[dueCount, auth, expected]`).

---

#### TC-EDB-006: Badge Color Semantics & Cross-Browser Safeguards (`resolveBadgeColor` & `applyBadgeVisuals`)
```gherkin
Given a summary with dueCount > 0
When  streakAtRisk is false
Then  resolveBadgeColor returns Brand Purple "#863BFF"
  And chrome.action.setBadgeBackgroundColor is called with { color: "#863BFF" }
  And chrome.action.setBadgeTextColor is called with { color: "#FFFFFF" }
When  streakAtRisk is true
Then  resolveBadgeColor returns Danger Red "#EF4444"
  And chrome.action.setBadgeBackgroundColor is called with { color: "#EF4444" }
When  dueCount is 0
Then  chrome.action.setBadgeText is called with { text: "" }
  And chrome.action.setBadgeBackgroundColor is NOT called
When  chrome.action.setBadgeTextColor throws or is undefined
Then  applyBadgeVisuals completes successfully without throwing an unhandled exception
```
- **File**: [`apps/extension/src/background/badge-manager.spec.ts`](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/apps/extension/src/background/badge-manager.spec.ts)
- **Priority**: Must-Have (P0)
- **Status**: [x] Passed
- **Traces to**: `US-ECO-05` Scenarios 1, 2; `REQ-EDB-002`, `BR-EDB-002`, `EC-EDB-07`, `RISK-EDB-005`
- **Mock Strategy**: Mock `chrome.action.setBadgeText`, `setBadgeBackgroundColor`, and conditionally mock/delete `setBadgeTextColor`.

---

#### TC-EDB-007: Periodic 30-Minute Fallback Alarm Registration (`ensurePeriodicAlarm`)
```gherkin
Given Chrome initializes service worker on startup or install
When  badgeManager.ensurePeriodicAlarm() is executed
Then  chrome.alarms.create is called with name "ws-badge-periodic"
  And alarm options specify { periodInMinutes: 30 }
```
- **File**: [`apps/extension/src/background/badge-manager.spec.ts`](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/apps/extension/src/background/badge-manager.spec.ts)
- **Priority**: Must-Have (P0)
- **Status**: [x] Passed
- **Traces to**: `US-ECO-05` Scenario 1, `REQ-EDB-005`, `BR-EDB-005`
- **Mock Strategy**: Mock `chrome.alarms.create`.

---

#### TC-EDB-008: Dynamic One-Shot Alarm Scheduling & 60s Clamping (`computeNextDueAlarmTime` & `syncNextDueAlarm`)
```gherkin
Given current epoch nowMs = 1,000,000
When  nextDueAt is 12 minutes in future (nowMs + 720,000)
Then  computeNextDueAlarmTime returns 1,720,000
  And chrome.alarms.create is called with name "ws-badge-next-due" and { when: 1,720,000 }
When  nextDueAt is only 25 seconds in future (nowMs + 25,000)
Then  computeNextDueAlarmTime clamps to nowMs + 60,000 (1,060,000)
  And chrome.alarms.create is called with name "ws-badge-next-due" and { when: 1,060,000 }
When  nextDueAt is null, in past, or >= 30 minutes in future
Then  computeNextDueAlarmTime returns null
  And chrome.alarms.clear is called with "ws-badge-next-due"
```
- **File**: [`apps/extension/src/background/badge-manager.spec.ts`](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/apps/extension/src/background/badge-manager.spec.ts)
- **Priority**: Must-Have (P0)
- **Status**: [x] Passed
- **Traces to**: `US-ECO-05` Scenario 4, `REQ-EDB-006`, `BR-EDB-006`, `EC-EDB-03`, `EC-EDB-04`, `RISK-EDB-001`
- **Mock Strategy**: Mock `chrome.alarms.create`, `chrome.alarms.clear`, pass explicit `nowMs` into helper.

---

#### TC-EDB-009: Cold Browser Startup & 304 Cache Revalidation (`refreshBadgeNow`)
```gherkin
Given cold browser restart where volatile toolbar badge is cleared
  And ws_review_summary_cache contains { summary: { dueCount: 7, streakAtRisk: false, nextDueAt: null }, etag: 'W/"abc"' }
  And apiClient.getReviewSummary returns { status: 304, etag: 'W/"abc"' }
When  badgeManager.refreshBadgeNow() is executed
Then  chrome.action.setBadgeText is re-applied with "7"
  And chrome.action.setBadgeBackgroundColor is re-applied with "#863BFF"
  And syncNextDueAlarm is invoked with cached nextDueAt
```
- **File**: [`apps/extension/src/background/badge-manager.spec.ts`](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/apps/extension/src/background/badge-manager.spec.ts)
- **Priority**: Must-Have (P0)
- **Status**: [x] Passed
- **Traces to**: `US-ECO-05` Scenario 5, `REQ-EDB-007`, `BR-EDB-007`, `EC-EDB-05`, `RISK-EDB-004`
- **Mock Strategy**: Mock `extensionStorage.getToken` and `getReviewSummaryCache`, mock `apiClient.getReviewSummary` returning `status: 304`.

---

#### TC-EDB-010: Trailing 3,000ms Debounce & Immediate In-Flight Coalescing
```gherkin
Given Fake Timers are enabled in Vitest
When  scheduleDebouncedRefresh() is called 5 times rapidly within 2,000ms
Then  apiClient.getReviewSummary has NOT been called yet
When  vi.advanceTimersByTime(3,000) is executed
Then  apiClient.getReviewSummary is called exactly ONCE
When  a pending debounced timer is scheduled
  And refreshBadgeNow() is called immediately (e.g. Popup open)
Then  the pending 3,000ms timer is cancelled
  And refreshBadgeNow executes immediately without duplicate queries
```
- **File**: [`apps/extension/src/background/badge-manager.spec.ts`](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/apps/extension/src/background/badge-manager.spec.ts)
- **Priority**: Must-Have (P0)
- **Status**: [x] Passed
- **Traces to**: `US-ECO-05` Scenario 6, `REQ-EDB-008`, `REQ-EDB-009`, `BR-EDB-008`, `BR-EDB-009`, `EC-EDB-06`
- **Mock Strategy**: Use `vi.useFakeTimers()`, spy on `badgeManager.refreshBadgeNow` and `apiClient.getReviewSummary`.

---

#### TC-EDB-011: Unauthenticated State & Logout Reset (`clearAuthAndBadge`)
```gherkin
Given learner was authenticated with active badge "12" and cached summary
When  badgeManager.clearAuthAndBadge() is called (or refreshBadgeNow encountered missing token or 401)
Then  chrome.storage.local removes ws_token, ws_user, and ws_review_summary_cache
  And chrome.alarms.clear("ws-badge-next-due") is called
  And chrome.action.setBadgeText is called with { text: "" }
  And any pending debounce timer is cancelled
```
- **File**: [`apps/extension/src/background/badge-manager.spec.ts`](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/apps/extension/src/background/badge-manager.spec.ts)
- **Priority**: Must-Have (P0)
- **Status**: [x] Passed
- **Traces to**: `US-ECO-05` Scenario 7, `REQ-EDB-003`, `BR-EDB-003`
- **Mock Strategy**: Mock `chrome.action.setBadgeText`, `chrome.alarms.clear`, spy on `extensionStorage.setToken`, `setUser`, and `setReviewSummaryCache`.

---

#### TC-EDB-012: Offline & 5xx Transient Network Error Stale Badge Retention
```gherkin
Given learner is authenticated and ws_review_summary_cache has dueCount: 9, streakAtRisk: false
When  apiClient.getReviewSummary rejects with TypeError("Failed to fetch") or HTTP 503 error
Then  ws_review_summary_cache is NOT cleared
  And chrome.action.setBadgeText is retained / re-applied with "9"
  And chrome.action.setBadgeBackgroundColor is retained / re-applied with "#863BFF"
  And the method resolves with cached summary without throwing an unhandled rejection
```
- **File**: [`apps/extension/src/background/badge-manager.spec.ts`](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/apps/extension/src/background/badge-manager.spec.ts)
- **Priority**: Must-Have (P0)
- **Status**: [x] Passed
- **Traces to**: `US-ECO-05` Scenario 8, `REQ-EDB-004`, `BR-EDB-004`, `RISK-EDB-004`
- **Mock Strategy**: Mock `apiClient.getReviewSummary` rejecting with `new TypeError("Failed to fetch")` or `new Error("HTTP Error 503")`. Verify error does not bubble out.

---

### 4. Web App Real-Time Review Sync Bridge (`apps/web/`)

#### TC-EDB-013: Web App emits WORDSTREAK_REVIEW_SYNC on online submitReview (`useReviewSession`)
```gherkin
Given useReviewSession hook is active in online mode
  And window.postMessage is spied upon
When  rateCard(3) is called and reviewsService.submitReview succeeds
Then  window.postMessage is called with { type: "WORDSTREAK_REVIEW_SYNC" }
  And targetOrigin is "*"
```
- **File**: [`apps/web/src/features/reviews/hooks/useReviewSession.spec.ts`](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/apps/web/src/features/reviews/hooks/useReviewSession.spec.ts)
- **Priority**: Must-Have (P0)
- **Status**: [x] Passed
- **Traces to**: `US-ECO-05` Scenario 6, `REQ-EDB-008`, `BR-EDB-008`
- **Mock Strategy**: Use `renderHook` and `act` from `@testing-library/react`. Mock `reviewsService.getDueCards` and `reviewsService.submitReview`. Spy on `window.postMessage`.

---

#### TC-EDB-014: Web App emits WORDSTREAK_REVIEW_SYNC on batch offline sync completion (`reconnectionSyncEngine`)
```gherkin
Given reconnectionSyncEngine has pending reviews in IndexedDB
  And window.postMessage is spied upon
When  syncNow() succeeds via POST /reviews/sync-batch and triggers dispatchSyncCompleted()
Then  window.postMessage is called with { type: "WORDSTREAK_REVIEW_SYNC" }
  And targetOrigin is "*"
```
- **File**: [`apps/web/src/services/offline/__tests__/reconnectionSyncEngine.spec.ts`](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/apps/web/src/services/offline/__tests__/reconnectionSyncEngine.spec.ts)
- **Priority**: Must-Have (P0)
- **Status**: [x] Passed
- **Traces to**: `US-ECO-05` Scenario 6, `REQ-EDB-008`, `BR-EDB-008`
- **Mock Strategy**: Spy on `window.postMessage` in existing test suite `ReconnectionSyncEngine`. Mock `apiClient.post` resolving with `SyncReviewResponseDto`.

---

## Integration Tests & Cross-Module Verification

### 1. Backend CORS Header Exposure (`apps/api/src/main.ts`)

#### TC-EDB-INT-001: Backend exposes ETag header in CORS configuration
```gherkin
Given the NestJS server is configured with app.enableCors(...)
When  an HTTP request is made from a browser or Chrome extension origin
Then  Access-Control-Expose-Headers includes "ETag"
  And the client fetch response.headers.get("etag") is accessible
```
- **File**: [`apps/api/src/main.spec.ts`](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/apps/api/src/main.spec.ts)
- **Priority**: Must-Have (P0)
- **Status**: [x] Passed
- **Traces to**: `REQ-EDB-007`, `RISK-EDB-003`

---

### 2. Extension Content Script Message Isolation (`apps/extension/src/content/index.ts`)

#### TC-EDB-INT-002: Content script validates event.source === window before relaying
```gherkin
Given a message event is dispatched on window with { data: { type: "WORDSTREAK_REVIEW_SYNC" } }
When  event.source !== window (e.g. untrusted third-party iframe)
Then  the event is ignored and chrome.runtime.sendMessage is NOT called
When  event.source === window
Then  chrome.runtime.sendMessage is called with { type: "REFRESH_BADGE" }
```
- **File**: [`apps/extension/src/content/content-relay.spec.ts`](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/apps/extension/src/content/content-relay.spec.ts)
- **Priority**: High (P1)
- **Status**: [x] Passed
- **Traces to**: `REQ-EDB-008`, `EC-EDB-08`, `RISK-EDB-002`

---

### 3. Extension Background Message & Alarm Coordination (`apps/extension/src/background/`)

#### TC-EDB-INT-003: Background service worker handles REFRESH_BADGE message and alarms
```gherkin
Given the extension background worker is initialized
When  a "REFRESH_BADGE" message is received with payload { immediate: true }
Then  badgeManager.refreshBadgeNow() is called immediately
When  a "REFRESH_BADGE" message is received with debounced payload or empty payload
Then  badgeManager.scheduleDebouncedRefresh() is called
When  alarm "ws-badge-periodic" or "ws-badge-next-due" fires
Then  badgeManager.refreshBadgeNow() is invoked
```
- **File**: [`apps/extension/src/background/badge-manager.spec.ts`](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/apps/extension/src/background/badge-manager.spec.ts)
- **Priority**: High (P1)
- **Status**: [x] Passed
- **Traces to**: `REQ-EDB-005`, `REQ-EDB-008`, `REQ-EDB-009`

---

## Requirements Traceability Matrix

| Test Case ID | Target File | Scenario Mapping | Requirement Mapping | Edge Case Mapping | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **TC-EDB-001** | `apps/extension/src/shared/storage.spec.ts` | — | `REQ-EDB-003`, `REQ-EDB-007` | — | [x] Passed |
| **TC-EDB-002** | `apps/extension/src/background/api-client.spec.ts` | `Scenario 1` | `REQ-EDB-007` | — | [x] Passed |
| **TC-EDB-003** | `apps/extension/src/background/api-client.spec.ts` | `Scenario 5` | `REQ-EDB-007` | — | [x] Passed |
| **TC-EDB-004** | `apps/extension/src/background/api-client.spec.ts` | `Scenario 7` | `REQ-EDB-003` | — | [x] Passed |
| **TC-EDB-005** | `apps/extension/src/background/badge-manager.spec.ts` | `Scenario 1`, `Scenario 2`, `Scenario 3` | `REQ-EDB-001` | `EC-EDB-01`, `EC-EDB-02` | [x] Passed |
| **TC-EDB-006** | `apps/extension/src/background/badge-manager.spec.ts` | `Scenario 1`, `Scenario 2`, `Scenario 3` | `REQ-EDB-002` | `EC-EDB-07` | [x] Passed |
| **TC-EDB-007** | `apps/extension/src/background/badge-manager.spec.ts` | `Scenario 1` | `REQ-EDB-005` | — | [x] Passed |
| **TC-EDB-008** | `apps/extension/src/background/badge-manager.spec.ts` | `Scenario 4` | `REQ-EDB-006` | `EC-EDB-03`, `EC-EDB-04` | [x] Passed |
| **TC-EDB-009** | `apps/extension/src/background/badge-manager.spec.ts` | `Scenario 5` | `REQ-EDB-007` | `EC-EDB-05` | [x] Passed |
| **TC-EDB-010** | `apps/extension/src/background/badge-manager.spec.ts` | `Scenario 6` | `REQ-EDB-008`, `REQ-EDB-009` | `EC-EDB-06` | [x] Passed |
| **TC-EDB-011** | `apps/extension/src/background/badge-manager.spec.ts` | `Scenario 7` | `REQ-EDB-003` | — | [x] Passed |
| **TC-EDB-012** | `apps/extension/src/background/badge-manager.spec.ts` | `Scenario 8` | `REQ-EDB-004` | — | [x] Passed |
| **TC-EDB-013** | `apps/web/src/features/reviews/hooks/useReviewSession.spec.ts` | `Scenario 6` | `REQ-EDB-008` | — | [x] Passed |
| **TC-EDB-014** | `apps/web/src/services/offline/__tests__/reconnectionSyncEngine.spec.ts` | `Scenario 6` | `REQ-EDB-008` | — | [x] Passed |
| **TC-EDB-INT-001** | `apps/api/src/main.spec.ts` | — | `REQ-EDB-007` | `RISK-EDB-003` | [x] Passed |
| **TC-EDB-INT-002** | `apps/extension/src/content/content-relay.spec.ts` | `Scenario 6` | `REQ-EDB-008` | `EC-EDB-08`, `RISK-EDB-002` | [x] Passed |
| **TC-EDB-INT-003** | `apps/extension/src/background/badge-manager.spec.ts` | `Scenario 1`, `Scenario 6` | `REQ-EDB-005`, `REQ-EDB-008`, `REQ-EDB-009` | — | [x] Passed |

---

## Test Execution Commands

| Scope | Command | Purpose | Result |
| :--- | :--- | :--- | :--- |
| **Extension Unit & Integration Tests** | `pnpm --filter @wordstreak/extension test` | Runs storage, api-client, badge-manager, content-relay Vitest suites | 5/5 files passed (45/45 tests) |
| **Web Sync Hook Tests** | `pnpm --filter web test src/features/reviews/hooks/useReviewSession.spec.ts` | Runs React hook review submission & postMessage test | Passed (2/2 tests) |
| **Web Offline Engine Tests** | `pnpm --filter web test src/services/offline/__tests__/reconnectionSyncEngine.spec.ts` | Runs reconnection sync engine postMessage test | Passed (5/5 tests) |
| **Backend CORS Tests** | `pnpm --filter api test -- main.spec.ts reviews` | Verifies allowed origins & exposed ETag header | 5/5 files passed (57/57 tests) |
| **All Touched Tests** | `pnpm --filter @wordstreak/extension test && pnpm --filter web test src/features/reviews/hooks/useReviewSession.spec.ts src/services/offline/__tests__/reconnectionSyncEngine.spec.ts && pnpm --filter api test -- main.spec.ts reviews` | Full verification | 100% Passed (109+ tests) |

---

## Test Coverage Checklist

- [x] **TC-EDB-001**: Review Summary Cache Storage Persistence & Retrieval (`storage.spec.ts`)
- [x] **TC-EDB-002**: API Client sends Authorization, X-Timezone, and If-None-Match headers (`api-client.spec.ts`)
- [x] **TC-EDB-003**: API Client handles 304 Not Modified without JSON body parsing (`api-client.spec.ts`)
- [x] **TC-EDB-004**: API Client clears session storage and throws UNAUTHORIZED on 401 (`api-client.spec.ts`)
- [x] **TC-EDB-005**: Badge Text Formatting & 4-Character Cap (`badge-manager.spec.ts`)
- [x] **TC-EDB-006**: Badge Color Semantics & Cross-Browser Safeguards (`badge-manager.spec.ts`)
- [x] **TC-EDB-007**: Periodic 30-Minute Fallback Alarm Registration (`badge-manager.spec.ts`)
- [x] **TC-EDB-008**: Dynamic One-Shot Alarm Scheduling & 60s Clamping (`badge-manager.spec.ts`)
- [x] **TC-EDB-009**: Cold Browser Startup & 304 Cache Revalidation (`badge-manager.spec.ts`)
- [x] **TC-EDB-010**: Trailing 3,000ms Debounce & Immediate In-Flight Coalescing (`badge-manager.spec.ts`)
- [x] **TC-EDB-011**: Unauthenticated State & Logout Reset (`badge-manager.spec.ts`)
- [x] **TC-EDB-012**: Offline & 5xx Transient Network Error Stale Badge Retention (`badge-manager.spec.ts`)
- [x] **TC-EDB-013**: Web App emits WORDSTREAK_REVIEW_SYNC on online submitReview (`useReviewSession.spec.ts`)
- [x] **TC-EDB-014**: Web App emits WORDSTREAK_REVIEW_SYNC on batch offline sync completion (`reconnectionSyncEngine.spec.ts`)
- [x] **TC-EDB-INT-001**: Backend exposes ETag header in CORS configuration (`apps/api/src/main.spec.ts`)
- [x] **TC-EDB-INT-002**: Content script validates event.source === window before relaying (`content-relay.spec.ts`)
- [x] **TC-EDB-INT-003**: Background service worker handles REFRESH_BADGE message and alarms (`badge-manager.spec.ts`)
- [x] Tất cả `US-ECO-05` Scenario 1..8 có TC tương ứng (`TC-EDB-002`, `TC-EDB-005`, `TC-EDB-006`, `TC-EDB-007`, `TC-EDB-008`, `TC-EDB-009`, `TC-EDB-010`, `TC-EDB-011`, `TC-EDB-012`, `TC-EDB-013`, `TC-EDB-014`)
- [x] Tất cả yêu cầu `REQ-EDB-001` đến `REQ-EDB-009` được trace đầy đủ
- [x] Tất cả boundary edge cases `EC-EDB-01`..`EC-EDB-08` có assertion cụ thể
- [x] Error states (401 Unauthorized, 503 Server Error, TypeError / offline) có TC kiểm tra độc lập
- [x] Anti-abuse & Performance constraints (3,000ms debounce burst coalescing, single-flight deduplication, 60s minimum alarm clamping) được cover
- [x] Cross-browser compatibility (`chrome.action.setBadgeTextColor` try/catch fallback) có TC kiểm tra
