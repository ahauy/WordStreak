# Intake: Streak Freeze Protection Mechanic (US-GAME-02)

- **Date**: 2026-08-21
- **Requested by**: Product Roadmap (Sprint 4 / Epic 05: Gamification, Streaks & Daily Habits)
- **Classification**: Full Feature
- **Classification signals**:
  - New or changed domain entities: 1-2 (`UserStreak` extended with freeze quota, `StreakFreezeHistory` or freeze tracking fields)
  - Existing DB schema change required: Yes (Additive fields on `UserStreak`: `streakFreezes`, `lastFreezeDate`)
  - Screens/flows touched: 2 (Dashboard Streak Widget, Review Completion / Streak Protection Modal)
  - User roles affected: 1 (Learner)
  - Cross-cutting: Yes (Touches core Streak calculation & daily evaluation logic)
  - Reversible without user-facing consequence: No (Affects persistent streak counts)
- **Protocol selected**: Full BA Pipeline (Stages 1 through 8 at full depth)
- **Override**: None

## One-line problem statement

Learners lose their entire daily study streak and motivation when life gets in the way for a single day; a Streak Freeze mechanic protects their active streak by automatically consuming a freeze buffer instead of resetting the streak count to 0 or 1.
