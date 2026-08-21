# Risk Register & MoSCoW Scope Bounds: Chế độ Nối từ vựng (Word Matching Game)

- **Feature Slug**: `quiz-word-matching`
- **Epics**: `EPIC-04` (Multi-format Practice & Quiz Modes — US-QUIZ-04)
- **Date**: 2026-08-21

---

## 1. Risk Register

| Risk ID            | Risk Description                                                                                                                                                 | Severity | Likelihood | Impact | Mitigation Strategy                                                                                                                                                                                                                                  |     Owner     |
| :----------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------- | :------: | :--------: | :----: | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :-----------: |
| **RISK-MATCH-001** | **Automated Click Bot XP Farming**: Scripted bots send rapid consecutive match submissions to farm gamification XP without learning.                             |   High   |   Medium   |  High  | Implement `BR-MATCH-010` telemetry checks: verify total round duration $\ge 1500\text{ms}$ and average pair velocity $\ge 200\text{ms}$. Strip XP to $0$ and log security flag if violated. Enforce $500\text{ XP/day}$ cap (`BR-MATCH-011`).        |  Backend Dev  |
| **RISK-MATCH-002** | **Insufficient Cards in Small Decks**: Decks with $< 5$ cards cannot form a standard 5-pair round, leading to array out-of-bounds or empty tiles.                |   High   |    High    |  High  | Enforce `BR-MATCH-012`: `QuizSetupModal` disables Matching tab for decks with $< 5$ cards with clear explanatory badge. Backend endpoint `GET /api/v1/practice/matching` returns HTTP `400 Bad Request` with `INSUFFICIENT_CARDS_FOR_MATCHING`.      | Fullstack Dev |
| **RISK-MATCH-003** | **Rapid Tapping Race Conditions**: Users rapidly double-tapping or tapping multiple tiles simultaneously may cause asynchronous state tearing or double scoring. |  Medium  |    High    | Medium | Implement state guard in `useWordMatchingGame`: whenever board enters `CHECKING_MATCH`, all tile pointer events are locked for $300\text{–}400\text{ms}$ until state resolves.                                                                       | Frontend Dev  |
| **RISK-MATCH-004** | **Browser Autoplay Audio Blocking**: Modern web browsers block unprompted audio playback, causing audio exceptions or broken UI state.                           |   Low    |   Medium   |  Low   | Use Web Audio API `AudioContext` initialized on first user click gesture (`onClick`), wrapped in a try/catch safety block so audio errors fail silently without interrupting gameplay.                                                               | Frontend Dev  |
| **RISK-MATCH-005** | **Viewport Overflow on Small Mobile Screens**: 5 rows of 2 columns with long Vietnamese definitions may overflow small smartphone viewports ($< 375\text{px}$).  |  Medium  |   Medium   | Medium | Use dynamic typography (`text-xs` to `text-sm`), clamped line heights (`line-clamp-2`), fluid vertical padding, and minimum touch target of $44\text{px} \times 44\text{px}$ ensuring full board fits within single screen height without scrolling. |   UI/UX Dev   |

---

## 2. Contradiction & Logic Scan

| Check Item                  | Verified Condition                                                                                                                                              |  Status   |
| :-------------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------- | :-------: |
| **SM-2 Independence**       | Does matching practice alter `UserCardProgress` interval or ease factor? **No.** Decoupled per `BR-MATCH-012`.                                                  | ✅ PASSED |
| **Streak Engine Alignment** | Does completing a matching game count towards daily active streak? **Yes**, if user reaches daily goal or completes full session.                               | ✅ PASSED |
| **XP Consistency**          | Are XP awards aligned with other practice modes (MC, Fill-in-the-blank, Listening)? **Yes**, base $10\text{ XP}$ per 5 cards, with combo and speed multipliers. | ✅ PASSED |
| **Deck Access Permissions** | Can users play public decks? **Yes**, public decks are accessible for practice; private decks require user ownership.                                           | ✅ PASSED |
| **State Machine Deadlocks** | Can the state machine get trapped in `CHECKING_MATCH`? **No**, setTimeout automatically transitions to `MATCH_SUCCESS` or `MATCH_ERROR` within $400\text{ms}$.  | ✅ PASSED |

---

## 3. MoSCoW Scope Bounds

### 3.1. Must-Have (P0 — Sprint 5 MVP Scope)

- **Interactive 2-Column Matching Board**: Column A (5 English terms), Column B (5 Vietnamese definitions), independently shuffled.
- **Bidirectional Selection & Fluid Transitions**: Tap-to-select, switch selection in same column, self-deselect, and cross-column match evaluation.
- **Visual & Audio Feedback**: Emerald success fade, rose error shake (`animate-shake`), Web Audio API synthesized sound cues (chime, buzz, combo ping) with master mute toggle.
- **Combo Multiplier & Scoring System**: Dynamic multipliers ($1.0\times, 1.2\times, 1.5\times, 2.0\times$), Round Speed Bonus ($+10\text{ XP}$ for $\le 15\text{s}$), Perfect Accuracy Bonus ($+5\text{ XP}$).
- **Anti-Abuse Telemetry Guard**: Minimum round duration ($1500\text{ms}$) and pair velocity ($200\text{ms}$) checks with daily practice XP cap enforcement ($500\text{ XP/day}$).
- **Minimum Deck Constraint ($\ge 5$ Cards)**: Backend validation and frontend disabled state with clear guidance for small decks.
- **Setup & Results Integration**: Tab in `QuizSetupModal`, standalone routes (`/decks/:id/practice/matching`, `/practice/matching`), and `QuizResultsView` summary with missed cards review.

### 3.2. Should-Have (P1)

- **Zen Mode Toggle**: Option to play without countdown timer pressure (count-up elapsed stopwatch).
- **Full Keyboard Navigation**: Keys `1–5` for Column A, `Q–T` for Column B, `Space` for audio pronunciation, `Esc` for deselect.
- **Round Transition Banner**: Smooth slide-in celebration between multi-round sessions.

### 3.3. Could-Have (P2)

- **Audio Autoplay on English Tile Tap**: Automatically pronounce English word via Web Speech API when tile is selected.
- **Session Best Time Badge**: Display personal best completion time for the current deck.

### 3.4. Won't-Have (Explicitly Out of Scope for v1.0)

- ❌ **Real-Time 1v1 Multi-player Battle Mode**: Synchronous WebSockets multiplayer matching races against other online users (deferred to Phase 4 Community & Social epic).
- ❌ **Drag-and-Drop Line Canvas Drawing**: Drawing SVG connecting wires between columns (touch/tap interaction provides superior accessibility and speed on mobile).
- ❌ **Voice-Activated Matching**: Pronouncing words to auto-select tiles (governed under Epic 08: Speech Recognition).
