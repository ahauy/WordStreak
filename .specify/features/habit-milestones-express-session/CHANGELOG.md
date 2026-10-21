# Changelog: US-LIB-16 (Habit Milestones, Express Session & Welcome Back)

## [1.0.0] - 2026-10-21 (v1.0 Done)
### Added
- Feature specification for US-LIB-16 (`spec.md`)
- Habit Milestones motivation modals for 50, 100, 300, and 500 mastered words (`HabitMilestoneModal.tsx`, `useHabitMilestones.ts`)
- 5-minute Express Session mode (`mode=express`) for busy days on `StudyTodayButton` and `/review`
- Welcome Back logic and gentle re-engagement batching (5–7 cards) for learners returning after > 7 days (`ReviewsService.getDueCards`)
- Full unit tests for backend and frontend (`reviews.service.spec.ts`, `StudyTodayButton.spec.tsx`, `HabitMilestoneModal.spec.tsx`, `useHabitMilestones.spec.ts`)
