# Elicitation: Fill-in-the-blank Quiz (US-QUIZ-02)

- **Feature**: Fill-in-the-blank Sentence Completion Quiz Mode
- **Date**: 2026-08-20
- **Status**: COMPLETE

---

## Stage 1 — Business Value

- **Problem**: Learners need active-recall sentence completion practice where target vocabulary is applied inside authentic contextual sentences, strengthening grammatical usage, collocations, and spelling production without mutating spaced repetition (SM-2) review intervals.
- **Personas**:
  - **Persona A (Alex - Exam Prep)**: Wants to practice producing target words in academic sentences, remembering exact spelling and tense forms.
  - **Persona B (Minh - Busy Professional)**: Enjoys 2-3 minute quick practice sessions with progressive hints when stuck.
  - **Persona C (Linh - Casual/Mobile Learner)**: Prefers tapping interactive scrambled letter tiles (anagrams) on mobile without having to deal with virtual on-screen keyboards.
- **Success Metrics**:
  - Quiz completion rate $\ge 80\%$
  - Average spelling accuracy $\ge 75\%$
  - Practice retention lift (+25% weekly active practice sessions)

---

## Pillar 1 — Personas, Actors & RBAC

- **Learner Role**: Can start and complete Fill-in-the-blank quizzes on any owned deck or accessible deck.
- **Data Access**: Can view and generate quizzes for decks they have read access to.
- **Guest / Unauthenticated**: Protected route; redirects to login before starting practice.

---

## Pillar 2 — State Machine & Lifecycle

- **States**: `CONFIGURING` $\rightarrow$ `IN_PROGRESS` $\rightarrow$ `ANSWER_SUBMITTED` (Feedback 1.2s delay or instant continue) $\rightarrow$ `COMPLETED` (or `ABANDONED`).
- **Hint Progression States**: `NO_HINT` (0 hints used) $\rightarrow$ `FIRST_LETTER_REVEALED` $\rightarrow$ `ANAGRAM_REVEALED`.

---

## Pillar 3 — Business Rules & Algorithms

- **Q1 (Word Masking & Morphological Matching)**:
  - Base word & inflection matcher: Case-insensitive regex matching root word and regular/common irregular inflections (`-s`, `-es`, `-ed`, `-d`, `-ing`, `-ly`).
  - Sentence masking: Replaces the matched token in `exampleSentence` with `[ _____ ]`.
  - Graceful fallback: If `exampleSentence` is empty or target word is not found in sentence, generate a contextual prompt template using card's Vietnamese meaning and part of speech (e.g., `"Complete the target word: [Meaning]"`) with length indicators `_ _ _ _ _`.
- **Q2 (Dual Input & Progressive Hints)**:
  - **Freeform Typing Mode**: Auto-focused input box with real-time feedback, Enter to submit.
  - **Letter Scramble / Anagram Mode**: Interactive toggle displaying scrambled clickable letter chips for mobile/casual learners.
  - **Hint Button**: Clicking Hint reveals the first letter (e.g. `s _ _ _ _`) and phonetic/IPA tip. Using a hint reduces the speed bonus.
- **Q3 (Answer Validation & XP System)**:
  - Case-insensitive, automatically trimmed whitespace.
  - Validates against both the exact inflected token in sentence and the root `card.word`.
  - Pure Practice Mode: Does not mutate `UserCardProgress` (`interval`, `easeFactor`, `nextReviewDate`).
  - Reward: +10 XP per correct blank, +15 XP speed bonus (if answered in $\le 8$s without hints), Combo multiplier (x2 for 3+ consecutive correct, x3 for 5+).
- **Q4 (Quiz Length Presets & Timer)**:
  - Preset options: 10 questions (Default), 20 questions, or All cards in Deck.
  - Optional 25s timer per sentence with toggleable Zen Mode.
- **Q5 (Keyboard Navigation)**:
  - `Enter` submits typed answer; during feedback window `Enter` / `Space` instantly advances to next question.
  - `Ctrl+H` / `Cmd+H` triggers Hint; `Backspace` removes last selected anagram tile.

---

## Assumptions Confirmed

- `ASM-QUIZ-010`: Target word in example sentence is masked with `[ _____ ]` via case-insensitive morphological regex matching root word and inflections.
- `ASM-QUIZ-011`: If exampleSentence is missing or does not contain the target word, a contextual fallback prompt is generated so cards are not discarded.
- `ASM-QUIZ-012`: The UI provides dual input: freeform text typing and an interactive letter scramble (anagram) tile picker, with a progressive Hint button.
- `ASM-QUIZ-013`: Answer validation is case-insensitive, whitespace-trimmed, and accepts either the inflected token or base word.
- `ASM-QUIZ-014`: Fill-in-the-blank is a standalone Practice Mode awarding XP and combo streaks without altering SuperMemo-2 card review intervals.
- `ASM-QUIZ-015`: Keyboard shortcuts (`Enter` to submit/advance, `Ctrl+H` for hint) are fully supported alongside touch interactions.
