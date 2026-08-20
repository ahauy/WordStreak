# Feature Specification: Multiple Choice Quiz Mode (US-QUIZ-01)

**Feature**: Multiple Choice Quiz Mode  
**Slug**: `quiz-multiple-choice`  
**Status**: APPROVED  
**Target Sprint**: Sprint 3 (EPIC-04: Multi-format Practice & Quiz Modes)

---

## 1. Executive Summary & Value Proposition

WordStreak learners need quick, active-recall drills to test vocabulary recognition without disturbing their Spaced Repetition System (SM-2) long-term retention schedules. The Multiple Choice Quiz feature provides a fast, gamified practice experience featuring:

- Bidirectional 50/50 question formats (English $\rightarrow$ Vietnamese & Vietnamese $\rightarrow$ English).
- Intelligent distractor generation pooling 3 unique incorrect choices from the same deck (or user decks).
- An interactive, anti-slop React player with 15s countdown timer, keyboard shortcuts (`1-4`, `A-D`, `Space`), and instant visual feedback (Green/Red).
- Streak/Combo multipliers (+10 base XP, +5 speed bonus, 1.2x/1.5x combos) and a comprehensive results screen.

---

## 2. User Stories & Acceptance Criteria

### User Story 1 (P1): Start & Configure Quiz (`US-QUIZ-001`)

- **As a** Learner
- **I want to** select a question preset (10 questions, 20 questions, or All cards) and Timer mode (Standard 15s or Zen Mode) from any deck
- **So that** I can practice at my desired pace.
- **Acceptance Criteria**:
  - `Scenario 1`: User opens Quiz setup drawer from `/decks/:id`, chooses "10 questions" + "Standard 15s", clicks "Start Quiz" $\rightarrow$ navigated to `/decks/:id/quiz` and first question is fetched instantly.
  - `Scenario 2`: If user's account has $< 4$ total cards, launching a quiz displays an alert modal and prevents generation.

### User Story 2 (P1): Interactive Quiz Play with Timer & Hotkeys (`US-QUIZ-002`)

- **As a** Learner
- **I want to** answer 4-choice questions using keyboard hotkeys (`1-4`, `A-D`) with a visual timer
- **So that** I build reflexive vocabulary recognition.
- **Acceptance Criteria**:
  - `Scenario 1`: Pressing `1-4` selects the option instantly, illuminates the choice in Green (correct) or Red (incorrect + reveals green correct answer), increments/resets combo, and auto-advances after 1.0s.
  - `Scenario 2`: Pressing `Space` during the 1.0s feedback window skips the delay and advances immediately.
  - `Scenario 3`: If the 15s timer expires in Standard mode, question is evaluated as incorrect, displays correct answer, and auto-advances.

### User Story 3 (P1): Results Summary & XP Rewards (`US-QUIZ-003`)

- **As a** Learner
- **I want to** see my accuracy score, total XP gained, highest combo, and list of missed cards
- **So that** I feel rewarded and know which words to review.
- **Acceptance Criteria**:
  - `Scenario 1`: Completing the last question renders the Results screen with accuracy percentage, XP breakdown, combo highlight, and list of incorrect words with their meanings.
  - `Scenario 2`: Clicking "Retake Quiz" immediately starts a fresh session on the same deck.

---

## 3. Success Metrics

- Average quiz session completion rate $\ge 85\%$.
- Question generation API P95 latency $< 100$ms.
- 0% mutation of SM-2 spaced repetition state during practice quiz sessions.
