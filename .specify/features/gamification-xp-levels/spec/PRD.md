# Product Requirements Document (PRD): Gamification XP & Learner Levels System

- **Feature**: Experience Points (XP) & Learner Levels System
- **Epic**: EPIC 05: Gamification, Streaks & Daily Habits
- **User Story Identifier**: `US-GAME-03`
- **Feature Slug**: `gamification-xp-levels`
- **Target Branch**: `feat/gamification-xp-levels`
- **Date**: 2026-08-21
- **Status**: Draft (BA Stage 6 Specification)

---

## 1. Executive Summary & Problem Statement

Learning vocabulary requires continuous, repeated daily effort over months. While WordStreak offers an intelligent spaced repetition system (SM-2) and a Daily Streak engine, learners often experience motivation plateaus between long-term milestones.

The **Gamification XP & Learner Levels System** introduces immediate micro-reinforcement for every study action (card review, daily goal completion, streak milestones, practice quizzes) coupled with a prestigious 5-tier mastery progression hierarchy (**Bronze -> Silver -> Gold -> Diamond -> Master**). By turning vocabulary retention into a transparent, satisfying progression journey, WordStreak maximizes daily engagement, session completion rates, and long-term user retention.

---

## 2. Target Personas & Stakeholders

- **Casual Learner (Guest -> Registered)**: Seeks immediate positive affirmation for short 5-minute study sessions.
- **Dedicated Learner (Core User)**: Motivated by reaching higher level milestones, unlocking metallic tier crests, and completing daily goals.
- **High-Volume / Pro Learner**: Drives for Diamond and Master ranks, highly motivated by prestige progression and milestone XP bonuses.
- **System Administrator**: Monitors system economy balance, validates ledger integrity, and prevents automated script farming.

---

## 3. Measurable Success Metrics

| Metric                            | Baseline | Target (Post-Launch)       | Measurement Method                                             |
| --------------------------------- | -------- | -------------------------- | -------------------------------------------------------------- |
| **D14 User Retention**            | 42%      | **$\ge 55\%$ (+25% lift)** | Cohort analysis from user registration / feature release date  |
| **Daily Review Queue Completion** | 62%      | **$\ge 85\%$**             | Percentage of active users completing their daily review queue |
| **Daily Cards Reviewed / User**   | 18 cards | **$\ge 25$ cards (+38%)**  | Mean `ReviewLog` entries per active user per day               |
| **API Latency Overhead (P95)**    | N/A      | **$< 50\text{ ms}$**       | Server telemetry on `POST /api/v1/reviews` with XP payload     |

---

## 4. User Journey & Core Flows

```
[Start Session]
      │
      ▼
[Review Flashcard: Good (+10 XP) / Hard (+5 XP)] ──► [Floating "+10 XP" Micro-Animation]
      │
      ├─► [Check Daily Goal (e.g. Card #10)] ──► [Award +50 XP Bonus & Goal Toast]
      │
      ├─► [Check Streak Milestone (7 / 30 Days)] ──► [Award +100 / +500 XP Bonus]
      │
      ▼
[Evaluate Lifetime Cumulative XP]
      │
      ├─► [Within Current Level Band] ──► [Smooth Topbar Progress Bar Update]
      │
      └─► [Crossed Level Threshold] ──► [Trigger LevelUpCelebrationModal with Confetti 🎉]
```

---

## 5. Scope & Boundary Matrix (MoSCoW)

### 5.1 In-Scope (Must-Have & Should-Have)

- **XP Calculation Engine**: Server-authoritative calculation for card reviews (+10/+5/0 XP), daily goal bonuses (+50 XP), streak milestones (+100/+500 XP), and quiz completions (+30 XP).
- **Mastery Hierarchy**: 5 Tiers (Bronze, Silver, Gold, Diamond, Master) and 50+ Levels based on progressive mathematical threshold formula.
- **Immutable Transaction Ledger**: New `user_activity_logs` table storing every XP grant with metadata and timestamps.
- **Topbar Progress Widget**: Liquid-glass level badge, tier crest icon, and animated progress bar showing current level progress.
- **Study Micro-Feedback**: Floating animated `+XP` badge on review rating submission.
- **Level-Up Celebration Modal**: Obsidian-dark frosted dialog featuring animated tier crest, confetti burst, level stats, and dismiss button.
- **Anti-Abuse Protections**: Review XP velocity caps (500 XP/hr, 2,000 XP/day), server-enforced IANA timezone resolution, and single-grant daily goal deduplication.

### 5.2 Explicitly Out-of-Scope (Won't-Have)

- Real-money cashouts, gift card redemptions, or cryptocurrency/NFT tokens.
- Paid micro-transaction XP boosters or pay-to-win skips.
- Live multiplayer PvP XP duels or wagering.
- Negative XP deductions or level demotions upon card errors.

---

## 6. Design System & UI/UX Guidelines

- **Theme**: Liquid glass / modern dark aesthetic aligned with WordStreak tokens.
- **Tier Visuals**:
  - **Bronze**: `#B45309` / `#CD7F32` (Amber metallic)
  - **Silver**: `#94A3B8` / `#E2E8F0` (Platinum slate)
  - **Gold**: `#F59E0B` / `#D97706` (Solar gold)
  - **Diamond**: `#06B6D4` / `#38BDF8` (Cyan frost diamond)
  - **Master**: `#8B5CF6` / `#A855F7` (Cosmic royal violet)
- **Motion & Accessibility**: Fluid ease-out spring physics (`framer-motion` or CSS transitions); graceful degradation for `prefers-reduced-motion: reduce`.
