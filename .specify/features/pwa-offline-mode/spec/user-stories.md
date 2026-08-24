# User Stories: Progressive Web App (PWA) & Offline Study Mode

- **Feature Slug**: `pwa-offline-mode`
- **Epic**: `EPIC-05: Ecosystem & Platform`
- **Target User Story**: `US-ECO-04`
- **Version**: 1.0-draft
- **Date**: 2026-08-24
- **Audience**: Product Management, Frontend/Backend Developers, QA Automation Engineers

---

### US-PWA-001: Auto-caching Daily Due Cards for Offline Access

**As an** Authenticated Learner
**I want** my daily due cards to automatically cache to my device when I visit the app online
**So that** I can immediately study them later even if my network drops unexpectedly

**Traces to**: `REQ-PWA-003`, `REQ-PWA-004`

**Acceptance Criteria**:

- **Scenario 1 (Happy Path - Automatic Pre-cache on Dashboard Visit)**
  - **Given** I am an authenticated learner with 15 due cards today
  - **When** I open the WordStreak dashboard while connected to the internet
  - **Then** the system fetches my due cards in the background and writes them into `WordStreakOfflineDB` (`offline_cards`)
  - **And** the data includes word, meaning, phonetic, example sentences, and current SM-2 interval state.
- **Scenario 2 (Zero Due Cards Today)**
  - **Given** I have completed all due cards for the day and have 0 due cards
  - **When** the auto-cache routine triggers
  - **Then** the system writes up to `dailyGoal` new cards (e.g. 10 cards) into `offline_cards` so I have fresh vocabulary available offline.

---

### US-PWA-002: Offline Flashcard Review with Instant SM-2 Calculation

**As an** Offline Learner
**I want** to flip flashcards, select ratings (Again, Hard, Good, Easy), and have intervals calculated locally
**So that** I enjoy a fluid, zero-latency review session without any network connection

**Traces to**: `REQ-PWA-006`, `REQ-PWA-007`

**Acceptance Criteria**:

- **Scenario 1 (Happy Path - Smooth Offline Flashcard Review)**
  - **Given** my device is in airplane mode (offline) and I have 10 cached due cards
  - **When** I start a review session and rate a card as "Good" (Rating 3)
  - **Then** the card flips and transitions to the next card in **< 16 ms**
  - **And** the client SM-2 algorithm calculates the next interval and updates the card status in `offline_cards`
  - **And** a review record is appended to `review_queue` in IndexedDB with status `PENDING`
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

**Acceptance Criteria**:

- **Scenario 1 (Happy Path - Automatic Reconnect Sync within 48h)**
  - **Given** I completed 20 reviews offline yesterday while in airplane mode ($T_{\text{server}} - T_{\text{client}} = 18\text{h}$)
  - **When** my device reconnects to Wi-Fi
  - **Then** the client sync engine batches all 20 reviews and sends a `POST /api/v1/reviews/sync-offline` payload
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

**Acceptance Criteria**:

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

**Acceptance Criteria**:

- **Scenario 1 (Cached MP3 Audio Playback)**
  - **Given** an audio MP3 blob is stored in `cached_media` for word "serendipity"
  - **When** I tap the audio button while offline
  - **Then** the local MP3 plays instantly.
- **Scenario 2 (Native Web Speech TTS Fallback)**
  - **Given** the MP3 for word "ubiquitous" is not present in cache and I am offline
  - **When** I tap the audio button
  - **Then** the browser invokes `window.speechSynthesis.speak()` with an English voice
  - **And** a visual indicator badge `🔊 [TTS]` is displayed beside the word.

---

### US-PWA-006: Topbar Offline & Sync Status Feedback

**As a** Learner
**I want** a clear and unobtrusive status pill in the navigation header
**So that** I always know my network state and pending review count

**Traces to**: `REQ-PWA-011`

**Acceptance Criteria**:

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

**Acceptance Criteria**:

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

**Acceptance Criteria**:

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
