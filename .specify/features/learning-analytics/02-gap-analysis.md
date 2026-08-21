# Gap Analysis: Learning Analytics & Retention Dashboard

- **Feature Slug**: `learning-analytics`
- **Date**: 2026-08-21
- **Status**: Completed

---

## 1. AS-IS (Current State)

### Codebase & Schema Inspection:

1. **Existing Analytics**: Only `ReviewsService.getReviewStats` exists, returning simple counts (`totalCards`, `dueCount`, `newCount`, `learningCount`, `masteredCount`).
2. **Review Data Model**: `UserCardProgress` maintains only the _current_ state (`interval`, `repetitions`, `easeFactor`, `lastReviewedAt`, `nextReviewDate`, `status`). When a user reviews the same card 5 times across 5 weeks, previous review timestamps and historical ratings are overwritten.
3. **UI Surfaces**:
   - `/dashboard` shows simple badge statistics (`totalCards`, `dueCount`, `streakCount`).
   - No interactive charts or retention curves.
   - No GitHub-style 365-day activity heatmap.
   - No deck completion date projection.
   - No dedicated `/analytics` route.

---

## 2. TO-BE (Target State)

### End-to-End User Experience:

1. **Dedicated Analytics Surface (`/analytics`)**:
   - **Hero Metric Bar**: Retention Rate (30-day %), Total Reviews Completed, Mastered Vocabulary Ratio.
   - **Mastery Distribution Donut/Bar**: Visual breakdown of Mastered (green), Learning (indigo/violet), and New (slate) cards with clickable filters.
   - **365-Day Activity Heatmap**: GitHub-style grid of 52 weeks showing daily study volume with interactive tooltips ("18 cards reviewed on Aug 15, 2026") and 5 intensity levels.
   - **Deck Mastery Progress Table**: Granular progress bars, mastery %, and completion forecast for each user deck.
2. **Dashboard Overview Widget**:
   - Compact visual progress bar and mini 30-day activity sparkline embedded directly on `/dashboard`.
3. **Deck Detail Page Projection**:
   - Deck completion forecast badge ("Estimated completion: ~18 days at current velocity").
4. **Backend Architecture**:
   - Dedicated `AnalyticsModule` (`/api/v1/analytics/...`).
   - Event logging of each review via immutable `ReviewLog` table.
   - High performance sub-50ms SQL aggregation with time-bucket grouping.

---

## 3. Gap Analysis

### A. Functional Gaps

- **Analytics Service & Endpoints**:
  - `GET /api/v1/analytics/mastery-summary?deckId=...`
  - `GET /api/v1/analytics/activity-heatmap?timezone=Asia/Ho_Chi_Minh`
  - `GET /api/v1/analytics/deck-forecast/:deckId`
  - `GET /api/v1/analytics/retention-metrics`
- **Review Submission Hook**:
  - Automatically create `ReviewLog` on every `POST /api/v1/reviews/submit`.
- **Forecast Engine**:
  - 7-day velocity estimation with fallback to `User.dailyGoal`.
- **Frontend Components**:
  - `AnalyticsPage`, `ActivityHeatmap`, `MasteryDonutChart`, `DeckForecastBadge`, `RetentionRateCard`.

### B. Data Gaps

- **New Prisma Model `ReviewLog`**:
  ```prisma
  model ReviewLog {
    id         String   @id @default(uuid())
    userId     String
    cardId     String
    rating     Int      // 1 (Again), 2 (Hard), 3 (Good), 4 (Easy)
    interval   Int      // result interval in days
    reviewedAt DateTime @default(now())

    user       User     @relation(fields: [userId], references: [id], onDelete: Cascade)
    card       Card     @relation(fields: [cardId], references: [id], onDelete: Cascade)

    @@index([userId, reviewedAt])
    @@index([cardId])
    @@map("review_logs")
  }
  ```
- **Prisma Schema Updates**: Relations added to `User` and `Card`.

### C. User Impact

- Completely additive and seamless.
- No user-facing breaking changes.
- Existing dashboard layout gains an intuitive analytics summary card.

### D. Transition & Migration Requirements

- **Prisma Migration**: Run `npx prisma migrate dev --name add_review_logs`.
- **Historical Data Backfill**:
  - If a user has `UserCardProgress.lastReviewedAt != null` and 0 `ReviewLog` rows, run an idempotent backfill query on migration to insert initial `ReviewLog` records so active users don't see an empty heatmap on day 1.
- **Rollback Strategy**:
  - If reverted, dropping the `review_logs` table has zero impact on core card or deck data.
