# Software Requirements Specification (SRS): Learning Analytics & Retention Dashboard

- **Feature Slug**: `learning-analytics`
- **Date**: 2026-08-21
- **Status**: Draft

---

### REQ-STAT-001: Vocabulary Mastery Distribution API

**Category**: Analytics & Reporting  
**Priority**: Must-Have  
**Status**: Draft  
**Description**: The system shall provide an endpoint `GET /api/v1/analytics/mastery-summary` returning the counts and percentages of cards classified as `MASTERED`, `LEARNING`, and `NEW`, optionally filtered by `deckId`.  
**Derived from**: BR-STAT-001, ASM-ANALYTICS-003, 02-gap-analysis.md §3A  
**Business Rules**: BR-STAT-001 (Mastery classification: Mastered `interval >= 21` & `repetitions >= 4`, Learning `1 <= interval < 21` or `1 <= repetitions < 4`, New `repetitions == 0`).  
**Non-Functional Requirements**: P95 response time < 50ms.  
**Dependencies**: `user_card_progress` table.

---

### REQ-STAT-002: Rolling 365-Day Activity Heatmap API

**Category**: Gamification & Analytics  
**Priority**: Must-Have  
**Status**: Draft  
**Description**: The system shall provide an endpoint `GET /api/v1/analytics/activity-heatmap` accepting a timezone string (via query param `timezone` or header `x-timezone`) and returning daily review counts for the rolling 365 days (52 weeks) ending today, categorized into intensity levels (0 to 4).  
**Derived from**: BR-STAT-002, BR-STAT-003, ASM-ANALYTICS-002, ASM-ANALYTICS-004  
**Business Rules**: BR-STAT-002, BR-STAT-003.  
**Non-Functional Requirements**: Timezone sanitized against IANA database; fallback to UTC on invalid timezone.  
**Dependencies**: `ReviewLog` table and `[userId, reviewedAt]` compound index.

---

### REQ-STAT-003: Review Event Persistence Hook

**Category**: Persistence & Telemetry  
**Priority**: Must-Have  
**Status**: Draft  
**Description**: Upon every successful review submission (`POST /api/v1/reviews/submit`), the backend shall record an immutable `ReviewLog` row containing `userId`, `cardId`, `rating` (1–4), `interval` (days), and `reviewedAt` timestamp.  
**Derived from**: BR-STAT-006, ASM-ANALYTICS-006, 02-gap-analysis.md §3B  
**Business Rules**: BR-STAT-006.  
**Non-Functional Requirements**: Asynchronous or non-blocking transaction, deduplicated within 2000ms.  
**Dependencies**: `PrismaService`, `ReviewsService`.

---

### REQ-STAT-004: Deck Completion Forecast Engine

**Category**: Analytics & Forecasting  
**Priority**: Should-Have  
**Status**: Draft  
**Description**: The system shall provide an endpoint `GET /api/v1/analytics/deck-forecast/:deckId` that calculates remaining unmastered cards, historical 7-day daily velocity, estimated days to 100% mastery, and projected completion date.  
**Derived from**: BR-STAT-004, ASM-ANALYTICS-005, 03-domain-model.md §3  
**Business Rules**: BR-STAT-004.  
**Non-Functional Requirements**: Fallback to `user.dailyGoal / 2` when historical activity is < 3 days.  
**Dependencies**: `user_card_progress`, `review_logs`, `decks`.

---

### REQ-STAT-005: 30-Day Retention Rate Metric API

**Category**: Analytics & Reporting  
**Priority**: Should-Have  
**Status**: Draft  
**Description**: The system shall compute the 30-day retention percentage: `(reviews with rating >= 3) / (total reviews) * 100%`, returned as part of `GET /api/v1/analytics/overview`.  
**Derived from**: BR-STAT-005, 03-domain-model.md §3  
**Business Rules**: BR-STAT-005.  
**Dependencies**: `ReviewLog` table.

---

### REQ-STAT-006: Dedicated Learning Analytics Page UI

**Category**: Frontend UI/UX  
**Priority**: Must-Have  
**Status**: Draft  
**Description**: The web application shall provide a dedicated route `/analytics` featuring:

1. Hero KPI Cards (Retention Rate, Total Reviews, Mastery Ratio).
2. 365-day GitHub-style Activity Heatmap with interactive date tooltips.
3. Donut/Bar chart for Mastery Breakdown (Mastered / Learning / New).
4. Deck-by-deck progress list with completion forecast badges.  
   **Derived from**: ASM-ANALYTICS-001, 03-domain-model.md §6  
   **Business Rules**: Zero Generic AI Slop, WCAG AA a11y, DESIGN.md token compliance.  
   **Dependencies**: `packages/shared-types`, `apiClient`.

---

### REQ-STAT-007: Dashboard Overview Analytics Widget

**Category**: Frontend UI/UX  
**Priority**: Must-Have  
**Status**: Draft  
**Description**: The `/dashboard` overview shall include a compact Analytics summary card displaying a mastery progress bar, current week activity sparkline, and quick link to `/analytics`.  
**Derived from**: ASM-ANALYTICS-001, 02-gap-analysis.md §2  
**Business Rules**: Stable outer hover anchor, document-first canvas.  
**Dependencies**: `useAnalytics` hook.
