# Implementation Plan: Fill-in-the-blank Quiz Mode (US-QUIZ-02)

**Slug**: `quiz-fill-in-the-blank`  
**Status**: APPROVED

---

## 1. Technical Architecture & Component Slices

### Slice 1: Shared Types & DTOs (`packages/shared-types`)

- Export `FillBlankQuestionDto` and `GetFillBlankQuestionsQueryDto`.
- Update `packages/shared-types/src/practice.ts` and rebuild packages.

### Slice 2: Backend Generation Engine & API (`apps/api`)

- Create `fill-blank-generator.service.ts` with morphological regex masking, Fisher-Yates anagram shuffler, and fallback contextual prompts.
- Create unit tests `fill-blank-generator.service.spec.ts` covering 100% logic branches (root words, inflections, empty sentence fallbacks, scramble randomization).
- Add endpoint `GET /api/v1/practice/fill-in-the-blank` in `practice.controller.ts` with `JwtAuthGuard` and validation DTO `GetFillBlankQuestionsDto`.
- Unit test controller and service integration in `practice.controller.spec.ts`.

### Slice 3: Frontend Practice Client & State (`apps/web`)

- Add API client method `getFillBlankQuiz(deckId, limit)` to `practiceService.ts`.
- Create custom hook `useFillBlankQuiz` to manage question lifecycle, input states, timer, hint levels, combo tracking, and results submission.

### Slice 4: Frontend UI Components & Page (`apps/web`)

- Create `FillBlankInput.tsx`: Auto-focused input, length guides, visual glowing borders (green on correct, red shake on error), and hint reveal.
- Create `AnagramTilePicker.tsx`: Touch-friendly clickable letter chips with animated transitions and backspace/clear support.
- Create `FillInTheBlankQuizPage.tsx`: Fullscreen practice experience with progress bar, audio play button, live combo counter, and modal triggers.
- Update `QuizSetupModal.tsx`: Add mode switcher tab ("Trắc nghiệm (4 Choices)" vs "Điền từ (Fill in Blank)").
- Update routing in `App.tsx` for `/decks/:deckId/practice/fill-blank` and `/practice/fill-blank`.

### Slice 5: Quality Review & Tech Docs

- Adversarial UI review against `DESIGN.md` (Anti-AI-slop, pure white canvas, Obsidian black pills, Nunito/Inter typography, zero jitter).
- Update technical documentation in `docs/features/quiz-fill-in-the-blank/README.md`.
- Create end-user guide with screenshot placeholders in `docs/user-guides/quiz-fill-in-the-blank.md`.
