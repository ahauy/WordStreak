# Test Plan: Progressive Web App (PWA) & Offline Study Mode

**Feature slug**: `pwa-offline-mode`
**Epic**: `EPIC-05: Ecosystem & Platform`
**Target User Story**: `US-ECO-04`
**Baseline version**: 1.0 (SIGNED-OFF)
**Written by**: Senior Backend Developer — TDD Phase
**Traces to**: `.specify/features/pwa-offline-mode/spec/user-stories.md`

> **Mục đích**: Document này mô tả test cases ở dạng Gherkin trước khi viết code.
> Sau khi implement xong, actual test files được viết dựa trên document này.

---

## 1. Test Case Mapping Matrix

| Test ID        | User Story   | Scenario Description                                                                    | Target Test Layer                         | Priority    |
| :------------- | :----------- | :-------------------------------------------------------------------------------------- | :---------------------------------------- | :---------- |
| **TC-PWA-001** | `US-PWA-001` | Pre-cache due cards for offline study on dashboard visit                                | Unit / Service (`PrecacheManager`)        | Must-Have   |
| **TC-PWA-002** | `US-PWA-001` | Auto-cache up to dailyGoal new cards when 0 due cards exist                             | Unit / Service (`PrecacheManager`)        | Must-Have   |
| **TC-PWA-003** | `US-PWA-003` | Successful batch sync of offline reviews (<48h) with SM-2 update & XP                   | Unit / Integration (`ReviewsSyncService`) | Must-Have   |
| **TC-PWA-004** | `US-PWA-003` | 48-hour streak reconciliation across multiple days with freeze protection               | Unit / Integration (`ReviewsSyncService`) | Must-Have   |
| **TC-PWA-005** | `US-PWA-003` | Deleted card conflict resolution (`DELETED_CARD_DROPPED` + 10 XP grant)                 | Unit / Integration (`ReviewsSyncService`) | Must-Have   |
| **TC-PWA-006** | `US-PWA-003` | Anti-abuse clock drift validation (>5min future rejected) and 500 XP cap                | Unit / Integration (`ReviewsSyncService`) | Must-Have   |
| **TC-PWA-007** | `US-PWA-003` | Stale sync beyond 48-hour tolerance window (SRS & XP updated, streak backfill bypassed) | Unit / Integration (`ReviewsSyncService`) | Must-Have   |
| **TC-PWA-008** | `US-PWA-003` | Network/Server 500 failure retains queue & triggers exponential backoff retry           | Unit / Service (`ReconnectionSyncEngine`) | Must-Have   |
| **TC-PWA-009** | `US-PWA-002` | Offline flashcard review with local SM-2 interval calculation (<16ms)                   | Unit / Service (`ClientSm2Engine`)        | Must-Have   |
| **TC-PWA-010** | `US-PWA-002` | Offline study session completion summary screen with queued count                       | Component (`ReviewSessionContainer`)      | Must-Have   |
| **TC-PWA-011** | `US-PWA-004` | Manual full deck pre-caching with deck metadata and audio prefetch                      | Unit / Service (`PrecacheManager`)        | Should-Have |
| **TC-PWA-012** | `US-PWA-004` | 50MB IndexedDB storage quota enforcement and LRU audio blob eviction                    | Unit / Storage (`OfflineDatabase`)        | Must-Have   |
| **TC-PWA-013** | `US-PWA-005` | Instant playback of offline cached MP3 audio                                            | Unit / Component (`TtsAudioPlayer`)       | Should-Have |
| **TC-PWA-014** | `US-PWA-005` | Native Web Speech TTS fallback when audio MP3 is uncached offline                       | Unit / Hook (`useTtsFallback`)            | Must-Have   |
| **TC-PWA-015** | `US-PWA-006` | Topbar status pill updates dynamically on network loss and review rating                | Component (`OfflineSyncPill`)             | Must-Have   |
| **TC-PWA-016** | `US-PWA-006` | Topbar status transitions to syncing and then all-synced (3s auto-dismiss)              | Component (`OfflineSyncPill`)             | Must-Have   |
| **TC-PWA-017** | `US-PWA-007` | Contextual Obsidian PWA install banner prompt after 1st study session                   | Component (`PwaInstallBanner`)            | Should-Have |
| **TC-PWA-018** | `US-PWA-007` | PWA install banner snooze (7 days) and install confirmation trigger                     | Component (`PwaInstallBanner`)            | Should-Have |
| **TC-PWA-019** | `US-PWA-008` | Multi-user logout with 0 queued reviews completely deletes IndexedDB                    | Unit / Storage (`OfflineDatabase`)        | Must-Have   |
| **TC-PWA-020** | `US-PWA-008` | Multi-user logout with pending queue shows un-synced reviews warning modal              | Component (`LogoutWarningModal`)          | Must-Have   |

