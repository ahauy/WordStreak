# Elicitation Record: Chế độ Nối từ vựng (Word Matching Game)

- **Feature Slug**: `quiz-word-matching`
- **Epics**: `EPIC-04` (Multi-format Practice & Quiz Modes — US-QUIZ-04)
- **Protocol Depth**: Full Feature
- **Date**: 2026-08-21

---

## Stage 1 — Business Value

### 1.1. Problem & Pain Points

- **Single-direction fatigue**: Existing review formats (Flashcard flip, 4-option Multiple Choice, and Fill-in-the-blank) focus heavily on single-item sequential recall. Learners experience cognitive fatigue during long study sessions.
- **Lack of fast-paced associative recall**: Real-world language fluency requires rapid associative matching between conceptual meanings and English lexical representations.
- **Gamification gap**: WordStreak users need varied mini-game mechanics with dynamic feedback (combos, audio cues, tactile tile selection) to boost dopamine and maintain high daily retention.

### 1.2. Target Personas

- **Persona A — Alex (IELTS/TOEIC Candidate)**: Wants to rapidly drill 15–30 topical vocabulary words in 2 minutes before an exam session, testing semantic recognition at speed.
- **Persona B — Minh (Busy Working Professional)**: Has 5 minutes during lunch/transit, wants a lightweight, high-energy vocabulary game to fulfill the daily goal without typing long sentences.
- **Persona C — Linh (Visual & Kinesthetic Learner)**: Learns best by active pairing and visual feedback (matching cards, glowing borders, satisfying chimes).

### 1.3. Success Metrics & KPIs

- **Engagement**: Increase average practice quiz session completion rate by $\ge 25\%$.
- **Learning Velocity**: Achieve average pair match time $< 2.5\text{s}$ per card among active learners.
- **Gamification Impact**: $+15\%$ increase in daily active users (DAU) engaging in practice modes alongside standard SRS flashcard reviews.
- **Zero SRS Corruption**: 100% decoupling of quick practice game results from core SM-2 interval calculations (`UserCardProgress`).

---

## 6-Pillar Domain Elicitation

### Pillar 1 — Personas, Actors & RBAC

- **Guest / Unauthenticated User**:
  - Can view public demo decks and play a restricted preview match (1 round of 5 cards).
  - XP and streaks are not persisted to database (client-only session storage).
  - Prompted to register/log in upon completing the preview to save XP.
- **Learner (Authenticated User)**:
  - Can launch Word Matching Game for any personal deck or cloned public deck having $\ge 5$ cards.
  - Can select practice limits (5, 10, 15, or 20 cards split into 5-card rounds).
  - Earns XP, combo streaks, and contributes to Daily Goal upon session completion.
- **System Service**:
  - Evaluates matching submissions, calculates anti-abuse velocity, awards gamification XP, and logs session summary to `UserActivityLog`.

### Pillar 2 — State Machine & Matching Lifecycle

The game round operates under an 8-state deterministic finite state machine:

1. `IDLE`: Game initialized, cards fetched from API, round board prepared.
2. `PLAYING`: Round active, 2 columns displayed (5 English words on left, 5 Vietnamese definitions on right, shuffled independently). Timer running.
3. `CARD_SELECTED`: User clicked/tapped a first tile (highlighted with purple glow and subtle scale up). Waiting for second tile selection.
4. `CHECKING_MATCH`: User clicked a second tile in the opposing column. Input is temporarily locked (250–350ms) to prevent race conditions or spam clicks.
5. `MATCH_SUCCESS`: Pair is correct (`tileA.cardId === tileB.cardId`).
   - Play chime sound.
   - Green success glow + fade/dissolve animation.
   - Increment `currentCombo` (+1) and update `maxCombo`.
   - Mark pair as solved.
6. `MATCH_ERROR`: Pair is incorrect (`tileA.cardId !== tileB.cardId`).
   - Play mismatch soft buzz sound.
   - Red border + horizontal shake animation (`animate-shake`).
   - Reset `currentCombo` to 0.
   - Record card in `missedCards` list.
   - Revert tiles to neutral state after 400ms.
7. `ROUND_COMPLETED`: All 5 pairs in current round matched.
   - If additional rounds remain: Display round summary transition banner and advance to `NEXT_ROUND`.
   - If final round: Transition to `SESSION_FINISHED`.
