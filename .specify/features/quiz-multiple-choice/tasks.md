# Implementation Tasks: Multiple Choice Quiz (US-QUIZ-01)

**Feature**: Multiple Choice Quiz Mode  
**Slug**: `quiz-multiple-choice`  
**Total Tasks**: 23 (23 Completed)

---

## Phase 1: Setup & Shared Types

- [x] T001 [P] Define multiple choice quiz types and DTO interfaces in `packages/shared-types/src/practice.ts`
- [x] T002 Export practice types in `packages/shared-types/src/index.ts` and build shared-types package

---

## Phase 2: Foundational & Backend API Implementation (TDD)

- [x] T003 [P] Write unit tests for `QuizGeneratorService` in `apps/api/src/modules/practice/quiz-generator.service.spec.ts`
- [x] T004 Implement `QuizGeneratorService` (Fisher-Yates shuffle, 50/50 format generator, distractor pooling) in `apps/api/src/modules/practice/quiz-generator.service.ts`
- [x] T005 [P] Write unit tests for `PracticeService` (scoring, speed bonus, combo, anti-abuse) in `apps/api/src/modules/practice/practice.service.spec.ts`
- [x] T006 Implement `PracticeService` in `apps/api/src/modules/practice/practice.service.ts`
- [x] T007 [P] Create DTOs (`get-quiz-questions.dto.ts`, `submit-quiz.dto.ts`) with class-validator in `apps/api/src/modules/practice/dto/`
- [x] T008 Implement `PracticeController` and `PracticeModule` in `apps/api/src/modules/practice/`
- [x] T009 Register `PracticeModule` in `apps/api/src/app.module.ts` and verify backend test suite passes

---

## Phase 3: Frontend Core Engine & Components (TDD)

- [x] T010 [P] [US1] Create practice API client in `apps/web/src/features/practice/services/practiceService.ts`
- [x] T011 [P] [US2] Write unit tests for `useQuizEngine` hook in `apps/web/src/features/practice/hooks/useQuizEngine.spec.ts`
- [x] T012 [US2] Implement `useQuizEngine` custom hook (timer, keyboard hotkeys 1-4/A-D/Space, combos, auto-advance) in `apps/web/src/features/practice/hooks/useQuizEngine.ts`
- [x] T013 [P] [US2] Implement `QuizProgressBar` with countdown timer bar and combo badge in `apps/web/src/features/practice/components/QuizProgressBar.tsx`
- [x] T014 [P] [US2] Implement `QuizQuestionCard` (word prompt, IPA, audio, blank sentence) in `apps/web/src/features/practice/components/QuizQuestionCard.tsx`
- [x] T015 [P] [US2] Implement `QuizOptionButton` with hotkey indicator and green/red feedback in `apps/web/src/features/practice/components/QuizOptionButton.tsx`
- [x] T016 [P] [US3] Implement `QuizResultsView` (accuracy score, XP breakdown, missed words list) in `apps/web/src/features/practice/components/QuizResultsView.tsx`
- [x] T017 [P] [US1] Implement `QuizSetupModal` (preset picker 10/20/All, Zen Mode toggle) in `apps/web/src/features/practice/components/QuizSetupModal.tsx`

---

## Phase 4: Frontend Page Integration & Routing

- [x] T018 [US1] Implement `MultipleChoiceQuizPage` in `apps/web/src/features/practice/pages/MultipleChoiceQuizPage.tsx`
- [x] T019 [US1] Register `/decks/:id/quiz` and `/practice/quiz` routes in `apps/web/src/App.tsx`
- [x] T020 [US1] Add "Practice Quiz" CTA button to `DeckDetailPage` in `apps/web/src/features/decks/pages/DeckDetailPage.tsx`

---

## Phase 5: Quality Verification, Review & Documentation

- [x] T021 Run all backend and frontend test suites (`pnpm --filter api test`, `pnpm --filter web test`)
- [x] T022 Create technical feature documentation in `docs/features/quiz-multiple-choice/README.md` and update `docs/features/README.md`
- [x] T023 Update `docs/PRODUCT_BACKLOG_ROADMAP.md` marking US-QUIZ-01 as completed
