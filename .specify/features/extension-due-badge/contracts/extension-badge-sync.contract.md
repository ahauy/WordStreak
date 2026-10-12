# Interface & Messaging Contracts: Extension Due Cards Badge (`US-ECO-05`)

**Feature**: `US-ECO-05`: Badge số thẻ đến hạn trên icon Extension  
**Slug**: `extension-due-badge`  
**Version**: `1.0`  
**Date**: 2026-10-12

---

## 1. Contract Overview

`US-ECO-05` integrates three boundary contracts:
1. **HTTP Client → Backend REST Contract**: `ExtensionApiClient.getReviewSummary()` calling `GET /api/reviews/summary` with `Authorization`, `X-Timezone`, and `If-None-Match` headers, and reading the CORS-exposed `ETag` response header (`REQ-EDB-007`).
2. **Web App → Content Script `window.postMessage` Contract**: `WORDSTREAK_REVIEW_SYNC` emitted by `apps/web` after online review submission (`useReviewSession.ts`) and offline batch sync (`reconnectionSyncEngine.ts`) (`REQ-EDB-008`).
3. **Content Script / Popup → Background Service Worker `chrome.runtime.sendMessage` Contract**: `{ type: "REFRESH_BADGE", payload?: { immediate?: boolean } }` in `ExtensionMessage` (`REQ-EDB-008`, `REQ-EDB-009`).

---

## 2. HTTP Client Contract (`GET /api/reviews/summary` + CORS `ETag`)

### 2.1. Backend CORS Exposure (`apps/api/src/main.ts`)

To allow `fetch()` inside the Chrome Extension (`chrome-extension://<id>`) and Web App origins to read the `ETag` header across origins (`BR-EDB-007`, `RISK-EDB-003`), `app.enableCors` in [`apps/api/src/main.ts`](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/apps/api/src/main.ts) MUST expose `ETag`:

```typescript
app.enableCors({
  origin: (
    origin: string | undefined,
    callback: (err: Error | null, allow?: boolean) => void,
  ) => {
    if (isOriginAllowed(origin, allowedOrigins)) {
      callback(null, true);
    } else {
      callback(new Error(`Origin ${origin} not allowed by CORS`));
    }
  },
  credentials: true,
  exposedHeaders: ['ETag'],
});
```

### 2.2. `ExtensionApiClient.getReviewSummary` (`apps/extension/src/background/api-client.ts`)

```typescript
export type GetReviewSummaryResult =
  | {
      status: 200;
      summary: ReviewSummaryDto;
      etag: string | null;
    }
  | {
      status: 304;
      etag: string | null;
    };

export interface GetReviewSummaryOptions {
  etag?: string | null;
  timezone?: string;
}
```

- **Request**:
  - **URL**: `${this.baseUrl}/reviews/summary` (`GET`)
  - **Headers**:
    - `Authorization: Bearer <ws_token>`
    - `Accept: application/json`
    - `X-Timezone: <options?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC">`
    - `If-None-Match: <options.etag>` *(included only when `options?.etag` is a non-empty string)*
- **Response Handling**:
  - **`200 OK`**:
    - Parses JSON body as `ApiResponse<ReviewSummaryDto>` (or direct `ReviewSummaryDto` fallback if unwrapped).
    - Reads `etag = response.headers.get("etag") ?? response.headers.get("ETag") ?? null`.
    - Returns `{ status: 200, summary: payload, etag }`.
  - **`304 Not Modified`**:
    - Does **not** call `response.json()` (body is 0 bytes).
    - Reads `etag = response.headers.get("etag") ?? options?.etag ?? null`.
    - Returns `{ status: 304, etag }`.
  - **`401 Unauthorized`**:
    - Clears `ws_token`, `ws_user`, and `ws_review_summary_cache` via `extensionStorage`.
    - Throws `Error("UNAUTHORIZED: Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.")`.
  - **Other HTTP Errors (`5xx`, `4xx`) or Network `TypeError`**:
    - Throws `Error` without clearing `ws_token` or `ws_review_summary_cache` so `BadgeManager` can apply offline stale fallback (`BR-EDB-004`).

---

## 3. Web App → Content Script `window.postMessage` Contract (`BR-EDB-008`)

### 3.1. Event Payload (`WORDSTREAK_REVIEW_SYNC`)

Emitted on `window` by the WordStreak Web App (`apps/web`):

```typescript
export interface WordStreakReviewSyncPostMessage {
  type: "WORDSTREAK_REVIEW_SYNC";
}
```

### 3.2. Emission Points in `apps/web`

1. **Online Card Grading (`apps/web/src/features/reviews/hooks/useReviewSession.ts`)**:
   - Immediately after `await reviewsService.submitReview({ cardId: currentCard.cardId, rating })` resolves in `rateCard()`:
     ```typescript
     if (typeof window !== "undefined") {
       window.postMessage({ type: "WORDSTREAK_REVIEW_SYNC" }, "*");
     }
     ```
2. **Offline Reconnection Batch Sync (`apps/web/src/services/offline/reconnectionSyncEngine.ts`)**:
   - Inside `dispatchSyncCompleted(data: SyncReviewResponseDto)` (after `markReviewSynced` succeeds in `syncNow()`):
     ```typescript
     window.postMessage({ type: "WORDSTREAK_REVIEW_SYNC" }, "*");
     ```

### 3.3. Content Script Listener & Validation (`apps/extension/src/content/index.ts`)

- The content script MUST validate `event.source === window` before inspecting `event.data?.type`:
  ```typescript
  window.addEventListener("message", (event) => {
    if (event.source !== window) return;

    if (event.data?.type === "WORDSTREAK_AUTH_SYNC") {
      const token = event.data.token;
      if (token) {
        chrome.runtime.sendMessage({
          type: "SET_AUTH_TOKEN",
          payload: { token },
        });
      } else {
        chrome.runtime.sendMessage({ type: "LOGOUT" });
      }
    } else if (event.data?.type === "WORDSTREAK_REVIEW_SYNC") {
      chrome.runtime.sendMessage({ type: "REFRESH_BADGE" });
    }
  });
  ```
- **Security Invariant (`RISK-EDB-002`)**: No counts or user data from `event.data` are trusted; `WORDSTREAK_REVIEW_SYNC` is a pure cache-invalidation signal.

---

## 4. Extension Runtime Message Contract (`chrome.runtime.sendMessage`)

### 4.1. `REFRESH_BADGE` Message

- **Request**:
  ```typescript
  {
    type: "REFRESH_BADGE";
    payload?: {
      immediate?: boolean;
    };
  }
  ```
- **Behavior in `apps/extension/src/background/index.ts`**:
  - When `message.payload?.immediate === true`:
    - Calls `const summary = await badgeManager.refreshBadgeNow()`.
    - Responds with `{ success: true, data: { summary, debounced: false } }`.
  - When `message.payload?.immediate` is `false` or omitted (default from `WORDSTREAK_REVIEW_SYNC`):
    - Calls `badgeManager.scheduleDebouncedRefresh()` (3,000ms trailing debounce timer).
    - Responds immediately with `{ success: true, data: { debounced: true } }`.
