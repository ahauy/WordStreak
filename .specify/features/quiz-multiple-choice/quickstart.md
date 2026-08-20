# Quickstart: Multiple Choice Quiz Validation Guide

## 1. Prerequisites

- Docker PostgreSQL running (`pnpm db:up` or local postgres)
- Backend running on `http://localhost:3000` (`pnpm --filter api start:dev`)
- Frontend running on `http://localhost:5173` (`pnpm --filter web dev`)

## 2. Validation Scenarios

### Scenario 1: Generate Quiz for a Deck with $\ge 4$ Cards

1. Log in to WordStreak.
2. Navigate to `/decks` and select a deck with at least 4 cards (e.g. "IELTS Advanced Vocabulary").
3. Click "Practice Quiz" on the header toolbar.
4. Verify the setup modal appears with presets: 10 questions, 20 questions, All cards, and Zen Mode toggle.
5. Click "Start Quiz" $\rightarrow$ confirm instant transition to `/decks/:id/quiz`.
6. Verify question prompt renders with 4 distinct options (1 correct, 3 distractors).

### Scenario 2: Keyboard Hotkeys & Timer Play

1. Press keyboard key `1`, `2`, `3`, or `4` (or `A`, `B`, `C`, `D`) to select an option.
2. Verify option button immediately glows Green (if correct) or Red (if incorrect with green indication of the correct choice).
3. Verify Combo badge increments on correct answers.
4. Press `Space` to skip the 1.0s auto-advance delay and move to next question.

### Scenario 3: Results Summary & XP

1. Complete all 10 questions.
2. Verify the Results Screen displays:
   - Final Accuracy Percentage (e.g. 90%)
   - Total XP Earned (with breakdown of base XP + speed bonus + combo bonus)
   - Max Combo Streak
   - List of missed words with English term and Vietnamese meaning
3. Click "Retake Quiz" and verify a new randomized session begins.
