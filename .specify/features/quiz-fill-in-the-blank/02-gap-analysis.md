# Gap Analysis: Fill-in-the-blank Quiz (US-QUIZ-02)

- **Feature**: Fill-in-the-blank Quiz Mode
- **Date**: 2026-08-20
- **Status**: COMPLETE

---

## 1. Current State (AS-IS)

- **Practice Module**: Currently supports Multiple Choice Quiz (`GET /api/v1/practice/multiple-choice`) with 4-choice distractor generation and a shared quiz submission endpoint (`POST /api/v1/practice/submit-quiz`).
- **Card Data**: Cards store `word`, `meaning`, `phonetic`, `audioUrl`, `exampleSentence`, and `mnemonic`.
- **Frontend Practice**: Has `MultipleChoiceQuizPage.tsx`, `QuizSetupModal.tsx`, `QuizProgressBar.tsx`, and `QuizResultsView.tsx`.
- **Practice Types**: Shared types define `QuizQuestionDto` with format `EN_TO_VI` and `VI_TO_EN`.

---

## 2. Target State (TO-BE)

- **Backend API**:
  - New endpoint `GET /api/v1/practice/fill-in-the-blank?deckId=...&limit=...` generating masked sentence questions, target answer, scrambled letter tiles, audio/IPA, and meaning.
  - Reusable morphological masking algorithm in `QuizGeneratorService` or `FillBlankGeneratorService`.
  - Seamless integration with existing `POST /api/v1/practice/submit-quiz` for XP & activity logging.
- **Frontend UI**:
  - `FillInTheBlankQuizPage.tsx` at `/practice/fill-in-the-blank` or `/decks/:deckId/practice/fill-in-the-blank`.
  - Interactive sentence card with masked blank `[ _____ ]`.
  - Direct typing input box with auto-check & hint helper (`_ _ _ _`).
  - Interactive Anagram Letter Tiles selector (toggleable chip buttons).
  - Audio pronunciation playback button.
  - Setup modal supporting mode selection (Multiple Choice vs Fill-in-the-blank).
  - Integration with `QuizResultsView` for recap, XP earned, combo, and missed cards list.

---

## 3. Gap Categories

### Functional Gaps

1. **Sentence Masking Engine**: No algorithm exists yet to detect root words/inflections in `exampleSentence` and extract masked tokens, prefix, and suffix.
2. **Anagram Generator**: No utility exists to generate randomized letter chips from the target word.
3. **Dedicated UI Component**: No input component currently supports typing with length dots and anagram tiles.

### Data & Contract Gaps

1. **Shared Types**: Add `FillBlankQuestionDto` or extend `QuizQuestionDto` with `maskedSentence`, `targetWord`, `scrambledLetters`, `firstLetterHint`, `prefix`, and `suffix`.

### Migration / Transition

- 100% additive; zero breaking schema changes. Backward compatible with existing quiz results and XP submission.
