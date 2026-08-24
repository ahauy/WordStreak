# Elicitation Record: Progressive Web App (PWA) & Offline Study Mode

- **Feature Slug**: `pwa-offline-mode`
- **Epics / User Stories**: `EPIC-05: Ecosystem & Platform` / `US-ECO-04: PWA & Offline Study Mode`
- **Protocol Depth**: Full Feature (Stages 1–8)
- **Date**: 2026-08-24
- **Lead BA / Domain Architect**: Senior Business Analyst & Domain Architect

---

## Stage 1 — Business Value

### 1. Problem Statement & Pain Points

- **Context**: WordStreak learners frequently review flashcards during transit (commuting on subways/buses, flights, elevators) or in areas with intermittent/unstable cellular data.
- **Pain Points**:
  1. **Session Disruption & Frustration**: When internet drops during an active study or review session, the web app stalls, card flips freeze, audio pronunciation fails, and reviews cannot be submitted.
  2. **Broken Streak Anxiety**: Learners fear losing their multi-week learning streak if they study while offline and their activity fails to register with the server before midnight.
  3. **High Web Latency**: Repeatedly fetching card assets and audio clips across high-latency mobile networks degrades the smooth, gamified spaced-repetition flow.
  4. **Friction of Web Access**: Requiring users to open a browser tab, navigate to the URL, and log in increases friction compared to a native app icon on the home screen.

### 2. Target Personas

- **Persona A (Commuter Khoa - Daily Subway Learner)**:
  - Takes the metro daily where underground cellular reception drops out completely.
  - Wants to pull out his phone, tap the WordStreak app icon on his home screen, and complete his 20 daily due cards seamlessly without waiting for reconnects.
- **Persona B (Frequent Flyer Mai - Business Traveler)**:
  - Frequently on airplanes with airplane mode activated.
  - Wants to pre-download full decks ("IELTS Band 8.0") before boarding, review 100+ cards in-flight, and have her streak, XP, and SRS intervals automatically synced once landing.
- **Persona C (Shared Tablet Learner An)**:
  - Studies on a shared family iPad or library workstation.
  - Expects offline capability while studying, but requires that when logging out, all cached personal deck snapshots and progress queues are wiped clean to preserve privacy.

### 3. Success Metrics & Key Results (OKRs)

- **Primary Retention Metric**: Increase 30-day learner retention by **+18%** among mobile and commuter cohorts.
- **Completion Rate**: Reduce offline/unstable-connection session drop-off rate from **34% to < 2%**.
- **Sync Reliability**: **99.95%** successful zero-data-loss reconciliation rate for offline review queues upon network reconnection.
- **Performance**:
  - Offline card interaction latency (flip, rating, next card) under **16ms** (60 FPS fluid interaction).
  - PWA Lighthouse score: **100/100** for PWA capability, **>= 95** for Performance and Accessibility.
  - Initial cold cache load of due cards: **< 150ms** from local IndexedDB.

---

## 6-Pillar Domain Elicitation

### Pillar 1 — Personas, Actors & RBAC

- **Guest / Unauthenticated Explorer**:
  - Can install PWA shell to home screen / desktop.
  - Can experience public demo decks cached in Service Worker runtime.
  - Cannot access personalized review queues, offline sync queues, or background synchronization.
- **Authenticated Learner (Free & Pro)**:
  - Automatically receives auto-cached daily Due Cards in local storage upon visiting dashboard.
  - Can toggle "Make available offline" on any personal or subscribed deck to cache full card assets and metadata.
  - Can conduct full SM-2 review sessions while completely disconnected.
  - Enqueues review events to local IndexedDB queue (`LocalCardReviewQueue`) with optimistic client-side SM-2 calculations.
  - Triggers automatic background sync upon `window.online` or Service Worker Background Sync events.
- **System Actor (Service Worker & Sync Manager)**:
  - Intercepts fetch requests for static assets, scripts, styles, and card media (Cache-First / Stale-While-Revalidate).
  - Manages quota enforcement (max 50MB per origin in IndexedDB for deck data and audio cache) with Least Recently Used (LRU) eviction for media.
  - Reconciles queued review payloads with `/api/v1/reviews/sync-offline` endpoint atomically.

---

### Pillar 2 — State Machine & Lifecycles

#### A. PWA Installation Lifecycle

