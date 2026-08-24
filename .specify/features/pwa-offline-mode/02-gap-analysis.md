# Gap Analysis: Progressive Web App (PWA) & Offline Study Mode

- **Feature Slug**: `pwa-offline-mode`
- **Target User Story**: `US-ECO-04`
- **Date**: 2026-08-24
- **Stage**: Stage 3 — Gap Analysis

---

## 1. AS-IS (Current State)

- **System Architecture**:
  - The application is a standard single-page React 19 application (`apps/web`) communicating via REST endpoints with a NestJS backend (`apps/api`).
  - No Service Worker or Web App Manifest (`manifest.json`) is configured for offline asset caching or home-screen installation.
- **Offline Behavior & Failure Modes**:
  - If a user loses internet connectivity (e.g. subway, airplane mode, elevator, dead zone), any interaction with `/api/v1/reviews/due`, `/api/v1/reviews/submit`, or `/api/v1/practice/*` immediately fails with network errors (`ERR_INTERNET_DISCONNECTED` / `Failed to fetch`).
  - Card flips during an active study session freeze or fail to load subsequent card assets.
  - Audio pronunciation playback fails when external audio URLs or CDN blobs cannot be fetched.
  - Reviews completed while offline cannot be saved or submitted; refreshing the page or closing the tab discards the entire session's progress.
- **Streak & Gamification Impact**:
  - Streak evaluation in `StreakService.recordActivity` relies entirely on real-time server timestamps (`new Date()`).
  - If a user studies while offline and cannot reconnect before local midnight, their streak is broken and reset to 0 (or burns an automatic streak freeze if available), causing significant user distress and churn.
- **Access & Distribution**:
  - Users must open a browser, type the URL, and authenticate. There is no standalone windowing, app icon on mobile home screens, or quick-launch capability.

---

## 2. TO-BE (Target State)

- **Offline-First PWA Architecture**:
  - A fully compliant Progressive Web App with a Web App Manifest and Service Worker (Workbox precaching for app shell/fonts/icons and runtime caching for API/media assets).
  - Installable directly to mobile home screens (iOS/Android) and desktop docks (macOS/Windows) with a standalone, full-screen minimalist experience.
- **Hybrid Storage & Pre-caching**:
  - Daily due cards (`status = NEW | LEARNING | DUE`) are automatically cached in client-side IndexedDB (`WordStreakOfflineDB`) upon visiting the dashboard.
  - Full decks can be pre-downloaded on demand via an intuitive "Make available offline" toggle.
  - IndexedDB storage is strictly capped at **50 MB** with automated LRU eviction for media blobs, protecting user device storage.
- **Seamless Local SM-2 Study & Native TTS Fallback**:
  - Users can complete full study sessions in airplane mode. Flashcard flips, SRS ratings, and interval calculations occur optimistically on the client (<16ms latency).
  - If an audio pronunciation MP3 is not pre-cached, the app immediately and gracefully falls back to the browser's native **Web Speech Synthesis API** (`speechSynthesis`), ensuring pronunciation is always audible.
- **Reconciliation & 48h Streak Protection**:
  - Offline review actions are persisted in an immutable `review_queue` in IndexedDB.
  - When network connection is restored, the client sync engine batches queued reviews to `POST /api/v1/reviews/sync-offline`.
  - The server processes the batch atomically, honoring client timestamps within a **48-hour tolerance window** to backfill calendar day activity and preserve the user's daily streak.
- **Minimalist Feedback & Shared Device Security**:
  - Floating Obsidian pill in the Topbar communicates sync status unobtrusively (`Offline • N queued` -> `Syncing...` -> `All synced`).
  - Unobtrusive PWA install prompt banner appears exclusively after the user completes their 1st study session (with 7-day snooze and permanent dismiss options).
  - Secure logout prompts if un-synced reviews exist and unconditionally purges IndexedDB stores upon confirmed logout.

---

## 3. Gap Analysis

### A. Functional Gaps

