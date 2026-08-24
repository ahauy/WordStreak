# Tasks Breakdown: Progressive Web App (PWA) & Offline Study Mode

- **Feature Slug**: `pwa-offline-mode`
- **Target User Story**: `US-ECO-04` (Epic: `EPIC-05: Ecosystem & Platform`)
- **Status**: READY FOR IMPLEMENTATION (Gate 2 Signed-Off)
- **Version**: 1.0
- **Date**: 2026-08-24
- **Lead BA / Architect**: Senior Business Analyst & Domain Architect

---

## Task Summary Table

| Phase       | Description                         | Tasks           | Parallel Tasks | Key Deliverables                                                         |
| :---------- | :---------------------------------- | :-------------- | :------------- | :----------------------------------------------------------------------- |
| **Phase 1** | Shared Types & PWA Infrastructure   | `T1.1` - `T1.5` | `T1.2`, `T1.4` | `pwa-offline.ts`, `vite.config.ts`, Web App Manifest, SW registration    |
| **Phase 2** | Client IndexedDB Storage Layer      | `T2.1` - `T2.4` | `T2.2`, `T2.3` | `offlineDatabase.ts`, `useOfflineDatabase.ts`, LRU eviction tests        |
| **Phase 3** | Backend Batch Sync & Reconciliation | `T3.1` - `T3.5` | `T3.1`         | `POST /api/v1/reviews/sync-batch`, `ReviewsSyncService`, streak backfill |
| **Phase 4** | Offline SM-2 & Reconnection Engine  | `T4.1` - `T4.5` | `T4.1`, `T4.4` | `clientSm2Engine.ts`, `reconnectionSyncEngine.ts`, `precacheManager.ts`  |
| **Phase 5** | UI Components & TTS Fallback        | `T5.1` - `T5.6` | `T5.1`, `T5.4` | `OfflineSyncPill.tsx`, `PwaInstallBanner.tsx`, `LogoutWarningModal.tsx`  |
| **Phase 6** | E2E Testing, Quality & Verification | `T6.1` - `T6.5` | `T6.1`, `T6.2` | Playwright E2E tests, Vitest/Jest suites, build verification             |

---

## Phase 1: Shared Types & PWA Infrastructure

- [ ] `T1.1`: Create `packages/shared-types/src/pwa-offline.ts` with `OfflineDeckEntity`, `OfflineCardEntity`, `ReviewQueueEntity`, `CachedMediaEntity`, `PwaPreferencesEntity`, `SyncReviewItemDto`, `SyncReviewBatchDto`, `SyncReviewResponseDto`, and `SyncConflictResolution`. Export in `packages/shared-types/src/index.ts` and verify build with `pnpm --filter @wordstreak/shared-types build`.
- [ ] `T1.2` [P]: Install `vite-plugin-pwa` and `idb` in `apps/web/package.json` (`pnpm --filter web add idb` and `pnpm --filter web add -D vite-plugin-pwa`).
- [ ] `T1.3`: Configure `apps/web/vite.config.ts` with `VitePWA` plugin:
  - `registerType: 'autoUpdate'`
  - Web App Manifest: `name: "WordStreak"`, `short_name: "WordStreak"`, `theme_color: "#000000"`, `background_color: "#ffffff"`, `display: "standalone"`, `orientation: "portrait-primary"`.
  - Icon sets: 192x192, 512x512 maskable and standard icons.
  - Workbox glob patterns precaching `.html`, `.js`, `.css`, `.woff2`, `.svg`, `.png`.
  - Google Fonts runtime caching with `CacheFirst` strategy.
- [ ] `T1.4` [P]: Add PWA meta tags in `apps/web/index.html` (`apple-mobile-web-app-capable`, `apple-mobile-web-app-status-bar-style`, `theme-color: #000000`) and verify public icons.
- [ ] `T1.5`: Implement `apps/web/src/pwa/registerServiceWorker.ts` with registration hooks, update notifications, and offline readiness handlers.

---

## Phase 2: Client IndexedDB Storage Layer (`idb`)

