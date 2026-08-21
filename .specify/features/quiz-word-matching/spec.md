# Feature Specification: Chế độ Nối từ vựng (Word Matching Game) (US-QUIZ-04)

**Feature**: Word Matching Game (Chế độ Nối từ vựng)  
**Slug**: `quiz-word-matching`  
**Epic**: `EPIC-04` (Multi-format Practice & Quiz Modes — US-QUIZ-04)  
**Status**: APPROVED / READY FOR IMPLEMENTATION  
**Target Sprint**: Sprint 4  
**Date**: 2026-08-21

---

## 1. Executive Summary & Value Proposition

WordStreak learners require interactive, spatial, and rapid associative recall drills to reinforce lexical connections between English words and Vietnamese meanings without altering their long-term Spaced Repetition (SM-2) schedules.

The **Word Matching Game** mode provides an engaging, tactile 2-column vocabulary pairing drill featuring:

- **Responsive 2-Column Board**: 5 English terms on the left and 5 Vietnamese definitions on the right, independently randomized using Fisher-Yates shuffle algorithms.
- **Bidirectional Selection & Fluid Switching**: Learners can pair terms from Left $\to$ Right or Right $\to$ Left, seamlessly switch selections within the same column without penalty, or deselect by tapping the active tile.
- **Zero-Latency Web Audio API Synthesizer**: Native in-browser synthesized audio cues (Ascending Sine Chime for success, Sawtooth Buzz for mismatches, Bell Ping for combos) requiring zero external audio file downloads.
- **Gamification & Multiplier Engine**: Base $+2\text{ XP}$ per matched pair, dynamic combo multipliers ($1.0\times, 1.2\times, 1.5\times, 2.0\times$), speed bonuses ($+10\text{ XP}$ for $\le 15.0\text{s}$ clean rounds), and perfect round bonuses ($+5\text{ XP}$).
- **Anti-Abuse Velocity Guard & Safety Decoupling**: Automated bot detection ($< 1500\text{ms}$ round or $< 200\text{ms}$ pair) stripping XP to 0, shared daily practice XP cap ($500\text{ XP/day}$), and strict zero-mutation isolation from `UserCardProgress` SM-2 scheduling.

---

## 2. User Stories & Acceptance Criteria

### User Story 1 (P1): Setup & Deck Minimum Guard (`US-MATCH-01`)

- **As a** WordStreak learner,
- **I want to** select "Nối từ (Word Matching)" mode from the deck practice launcher with round limits (5, 10, 15, 20 cards) and timer preferences (Timed 45s vs. Zen Mode),
- **So that** I can configure a tailored matching practice session.
- **Acceptance Criteria**:
  - `Scenario 1`: User opens `QuizSetupModal` on a deck with $\ge 5$ cards, selects "Nối từ" tab, chooses "10 Cards" (2 rounds of 5) and "Timed 45s", and clicks "Start Practice Quiz" $\rightarrow$ navigates to `/decks/:id/practice/matching` and loads Round 1 instantly.
  - `Scenario 2`: If the deck contains $< 5$ cards, the "Nối từ" tab is disabled with a badge `"Cần tối thiểu 5 thẻ"` and an explanatory tooltip. Direct backend requests to `GET /api/v1/practice/matching` return HTTP `400 Bad Request` (`INSUFFICIENT_CARDS_FOR_MATCHING`).

### User Story 2 (P1): Interactive 2-Column Matching, Combos & Audio Feedback (`US-MATCH-02`)

