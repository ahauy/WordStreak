# Feature: Progressive Web App (PWA) & Offline Study Mode (US-ECO-04)

**Slug**: `pwa-offline-mode`  
**Version**: 1.0  
**Ship date**: 2026-08-24  
**Spec**: [.specify/features/pwa-offline-mode/](../../.specify/features/pwa-offline-mode/)  
**Baseline**: [SIGNED-OFF v1.0](../../.specify/features/pwa-offline-mode/baseline.md)  
**User Story**: `US-ECO-04` (EPIC 09: Ecosystem & Integrations)

---

## 1. Executive Summary & Problem Space

**WordStreak PWA & Offline Study Mode** provides an offline-first learning experience for flashcard reviews on desktop and mobile web browsers.

Learners commuting on underground transit, flying, or experiencing intermittent mobile internet connectivity can study their spaced repetition flashcards without disruption. Flashcard reviews, rating calculations (SuperMemo-2), and audio pronunciation playback operate locally on the client device. When network connectivity is restored, an automated reconnection engine reconciles offline review sessions with the NestJS backend, adjusts daily streak continuity within a 48-hour tolerance window, awards XP under strict anti-abuse boundaries, and resolves concurrent conflicts atomically.

### Core Value Metrics

- **0% Drop-off during offline network loss**: Immediate fallback to local IndexedDB and cached audio with zero user interruption.
- **100% Client-Server SM-2 Mathematical Parity**: Identical SRS calculations on browser client and server.
- **Atomic Batch Synchronization**: Idempotent synchronization via `POST /api/v1/reviews/sync-batch` handling up to 100 reviews per batch.
- **48-Hour Streak Reconciliation**: Timezone-aware streak repair across offline days without cheating vulnerabilities.

---

## 2. Architecture & Data Flow

### 2.1. System Architecture Overview

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│                            CLIENT BROWSER / PWA LAYER                            │
│                                                                                  │
│  ┌───────────────────────┐   ┌────────────────────────┐   ┌───────────────────┐  │
│  │   Service Worker      │   │  IndexedDB Database    │   │  Client SM-2      │  │
│  │  (vite-plugin-pwa)    │   │ (wordstreak_offline_db)│   │  Review Engine    │  │
│  │  - Static Bundles     │   │  - offline_decks       │   │  - Grade Mapping  │  │
│  │  - Google Fonts Cache │   │  - offline_cards       │   │  - Ease Factor    │  │
│  │  - CacheFirst Assets  │   │  - review_queue        │   │  - Next Intervals │  │
│  └───────────┬───────────┘   │  - cached_media        │   └─────────┬─────────┘  │
│              │               │  - pwa_preferences     │             │            │
│              │               └───────────┬────────────┘             │            │
│              ▼                           │                          ▼            │
│  ┌───────────────────────────────────────┴──────────────────────────────┐        │
│  │               Reconnection Sync Engine (Exponential Backoff)         │        │
│  │               Listens to 'online' event / Triggers syncNow()         │        │
│  └───────────────────────────────────────┬──────────────────────────────┘        │
└──────────────────────────────────────────┼───────────────────────────────────────┘
                                           │ HTTP POST (Batch DTO)
                                           │ Headers: Authorization + x-timezone
                                           ▼
