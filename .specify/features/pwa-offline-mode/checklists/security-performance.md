# Security, Performance & Accessibility Checklist: PWA & Offline Study Mode (US-ECO-04)

**Purpose**: Validate performance budgets, storage quotas, cryptographic hygiene, security isolation, and accessibility compliance.  
**Created**: 2026-08-24  
**Feature**: [spec.md](../spec.md) | [plan.md](../plan.md)  
**Lead BA / Domain Architect**: Senior Business Analyst & Domain Architect

---

## 1. Performance & Latency Budgets

- [x] **Local Card Review Latency (`NFR-PERF-01`)**: Local SM-2 calculation and card transition executed within $\le 16\text{ms}$ (60 fps frame budget).
- [x] **IndexedDB Read Latency (`NFR-PERF-02`)**: Querying due cards from `offline_cards` executes in $\le 15\text{ms}$.
- [x] **Workbox Shell Precaching (`NFR-PERF-03`)**: Static shell assets serve from cache in $\le 50\text{ms}$ on repeat loads.
- [x] **Backend Batch Sync Processing (`NFR-PERF-04`)**: Atomic batch processing of 50 queued reviews takes $\le 1000\text{ms}$ in NestJS/Prisma.
- [x] **Web Speech TTS Fallback Latency (`NFR-PERF-05`)**: Browser speech synthesis utterance initialization takes $\le 100\text{ms}$ upon audio cache miss.

---

## 2. Storage Footprint & LRU Eviction

- [x] **Hard Storage Cap (`NFR-STOR-01`)**: Total IndexedDB client footprint is hard-capped at **50 MB**.
- [x] **Automated 90% LRU Sweep (`NFR-STOR-02`)**: At 45 MB usage, background LRU sweeps oldest audio blobs in `cached_media` (sorted by `lastAccessedAt ASC`) until usage reaches $\le 35\text{MB}$.
- [x] **Metadata Protection (`NFR-STOR-03`)**: Text flashcards, phonetic metadata, and queued review logs are strictly exempt from LRU deletion.
- [x] **Storage Calculation Fallback**: Byte length calculated manually for blobs if `navigator.storage.estimate()` is unavailable.

---

## 3. Security, Token Isolation & Anti-Abuse

- [x] **Zero Persistent Auth Tokens (`NFR-SEC-01`)**: No JWT tokens or refresh credentials stored in IndexedDB or LocalStorage (uses HttpOnly SameSite cookies / in-memory auth state).
- [x] **Multi-User Cache Invalidation (`NFR-SEC-02`)**: Logout cleanses client storage unconditionally via `indexedDB.deleteDatabase('WordStreakOfflineDB')`.
- [x] **Un-synced Reviews Warning**: Interactive modal prompts user before discarding pending offline reviews upon logout.
- [x] **48-Hour Streak Reconciliation Window (`NFR-ABUSE-01`)**: Offline reviews older than 48 hours receive XP and SRS updates but do not resurrect dead streaks.
- [x] **Strict Monotonic Timestamps (`NFR-ABUSE-02`)**: Timestamps in review payload must be chronological ($T_i < T_{i+1}$) and within acceptable clock drift ($T_{\text{client}} \le T_{\text{server}} + 60\text{s}$).
- [x] **500 XP Batch Cap (`NFR-ABUSE-04`)**: Maximum XP awarded in a single sync batch transaction is hard-capped at 500 XP.
- [x] **Input DTO Sanitization (`NFR-SEC-03`)**: Validated via `class-validator` with strict UUID v4, integer ranges, and ISO-8601 formatting.

---

## 4. Accessibility (A11y) & WordStreak Design System

- [x] **WCAG 2.1 AA Compliance (`NFR-A11Y-01`)**: 4.5:1 minimum contrast ratio for text and icons on Obsidian pill elements (`#000000` / `#ffffff`).
- [x] **Screen Reader Alerts (`NFR-A11Y-02`)**: Dynamic network transitions (`Offline`, `Syncing`, `All synced`) broadcasted through `aria-live="polite"` regions.
- [x] **Reduced Motion Support (`NFR-A11Y-03`)**: Respects `prefers-reduced-motion: reduce` for pill pulse and banner entrance animations.
- [x] **Obsidian Pill UX (`NFR-DS-01`)**: Floating status pill and PWA install prompt strictly adopt the WordStreak Obsidian pill aesthetic (`rounded-full`, thin hairline `#e5e5e5` border, SF Pro Rounded / Inter fonts).
