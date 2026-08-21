# Software Requirements Specification (SRS): Chế độ Nối từ vựng (Word Matching Game)

- **Feature Title**: Chế độ Nối từ vựng (Word Matching Game)
- **Feature Slug**: `quiz-word-matching`
- **Epic**: `EPIC-04` (Multi-format Practice & Quiz Modes — US-QUIZ-04)
- **Document Version**: 1.0
- **Status**: Draft (Ready for Validation)
- **Date**: 2026-08-21

---

## 1. Introduction & Traceability Standards

This document establishes the functional and non-functional requirements for the Word Matching Game feature (`quiz-word-matching`). Every requirement is atomic, testable, and strictly derived from upstream domain models (`03-domain-model.md`) and assumptions (`01-elicitation.md`).

---

## 2. Specific Requirements

### REQ-MATCH-001: Matching Questions Generation Endpoint

- **Category**: Backend API & Data Fetching
- **Priority**: Must-Have
- **Status**: Draft
- **Description**: The system shall expose an HTTP `GET /api/v1/practice/matching` endpoint accepting query parameters `deckId` (UUID) and `limit` (integer, default 10, min 5, max 50). The endpoint shall return an array of `MatchingRoundDto` objects, each containing 5 card pairs divided into `wordTiles` (English terms) and `meaningTiles` (Vietnamese meanings), with each column independently shuffled.
- **Derived from**: `BR-MATCH-001`, `BR-MATCH-002`, `ASM-MATCH-001`, `ASM-MATCH-002`, `F-GAP-01`, `F-GAP-02`
- **Business Rules**: `BR-MATCH-001`, `BR-MATCH-002`
- **Non-Functional Requirements**: P95 response time $< 80\text{ms}$ for decks up to 1,000 cards.
- **Dependencies**: None

### REQ-MATCH-002: Minimum Deck Size Validation Guard

- **Category**: Validation & Error Handling
- **Priority**: Must-Have
- **Status**: Draft
- **Description**: If a requested deck contains fewer than 5 active cards, the backend endpoint shall reject the request with HTTP `400 Bad Request` and error code `INSUFFICIENT_CARDS_FOR_MATCHING`. The frontend UI shall disable the Word Matching option in `QuizSetupModal` and display a badge indicating `"Cần tối thiểu 5 thẻ"`.
- **Derived from**: `BR-MATCH-012`, `ASM-MATCH-006`, `RISK-MATCH-002`, `T-REQ-01`
- **Business Rules**: `BR-MATCH-012`
- **Non-Functional Requirements**: Immediate client-side validation check without unnecessary network overhead.
- **Dependencies**: `REQ-MATCH-001`

### REQ-MATCH-003: 2-Column Responsive Layout & Tile Display

- **Category**: Frontend UI & Layout
- **Priority**: Must-Have
- **Status**: Draft
- **Description**: The frontend shall render matching rounds as a responsive 2-column grid: Column A (Left) displaying 5 English word tiles, and Column B (Right) displaying 5 Vietnamese meaning tiles. Each tile must render text clearly with a minimum touch target of $48\text{px} \times 48\text{px}$ and adapt to Mobile, Tablet, and Desktop screens without layout clipping.
- **Derived from**: `BR-MATCH-001`, `ASM-MATCH-001`, `U-GAP-01`, `RISK-MATCH-005`
- **Business Rules**: `BR-MATCH-001`
- **Non-Functional Requirements**: Compliant with WCAG 2.1 AA target sizes and contrast ratios ($> 4.5:1$).
- **Dependencies**: `REQ-MATCH-001`

### REQ-MATCH-004: Bidirectional Tile Selection & Active State

- **Category**: Gameplay Interaction
- **Priority**: Must-Have
- **Status**: Draft
- **Description**: The system shall support bidirectional matching initiation: clicking a tile in Column A and then Column B, or clicking Column B and then Column A. When the first tile is clicked, it shall enter the `Selected` visual state (Purple Flame active ring `ring-2 ring-violet-500` and scale $1.02$) and set the board state to `CARD_SELECTED`.
- **Derived from**: `BR-MATCH-003`, `ASM-MATCH-003`, `F-GAP-03`
- **Business Rules**: `BR-MATCH-003`
- **Non-Functional Requirements**: Pointer event visual response time $< 16\text{ms}$ (60fps).
- **Dependencies**: `REQ-MATCH-003`

### REQ-MATCH-005: Same-Column Switching & Self-Deselection

- **Category**: Gameplay Interaction
- **Priority**: Must-Have
- **Status**: Draft
- **Description**: If a user clicks a _different_ tile within the same column as the currently selected tile, the system shall switch active selection to the newly clicked tile with zero penalty. If the user clicks the _already selected_ tile, the system shall deselect it back to neutral with zero penalty.
- **Derived from**: `BR-MATCH-004`, `F-GAP-03`
- **Business Rules**: `BR-MATCH-004`
- **Non-Functional Requirements**: Zero unintended mismatch triggers.
- **Dependencies**: `REQ-MATCH-004`

### REQ-MATCH-006: Match Success Evaluation, Animation & Audio

- **Category**: Gameplay Evaluation & Feedback
- **Priority**: Must-Have
- **Status**: Draft
- **Description**: When a second tile in the opposite column is clicked and `tileA.cardId === tileB.cardId`, the system shall: (1) apply an emerald green success border (`border-emerald-500`), (2) play a synthesized ascending chime sound ($587\text{Hz} \to 880\text{Hz}$), (3) fade out and dissolve both tiles over $300\text{ms}$, (4) mark the pair as solved, and (5) increment the active `comboStreak` by 1.
- **Derived from**: `BR-MATCH-005`, `BR-MATCH-006`, `ASM-MATCH-004`, `ASM-MATCH-008`, `F-GAP-04`, `F-GAP-05`
- **Business Rules**: `BR-MATCH-005`, `BR-MATCH-006`
- **Non-Functional Requirements**: Audio cue generated via Web Audio API with zero asset network latency.
- **Dependencies**: `REQ-MATCH-004`

