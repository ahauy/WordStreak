# Handover Brief: Learning Analytics & Retention Dashboard

**Baseline Version**: 1.0-draft (Pending User Confirmation Gate 1)  
**Date**: 2026-08-21  
**Spec Documents**: [SRS.md](./SRS.md), [user-stories.md](./user-stories.md), [PRD.md](./PRD.md)  
**Traceability Matrix**: [validation-report.md](./validation-report.md)

---

## 1. What's Being Built

1. **Analytics Engine & REST Endpoints**:
   - `GET /api/v1/analytics/overview` (Retention %, total reviews, mastery breakdown).
   - `GET /api/v1/analytics/activity-heatmap` (Rolling 365-day review volume with intensity levels 0–4).
   - `GET /api/v1/analytics/mastery-summary` (Mastered / Learning / New counts and percentages).
   - `GET /api/v1/analytics/deck-forecast/:deckId` (Remaining cards, 7-day velocity, estimated completion date).
2. **Review Event Persistence**:
   - Additive `ReviewLog` table capturing immutable review ratings and intervals on `POST /api/v1/reviews/submit`.
3. **Frontend UI Surfaces**:
   - Dedicated `/analytics` page with 365-day interactive heatmap, mastery donut chart, and deck progress table.
   - Dashboard Overview Analytics Widget (`/dashboard`).
   - Deck Detail Completion Forecast Badge (`/decks/:id`).

---

## 2. What's Explicitly Out of Scope (Won't-Have v1)

- Live WebSockets streaming of review counts.
- Social leaderboards and public analytics sharing (deferred to Epic 09).
- Historical study duration stopwatch/timer.

---

## 3. Known Accepted Risks & Mitigations

- **RISK-STAT-001**: 365-day query latency mitigated with composite index `[userId, reviewedAt]`.
- **RISK-STAT-002**: Sparse historical velocity defaults safely to `user.dailyGoal / 2`.
- **RISK-STAT-003**: Timezone validation prevents invalid timezone crashes.

---

## 4. Next Step

Upon User Sign-Off at **Confirmation Gate 1**, mark `baseline.md` as `SIGNED-OFF v1.0` and proceed to **Phase 2–4: Speckit Pipeline** (`speckit-specify`, `speckit-plan`, `speckit-tasks`).