| ID          | Functional Area        | AS-IS                                                               | TO-BE                                                                          | Gap / Delta                                                                                              |
| ----------- | ---------------------- | ------------------------------------------------------------------- | ------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------- |
| **GAP-F01** | App Installation       | Browser tab only; no manifest or install prompt.                    | Web App Manifest + Obsidian pill install prompt after 1st study session.       | Create `manifest.webmanifest`, service worker registration, `usePwaInstall` hook, and install banner UI. |
| **GAP-F02** | Static Shell Caching   | Browser default HTTP cache only; fails when offline.                | Service Worker Workbox precaching of JS, CSS, fonts, SVG icons.                | Implement Workbox precaching in Vite build (`vite-plugin-pwa` or custom SW).                             |
| **GAP-F03** | Local Data Persistence | In-memory React query / Zustand only; lost on reload/offline.       | IndexedDB schema (`WordStreakOfflineDB`) with 5 object stores.                 | Build `IndexedDbService` on frontend managing decks, cards, queue, media, and preferences.               |
| **GAP-F04** | Offline Study Flow     | Study session crashes on next card or submit review.                | Fully functional offline study flow running local SM-2 algorithm.              | Port SM-2 calculation to client-side SRS module; decouple review screen from direct HTTP calls.          |
| **GAP-F05** | Pronunciation Fallback | Fails silently or throws audio error when offline.                  | Native Web Speech API fallback with visual indicator.                          | Implement `AudioService` with primary MP3 playback and native TTS fallback.                              |
| **GAP-F06** | Review Reconciliation  | Only individual synchronous endpoint `POST /api/v1/reviews/submit`. | Atomic batch sync endpoint `POST /api/v1/reviews/sync-offline`.                | Build NestJS controller/service for batch sync, idempotency, and streak reconciliation.                  |
| **GAP-F07** | Streak Tolerance       | Real-time server timestamp only; fails offline users.               | 48h tolerance window on server for offline timestamps.                         | Extend `StreakService` to accept historical client timestamps within 48h window.                         |
| **GAP-F08** | Status Feedback        | No offline indicator in Topbar.                                     | Floating Obsidian status pill in Topbar reflecting queue size and sync status. | Create `SyncStatusPill` component with 4 animated states.                                                |

---

### B. Data Gaps

| Entity / Store        | Storage Layer          | Current State                  | Target State                                                                                         | Migration / Handling                                                               |
| --------------------- | ---------------------- | ------------------------------ | ---------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| `WordStreakOfflineDB` | Client IndexedDB       | Does not exist                 | 5 Object stores: `offline_decks`, `offline_cards`, `review_queue`, `cached_media`, `pwa_preferences` | Initialized automatically on first app load; deleted on user logout.               |
| `review_queue`        | Client IndexedDB       | Does not exist                 | Queues review records with `reviewedAtClient`, `clientTimezone`, `idempotencyKey`                    | Ephemeral queue; cleared upon successful backend sync.                             |
| `cached_media`        | Client IndexedDB       | Does not exist                 | Stores audio blobs with LRU timestamps (`lastAccessedAt`, `sizeBytes`)                               | Dynamically populated; sweeps old blobs at 45MB (90% quota).                       |
| `ReviewSyncDto`       | API Payload            | Only single `SubmitReviewDto`  | Batch payload `{ reviews: Array<SyncReviewItem>, clientTimezone: string }`                           | New endpoint; existing `submitReview` remains untouched.                           |
| `UserStreak`          | Server DB (PostgreSQL) | Evaluated against `now()` only | Backfills missed calendar days within 48h window                                                     | Handled by service logic; existing DB table schema requires no column alterations. |

---

### C. User Impact

- **Existing Learners**:
  - Zero disruption to current web browsing habits. Online review flow works exactly as before with added background resiliency.
  - Commuter and travel learners gain the ability to study anywhere without fearing lost streaks.
- **Onboarding & Notification Fatigue**:
  - The PWA install banner is gated behind the completion of the 1st study session, ensuring users only see the prompt once they have experienced core product value.
  - 7-day snooze and "Don't show again" options prevent banner harassment.
- **Shared Device Security**:
  - Users on shared computers/tablets are safeguarded: logging out gives a clear warning if un-synced reviews exist and scrubs all local IndexedDB caches.

---

### D. Transition Requirements

1. **Dual-Run Architecture**:
   - The existing online endpoint `POST /api/v1/reviews/submit` and the new batch endpoint `POST /api/v1/reviews/sync-offline` operate concurrently.
   - Web app gracefully chooses the appropriate path: online single review or offline queued sync.
2. **Feature Flags & Rollout**:
   - `VITE_ENABLE_PWA`: Enables service worker registration and manifest link.
   - `VITE_ENABLE_OFFLINE_MODE`: Enables IndexedDB pre-caching and background sync engine.
   - Allows instant disablement via environment variable if browser edge-case bugs occur during rollout.
3. **Rollback Plan**:
   - If Service Worker caching causes stale code deployments, the Service Worker contains an unregister script (`self.registration.unregister()`) and `Clients.claim()` cache-busting trigger.
4. **User Communication**:
   - Toast notification upon first offline transition: _"You are offline. Your reviews will be saved and synced automatically when reconnected."_

---

## 4. Exit Checklist

- [x] AS-IS documented in detail with failure modes and limitations.
- [x] TO-BE documented as the complete end-to-end offline and PWA experience.
- [x] All four gap categories addressed (Functional, Data, User Impact, Transition Requirements).
- [x] Data gaps checked against existing Prisma schema (no breaking backend schema migrations required).
- [x] Dual-run and rollback strategy explicitly specified.