┌──────────────────────────────────────────────────────────────────────────────────┐
│                            NESTJS BACKEND API LAYER                              │
│                                                                                  │
│  ┌────────────────────────────────────────────────────────────────────────────┐  │
│  │ ReviewsController: POST /api/v1/reviews/sync-batch (JwtAuthGuard)          │  │
│  └─────────────────────────────────────┬──────────────────────────────────────┘  │
│                                        ▼                                         │
│  ┌────────────────────────────────────────────────────────────────────────────┐  │
│  │ ReviewsSyncService (Prisma Interactive $transaction)                       │  │
│  │ 1. validateClockDriftAndTimestamps (<= 5 min future limit)                 │  │
│  │ 2. Chronological Batch Sort                                                │  │
│  │ 3. processReviewItem (SM-2 State, Conflict Resolution, Effort XP)         │  │
│  │ 4. applyBatchXpReward (Min of raw XP and 500 XP hard cap)                  │  │
│  │ 5. reconcileStreak (48h tolerance, Timezone localization, Milestones)      │  │
│  └─────────────────────────────────────┬──────────────────────────────────────┘  │
│                                        ▼                                         │
│  ┌────────────────────────────────────────────────────────────────────────────┐  │
│  │ PostgreSQL Database (UserCardProgress, ReviewLog, UserStreak, UserActivity)│  │
│  └────────────────────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────────────────────┘
```

### 2.2. End-to-End Sequence Diagram

```mermaid
sequenceDiagram
    autonumber
    actor User as Learner (Client)
    participant UI as React UI (OfflineSyncPill / Flashcard)
    participant SM2 as ClientSm2Engine
    participant IDB as IndexedDB (wordstreak_offline_db)
    participant TTS as TtsAudioPlayer / Cache
    participant Sync as ReconnectionSyncEngine
    participant API as NestJS ReviewsController
    participant Service as ReviewsSyncService
    participant DB as PostgreSQL (Prisma $tx)

    Note over User, UI: Phase 1: Offline Study Session
    User->>UI: Flip flashcard & select rating (e.g. Good = 3)
    UI->>SM2: calculateSm2({ rating: 3, rep: 1, ef: 2.5, iv: 1 })
    SM2-->>UI: Return { repetitions: 2, interval: 6, easeFactor: 2.5 }
    UI->>TTS: Play pronunciation audio
    alt Audio Blob in cached_media
        TTS->>IDB: getCachedMedia(audioUrl)
        IDB-->>TTS: Blob audio/mpeg
        TTS->>TTS: URL.createObjectURL(blob) -> play -> revokeObjectURL()
    else Audio Missing (Offline Fallback)
        TTS->>TTS: Fallback to Web Speech Synthesis API
    end
    UI->>IDB: queueOfflineReview(ReviewQueueEntity [PENDING])
    IDB-->>UI: Saved queue item (idempotency UUIDv4)
    UI->>UI: Update OfflineSyncPill ("Offline • 1 queued")

    Note over User, Sync: Phase 2: Network Restoration & Auto-Sync
    User->>User: Reconnect to Wi-Fi / Cellular Data
    window->>Sync: 'online' event triggered
    Sync->>IDB: getPendingReviews(userId)
    IDB-->>Sync: Return [ReviewQueueEntity, ...]
    Sync->>IDB: updateReviewQueueStatus(ids, "SYNCING")
    Sync->>UI: Dispatch Event 'wordstreak:sync-status' ("SYNCING")
    Sync->>API: POST /api/v1/reviews/sync-batch (SyncReviewBatchDto)

    Note over API, DB: Phase 3: Backend Validation & Transaction
    API->>Service: syncReviews(userId, dto, x-timezone)
    Service->>Service: validateClockDriftAndTimestamps (<= 5 min)
    Service->>Service: Sort reviews chronologically
    Service->>DB: prisma.$transaction(...)
    loop For each review in batch
        Service->>DB: Check card existence & tenant ownership
        alt Card Deleted / Remote Conflict
            Service->>Service: Record DELETED_CARD_DROPPED conflict + 10 Effort XP
        else Valid Card
            Service->>DB: Update UserCardProgress (SM-2 status & nextReviewDate)
            Service->>DB: Insert ReviewLog entry
        end
    end
    Service->>DB: applyBatchXpReward (min(rawXp, 500 cap))
    Service->>DB: reconcileStreak (48h tolerance, delta calculation)
    DB-->>Service: Transaction Committed
    Service-->>API: Return SyncReviewResponseDto
    API-->>Sync: 200 OK (SyncReviewResponseDto)

    Note over Sync, UI: Phase 4: Local Queue Purge & UI Reconciliation
    Sync->>IDB: markReviewSynced(syncedReviewIds)
    Sync->>UI: Dispatch 'wordstreak:sync-completed' & 'wordstreak:streak-updated'
    UI->>UI: Update OfflineSyncPill ("All synced")
    UI->>User: Display XP & Streak update toasts
