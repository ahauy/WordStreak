# Software Requirements Specification (SRS)

## Progressive Web App (PWA) & Offline Study Mode

- **Feature Slug**: `pwa-offline-mode`
- **Epic**: `EPIC-05: Ecosystem & Platform`
- **Target User Story**: `US-ECO-04`
- **Version**: 1.0-draft
- **Date**: 2026-08-24
- **Audience**: Development Team, QA Engineers, System Architects

---

## 1. System Architecture & Overview

The PWA and Offline Study subsystem establishes an offline-first architecture connecting the React 19 web client to the NestJS backend:

```mermaid
flowchart TB
    subgraph Browser ["Client Browser (PWA / Web)"]
        UI["React 19 UI & Review Screen"]
        SW["Service Worker (Workbox Precaching)"]
        IDB[("IndexedDB: WordStreakOfflineDB")]
        SRS["Client SM-2 Engine"]
        TTS["Web Speech Synthesis (TTS)"]
        SYNC["Background Sync Engine"]
    end

    subgraph Backend ["NestJS Backend"]
        API["/api/v1/reviews/sync-offline"]
        SRV_SRS["SrsService (SM-2)"]
        STRK["StreakService (48h Backfill)"]
        XP["XpService"]
        DB[("PostgreSQL via Prisma")]
    end

    UI -->|1. Request due cards| IDB
    UI -->|2. Local card rating| SRS
    SRS -->|3. Update local progress| IDB
    SRS -->|4. Enqueue review| IDB
    UI -->|5. Play audio (fallback)| TTS
    SYNC -->|6. Check queued reviews| IDB
    SYNC -->|7. Batch POST payload| API
    API --> STRK
    API --> XP
    API --> DB
    SW -->|Caches app shell & assets| UI
```

---

## 2. Detailed Software Requirements

### REQ-PWA-001: Web App Manifest & Standalone Configuration

- **Category**: PWA Infrastructure
- **Priority**: Must-Have
- **Status**: Draft
- **Description**: The system must provide a valid `manifest.webmanifest` configured with `display: "standalone"`, `orientation: "portrait-primary"`, theme color `#000000`, background color `#ffffff`, and SVG/PNG icon sets (192x192, 512x512 maskable) to enable home screen installation across mobile and desktop platforms.
- **Derived from**: BR-PWA-009, GAP-F01, ASM-PWA-001
- **Business Rules**: BR-PWA-009
- **Non-Functional Requirements**: NFR-A11Y-01, Lighthouse PWA Score = 100/100
- **Dependencies**: None

---

### REQ-PWA-002: Service Worker Lifecycle & Precaching

- **Category**: PWA Infrastructure
- **Priority**: Must-Have
- **Status**: Draft
- **Description**: The system must register a Service Worker utilizing Workbox precaching for all core static assets (HTML shell, compiled JS bundles, CSS stylesheets, Google Fonts `Nunito`/`Inter`, and UI SVG icons). The Service Worker must implement `skipWaiting: true` and `clientsClaim: true` for clean update activation.
- **Derived from**: GAP-F02, RISK-PWA-003, ASM-PWA-001
- **Business Rules**: None
- **Non-Functional Requirements**: NFR-PERF-03 (Static shell cache response < 50ms)
- **Dependencies**: REQ-PWA-001

---

### REQ-PWA-003: Client-Side IndexedDB Storage Architecture

- **Category**: Offline Persistence
- **Priority**: Must-Have
- **Status**: Draft
- **Description**: The frontend must initialize an IndexedDB database named `WordStreakOfflineDB` (Version 1) containing five object stores: `offline_decks`, `offline_cards` (indexed by `deckId`), `review_queue`, `cached_media`, and `pwa_preferences`.
- **Derived from**: BR-PWA-001, BR-PWA-002, GAP-F03, ASM-PWA-003
- **Business Rules**: BR-PWA-002
- **Non-Functional Requirements**: NFR-PERF-02 (IndexedDB read latency < 15ms), NFR-SEC-01 (Zero tokens stored)
- **Dependencies**: None

---

### REQ-PWA-004: Automatic Due Cards Pre-Caching

- **Category**: Data Synchronization
- **Priority**: Must-Have
- **Status**: Draft
- **Description**: Upon dashboard or study hub load while online, the frontend must asynchronously fetch due cards from `/api/v1/reviews/due` and update the `offline_cards` store with cards categorized as `status = NEW | LEARNING | DUE`.
- **Derived from**: BR-PWA-001, GAP-F04, ASM-PWA-004
- **Business Rules**: BR-PWA-001, BR-PWA-002
- **Non-Functional Requirements**: NFR-PERF-02
- **Dependencies**: REQ-PWA-003

---

### REQ-PWA-005: Manual Full-Deck Pre-Caching & LRU Management