---

## 2. Unit Tests

### `ReviewsSyncService` (Backend)

#### TC-PWA-003: Batch Sync of Offline Reviews within 48h

```gherkin
Given authenticated learner with 5 offline reviews completed within 18h
  And cards exist in the database with current SM-2 state
When  ReviewsSyncService.syncReviews is invoked with the review batch
Then  all 5 reviews are processed atomically in a Prisma $transaction
  And user card progress records are updated with computed SM-2 intervals
  And immutable ReviewLog entries are recorded with client timestamps
  And XP is awarded for all valid reviews (50 XP)
  And response returns syncedCount = 5, conflictsResolved = 0, totalXpAwarded = 50
```

**File**: `apps/api/src/modules/reviews/reviews-sync.service.spec.ts`
**Priority**: Must-Have
**Traces to**: `US-PWA-003` Scenario 1

---

#### TC-PWA-004: 48-Hour Streak Reconciliation Across Multiple Days

```gherkin
Given user has current streak of 5 days (last active 2 days ago)
  And user completed offline reviews on yesterday and today (within 48h tolerance)
  And user timezone is "Asia/Ho_Chi_Minh"
When  ReviewsSyncService.syncReviews processes the batch
Then  daily activity is reconciled for each unique local calendar date
  And streak is incremented sequentially for yesterday and today (streak becomes 7)
  And milestone freeze bonus is awarded at 7-day streak
  And response reflects streakUpdated = true and currentStreak = 7
```

**File**: `apps/api/src/modules/reviews/reviews-sync.service.spec.ts`
**Priority**: Must-Have
**Traces to**: `US-PWA-003` Scenario 1

---

#### TC-PWA-005: Deleted Card Conflict Resolution

```gherkin
Given batch contains 3 reviews where 1 review references a deleted or inaccessible card
When  ReviewsSyncService.syncReviews processes the batch
Then  the 2 existing cards update their SM-2 progress normally
  And the deleted card progress update is safely discarded
  And a conflict record with action "DELETED_CARD_DROPPED" is generated
  And base +10 XP is granted for learner effort on the deleted card review
  And response returns syncedCount = 2, failedCount = 1, conflictsResolved = 1
```

**File**: `apps/api/src/modules/reviews/reviews-sync.service.spec.ts`
**Priority**: Must-Have
**Traces to**: `US-PWA-003` Scenario 1, Conflict Resolution

---

#### TC-PWA-006: Anti-Abuse Clock Drift and 500 XP Hard Cap

```gherkin
Given a review batch containing review timestamps > 5 minutes in the future
When  ReviewsSyncService.syncReviews is called
Then  BadRequestException is thrown with "Future timestamp detected exceeding clock drift limit"

Given a valid batch of 60 high-score reviews totalling 600 raw XP
When  ReviewsSyncService.syncReviews processes the batch
Then  totalXpAwarded is hard-capped at 500 XP
  And user totalXp is incremented by exactly 500 XP
```

**File**: `apps/api/src/modules/reviews/reviews-sync.service.spec.ts`
**Priority**: Must-Have
**Traces to**: `US-PWA-003` Anti-Abuse Requirements

---

#### TC-PWA-007: Stale Sync Beyond 48-Hour Tolerance Window

```gherkin
Given offline reviews performed 72 hours ago (> 48h limit)
When  ReviewsSyncService.syncReviews processes the batch
Then  card SM-2 intervals and XP are updated in database
  And historical streak backfill is bypassed (streakUpdated = false)
```

