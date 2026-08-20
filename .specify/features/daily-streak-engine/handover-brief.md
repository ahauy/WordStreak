# Handover Brief: Daily Streak Engine & Timezone Logic (US-GAME-01)

- **Feature Slug**: `daily-streak-engine`
- **Target Epic**: `EPIC-05: Gamification, Streaks & Daily Habits`
- **Sprint**: Sprint 3
- **Date**: 2026-08-20
- **Status**: READY FOR GATE 1 CONFIRMATION

---

## 1. Executive Summary

This feature implements the core Daily Streak Engine (`US-GAME-01`) for WordStreak:

- Timezone-aware daily streak calculation (`YYYY-MM-DD` localized date comparison).
- Real-time streak increment upon completing SM-2 flashcard reviews or practice quizzes.
- Idempotent execution within the same calendar day.
- REST endpoints: `GET /api/v1/streaks/me` and `POST /api/v1/streaks/record-activity`.
- Frontend integration: `useStreak` hook, live `StreakFlame` component with dynamic Electric Violet tiers, and `StreakCelebrationModal`.

---

## 2. Key Architecture & Deliverables

- **API (`apps/api/src/modules/streaks/`)**:
  - `StreakModule`, `StreakController`, `StreakService`, `StreakService.spec.ts`.
  - Integration into `ReviewsService.submitReview` to trigger streak activity recording.
- **Shared Types (`packages/shared-types/`)**:
  - Streak DTOs: `UserStreakDto`, `RecordStreakActivityDto`, `StreakActivityResponseDto`.
- **Frontend (`apps/web/src/features/dashboard/`)**:
  - `useStreak` hook and `streakService.ts`.
  - Dynamic `StreakFlame.tsx` reflecting real-time flame tiers.
  - `StreakCelebrationModal.tsx` triggering on `streakIncreased = true`.

---

## 3. Exit Criteria for Implementation

- 100% test coverage on `StreakService` (today, yesterday, missed day, midnight transitions, invalid timezone fallbacks).
- E2E / Integration tests passing for review submissions updating streak.
- Anti-AI-slop design system adherence with pure white canvas, hairline borders, Obsidian pills, and purple flame physics.
