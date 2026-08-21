# User Stories: Chế độ Nối từ vựng (Word Matching Game)

- **Feature Title**: Chế độ Nối từ vựng (Word Matching Game)
- **Feature Slug**: `quiz-word-matching`
- **Epic**: `EPIC-04` (Multi-format Practice & Quiz Modes)
- **User Story ID**: `US-QUIZ-04`
- **Date**: 2026-08-21

---

## US-QUIZ-04: Chế độ Nối từ vựng (Word Matching Game)

**As a** WordStreak learner,  
**I want to** play an interactive 2-column word matching game where I pair English vocabulary words with their Vietnamese meanings under light time pressure,  
**So that** I can build rapid, bidirectional associative memory, enjoy tactile gamified feedback with combo streaks, and earn practice XP without altering my core Spaced Repetition (SM-2) review schedule.

**Traces to**: `REQ-MATCH-001`, `REQ-MATCH-002`, `REQ-MATCH-003`, `REQ-MATCH-004`, `REQ-MATCH-005`, `REQ-MATCH-006`, `REQ-MATCH-007`, `REQ-MATCH-008`, `REQ-MATCH-009`, `REQ-MATCH-010`, `REQ-MATCH-011`, `REQ-MATCH-012`

---

## Acceptance Criteria & Test Scenarios

### Scenario 1: Flawless Round (Happy Path — Clean Combos & Speed Bonus)

- **Given** an authenticated learner has opened Word Matching Game for a deck with 10 cards
- **And** Round 1 starts with 5 English word tiles in Column A and 5 Vietnamese definition tiles in Column B
- **When** the learner sequentially matches all 5 pairs correctly without any error in 12.5 seconds
- **Then** each correct pair plays an ascending chime sound and dissolves with an emerald border over 300ms
- **And** the combo counter increments progressively from `Combo 1` to `Combo 5` (Clean Round)
- **And** the system awards $10\text{ XP}$ (base) $+ 5\text{ XP}$ (perfect accuracy) $+ 10\text{ XP}$ (speed bonus $\le 15\text{s}$) $= 25\text{ XP}$ for the round
- **And** a round completion banner displays before smoothly transitioning to Round 2.

### Scenario 2: Bidirectional Matching (Vietnamese First, then English)

- **Given** the matching board is active in state `PLAYING`
- **When** the learner taps a Vietnamese meaning tile in Column B (e.g., _"Bền bỉ, kiên cường"_)
- **Then** the tile enters the active state with a Purple Flame ring (`ring-2 ring-violet-500`) and the board enters `CARD_SELECTED`
- **When** the learner then taps the corresponding English tile in Column A (e.g., _"Resilient"_)
- **Then** the match is validated as correct (`tileA.cardId === tileB.cardId`)
- **And** both tiles dissolve with the emerald success animation.

### Scenario 3: Mismatch Error Shake & Recovery

- **Given** the matching board is active and the learner has selected _"Ubiquitous"_ in Column A
- **When** the learner taps an incorrect Vietnamese meaning in Column B (e.g., _"Hư hỏng, tệ hại"_)
- **Then** the board enters `CHECKING_MATCH` and locks pointer interactions
- **And** both tiles highlight with a rose red border (`border-rose-500`) and perform a 400ms horizontal shake animation (`animate-shake`)
- **And** a low buzz sound cue is played
- **And** the active `comboStreak` resets to 0
- **And** the card ID is added to the `missedCards` list
- **And** after 400ms, both tiles revert to the neutral state and unlock for the next attempt.

### Scenario 4: In-Column Selection Switching

- **Given** the learner has selected _"Serendipity"_ in Column A (active purple glow)
- **When** the learner taps _"Ephemeral"_ in Column A instead of tapping a tile in Column B
- **Then** the selection moves immediately to _"Ephemeral"_ with the active purple glow
- **And** _"Serendipity"_ reverts to the neutral state
- **And** no error animation, sound, or combo penalty is triggered.

