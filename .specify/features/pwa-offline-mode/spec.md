# Technical Specification: Progressive Web App (PWA) & Offline Study Mode

- **Feature Slug**: `pwa-offline-mode`
- **Target User Story**: `US-ECO-04` (Epic: `EPIC-05: Ecosystem & Platform`)
- **Status**: SPECIFIED
- **Version**: 1.0
- **Date**: 2026-08-24
- **Lead BA / Architect**: Senior Business Analyst & Domain Architect

---

## 1. Feature Overview

The **Progressive Web App (PWA) & Offline Study Mode** subsystem provides WordStreak learners with continuous, zero-latency vocabulary practice regardless of internet connectivity. It converts the WordStreak React 19 web application into an installable, offline-capable Progressive Web App with an offline-first SuperMemo-2 (SM-2) spaced repetition engine, local IndexedDB persistence, background synchronization, automated 48-hour streak backfill reconciliation, and speech synthesis fallbacks.

### Core Objectives & Business Value

1. **Zero-Friction Offline Practice**: Eliminate review interruption during commutes (subways, flights, elevator rides, remote locations) with client-side card rating (< 16ms).
2. **Habit & Streak Protection**: Reconcile offline reviews within a 48-hour tolerance window to maintain daily study streaks and XP progression without penalizing intermittent connectivity.
3. **Multi-Platform App Experience**: Provide home-screen installation across Android, iOS, iPadOS, macOS, Windows, and Linux without native app store friction.
4. **Data Privacy & Storage Hygiene**: Guarantee zero persistent auth credentials in IndexedDB, hard-cap media storage to 50MB with LRU eviction, and support atomic database purging upon logout.

---

## 2. Target Personas

| Persona                                | Environment & Behavior                                      | Primary Need                                                                                             |
| :------------------------------------- | :---------------------------------------------------------- | :------------------------------------------------------------------------------------------------------- |
| **Commuter Khoa** (24, Mobile)         | Daily 45-minute subway commute with dead zones              | Instant offline deck access, background due-card pre-caching, auto-sync when walking out of the station. |
| **Frequent Flyer Mai** (29, Tablet)    | Long-haul domestic & international flights in Airplane Mode | Full-deck offline download toggle, native Web Speech TTS fallback when audio blobs are omitted.          |
| **Shared Learner An** (19, Library PC) | Public lab or shared family Chromebook                      | Automatic cache wipe on logout, un-synced review warning modal to prevent accidental data loss.          |

---

## 3. User Stories & Acceptance Criteria

### US-PWA-001: Auto-caching Daily Due Cards for Offline Access

**As an** Authenticated Learner  
**I want** my daily due cards to automatically cache to my device when I visit the app online  
**So that** I can immediately study them later even if my network drops unexpectedly  
**Traces to**: `REQ-PWA-003`, `REQ-PWA-004`

- **Scenario 1 (Happy Path - Automatic Pre-cache on Hub/Dashboard Load)**
  - **Given** I am an authenticated learner with 15 due cards today
  - **When** I open the WordStreak dashboard or Study Hub while connected to the internet
  - **Then** the system fetches my due cards in the background and writes them into `WordStreakOfflineDB` (`offline_cards`)
  - **And** each record includes word, meaning, phonetic, example sentences, collocations, mnemonics, and current SM-2 state (`interval`, `easeFactor`, `repetitions`, `nextReviewDate`).
- **Scenario 2 (Zero Due Cards Today)**
  - **Given** I have completed all due cards for the day and have 0 due cards
  - **When** the auto-cache routine triggers
  - **Then** the system fetches and writes up to `dailyGoal` new cards (e.g. 10 cards) into `offline_cards` so fresh vocabulary is available offline.

---

### US-PWA-002: Offline Flashcard Review with Instant SM-2 Calculation

**As an** Offline Learner  
**I want** to flip flashcards, select ratings (Again, Hard, Good, Easy), and have intervals calculated locally  
**So that** I enjoy a fluid, zero-latency review session without any network connection  
**Traces to**: `REQ-PWA-006`, `REQ-PWA-007`

- **Scenario 1 (Happy Path - Smooth Offline Flashcard Review)**
  - **Given** my device is in airplane mode (offline) and I have 10 cached due cards
  - **When** I start a review session and rate a card as "Good" (Rating 3)
  - **Then** the card flips and transitions to the next card in **< 16 ms**
  - **And** the client SM-2 algorithm calculates the next interval and updates the card status in `offline_cards`
  - **And** an immutable review record is appended to `review_queue` in IndexedDB with status `PENDING`
  - **And** the Topbar status pill updates to show `Offline • 1 queued`.
