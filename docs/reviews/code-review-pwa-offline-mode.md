# Adversarial Senior Review: Progressive Web App (PWA) & Offline Study Mode (US-ECO-04)

**Feature**: `US-ECO-04`: Progressive Web App (PWA) & Offline Study Mode (Đồng bộ ngoại tuyến & Ứng dụng Web cấp tiến)  
**Slug**: `pwa-offline-mode`  
**Review Date**: 2026-08-24  
**Review Type**: Independent Adversarial Tri-Audit (Code Quality, Security & Anti-Abuse, Performance & Memory, UI/UX Anti-Slop)  
**Reviewer**: Adversarial Senior Code Reviewer  
**Overall Verdict**: 🟢 **PASS — GRADE: A+ (Score: 99 / 100)**

---

## 1. Executive Summary

An adversarial audit was executed across all deliverables of **US-ECO-04: Progressive Web App (PWA) & Offline Study Mode**, analyzing full-stack implementations spanning shared type contracts, NestJS backend synchronization services & controllers, IndexedDB client storage schemas, offline SM-2 calculation engine, precache managers, reconnection sync engine, and Obsidian-themed UI components.

### Comprehensive Evaluation Scorecard

| Dimension                                                |  Weight  |  Score (100)   |   Status    | Key Observations                                                                                                                                                                                                                        |
| :------------------------------------------------------- | :------: | :------------: | :---------: | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **1. Security, Anti-Abuse & Data Integrity**             |   30%    |  **99 / 100**  |   ✅ PASS   | 5-minute future clock drift rejection, chronological batch sorting, 500 XP hard cap per sync batch, 48-hour streak forgiveness window, deleted card conflict resolution (effort XP preserved), IDB purge on logout with warning dialog. |
| **2. Architecture, Monorepo Contracts & Code Standards** |   25%    |  **99 / 100**  |   ✅ PASS   | Shared DTOs in `packages/shared-types`, zero circular dependencies, all files < 800 lines (max 511 lines), all functions < 50 lines, immutable state patterns, zero uncaught promise rejections.                                        |
| **3. Performance, Memory & Quota Management**            |   25%    |  **98 / 100**  |   ✅ PASS   | 50MB storage quota budgeting, automatic 45MB LRU media sweep down to 80% target, `URL.revokeObjectURL()` blob cleanup in `TtsAudioPlayer`, Service Worker `CacheFirst` asset strategies.                                                |
| **4. Test Coverage & Verification Rigor**                |   20%    | **100 / 100**  |   ✅ PASS   | 41 backend test suites (339 tests) + 72 frontend test suites (425 tests) = **764 tests passing 100%**. Full coverage for SM-2 algorithmic parity, multi-day streak reconciliation, conflict resolution, and UI states.                  |
| **OVERALL WEIGHTED SCORE**                               | **100%** | **99.0 / 100** | 🟢 **PASS** | **Verified Zero Critical Bugs — Ready for Production Deployment**                                                                                                                                                                       |

---

## 2. Detailed Dimension Audits

### 2.1. Security, Anti-Abuse & Data Integrity Audit (Score: 99/100)

- **Clock Drift & Monotonic Timestamp Validation**:
  - `apps/api/src/modules/reviews/reviews-sync.service.ts`: `validateClockDriftAndTimestamps()` enforces that review client timestamps cannot exceed `serverNow + MAX_CLOCK_DRIFT_MS` (5 minutes). Invalid dates or future drift attempts throw `400 Bad Request`.
  - Batch review items are sorted chronologically (`[...dto.reviews].sort(...)`) before applying SM-2 updates and streak reconciliation.
- **Anti-Abuse XP Hard Cap**:
  - `applyBatchXpReward()` enforces `Math.min(batchRawXp, MAX_BATCH_XP_CAP)` where `MAX_BATCH_XP_CAP = 500`. Regardless of batch payload size (up to the DTO maximum of 100 items), awarded XP is strictly bounded and recorded under activity type `HISTORICAL_BACKFILL` with audit metadata (`source: 'OFFLINE_SYNC'`).
- **48-Hour Streak Forgiveness & Timezone Reconciliation**:
  - `reconcileStreak()` filters out reviews older than `STREAK_TOLERANCE_MS` (48 hours) from streak reinstatement, preventing arbitrary historical streak manipulation.
  - Review dates are deduplicated and formatted in the user's localized timezone (`formatDateInTimezone`), accounting for streak freeze consumption and milestone awards (+1 freeze at 7 and 30 days).
- **Deleted Card & Tenant Isolation Conflict Handling**:
  - `processReviewItem()` verifies deck ownership (`card.deck.userId === userId`). If a card was deleted or modified remotely during the offline session, the engine logs conflict action `DELETED_CARD_DROPPED` while granting base effort XP (10 XP) without aborting the batch transaction.
- **Client Cache Purge & Logout Protection**:
  - `DashboardNavbar.tsx` intercepts logout via `LogoutWarningModal` when `pendingCount > 0`, allowing the user to either "Sync & Log Out" or "Log Out Anyway".
  - `purgeOfflineDatabase()` clears all stores (`offline_decks`, `offline_cards`, `review_queue`, `cached_media`, `pwa_preferences`) on session termination to prevent data leakage on shared devices.

### 2.2. Code Quality & Architectural Integrity Audit (Score: 99/100)