```

---

## 3. Client Storage Architecture: IndexedDB Specification

The client storage layer uses [`idb`](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/apps/web/src/services/offline/offlineDatabase.ts) to manage the local database `wordstreak_offline_db` (version `1`).

### 3.1. Five Dedicated Object Stores

| Object Store Name     | Key Path       | Primary Indexes                                                                            | Description                                                                                                                       |
| :-------------------- | :------------- | :----------------------------------------------------------------------------------------- | :-------------------------------------------------------------------------------------------------------------------------------- |
| **`offline_decks`**   | `id` (UUID)    | `by-userId` (`userId`)                                                                     | Cached deck metadata, card counts, offline toggle state, and sync timestamps.                                                     |
| **`offline_cards`**   | `id` (UUID)    | `by-deckId` (`deckId`)<br>`by-nextReviewDate` (`nextReviewDate`)<br>`by-status` (`status`) | Complete flashcard dataset including front/back text, IPA phonetic, example sentences, collocations, mnemonics, and SRS progress. |
| **`review_queue`**    | `id` (UUID)    | `by-userId` (`userId`)<br>`by-status` (`status`)<br>`by-reviewedAt` (`reviewedAtClient`)   | Pending review transactions waiting for network connectivity. Uses client-generated UUIDv4 as idempotency key.                    |
| **`cached_media`**    | `url` (String) | `by-lastAccessedAt` (`lastAccessedAt`)<br>`by-byteSize` (`byteSize`)                       | Binary audio pronunciation blobs (`Blob`, `audio/mpeg`) indexed for LRU cache eviction.                                           |
| **`pwa_preferences`** | `key` (String) | _(Primary key only)_                                                                       | Key-value store for offline client settings (e.g. `pwa_install_snoozed_until`, storage quotas, audio autoplay flags).             |

### 3.2. TypeScript Entity Schemas

From [`packages/shared-types/src/pwa-offline.ts`](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/packages/shared-types/src/pwa-offline.ts):

```typescript
export interface OfflineDeckEntity {
  id: string; // Deck UUID
  userId: string; // Owner UUID
  title: string; // Deck title
  description?: string; // Optional description
  color: string; // UI theme color (hex)
  icon: string; // Lucide icon key
  isOfflineAvailable: boolean; // Download toggle flag
  totalCards: number; // Total cards in deck
  cachedAt: string; // ISO-8601 creation timestamp
  lastSyncedAt: string; // ISO-8601 sync timestamp
}

export interface OfflineCardEntity {
  id: string; // Card UUID
  deckId: string; // Parent Deck UUID
  word: string; // Front vocabulary word
  meaning: string; // Back translated meaning
  phonetic?: string | null; // IPA phonetic transcription
  audioUrl?: string | null; // Remote audio URL
  exampleSentence?: string | null;
  exampleTranslation?: string | null;
  collocations?: string | null;
  mnemonic?: string | null;
  imageUrl?: string | null;
  status: CardLearningStatus; // 'NEW' | 'LEARNING' | 'REVIEWING' | 'MASTERED'
  interval: number; // Current SM-2 interval in days
  easeFactor: number; // Current SM-2 ease factor (>= 1.30)
  repetitions: number; // Consecutive successful reviews
  nextReviewDate: string; // ISO-8601 UTC due date
  cachedAt: string; // ISO-8601 timestamp
}

export interface ReviewQueueEntity {
  id: string; // UUID v4 (Idempotency key)
  userId: string; // User UUID
  cardId: string; // Target Card UUID
  rating: ReviewRating; // 1 (Again), 2 (Hard), 3 (Good), 4 (Easy)
  interval: number; // Calculated interval
  easeFactor: number; // Calculated ease factor
  repetitions: number; // Calculated repetitions
  reviewedAtClient: string; // ISO-8601 UTC client review timestamp
  clientTimezone: string; // e.g. "Asia/Ho_Chi_Minh"
  status: ReviewQueueStatus; // 'PENDING' | 'SYNCING' | 'FAILED'
  retryCount: number; // Incremented on network failure
  lastError?: string; // Diagnostic message
}

export interface CachedMediaEntity {
  url: string; // Primary key (Remote media URL)
  mediaBlob: Blob; // Binary blob
  mimeType: string; // e.g. "audio/mpeg"
  byteSize: number; // Size in bytes
  lastAccessedAt: string; // ISO-8601 timestamp (for LRU sorting)
  cachedAt: string; // ISO-8601 creation timestamp
}