- **Scenario 2 (Session Completion Offline)**
  - **Given** I complete all 10 offline cards in the queue
  - **When** the final card is rated
  - **Then** the completion summary screen renders immediately with total cards reviewed, local XP earned, and a notice _"10 reviews queued for sync"_.

---

### US-PWA-003: Automatic Background Sync & 48-Hour Streak Protection

**As an** Active Learner  
**I want** my offline reviews to automatically synchronize when my connection is restored  
**So that** my spaced repetition schedule is updated and my daily streak is protected  
**Traces to**: `REQ-PWA-009`, `REQ-PWA-010`

- **Scenario 1 (Happy Path - Automatic Reconnect Sync within 48h)**
  - **Given** I completed 20 reviews offline yesterday while in airplane mode ($T_{\text{server}} - T_{\text{client}} = 18\text{h}$)
  - **When** my device reconnects to Wi-Fi
  - **Then** the client sync engine batches all 20 reviews and sends `POST /api/v1/reviews/sync-batch`
  - **And** the Topbar status pill animates to `🔄 Syncing (20)...`
  - **And** the server processes the batch atomically, backfills yesterday's streak activity, and awards XP
  - **And** the Topbar status pill updates to `✅ All synced` (fading after 3s) and `review_queue` is cleared.
- **Scenario 2 (Reconnection Timeout / Server Error)**
  - **Given** the sync engine attempts to transmit 15 queued reviews
  - **When** the server returns an HTTP 500 error or the network drops mid-request
  - **Then** all 15 reviews remain safely intact in `review_queue`
  - **And** the sync engine schedules an exponential backoff retry (5s, 15s, 30s, 60s)
  - **And** the Topbar displays `⚠️ Sync paused • Tap to retry`.
- **Scenario 3 (Syncing Beyond 48-Hour Tolerance Window)**
  - **Given** reviews were performed offline 72 hours ago ($> 48\text{h}$)
  - **When** the device finally syncs
  - **Then** card SRS intervals and XP are updated in the database
  - **And** the response indicates that historical streak backfill was bypassed due to exceeding the 48h limit.

---

### US-PWA-004: Manual Full Deck Pre-caching for Travel

**As a** Frequent Traveler  
**I want** to manually toggle "Make available offline" on any deck  
**So that** I have the entire deck available for studying on long flights  
**Traces to**: `REQ-PWA-005`

- **Scenario 1 (Happy Path - Pre-downloading 100-Card Deck)**
  - **Given** I am viewing the "TOEFL Academic Vocabulary" deck (100 cards) while online
  - **When** I click the "Make available offline" toggle
  - **Then** the app downloads all 100 cards into `offline_cards` and stores deck metadata in `offline_decks`
  - **And** audio pronunciation files are prefetched in the background into `cached_media`
  - **And** the toggle state updates to active with a badge `Offline Ready (100 cards)`.
- **Scenario 2 (Storage Quota Exceeded at 50MB Cap)**
  - **Given** my IndexedDB cache is at 46 MB (>= 90% threshold)
  - **When** I attempt to download another large deck
  - **Then** the LRU eviction policy automatically deletes the oldest unplayed audio MP3 blobs
  - **And** the text cards are successfully saved without error.

---

### US-PWA-005: Universal Pronunciation Speech Synthesis (TTS) Fallback

**As a** Commuter studying offline  
**I want** pronunciation audio to fall back to my device's native speech synthesis when MP3s are uncached  
**So that** I can always hear how new vocabulary words sound  
**Traces to**: `REQ-PWA-008`

- **Scenario 1 (Cached MP3 Audio Playback)**
  - **Given** an audio MP3 blob is stored in `cached_media` for word "serendipity"
  - **When** I tap the audio button while offline
  - **Then** the local MP3 plays instantly.
- **Scenario 2 (Native Web Speech TTS Fallback)**
  - **Given** the MP3 for word "ubiquitous" is not present in cache and I am offline
  - **When** I tap the audio button
  - **Then** the browser invokes `window.speechSynthesis.speak()` with an English voice (`en-US`/`en-GB`)
  - **And** a visual indicator badge `🔊 [TTS]` is displayed beside the word.

