# Product Requirements Document (PRD): Learning Analytics & Retention Dashboard

- **Feature Slug**: `learning-analytics`
- **Date**: 2026-08-21
- **Status**: Draft

---

## 1. Executive Summary

The **Learning Analytics & Retention Dashboard** (EPIC-06) transforms WordStreak from a simple flashcard app into an intelligent, data-driven long-term learning companion. By visualizing the Spaced Repetition memory curve (Mastered vs Learning vs New), tracking daily consistency via a 365-day GitHub-style Activity Heatmap, and calculating realistic Deck Completion Forecasts, learners gain tangible proof of their progress and stay engaged over months and years.

---

## 2. User Experience & Information Architecture

### Surface 1: Dedicated Analytics Hub (`/analytics`)

- **Hero Stats Banner**:
  - 30-Day Retention Rate (%)
  - Total Reviews Logged
  - Overall Vocabulary Mastery Rate (% Mastered)
- **Visual Vocabulary Mastery Donut / Stacked Bar**:
  - Mastered (`#10B981` Emerald), Learning (`#6366F1` Indigo), New (`#94A3B8` Slate).
  - Breakdown stats with percentage, card count, and interactive deck filter.
- **365-Day Activity Heatmap**:
  - 52-week horizontal calendar matrix.
  - Interactive hover tooltips showing daily review volume and date.
  - 5 intensity tiers: Level 0 (Empty), Level 1 (1–5), Level 2 (6–15), Level 3 (16–30), Level 4 (31+).
- **Deck Progress & Forecast Table**:
  - Per-deck card counts, mastery progress bar, daily velocity, and estimated completion date.

### Surface 2: Dashboard Overview Widget (`/dashboard`)

- Compact 3-tier progress bar showing Mastered/Learning/New ratio.
- Quick link to full `/analytics` dashboard.

### Surface 3: Deck Detail Page (`/decks/:id`)

- Completion projection badge ("Estimated completion: ~18 days at current pace").

---

## 3. Scope & Requirements Traceability

- **Must-Have (P0)**:
  - `REQ-STAT-001` (Mastery Distribution API)
  - `REQ-STAT-002` (365-Day Activity Heatmap API)
  - `REQ-STAT-003` (Review Event Logging Hook)
  - `REQ-STAT-006` (Analytics Hub UI `/analytics`)
  - `REQ-STAT-007` (Dashboard Overview Widget)
- **Should-Have (P1)**:
  - `REQ-STAT-004` (Deck Completion Forecast Engine)
  - `REQ-STAT-005` (30-Day Retention Rate Metric)
- **Won't-Have (v1)**:
  - Social leaderboards, public share links, live WebSocket streaming.