### Scenario 5: Self-Deselection by Tapping Active Tile Again

- **Given** the tile _"Mnemonic"_ in Column A is currently selected and highlighted
- **When** the learner taps _"Mnemonic"_ again
- **Then** the tile deselects and returns to the neutral state
- **And** the board state transitions from `CARD_SELECTED` back to `AwaitingFirstSelection` with zero penalty.

### Scenario 6: Deck Size Constraint Guard ($< 5$ Cards)

- **Given** a deck has only 3 vocabulary cards
- **When** the learner opens the `QuizSetupModal` for this deck
- **Then** the "Nối từ (Word Matching)" tab is disabled (greyed out) with a badge `"Cần tối thiểu 5 thẻ"`
- **And** a tooltip explains that Word Matching requires at least 5 cards for a 5-pair round
- **When** the backend endpoint `GET /api/v1/practice/matching?deckId=<id>` is called directly
- **Then** the backend returns HTTP `400 Bad Request` with code `INSUFFICIENT_CARDS_FOR_MATCHING`.

### Scenario 7: Rapid Click Spam & Race Condition Prevention

- **Given** a learner initiates a match by selecting a second tile
- **When** the game enters `CHECKING_MATCH`
- **And** the user clicks 5 other tiles within a 150ms window
- **Then** all clicks during the 300–400ms evaluation lock are ignored
- **And** the board transitions cleanly without state tearing, orphaned highlights, or duplicate score increments.

### Scenario 8: Timed Mode Countdown Exhaustion

- **Given** the learner is playing in Timed Mode with a 45-second round limit
- **When** the timer reaches `00:00` with 2 pairs remaining unsolved
- **Then** the board immediately locks all tile interactions
- **And** the 2 unsolved pairs are recorded in `missedCards`
- **And** the session completes and transitions to `QuizResultsView`
- **And** score and XP are calculated only for the 3 successfully solved pairs.

### Scenario 9: Zen Mode (Untimed Stopwatch)

- **Given** the learner selects "Zen Mode (Không giới hạn thời gian)" in `QuizSetupModal`
- **When** the matching game starts
- **Then** the countdown bar is replaced with an elapsed time counter (`00:15`, `00:16`...)
- **And** the round does not time out under any duration
- **And** if the learner completes 5 pairs in $\le 15.0\text{s}$ with 0 errors, the $+10\text{ XP}$ speed bonus is still awarded.

### Scenario 10: Multi-Round Session Completion & Results Summary

- **Given** a 10-card matching session comprising 2 rounds of 5 pairs
- **When** the learner completes Round 1 and Round 2
- **Then** the game renders `QuizResultsView` displaying:
  - Total time taken (e.g., `34.2s`)
  - Overall accuracy % (e.g., `90%`)
  - Maximum combo streak achieved (e.g., `7x Combo`)
  - Total XP earned with full breakdown (Base + Combos + Speed Bonus)
  - Section "Thẻ cần ôn lại (Missed Cards)" listing all cards with mismatch attempts
  - Buttons for "Luyện tập lại (Retry Game)", "Ôn tập SRS (Review Deck)", and "Về bộ từ (Back to Deck)".

### Scenario 11: Anti-Abuse Bot Velocity Interception

- **Given** an automated script submits a completed 5-pair round with a total duration of $850\text{ms}$ ($< 1500\text{ms}$ threshold)
- **When** the submission is received by `PracticeService.submitQuiz`
- **Then** the server detects `isBotSubmission === true`
- **And** total XP awarded is overridden to $0\text{ XP}$
- **And** an anti-abuse audit warning is logged in the system backend
- **And** `UserStreak` is NOT incremented.

### Scenario 12: Audio Mute Toggle & Fallback

- **Given** the learner is in a quiet environment and clicks the audio mute icon in the game header
- **When** matches or mismatches occur
- **Then** no Web Audio sounds are produced
- **And** the mute preference is saved to `localStorage` and persists across subsequent practice sessions.