export interface PwaPreferencesEntity {
  key: string; // Primary key
  value: unknown; // JSON-serializable payload
  updatedAt: string; // ISO-8601 timestamp
}
```

### 3.3. Storage Quota Management & LRU Eviction

- **Budget**: Standard browser IndexedDB quota with a soft application budget of `50MB`.
- **LRU Eviction Trigger**: `LRU_SWEEP_THRESHOLD_BYTES = 45 * 1024 * 1024` (45 MB).
- **Sweep Logic**: When total `cached_media` bytes exceed 45 MB, `runLruMediaSweep()` sorts media entries by `lastAccessedAt` ascending and deletes oldest items until cache size drops below 80% (`36 MB`). Flashcard text and review queue entries are **never** evicted.
- **Audio Object URL Lifecycle**: The [`TtsAudioPlayer`](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/apps/web/src/components/pwa/TtsAudioPlayer.tsx) component creates local Object URLs using `URL.createObjectURL(blob)` and invokes `URL.revokeObjectURL(url)` on audio `ended` or `error` events to prevent browser memory leaks.

---

## 4. API Reference: `POST /api/v1/reviews/sync-batch`

Synchronizes a batch of offline review events atomically within a single database transaction.

- **URL**: `/api/v1/reviews/sync-batch` _(Alias: `/api/v1/reviews/sync-offline`)_
- **Method**: `POST`
- **Authentication**: `Bearer <JWT_TOKEN>` (Protected by [`JwtAuthGuard`](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/apps/api/src/common/guards/jwt-auth.guard.ts))
- **Controller**: [`ReviewsController.syncReviewBatch`](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/apps/api/src/modules/reviews/reviews.controller.ts#L65-L82)
- **Service**: [`ReviewsSyncService.syncReviews`](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/apps/api/src/modules/reviews/reviews-sync.service.ts#L48-L82)

### 4.1. Request Headers

| Header          | Type     | Required | Description                                                                        |
| :-------------- | :------- | :------- | :--------------------------------------------------------------------------------- |
| `Authorization` | `string` | **Yes**  | Standard JWT Bearer token: `Bearer eyJhbGci...`                                    |
| `Content-Type`  | `string` | **Yes**  | `application/json`                                                                 |
| `x-timezone`    | `string` | No       | Fallback IANA timezone identifier (e.g. `Asia/Ho_Chi_Minh` or `America/New_York`). |

### 4.2. Request Payload Schema (`SyncReviewBatchDto`)

```json
{
  "clientTimezone": "Asia/Ho_Chi_Minh",
  "reviews": [
    {
      "idempotencyKey": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
      "cardId": "b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
      "rating": 3,
      "interval": 6,
      "easeFactor": 2.5,
      "repetitions": 2,
      "reviewedAtClient": "2026-08-24T09:30:00.000Z"
    }
  ]
}
```

#### Validation Rules (Class-Validator)

- `clientTimezone`: Optional string. Must resolve to a valid IANA timezone name.
- `reviews`: Array of review items with minimum 1 item (`@ArrayMinSize(1)`) and maximum 100 items (`@ArrayMaxSize(100)`).
  - `idempotencyKey`: Valid UUID v4 (`@IsUUID('4')`).
  - `cardId`: Valid UUID v4 (`@IsUUID('4')`).
  - `rating`: Integer between 1 and 4 (`@Min(1)`, `@Max(4)`).
  - `interval`: Non-negative integer (`@Min(0)`).
  - `easeFactor`: Number $\ge 1.30$ with maximum 2 decimal places (`@Min(1.3)`).
  - `repetitions`: Non-negative integer (`@Min(0)`).
  - `reviewedAtClient`: Valid ISO-8601 UTC date string (`@IsISO8601()`).

### 4.3. Response Payload Schema (`SyncReviewResponseDto`)

```json
{
  "success": true,
  "data": {
    "processedCount": 3,
    "syncedCount": 2,
    "failedCount": 1,
    "conflictsResolved": 1,
    "syncedCardIds": [
      "b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
      "b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13"
    ],
    "totalXpAwarded": 30,
    "streakUpdated": true,
    "currentStreak": 7,
    "bestStreak": 7,
    "conflicts": [
      {
        "cardId": "b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12",
        "action": "DELETED_CARD_DROPPED",
        "reason": "Card was deleted or inaccessible"
      }
    ],
    "serverTimestamp": "2026-08-24T09:35:00.000Z"
  },
  "message": "Batch reviews synchronized successfully"
}
```

### 4.4. HTTP Status Codes & Error Handling

| Status Code                 | Reason                           | Cause & Mitigation                                                                                                        |
| :-------------------------- | :------------------------------- | :------------------------------------------------------------------------------------------------------------------------ |
| `200 OK`                    | Batch Synchronized               | Successfully processed batch. Individual conflicts are returned in `data.conflicts` without failing the batch.            |
| `400 Bad Request`           | Validation Failure / Clock Drift | Payload schema invalid, or client review timestamp exceeds `serverNow + 5 minutes`. Client must synchronize device clock. |
| `401 Unauthorized`          | Invalid / Missing JWT            | Authorization header missing, expired, or invalid.                                                                        |
| `404 Not Found`             | User Not Found                   | Authenticated `userId` does not exist in the database.                                                                    |
| `500 Internal Server Error` | Database Transaction Error       | Prisma transaction aborted; all database changes rolled back atomically.                                                  |

---

## 5. Algorithms, Mathematical Models & Security Rules

### 5.1. Client & Server SM-2 Algorithmic Parity

Both [`ClientSm2Engine`](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/apps/web/src/services/offline/clientSm2Engine.ts) and backend [`SrsService`](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/apps/api/src/modules/reviews/srs.service.ts) implement identical SuperMemo-2 calculations.

#### 1. Rating Scale to SM-2 Grade Mapping

$$\text{Grade}(r) = \begin{cases} 2 & \text{if } r = 1 \text{ (Again: Incorrect recall)} \\ 3 & \text{if } r = 2 \text{ (Hard: Correct with serious difficulty)} \\ 4 & \text{if } r = 3 \text{ (Good: Correct after hesitation)} \\ 5 & \text{if } r = 4 \text{ (Easy: Perfect immediate recall)} \end{cases}$$

#### 2. Ease Factor ($EF$) Calculation

$$\Delta = 5 - \text{Grade}(r)$$
$$EF_{\text{next}} = \max\left(1.30, \, EF_{\text{current}} + \left(0.1 - \Delta \times (0.08 + \Delta \times 0.02)\right)\right)$$

#### 3. Repetition & Interval Progression

$$(\text{Rep}_{\text{next}}, \, I_{\text{next}}) = \begin{cases} (0, \, 1) & \text{if } r < 3 \text{ (Again or Hard resets streak)} \\ (1, \, 1) & \text{if } r \ge 3 \text{ and } \text{Rep}_{\text{current}} = 0 \\ (\text{Rep}_{\text{current}} + 1, \, 6) & \text{if } r \ge 3 \text{ and } \text{Rep}_{\text{current}} = 1 \\ (\text{Rep}_{\text{current}} + 1, \, \text{round}(I_{\text{current}} \times EF_{\text{next}} \times 1.30)) & \text{if } r = 4 \text{ and } \text{Rep}_{\text{current}} \ge 2 \text{ (Easy Bonus)} \\ (\text{Rep}_{\text{current}} + 1, \, \text{round}(I_{\text{current}} \times EF_{\text{next}})) & \text{if } r = 3 \text{ and } \text{Rep}_{\text{current}} \ge 2 \end{cases}$$

#### 4. Card Learning Status Derivation

$$\text{Status} = \begin{cases} \text{MASTERED} & \text{if } I_{\text{next}} \ge 21 \text{ and } \text{Rep}_{\text{next}} \ge 4 \\ \text{NEW} & \text{if } \text{Rep}_{\text{next}} = 0 \text{ and } I_{\text{next}} = 0 \\ \text{LEARNING} & \text{otherwise} \end{cases}$$

---

### 5.2. 48-Hour Streak Reconciliation Logic

When offline reviews are synced, [`ReviewsSyncService.reconcileStreak`](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/apps/api/src/modules/reviews/reviews-sync.service.ts#L286-L368) applies multi-day streak repair:

1. **Eligibility Filter**: Only review dates where $(\text{serverNow} - \text{reviewedAtClient}) \le 48\text{ hours}$ (`STREAK_TOLERANCE_MS`) are eligible for streak reconciliation. Reviews older than 48 hours still record review history and XP, but cannot modify the current streak.
2. **Timezone Localization**: Review dates are converted into calendar date strings `YYYY-MM-DD` using `Intl.DateTimeFormat('en-CA', { timeZone })`.
3. **Day Delta ($\delta$) Calculation**:
   $$\delta = \text{calculateDayDelta}(\text{lastActiveDayStr}, \, \text{reviewDateStr})$$
   - $\delta \le 0$: Same-day review $\rightarrow$ Idempotent no-op (`streakUpdated = false`).
   - $\delta = 1$: Consecutive calendar day $\rightarrow$ `currentStreak += 1`.
   - $2 \le \delta \le (\text{streakFreezes} + 1)$: Missed days protected by available streak freezes $\rightarrow$ Consumes $(\delta - 1)$ freezes, sets `lastFreezeDate = serverNow`, and increments `currentStreak += 1`.
   - $\delta > (\text{streakFreezes} + 1)$: Gap exceeds available freezes $\rightarrow$ Resets `currentStreak = 1`.
4. **Milestone Bonus Awards**: If `currentStreak` reaches milestone **7 days** or **30 days**, the system automatically awards $+1$ streak freeze (up to maximum `MAX_STREAK_FREEZES = 2`).
5. **High-Water Mark**: Updates `bestStreak = max(bestStreak, currentStreak)`.

---

### 5.3. Anti-Abuse Security Controls

```
                                  INCOMING BATCH
                                        │
                                        ▼
             ┌─────────────────────────────────────────────────────┐
             │ 1. Clock Drift Check:                               │
             │    clientTimestamp <= serverNow + 5 min?            │
             └──────────────────────────┬──────────────────────────┘
                            NO ───► Throw 400 Bad Request
                                       │ YES
                                       ▼
             ┌─────────────────────────────────────────────────────┐
             │ 2. Chronological Batch Sort                         │
             │    Sort reviews ascending by reviewedAtClient       │
             └──────────────────────────┬──────────────────────────┘
                                        │
                                        ▼
             ┌─────────────────────────────────────────────────────┐
             │ 3. 48-Hour Streak Tolerance Window                  │
             │    Filter reviews <= 48h old for streak update      │
             └──────────────────────────┬──────────────────────────┘
                                        │
                                        ▼
             ┌─────────────────────────────────────────────────────┐
             │ 4. Anti-Abuse XP Hard Cap:                          │
             │    totalXpAwarded = min(rawBatchXp, 500 XP)         │
             │    Logged as activity HISTORICAL_BACKFILL           │
             └─────────────────────────────────────────────────────┘
