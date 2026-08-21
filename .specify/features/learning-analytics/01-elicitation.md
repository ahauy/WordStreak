# Elicitation: Learning Analytics & Retention Dashboard

- **Feature Slug**: `learning-analytics`
- **Date**: 2026-08-21
- **Status**: Completed

---

## Stage 1 — Business Value

### 1. Problem & Pain Point

- **Friction**: Learners currently see basic counts (due cards, total cards) on the dashboard, but have no deep insight into their long-term memory retention curve, visual breakdown of vocabulary maturity (Mastered vs Learning vs New), or 365-day consistency tracker.
- **Risk if not built**: Learners lose motivation when they cannot visualize their cumulative effort over weeks/months, leading to churn after the initial novelty wears off.

### 2. Target Personas

- **Alex (Exam Prep - IELTS/TOEIC)**: Needs to know when their target deck will reach 100% Mastery before the exam date.
- **Minh (Busy Professional)**: Needs a GitHub-style 365-day heatmap to maintain a daily learning ritual and see activity streaks at a glance.
- **Linh (Casual Reader)**: Wants clear, encouraging visual charts showing how many words have transitioned from "New" to "Mastered".

### 3. Success Metrics

- **User Retention**: +20% 30-day user retention rate.
- **Session Engagement**: +15% daily review session completions via visible progress reinforcement.
- **Operational Performance**: P95 Analytics API latency < 50ms (optimized indexing on `review_logs` and `user_card_progress`).

---

## 6-Pillar Domain Elicitation

### Pillar 1 — Personas, Actors & RBAC

- **Learner (Authenticated)**: Full access to view personal mastery breakdown, activity heatmap (rolling 365 days), retention metrics, and deck completion forecasts.
- **Guest / Unauthenticated**: Cannot view analytics; redirected to `/login`.
- **Data Isolation**: Strict multi-tenant isolation — a user can only query their own learning metrics (`userId` scoped).

### Pillar 2 — State Machine & Mastery Categorization

- **Mastery Levels**:
  - **Mastered (Thành thạo)**: `interval >= 21` days AND `repetitions >= 4`.
  - **Learning (Đang học)**: `1 <= interval < 21` days OR `1 <= repetitions < 4` (with `interval > 0`).
  - **New (Từ mới)**: `repetitions == 0` AND `interval == 0` (unreviewed cards).
- **Deck Scoping**: Analytics supports both Global scope (all decks owned by user) and Deck-specific scope (`deckId` filter).

### Pillar 3 — Activity Heatmap & Metrics

- **Timeframe**: Rolling 365 days (52 weeks + current week) ending at current date.
- **Activity Metric**: Total card reviews submitted per calendar day based on User Timezone (`Intl.DateTimeFormat().resolvedOptions().timeZone` or explicit client header `x-timezone`).
- **Intensity Tiers (GitHub style)**:
  - Level 0: 0 reviews
  - Level 1: 1–5 reviews (Light green / purple accent)
  - Level 2: 6–15 reviews
  - Level 3: 16–30 reviews
  - Level 4: 31+ reviews (Intense glow)

### Pillar 4 — Forecast Algorithm & Retention Rate

- **Deck Completion Forecast**:
  - `RemainingCards = TotalCardsInDeck - MasteredCardsInDeck`
  - `DailyVelocity = Average unique new cards mastered/reviewed per day over past 7 active days` (minimum fallback to `user.dailyGoal` if historical days < 3).
  - `EstimatedDaysToComplete = ceil(RemainingCards / max(DailyVelocity, 1))`
  - `EstimatedCompletionDate = CurrentDate + EstimatedDaysToComplete days`
- **Retention Rate**:
  - `RetentionRate = (Count of reviews with rating >= 3 [Good/Easy]) / (Total reviews in past 30 days) * 100%`

### Pillar 5 — Entities & Data Persistence

- **Additive Entity (`ReviewLog`)**:
  - Store individual review submissions: `id`, `userId`, `cardId`, `rating` (1-4), `interval`, `reviewedAt` (timestamp).
  - Indexed by `[userId, reviewedAt]` and `[cardId]`.
  - Automatically logged upon every `POST /api/v1/reviews/submit`.
- **Existing `UserCardProgress`**: Indexed by `[userId, status]`, `[userId, nextReviewDate]`, `[userId, interval, repetitions]`.

### Pillar 6 — UX, Design Tokens & A11y

- **Placement**:
  1. **Dashboard Overview Widget**: Compact Mastery summary bar + mini 30-day streak/activity sparkline + quick retention KPI cards.
  2. **Dedicated Analytics Page (`/analytics`)**: Full 365-day GitHub heatmap with interactive tooltips, Donut chart of mastery distribution, 7-day retention trend graph, and Deck-by-deck progress breakdown.
  3. **Deck Detail Page**: Deck completion forecast badge ("Estimated completion: Oct 14, 2026 (~24 days)").
- **Design Token Compliance (`DESIGN.md` & `MEMORY.md`)**:
  - Minimal pure canvas (`#ffffff`), 1px hairline borders (`#e5e5e5`), Obsidian black pills (`#000000`, `rounded-full`).
  - Font pairings: `Nunito` for metric numbers/headers, `Inter` for descriptive labels, `JetBrains Mono` for counts/dates.
  - Zero generic AI slop: No unrequested purple/neon mesh gradients, no heavy glassmorphism.
- **Accessibility**: WCAG AA compliant contrast for heatmap cells, aria-labels for chart segments and date cells, keyboard-navigable tooltips.

---

## Assumptions Confirmed

- **ASM-ANALYTICS-001**: Analytics is surfaced both as a summary widget on `/dashboard` and as a rich standalone view on `/analytics`.
- **ASM-ANALYTICS-002**: Activity heatmap intensity is driven by total card review submissions per day according to the user's local timezone.
- **ASM-ANALYTICS-003**: Mastery status follows standard SM-2 criteria: Mastered (`interval >= 21` days and `repetitions >= 4`), Learning (`1 <= interval < 21`), and New (`repetitions == 0`).
- **ASM-ANALYTICS-004**: Heatmap defaults to rolling 365 days (52 weeks) ending on today's date.
- **ASM-ANALYTICS-005**: Deck completion forecast utilizes 7-day trailing velocity with fallback to user `dailyGoal`.
- **ASM-ANALYTICS-006**: A lightweight `ReviewLog` table is added to provide high-performance aggregate querying without locking or recalculating full card progress history.

## Open Questions

- None. All 6 pillars confirmed and aligned with roadmap goals.
