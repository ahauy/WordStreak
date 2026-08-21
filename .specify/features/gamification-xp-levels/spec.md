# Technical Specification: Gamification XP & Learner Levels System

- **Feature**: Experience Points (XP) & Learner Levels System
- **Feature Slug**: `gamification-xp-levels`
- **Target Backlog Item**: `US-GAME-03`
- **Specification Phase**: Phase 2 (speckit-specify)
- **Status**: **APPROVED (Ready for Implementation)**
- **Author**: WordStreak Architecture & Technical Planning Specialist
- **Date**: 2026-08-21
- **Target Branch**: `feat/gamification-xp-levels`

---

## 1. Executive Technical Summary & Scope Boundaries

### 1.1 Technical Problem Statement

WordStreak learners need immediate micro-reinforcement for flashcard reviews and long-term milestones to sustain multi-month English vocabulary retention. While SM-2 scheduling optimizes memory intervals and streaks incentivize daily check-ins, the lack of an experience points (XP) ledger and level progression ladder limits engagement and user progression visibility.

This specification details the end-to-end technical implementation of the **Gamification XP & Learner Levels System**, covering:

1. **Server-authoritative XP calculation and distribution engine**.
2. **Immutable activity transaction ledger** (`user_activity_logs`).
3. **Monotonic polynomial level and 5-tier mastery progression hierarchy** ($L=1\dots50+$).
4. **Anti-abuse velocity rate limiting** (500 XP/hr, 2,000 XP/day).
5. **Real-time UX micro-feedback**: Floating floating `+XP` animations, responsive Topbar level progress badge, and obsidian dark celebration modal with celebratory confetti.

### 1.2 Scope Boundaries & Feature Matrix