### REQ-MATCH-007: Mismatch Error Evaluation, Shake & Combo Reset

- **Category**: Gameplay Evaluation & Feedback
- **Priority**: Must-Have
- **Status**: Draft
- **Description**: When a second tile in the opposite column is clicked and `tileA.cardId !== tileB.cardId`, the system shall: (1) apply a rose red border (`border-rose-500`), (2) play a synthesized low buzz sound ($180\text{Hz} \to 120\text{Hz}$), (3) execute a $400\text{ms}$ horizontal shake animation (`animate-shake`), (4) reset `comboStreak` to 0, (5) append the involved card IDs to the `missedCards` list, and (6) revert both tiles to the neutral state upon animation completion.
- **Derived from**: `BR-MATCH-005`, `BR-MATCH-006`, `ASM-MATCH-004`, `ASM-MATCH-008`, `F-GAP-04`, `F-GAP-05`
- **Business Rules**: `BR-MATCH-005`, `BR-MATCH-006`, `BR-MATCH-012`
- **Non-Functional Requirements**: Smooth CSS keyframe shake animation without layout reflow.
- **Dependencies**: `REQ-MATCH-004`

### REQ-MATCH-008: Interaction Locking During Evaluation

- **Category**: Concurrency & Input Guard
- **Priority**: Must-Have
- **Status**: Draft
- **Description**: While the game is in state `CHECKING_MATCH` ($300\text{–}400\text{ms}$ duration), all pointer interactions and keyboard triggers on all tiles shall be locked to prevent race conditions, rapid double-clicks, or asynchronous state tearing.
- **Derived from**: `BR-MATCH-005`, `RISK-MATCH-003`, `F-GAP-03`
- **Business Rules**: `BR-MATCH-005`
- **Non-Functional Requirements**: Deterministic state machine with zero deadlocks.
- **Dependencies**: `REQ-MATCH-006`, `REQ-MATCH-007`

### REQ-MATCH-009: Combo Multiplier Progression & XP Scoring

- **Category**: Gamification Engine
- **Priority**: Must-Have
- **Status**: Draft
- **Description**: The system shall award a base $+2\text{ XP}$ per matched pair multiplied by the current combo tier: $1.0\times$ for Combos 1–2, $1.2\times$ for Combos 3–4, $1.5\times$ for Combo 5 (Clean Round), and $2.0\times$ for Combos $\ge 10$ (Multi-round Streak).
- **Derived from**: `BR-MATCH-006`, `BR-MATCH-007`, `F-GAP-03`
- **Business Rules**: `BR-MATCH-006`, `BR-MATCH-007`
- **Non-Functional Requirements**: Exact mathematical rounding conforming to `round(base * multiplier)`.
- **Dependencies**: `REQ-MATCH-006`

### REQ-MATCH-010: Round Speed Bonus & Perfect Accuracy Bonus

- **Category**: Gamification Engine
- **Priority**: Must-Have
- **Status**: Draft
- **Description**: The system shall award a $+10\text{ XP}$ Speed Bonus for any 5-pair round completed in $\le 15.0\text{s}$ with zero mismatches, and a $+5\text{ XP}$ Perfect Accuracy Bonus for any round completed with zero mismatches regardless of time.
- **Derived from**: `BR-MATCH-008`, `BR-MATCH-009`, `F-GAP-03`
- **Business Rules**: `BR-MATCH-008`, `BR-MATCH-009`
- **Non-Functional Requirements**: Precision timing calculated using high-resolution millisecond timestamps.
- **Dependencies**: `REQ-MATCH-009`

### REQ-MATCH-011: Anti-Abuse Velocity Guard & Daily Practice Cap

- **Category**: Security & Gamification Integrity
- **Priority**: Must-Have
- **Status**: Draft
- **Description**: The backend submission handler shall validate incoming match session telemetry: if total round time is $< 1500\text{ms}$ or any single pair match time is $< 200\text{ms}$, the session shall be flagged as `IS_BOT_DETECTED`, stripping XP earned to $0\text{ XP}$ and logging a security warning. Furthermore, the system shall enforce the global non-SRS daily practice cap of $500\text{ XP/day}$.
- **Derived from**: `BR-MATCH-010`, `BR-MATCH-011`, `ASM-MATCH-007`, `RISK-MATCH-001`, `F-GAP-03`
- **Business Rules**: `BR-MATCH-010`, `BR-MATCH-011`
- **Non-Functional Requirements**: Server-side validation executed in $< 10\text{ms}$.
- **Dependencies**: `REQ-MATCH-009`, `REQ-MATCH-010`

### REQ-MATCH-012: Spaced Repetition Decoupling & Results Review

- **Category**: Data Integrity & Learning Analytics
- **Priority**: Must-Have
- **Status**: Draft
- **Description**: Submitting matching game results shall NEVER mutate `interval`, `easeFactor`, `repetitions`, or `nextReviewDate` in `UserCardProgress`. Upon session completion, the system shall render `QuizResultsView` displaying total score, accuracy %, max combo, XP breakdown, and a review list of `missedCards` with options to launch targeted review or retry the matching game.
- **Derived from**: `BR-MATCH-012`, `ASM-MATCH-005`, `F-GAP-04`, `F-GAP-06`
- **Business Rules**: `BR-MATCH-012`
- **Non-Functional Requirements**: Clean separation of practice analytics from core spaced repetition engine.
- **Dependencies**: `REQ-MATCH-006`, `REQ-MATCH-007`
