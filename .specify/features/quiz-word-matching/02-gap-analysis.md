# Gap Analysis: Chế độ Nối từ vựng (Word Matching Game)

- **Feature Slug**: `quiz-word-matching`
- **Epics**: `EPIC-04` (Multi-format Practice & Quiz Modes — US-QUIZ-04)
- **Date**: 2026-08-21

---

## 1. AS-IS (Current State)

### 1.1. Practice Quiz Modes

- Currently, WordStreak supports three practice quiz modes under EPIC-04:
  1. **Multiple Choice Quiz (`US-QUIZ-01`)**: 4-option single question answering.
  2. **Fill-in-the-blank Quiz (`US-QUIZ-02`)**: Sentence context cloze test with anagram letter tiles.
  3. **Listening & Typing Practice Quiz (`US-QUIZ-03`)**: Audio playback with dynamic character slots and LCS spelling diff.
- There is **no matching or multi-item associative pairing mode**. Users cannot test rapid associative recognition across multiple vocabulary words simultaneously.

### 1.2. Practice Setup & Navigation

- In `QuizSetupModal.tsx`, the tab switcher currently offers:
  - `MULTIPLE_CHOICE`
  - `FILL_IN_THE_BLANK`
  - `LISTENING`
- The `MATCHING` mode is absent from the tab bar and cannot be selected.

### 1.3. Backend & API Services

- `PracticeController` exposes:
  - `GET /api/v1/practice/multiple-choice`
  - `GET /api/v1/practice/fill-in-the-blank`
  - `GET /api/v1/practice/listening`
  - `POST /api/v1/practice/submit`
- No matching question generator exists to package cards into randomized 5-pair round structures (`MatchingRoundDto`).

---

## 2. TO-BE (Target State)

### 2.1. Interactive Word Matching Game (`US-QUIZ-04`)

- Users launch Word Matching Game from `QuizSetupModal` or deck practice buttons.
- Game presents 5 pairs per round across two vertical columns:
  - **Column A (Left)**: 5 English vocabulary terms (with optional phonetic IPA and speaker icon).
  - **Column B (Right)**: 5 Vietnamese definitions/meanings.
- Both columns are independently randomized using the Fisher-Yates shuffle algorithm.
- Interactive mechanics:
  - Tapping an English or Vietnamese tile activates the selection with a purple glow ring (`ring-2 ring-violet-500 bg-violet-50/50`).
  - Tapping the matching counterpart validates the pair.
  - **Match**: Chime sound + emerald border + 300ms fade-out/dissolve animation. Combo streak increments (+1).
  - **Mismatch**: Soft buzz sound + rose border + 400ms horizontal shake animation (`animate-shake`). Combo resets to 0. Tiles revert to neutral.
  - Tapping the same column switches selection without penalty; tapping the selected tile deselects it.
  - When all 5 pairs are cleared, the round completes with a celebratory badge, and the next round slides in until the session target (e.g. 5, 10, 15, 20 cards) is reached.

### 2.2. Gamification & Anti-Abuse Integration

- **Base XP**: $+2\text{ XP}$ per matched pair ($10\text{ XP}$ per 5-pair round).
- **Combo Multipliers**: $1.0\times$ (1–2 combo), $1.2\times$ (3–4 combo), $1.5\times$ (5 combo clean round), $2.0\times$ (10+ combo multi-round streak).
- **Speed Bonus**: $+10\text{ XP}$ for completing a 5-pair round in $\le 15$ seconds without errors.
- **Perfect Round Bonus**: $+5\text{ XP}$ for 5/5 pairs on first attempt.
- **Anti-Abuse Check**: Flag and strip XP if round time $< 1500\text{ms}$ or pair time $< 200\text{ms}$.
- **Decoupled from SM-2**: Pure practice mode that updates `UserStreak` and `UserActivityLog` without altering SRS intervals.

---

## 3. Gap Analysis Matrix

### 3.1. Functional Gaps

- **F-GAP-01 (Backend Matching Generator)**: Missing `MatchingGeneratorService` to query active cards, validate minimum deck size ($\ge 5$), split into rounds of 5 pairs, and independently shuffle columns.
- **F-GAP-02 (Backend Endpoint)**: Missing `GET /api/v1/practice/matching` with query parameters `deckId` and `limit`.
- **F-GAP-03 (Frontend State Engine `useWordMatchingGame`)**: Missing React hook to orchestrate game states (`IDLE`, `PLAYING`, `CARD_SELECTED`, `CHECKING_MATCH`, `MATCH_SUCCESS`, `MATCH_ERROR`, `ROUND_COMPLETED`, `SESSION_FINISHED`), track active selection, evaluate matches, handle timer/Zen mode, and manage combo streaks.
- **F-GAP-04 (Frontend Visual Components)**: Missing `WordMatchingGamePage`, `WordMatchingGame`, `MatchingCardColumn`, and `MatchingTile` with Framer Motion animations (glow, shake, dissolve).
- **F-GAP-05 (Audio Synthesizer Hook `useMatchingAudio`)**: Missing Web Audio API synthesizer for instant zero-latency sound effects (success chime, error buzz, combo ding) with persistent mute preference.
- **F-GAP-06 (Quiz Setup Modal Integration)**: `QuizSetupModal` needs the "Nối từ (Word Matching)" tab option, card count requirement badge ($< 5$ cards disabled state), and routing to `/decks/:id/practice/matching`.

### 3.2. Data & Shared Contract Gaps

- **D-GAP-01 (Shared Types)**: Need `MatchingPairDto`, `MatchingRoundDto`, `GetMatchingQuestionsQueryDto`, `MatchingAnswerSubmissionDto`, and `SubmitMatchingQuizDto` in `packages/shared-types/src/practice.ts`.
- **D-GAP-02 (Zero DB Schema Mutation)**: Uses existing `Card`, `Deck`, `UserActivityLog`, and `UserStreak` tables. No schema migration required.

### 3.3. User Experience & Design Gaps

- **U-GAP-01 (Responsive Grid)**: 2-column layout must adapt smoothly across Mobile ($< 640\text{px}$), Tablet ($640\text{–}1024\text{px}$), and Desktop ($> 1024\text{px}$) viewports without text overflow or awkward line-wrapping.
- **U-GAP-02 (Keyboard Shortcuts)**: Power users need keyboard navigation (`1–5` for Left Column, `Q–T` or `6–0` for Right Column, `Space` for audio, `Esc` for cancel).
- **U-GAP-03 (Tactile Micro-interactions)**: High-fidelity visual feedback adhering to the WordStreak minimal clean design system (Obsidian buttons, violet flame mascot accent, zero distracting clutter).

### 3.4. Transition & Resiliency Requirements

- **T-REQ-01 (Deck Size Validation)**: If deck has $< 5$ cards, backend returns HTTP `400 Bad Request` (`INSUFFICIENT_CARDS_FOR_MATCHING`) and frontend UI disables matching tab with helpful guidance.
- **T-REQ-02 (Graceful Session Exit)**: Users can abandon or exit early via back button; confirmation modal prevents accidental progress loss.
- **T-REQ-03 (Fallback Audio)**: If Web Audio API is unsupported by older browser environments, game operates silently without throwing runtime exceptions.