```

1. **Future Clock Drift Mitigation (`MAX_CLOCK_DRIFT_MS = 300,000` ms)**:
   - Any review timestamp strictly greater than $(\text{serverNow} + 5\text{ minutes})$ is rejected with `400 Bad Request`.
2. **XP Batch Hard Cap (`MAX_BATCH_XP_CAP = 500` XP)**:
   - Base XP award: Rating 3 or 4 = 10 XP, Rating 2 = 5 XP, Rating 1 = 0 XP.
   - Deleted card conflict: 10 effort XP.
   - Total XP awarded per batch is capped at $\min(\text{rawXp}, 500)$.
   - Audit trail recorded in `UserActivityLog` under `activityType: HISTORICAL_BACKFILL` with metadata `{ source: 'OFFLINE_SYNC', reviewsCount, rawXp }`.
3. **Tenant & Card Ownership Verification**:
   - Every review verifies `card.deck.userId === userId`. Deleted or unauthorized cards trigger `DELETED_CARD_DROPPED` conflict resolution without failing the remainder of the batch.
4. **Logout Data Protection**:
   - [`DashboardNavbar`](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/apps/web/src/features/dashboard/components/DashboardNavbar.tsx) checks pending queue items before logout. If un-synced items exist, [`LogoutWarningModal`](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/apps/web/src/components/pwa/LogoutWarningModal.tsx) prompts the user to sync first or confirm purge.
   - On logout confirmation, `purgeOfflineDatabase()` clears all 5 IndexedDB object stores to prevent cross-account data leakage on shared devices.

---

## 6. Frontend UI/UX Components & Lifecycle

### 6.1. Component Roster

| Component                | File Path                                                                                                                                                       | Responsibilities                                                                                                                                     |
| :----------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------- |
| **`OfflineSyncPill`**    | [`apps/web/src/components/pwa/OfflineSyncPill.tsx`](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/apps/web/src/components/pwa/OfflineSyncPill.tsx)       | Header status pill reflecting network & queue state (`All synced`, `Offline • N queued`, `Syncing...`, `Sync Error`). Supports manual click-to-sync. |
| **`DeckOfflineToggle`**  | [`apps/web/src/components/pwa/DeckOfflineToggle.tsx`](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/apps/web/src/components/pwa/DeckOfflineToggle.tsx)   | Switch component on Deck details page to download/remove full deck and prefetch audio assets.                                                        |
| **`LogoutWarningModal`** | [`apps/web/src/components/pwa/LogoutWarningModal.tsx`](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/apps/web/src/components/pwa/LogoutWarningModal.tsx) | Modal dialog intercepting logout when `pendingCount > 0`. Offers "Sync & Log Out" or "Log Out Anyway" with destructive IDB wipe.                     |
| **`PwaInstallBanner`**   | [`apps/web/src/components/pwa/PwaInstallBanner.tsx`](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/apps/web/src/components/pwa/PwaInstallBanner.tsx)     | Non-intrusive banner capturing browser `beforeinstallprompt` event with 7-day snooze persistence in `pwa_preferences`.                               |
| **`TtsAudioPlayer`**     | [`apps/web/src/components/pwa/TtsAudioPlayer.tsx`](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/apps/web/src/components/pwa/TtsAudioPlayer.tsx)         | Audio player loading from IndexedDB blob cache, remote URL, or Web Speech Synthesis API fallback with automatic Object URL revocation.               |

### 6.2. Reconnection Sync Engine Lifecycle

The [`ReconnectionSyncEngine`](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/apps/web/src/services/offline/reconnectionSyncEngine.ts) manages the background synchronization loop:

- **Exponential Backoff**: If an auto-sync attempt fails due to server unreachability, retry delay is computed via:
  $$\text{Delay}(n) = \min(5000 \times 2^n, \, 60000) \text{ ms}$$
- **Event Bus Notifications**: Dispatches custom DOM events on `window`:
  - `wordstreak:sync-status` (`{ status: 'SYNCING' | 'IDLE', pendingCount }`)
  - `wordstreak:sync-completed` (`SyncReviewResponseDto`)
  - `wordstreak:sync-failed` (`{ error: string }`)
  - `wordstreak:streak-updated` (`{ currentStreak, bestStreak }`)
  - `wordstreak:xp-updated` (`{ xpEarned }`)

---

## 7. How-To Guides & Operational Runbook

### 7.1. How to Enable Offline Mode for a Vocabulary Deck

1. Navigate to the Deck details page in the WordStreak web application (`/decks/:id`).
2. Toggle the **"Available Offline"** switch in the deck actions header.
3. The client executes [`precacheManager.cacheDeckForOffline(deckId)`](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/apps/web/src/services/offline/precacheManager.ts#L22-L114):
   - Downloads deck metadata and stores it in `offline_decks`.
   - Downloads all flashcard items and stores them in `offline_cards`.
   - Asynchronously prefetches audio pronunciation MP3 files into `cached_media`.
4. An Obsidian toast notification confirms: _"Deck cached for offline study (X cards, Y MB audio)"_.

### 7.2. How to Test Offline Study Session Locally

```bash
# 1. Start fullstack development environment
pnpm dev

