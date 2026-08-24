# Domain Decision Baseline: Progressive Web App (PWA) & Offline Study Mode

**Status**: SIGNED-OFF v1.0  
**Version**: 1.0  
**Feature Slug**: `pwa-offline-mode`  
**Target User Story**: `US-ECO-04`  
**Date**: 2026-08-24  
**Lead BA / Domain Architect**: Senior Business Analyst & Domain Architect

This document serves as the single source of truth for the domain analysis and specifications for **US-ECO-04: Progressive Web App (PWA) & Offline Study Mode**.

---

## Stage 0 — Intake

- **Feature Title**: Progressive Web App (PWA) & Chế độ học Offline (PWA & Offline Study Mode)
- **Classification**: Full Feature (Protocol Stages 1–8)
- **Scope**: Web App Manifest, Service Worker Workbox Precaching, Client IndexedDB Schema (`WordStreakOfflineDB`), Offline SM-2 Review Engine, Reconnection Auto-Sync Engine, 48-Hour Streak Reconciliation, Universal Web Speech API Fallback, Obsidian Pill UX.
- **Reference**: See [00-intake.md](./00-intake.md).

---

## Stage 1 & 2 — Business Value & 6-Pillar Elicitation

- **Problem**: In-transit connectivity loss causes study session drop-offs and broken learning streaks.
- **Personas**: Commuter Khoa (Subway), Frequent Flyer Mai (Traveler), Shared Device Learner An (Privacy-conscious).
- **OKRs**: +18% 30-day mobile retention, < 2% offline drop-off rate, 99.95% sync reliability.
- **6 Domain Pillars**: RBAC matrix, PWA/Queue Lifecycles, SM-2 client arithmetic parity, 48h tolerance window, IndexedDB 50MB quota with LRU eviction, Web Speech Synthesis TTS fallback.
- **Reference**: See [01-elicitation.md](./01-elicitation.md).

---

## Stage 3 — Gap Analysis (AS-IS vs TO-BE)

- **AS-IS**: Single-page web app with 100% online dependence; review failures on disconnect; streak resets on offline days.
- **TO-BE**: Offline-first installable PWA with local IndexedDB persistence, client-side SM-2 calculations, background sync, and 48h streak forgiveness.
- **Gaps Addressed**: 8 Functional Gaps (`GAP-F01` to `GAP-F08`), Client Data Gaps, User Impact, and Dual-Run Transition Plan.
- **Reference**: See [02-gap-analysis.md](./02-gap-analysis.md).

---

## Stage 4 — Domain Modeling & Business Rules

- **RBAC Matrix**: Guest, Free Learner, Pro Learner, Admin, Background Sync Actor.
- **State Machines**: Local Review Queue, PWA Install Banner, Offline Deck Snapshot.
- **Business Rules**: `BR-PWA-001` through `BR-PWA-010` (including anti-abuse rules: monotonic client timestamps, 1 review/5s limit, 500 XP batch cap).
- **Data Model**: IndexedDB schema with 5 stores (`offline_decks`, `offline_cards`, `review_queue`, `cached_media`, `pwa_preferences`).
- **Reference**: See [03-domain-model.md](./03-domain-model.md).

---

## Stage 5 — Risk Register & Assumptions Log

- **Contradiction Scan**: 0 logic contradictions, 0 state deadlocks, 100% backward compatible.
- **Risk Register**: `RISK-PWA-001` through `RISK-PWA-006` with actionable mitigations.
- **Consolidated Assumptions**: `ASM-PWA-001` through `ASM-PWA-010`.
- **MoSCoW Scope**: Must-Have (P0), Should-Have (P1), Could-Have (P2), and explicit Won't-Have exclusions.
- **Reference**: See [04-risks-assumptions.md](./04-risks-assumptions.md).

---

## Stage 6 — Specification Document Suite

- **BRD**: Business context, strategic OKRs, target personas, financial impact. See [spec/brd.md](./spec/brd.md).
- **PRD**: Feature breakdowns, Obsidian pill UX design, telemetry, and scope boundaries. See [spec/prd.md](./spec/prd.md).
- **SRS**: Precise, testable software requirements `REQ-PWA-001` to `REQ-PWA-012`, data contracts, and recovery matrix. See [spec/srs.md](./spec/srs.md).
- **User Stories**: `US-PWA-001` to `US-PWA-008` with Gherkin Given-When-Then scenarios (happy path & edge cases). See [spec/user-stories.md](./spec/user-stories.md).

---

## Stage 7 — Validation & Traceability Matrix

- **IEEE 29148 Compliance**: 100% pass across all 8 criteria for every REQ and US item.
- **Traceability Chain**: Unbroken mapping from Business Goals $\to$ Requirements $\to$ Domain Rules $\to$ User Stories $\to$ Test Scenarios.
- **Reference**: See [05-validation-matrix.md](./05-validation-matrix.md).

---

## Stage 8 — Handover

- **Handover Summary**: Handover brief prepared for technical architecture and implementation planning (`speckit-specify`).
- **Reference**: See [06-handover-brief.md](./06-handover-brief.md).
