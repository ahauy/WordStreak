# Changelog: Progressive Web App (PWA) & Offline Study Mode (US-ECO-04)

- **v1.0** — 2026-08-24 — Confirmation Gate 1 Signed-Off & Technical Architecture Planning Completed:
  - **Baseline Sign-off**: Signed-off `baseline.md` v1.0 following user approval of Gate 1.
  - **Technical Specification (`spec.md`)**: Formulated technical specification covering user stories `US-PWA-001` through `US-PWA-008`, functional requirements `REQ-PWA-001` through `REQ-PWA-012`, and NFRs for performance (<16ms review, <15ms IDB), 50MB storage quota with LRU eviction, security (zero persistent auth tokens in storage, multi-user purge on logout), WCAG 2.1 AA accessibility, and anti-abuse (monotonic timestamps, 48h streak forgiveness window, 500 XP cap).
  - **Implementation Plan (`plan.md`)**: Architectural blueprints for Service Worker Workbox precaching, IndexedDB `idb` wrapper (`WordStreakOfflineDB`), NestJS atomic batch sync endpoint, client SM-2 calculation parity, Web Speech API TTS fallback, and dual-run migration/rollback procedures.
  - **Data Model (`data-model.md`)**: Defined 5 IndexedDB stores (`offline_decks`, `offline_cards`, `review_queue`, `cached_media`, `pwa_preferences`), indexes, state machines, and backend sync DTOs.
  - **Contract (`contracts/sync-reviews.contract.ts`)**: Created full TypeScript contract and OpenAPI DTO definitions for `POST /api/v1/reviews/sync-batch` and `/sync-offline`.
  - **Checklists (`checklists/`)**: Created `checklists/requirements.md` (specification completeness) and `checklists/security-performance.md` (performance, security, storage, a11y budgets).
  - **Task Breakdown (`tasks.md`)**: Structured 6-phase dependency-ordered task breakdown with parallel flags `[P]`, file paths, and unit/integration/E2E test criteria.
- **v1.0-draft** — 2026-08-24 — Completed Stages 2 through 8 of the WordStreak BA Pipeline:
  - **Stage 2 (Elicitation)**: Created `01-elicitation.md` documenting business value, 6 domain pillars, confirmed assumptions (`ASM-PWA-001`..`008`), and resolved elicitation questions.
  - **Stage 3 (Gap Analysis)**: Created `02-gap-analysis.md` documenting AS-IS vs TO-BE, functional gaps (`GAP-F01`..`F08`), data gaps, user impact, and dual-run transition requirements.
  - **Stage 4 (Domain Modeling)**: Created `03-domain-model.md` defining RBAC matrix, 3 state machine diagrams, numbered business rules (`BR-PWA-001`..`010`) with anti-abuse pass for offline streaks/XP, IndexedDB schema ERD, and NFRs.
  - **Stage 5 (Risk Register)**: Created `04-risks-assumptions.md` with contradiction scan results (0 conflicts), risk register (`RISK-PWA-001`..`006`), consolidated assumptions (`ASM-PWA-001`..`010`), and MoSCoW scope table with explicit Won't-Have list.
  - **Stage 6 (Spec Writer)**: Created `spec/` suite: `spec/brd.md` (Business Requirements), `spec/prd.md` (Product Requirements), `spec/srs.md` (Software Requirements `REQ-PWA-001`..`012` with derived-from traceability), and `spec/user-stories.md` (`US-PWA-001`..`008` with Given-When-Then scenarios).
  - **Stage 7 (Spec Validator)**: Created `05-validation-matrix.md` with IEEE 29148 compliance evaluation (100% PASS) and full unbroken requirement traceability matrix.
  - **Stage 8 (Handover & Baseline)**: Created `06-handover-brief.md` and compiled `baseline.md` (Status: DRAFT ready for user sign-off).
- **v0.1-draft** — 2026-08-24 — Feature folder created by intake-classifier. Classified as Full Feature (`US-ECO-04`).
