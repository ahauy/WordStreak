# Risk Register & Assumptions: Progressive Web App (PWA) & Offline Study Mode

- **Feature Slug**: `pwa-offline-mode`
- **Target User Story**: `US-ECO-04`
- **Date**: 2026-08-24
- **Stage**: Stage 5 — Risk & Contradiction Scanner

---

## 1. Contradiction Scan & Integrity Audit

A comprehensive scan of `01-elicitation.md`, `02-gap-analysis.md`, and `03-domain-model.md` was executed:

| Area Scanned               | Check Performed                                                                                         | Result                                                                                                                 | Status               |
| -------------------------- | ------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- | -------------------- |
| **Logic Contradictions**   | Evaluated SM-2 formulas, streak grace period, rate limits, and quota eviction rules.                    | Verified exact parity between client SM-2 and server `SrsService`. Auto-cache and manual deck caching do not conflict. | **0 Contradictions** |
| **State Deadlocks**        | Audited all states and transitions in `LocalReviewItem`, `PwaInstallPrompt`, and `OfflineDeckSnapshot`. | Every state has deterministic exits, timeouts, and error-recovery transitions. No terminal traps.                      | **0 Deadlocks**      |
| **Backward Compatibility** | Audited existing PostgreSQL schema and REST endpoints (`/api/v1/reviews/submit`).                       | Existing online review pipeline is completely unaffected. Zero destructive database migrations required.               | **100% Compatible**  |

---

## 2. Risk Register

| ID               | Risk Description                                                                                                                                  | Category             | Prob.  | Impact | Mitigation Strategy                                                                                                                                                                                                         |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------- | ------ | ------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **RISK-PWA-001** | **Device Clock Manipulation / Streak Farming**: Learner alters device clock backwards to fake missed streak days or spam XP.                      | Security / Integrity | Medium | Medium | **Mitigated via BR-PWA-004 & BR-PWA-005**: 48h tolerance window limit, strict monotonic timestamps, maximum 1 review per 5s, server-side clock drift buffer ($\le 5\text{min}$), and 500 XP batch cap with anomaly logging. |
| **RISK-PWA-002** | **Browser Storage Quota Exhaustion**: Large decks with audio blobs fill local storage on low-end devices.                                         | Technical            | Low    | Medium | **Mitigated via BR-PWA-002**: 50 MB hard cap with LRU eviction for audio blobs when reaching 90% (45MB). Active review queue and daily due cards are protected from eviction.                                               |
| **RISK-PWA-003** | **Service Worker Stale Assets**: New deployments of the web app serve stale cached bundles to PWA users.                                          | Operational          | Medium | High   | **Mitigated**: Implement Workbox lifecycle with `skipWaiting: true` and `clientsClaim: true`, alongside a toast prompt notifying users when a newer version is ready.                                                       |
| **RISK-PWA-004** | **Shared Workstation Data Privacy Leak**: User B on a shared computer sees User A's cached vocabulary cards.                                      | Privacy              | Medium | High   | **Mitigated via BR-PWA-008**: Unconditional deletion of `WordStreakOfflineDB` upon confirmed logout; pre-logout warning for un-synced reviews.                                                                              |
| **RISK-PWA-005** | **iOS WebKit Background Sync Limitations**: Safari iOS does not support Service Worker `sync` event.                                              | Compatibility        | High   | Low    | **Mitigated**: Multi-event sync trigger listening to `window.online`, `document.visibilitychange`, and app focus events across all browsers.                                                                                |
| **RISK-PWA-006** | **TTS Voice Quality Variance Across Operating Systems**: Native Web Speech Synthesis voices vary widely between Android, iOS, Windows, and macOS. | UX / Quality         | Medium | Low    | **Mitigated via BR-PWA-007**: Audio MP3 caching is prioritized; TTS is purely an offline fallback. Clear `🔊 [TTS]` visual badge informs the learner.                                                                       |

---

## 3. Assumptions & Constraints (Consolidated)

### Consolidated Assumptions

