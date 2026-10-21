# Changelog: TOEIC Practice Quizzes (Mini Part 5 & Word Family Quiz)

All notable changes to the `toeic-part5-quiz` feature (`US-LIB-07`) will be documented here.

## [v1.0.0] - 2026-10-21 - Implemented & Verified
- **Shared Types**: Added `ToeicQuizType`, `ToeicQuizQuestionDto`, `GetToeicQuizQueryDto`, `SubmitToeicQuizDto`, and `ToeicQuizResultDto` in `packages/shared-types`.
- **Backend Generator**: Implemented `ToeicQuizGeneratorService` in `apps/api` supporting 4 specialized question modes (`MINI_PART_5`, `WORD_FAMILY`, `PARAPHRASE`, `LISTENING_TYPING`) with smart distractor generation from `confusables` and peer cards.
- **SRS Auto-Grading**: Implemented `PracticeService.submitToeicQuiz` with objective response-time mapping to SM-2 ratings (`Again: 1`, `Hard: 2`, `Good: 3`, `Easy: 4`) with automatic updates to `UserOfficialCardProgress` and XP awarding.
- **API Endpoints**: Exposed `GET /api/v1/practice/toeic` and `POST /api/v1/practice/toeic/submit` with timezone and authentication guards.
- **Frontend UI**: Built `MiniPart5QuizCard.tsx` compliant with Obsidian Pill Design System tokens (`#ffffff` canvas, 1px border `#e5e5e5`, Nunito typography).
- **Automated Verification**: Added 100% passing unit tests in `toeic-quiz-generator.service.spec.ts`, `practice.service.spec.ts`, `practice.controller.spec.ts`, and `MiniPart5QuizCard.spec.tsx`.