| Functional Area         | In-Scope (Must/Should-Have)                                                                                                                                                             | Out-of-Scope (Won't-Have)                                                             |
| ----------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| **XP Calculation**      | Card reviews (+10/+5/0 XP), Daily goal met (+50 XP), 7-day milestone (+100 XP), 30-day milestone (+500 XP), Practice quiz score $\ge 80\%$ (+30 XP) / $<80\%$ (+10 XP).                 | Negative XP penalties, score-based card XP multipliers, paid XP booster items.        |
| **Level Progression**   | Deterministic curve: $\text{threshold}(L) = \lfloor 50 \times (L-1)^{1.5} + 50 \times (L-1) \rfloor$, 5 Tiers (Bronze, Silver, Gold, Diamond, Master).                                  | Level degradation on inactivity, tier demotions, seasonal rank resets.                |
| **Data Persistence**    | PostgreSQL atomic write: `User.totalXp`, `User.level`, `User.tier` updated alongside immutable append-only `user_activity_logs` in a single `$transaction`.                             | External unlogged mutations, direct client-injected XP endpoints.                     |
| **Security & Velocity** | Sliding window rate limits (500 XP/hr, 2,000 XP/24h), server-enforced IANA timezone resolution, review replay deduplication (2s window).                                                | Cryptographic token proofing, client-side clock trust, proof-of-work puzzles.         |
| **Frontend UI/UX**      | Topbar Level Pill widget with hover popover, floating study `+XP` spring animation, Obsidian dark level-up celebration modal with canvas-confetti, `prefers-reduced-motion` compliance. | 3D animated avatars, heavy particle effects that breach 60fps budget, paywall modals. |

---

## 2. User Personas & Technical Journeys

### Persona 1: Daily Consistent Learner (Alex)

- **Goal**: Complete daily review queue of 15 words and maintain habit.
- **Technical Journey**:
  1. Alex logs into WordStreak. Topbar renders `Lv. 4 (Bronze)` with 510/600 XP (85% progress bar).
  2. Reviews 10 flashcards (10 "Good" ratings): Each review returns `+10 XP` with floating upward animation.
  3. On the 10th review (matching Alex's `dailyGoal = 10`), the backend detects daily goal completion in Alex's local timezone (`Asia/Ho_Chi_Minh`), granting `+10 XP` (review) + `+50 XP` (daily goal) = `+60 XP`.
  4. Total XP reaches 670 XP, crossing the Level 5 threshold (600 XP).
  5. API response includes `levelUp: { isLevelUp: true, currentLevel: 5, isTierPromotion: false }`.
  6. Frontend pauses next card queue and presents the Level 5 Celebration Modal with smooth spring pop-in.

### Persona 2: Power Reviewer / Rapid Learner (Minh)

- **Goal**: Clear backlogs and master 200+ vocabulary terms in one weekend.
- **Technical Journey**:
  1. Minh reviews 60 cards within 30 minutes.
  2. For the first 50 successful reviews, Minh earns 500 XP.
  3. On card 51, the backend `XpRateLimiterService` flags that hourly review XP has reached 500 XP.
  4. Card 51 is saved to SM-2 and `review_logs` normally, but `xpEarned` is 0 and status is `RATE_LIMITED`.
  5. UI displays flashcard interval updates without XP award toasts, preventing automated script farming.

### Persona 3: Legacy Returning Learner (Sarah)

- **Goal**: Return to WordStreak and find past 400 reviews credited toward new level hierarchy.
- **Technical Journey**:
  1. On release deployment, the idempotent backfill migration runs over legacy `review_logs` and `user_streaks`.
  2. Sarah's account is computed: 350 valid reviews ($3,500\text{ XP}$) + 14-day streak ($200\text{ XP}$) = $3,700\text{ XP}$.
  3. Sarah opens WordStreak and immediately starts at **Level 16 (Gold Tier)** with full status prestige.

---

## 3. Formal Functional Requirements

### REQ-XP-001: Card Review XP Award Engine

- **Actor**: Authenticated Learner
- **Input**: `cardId: string`, `rating: SrsRating (1 | 2 | 3 | 4)`
- **Behavior**:
  - Rating `3 (GOOD)` or `4 (EASY)` $\rightarrow$ **+10 XP**
  - Rating `2 (HARD)` $\rightarrow$ **+5 XP**
  - Rating `1 (AGAIN)` $\rightarrow$ **0 XP**
- **Output**: Returns `XpReviewRewardDto` containing `xpEarned`, `breakdown`, `totalXp`, `level`, `tier`, `levelProgressPercent`, and `levelUp` status.
- **Constraint**: Pure server-authoritative; zero negative XP allowed.

### REQ-XP-002: Daily Goal Completion Bonus

- **Actor**: System (via Review Submission Trigger)
- **Input**: `userId: string`, `clientTimezone?: string`
- **Behavior**:
  - Evaluates total reviews completed on current calendar date in user's resolved IANA timezone.
  - If `todayReviewsCount >= user.dailyGoal` AND no `DAILY_GOAL_COMPLETED` record exists in `user_activity_logs` for `localDate`, grant **+50 XP** bonus.
- **Constraint**: Exactly one grant per user per calendar date.

### REQ-XP-003 & REQ-XP-004: Streak Milestone XP Bonuses

- **Actor**: System (via Streak Activity Trigger)
- **Input**: `currentStreak: number`, `streakIncreased: boolean`
- **Behavior**:
  - If `streakIncreased === true` and `currentStreak % 7 === 0`, award **+100 XP** (`STREAK_7_DAYS`).
  - If `streakIncreased === true` and `currentStreak % 30 === 0`, award **+500 XP** (`STREAK_30_DAYS`).
- **Constraint**: Deduplicated against existing milestone records; streak freeze maintenance without count increase does not re-trigger bonus.

### REQ-XP-005: Pure Deterministic Level & Tier Engine

- **Formula**:
  $$\text{threshold}(L) = \lfloor 50 \times (L - 1)^{1.5} + 50 \times (L - 1) \rfloor$$
- **Tier Boundaries**:
  - **Bronze**: Levels 1–5 ($0 - 809\text{ XP}$)
  - **Silver**: Levels 6–15 ($810 - 3,649\text{ XP}$)
  - **Gold**: Levels 16–30 ($3,650 - 9,709\text{ XP}$)
  - **Diamond**: Levels 31–45 ($9,710 - 17,339\text{ XP}$)
  - **Master**: Levels 46–50+ ($17,340+\text{ XP}$)
- **Constraint**: Pure functions with zero side effects; identical execution on backend and frontend optimistic engine.

### REQ-XP-006: Atomic Transaction Ledger

- **Behavior**: Every XP grant writes an immutable row to `user_activity_logs` with JSONB `metadata` and updates `User.totalXp`, `User.level`, and `User.tier` inside a single PostgreSQL `$transaction`.
- **Constraint**: Zero dirty reads, transaction duration $< 15\text{ms}$.

### REQ-XP-007: Anti-Abuse Velocity Rate Limiting

- **Thresholds**: Max 500 XP/hr and 2,000 XP/24h from card review actions.
- **Behavior**: Exceeding rate limits continues SM-2 scheduling but suppresses XP issuance with code `XP_RATE_LIMITED`.

### REQ-XP-008: Topbar Gamification Widget

- **Behavior**: Header renders active Level Pill with Tier Metallic Badge, Level Label (`Lv. X`), and 4px liquid progress bar. Hover displays popover tooltip with total XP and remaining XP to next tier.

### REQ-XP-009: Study Floating Micro-Animation

- **Behavior**: Rating a card triggers floating badge `+10 XP` drifting upward 24px and fading over 800ms adjacent to the selected rating button.

### REQ-XP-010: Level-Up Celebration Modal

- **Behavior**: Triggered when `levelUp.isLevelUp === true`. Renders Obsidian dark frosted dialog (`#090909`), tier crest spring animation, and full-screen canvas confetti (disabled on `prefers-reduced-motion`).

### REQ-XP-011: Practice Quiz XP Bonus

- **Behavior**: Completing quiz session with score $\ge 80\%$ awards **+30 XP**, score $< 80\%$ awards **+10 XP**. Capped at 5 quiz rewards per user per calendar day.

### REQ-XP-012: Historical Backfill Migration

- **Behavior**: Idempotent batch processing script crediting historical reviews and streaks for existing accounts upon release.

---

## 4. API Endpoint Specifications

### 4.1 `POST /api/v1/reviews` (Extended)

- **Description**: Submits flashcard SRS rating, computes SM-2 schedule, updates streak, and awards atomic XP.
- **Authentication**: Bearer JWT Required (`Learner`, `Pro`, `Admin`)
- **Headers**:
  - `Authorization: Bearer <token>`
  - `X-Timezone: <IANA_Timezone_String>` (e.g. `Asia/Ho_Chi_Minh`, optional fallback to user profile / UTC)
- **Request Body**:
  ```json
  {
    "cardId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "rating": 3
  }
  ```
- **Response `200 OK`**:
  ```json
  {
    "cardId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "status": "LEARNING",
    "interval": 1,
    "repetitions": 1,
    "easeFactor": 2.5,
    "lastReviewedAt": "2026-08-21T07:49:00.000Z",
    "nextReviewDate": "2026-08-22T07:49:00.000Z",
    "streak": {
      "currentStreak": 7,
      "bestStreak": 7,
      "streakIncreased": true,
      "isActiveToday": true,
      "flameTier": 2,
      "message": "7 day streak! Keep it going!",
      "streakFreezes": 1
    },
    "xp": {
      "xpEarned": 160,
      "breakdown": [
        { "type": "CARD_REVIEW", "xp": 10, "description": "Good Review" },
        {
          "type": "DAILY_GOAL_COMPLETED",
          "xp": 50,
          "description": "Daily Goal Reached (10 cards)"
        },
        {
          "type": "STREAK_7_DAYS",
          "xp": 100,
          "description": "7-Day Streak Milestone"
        }
      ],
      "totalXp": 820,
      "level": 6,
      "tier": "SILVER",
      "currentLevelXp": 10,
      "nextLevelRequiredXp": 250,
      "levelProgressPercent": 4.0,
      "levelUp": {
        "isLevelUp": true,
        "previousLevel": 5,
        "currentLevel": 6,
        "previousTier": "BRONZE",
        "currentTier": "SILVER",
        "isTierPromotion": true
      }
    }
  }
  ```

---

### 4.2 `GET /api/v1/gamification/xp/summary`

- **Description**: Returns the authenticated user's real-time XP summary, level progress, today's accrued XP, and tier details.
- **Authentication**: Bearer JWT Required
- **Response `200 OK`**:
  ```json
  {
    "userId": "usr_998822",
    "totalXp": 4250,
    "level": 18,
    "tier": "GOLD",
    "currentLevelXp": 185,
    "nextLevelRequiredXp": 490,
    "levelProgressPercent": 37.75,
    "todayXp": 80,
    "dailyGoalBonusEarnedToday": true,
    "nextTier": "DIAMOND",
    "nextTierLevel": 31,
    "tierMetadata": {
      "tier": "GOLD",
      "nameEn": "Gold",
      "nameVi": "Vàng",
      "minLevel": 16,
      "maxLevel": 30,
      "colorHex": "#D97706",
      "badgeIcon": "solar-gold-crest"
    }
  }
  ```

---

### 4.3 `GET /api/v1/gamification/xp/history`

- **Description**: Retrieves paginated activity ledger entries for the current user.
- **Authentication**: Bearer JWT Required
- **Query Parameters**:
  - `page` (number, default: 1)
  - `limit` (number, default: 20, max: 100)
  - `activityType` (optional string filter: `CARD_REVIEW`, `DAILY_GOAL_COMPLETED`, `STREAK_7_DAYS`, `STREAK_30_DAYS`, `PRACTICE_QUIZ`)
- **Response `200 OK`**:
  ```json
  {
    "data": [
      {
        "id": "log_a1b2c3d4",
        "activityType": "DAILY_GOAL_COMPLETED",
        "xpEarned": 50,
        "metadata": { "localDate": "2026-08-21", "cardCount": 10 },
        "createdAt": "2026-08-21T07:49:00.000Z"
      },
      {
        "id": "log_e5f6g7h8",
        "activityType": "CARD_REVIEW",
        "xpEarned": 10,
        "metadata": { "cardId": "card-123", "rating": 3 },
        "createdAt": "2026-08-21T07:48:58.000Z"
      }
    ],
    "meta": {
      "total": 342,
      "page": 1,
      "limit": 20,
      "totalPages": 18
    }
  }
  ```

---

### 4.4 `POST /api/v1/gamification/xp/practice`

- **Description**: Submits practice quiz results and calculates practice session XP bonus.
- **Authentication**: Bearer JWT Required
- **Request Body**:
  ```json
  {
    "sessionId": "quiz_session_9988",
    "score": 9,
    "totalQuestions": 10
  }
  ```
- **Response `200 OK`**:
  ```json
  {
    "sessionId": "quiz_session_9988",
    "scorePercentage": 90.0,
    "xpEarned": 30,
    "totalXp": 4280,
    "level": 18,
    "tier": "GOLD",
    "levelUp": {
      "isLevelUp": false,
      "previousLevel": 18,
      "currentLevel": 18,
      "previousTier": "GOLD",
      "currentTier": "GOLD",
      "isTierPromotion": false
    }
  }
  ```

---

## 5. Technical Error Matrix

| Error Code          | HTTP Status   | Trigger Condition                            | Response Body                                                                             |
| ------------------- | ------------- | -------------------------------------------- | ----------------------------------------------------------------------------------------- |
| `UNAUTHORIZED`      | 401           | Missing or expired JWT token.                | `{ "statusCode": 401, "message": "Unauthorized" }`                                        |
| `CARD_NOT_FOUND`    | 404           | Card ID not found in database.               | `{ "statusCode": 404, "message": "Card with ID card-123 not found" }`                     |
| `CARD_FORBIDDEN`    | 403           | Card belongs to another user's deck.         | `{ "statusCode": 403, "message": "You do not have access to this card" }`                 |
| `INVALID_RATING`    | 400           | Rating is not in range 1–4.                  | `{ "statusCode": 400, "message": "rating must be between 1 and 4" }`                      |
| `XP_VELOCITY_CAP`   | 200 / Warning | Hourly review XP exceeds 500 XP.             | Normal SM-2 response, `xp.breakdown` includes `{ type: 'RATE_LIMITED', xp: 0 }`.          |
| `QUIZ_CAP_EXCEEDED` | 429           | Daily practice quiz count exceeds 5 per day. | `{ "statusCode": 429, "message": "Daily practice quiz XP reward limit reached (5/day)" }` |

---

## 6. Non-Functional Requirements & Performance Thresholds

### 6.1 Performance & Latency Budgets

- **Review Submission P95 Latency**: $\le 50\text{ ms}$ total execution time on backend (SM-2 + Streak + XP + Single DB Transaction).
- **Review Submission P99 Latency**: $\le 100\text{ ms}$.
- **Database Lock Time**: Atomic `$transaction` lock duration $< 15\text{ms}$.
- **Level Calculation Overhead**: In-memory deterministic algorithm execution $< 0.05\text{ ms}$.

### 6.2 Concurrency & Race Conditions

- Using PostgreSQL atomic increment: `UPDATE users SET "totalXp" = "totalXp" + $1, level = $2, tier = $3 WHERE id = $4`.
- Activity log insertion within the same transaction ensures audit consistency even under simultaneous multi-tab study sessions.

### 6.3 Accessibility (WCAG 2.1 AA)

- **Contrast**: Tier text and badge backgrounds strictly adhere to minimum 4.5:1 contrast against `#ffffff` and `#090909`.
- **Keyboard Trapping**: `LevelUpCelebrationModal` traps focus, allows closing via `Escape`, and returns focus to the last active study control upon dismissal.
- **Motion Reduction**: If `window.matchMedia('(prefers-reduced-motion: reduce)').matches`, all confetti explosions and spring transitions are disabled or replaced with immediate opacity fades.

### 6.4 Telemetry & Observability

- **Structured Logs**:
  - `[XpService] Awarded ${xp} XP to user ${userId} for ${activityType}`
  - `[XpService][LevelUp] User ${userId} leveled up from ${oldLevel} to ${newLevel} (Tier: ${newTier})`
  - `[XpRateLimiter][Warning] User ${userId} exceeded hourly XP velocity cap (500 XP)`
- **Prometheus Metrics**:
  - `wordstreak_xp_granted_total{activity_type="CARD_REVIEW"}` (Counter)
  - `wordstreak_level_up_events_total{tier="SILVER"}` (Counter)
  - `wordstreak_xp_transaction_duration_ms` (Histogram, buckets: 5, 10, 25, 50, 100, 250)

---

## 7. Sign-off & Verification Criteria

- [x] All 12 SRS requirements mapped to concrete technical specifications.
- [x] Extended `ReviewResponse` schema and new XP endpoints specified with JSON payloads.
- [x] Non-functional latency thresholds (P95 < 50ms) and concurrency models documented.
- [x] Accessibility rules and telemetry metrics formalized.
