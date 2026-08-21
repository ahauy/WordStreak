# Test Plan: Learning Analytics & Retention Dashboard

**Feature Slug**: `learning-analytics`  
**Date**: 2026-08-21  
**Status**: Approved

---

## 1. Test Matrix

| Test ID         | Target Component / Layer              | Story / Requirement           | Description                                                                                                                       |        Type        |
| :-------------- | :------------------------------------ | :---------------------------- | :-------------------------------------------------------------------------------------------------------------------------------- | :----------------: |
| **TC-STAT-001** | `AnalyticsService.getMasterySummary`  | US-STAT-01 / REQ-STAT-001     | Correctly counts Mastered ($Interval \ge 21, Reps \ge 4$), Learning ($1 \le Interval < 21$), and New cards with exact percentages |    Unit (Jest)     |
| **TC-STAT-002** | `AnalyticsService.getMasterySummary`  | US-STAT-01 / REQ-STAT-001     | Filters mastery counts by `deckId` and excludes archived decks                                                                    |    Unit (Jest)     |
| **TC-STAT-003** | `AnalyticsService.getActivityHeatmap` | US-STAT-02 / REQ-STAT-002     | Aggregates daily review counts for 365 rolling days and assigns intensity levels (0 to 4)                                         |    Unit (Jest)     |
| **TC-STAT-004** | `AnalyticsService.getActivityHeatmap` | US-STAT-02 / REQ-STAT-002     | Correctly shifts review timestamps to client local timezone (`Asia/Ho_Chi_Minh`)                                                  |    Unit (Jest)     |
| **TC-STAT-005** | `ReviewsService.submitReview`         | US-STAT-02 / REQ-STAT-003     | Automatically creates a `ReviewLog` entry upon review submission                                                                  |    Unit (Jest)     |
| **TC-STAT-006** | `AnalyticsService.getDeckForecast`    | US-STAT-03 / REQ-STAT-004     | Computes 7-day velocity and projected completion date; returns `isCompleted: true` when remaining is 0                            |    Unit (Jest)     |
| **TC-STAT-007** | `AnalyticsService.getOverview`        | US-STAT-03 / REQ-STAT-005     | Calculates 30-day retention rate (% ratings >= 3) and combines streak & mastery KPIs                                              |    Unit (Jest)     |
| **TC-STAT-008** | `AnalyticsController`                 | REQ-STAT-001..005             | Validates JWT Auth Guard, query parameters, and routes                                                                            |    Unit (Jest)     |
| **TC-STAT-009** | `ActivityHeatmap.tsx`                 | US-STAT-02 / REQ-STAT-006     | Renders 52-week grid, renders tooltip on cell hover/focus, and displays level color styles                                        | Component (Vitest) |
| **TC-STAT-010** | `MasteryDistributionCard.tsx`         | US-STAT-01 / REQ-STAT-006     | Renders donut/bar chart, legend counts, and handles zero-card empty state                                                         | Component (Vitest) |
| **TC-STAT-011** | `AnalyticsPage.tsx`                   | US-STAT-01..03 / REQ-STAT-006 | Renders hero KPI cards, deck forecast list, handles loading & error states                                                        | Component (Vitest) |