- **ASM-PWA-001**: Modern browsers (Chrome 90+, Safari iOS 16.4+, Firefox 90+, Edge) support Web App Manifests, Service Workers, and IndexedDB v2.
- **ASM-PWA-002**: Native Web Speech Synthesis API (`window.speechSynthesis`) is available in >= 98% of target user agents.
- **ASM-PWA-003**: 50 MB client-side storage quota is safe and sufficient for ~2,000 flashcards and 300+ compressed audio clips.
- **ASM-PWA-004**: SM-2 client logic and server logic share identical arithmetic formulas and parameter constraints to guarantee deterministic outcomes.
- **ASM-PWA-005**: 48 hours is the optimal tolerance window balancing user streak forgiveness against gamification integrity.
- **ASM-PWA-006**: Service Worker Background Sync API will be utilized where supported, with multi-event fallback (`online`, `visibilitychange`) on WebKit/Safari.
- **ASM-PWA-007**: PWA install banner is triggered exclusively after the 1st completed study session to maximize conversion while avoiding premature friction.
- **ASM-PWA-008**: User logout explicitly purges IndexedDB to guarantee multi-user workstation privacy.
- **ASM-PWA-009**: The existing PostgreSQL database schema (`UserCardProgress`, `UserStreak`, `ReviewLog`, `UserActivityLog`) requires zero column alterations.
- **ASM-PWA-010**: All offline sync payloads use atomic transactional writes on the backend to prevent partial state corruption.

### Project & Technical Constraints

- **Framework Constraint**: Frontend must integrate cleanly with React 19, TypeScript, and Vite.
- **Backend Constraint**: Backend sync endpoint must execute within NestJS 11 and Prisma ORM within standard request timeouts (< 2000ms for 100 queued items).
- **Design System Constraint**: UI elements (install banner, status pill, logout warning) must strictly adhere to the WordStreak Obsidian Minimalist Design System (`#000000`, `#ffffff`, `#e5e5e5`, `Nunito`/`Inter`).

---

## 4. MoSCoW Scope Table

### Must-Have (P0 — Sprint Non-Negotiables)

- **P0-1**: Web App Manifest (`manifest.webmanifest`) and Service Worker registration with static shell precaching.
- **P0-2**: IndexedDB database (`WordStreakOfflineDB`) with auto-caching of daily due cards.
- **P0-3**: Full offline SM-2 study session execution with local progress updates and <16ms interaction latency.
- **P0-4**: Local review persistence queue (`review_queue`) in IndexedDB.
- **P0-5**: Automatic reconnection sync engine and backend batch endpoint `POST /api/v1/reviews/sync-offline`.
- **P0-6**: 48-Hour Streak reconciliation tolerance window on backend.
- **P0-7**: Floating Topbar Offline Status Pill (`Offline • N queued` -> `Syncing...` -> `All synced`).
- **P0-8**: Native Web Speech Synthesis (TTS) audio pronunciation fallback.
- **P0-9**: Secure logout warning and unconditional IndexedDB purge.

### Should-Have (P1 — Release Enhancements)

- **P1-1**: Manual "Make available offline" toggle on Deck Detail pages for full-deck pre-caching.
- **P1-2**: Obsidian pill PWA install banner triggered after 1st study session (with 7-day snooze & permanent dismiss).
- **P1-3**: 50MB storage quota enforcement with automated LRU media eviction.

### Could-Have (P2 — Future Iterations)

- **P2-1**: Periodic Background Sync API (Chromium) to auto-refresh due cards overnight.
- **P2-2**: User voice selection settings for Web Speech Synthesis (e.g. British vs American English accent).
- **P2-3**: Custom offline notification alerts when new due cards become available.

### Won't-Have (Explicitly Out of Scope for This Sprint)

- ❌ **Offline AI Card Generation**: Generating new cards via Google Gemini Flash requires active cloud LLM connectivity and is strictly an online feature.
- ❌ **Offline Deck Creation & Editing**: Creating new decks or modifying card definitions while offline is excluded to prevent complex two-way CRDT/text-merge conflicts.
- ❌ **Peer-to-Peer Offline Deck Sharing**: WebRTC / Bluetooth deck exchange between nearby devices.
- ❌ **Offline AI Voice Pronunciation Grading**: Real-time AI pronunciation assessment using speech recognition models in browser WASM.

---

## 5. Exit Checklist

- [x] Full domain model scanned for logic contradictions and state deadlocks (0 found).
- [x] Every risk has a concrete, testable mitigation strategy.
- [x] Backward compatibility checked against existing PostgreSQL schema and endpoints.
- [x] All `ASM-` items consolidated with technical constraints.
- [x] MoSCoW scope table completed with explicit Won't-Have exclusions.
