# Feature Specification: Fill-in-the-blank Quiz Mode (US-QUIZ-02)

**Feature**: Fill-in-the-blank Quiz Mode  
**Slug**: `quiz-fill-in-the-blank`  
**Status**: APPROVED  
**Target Sprint**: Sprint 3 (EPIC-04: Multi-format Practice & Quiz Modes)

---

## 1. Executive Summary & Value Proposition

WordStreak learners need active-recall drills to practice sentence formation, contextual vocabulary production, and accurate spelling without disturbing their Spaced Repetition (SM-2) review intervals. The Fill-in-the-blank Quiz feature provides an interactive, gamified sentence completion experience featuring:

- **Morphological Sentence Masking**: Intelligent regex identifying target words and their inflections (`-s`, `-ed`, `-ing`, `-es`, `-d`) inside `exampleSentence` and masking them with `[ _____ ]`.
- **Graceful Contextual Fallback**: For cards lacking an `exampleSentence`, automatically produces a prompt template based on the Vietnamese meaning and character count (`_ _ _ _`).
- **Dual Input Modes**: Direct keyboard text input with real-time feedback & progressive hint, plus toggleable interactive Scrambled Letter Tiles (Anagrams) for effortless mobile/casual practice.
- **Progressive Hint Engine**: 1-click hint reveals the first letter and enables IPA phonetic audio.
- **Streak & Combo Multipliers**: +10 XP base, +15 XP speed bonus ($\le 8$s without hints), combo multipliers (x2, x3), and integration with daily goal tracking.

---

## 2. User Stories & Acceptance Criteria

### User Story 1 (P1): Start & Configure Fill-in-the-blank Quiz (`US-QUIZ-020`)

- **As a** Learner
- **I want to** choose "Fill-in-the-blank" mode from the Practice Setup Drawer on any deck
- **So that** I can configure my question limit (10, 20, or All cards) and Timer mode (25s or Zen Mode).
- **Acceptance Criteria**:
  - `Scenario 1`: User opens Practice Setup modal from `/decks/:id`, selects "Điền từ vào câu (Fill-in-the-blank)", selects preset "10 questions", and clicks "Start Practice" $\rightarrow$ navigated to `/decks/:id/practice/fill-blank` and questions load instantly.
  - `Scenario 2`: If the selected deck has 0 cards, starting practice is disabled with an informative message.

### User Story 2 (P1): Interactive Sentence Completion with Typing & Anagram Tiles (`US-QUIZ-021`)

- **As a** Learner
- **I want to** complete masked sentences by typing or tapping scrambled letter tiles with real-time feedback
- **So that** I test my spelling and active recall in context.
- **Acceptance Criteria**:
  - `Scenario 1`: Typing the correct word and pressing `Enter` shows a green border and checkmark, increments the combo counter, and auto-advances after 1.2s (or instantly via `Space`/`Enter`).
  - `Scenario 2`: Tapping anagram letter tiles places them in order into the blank; clicking a placed tile or pressing `Backspace` removes it.
  - `Scenario 3`: Clicking "Hint" (or pressing `Ctrl+H`) reveals the first letter (`s _ _ _ _`) and phonetic IPA audio, while disabling the speed bonus.
  - `Scenario 4`: Submitting an incorrect answer shakes the input with red feedback and highlights the correct spelling in emerald green.

### User Story 3 (P1): Results Summary & XP Rewards (`US-QUIZ-022`)

- **As a** Learner
- **I want to** review my accuracy score, total XP gained, maximum combo streak, and missed cards
- **So that** I see my learning progress and can review missed words.
- **Acceptance Criteria**:
  - `Scenario 1`: Finishing the quiz renders the Results screen with accuracy percentage, XP breakdown, combo highlight, and missed cards list.
  - `Scenario 2`: Practice session submits to `POST /api/v1/practice/submit-quiz` and updates user XP.

---

## 3. Success Metrics

- Average fill-in-the-blank quiz completion rate $\ge 80\%$.
- Question generation API P95 latency $< 100$ms.
- 0% mutation of SM-2 spaced repetition state during practice sessions.
