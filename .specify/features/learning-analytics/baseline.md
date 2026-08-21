# Domain Decision Baseline: Learning Analytics & Retention Dashboard

**Status**: SIGNED-OFF  
**Version**: 1.0  
**Signed off by**: User (2026-08-21)  
**Feature Slug**: `learning-analytics`  
**Date**: 2026-08-21

This document is compiled incrementally by every stage of the WordStreak BA Pipeline.

---

## 1. Business Summary & Problem Statement

Learners currently lack visual analytics on their long-term memory retention curve, visual breakdown of vocabulary maturity (Mastered vs Learning vs New), and 365-day consistency tracker. This feature introduces a high-performance analytics engine and intuitive UI surfaces to boost 30-day retention and motivation.

See [00-intake.md](./00-intake.md) and [01-elicitation.md](./01-elicitation.md).

---

## 2. Gap Analysis Summary

- **AS-IS**: Minimal review stats (`ReviewsService.getReviewStats`), no historical review event log (`ReviewLog`), no heatmap, no forecast.
- **TO-BE**: Dedicated `AnalyticsModule`, 365-day rolling heatmap with timezone awareness, SM-2 mastery distribution, linear forecast engine, dedicated `/analytics` page and dashboard widgets.
- **Data Gaps**: Additive `ReviewLog` table (`[userId, reviewedAt]` index) and seamless backfill from `UserCardProgress`.

See [02-gap-analysis.md](./02-gap-analysis.md).

---

## 3. Approved Domain Model Summary

- **RBAC**: Strict user-isolated read access (`userId` scoped).
- **Mastery Status**:
  - `MASTERED`: `interval >= 21` AND `repetitions >= 4`
  - `LEARNING`: `1 <= interval < 21` OR `1 <= repetitions < 4` (with `interval > 0`)
  - `NEW`: `repetitions == 0` AND `interval == 0`
- **Heatmap**: Rolling 365 days (52 weeks) ending today, categorized into 5 intensity levels (0 to 4).
- **Deck Forecast**: 7-day velocity projection with fallback to `user.dailyGoal / 2`.
- **Business Rules**: `BR-STAT-001` through `BR-STAT-007`.

See [03-domain-model.md](./03-domain-model.md).

---

## 4. MoSCoW Scope Table

- **Must-Have**: REQ-STAT-001, REQ-STAT-002, REQ-STAT-003, REQ-STAT-006, REQ-STAT-007.
- **Should-Have**: REQ-STAT-004, REQ-STAT-005.
- **Could-Have**: CSV export, comparative sparklines.
- **Won't-Have (v1)**: WebSockets live streaming, social leaderboards.

See [04-risk-register.md](./04-risk-register.md).

---

## 5. Specification Document Index

- [Software Requirements Specification (SRS.md)](./SRS.md)
- [User Stories (user-stories.md)](./user-stories.md)
- [Product Requirements Document (PRD.md)](./PRD.md)

---

## 6. Open Risks & Mitigations

- **RISK-STAT-001**: 365-day heatmap latency -> Mitigated with `[userId, reviewedAt]` compound index.
- **RISK-STAT-002**: Sparse historical velocity -> Mitigated with fallback baseline.
- **RISK-STAT-003**: Timezone validation -> Mitigated with standard IANA validator & UTC fallback.