8. `SESSION_FINISHED`: Compute total score, speed bonuses, max combo, total XP earned, display `QuizResultsView` with missed cards list and replay options.

### Pillar 3 — Business Rules & Calculations

- **BR-MATCH-001 (Round Size & Layout)**: Standard round consists of 5 pairs (5 English tiles in Column A, 5 Vietnamese tiles in Column B). Both columns are independently shuffled using Fisher-Yates algorithm.
- **BR-MATCH-002 (Bidirectional Selection)**: Learners may initiate matching from either column (Left $\to$ Right or Right $\to$ Left).
- **BR-MATCH-003 (Same Column Switching)**: Tapping another tile within the _same_ column updates the active selection without penalty or error animation.
- **BR-MATCH-004 (Same Tile Deselection)**: Tapping the currently selected tile again deselects it back to neutral with zero penalty.
- **BR-MATCH-005 (Base XP Formula)**: $+2\text{ XP}$ per correctly matched pair ($10\text{ XP}$ base for a 5-pair round).
- **BR-MATCH-006 (Combo Multipliers)**:
  - $\text{Combo } 1\text{–}2$: $1.0\times$ multiplier ($+2\text{ XP}$/pair).
  - $\text{Combo } 3\text{–}4$: $1.2\times$ multiplier ($\approx +2.4 \to 2\text{ XP}$/pair).
  - $\text{Combo } 5\text{ (Clean Round)}$: $1.5\times$ multiplier ($+3\text{ XP}$/pair).
  - $\text{Combo } 10+\text{ (Multi-round Streak)}$: $2.0\times$ multiplier ($+4\text{ XP}$/pair).
- **BR-MATCH-007 (Round Speed Bonus)**: Completing a 5-pair round in $\le 15$ seconds without any mismatch awards a $+10\text{ XP}$ Speed Bonus.
- **BR-MATCH-008 (Perfect Round Bonus)**: Completing all 5 pairs of a round with zero errors awards a $+5\text{ XP}$ Perfect Accuracy Bonus.
- **BR-MATCH-009 (Anti-Abuse Velocity Guard)**: If a round of 5 pairs is submitted in $< 1500\text{ms}$ (average $< 300\text{ms}$ per pair) or any single pair match occurs in $< 200\text{ms}$, the session is flagged as automated bot activity: total XP is set to $0$, and a warning audit log is generated.
- **BR-MATCH-010 (Daily Practice XP Cap)**: Non-SRS practice modes share a global daily XP cap of $500\text{ XP/day}$ to prevent script farming.
- **BR-MATCH-011 (Free SM-2 Decoupling)**: Practice mode matches never modify card intervals, ease factors ($EF$), or `nextReviewDate` in `UserCardProgress`.
- **BR-MATCH-012 (Minimum Deck Size Requirement)**: A deck must contain $\ge 5$ cards to launch Word Matching Game. If a deck has $< 5$ cards, the mode is disabled with an explanatory tooltip.

### Pillar 4 — Workflows & Edge Cases

- **WF-MATCH-01 (Happy Path - Clean Round)**: User opens game $\to$ selects 5 pairs sequentially without mistakes $\to$ 5x combo reached $\to$ $+10\text{ XP}$ base $+ 5\text{ XP}$ perfect $+ 10\text{ XP}$ speed bonus $\to$ round complete.
- **WF-MATCH-02 (Mismatch & Recovery)**: User pairs "Ubiquitous" with "Bền bỉ" $\to$ error shake (400ms) $\to$ combo reset to 0 $\to$ cards added to missed list $\to$ tiles unlock $\to$ user pairs correctly on second try.
- **WF-MATCH-03 (Deck Size $< 5$ Cards)**: User opens `QuizSetupModal` on a deck with 3 cards $\to$ Word Matching option is greyed out with badge `"Cần tối thiểu 5 thẻ"` $\to$ link offered to `"Thêm thẻ mới"`.
- **WF-MATCH-04 (Timer Exhaustion)**: In Timed Mode (default 45s/round), if timer hits 0: remaining unmatched tiles are marked as missed $\to$ round ends gracefully $\to$ results calculated for completed pairs only.
- **WF-MATCH-05 (Zen Mode)**: In Zen Mode (untimed), timer is hidden/replaced with an elapsed time counter $\to$ no timeout pressure $\to$ speed bonus evaluated against elapsed time.
- **WF-MATCH-06 (Rapid Double-Tap Spam)**: User furiously clicks multiple tiles in $< 100\text{ms}$ during evaluation $\to$ `CHECKING_MATCH` locks interaction until transition resolves $\to$ no duplicate match events fired.
- **WF-MATCH-07 (Session Abandonment)**: User closes tab or navigates away mid-game $\to$ partial XP is discarded (or saved as partial) without crashing frontend or dirtying database.

