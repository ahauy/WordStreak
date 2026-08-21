# Quickstart & Verification Guide: Chế độ Nối từ vựng (Word Matching Game)

**Feature Slug**: `quiz-word-matching`  
**Epic**: `EPIC-04` (Multi-format Practice & Quiz Modes — US-QUIZ-04)  
**Status**: APPROVED

---

## 1. Prerequisites & Environment Setup

Ensure the PostgreSQL database, NestJS API, and React Web Vite client are running:

```bash
# Terminal 1: Database & Backend API
pnpm --filter api start:dev

# Terminal 2: Web Client
pnpm --filter web dev
```

---

## 2. Automated Test Execution

Run the backend and frontend unit test suites:

```bash
# 1. Test Shared Types
pnpm --filter shared-types build

# 2. Test Backend Matching Generator & Scoring Service
pnpm --filter api test apps/api/src/modules/practice/matching-generator.service.spec.ts
pnpm --filter api test apps/api/src/modules/practice/practice.service.spec.ts

# 3. Test Frontend Matching Engine & Audio Synthesizer
pnpm --filter web test apps/web/src/features/practice/hooks/useMatchingGameEngine.spec.ts
pnpm --filter web test apps/web/src/features/practice/hooks/useWebAudioSynthesizer.spec.ts
```

---

## 3. Manual End-to-End Verification Scenarios

### Scenario 1: Minimum Deck Validation Guard

1. Navigate to `/decks` and open a deck with $< 5$ cards.
2. Click **"Practice"** to open `QuizSetupModal`.
3. Verify the **"Nối từ"** tab is disabled with a warning badge `"Cần tối thiểu 5 thẻ"`.

### Scenario 2: Standard 2-Column Matching & Combos

1. Open a deck containing $\ge 10$ cards.
2. Launch Word Matching with preset **10 Cards (2 rounds)** and **Timed 45s**.
3. Verify Column A displays 5 English words and Column B displays 5 Vietnamese definitions (independently randomized).
4. Tap an English tile $\to$ verify Purple Flame highlight (`ring-2 ring-violet-500`).
5. Tap another English tile $\to$ verify seamless in-column switching without error penalty.
6. Tap the same tile $\to$ verify self-deselection.
7. Tap the matching Vietnamese counterpart:
   - Verify pleasant rising chime ($587\text{Hz}\to 880\text{Hz}$).
   - Verify emerald green border and $300\text{ms}$ dissolve animation.
   - Verify combo badge increments to `🔥 1x Combo`.
8. Tap an incorrect pair:
   - Verify low buzz sound ($180\text{Hz}\to 120\text{Hz}$).
   - Verify rose border and $400\text{ms}$ horizontal shake animation.
   - Verify combo resets to 0 and tiles revert to neutral.

### Scenario 3: Results Summary & Anti-Abuse

1. Complete all 5 pairs in Round 1 and Round 2.
2. Verify transition to `QuizResultsView`:
   - Total time elapsed is shown.
   - Accuracy percentage and highest combo streak are displayed.
   - XP breakdown displays base XP, combo bonus, and speed bonus ($+10\text{ XP}$ if $\le 15.0\text{s}$ clean round).
   - "Thẻ cần ôn lại (Missed Cards)" lists all words that experienced mismatches.
3. Verify that `UserCardProgress` SRS scheduling values (`interval`, `easeFactor`) remain completely unchanged.
