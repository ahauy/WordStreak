# Implementation Tasks: Fill-in-the-blank Quiz Mode (US-QUIZ-02)

**Slug**: `quiz-fill-in-the-blank`  
**Status**: APPROVED

---

## Phase 1: Shared Types & DTOs

- [ ] `T-01`: Add `FillBlankQuestionDto` and `GetFillBlankQuestionsQueryDto` to `packages/shared-types/src/practice.ts`.
- [ ] `T-02`: Build shared types (`pnpm --filter @wordstreak/shared-types build`).

## Phase 2: Backend Generation Engine & API (TDD)

- [ ] `T-03`: Create `apps/api/src/modules/practice/dto/get-fill-blank-questions.dto.ts` with validation.
- [ ] `T-04`: Create unit tests `apps/api/src/modules/practice/fill-blank-generator.service.spec.ts` for masking regex, inflections, fallback templates, and anagram shuffling.
- [ ] `T-05`: Implement `apps/api/src/modules/practice/fill-blank-generator.service.ts`.
- [ ] `T-06`: Add `GET /api/v1/practice/fill-in-the-blank` endpoint to `apps/api/src/modules/practice/practice.controller.ts`.
- [ ] `T-07`: Add controller unit tests in `apps/api/src/modules/practice/practice.controller.spec.ts` and verify backend tests pass.

## Phase 3: Frontend Practice Client & State Hook

- [ ] `T-08`: Add `getFillBlankQuestions` in `apps/web/src/features/practice/services/practiceService.ts`.
- [ ] `T-09`: Create `apps/web/src/features/practice/hooks/useFillBlankQuiz.ts` to manage question progression, hints, input state, anagram chips, timer, and score calculation.

## Phase 4: Frontend UI Components & Page Integration

- [ ] `T-10`: Create `apps/web/src/features/practice/components/AnagramTilePicker.tsx` for interactive letter chip selection.
- [ ] `T-11`: Create `apps/web/src/features/practice/components/FillBlankInput.tsx` for text entry, length guides, and visual feedback.
- [ ] `T-12`: Create `apps/web/src/features/practice/pages/FillInTheBlankQuizPage.tsx`.
- [ ] `T-13`: Update `apps/web/src/features/practice/components/QuizSetupModal.tsx` to support mode switching between Multiple Choice and Fill-in-the-blank.
- [ ] `T-14`: Register route `/decks/:deckId/practice/fill-blank` in `apps/web/src/App.tsx`.

## Phase 5: Quality Review, Tech Docs & Delivery

- [ ] `T-15`: UI visual review against `apps/web/DESIGN.md` and `MEMORY.md` (no generic AI slop, pure white canvas, Obsidian black pills, Nunito/Inter fonts).
- [ ] `T-16`: Create feature tech documentation `docs/features/quiz-fill-in-the-blank/README.md` and update index.
- [ ] `T-17`: Create user guide with screenshots in `docs/user-guides/quiz-fill-in-the-blank.md`.
- [ ] `T-18`: Update roadmap item `US-QUIZ-02` in `docs/PRODUCT_BACKLOG_ROADMAP.md` to `[x]`.
