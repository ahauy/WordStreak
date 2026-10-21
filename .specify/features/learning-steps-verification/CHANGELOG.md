# Changelog: Learning Steps & Verification (US-LIB-15)

## [1.0.0] - 2026-10-21

### Added
- Feature specification for US-LIB-15 (`spec.md`).
- Support for `LEARNING_STEP` status in `CardLearningStatus` enum in `@wordstreak/shared-types`.
- Intra-session learning steps (1 min & 5 min) in `SrsService` and `ClientSm2Engine` for beginner users.
- 3-second verification quiz timer in `KnownWordTriageModal`.
- Default `dailyGoal: 5` words/day for users with `startingLevel: 'ZERO'`.