---

### US-PWA-006: Topbar Offline & Sync Status Feedback

**As a** Learner  
**I want** a clear and unobtrusive status pill in the navigation header  
**So that** I always know my network state and pending review count  
**Traces to**: `REQ-PWA-011`

- **Scenario 1 (Network Loss State)**
  - **Given** I am navigating WordStreak and my internet drops
  - **When** the browser `offline` event fires
  - **Then** the Topbar smoothly displays an Obsidian pill: `⚪ Offline • 0 queued`.
- **Scenario 2 (Pending Queue Update)**
  - **Given** I am in offline mode
  - **When** I complete 5 card reviews
  - **Then** the pill dynamically updates to `⚪ Offline • 5 queued`.
- **Scenario 3 (Sync Completion)**
  - **Given** network is restored and 5 reviews are synced
  - **Then** the pill transitions to `🔄 Syncing (5)...` and then `✅ All synced` for 3 seconds before quietly disappearing.

---

### US-PWA-007: Contextual Obsidian PWA Install Prompt Banner

**As an** Engaged Learner  
**I want** to be invited to install the app to my home screen after I experience my first study session  
**So that** I can easily access WordStreak like a native app without annoying premature popups  
**Traces to**: `REQ-PWA-001`, `REQ-PWA-011`

- **Scenario 1 (Trigger on 1st Study Session Completion)**
  - **Given** I am using a PWA-capable browser and have completed 0 prior sessions
  - **When** I finish reviewing my first flashcard set (`completedSessionsCount = 1`)
  - **Then** an Obsidian pill prompt banner appears at the bottom: _"Install WordStreak on your device for instant offline practice"_ with buttons `[Install App]`, `[Remind me later]`, and `[✕]`.
- **Scenario 2 (Snooze Action)**
  - **When** I click `[Remind me later]`
  - **Then** the banner dismisses and will not appear again for 7 calendar days.
- **Scenario 3 (Install Accepted)**
  - **When** I click `[Install App]`
  - **Then** the native browser installation prompt opens, and upon confirmation, the app installs to my home screen / applications menu.

---

### US-PWA-008: Secure Multi-User Logout with Cache Invalidation

**As a** Privacy-Conscious Learner on a Shared Tablet  
**I want** all offline study caches and queues wiped when I log out  
**So that** subsequent users cannot view my personal study history  
**Traces to**: `REQ-PWA-012`

- **Scenario 1 (Logout with 0 Queued Reviews)**
  - **Given** all my offline reviews have synced (`review_queue.length == 0`)
  - **When** I click "Log Out"
  - **Then** the system deletes `WordStreakOfflineDB` via `indexedDB.deleteDatabase()`
  - **And** redirects me cleanly to the login screen.
- **Scenario 2 (Logout with Un-synced Reviews Warning)**
  - **Given** I have 8 un-synced reviews in `review_queue` and attempt to log out
  - **When** I click "Log Out"
  - **Then** a warning modal appears: _"You have 8 un-synced reviews. Logging out now will discard these offline reviews. Discard and Log Out / Cancel"_
  - **And** if I click "Cancel", logout is aborted, allowing me to reconnect and sync first.

---

## 4. Functional Requirements

### `REQ-PWA-001`: Web App Manifest & Standalone Configuration

- **Category**: PWA Infrastructure | **Priority**: Must-Have (P0)
- **Description**: The system must provide a valid `manifest.webmanifest` configured with `display: "standalone"`, `orientation: "portrait-primary"`, theme color `#000000`, background color `#ffffff`, and SVG/PNG icon sets (192x192, 512x512 maskable) to enable home screen installation across mobile and desktop platforms.
- **Derived from**: `BR-PWA-009`, `GAP-F01`, `ASM-PWA-001`
- **Business Rules**: `BR-PWA-009`
- **NFR**: Lighthouse PWA Score = 100/100, WCAG 2.1 AA contrast for icons
- **Dependencies**: None

### `REQ-PWA-002`: Service Worker Lifecycle & Precaching