- **As a** WordStreak learner,
- **I want to** match 5 pairs of English words and Vietnamese meanings using tactile tile interactions, hotkeys, and instant audio-visual feedback,
- **So that** I build reflexive vocabulary associations while maintaining combo streaks.
- **Acceptance Criteria**:
  - `Scenario 1`: Tapping an English tile highlights it with Purple Flame (`ring-2 ring-violet-500` scale $1.02$). Tapping a different English tile switches selection immediately. Tapping the same tile deselects it to neutral.
  - `Scenario 2`: Tapping a Vietnamese tile first and then the corresponding English tile validates correctly (Bidirectional).
  - `Scenario 3 (Match)`: Correct pairing plays a synthesized chime ($587\text{Hz} \to 880\text{Hz}$), triggers an emerald green border, dissolves both tiles over $300\text{ms}$, increments `comboStreak`, and marks the pair solved.
  - `Scenario 4 (Mismatch)`: Incorrect pairing plays a low buzz ($180\text{Hz} \to 120\text{Hz}$), triggers a $400\text{ms}$ horizontal shake (`animate-shake`), resets `comboStreak` to 0, adds the card to `missedCards`, and unlocks tiles.
  - `Scenario 5 (Interaction Lock)`: During the 300–400ms match/mismatch evaluation window, all tile clicks and keyboard presses are ignored to prevent race conditions.
  - `Scenario 6 (Audio Controls)`: Tapping the header mute button mutes all sound synthesis and persists the preference to `localStorage`.

### User Story 3 (P1): Results Summary, XP Rewards & Anti-Abuse Integrity (`US-MATCH-03`)

- **As a** WordStreak learner,
- **I want to** view my session score, accuracy %, max combo, XP breakdown, and missed words upon completing all rounds,
- **So that** I feel rewarded for accuracy/speed and can review problematic terms.
- **Acceptance Criteria**:
  - `Scenario 1`: Clearing all rounds renders `QuizResultsView` showing total elapsed time, accuracy %, max combo, XP breakdown (Base + Combo Bonus + Speed/Perfect Bonus), and an interactive list of missed cards.
  - `Scenario 2`: Completing a clean 5-pair round in $\le 15.0\text{s}$ awards $+10\text{ XP}$ speed bonus and $+5\text{ XP}$ perfect bonus.
  - `Scenario 3`: Bot submissions completing in $< 1500\text{ms}$ round or $< 200\text{ms}$ pair match are flagged as `isBotSubmission`, awarding $0\text{ XP}$ and logging a backend security audit.
  - `Scenario 4`: Practice session submission does not mutate `UserCardProgress` SM-2 interval or ease factors.

---

## 3. Functional Requirements Traceability Matrix

| Requirement ID    | Description                                                                                                                  | Derived Business Rule                          | Component                          | Priority  |
| :---------------- | :--------------------------------------------------------------------------------------------------------------------------- | :--------------------------------------------- | :--------------------------------- | :-------- |
| **REQ-MATCH-001** | `GET /api/v1/practice/matching` endpoint returning 5-pair chunked rounds with independent column shuffles.                   | `BR-MATCH-001`, `BR-MATCH-002`                 | Backend `MatchingGeneratorService` | Must-Have |
| **REQ-MATCH-002** | Minimum deck size guard ($\ge 5$ cards) on backend and frontend modal tab.                                                   | `BR-MATCH-012`                                 | Backend / Frontend Modal           | Must-Have |
| **REQ-MATCH-003** | Responsive 2-column grid layout (Col A: English, Col B: Vietnamese) with min $48\text{px} \times 48\text{px}$ touch targets. | `BR-MATCH-001`                                 | Frontend `MatchingGameBoard`       | Must-Have |
| **REQ-MATCH-004** | Bidirectional tile selection (A $\to$ B or B $\to$ A) with Purple Flame active state.                                        | `BR-MATCH-003`                                 | Frontend `useMatchingGameEngine`   | Must-Have |
| **REQ-MATCH-005** | Same-column tile switching and self-deselection without error penalty.                                                       | `BR-MATCH-004`                                 | Frontend `useMatchingGameEngine`   | Must-Have |
| **REQ-MATCH-006** | Match evaluation: Emerald highlight, chime sound, 300ms dissolve, combo increment.                                           | `BR-MATCH-005`, `BR-MATCH-006`                 | Frontend Engine + Audio Synth      | Must-Have |
| **REQ-MATCH-007** | Mismatch evaluation: Rose highlight, buzz sound, 400ms shake, combo reset to 0, card added to `missedCards`.                 | `BR-MATCH-005`, `BR-MATCH-006`, `BR-MATCH-012` | Frontend Engine + Audio Synth      | Must-Have |
| **REQ-MATCH-008** | Pointer event interaction locking during 300–400ms evaluation state.                                                         | `BR-MATCH-005`                                 | Frontend `useMatchingGameEngine`   | Must-Have |
| **REQ-MATCH-009** | Combo streak multiplier progression ($1.0\times, 1.2\times, 1.5\times, 2.0\times$) and base $+2\text{ XP}$ per pair.         | `BR-MATCH-006`, `BR-MATCH-007`                 | Backend `PracticeService`          | Must-Have |
| **REQ-MATCH-010** | Speed bonus ($+10\text{ XP}$ for $\le 15.0\text{s}$) and perfect accuracy bonus ($+5\text{ XP}$).                            | `BR-MATCH-008`, `BR-MATCH-009`                 | Backend `PracticeService`          | Must-Have |
| **REQ-MATCH-011** | Anti-abuse velocity detection ($< 1500\text{ms}$ round, $< 200\text{ms}$ pair) & daily 500 XP practice cap.                  | `BR-MATCH-010`, `BR-MATCH-011`                 | Backend `PracticeService`          | Must-Have |
| **REQ-MATCH-012** | Pure practice isolation (zero SM-2 state mutation) & missed card review screen.                                              | `BR-MATCH-012`                                 | Fullstack                          | Must-Have |

