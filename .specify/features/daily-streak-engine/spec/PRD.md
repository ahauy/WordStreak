# Product Requirements Document (PRD): Daily Streak Engine

- **Document ID**: `PRD-STREAK-001`
- **Feature Slug**: `daily-streak-engine`
- **Date**: 2026-08-20
- **Version**: 1.0

---

## 1. Product Overview

The Daily Streak Engine tracks consecutive learning days per user, incorporating local timezone day boundaries, automatic streak calculation upon completing study sessions, and engaging electric violet flame mascot progression tiers.

---

## 2. Personas & Key User Journeys

1. **Daily Power Learner (Alex)**: Completes 20-30 flashcards daily. Upon finishing, the streak count immediately advances with a celebratory animation.
2. **Late-Night Learner (Minh)**: Studies at 11:45 PM and again at 12:15 AM across midnight. Each session counts for its respective local day, incrementing the streak smoothly.
3. **Cross-Timezone Traveler (Linh)**: Changes locations/timezones. Client sends updated timezone; the engine calculates day differences safely without false resets.

---

## 3. Key Feature Capabilities

- **Automatic Streak Sync on Study**: Every SM-2 review submit and practice quiz completion checks and updates streak idempotently.
- **REST Endpoints**:
  - `GET /api/v1/streaks/me`: Returns current streak, best streak, last active timestamp, today's status, and flame tier.
  - `POST /api/v1/streaks/record-activity`: Records activity with timezone string.
- **Electric Violet Flame Mascot Progression**:
  - 1–6 Days: Baby Flame
  - 7–13 Days: Ember Flame
  - 14–29 Days: Radiant Inferno
  - 30+ Days: Cosmic Violet Nova
- **Celebration Modal**: Confetti and flame burst animation when a new day's streak is completed.