- **Category**: PWA Infrastructure | **Priority**: Must-Have (P0)
- **Description**: The system must register a Service Worker utilizing Workbox precaching for all core static assets (HTML shell, compiled JS bundles, CSS stylesheets, Google Fonts `Nunito`/`Inter`, and UI SVG icons). The Service Worker must implement `skipWaiting: true` and `clientsClaim: true` for clean update activation.
- **Derived from**: `GAP-F02`, `RISK-PWA-003`, `ASM-PWA-001`
- **Business Rules**: None
- **NFR**: Static shell cache response < 50ms (NFR-PERF-03)
- **Dependencies**: `REQ-PWA-001`

### `REQ-PWA-003`: Client-Side IndexedDB Storage Architecture

- **Category**: Offline Persistence | **Priority**: Must-Have (P0)
- **Description**: The frontend must initialize an IndexedDB database named `WordStreakOfflineDB` (Version 1) containing five object stores: `offline_decks`, `offline_cards` (indexed by `deckId`), `review_queue`, `cached_media`, and `pwa_preferences`.
- **Derived from**: `BR-PWA-001`, `BR-PWA-002`, `GAP-F03`, `ASM-PWA-003`
- **Business Rules**: `BR-PWA-002`
- **NFR**: IndexedDB read latency < 15ms (NFR-PERF-02), zero persistent auth tokens (NFR-SEC-01)
- **Dependencies**: None

### `REQ-PWA-004`: Automatic Due Cards Pre-Caching

- **Category**: Data Synchronization | **Priority**: Must-Have (P0)
- **Description**: Upon dashboard or study hub load while online, the frontend must asynchronously fetch due cards from `/api/v1/reviews/due` and update the `offline_cards` store with cards categorized as `status = NEW | LEARNING | DUE`.
- **Derived from**: `BR-PWA-001`, `GAP-F04`, `ASM-PWA-004`
- **Business Rules**: `BR-PWA-001`, `BR-PWA-002`
- **NFR**: Background fetch execution with zero UI blocking
- **Dependencies**: `REQ-PWA-003`

### `REQ-PWA-005`: Manual Full-Deck Pre-Caching & LRU Management

- **Category**: Offline Persistence | **Priority**: Should-Have (P1)
- **Description**: The system must provide a "Make available offline" toggle on Deck Detail screens. When enabled, all cards and phonetic metadata for that deck must be written to `offline_decks` and `offline_cards`. Audio pronunciation files must be downloaded into `cached_media` up to the **50 MB** storage limit. When usage reaches 90% (45 MB), oldest audio blobs must be evicted using LRU sorting on `lastAccessedAt`.
- **Derived from**: `BR-PWA-001`, `BR-PWA-002`, `GAP-F03`, `RISK-PWA-002`
- **Business Rules**: `BR-PWA-001`, `BR-PWA-002`
- **NFR**: Storage hard-cap 50 MB (NFR-STOR-01)
- **Dependencies**: `REQ-PWA-003`

### `REQ-PWA-006`: Offline SM-2 Spaced Repetition Engine