---

## 4. UX & Non-Functional Requirements

### 4.1. Design Tokens & Visual Hierarchy (Obsidian Theme)

- **Neutral Tile**: `bg-white dark:bg-[#121214] border border-[#e5e5e5] dark:border-[#27272a] text-[#000000] dark:text-[#f4f4f5] hover:border-[#a1a1aa] transition-all`
- **Selected Tile**: `ring-2 ring-violet-500 border-violet-500 bg-violet-50/60 dark:bg-violet-950/40 text-violet-900 dark:text-violet-200 scale-[1.02] shadow-md`
- **Matched Tile**: `border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 opacity-0 pointer-events-none transition-all duration-300`
- **Mismatch Tile**: `border-rose-500 bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 animate-shake`

### 4.2. Web Audio API Synthesis Parameters

- **Success Tone**: Dual-frequency sweep $587.33\text{Hz (D5)} \to 880.00\text{Hz (A5)}$, sine wave, $120\text{ms}$ duration, exponential gain ramp to zero.
- **Mismatch Buzz**: Double-pulse $180\text{Hz} \to 120\text{Hz}$, sawtooth wave, $180\text{ms}$ duration, linear gain ramp.
- **Combo Bell**: $1046.50\text{Hz (C6)}$, sine wave with high-pass filter, $150\text{ms}$ duration.
- **Volume & Mute**: Master volume clamped to 0.25 gain; instantaneous muting via `gainNode.gain.setValueAtTime(0, ctx.currentTime)`.

### 4.3. Accessibility & Keyboard Shortcuts

- WCAG 2.1 AA contrast ratio ($> 4.5:1$), touch target $\ge 48\text{px} \times 48\text{px}$.
- `aria-live="polite"` feedback announcements for screen readers.
- Keyboard Shortcuts:
  - `1, 2, 3, 4, 5`: Select/toggle Column A tiles (top to bottom).
  - `Q, W, E, R, T` (or `6, 7, 8, 9, 0`): Select/toggle Column B tiles (top to bottom).
  - `Space`: Replay pronunciation audio for selected word.
  - `Escape`: Deselect active tile.

---

## 5. Success Metrics

- **Session Completion Rate**: $\ge 85\%$ of started matching sessions completed to results view.
- **API Performance**: `GET /api/v1/practice/matching` P95 latency $< 80\text{ms}$ for decks up to 1,000 cards.
- **State Integrity**: 0% mutation of `UserCardProgress` SM-2 fields during matching sessions.
- **Asset Overhead**: 0 KB external audio MP3 assets downloaded (100% synthesized via Web Audio API).
