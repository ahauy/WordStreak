# Technical Feature Specification: Learning Analytics & Retention Dashboard

**Feature Slug**: `learning-analytics`  
**Epic**: EPIC-06: Learning Analytics & Retention Dashboard  
**Status**: Specified  
**Version**: 1.0

---

## 1. Overview & Business Value

The Learning Analytics & Retention Dashboard provides English learners with data-driven insights into vocabulary mastery, long-term memory retention curve (SM-2 intervals), a 365-day GitHub-style consistency heatmap, and intelligent deck completion forecasting.

---

## 2. User Stories & Acceptance Criteria

- **US-STAT-01 (Word Mastery Breakdown)**: Group all cards (or deck-specific cards) into Mastered ($Interval \ge 21$ & $Reps \ge 4$), Learning ($1 \le Interval < 21$ or $1 \le Reps < 4$), and New ($Interval = 0$, $Reps = 0$).
- **US-STAT-02 (365-Day Activity Heatmap)**: Rolling 52-week calendar grid displaying daily review volume normalized by client timezone header with 5 intensity levels.
- **US-STAT-03 (Deck Completion Forecast & Retention Rate)**: Projection of days to 100% mastery using 7-day trailing velocity with fallback to `dailyGoal / 2`, plus 30-day retention percentage ($Rating \ge 3$).

---

## 3. API Contract Specifications

### 3.1 `GET /api/v1/analytics/overview`

- **Query**: `?deckId=<string>&timezone=<iana_string>`
- **Response**:

```typescript
interface AnalyticsOverviewResponse {
  masterySummary: {
    totalCards: number;
    masteredCount: number;
    masteredPercentage: number;
    learningCount: number;
    learningPercentage: number;
    newCount: number;
    newPercentage: number;
  };
  retentionRate30Days: number | null; // percentage 0-100 or null
  totalReviewsLogged: number;
  currentStreak: number;
  bestStreak: number;
}
```

### 3.2 `GET /api/v1/analytics/activity-heatmap`

- **Query**: `?timezone=Asia/Ho_Chi_Minh`
- **Response**:

```typescript
interface HeatmapDayItem {
  date: string; // YYYY-MM-DD
  count: number; // review count
  level: 0 | 1 | 2 | 3 | 4; // intensity tier
}

interface ActivityHeatmapResponse {
  startDate: string;
  endDate: string;
  totalReviews: number;
  activeDaysCount: number;
  longestDailyReviews: number;
  days: HeatmapDayItem[];
}
```

### 3.3 `GET /api/v1/analytics/deck-forecast/:deckId`

- **Response**:

```typescript
interface DeckForecastResponse {
  deckId: string;
  deckTitle: string;
  totalCards: number;
  masteredCards: number;
  remainingCards: number;
  dailyVelocity: number; // cards per day
  estimatedDaysToComplete: number;
  projectedCompletionDate: string | null; // ISO date string or null if completed
  isCompleted: boolean;
}
```

### 3.4 `GET /api/v1/analytics/decks-progress`

- **Response**: List of `DeckForecastResponse` across all active decks owned by the user.

---

## 4. Architectural Invariants

- **Multi-Tenant Isolation**: Every query enforces `where: { userId: request.user.id }`.
- **Performance**: Sub-50ms query time via compound index `@@index([userId, reviewedAt])`.
- **Anti-AI-Slop**: Document-first minimal design, `#ffffff` canvas, 1px `#e5e5e5` borders, Obsidian black pills.