# 2. In Google Chrome / Edge DevTools:
# - Open Application > Service Workers (Ensure PWA Service Worker is active)
# - Open Network tab > Select "Offline" throttling
# - Navigate to Review Flashcards (/review or /decks/:id/study)
# - Complete 3 card reviews with ratings (Again, Good, Easy)

# 3. Inspect IndexedDB:
# - Open Application > Storage > IndexedDB > wordstreak_offline_db > review_queue
# - Verify 3 pending records with UUIDv4 keys and status "PENDING"

# 4. Restore Network:
# - Set Network tab back to "No throttling" (Online)
# - Observe OfflineSyncPill transition: "Offline • 3 queued" -> "Syncing..." -> "All synced"
# - Verify review_queue store is emptied and XP/Streak toasts appear.
```

---

## 8. Test Coverage & Quality Verification

Full test suite verification passed with **100% success rate (764 tests passing)**:

### 8.1. Backend Test Suites (`apps/api`)

| Test Suite File                                                                                                                                  | Test Cases / IDs                                                             | Scenarios Covered                                                                                                                                                                                                                                                                              |
| :----------------------------------------------------------------------------------------------------------------------------------------------- | :--------------------------------------------------------------------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [`reviews-sync.service.spec.ts`](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/apps/api/src/modules/reviews/reviews-sync.service.spec.ts) | `TC-PWA-003`<br>`TC-PWA-004`<br>`TC-PWA-005`<br>`TC-PWA-006`<br>`TC-PWA-007` | - 5-card batch sync with XP and SM-2 state updates<br>- 48h multi-day streak reconciliation & milestone freeze bonus<br>- Deleted card conflict resolution with base effort XP<br>- Future clock drift rejection (> 5 min)<br>- 500 XP hard cap per batch<br>- 48h streak window expiry bypass |
| [`reviews.controller.spec.ts`](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/apps/api/src/modules/reviews/reviews.controller.spec.ts)     | `TC-PWA-008`                                                                 | - `POST /reviews/sync-batch` endpoint request forwarding and response schema mapping                                                                                                                                                                                                           |

```bash
pnpm --filter api test -- src/modules/reviews/reviews-sync.service.spec.ts src/modules/reviews/reviews.controller.spec.ts
# Test Files: 2 passed (2)
# Tests:      12 passed (12)
# Time:       1.45s
```

### 8.2. Frontend Test Suites (`apps/web`)

| Test Suite File                                                                                                                                                 | Test Cases / IDs             | Scenarios Covered                                                                                                                  |
| :-------------------------------------------------------------------------------------------------------------------------------------------------------------- | :--------------------------- | :--------------------------------------------------------------------------------------------------------------------------------- |
| [`offlineDatabase.spec.ts`](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/apps/web/src/services/offline/__tests__/offlineDatabase.spec.ts)               | `TC-IDB-001` to `TC-IDB-010` | Deck/card CRUD, due date queries, review queue persistence, media storage, 45MB LRU sweep, preferences, storage quota estimation.  |
| [`clientSm2Engine.spec.ts`](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/apps/web/src/services/offline/__tests__/clientSm2Engine.spec.ts)               | `TC-SRS-001` to `TC-SRS-006` | SM-2 calculation parity, Again/Hard reset, Good/Easy progression, Ease factor floor ($1.30$), Easy bonus multiplier ($1.3\times$). |
| [`precacheManager.spec.ts`](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/apps/web/src/services/offline/__tests__/precacheManager.spec.ts)               | `TC-PCM-001` to `TC-PCM-003` | Deck caching, card download, audio prefetch, due card background precaching, and removal.                                          |
| [`reconnectionSyncEngine.spec.ts`](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/apps/web/src/services/offline/__tests__/reconnectionSyncEngine.spec.ts) | `TC-RSE-001` to `TC-RSE-004` | Exponential backoff ($5\text{s} \to 60\text{s}$), online listener, batch submission, and failure retry dispatching.                |
| [`OfflineSyncPill.spec.tsx`](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/apps/web/src/components/pwa/__tests__/OfflineSyncPill.spec.tsx)               | `TC-UI-001` to `TC-UI-004`   | UI state rendering: All synced, Offline queued count, Syncing spinner, and manual sync click handler.                              |

```bash
pnpm --filter web test -- offlineDatabase clientSm2Engine precacheManager reconnectionSyncEngine OfflineSyncPill
# Test Files: 5 passed (5)
# Tests:      27 passed (27)
# Time:       1.82s
```

---

## 9. Rollback & Troubleshooting

### 9.1. Database & Schema Compatibility

- The PWA sync engine operates on existing database models (`UserCardProgress`, `ReviewLog`, `UserStreak`, `UserActivityLog`).
- No destructive PostgreSQL migrations or schema additions are required.
- Rollback: Reverting backend code restores single-review mode (`POST /api/v1/reviews/submit`) without database data loss.

### 9.2. Troubleshooting Checklist

| Symptom                                          | Probable Cause                                                                | Remediation                                                                                                      |
| :----------------------------------------------- | :---------------------------------------------------------------------------- | :--------------------------------------------------------------------------------------------------------------- |
| **`400 Bad Request: Future timestamp detected`** | User's client device clock is fast by $>5$ minutes relative to server NTP.    | Enable automatic network time synchronization on client operating system.                                        |
| **Audio fails to play while offline**            | Audio file was not precached or network was interrupted during deck download. | `TtsAudioPlayer` falls back to browser Web Speech Synthesis API. Re-toggle deck offline switch when back online. |
| **Pending reviews queue not clearing**           | JWT token expired during offline session, causing 401 on sync attempt.        | User logs in again. Pending reviews remain in `review_queue` and sync immediately upon re-authentication.        |
| **IndexedDB quota exceeded on mobile**           | Heavy audio caching on storage-constrained device.                            | `runLruMediaSweep()` automatically prunes audio cache down to 36 MB (80% target). Text cards remain intact.      |

---

## 10. Authors & Sign-off

- **Implemented by**: AI Pair Programmer (Antigravity)
- **Reviewed & Signed-off by**: Adversarial Senior Code Reviewer ([Grade A+, 99/100](../../reviews/code-review-pwa-offline-mode.md))
- **Date**: 2026-08-24
- **Status**: Hoàn thành (`Delivered`)