- [ ] `T2.1`: Implement `apps/web/src/services/offline/offlineDatabase.ts` using `idb` to open `WordStreakOfflineDB` (Version 1) with 5 stores:
  - `offline_decks` (keyPath: `id`)
  - `offline_cards` (keyPath: `id`, index: `by-deck` on `deckId`, index: `by-status` on `status`, index: `by-due-date` on `nextReviewDate`)
  - `review_queue` (keyPath: `id`, index: `by-status` on `status`, index: `by-client-time` on `reviewedAtClient`)
  - `cached_media` (keyPath: `url`, index: `by-accessed` on `lastAccessedAt`)
  - `pwa_preferences` (keyPath: `key`)
- [ ] `T2.2` [P]: Implement LRU eviction sweep and 50MB storage quota enforcement in `apps/web/src/services/offline/offlineDatabase.ts` (triggering at $\ge 45\text{MB}$ usage to sweep oldest audio blobs until $\le 35\text{MB}$).
- [ ] `T2.3` [P]: Implement `purgeOfflineDatabase()` for multi-user logout sanitization in `apps/web/src/services/offline/offlineDatabase.ts` and create `apps/web/src/hooks/useOfflineDatabase.ts`.
- [ ] `T2.4`: Write Vitest unit tests in `apps/web/src/services/offline/offlineDatabase.spec.ts` covering CRUD operations, index queries, storage quota calculations, LRU sweeps, and database deletion.

---

## Phase 3: Backend Batch Sync Endpoint & Streak Reconciliation

- [ ] `T3.1` [P]: Create DTOs `apps/api/src/modules/reviews/dto/sync-review-batch.dto.ts` and `sync-review-response.dto.ts` with `class-validator` rules (`@IsUUID('4')`, `@IsInt()`, `@Min(1)`, `@Max(4)`, `@IsISO8601()`, `@ArrayMaxSize(100)`).
- [ ] `T3.2`: Implement `ReviewsSyncService` in `apps/api/src/modules/reviews/reviews-sync.service.ts`:
  - Enforce monotonic review timestamps ($T_i < T_{i+1}$, $T_{\text{client}} \le T_{\text{server}} + 60\text{s}$).
  - Enforce 48h tolerance window ($T_{\text{server}} - T_{\text{reviewedAtClient}} \le 48\text{h}$) for streak backfills.
  - Reconcile missed calendar dates into `UserStreak` using `StreakService.recordActivity` and freeze checks.
  - Atomically upsert `UserCardProgress` and create immutable `ReviewLog` entries using Prisma `$transaction`.
  - Hard-cap awarded XP at 500 XP per batch payload via `XpService`.
  - Handle deleted cards gracefully (`DELETED_CARD_DROPPED` conflict record).
- [ ] `T3.3`: Expose `POST /api/v1/reviews/sync-batch` and alias `POST /api/v1/reviews/sync-offline` in `apps/api/src/modules/reviews/reviews.controller.ts` protected by `JwtAuthGuard`.
- [ ] `T3.4`: Register `ReviewsSyncService` in `apps/api/src/modules/reviews/reviews.module.ts`.
- [ ] `T3.5`: Write Jest unit tests in `apps/api/src/modules/reviews/reviews-sync.service.spec.ts` and `reviews.controller.spec.ts` covering happy path (<48h sync), stale sync (>48h), deleted cards, anti-abuse future timestamps, monotonicity checks, and 500 XP batch caps.

---

## Phase 4: Frontend Offline SM-2 & Reconnection Sync Engine

