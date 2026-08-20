# Technical Plan: Multiple Choice Quiz (US-QUIZ-01)

**Feature Slug**: `quiz-multiple-choice`  
**Status**: APPROVED  
**Architecture Pattern**: Monorepo NestJS REST API + React Vite SPA

---

## 1. Technical Context & Components

### 1.1. Shared Types (`packages/shared-types`)

- Create `packages/shared-types/src/practice.ts` exporting:
  - `QuizQuestionFormat`, `QuizOptionDto`, `QuizQuestionDto`, `GetQuizQuestionsQueryDto`
  - `QuizAnswerSubmissionDto`, `SubmitQuizDto`, `MissedCardDto`, `QuizResultResponseDto`
- Export `practice.ts` from `packages/shared-types/src/index.ts`.

### 1.2. Backend API (`apps/api`)

- Module: `apps/api/src/modules/practice/`
  - `practice.module.ts`: Imports `PrismaModule`, registers `PracticeController`, `PracticeService`, and `QuizGeneratorService`.
  - `practice.controller.ts`:
    - `GET /api/v1/practice/multiple-choice`: Protected with `JwtAuthGuard`, queries questions for deck with limit.
    - `POST /api/v1/practice/submit-quiz`: Protected with `JwtAuthGuard`, validates answers, computes score/combo/XP, logs session.
  - `practice.service.ts`: Handles session validation, XP award, anti-abuse checks, and score aggregation.
  - `quiz-generator.service.ts`: Independent algorithmic service for Fisher-Yates shuffling, 50/50 format generation, and tiered distractor pooling.
  - DTOs in `apps/api/src/modules/practice/dto/`: `get-quiz-questions.dto.ts`, `submit-quiz.dto.ts`.

### 1.3. Frontend Client (`apps/web`)

- Feature Module: `apps/web/src/features/practice/`
  - `services/practiceApi.ts`: Axios API client functions (`getMultipleChoiceQuiz`, `submitQuizSession`).
  - `hooks/useQuizEngine.ts`: Custom hook managing quiz state, 15s timer ticks, keyboard hotkeys (`1-4`, `A-D`, `Space`), combo calculations, and feedback delays.
  - `components/QuizSetupModal.tsx`: Drawer/modal allowing user to select question limit (10, 20, All) and toggle Zen Mode.
  - `components/QuizProgressBar.tsx`: Top bar showing question index, remaining time bar, and current combo badge.
  - `components/QuizQuestionCard.tsx`: Central question prompt with audio button / example context.
  - `components/QuizOptionButton.tsx`: Option button with hotkey badge (`1`/`A`), selection state, and green/red feedback animations.
  - `components/QuizResultsView.tsx`: Celebratory summary with accuracy percentage, XP earned, combo record, missed words list, and "Retake Quiz" CTA.
  - `pages/MultipleChoiceQuizPage.tsx`: Fullscreen practice page integrating the above components.
- Router integration (`apps/web/src/App.tsx`):
  - Route `/decks/:id/quiz` and `/practice/quiz`.
- Entry point integration:
  - Add "Practice Quiz" button with lightning icon on `DeckDetailPage` (`apps/web/src/features/decks/pages/DeckDetailPage.tsx`).

---

## 2. Testing Strategy (TDD)

- **Backend Unit Tests**:
  - `quiz-generator.service.spec.ts`: Test 50/50 format distribution, distractor uniqueness, fallback to other decks, and $< 4$ card error handling.
  - `practice.service.spec.ts`: Test scoring, speed bonus calculation, combo multipliers, and anti-abuse safeguards.
  - `practice.controller.spec.ts`: Controller route and validation tests.
- **Frontend Component / Hook Tests**:
  - `useQuizEngine.spec.ts`: Test question advancement, keyboard triggers, combo increment, and timer timeout.
  - `MultipleChoiceQuizPage.spec.tsx`: Test rendering, option selection, and results display.