- **Category**: Core Learning Logic | **Priority**: Must-Have (P0)
- **Description**: When reviewing flashcards offline, the client must compute SRS updates using the identical SM-2 algorithm as `SrsService.calculateSm2` ($EF'$, repetitions, interval, grade mapping 1..4 -> 2..5). The updated status and next review date must immediately update the local card record in `offline_cards`.
- **Derived from**: `BR-PWA-003`, `GAP-F04`, `ASM-PWA-004`
- **Business Rules**: `BR-PWA-003`
- **NFR**: Local card flip and rating transition latency < 16ms (NFR-PERF-01)
- **Dependencies**: `REQ-PWA-003`, `REQ-PWA-004`

### `REQ-PWA-007`: Local Review Persistence Queue

- **Category**: Offline Persistence | **Priority**: Must-Have (P0)
- **Description**: Every completed review action while offline must append an immutable record to the `review_queue` object store in IndexedDB containing `id` (UUID), `userId`, `cardId`, `rating`, calculated `interval`, `easeFactor`, `repetitions`, `reviewedAtClient` (UTC ISO string), `clientTimezone`, and `status = PENDING`.
- **Derived from**: `BR-PWA-003`, `BR-PWA-004`, `GAP-F06`, `ASM-PWA-010`
- **Business Rules**: `BR-PWA-003`, `BR-PWA-005`
- **NFR**: Zero data loss for completed reviews
- **Dependencies**: `REQ-PWA-003`, `REQ-PWA-006`

### `REQ-PWA-008`: Universal Pronunciation Web Speech API Fallback

- **Category**: Multimedia / Audio | **Priority**: Must-Have (P0)
- **Description**: When the user requests audio pronunciation, the system must first attempt playback from `cached_media` (or network stream). If offline and un-cached, the system must immediately trigger `window.speechSynthesis.speak()` using an English utterance (`en-US` / `en-GB`) and render a `🔊 [TTS]` badge.
- **Derived from**: `BR-PWA-007`, `GAP-F05`, `RISK-PWA-006`, `ASM-PWA-002`
- **Business Rules**: `BR-PWA-007`
- **NFR**: Fallback latency < 100ms
- **Dependencies**: None

### `REQ-PWA-009`: Reconnection Auto-Sync Engine & Retry Policy

- **Category**: Data Synchronization | **Priority**: Must-Have (P0)
- **Description**: The client must monitor connectivity events (`window.online`, `visibilitychange`, SW sync). Upon reconnection, the client must batch all `PENDING` items in `review_queue` and dispatch them to `POST /api/v1/reviews/sync-batch`. In case of network failure or HTTP 5xx, the engine must retry using exponential backoff (5s, 15s, 30s, 60s).
- **Derived from**: `BR-PWA-010`, `GAP-F06`, `RISK-PWA-005`, `ASM-PWA-006`
- **Business Rules**: `BR-PWA-010`
- **NFR**: Reliable automatic delivery, zero duplicate execution
- **Dependencies**: `REQ-PWA-007`, `REQ-PWA-010`

### `REQ-PWA-010`: Backend Batch Sync & 48-Hour Streak Reconciliation

- **Category**: Backend / Gamification | **Priority**: Must-Have (P0)
- **Description**: The backend must expose `POST /api/v1/reviews/sync-batch`. It must process review items in an atomic database transaction. For each review with $T_{\text{server}} - T_{\text{reviewedAtClient}} \le 48\text{h}$, it must update `UserCardProgress`, create immutable `ReviewLog` entries, backfill missed calendar days in `UserStreak`, and award XP via `XpService` (capped at 500 XP per payload).
- **Derived from**: `BR-PWA-004`, `BR-PWA-005`, `BR-PWA-006`, `GAP-F06`, `GAP-F07`, `RISK-PWA-001`
- **Business Rules**: `BR-PWA-004`, `BR-PWA-005`, `BR-PWA-006`
- **NFR**: Batch processing latency < 1000ms for 50 items
- **Dependencies**: `REQ-PWA-009`

### `REQ-PWA-011`: Topbar Floating Status Pill & PWA Install Banner

- **Category**: UI / UX Feedback | **Priority**: Must-Have (P0)
- **Description**: The frontend must render a Topbar floating Obsidian status pill reflecting: `Online` (hidden/dot), `Offline • N queued`, `Syncing (N)...`, `All synced` (3s fade), and `Sync paused`. Additionally, the frontend must render an Obsidian pill PWA install banner exclusively after the user completes their 1st study session (with 7-day snooze and permanent dismissal options).
- **Derived from**: `BR-PWA-009`, `GAP-F01`, `GAP-F08`, `ASM-PWA-007`
- **Business Rules**: `BR-PWA-009`
- **NFR**: Zero-flicker CSS transitions, Obsidian Pill design compliance
- **Dependencies**: `REQ-PWA-001`, `REQ-PWA-009`

### `REQ-PWA-012`: Secure Multi-User Logout & Cache Invalidation

- **Category**: Security / Privacy | **Priority**: Must-Have (P0)
- **Description**: When a user initiates logout, if `review_queue` contains un-synced items, a modal warning must appear requiring confirmation. Upon confirmed logout, the client must unconditionally execute `indexedDB.deleteDatabase('WordStreakOfflineDB')` to purge all local cards, decks, queues, and audio blobs.
- **Derived from**: `BR-PWA-008`, `GAP-F03`, `RISK-PWA-004`, `ASM-PWA-008`
- **Business Rules**: `BR-PWA-008`
- **NFR**: Complete cryptographic data sanitization on client
- **Dependencies**: `REQ-PWA-003`, `REQ-PWA-007`

---

## 5. Non-Functional Requirements (NFRs)

### 5.1 Performance & Latency Targets

- **`NFR-PERF-01` (Card Review Latency)**: Local card flip, SM-2 calculation, and transition to next card must execute in $\le 16\text{ms}$ (60 fps frame budget).
- **`NFR-PERF-02` (IndexedDB Query Latency)**: Querying due cards from `offline_cards` must complete in $\le 15\text{ms}$.
- **`NFR-PERF-03` (App Shell Load Time)**: Service worker precached application shell must load in $\le 50\text{ms}$ on repeat visits.
- **`NFR-PERF-04` (Batch Sync Latency)**: Processing a batch of 50 queued reviews on the backend must complete in $\le 1000\text{ms}$.
- **`NFR-PERF-05` (Audio TTS Fallback Latency)**: Speech synthesis fallback must initialize in $\le 100\text{ms}$.

### 5.2 Storage Constraints & Eviction Policy

- **`NFR-STOR-01` (Total Storage Cap)**: Total IndexedDB usage across all stores is hard-capped at **50 MB**.
- **`NFR-STOR-02` (LRU Eviction Trigger)**: When IndexedDB storage reaches 90% (45 MB), an automated Least-Recently-Used (LRU) cleanup sweeps `cached_media` audio blobs based on `lastAccessedAt`. Text flashcard metadata is never evicted.
- **`NFR-STOR-03` (Quota Safety)**: If `navigator.storage.estimate()` is unavailable, the client calculates stored blob byte size manually before insertion.

### 5.3 Security, Privacy & Token Isolation

- **`NFR-SEC-01` (Zero Auth Tokens in Storage)**: No JWT access tokens or refresh tokens shall ever be written to IndexedDB, LocalStorage, or Service Worker cache. Authentication relies strictly on secure, HttpOnly, SameSite cookies or short-lived memory references.
- **`NFR-SEC-02` (Multi-User Data Purging)**: Calling logout must trigger full database deletion (`indexedDB.deleteDatabase('WordStreakOfflineDB')`) preventing cross-account data leaks on shared devices.
- **`NFR-SEC-03` (Payload Validation)**: Backend must validate all `SyncReviewItemDto` entries with `class-validator`, rejecting payloads exceeding 100 reviews or invalid ISO timestamps.

### 5.4 Accessibility (A11y) & Design System Compliance

- **`NFR-A11Y-01` (WCAG 2.1 AA Compliance)**: All status pills, buttons, and badges must meet minimum contrast ratio of 4.5:1 (Obsidian `#000000` on `#ffffff` canvas).
- **`NFR-A11Y-02` (Screen Reader Announcements)**: Connectivity changes (Online/Offline) and sync status changes must be announced via `aria-live="polite"` regions.
- **`NFR-A11Y-03` (Reduced Motion Support)**: Pulse animations and transition effects must adhere to `prefers-reduced-motion: reduce`.
- **`NFR-DS-01` (Obsidian Pill UX)**: All status badges, toasts, and install prompts must strictly use WordStreak's Obsidian pill component (`rounded-full`, thin hairline borders `#e5e5e5`).

### 5.5 Anti-Abuse & Gamification Integrity

- **`NFR-ABUSE-01` (48-Hour Tolerance Window)**: Streak backfill is accepted only if $T_{\text{server}} - T_{\text{reviewedAtClient}} \le 48\text{h}$. Reviews older than 48 hours receive XP and SRS updates but do not resurrect dead streaks.
- **`NFR-ABUSE-02` (Monotonic Timestamp Enforcement)**: Client review timestamps must be strictly monotonic ($T_i < T_{i+1}$) and cannot be dated in the future ($T_{\text{client}} \le T_{\text{server}} + 60\text{s}$).
- **`NFR-ABUSE-03` (Review Speed Throttling)**: A human minimum threshold of 1 review per 5 seconds is enforced. If reviews are logged faster, XP award is discounted.
- **`NFR-ABUSE-04` (Batch XP Hard Cap)**: Total XP awarded from a single sync batch payload is capped at **500 XP**.

---

## 6. Success Criteria & Metrics

1. **Lighthouse PWA Audit**: Achieve 100/100 PWA score across Performance, Accessibility, Best Practices, and PWA criteria.
2. **Offline Study Session Drop-off**: Reduce study session abort rate due to network loss to $< 2\%$.
3. **Sync Reliability**: Attain $\ge 99.95\%$ success rate for queued offline review sync batches upon reconnection.
4. **Offline Retention Lift**: Achieve a $+18\%$ improvement in 30-day mobile learner retention.
5. **Zero Data Leaks**: Zero occurrences of cross-user study card contamination on shared devices.