**File**: `apps/api/src/modules/reviews/reviews-sync.service.spec.ts`
**Priority**: Must-Have
**Traces to**: `US-PWA-003` Scenario 3

---

### `ClientSm2Engine` (Frontend)

#### TC-PWA-009: Client-Side SM-2 Mathematical Parity

```gherkin
Given an offline card with repetitions = 1, easeFactor = 2.5, interval = 1
When  learner rates the card "Good" (Rating 3)
Then  repetitions becomes 2, interval becomes 6 days, easeFactor remains 2.5
  And calculation matches backend SrsService output exactly
```

**File**: `apps/web/src/services/offline/clientSm2Engine.spec.ts`
**Priority**: Must-Have
**Traces to**: `US-PWA-002` Scenario 1

---

### `OfflineDatabase` (Frontend Storage)

#### TC-PWA-012: LRU Audio Eviction on 50MB Cap

```gherkin
Given IndexedDB cached_media store reaches 46 MB (>= 90% quota)
When  a new deck media download is initiated
Then  LRU eviction purges oldest unplayed audio MP3 blobs until usage <= 35 MB
  And new flashcard text records are stored without error
```

**File**: `apps/web/src/services/offline/offlineDatabase.spec.ts`
**Priority**: Must-Have
**Traces to**: `US-PWA-004` Scenario 2

---

#### TC-PWA-019: Multi-User Logout Database Purge

```gherkin
Given user with 0 un-synced reviews clicks "Log Out"
When  logout action executes
Then  WordStreakOfflineDB is deleted completely via indexedDB.deleteDatabase()
  And client is redirected to login screen
```

**File**: `apps/web/src/services/offline/offlineDatabase.spec.ts`
**Priority**: Must-Have
**Traces to**: `US-PWA-008` Scenario 1

---

## 3. Integration Tests

### `ReviewsController` (HTTP API)

#### TC-PWA-021: POST /api/v1/reviews/sync-batch Authentication & DTO Validation

```gherkin
Given unauthenticated request to POST /api/v1/reviews/sync-batch
When  endpoint is called
Then  returns HTTP 401 Unauthorized

Given authenticated user with invalid payload (invalid rating 5, malformed UUID)
When  endpoint is called
Then  returns HTTP 400 Bad Request with validation error details

Given authenticated user with valid SyncReviewBatchDto
When  endpoint is called
Then  returns HTTP 200 OK with SyncReviewResponseDto envelope
```

**File**: `apps/api/src/modules/reviews/reviews.controller.spec.ts`
**Priority**: Must-Have
**Traces to**: `REQ-PWA-009`, `REQ-PWA-010`

---

## 4. E2E Tests (Playwright)

### Flow: Offline Study Session & Automatic Background Sync

#### TC-PWA-022: Full Offline Review to Online Sync Flow

```gherkin
Given user logs in and visits dashboard while online (caching 10 due cards)
When  browser network mode switches to offline (airplane mode)
  And user reviews 5 flashcards with rating "Good"
Then  review queue increments to 5 pending items
  And Topbar displays "Offline • 5 queued"
When  network mode switches back to online
Then  reconnection sync engine automatically posts batch to /api/v1/reviews/sync-batch
  And Topbar displays "Syncing (5)..." then "All synced"
  And queue is cleared in IndexedDB
```

**File**: `apps/web/e2e/pwa-offline-sync.spec.ts`
**Priority**: Must-Have
**Traces to**: `US-PWA-002`, `US-PWA-003`, `US-PWA-006`

---

## 5. Test Coverage Checklist

- [x] Tất cả `US-PWA-001` through `US-PWA-008` scenarios có TC tương ứng
- [x] Business rules có anti-abuse (clock drift, 500 XP cap, monotonicity) đã có TC kiểm tra
- [x] Error states (400, 401, 500, network drop) có TC
- [x] Idempotency / conflict resolution (deleted cards) có TC
- [x] 48h streak reconciliation logic có TC
- [x] Storage quota (50MB cap, LRU sweep) có TC
