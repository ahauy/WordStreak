# Gap Analysis: Gamification XP & Learner Levels System (US-GAME-03)

- **Feature**: Experience Points (XP) & Learner Levels System
- **Slug**: `gamification-xp-levels`
- **Date**: 2026-08-21
- **Status**: Completed

---

## 1. AS-IS (Current State)

### Existing Implementation & Schema Inspection

- **Database (`apps/api/prisma/schema.prisma`)**:
  - `User` model has `id`, `email`, `username`, `dailyGoal` (default 10), `avatarUrl`, but **no fields for `totalXp`, `level`, or `tier`**.
  - `UserStreak` tracks `currentStreak`, `bestStreak`, `lastActiveDate`, `streakFreezes`, but has no awareness of XP or level rewards.
  - `ReviewLog` stores historical card reviews with `rating`, `interval`, `reviewedAt`, but does not track XP earned or activity reward metadata.
  - There is **no table for activity logs or transaction ledgers** (`user_activity_logs` is missing).
- **Backend Services (`apps/api/src/modules/`)**:
  - `ReviewsService.submitReview` computes SM-2 progress and calls `streakService.recordActivity(userId)`, but returns no XP data.
  - Daily goal completion is checked visually on frontend, but there is no server-side XP event or persistence for reaching daily goals.
  - Streak milestones (7/30 days) award Streak Freezes in `StreakService`, but do not award milestone XP bonuses (+100 XP / +500 XP).
- **Frontend (`apps/web/`)**:
  - Topbar displays flame streak icon and user avatar, but has **no XP counter, Level badge, or Level progress bar**.
  - Review completion screen displays card statistics, but lacks XP breakdown, floating XP animations, or level-up celebration popups.
  - No celebratory confetti modal exists for level promotions.

---

## 2. TO-BE (Target State)

### Target End-to-End Experience

- **Immediate Micro-Feedback**: Every reviewed card triggers an animated floating `+10 XP` (or `+5 XP` for Hard) micro-badge. Review submit response includes updated XP totals and level progression delta.
- **Milestone Rewards**:
  - Reaching the daily goal (e.g. 10th card of the day) triggers a celebratory "Daily Goal Met! +50 XP" bonus.
  - Hitting streak milestones (7, 14, 21, 30 days) triggers milestone XP rewards (+100 XP / +500 XP).
- **Visual Hierarchy & Identity**:
  - Topbar and profile prominently feature the Learner's current Level and Tier crest (Bronze, Silver, Gold, Diamond, Master) alongside an interactive progress bar showing XP needed for the next level.
  - Achieving a new level triggers an obsidian glass `LevelUpModal` with dynamic tier styling, celebratory sound/haptics, confetti particle burst, and clear level statistics.
- **Robust Ledger & Anti-Abuse**:
  - All XP changes are backed by immutable rows in `user_activity_logs`.
  - XP rate limits (500 XP/h, 2,000 XP/day) and server-authoritative timestamps protect the economy from scripting and replay attacks.

---

## 3. Four Gap Categories

### 3.1 Functional Gaps

1. **XP Calculation & Awarding Engine**:
   - Need a dedicated `XpService` / `GamificationService` to compute XP deltas for reviews, daily goals, practice quizzes, and streak milestones.
   - Need deterministic level calculation formulas converting cumulative XP to Levels (1–50+) and Tiers (Bronze -> Silver -> Gold -> Diamond -> Master).
2. **Review & Streak Hook Integration**:
   - `ReviewsService.submitReview` must integrate with `XpService` to award review XP, evaluate daily goal completion, and return XP telemetry in the review response.
   - `StreakService` must notify `XpService` when 7-day or 30-day streak milestones are crossed.
3. **Frontend UI Components**:
   - `XpLevelBadge` / `XpProgressBar` topbar component with hover tooltip showing exact progress `[450 / 600 XP (75%)]`.
   - `FloatingXp` micro-animation component on study screen.
   - `LevelUpCelebrationModal` with canvas-confetti, tier-colored radiant halos, and sound effects.
   - `/profile` or `/gamification` statistics tab showing XP breakdown and historical activity timeline.

### 3.2 Data Gaps

1. **Schema Extension on `User`**:
   - Add `totalXp Int @default(0)`
   - Add `level Int @default(1)`
   - Add `tier String @default("BRONZE")`
2. **New Table `user_activity_logs`**:
   - Columns: `id` (UUID PK), `userId` (FK to User), `activityType` (Enum/String: `CARD_REVIEW`, `DAILY_GOAL_COMPLETED`, `STREAK_7_DAYS`, `STREAK_30_DAYS`, `PRACTICE_QUIZ`, `ADMIN_ADJUSTMENT`), `xpEarned` (Int), `metadata` (JSONB), `createdAt` (DateTime).
   - Indexes: `@@index([userId, createdAt])`, `@@index([userId, activityType])`.
3. **Shared Types (`packages/shared-types`)**:
   - Define `GamificationProfileDto`, `XpActivityLogDto`, `LevelUpEventDto`, `GamificationTier`, `XpTransactionType`.
   - Update `SubmitReviewResponseDto` to include `xp` payload.

### 3.3 User Impact

- **Existing Learners**:
  - Existing users must not start at Level 1 with 0 XP if they have months of historical study logs.
  - A historical XP backfill or lazy recalibration must recognize past achievements upon their first login post-launch.
- **Workflow Changes**:
  - Review flow remains frictionless: XP calculation adds zero extra clicks or friction; animations are non-blocking and gracefully dismissable.
  - Accessibility respects `prefers-reduced-motion` so users sensitive to animations can disable particle bursts.

### 3.4 Transition Requirements

1. **Historical Data Migration / Backfill Script**:
   - Provide a Prisma migration and database seed/backfill script:
     $$\text{Initial User XP} = \sum (\text{valid historical reviews with rating } \ge 2 \times 10) + (\text{historical streak milestones})$$
   - Alternatively, a lazy evaluation on user profile load: if `totalXp == 0` and historical `ReviewLog` count > 0, backfill cumulative XP and set appropriate Level/Tier in a background task.
2. **Dual-Run / Backward Compatibility**:
   - Old mobile or web clients consuming `POST /api/v1/reviews` will simply ignore the new `xp` and `levelUp` JSON keys without breaking.
3. **Feature Flag & Staged Rollout**:
   - Gamification XP engine can be toggled via config or environment flag (`FEATURE_GAMIFICATION_XP=true`) during canary deployment.
4. **User Communication**:
   - First-time login banner / modal: "Introducing WordStreak Levels! Your past reviews have earned you Level X [Tier] 🏆".

---

## Exit Checklist

- [x] AS-IS documented by inspecting Prisma schema and NestJS services.
- [x] TO-BE documented with end-to-end learner experience.
- [x] All 4 gap categories (Functional, Data, User Impact, Transition) addressed.
- [x] Transition requirements include migration backfill and backward compatibility.
