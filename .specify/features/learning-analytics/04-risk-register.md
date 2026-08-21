# Risk Register & Scope Bounding: Learning Analytics & Retention Dashboard

- **Feature Slug**: `learning-analytics`
- **Date**: 2026-08-21
- **Status**: Completed

---

## 1. Contradiction Scan

- **Findings**: Zero logical contradictions or state deadlocks found.
  - State machine transitions between `NEW` -> `LEARNING` -> `MASTERED` (and demotion back to `LEARNING` upon forget rating 1 or 2) harmonize completely with `SrsService` and SM-2 interval formulas.
  - Backward compatibility is 100% preserved. The existing `ReviewsService.getReviewStats` remains untouched for existing callers, while `AnalyticsService` provides dedicated deep analytics.
  - Database schema changes (`ReviewLog` table) are purely additive with cascade deletes.

---

## 2. Risk Register

| ID                | Risk Description                                                               | Prob. | Impact | Mitigation Strategy                                                                                                                                                 |
| :---------------- | :----------------------------------------------------------------------------- | :---: | :----: | :------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **RISK-STAT-001** | High query latency on 365-day heatmap aggregation as `review_logs` table grows |  Med  |  Med   | Add compound index `[userId, reviewedAt]`. Enforce indexed range query `reviewedAt >= startDate` so database performs index-range scan rather than full table scan. |
| **RISK-STAT-002** | Velocity calculation distortion for brand new users with < 3 active study days | High  |  Low   | Graceful fallback in forecast algorithm: if active days < 3, use `user.dailyGoal / 2` as baseline velocity.                                                         |
| **RISK-STAT-003** | Invalid or spoofed client timezone string causing server query error           |  Low  |  Low   | Sanitize timezone string via `Intl.DateTimeFormat` validator; fallback safely to `UTC` if invalid.                                                                  |
| **RISK-STAT-004** | Client performance lag when rendering 365 SVG heatmap cells                    |  Low  |  Low   | Use static lightweight SVG/flex grid rendered once with tooltip memoization. Zero canvas/WebGL bloat.                                                               |

---

## 3. Consolidated Assumptions & Constraints

### Assumptions Confirmed:

- **ASM-ANALYTICS-001**: Analytics is surfaced both as a summary widget on `/dashboard` and as a rich standalone view on `/analytics`.
- **ASM-ANALYTICS-002**: Activity heatmap intensity is driven by total card review submissions per day according to the user's local timezone.
- **ASM-ANALYTICS-003**: Mastery status follows standard SM-2 criteria: Mastered (`interval >= 21` days and `repetitions >= 4`), Learning (`1 <= interval < 21`), and New (`repetitions == 0`).
- **ASM-ANALYTICS-004**: Heatmap defaults to rolling 365 days (52 weeks) ending on today's date.
- **ASM-ANALYTICS-005**: Deck completion forecast utilizes 7-day trailing velocity with fallback to user `dailyGoal`.
- **ASM-ANALYTICS-006**: A lightweight `ReviewLog` table is added to provide high-performance aggregate querying without locking or recalculating full card progress history.

### Constraints:

- **Design System Constraint**: Must comply with `apps/web/DESIGN.md` (pure `#ffffff` canvas, 1px `#e5e5e5` borders, Obsidian `#000000` rounded-full pills, Nunito/Inter/JetBrains Mono typography).
- **Anti-AI-Slop Constraint**: Zero unrequested neon gradients, zero heavy dark glassmorphism.
- **Performance Constraint**: Analytics API response time < 50ms at P95.

---

## 4. MoSCoW Scope Table

### Must-Have (P0 - Critical for v1):

- `ReviewLog` entity and logging integration upon review submission.
- `GET /api/v1/analytics/mastery-summary` (Mastered, Learning, New counts + percentages).
- `GET /api/v1/analytics/activity-heatmap` (365 rolling days review counts with intensity level 0–4).
- Dedicated `/analytics` page with responsive layout, interactive tooltips, and mastery distribution charts.
- Compact Dashboard Overview Analytics Widget on `/dashboard`.

### Should-Have (P1 - High Priority):

- `GET /api/v1/analytics/deck-forecast/:deckId` (Deck completion projection + days remaining).
- 30-Day Retention Rate KPI metric (% reviews rated Good/Easy).
- Deck-by-deck progress breakdown list on `/analytics`.
- Deck detail page completion forecast badge.

### Could-Have (P2 - Future Enhancement):

- Export learning analytics summary to CSV.
- Monthly / weekly comparative sparkline trends.

### Won't-Have (Out of Scope for this Sprint):

- Real-time WebSockets live review counter.
- Public/social analytics sharing & global leaderboards (deferred to Epic 09).
- Historical study session duration timer (speech/voice practice time).
