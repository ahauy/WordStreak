# Gap Analysis: Listening & Typing Practice Quiz (US-QUIZ-03)

- **Feature**: Listening & Typing Practice Mode (`quiz-listening-practice`)
- **Epic**: EPIC-04 Multi-format Practice & Quiz Modes (Sprint 5)
- **Date**: 2026-08-21
- **Status**: COMPLETE

---

## 1. Current State (AS-IS)

- **Practice Modes**: Currently supports Multiple Choice Quiz (`GET /api/v1/practice/multiple-choice`) and Fill-in-the-blank Quiz (`GET /api/v1/practice/fill-in-the-blank`).
- **Audio Availability**: Cards store `audioUrl` (optional string), `phonetic`, and `word`. In existing quiz modes, audio is only an optional secondary hint button. If `audioUrl` is null or fails to stream, no system-level speech synthesis fallback exists.
- **Card Data**: Existing `cards` table in PostgreSQL contains `id`, `deckId`, `word`, `meaning`, `phonetic`, `audioUrl`, `exampleSentence`, and `mnemonic`.
- **Frontend Practice**: Has `QuizSetupModal.tsx`, `QuizProgressBar.tsx`, and `QuizResultsView.tsx` wired to `POST /api/v1/practice/submit-quiz`.
- **Limitation**: Learners have no dedicated listening comprehension practice mode to train spelling accuracy directly from native audio pronunciation at normal and slowed speeds.

---

## 2. Target State (TO-BE)

- **Backend API**:
  - Dedicated endpoint `GET /api/v1/practice/listening?deckId=...&limit=...` generating randomized listening question payloads (`ListeningQuestionDto`) containing `cardId`, `word`, `phonetic`, `meaning`, `audioUrl`, `wordLength`, and `firstLetterHint`.
  - Reusable validation and seamless submission integration via existing `POST /api/v1/practice/submit-quiz`.
- **Frontend UI & Audio Engine**:
  - `ListeningQuizPage.tsx` under `/practice/listening` or `/decks/:deckId/practice/listening`.
  - **Audio Controller Engine**:
    - Auto-plays card audio on question load (with user-gesture fallback trigger).
    - Speed selector toggling between `1.0x` (Normal) and `0.75x` (Slow/Clear articulation) with keyboard shortcut `Shift+Space` / `S`.
    - **Web Speech API Fallback Cascade**: If `audioUrl` is missing or fails to load within 3000ms, seamlessly speaks the word using browser `window.speechSynthesis` with `en-US` / `en-GB` voice.
  - **Direct Typing Input & Visual Diff**:
    - Text input with auto-focus and length placeholder indicators (`_ _ _ _ _`).
    - Immediate evaluation upon pressing `Enter` with emerald glow on correct or red shake on incorrect with character diff highlighting.
  - **Progressive Hint Toolbar**:
    - 3-tier progressive hint: Level 1 (Length + 1st Letter), Level 2 (Vietnamese Meaning), Level 3 (Phonetic IPA).
  - **Setup Modal & Results Recap Integration**:
    - Practice setup modal includes "Listening & Typing" mode option with headphone/waveform icon.
    - `QuizResultsView` displays score, XP earned, combo streaks, and missed words with replay audio triggers.

---

## 3. Gap Categories

### Functional Gaps

1. **Listening Question Generator**: Backend endpoint to select cards and format listening DTO payloads.
2. **Audio Failover & Speed Controller**: Client-side audio manager supporting speed changes (`0.75x` / `1.0x`), replay hotkeys (`Space` / `R`), and automatic zero-interruption Web Speech API TTS failover.
3. **Progressive Hint Engine**: Stepwise hint state management degrading speed bonus.
4. **Spelling Diff Visualizer**: Character-level comparison between learner input and target word upon incorrect submission.

### Data & Contract Gaps

1. **Shared DTO**: Add `ListeningQuestionDto` and `GetListeningQuestionsQueryDto` to `@wordstreak/shared-types` or practice contracts.
2. **Database Schema**: Zero schema migrations required. 100% compatible with existing `cards` and `practice_sessions` tables.

### User Impact

1. **Practice Selector**: Users will see a new "Listening Practice" mode tile in the Practice Setup modal.
2. **No Workflow Disruption**: Existing Multiple Choice, Fill-in-the-blank, and SM-2 Review flows remain completely intact.

### Transition Requirements

1. **Deployment**: Purely additive feature release.
2. **Feature Flagging**: Standard route activation under `/practice/listening`.
3. **Rollback Plan**: Zero database changes means instantaneous frontend rollback if necessary.