### Pillar 5 — Entities, Data Boundaries & Privacy

- **Shared Contracts & DTOs**:
  - `MatchingPairDto`: `{ id: string, cardId: string, text: string, type: 'WORD' | 'MEANING', phonetic?: string, audioUrl?: string }`
  - `MatchingRoundDto`: `{ roundIndex: number, totalRounds: number, wordTiles: MatchingPairDto[], meaningTiles: MatchingPairDto[] }`
  - `MatchingAnswerSubmissionDto`: `{ cardId: string, matchedInMs: number, attempts: number, isCorrectFirstTry: boolean }`
  - `SubmitMatchingQuizDto`: `{ deckId: string, mode: 'MATCHING', totalPairs: number, totalTimeMs: number, answers: MatchingAnswerSubmissionDto[] }`
- **Data Privacy**:
  - Zero PII collected or logged during practice sessions.
  - Matches evaluate against existing `Card` records belonging to user or public decks.

### Pillar 6 — UX & Non-Functional Requirements

- **Design Tokens & Theme**:
  - Neutral canvas (`#09090b` Cosmos Dark / `#ffffff` Crisp Light).
  - Selected Tile: `ring-2 ring-violet-500 bg-violet-50/50 dark:bg-violet-950/40 text-violet-700 dark:text-violet-300 scale-[1.02]`.
  - Matched Success Tile: `border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 opacity-0 transition-opacity duration-300`.
  - Mismatch Error Tile: `border-rose-500 bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 animate-shake`.
- **Audio Feedback**:
  - Web Audio API synthesized sound effects: Match Success (Sine chime $587\text{Hz} \to 880\text{Hz}$, 120ms), Mismatch Error (Low sawtooth $180\text{Hz} \to 120\text{Hz}$, 180ms), Combo Streak Ding ($1046\text{Hz}$, 150ms).
  - Global mute audio toggle persistent in `localStorage`.
- **Keyboard Navigation**:
  - Number keys `1–5` select Column A tiles (1 to 5 from top).
  - Letter keys `Q, W, E, R, T` (or `6–0`) select Column B tiles.
  - `Space` to replay audio for selected English word.
  - `Escape` to deselect active tile.
- **Accessibility & Performance**:
  - WCAG 2.1 AA compliant (contrast ratio $> 4.5:1$, clear `aria-selected` and `aria-disabled` attributes).
  - 60fps frame rate during tile layout transitions using CSS transforms and hardware-accelerated Framer Motion.
  - Latency: First render $< 100\text{ms}$, tile tap response $< 16\text{ms}$.

---

## Assumptions Confirmed

- **ASM-MATCH-001**: Word Matching Game is organized in discrete rounds of 5 pairs to maintain optimal visual clarity on mobile and desktop viewports.
- **ASM-MATCH-002**: Left column contains English target words; Right column contains Vietnamese definitions/meanings. Both columns are randomly shuffled on round start.
- **ASM-MATCH-003**: The game is bidirectional: users can select English first then Vietnamese, or Vietnamese first then English.
- **ASM-MATCH-004**: Mismatch evaluation applies a 400ms visual shake and lock delay before reverting tiles to neutral state.
- **ASM-MATCH-005**: Practice sessions do not alter SM-2 memory parameters (`interval`, `easeFactor`, `repetitions`) in `UserCardProgress`.
- **ASM-MATCH-006**: Minimum deck size for matching game is 5 cards. Decks with $< 5$ cards are blocked from launching this mode.
- **ASM-MATCH-007**: Anti-abuse detection flags sessions completed in $< 1.5\text{s}$ per 5-pair round as automated scripts and strips XP reward.
- **ASM-MATCH-008**: Audio cues are generated via Web Audio API oscillators to avoid external asset loading latency or 404 network failures.
