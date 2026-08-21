# Handover Brief: Gamification XP & Learner Levels System (US-GAME-03)

- **Feature**: Experience Points (XP) & Learner Levels System
- **Feature Slug**: `gamification-xp-levels`
- **Target Branch**: `feat/gamification-xp-levels`
- **Date**: 2026-08-21
- **Baseline Version**: `1.0-draft` (Pending User Confirmation Gate 1)
- **Specification Documents**:
  - [spec/PRD.md](./spec/PRD.md)
  - [spec/SRS.md](./spec/SRS.md) (`REQ-XP-001` to `REQ-XP-012`)
  - [spec/user-stories.md](./spec/user-stories.md) (`US-XP-001` to `US-XP-006`)
- **Traceability & Validation**:
  - [traceability-matrix.md](./traceability-matrix.md)
  - [validation-report.md](./validation-report.md)

---

## 1. What's Being Built

The Gamification XP & Learner Levels System implements a server-authoritative gamification engine that awards Experience Points (XP) for flashcard reviews (+10/+5/0 XP), daily goal completions (+50 XP), streak milestones (+100/+500 XP), and practice quizzes (+30 XP). It manages a 5-tier mastery hierarchy (**Bronze -> Silver -> Gold -> Diamond -> Master**) across 50+ levels, backed by an immutable transaction ledger (`user_activity_logs`). Frontend enhancements include a real-time topbar level badge & progress widget, floating `+XP` review animations, and a celebratory `LevelUpCelebrationModal` with confetti.

---

## 2. What's Explicitly Out of Scope (Won't-Have)

- **Real-Money / Crypto / NFT Rewards**: Strictly educational gamification; zero cash or token redemptions.
- **Paid XP Boosters / Micro-Transactions**: No pay-to-win skips or purchasable XP multipliers.
- **Multiplayer Live PvP XP Wagering**: Out of scope for single-player flashcard SRS.
- **Negative XP / Level Demotions**: XP and Levels are permanent cumulative lifetime achievements; failures never deduct XP.

---

## 3. Known Accepted Risks & Architectural Notes

- **XP Velocity Limit**: Enforced at 500 XP/hour and 2,000 XP/24h to mitigate automated bot/script farming without penalizing normal high-volume learners.
- **Timezone Integrity**: Evaluated server-side using the verified user IANA timezone or UTC fallback to prevent device clock tampering.
- **Review Latency SLA**: All XP mutations and ledger inserts execute in a single indexed PostgreSQL `$transaction` ensuring sub-50ms P95 overhead on card reviews.
- **Historical Backfill**: Migration script provides initial XP and Level calculations for existing accounts based on historical `ReviewLog` entries.

---

## 4. Next Step

Upon User Confirmation of Gate 1 (`baseline.md`), advance to **Phase 2 (Implementation Planning / `speckit-specify`)** to generate `spec.md`, `plan.md`, `data-model.md`, `contracts/`, and `tasks.md`.
