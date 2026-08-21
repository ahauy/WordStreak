# Quickstart & Developer Runbook: Gamification XP & Learner Levels

- **Feature**: Experience Points (XP) & Learner Levels System
- **Feature Slug**: `gamification-xp-levels`
- **Target Backlog Item**: `US-GAME-03`
- **Specification Phase**: Phase 3 (speckit-plan)
- **Status**: **APPROVED (Ready for Implementation)**
- **Author**: WordStreak Technical Planning Specialist
- **Date**: 2026-08-21
- **Target Branch**: `feat/gamification-xp-levels`

---

## 1. Prerequisites & Environment Setup

Ensure the local PostgreSQL database and development dependencies are initialized:

```bash
# Verify Node.js and pnpm versions
node -v   # >= 20.x
pnpm -v   # >= 9.x

# Start PostgreSQL database (if running via Docker Compose)
docker compose up -d postgres
```

---

## 2. Database Migration & Shared Types Build

### Step 1: Update Shared Types Package

Add `gamification-xp.contract.ts` into `packages/shared-types/src/gamification-xp.ts` and export it in `packages/shared-types/src/index.ts`.

```bash
# Typecheck shared types
pnpm --filter @wordstreak/shared-types build
```

### Step 2: Apply Prisma Schema Migration

Update `apps/api/prisma/schema.prisma` with `totalXp`, `level`, `tier`, and `UserActivityLog`.

```bash
# Generate Prisma Client and create migration
pnpm --filter api prisma migrate dev --name add_gamification_xp_and_activity_logs
```

### Step 3: Run Historical Backfill (Optional for existing local data)

```bash
# Execute backfill script against local DB
pnpm --filter api tsx src/scripts/backfill-xp.ts
```

---

## 3. Running Backend Services & Unit Tests

### Run Backend Unit Tests

Verify `LevelEngineService`, `XpRateLimiterService`, `XpService`, and `ReviewsService` XP integration:

```bash
# Run NestJS unit tests
pnpm --filter api test apps/api/src/modules/gamification/
pnpm --filter api test apps/api/src/modules/reviews/
```

### Start API Server

```bash
pnpm --filter api dev
# API runs at http://localhost:3000
```

---

## 4. Running Frontend UI & Vitest Suite

### Run Frontend Unit Tests

Verify `TopbarLevelWidget`, `FloatingXpToast`, `LevelUpCelebrationModal`, and hooks:

```bash
# Run Vitest suite
pnpm --filter web test
```

### Start Web Client

```bash
pnpm --filter web dev
# Web runs at http://localhost:5173
```

---

## 5. API Testing with cURL / Postman

### 5.1 Review Flashcard & Earn XP

```bash
curl -X POST http://localhost:3000/api/v1/reviews \
  -H "Authorization: Bearer <YOUR_JWT_TOKEN>" \
  -H "Content-Type: application/json" \
  -H "X-Timezone: Asia/Ho_Chi_Minh" \
  -d '{
    "cardId": "<CARD_UUID>",
    "rating": 3
  }'
```

### 5.2 Get XP Summary

```bash
curl -X GET http://localhost:3000/api/v1/gamification/xp/summary \
  -H "Authorization: Bearer <YOUR_JWT_TOKEN>"
```

### 5.3 Get Activity History

```bash
curl -X GET "http://localhost:3000/api/v1/gamification/xp/history?page=1&limit=10" \
  -H "Authorization: Bearer <YOUR_JWT_TOKEN>"
```

---

## 6. Manual Smoke Testing Checklist

| Test Case                               | Steps                                                                | Expected Result                                                                                                                      |
| --------------------------------------- | -------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| **1. Review Good Rating (+10 XP)**      | Navigate to `/study`, rate card as "Good" (Rating 3).                | Floating `+10 XP` animates upward; Topbar progress bar increases; User total XP increments by 10.                                    |
| **2. Daily Goal Bonus (+50 XP)**        | Set `dailyGoal = 2` in settings. Review 2 cards today.               | 2nd review response awards `+10 XP` + `+50 XP` (`DAILY_GOAL_COMPLETED`); Toast notification displays "Daily Goal Completed! +50 XP". |
| **3. 7-Day Streak Milestone (+100 XP)** | Complete review on day 7 of active streak.                           | Response awards `+100 XP` milestone bonus with `STREAK_7_DAYS` breakdown.                                                            |
| **4. Level-Up Celebration Modal**       | Review card when `currentLevelXp + earnedXp >= nextLevelRequiredXp`. | Obsidian celebration modal opens with Silver/Gold tier crest and canvas confetti; dismisses on `Escape`.                             |
| **5. Velocity Rate Limit**              | Review > 50 cards within 1 hour.                                     | Review schedule updates normally, but XP is awarded as `0 XP` with `RATE_LIMITED` breakdown.                                         |
| **6. Reduced Motion Accessibility**     | Enable `prefers-reduced-motion: reduce` in OS settings.              | Level up modal displays smoothly without particle explosion; floating toast fades without bouncing.                                  |
