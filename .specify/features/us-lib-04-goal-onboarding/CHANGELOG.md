# Changelog: US-LIB-04 & US-LIB-11 Goal-Oriented Onboarding & Adaptive Entry

## [v1.0 Done] - 2026-10-19

### Added
- Created Living Specification [spec.md](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/.specify/features/us-lib-04-goal-onboarding/spec.md).
- Added `LearningGoal`, `StartingLevel`, `OnboardingDto`, and `OnboardingResponse` to `@wordstreak/shared-types`.
- Added `learningGoal`, `startingLevel`, and `onboardingCompleted` fields to `User` model in `schema.prisma`.
- Created `OnboardingDto` in `apps/api/src/modules/users/dto/onboarding.dto.ts` with class-validator.
- Implemented `completeOnboarding` in `UsersService` with recommendation logic and auto-enrollment into `OfficialDeck`.
- Exposed `PATCH /api/v1/users/onboarding` in `UsersController`.
- Added unit test suites covering `completeOnboarding` (success flow, starting level logic, not found handling) and payload validation (all 42 test suites / 373 tests passed).
- Added `userService.completeOnboarding` in `apps/web/src/features/user-profile/services/userService.ts`.
- Created `OnboardingWizard` 3-step modal component in `apps/web/src/features/onboarding/components/OnboardingWizard.tsx` strictly following WordStreak minimal canvas, hairline borders, Obsidian black pills, and zero AI slop.
- Mounted `OnboardingWizard` conditionally on `DashboardPage.tsx` when user onboarding is incomplete.
- Added comprehensive unit tests for `OnboardingWizard` in `apps/web/src/features/onboarding/components/__tests__/OnboardingWizard.test.tsx` (all 76 test files / 437 tests passed).
- Verified full frontend build with `vite build` (passed 100%).
