# Intake: Daily Streak Engine & Timezone Logic

- **Date**: 2026-08-20
- **Requested by**: Product Owner / Product Backlog (US-GAME-01)
- **Classification**: Full Feature
- **Classification signals**:
  - New or changed domain entities: 1 entity (`UserStreak` extended / activity tracking)
  - Existing DB schema change required: Yes (additive timezone support & streak activity date recording)
  - Screens/flows touched: 2+ (Dashboard Navbar, Streak Hero Banner, Flame Mascot, Review Session & Practice completion flow)
  - User roles affected: 1 (Learner)
  - Cross-cutting: Yes (Gamification core, Timezone-aware date calculations, Activity idempotency)
  - Reversible without user-facing consequence: Not always (streak loss impacts habit motivation)
- **Protocol selected**: Full BA Pipeline (Stages 1–8: intake -> elicitation -> gap-analysis -> domain-modeling -> risk-contradiction-scanner -> spec-writer -> spec-validator -> handover)
- **Override**: None

## One-line problem statement

Learners lose motivation when learning days are not recognized across timezones or lack a real-time, tamper-resistant daily streak tracking and visual celebration system.
