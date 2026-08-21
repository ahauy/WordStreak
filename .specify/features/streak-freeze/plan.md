# Implementation Plan: Streak Freeze Protection Mechanic (US-GAME-02)

**Slug**: `streak-freeze`  
**Status**: APPROVED  
**Date**: 2026-08-21

---

## 1. Technical Architecture & Slices

### Slice 1: Shared Types & Contracts (`packages/shared-types`)

- Extend `UserStreakDto`:
  - `streakFreezes: number` (current available freezes, 0..2)
  - `maxStreakFreezes: number` (constant = 2)
  - `wasProtectedByFreeze?: boolean`
  - `totalFreezesUsed?: number`
- Extend `StreakActivityResponseDto`:
  - `streakFreezes: number`
  - `wasProtectedByFreeze?: boolean`
  - `freezesUsed?: number`
  - `earnedMilestoneFreeze?: boolean`
- Build package via `pnpm --filter @wordstreak/shared-types build`.

### Slice 2: Database Schema & Migration (`apps/api`)

- Modify `model UserStreak` in `apps/api/prisma/schema.prisma`:
  - `streakFreezes Int @default(1)`
  - `lastFreezeDate DateTime?`
  - `totalFreezesUsed Int @default(0)`
- Generate Prisma Client: `pnpm --filter api prisma generate`.
- Run Migration: `pnpm --filter api prisma migrate dev --name add_streak_freeze_fields`.

### Slice 3: Backend Streak Engine Logic & Unit Tests (`apps/api`)

- Update `StreakService` in `apps/api/src/modules/streaks/streak.service.ts`:
  - Define `MAX_STREAK_FREEZES = 2`.
  - Helper `calculateDaysDifference(lastActiveDate, todayStr, timezone): number`.
  - In `getStreak()`:
    - If $\Delta d == 2$ (missed yesterday) and `streakFreezes >= 1`:
      - Consume 1 freeze atomically (`streakFreezes -= 1`, `totalFreezesUsed += 1`, `lastFreezeDate = now`).
      - Keep `currentStreak` preserved as pending today.
      - Return `wasProtectedByFreeze: true`, `streakFreezes: N - 1`.
    - If $\Delta d == 3$ (missed 2 days) and `streakFreezes == 2`:
      - Consume 2 freezes atomically (`streakFreezes = 0`, `totalFreezesUsed += 2`, `lastFreezeDate = now`).
      - Keep `currentStreak` preserved as pending today.
    - If $\Delta d > \text{streakFreezes} + 1$:
      - Reset `effectiveStreak = 0`.
  - In `recordActivity()`:
    - Check if day was missed and bridged by freeze: preserve `currentStreak + 1`.
    - Milestone reward check: If `newStreak === 7` or `newStreak === 30` and `streakFreezes < MAX_STREAK_FREEZES`: award +1 freeze (`streakFreezes += 1`), set `earnedMilestoneFreeze = true`.
  - Unit tests in `streak.service.spec.ts` covering:
    - 1 missed day with 1 freeze (auto-consume, streak preserved).
    - 2 missed days with 2 freezes (auto-consume 2, streak preserved).
    - 2 missed days with 1 freeze (gap too wide $\rightarrow$ reset to 0/1, freeze preserved).
    - 7-day milestone awards +1 freeze (up to 2).
    - Milestone at cap 2 does not exceed 2.

### Slice 4: Frontend UI & State Hooks (`apps/web`)

- Update `StreakWidget.tsx`:
  - Render frost ice shield badge (Cyan `#06B6D4`) with icon and freeze counter (`1/2 🧊`).
  - Add tooltip explaining freeze safety mechanics.
- Create `StreakSavedModal.tsx`:
  - Renders celebratory ice shield alert when `wasProtectedByFreeze` is true upon loading the app.
  - Non-generic AI slop: pure white card with hairline border `#e5e5e5`, Obsidian black pill CTA button, Lucide `ShieldAlert` / `Snowflake` icon.
- Update `StreakCelebrationModal.tsx` to announce milestone earned freeze when `earnedMilestoneFreeze` is true.

### Slice 5: Quality Review, Documentation & Verification

- Adversarial UI review via `ui-design-review` against `apps/web/DESIGN.md` and `apps/web/MEMORY.md`.
- Technical documentation in `docs/features/streak-freeze/README.md`.
- User guide with screenshots in `docs/user-guides/streak-freeze.md`.
- Update `docs/PRODUCT_BACKLOG_ROADMAP.md` marking `US-GAME-02` as `[x]`.
