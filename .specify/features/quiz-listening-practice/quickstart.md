# Developer Quickstart & Verification Guide: Listening & Typing Practice Quiz (US-QUIZ-03)

**Feature**: `quiz-listening-practice`  
**Epic**: EPIC-04 Multi-format Practice & Quiz Modes (Sprint 5)  
**Date**: 2026-08-21  
**Status**: Ready for Verification

---

## 1. Prerequisites & Environment Setup

Ensure your local development environment is initialized:

```bash
# 1. Install workspace dependencies
pnpm install

# 2. Build shared types
pnpm --filter @wordstreak/shared-types build

# 3. Ensure local PostgreSQL database is running & migrated
pnpm --filter api prisma migrate dev
```

---

## 2. Running the Development Servers

Start both the backend API and frontend web application:

```bash
# Start backend API (runs at http://localhost:3000)
pnpm --filter api start:dev

# Start frontend Web app (runs at http://localhost:5173)
pnpm --filter web dev
```

---

## 3. Automated Test Execution

Run the complete test suite across packages to verify zero regressions:

```bash
# 1. Run Shared Types Typecheck
pnpm --filter @wordstreak/shared-types typecheck

# 2. Run Backend Unit & Integration Tests
pnpm --filter api test src/modules/practice/listening-generator.service.spec.ts
pnpm --filter api test src/modules/practice/practice.controller.spec.ts

# 3. Run Frontend Unit & Component Tests
pnpm --filter web test src/features/practice/utils/spellingDiff.spec.ts
pnpm --filter web test src/features/practice/hooks/useAudioPlayer.spec.ts
pnpm --filter web test src/features/practice/hooks/useListeningQuiz.spec.ts
pnpm --filter web test src/features/practice/components/ListeningQuizCard.spec.tsx
```

---

## 4. Manual API & UI Verification Scenarios

### Scenario A: Fetch Listening Practice Questions via cURL

```bash
# Replace YOUR_JWT_TOKEN and DECK_ID with test values
curl -X GET "http://localhost:3000/api/v1/practice/listening?deckId=DECK_ID&limit=5" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

**Expected Response**:

```json
{
  "success": true,
  "data": [
    {
      "id": "lq_card123_0",
      "cardId": "card123",
      "word": "efficient",
      "phonetic": "/ɪˈfɪʃ.ənt/",
      "meaning": "hiệu quả, có năng suất cao",
      "audioUrl": "https://cdn.wordstreak.app/audio/efficient.mp3",
      "wordLength": 9,
      "firstLetterHint": "E"
    }
  ]
}
```

---

### Scenario B: Submit Completed Listening Quiz Session

```bash
curl -X POST "http://localhost:3000/api/v1/practice/submit-quiz" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "deckId": "DECK_ID",
    "totalQuestions": 1,
    "answers": [
      {
        "cardId": "card123",
        "submittedWord": "efficient",
        "isCorrect": true,
        "timeSpentMs": 4200,
        "hintsUsed": 0,
        "replayCount": 1,
        "audioSpeedUsed": 1.0
      }
    ]
  }'
```

**Expected Response**:

```json
{
  "success": true,
  "data": {
    "totalQuestions": 1,
    "correctCount": 1,
    "accuracyPercentage": 100,
    "totalXpEarned": 25,
    "maxCombo": 1,
    "missedCards": []
  },
  "message": "Quiz session submitted successfully"
}
```

---

### Scenario C: End-to-End Browser UI Walkthrough

1. **Navigation**:
   - Log in to WordStreak.
   - Navigate to `/decks` and open any deck with at least 5 cards.
   - Click the **"Practice"** dropdown and select **"Listening & Typing"**.
2. **Setup Modal**:
   - In `QuizSetupModal`, verify the "Listening & Typing" tab is active.
   - Select question count (e.g. 10 cards) and toggle Timer or Zen Mode.
   - Click **"Start Listening Practice"**.
3. **Core Gameplay & Audio Controls**:
   - Verify audio plays automatically upon entering the question.
   - Press `Shift+Space` (or click `"0.75x"`); verify speed indicator flips to `"0.75x Slow"`.
   - Press `Space` (or click Replay); verify audio replays at slower articulation.
4. **Progressive Hints**:
   - Press `Ctrl+H` once $\rightarrow$ verify character slots show first letter: `e _ _ _ _ _ _ _ _`.
   - Press `Ctrl+H` again $\rightarrow$ verify Vietnamese meaning appears.
   - Press `Ctrl+H` third time $\rightarrow$ verify phonetic IPA appears (`/ɪˈfɪʃ.ənt/`).
5. **Typing & Normalization**:
   - Type `"  efficient  "` with spaces and press `Enter`.
   - Verify green glow feedback (`#27c93f`), combo multiplier increase, and auto-advance.
6. **Character Diff Feedback**:
   - On next question (e.g. `"accommodation"`), intentionally type `"acomodation"`.
   - Verify red shake animation (`#ff5f56`) and character diff highlighting missing `'c'` and `'m'`.
7. **Session Summary & SM-2 Integrity**:
   - Complete remaining cards.
   - In `QuizResultsView`, verify accuracy %, XP breakdown, combo streak, and missed words list with audio replay.
   - Verify in database that `UserCardProgress` SM-2 parameters (`interval`, `easeFactor`) remain completely unchanged.