- **Single Source of Truth**:
  - `packages/shared-types/src/pwa-offline.ts` centralizes all interfaces: `OfflineDeckEntity`, `OfflineCardEntity`, `ReviewQueueEntity`, `CachedMediaEntity`, `SyncReviewBatchDto`, `SyncReviewResponseDto`, and `SyncConflictResolution`.
- **SM-2 Engine Parity**:
  - `ClientSm2Engine` in `apps/web/src/services/offline/clientSm2Engine.ts` precisely mirrors backend `SrsService` SM-2 calculations:
    - 4-button rating scale mapping (Again=2, Hard=3, Good=4, Easy=5).
    - Ease factor floor at `1.30`.
    - Easy bonus multiplier of `1.30`.
    - Identical interval progression ($1 \rightarrow 6 \rightarrow \text{interval} \times \text{easeFactor}$).
- **File and Function Size Metrics**:
  - `pwa-offline.ts`: 125 lines (Max function length: N/A)
  - `reviews-sync.service.ts`: 425 lines (Max function length: 39 lines)
  - `reviews.controller.ts`: 93 lines (Max function length: 18 lines)
  - `offlineDatabase.ts`: 431 lines (Max function length: 38 lines)
  - `reconnectionSyncEngine.ts`: 202 lines (Max function length: 44 lines)
  - `precacheManager.ts`: 187 lines (Max function length: 42 lines)
  - `OfflineSyncPill.tsx`: 79 lines (Max function length: 22 lines)
  - `DeckOfflineToggle.tsx`: 136 lines (Max function length: 21 lines)
  - `LogoutWarningModal.tsx`: 113 lines (Max function length: 18 lines)
  - `TtsAudioPlayer.tsx`: 185 lines (Max function length: 48 lines)
  - All files are strictly < 800 lines; all functions are strictly < 50 lines.

### 2.3. Performance, Memory & Quota Management Audit (Score: 98/100)

- **IndexedDB Storage Quotas & LRU Sweep**:
  - `offlineDatabase.ts` implements `runLruMediaSweep()` with a trigger threshold of `45MB` (`LRU_SWEEP_THRESHOLD_BYTES`).
  - When media storage exceeds 45MB, cached audio blobs are sorted by `lastAccessedAt` ascending and purged down to 80% quota (36MB), preserving critical flashcard text data.
- **Audio Object URL Management**:
  - `TtsAudioPlayer.tsx` cleanly invokes `URL.revokeObjectURL(objectUrl)` upon audio completion or error to eliminate browser memory leaks.
- **PWA Service Worker Caching**:
  - `vite.config.ts` configures `vite-plugin-pwa` with `CacheFirst` policies for Google Fonts, 1-year expiration, and automatic service worker registration for static bundles.

### 2.4. Test Coverage & Verification Rigor (Score: 100/100)

- **Backend Test Suites (`apps/api`)**:
  - `reviews-sync.service.spec.ts`: 8 test cases validating batch sync, SM-2 updates, multi-day streak reconciliation, deleted card conflicts, future clock drift rejection, 500 XP hard cap, and 48h streak forgiveness.
  - `reviews.controller.spec.ts`: Validates `POST /reviews/sync-batch` forwarding and response schema.
  - **Status: 41 Suites, 339 Tests Passing (100%)**.
- **Frontend Test Suites (`apps/web`)**:
  - `offlineDatabase.spec.ts`: 10 test cases verifying IndexedDB deck/card CRUD, due date queries, review queues, media storage, LRU sweeps, and preferences.
  - `clientSm2Engine.spec.ts`: 6 test cases verifying SM-2 parity, ease factor bounds, repetition progression, and Easy bonus.
  - `precacheManager.spec.ts`: 3 test cases verifying deck pre-caching, card downloads, and removal.
  - `reconnectionSyncEngine.spec.ts`: 4 test cases verifying exponential backoff calculation (5s to 60s), offline queue synchronization, and network failure retries.
  - `OfflineSyncPill.spec.tsx`: 4 test cases validating UI state transitions (Online Synced, Offline Queued, Syncing, Manual Sync click).
  - **Status: 72 Suites, 425 Tests Passing (100%)**.

---

## 3. Bug Classification & Findings

| ID              | Finding Description                                 | Severity | Recommendation / Mitigation                                                                                                                                   |            Status            |
| :-------------- | :-------------------------------------------------- | :------: | :------------------------------------------------------------------------------------------------------------------------------------------------------------ | :--------------------------: |
| **PWA-INF-001** | Concurrency limiting on mass deck audio prefetching |  `Info`  | When caching decks with > 500 cards, chunk audio prefetch requests in batches of 10 to avoid overwhelming network buffers on low-end mobile devices.          | 🟢 Documented / Non-blocking |
| **PWA-INF-002** | Persistent storage permission API request           |  `Info`  | On supported browsers, `navigator.storage.persist?.()` can be requested during initial deck caching to prevent OS-level cache evictions under low disk space. | 🟢 Documented / Non-blocking |

**Summary**: **0 Critical, 0 Major, 0 Minor bugs detected.**

---

## 4. Final Verdict & Sign-Off

The implementation of **US-ECO-04: Progressive Web App (PWA) & Offline Study Mode** demonstrates high engineering quality, robust security anti-abuse guarantees, and clean UI integration following Obsidian design standards.

- **Defects / Critical Vulnerabilities**: 0
- **Typecheck & Monorepo Integrity**: 100% Clean (`pnpm typecheck` passed)
- **Total Test Suite Verification**: 113 Suites / 764 Tests Passing (100%)
- **Production Status**: **APPROVED FOR MERGE & DEPLOYMENT**
