# Handover Brief: Progressive Web App (PWA) & Offline Study Mode

- **Feature Slug**: `pwa-offline-mode`
- **Target User Story**: `US-ECO-04`
- **Baseline Version**: 1.0 (Draft ready for User Sign-Off)
- **Date**: 2026-08-24
- **Lead BA / Domain Architect**: Senior Business Analyst & Domain Architect

---

## 1. Specification Document Suite

The business analysis and domain specification phase for `US-ECO-04` is complete and fully validated:

| Document                             | Path                                                 | Primary Audience                       |
| ------------------------------------ | ---------------------------------------------------- | -------------------------------------- |
| **Business Requirements (BRD)**      | [spec/brd.md](./spec/brd.md)                         | Leadership, Product Owners             |
| **Product Requirements (PRD)**       | [spec/prd.md](./spec/prd.md)                         | Product Designers, UI/UX, QA           |
| **Software Requirements (SRS)**      | [spec/srs.md](./spec/srs.md)                         | Frontend/Backend Engineers, Architects |
| **User Stories & Scenarios**         | [spec/user-stories.md](./spec/user-stories.md)       | QA Automation, Developers              |
| **Validation & Traceability Matrix** | [05-validation-matrix.md](./05-validation-matrix.md) | Tech Leads, QA Leads                   |
| **Risk Register & Assumptions**      | [04-risks-assumptions.md](./04-risks-assumptions.md) | Engineering Leads, DevOps              |
| **Domain Model & ERD**               | [03-domain-model.md](./03-domain-model.md)           | Fullstack Developers                   |
| **Gap Analysis (AS-IS / TO-BE)**     | [02-gap-analysis.md](./02-gap-analysis.md)           | System Architects                      |
| **Elicitation Baseline**             | [01-elicitation.md](./01-elicitation.md)             | Core Stakeholders                      |

---

## 2. What Is Being Built

1. **Installable PWA Shell**: Web App Manifest (`manifest.webmanifest`) and Service Worker Workbox precaching for standalone desktop and mobile installation.
2. **Client-Side IndexedDB Database (`WordStreakOfflineDB`)**: 5 object stores (`offline_decks`, `offline_cards`, `review_queue`, `cached_media`, `pwa_preferences`) managing offline state with a **50 MB** hard storage quota and automated LRU media eviction.
3. **Hybrid Pre-Caching Engine**: Automatic background caching of daily due cards upon dashboard visit, alongside manual "Make available offline" full-deck downloads.
4. **Offline SM-2 Study Execution**: Zero-latency (<16ms) flashcard flipping, local rating evaluation, and instantaneous client SM-2 interval calculations without server roundtrips.
5. **Universal Pronunciation Fallback**: Instant fallback to browser-native **Web Speech Synthesis API** (`speechSynthesis`) with visual `🔊 [TTS]` badge when offline MP3 audio is uncached.
6. **Atomic Batch Sync & 48-Hour Streak Reconciliation**: Server endpoint `POST /api/v1/reviews/sync-offline` that processes queued reviews atomically, backfills calendar days within a **48-hour tolerance window**, and applies strict anti-abuse validations (clock drift $\le 5\text{min}$, max 500 XP batch cap).
7. **Obsidian Minimalist UX**:
   - Floating Obsidian Status Pill in Topbar (`Offline • N queued` -> `Syncing...` -> `All synced`).
   - Contextual Obsidian Pill PWA Install Banner appearing strictly after the user's 1st completed study session (with 7-day snooze and permanent dismissal).
8. **Secure Multi-User Logout**: Pre-logout warning for un-synced reviews, followed by unconditional IndexedDB database purge (`deleteDatabase`) on confirmed logout.

---

## 3. What Is Explicitly Out of Scope (Won't-Have)

- ❌ **Offline AI Card Generation**: Generating new cards via LLMs requires active cloud connectivity (Google Gemini Flash).
- ❌ **Offline Deck Creation / Card Editing**: Modifying card text definitions or creating new decks offline is excluded to avoid complex two-way CRDT/text-merge conflicts.
- ❌ **Peer-to-Peer Deck Sharing**: Local WebRTC / Bluetooth deck exchange.
- ❌ **Offline Speech Recognition Audio Grading**: Heavy in-browser WASM audio speech scoring.

---

## 4. Known Accepted Risks & Mitigations

- **RISK-PWA-001 (Clock Tampering & Streak Farming)**: Mitigated via server-side 48h limit, monotonic timestamps, rate limit (1 review / 5s), and 500 XP batch ceiling.
- **RISK-PWA-002 (Storage Quota Exhaustion)**: Mitigated via hard 50MB quota cap with LRU eviction of old audio blobs; review queue is strictly protected.
- **RISK-PWA-004 (Shared Workstation Privacy)**: Mitigated via mandatory IndexedDB wipe upon logout.

---

## 5. Next Step

Handoff to the Technical Architect & Development Team (or `speckit-specify`) to generate technical implementation artifacts:

1. `contracts/` (API and IndexedDB TypeScript contracts)
2. `plan.md` (Implementation Architecture Plan)
3. `tasks.md` (Executable Task Breakdown)
4. `test-plan.md` (Playwright E2E & Jest Unit/Integration Test Plan)
