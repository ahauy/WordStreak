# Intake: Learning Analytics & Retention Dashboard

- **Date**: 2026-08-21
- **Requested by**: Product Roadmap (EPIC-06: Learning Analytics & Retention Dashboard — US-STAT-01 & US-STAT-02 & US-STAT-03)
- **Classification**: Full Feature
- **Classification signals**:
  - New or changed domain entities: 0–1 (Analytics aggregation view models, potential caching / query optimization)
  - Existing DB schema change required: Additive / index optimizations on `UserCardProgress` & `ReviewLog`
  - Screens/flows touched: 2+ (Dashboard Overview Analytics Widgets + Deck Detail Forecast + Dedicated Analytics View)
  - User roles affected: 1 (Authenticated Learner)
  - Cross-cutting: Retention analytics, SRS Interval aggregation (Mastered/Learning/New), Activity Heatmap (365 days)
  - Reversible without user-facing consequence: Yes (Read-only analytics aggregation)
- **Protocol selected**: Full Feature Pipeline (Stages 1 → 8: Intake → Elicitation → Gap Analysis → Domain Modeling → Risk Scanning → Spec Writer → Spec Validator → Handover)
- **Override**: none

## One-line problem statement

Learners need visual clarity on their vocabulary retention progress (Mastered vs Learning vs New breakdown), a 365-day GitHub-style activity heatmap to maintain momentum, and realistic deck completion forecasting based on their SM-2 learning velocity.