- [ ] `T4.1` [P]: Implement `ClientSm2Engine` in `apps/web/src/services/offline/clientSm2Engine.ts` guaranteeing exact 1:1 mathematical parity with backend `SrsService.calculateSm2` ($EF'$, repetitions, interval, grade mapping 1..4 -> 2..5).
- [ ] `T4.2`: Implement `PrecacheManager` in `apps/web/src/services/offline/precacheManager.ts`:
  - `autoPrecacheDueCards(userId)`: Fetches due cards from `/api/v1/reviews/due` on dashboard visit and saves to `offline_cards`.
  - `precacheFullDeck(deckId, userId)`: Fetches all cards and prefetches audio blobs into `cached_media`.
- [ ] `T4.3`: Implement `ReconnectionSyncEngine` in `apps/web/src/services/offline/reconnectionSyncEngine.ts`:
  - Reconnection listener on `window.addEventListener('online')` and `visibilitychange`.
  - Exponential backoff retry handler (5s, 15s, 30s, 60s) on network failures or HTTP 5xx.
  - Dispatch pending reviews in `review_queue` to `POST /api/v1/reviews/sync-batch`.
  - Atomic removal of successfully processed items from `review_queue`.
- [ ] `T4.4` [P]: Implement React hooks `apps/web/src/hooks/useNetworkStatus.ts` and `apps/web/src/hooks/useSyncQueue.ts`.
- [ ] `T4.5`: Write Vitest unit tests in `apps/web/src/services/offline/clientSm2Engine.spec.ts` and `reconnectionSyncEngine.spec.ts`.

---

## Phase 5: UI Components & TTS Fallback (WordStreak Design System)

- [ ] `T5.1` [P]: Implement `TtsAudioPlayer` in `apps/web/src/services/offline/ttsAudioPlayer.ts` and hook `apps/web/src/hooks/useTtsFallback.ts`:
  - Attempts playback from `cached_media` (or network stream).
  - Falls back to `window.speechSynthesis.speak()` with `SpeechSynthesisUtterance` (`lang: 'en-US'`) and sets `isTtsFallback: true`.
- [ ] `T5.2`: Implement `OfflineSyncPill.tsx` in `apps/web/src/components/pwa/OfflineSyncPill.tsx`:
  - Floating Obsidian pill in top navigation header.
  - Dynamic states: `Online` (subtle/hidden), `Offline • N queued`, `Syncing (N)...`, `All synced` (3s fade-out), `Sync paused`.
  - Strictly follows `apps/web/DESIGN.md` Obsidian pill styles (`rounded-full`, `#000000` background, pure white text, hairline `#e5e5e5` border).
- [ ] `T5.3`: Implement `PwaInstallBanner.tsx` in `apps/web/src/components/pwa/PwaInstallBanner.tsx` and context `apps/web/src/pwa/pwaInstallContext.tsx`:
  - Intercepts `beforeinstallprompt` event.
  - Appears at bottom of screen exclusively after 1st study session (`completedSessionsCount >= 1`).
  - Actions: `[Install App]`, `[Remind me later]` (7-day snooze in `pwa_preferences`), `[✕]` (dismissal).
- [ ] `T5.4` [P]: Implement `DeckOfflineToggle.tsx` in `apps/web/src/components/pwa/DeckOfflineToggle.tsx` on Deck Details page with badge `Offline Ready (N cards)`.
- [ ] `T5.5`: Implement `LogoutWarningModal.tsx` in `apps/web/src/components/pwa/LogoutWarningModal.tsx` displaying un-synced reviews warning, and wire `purgeOfflineDatabase()` into user logout handler.
- [ ] `T5.6`: Integrate offline card rating into Study Review screen container (`apps/web/src/features/reviews/ReviewSessionContainer.tsx`), seamlessly writing to `review_queue` when offline.

---

## Phase 6: E2E Testing, Quality & Verification

- [ ] `T6.1` [P]: Run and pass all backend Jest test suites: `pnpm --filter api test`.
- [ ] `T6.2` [P]: Run and pass all frontend Vitest test suites: `pnpm --filter web test`.
- [ ] `T6.3`: Implement Playwright E2E offline test in `apps/web/e2e/pwa-offline-sync.spec.ts`:
  - Simulate airplane mode (offline network throttling).
  - Rate flashcards offline and verify immediate <16ms transition and Topbar pill queue counter increment.
  - Restore network connectivity and verify automatic batch sync, streak reconciliation, and "All synced" transition.
  - Verify PWA install banner appears after 1st completed session and handles snooze.
  - Verify logout warning modal when un-synced reviews are present, and confirm complete database purge on logout.
- [ ] `T6.4`: Perform UI Design System & Anti-AI-Slop review against `apps/web/DESIGN.md` and `apps/web/MEMORY.md`.
- [ ] `T6.5`: Run full monorepo build and linting checks (`pnpm build` and `pnpm lint`).