1. `NOT_ELIGIBLE`: Browser does not support `BeforeInstallPromptEvent` or PWA criteria not yet met.
2. `ELIGIBLE_PENDING_TRIGGER`: PWA install criteria met; user has completed 0 study sessions. Banner is suppressed to prevent early prompt fatigue.
3. `PROMPT_DISPLAYED`: User completes their 1st study session (`SESSION_COMPLETED`). A subtle Obsidian pill prompt banner appears at the top/bottom of the interface.
4. `SNOOZED`: User selects "Remind me later" -> prompt hidden for 7 calendar days.
5. `DISMISSED`: User selects "Don't show again" -> prompt permanently suppressed in `localStorage`.
6. `INSTALLED`: User clicks "Install App" -> native browser prompt accepted -> app installed to home screen / standalone mode.

#### B. Local Review Queue & Sync Lifecycle

1. `QUEUED_OFFLINE`: Review action performed while disconnected. SM-2 calculation computed optimistically, card removed from local due queue, and review payload recorded in IndexedDB `review_queue` with status `PENDING`.
2. `SYNC_TRIGGERED`: Network connectivity restored (`window.online` event or visibility change) -> Sync engine initiates batch reconciliation payload to backend.
3. `SYNCING`: Request in-flight. Topbar shows `Syncing...` animated pill. New reviews completed during this state append to queue safely.
4. `SYNC_SUCCESS`: Backend responds `200 OK` with verified streak/XP diff -> Queue entries purged from IndexedDB, UI transitions to `All synced` (auto-fades after 3 seconds).
5. `SYNC_PARTIAL_CONFLICT`: Specific cards were deleted/modified on server -> Server applies deterministic conflict rules, returns reconciliation report, client evicts stale items and confirms sync.
6. `SYNC_RETRY_SCHEDULED`: Network interrupted or server returns 5xx error -> Exponential backoff retry scheduled (5s, 15s, 30s, 60s); queue entries remain intact and never discarded.

---

### Pillar 3 — Business Rules & Algorithms

- **BR-PWA-001 (Hybrid Pre-caching Strategy)**:
  - **Auto-Cache**: Whenever an authenticated user opens the dashboard or review interface while online, the system automatically fetches and caches all cards due today (`status = NEW | LEARNING | DUE`) into IndexedDB store `offline_cards`.
  - **Manual Deck Pre-cache**: Users can toggle "Make available offline" (`isOfflineAvailable = true`) on individual decks. This triggers full snapshot download of all cards, phonetic texts, and media references for that deck.
- **BR-PWA-002 (Storage Quota & LRU Media Eviction)**:
  - The client storage allocated for WordStreak offline cache is hard-capped at **50 MB**.
  - Eviction order when approaching quota (>= 90% or 45MB):
    1. Expired audio MP3 blobs in `cached_media` (LRU order based on `lastAccessedAt`).
    2. Deck snapshots marked for offline that have not been studied for > 30 days.
  - **CRITICAL RESTRICTION**: Pending items in `review_queue` and active daily due cards MUST NEVER be evicted.
