# Changelog: US-LIB-11 Beginner Adaptive Entry & Mini-test

## [1.0.0] - 2026-10-19
### Added
- Created `AdaptiveMiniTest.tsx` component with 5 NGSL Top 300 foundational questions.
- Implemented Early Stopping heuristic (auto-terminates when 3 consecutive mistakes occur).
- Implemented empathetic, anxiety-reducing result screens recommending Foundation Stage (`ZERO`) or Elementary (`BEGINNER`).
- Enhanced `OnboardingWizard.tsx` Step 2 with explicit level branching:
  - `ZERO` ("Mất gốc hoàn toàn"): bypasses tests completely, defaults daily goal to 5 words/day, enrolls into Foundation Stage.
  - `BEGINNER` ("Biết cơ bản"): offers a 60-second adaptive check with early termination.
  - `INTERMEDIATE` / `ADVANCED`: direct progression.
- Added comprehensive unit tests in `AdaptiveMiniTest.test.tsx` and `OnboardingWizard.test.tsx` (10 passing tests).