- **Category**: Offline Persistence
- **Priority**: Should-Have
- **Status**: Draft
- **Description**: The system must provide a "Make available offline" toggle on Deck Detail screens. When enabled, all cards and phonetic metadata for that deck must be written to `offline_decks` and `offline_cards`. Audio pronunciation files must be downloaded into `cached_media` up to the **50 MB** storage limit. When usage reaches 90% (45 MB), oldest audio blobs must be evicted using LRU sorting on `lastAccessedAt`.
- **Derived from**: BR-PWA-001, BR-PWA-002, GAP-F03, RISK-PWA-002
- **Business Rules**: BR-PWA-001, BR-PWA-002
- **Non-Functional Requirements**: Storage footprint hard-capped at 50 MB
- **Dependencies**: REQ-PWA-003

---

### REQ-PWA-006: Offline SM-2 Spaced Repetition Engine

- **Category**: Core Learning Logic
- **Priority**: Must-Have
- **Status**: Draft
- **Description**: When reviewing flashcards offline, the client must compute SRS updates using the identical SM-2 algorithm as `SrsService.calculateSm2` ($EF'$, repetitions, interval, grade mapping 1..4 -> 2..5). The updated status and next review date must immediately update the local card record in `offline_cards`.
- **Derived from**: BR-PWA-003, GAP-F04, ASM-PWA-004
- **Business Rules**: BR-PWA-003
- **Non-Functional Requirements**: NFR-PERF-01 (Local card flip and rating latency < 16ms)
- **Dependencies**: REQ-PWA-003, REQ-PWA-004

---

### REQ-PWA-007: Local Review Persistence Queue

- **Category**: Offline Persistence
- **Priority**: Must-Have
- **Status**: Draft
- **Description**: Every completed review action while offline must append an immutable record to the `review_queue` object store in IndexedDB containing `id` (UUID), `userId`, `cardId`, `rating`, calculated `interval`, `easeFactor`, `repetitions`, `reviewedAtClient` (UTC ISO string), `clientTimezone`, and `status = PENDING`.
- **Derived from**: BR-PWA-003, BR-PWA-004, GAP-F06, ASM-PWA-010
- **Business Rules**: BR-PWA-003, BR-PWA-005
- **Non-Functional Requirements**: NFR-SEC-01
- **Dependencies**: REQ-PWA-003, REQ-PWA-006

---

### REQ-PWA-008: Universal Pronunciation Web Speech API Fallback

- **Category**: Multimedia / Audio
- **Priority**: Must-Have
- **Status**: Draft
- **Description**: When the user requests audio pronunciation, the system must first attempt playback from `cached_media` (or network stream). If offline and un-cached, the system must immediately trigger `window.speechSynthesis.speak()` using an English utterance (`en-US` / `en-GB`) and render a `🔊 [TTS]` badge.
- **Derived from**: BR-PWA-007, GAP-F05, RISK-PWA-006, ASM-PWA-002
- **Business Rules**: BR-PWA-007
- **Non-Functional Requirements**: Fallback latency < 100ms
- **Dependencies**: None

---

### REQ-PWA-009: Reconnection Auto-Sync Engine & Retry Policy

- **Category**: Data Synchronization
- **Priority**: Must-Have
- **Status**: Draft
- **Description**: The client must monitor connectivity events (`window.online`, `visibilitychange`, SW sync). Upon reconnection, the client must batch all `PENDING` items in `review_queue` and dispatch them to `POST /api/v1/reviews/sync-offline`. In case of network failure or HTTP 5xx, the engine must retry using exponential backoff (5s, 15s, 30s, 60s).
- **Derived from**: BR-PWA-010, GAP-F06, RISK-PWA-005, ASM-PWA-006
- **Business Rules**: BR-PWA-010
- **Non-Functional Requirements**: Zero data loss for queued items
- **Dependencies**: REQ-PWA-007, REQ-PWA-010

---

### REQ-PWA-010: Backend Batch Sync & 48-Hour Streak Reconciliation

- **Category**: Backend / Gamification
- **Priority**: Must-Have
- **Status**: Draft
- **Description**: The backend must expose `POST /api/v1/reviews/sync-offline`. It must process review items in an atomic database transaction. For each review with $T_{\text{server}} - T_{\text{reviewedAtClient}} \le 48\text{h}$, it must update `UserCardProgress`, create immutable `ReviewLog` entries, backfill missed calendar days in `UserStreak`, and award XP via `XpService` (capped at 500 XP per payload).
- **Derived from**: BR-PWA-004, BR-PWA-005, BR-PWA-006, GAP-F06, GAP-F07, RISK-PWA-001
- **Business Rules**: BR-PWA-004, BR-PWA-005, BR-PWA-006
- **Non-Functional Requirements**: Batch processing latency < 1000ms for 50 items
- **Dependencies**: REQ-PWA-009

---

### REQ-PWA-011: Topbar Floating Status Pill & PWA Install Banner

- **Category**: UI / UX Feedback
- **Priority**: Must-Have
- **Status**: Draft
- **Description**: The frontend must render a Topbar floating Obsidian status pill reflecting: `Online` (hidden/dot), `Offline • N queued`, `Syncing (N)...`, `All synced` (3s fade), and `Sync paused`. Additionally, the frontend must render an Obsidian pill PWA install banner exclusively after the user completes their 1st study session (with 7-day snooze and permanent dismissal options).
- **Derived from**: BR-PWA-009, GAP-F01, GAP-F08, ASM-PWA-007
- **Business Rules**: BR-PWA-009
- **Non-Functional Requirements**: NFR-A11Y-01, Zero-flicker CSS transitions
- **Dependencies**: REQ-PWA-001, REQ-PWA-009

---

### REQ-PWA-012: Secure Multi-User Logout & Cache Invalidation

- **Category**: Security / Privacy
- **Priority**: Must-Have
- **Status**: Draft
- **Description**: When a user initiates logout, if `review_queue` contains un-synced items, a modal warning must appear requiring confirmation. Upon confirmed logout, the client must unconditionally execute `indexedDB.deleteDatabase('WordStreakOfflineDB')` to purge all local cards, decks, queues, and audio blobs.
- **Derived from**: BR-PWA-008, GAP-F03, RISK-PWA-004, ASM-PWA-008
- **Business Rules**: BR-PWA-008
- **Non-Functional Requirements**: NFR-SEC-01, NFR-SEC-02
- **Dependencies**: REQ-PWA-003, REQ-PWA-007

---

## 3. Data Contracts & Interfaces

### A. IndexedDB Object Store Contracts (`WordStreakOfflineDB`)

```typescript
export interface OfflineDeckEntity {
  id: string;
  title: string;
  description?: string;
  color: string;
  icon: string;
  isOfflineAvailable: boolean;
  totalCards: number;
  cachedAt: string; // ISO-8601
}

export interface OfflineCardEntity {
  id: string;
  deckId: string;
  word: string;
  meaning: string;
  phonetic?: string;
  audioUrl?: string;
  exampleSentence?: string;
  collocations?: string;
  mnemonic?: string;
  imageUrl?: string;
  status: "NEW" | "LEARNING" | "MASTERED";
  interval: number;
  easeFactor: number;
  repetitions: number;
  nextReviewDate: string; // ISO-8601
}

export interface ReviewQueueEntity {
  id: string; // UUID (idempotency key)
  userId: string;
  cardId: string;
  rating: 1 | 2 | 3 | 4;
  interval: number;
  easeFactor: number;
  repetitions: number;
  reviewedAtClient: string; // ISO-8601
  clientTimezone: string; // e.g. "Asia/Ho_Chi_Minh"
  status: "PENDING" | "SYNCING" | "FAILED";
  retryCount: number;
}
```

### B. Batch Offline Sync API DTOs

```typescript
export interface SyncReviewItemDto {
  idempotencyKey: string; // UUID from ReviewQueueEntity.id
  cardId: string;
  rating: 1 | 2 | 3 | 4;
  interval: number;
  easeFactor: number;
  repetitions: number;
  reviewedAtClient: string; // ISO-8601
}

export interface SyncOfflineReviewsDto {
  clientTimezone: string;
  reviews: SyncReviewItemDto[];
}

export interface SyncOfflineReviewsResponse {
  processedCount: number;
  syncedCards: string[];
  totalXpAwarded: number;
  streakUpdated: boolean;
  currentStreak: number;
  conflicts: Array<{
    cardId: string;
    action: "DELETED_CARD_DROPPED" | "CONTENT_PRESERVED" | "TIMESTAMP_RESOLVED";
  }>;
}
```

---

## 4. Error Handling & Recovery Matrix

| Failure Event                         | Detection Point              | Recovery Action                                                               | User-Facing Notice                                                     |
| ------------------------------------- | ---------------------------- | ----------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| **Network drop during review**        | Frontend HTTP / Fetch        | Switch to offline mode; enqueue review to IndexedDB.                          | Topbar pill transitions to `Offline • N queued`.                       |
| **Network timeout during batch sync** | Sync Engine                  | Keep items in `review_queue`; schedule exponential retry (5s, 15s, 30s, 60s). | Topbar pill displays `Sync paused • Tap to retry`.                     |
| **Card deleted on server**            | Backend `POST /sync-offline` | Ignore progress update; credit review XP; return conflict notice.             | None (card seamlessly disappears from local queue).                    |
| **Audio MP3 missing offline**         | Audio Player Hook            | Trigger `window.speechSynthesis` native TTS utterance.                        | Badge displays `🔊 [TTS]` next to word.                                |
| **Storage quota reached (45MB+)**     | Pre-cache Worker             | Run LRU sweep on `cached_media` audio blobs.                                  | Toast: _"Storage limit managed (LRU cleanup complete)"_.               |
| **Logout with un-synced reviews**     | Auth / Logout Handler        | Block immediate logout; show confirmation modal.                              | Modal: _"You have N un-synced reviews. Discard and Log Out / Cancel"_. |