- **BR-PWA-003 (Optimistic Client-side SM-2 Algorithm)**:
  - During offline reviews, the client executes the identical SM-2 algorithm as `SrsService.calculateSm2`:
    - Ease factor update: $EF' = \max(1.3, EF + (0.1 - (5 - \text{grade}) \times (0.08 + (5 - \text{grade}) \times 0.02)))$
    - Repetitions & Interval calculation ($I_1 = 1, I_2 = 6, I_n = \text{round}(I_{n-1} \times EF')$).
    - Grade mapping: 1 (Again $\to 2$), 2 (Hard $\to 3$), 3 (Good $\to 4$), 4 (Easy $\to 5$).
  - Results update local IndexedDB immediately, enabling smooth multi-card study sessions without network roundtrips.
- **BR-PWA-004 (48-Hour Streak Reconciliation Tolerance Window)**:
  - Reviews performed offline store an immutable ISO-8601 client timestamp (`reviewedAtClient`) and client IANA timezone (`clientTimezone`).
  - Upon reconnection and sync, the server accepts review timestamps within a **48-hour tolerance window** ($T_{\text{server}} - T_{\text{client}} \le 48\text{h}$) to reconstruct daily streaks for missed calendar days.
  - Submissions exceeding 48 hours still record card SRS progress and XP, but will not retroactively restore broken streaks beyond the 48h boundary.
- **BR-PWA-005 (Anti-Abuse Protection for Offline Reviews & XP)**:
  - To prevent clock tampering (e.g. changing device time backwards to farm streak freezes or fake reviews):
    - Timestamps in `review_queue` must be monotonically increasing per session.
    - Rate limit: Maximum 1 valid review per card per 5 seconds.
    - Server verifies that total XP awarded in an offline batch cannot exceed 500 XP per offline sync payload without secondary anomaly flagging.
    - Client timestamp cannot be set in the future relative to server time ($T_{\text{client}} \le T_{\text{server}} + 5\text{min}$ buffer for clock drift).
- **BR-PWA-006 (Deterministic Conflict Resolution on Sync)**:
  - **Case A (Card Deleted on Server)**: If a card was deleted on the server while the client was offline, the offline review for that card is discarded silently; XP is credited, and no crash occurs.
  - **Case B (Card Content Edited on Server/Other Device)**: If card definitions, phonetics, or sentences were updated on the server, the server preserves the updated card content, while applying the offline review's SRS progress (interval, ease factor, repetitions).
  - **Case C (Concurrent Reviews on Multiple Devices)**: If reviews for the same card were submitted from two devices while offline, the review with the later timestamp ($T_{\text{client}}$) wins for SRS scheduling; both reviews generate immutable `ReviewLog` entries.
- **BR-PWA-007 (Universal Pronunciation TTS Fallback)**:
  - When offline and an audio MP3 blob is not present in `cached_media`:
    - The client immediately falls back to the browser/OS native **Web Speech Synthesis API** (`window.speechSynthesis`), utilizing an English voice locale (`en-US` / `en-GB`).
    - The UI displays a subtle indicator icon (`🔊 [TTS]`) to inform the user that native speech synthesis is active.
- **BR-PWA-008 (Secure Logout & IndexedDB Purge)**:
  - When a user initiates a logout while un-synced reviews exist in `review_queue`:
    - A modal alert warns: _"You have N un-synced reviews. Logging out now will discard these offline reviews. Do you want to sync now or discard?"_
  - Upon confirmed logout, all personal stores in IndexedDB (`offline_decks`, `offline_cards`, `review_queue`, `cached_media`) are completely wiped to prevent data leakage on shared devices.

---

### Pillar 4 — Workflows & Edge Cases

- **WF-PWA-1 (Happy Path - Commuter Offline Study & Auto-Sync)**:
  1. User opens WordStreak while online; today's 20 due cards auto-cache to IndexedDB.
  2. User enters subway (loses network connection). Topbar pill transitions to `Offline • 0 queued`.
  3. User completes 20 card reviews. Each rating computes SM-2 locally, updates UI, and enqueues to `review_queue`. Topbar pill updates to `Offline • 20 queued`.
  4. User exits subway and reconnects to cellular data (`window.online` event fires).
  5. Sync engine triggers atomic batch POST `/api/v1/reviews/sync-offline`.
  6. Topbar pill changes to `Syncing...`.
  7. Backend responds `200 OK` (streaks updated, XP credited).
  8. Topbar pill changes to `All synced` with checkmark, fades after 3s.
- **WF-PWA-2 (Manual Full Deck Offline Pre-caching)**:
  1. User navigates to Deck Detail page ("TOEFL High-Frequency").
  2. User clicks toggle "Make available offline".
  3. System downloads deck snapshot (150 cards + phonetics) into `offline_decks` and `offline_cards`.
  4. System fetches audio pronunciation files in background, storing up to quota limit.
  5. UI displays badge `Offline Ready` with downloaded card count.
- **WF-PWA-3 (Audio Fallback During Offline Study)**:
  1. User reviews a card offline where audio MP3 was not pre-cached.
  2. User presses the "Listen" button.
  3. System detects cache miss in `cached_media` and absence of network.
  4. System invokes `speechSynthesis.speak(new SpeechSynthesisUtterance(card.word))`.
  5. Audio plays clearly through native TTS; study session continues without errors.
- **WF-PWA-4 (Network Interruption During Batch Sync)**:
  1. Sync payload starts transmitting 15 reviews. Connection drops after 500ms.
  2. Request times out; sync engine catches error, leaves all 15 reviews in `review_queue`.
  3. Exponential backoff timer set; next attempt occurs when network stabilizes.
- **WF-PWA-5 (Storage Quota Exceeded)**:
  1. User attempts to download a large 500-card deck with audio.
  2. IndexedDB storage reaches 48MB (>= 90% threshold).
  3. LRU eviction sweeps unused media blobs from older decks.
  4. If storage remains constrained, user receives toast notification: _"Storage limit reached (50MB). Deck cards saved, audio will use native speech synthesis."_

---

### Pillar 5 — Entities, Data Boundaries & Privacy

- **Client-Side IndexedDB Database (`WordStreakOfflineDB`, Version 1)**:
  1. `offline_decks`: `id` (PK), `title`, `description`, `color`, `icon`, `isOfflineAvailable`, `totalCards`, `cachedAt`.
  2. `offline_cards`: `id` (PK), `deckId` (Index), `word`, `meaning`, `phonetic`, `audioUrl`, `exampleSentence`, `collocations`, `mnemonic`, `imageUrl`, `status`, `interval`, `easeFactor`, `repetitions`, `nextReviewDate`.
  3. `review_queue`: `id` (PK, UUID), `userId`, `cardId`, `rating`, `interval`, `easeFactor`, `repetitions`, `reviewedAtClient`, `clientTimezone`, `status` (`PENDING` | `SYNCING` | `FAILED`), `retryCount`.
  4. `cached_media`: `url` (PK), `blob` (Binary), `mimeType`, `sizeBytes`, `lastAccessedAt`.
  5. `pwa_preferences`: `key` (PK), `value` (JSON, e.g. `installPromptDismissed`, `lastPromptShownAt`).
- **Privacy & Shared Device Security**:
  - No authentication credentials or unhashed tokens stored in IndexedDB.
  - On user logout, `indexedDB.deleteDatabase('WordStreakOfflineDB')` is executed immediately.

---

### Pillar 6 — UX & Non-Functional Requirements

- **Design System & Visual Language**:
  - WordStreak Minimalist Design System:
    - Pure white canvas `#ffffff`, dark neutral `#111827`, subtle border `#e5e5e5`.
    - Accent: Obsidian `#000000` with subtle border contrast.
    - Typography: `Nunito` for headings/score badges, `Inter` for functional controls and body.
  - **PWA Install Prompt**: Obsidian pill banner (`7-day snooze`, `Dismiss forever`, `Install App`).
  - **Offline Status Pill**: Floating Obsidian/slate pill in Topbar:
    - State 1: `🟢 Online` (Hidden by default, clean header).
    - State 2: `⚪ Offline • N queued` (Visible when offline).
    - State 3: `🔄 Syncing...` (Pulsing icon during active sync).
    - State 4: `✅ All synced` (Brief confirmation toast/pill).
- **Performance Targets**:
  - Card flip animation & local rating response: **< 16ms** (60 FPS).
  - IndexedDB read latency: **< 10ms** per card batch.
  - Service Worker cache response for static shell: **< 50ms**.
- **Observability**:
  - Client logs sync metrics (`sync_duration_ms`, `queue_size`, `conflict_count`, `tts_fallback_count`).
  - Backend logs `/api/v1/reviews/sync-offline` latency, batch sizes, and streak backfill anomalies.

---

## Assumptions Confirmed

- **ASM-PWA-001**: Modern browsers (Chrome, Safari iOS 16.4+, Edge, Firefox Android) support PWA installation, Service Worker Fetch interception, and IndexedDB storage.
- **ASM-PWA-002**: Web Speech Synthesis API (`window.speechSynthesis`) is available across >= 98% of target modern mobile and desktop browsers.
- **ASM-PWA-003**: A 50 MB client-side storage quota is safe, well within browser origin limits (typically 500MB–1GB+), and sufficient for ~2,000 flashcards and 300+ compressed audio clips.
- **ASM-PWA-004**: SM-2 client logic and server logic will share exact arithmetic formulas and parameter constraints to guarantee deterministic outcomes.
- **ASM-PWA-005**: 48 hours is the optimal tolerance window balancing user streak forgiveness against gamification integrity.
- **ASM-PWA-006**: Service Worker Background Sync API will be utilized where supported (Chromium), with fallback to `window.addEventListener('online')` on WebKit/Safari.
- **ASM-PWA-007**: PWA install banner is triggered exclusively after the 1st completed study session to maximize conversion while avoiding premature friction.
- **ASM-PWA-008**: User logout explicitly purges IndexedDB to guarantee multi-user workstation privacy.

---

## Open Questions (Resolved)

- **Q1**: What happens if the server deletes a card while a user reviewed it offline?
  - _Decision_: Deterministic discard with XP preservation; client evicts stale local copy on sync response.
- **Q2**: Should full decks be auto-cached or manual?
  - _Decision_: Hybrid strategy: Auto-cache due cards for the day; manual toggle for full decks.
- **Q3**: How should offline streaks handle device clock cheating?
  - _Decision_: Strict anti-abuse rules: monotonic client timestamps, 48h limit, maximum 1 review per 5s, server-side sanity checks.
