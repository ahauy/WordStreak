# Intake: Experience Points (XP) & Learner Levels System (US-GAME-03)

- **Feature Title**: Experience Points (XP) & Learner Levels System
- **Feature Slug**: `gamification-xp-levels`
- **Target Backlog Item**: `US-GAME-03` (Epic 05: Gamification, Streaks & Daily Habits)
- **Target Branch**: `feat/gamification-xp-levels`
- **Date**: 2026-08-21
- **Requested by**: Product Roadmap & Domain Architecture Gate
- **Classification**: **Full Feature**
- **Classification signals**:
  - **New or changed domain entities**: 2 (`UserActivityLog`, `UserGamificationProfile` / extension to `User` / `UserStreak`)
  - **Existing DB schema change required**: Yes (Structural: new `user_activity_logs` table for immutable XP transaction logs and `xp`/`level` attributes on user model)
  - **Screens/flows touched**: 4 (SRS Review Card Flow, Daily Goal Celebration Flow, Topbar/Dashboard XP & Level Progression Widget, Level-Up Celebration Modal Flow)
  - **User roles affected**: 2 (`Learner`, `System Admin`)
  - **Cross-cutting**: Yes (Gamification Core, SRS Review Engine, Daily Streak Engine, Activity Analytics)
  - **Reversible without user-facing consequence**: No (XP balances, historical activity ledger, and earned levels are permanent user achievements)
- **Protocol selected**: **Full Feature Pipeline** (Stages 1 through 8 at full depth)
- **Override**: None

---

## One-line Problem Statement

Learners lack granular, immediate positive reinforcement for individual study actions and a progressive mastery hierarchy; an immutable Experience Points (XP) ledger and multi-tier Learner Level progression system (Bronze -> Silver -> Gold -> Diamond -> Master) creates instant dopamine feedback loops, recognizes study consistency, and drives long-term retention.
