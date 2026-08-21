# User Stories & Functional Requirements: Listening & Typing Practice Quiz (US-QUIZ-03)

- **Feature**: Listening & Typing Practice Mode (`quiz-listening-practice`)
- **Epic**: EPIC-04 Multi-format Practice & Quiz Modes (Sprint 5)
- **Date**: 2026-08-21
- **Status**: COMPLETE

---

## 1. Functional Requirements

- **REQ-LISTEN-001**: The system MUST provide an endpoint `GET /api/v1/practice/listening` to retrieve randomized listening practice cards for a selected deck.
  - _Derived from_: `BR-QUIZ-LISTEN-001`, `01-elicitation.md` (Stage 1).
- **REQ-LISTEN-002**: The audio player MUST support dual playback speeds: `1.0x` (Normal) and `0.75x` (Slow/Clear articulation), toggleable via UI button and keyboard hotkey (`Shift+Space` / `S`).
  - _Derived from_: `BR-QUIZ-LISTEN-003`, `ASM-QUIZ-021`.
- **REQ-LISTEN-003**: The system MUST implement an automatic failover cascade to browser Web Speech API (`SpeechSynthesisUtterance`) if `audioUrl` is missing or fails to load within 3000ms.
  - _Derived from_: `BR-QUIZ-LISTEN-002`, `ASM-QUIZ-022`, `ASM-QUIZ-027`.
- **REQ-LISTEN-004**: The user interface MUST display a dynamic typing input with character slot guides (`_ _ _ _ _`) matching the length of the target word.
  - _Derived from_: `01-elicitation.md` (Pillar 3), `03-domain-model.md` §3.
- **REQ-LISTEN-005**: The system MUST validate submitted answers in a normalized, case-insensitive, whitespace-trimmed manner, stripping non-alphanumeric punctuation and matching contraction variants.
  - _Derived from_: `BR-QUIZ-LISTEN-004`, `ASM-QUIZ-023`.
- **REQ-LISTEN-006**: The system MUST provide a 3-tier progressive hint engine: Tier 1 (Length + 1st Letter), Tier 2 (Vietnamese Meaning), Tier 3 (Phonetic IPA). Using any hint forfeits the speed bonus.
  - _Derived from_: `BR-QUIZ-LISTEN-005`, `ASM-QUIZ-024`.
- **REQ-LISTEN-007**: When an answer is incorrect, the UI MUST display immediate feedback featuring a red shake animation and a character-level diff highlighting missing or erroneous letters.
  - _Derived from_: `BR-QUIZ-LISTEN-006`, `01-elicitation.md` (Pillar 3).
- **REQ-LISTEN-008**: The practice flow MUST integrate with `POST /api/v1/practice/submit-quiz` to compute $+10\text{ XP}$ base, $+15\text{ XP}$ speed bonus ($\le 8\text{s}$, 0 hints, $\le 2$ replays), and combo multipliers without mutating SM-2 memory parameters.
  - _Derived from_: `BR-QUIZ-LISTEN-007`, `BR-QUIZ-LISTEN-008`, `ASM-QUIZ-025`.
- **REQ-LISTEN-009**: The system MUST provide an optional 20-second countdown timer with a toggleable Zen Mode.
  - _Derived from_: `BR-QUIZ-LISTEN-009`.
- **REQ-LISTEN-010**: The user interface MUST support comprehensive keyboard navigation (`Space`/`R` for replay, `Shift+Space`/`S` for speed toggle, `Enter` for submit/next, `Ctrl+H` for hints, `Esc` for exit) meeting WCAG 2.1 AA standards.
  - _Derived from_: `BR-QUIZ-LISTEN-010`, `ASM-QUIZ-026`.

---

## 2. User Stories & Gherkin Scenarios

### **US-QUIZ-03: Listening & Typing Practice Mode**

_As an authenticated learner,_  
_I want to listen to target vocabulary audio at normal or slow speed and type the exact spelling with progressive hints and audio failover,_  
_So that I can build razor-sharp auditory comprehension and active spelling recall._

---

#### **Scenario 1: Successful Audio Playback & Typed Answer (Happy Path)**

- **Given** I have launched a Listening Practice session for Deck "TOEIC Master"
- **And** the audio element automatically plays the pronunciation for target word `"efficient"` at `1.0x` speed
- **And** the input box displays 9 character slots `_ _ _ _ _ _ _ _ _`
- **When** I type `"efficient"` and press `Enter`
- **Then** the input borders illuminate in emerald green (`#27c93f`) with a checkmark icon
- **And** the combo counter increments (e.g., `2x Combo`)
- **And** the session auto-advances to the next question after 1.2s (or immediately upon pressing `Enter` or `Space`).

---

#### **Scenario 2: Slow Playback Toggle (0.75x Speed)**

- **Given** I am on a question for a complex vocabulary word `"phenomenon"`
- **And** the audio played at `1.0x` was too fast to catch subtle phonemes
- **When** I click the "0.75x" speed toggle pill (or press `Shift+Space` / `S`)
- **And** I press `Space` (or click the Replay button)
- **Then** the audio replays at `0.75x` rate with clear, slowed-down articulation
- **And** the active speed badge highlights "0.75x Slow".

---

#### **Scenario 3: Audio URL Missing / Network Failure Fallback (Web Speech API)**

- **Given** a card has word `"perseverance"` but its `audioUrl` is null or fails with a 404 network error
- **When** the question loads in the player
- **Then** the audio engine initiates browser `window.speechSynthesis` within 50ms
- **And** the native speech synthesizer articulates `"perseverance"` in clear English (`en-US`)
- **And** a subtle TTS indicator is shown with zero disruption to the quiz experience.

---

#### **Scenario 4: Browser Autoplay Restriction Fallback**

- **Given** the browser has blocked programmatic audio playback on initial session load
- **When** the first question appears on screen
- **Then** the player displays a prominent Obsidian button: "Click to Listen (`Space`)"
- **When** I click the button (or press `Space`)
- **Then** the audio context is unlocked and plays the target word
- **And** subsequent questions auto-play smoothly throughout the session.

---

#### **Scenario 5: Progressive Hint Usage & Speed Bonus Forfeiture**

- **Given** I am unsure of the word spelling after listening to the audio
- **When** I press `Ctrl+H` (or click the "Hint" button) for the first time
- **Then** Hint Tier 1 is revealed displaying the first character: `"p _ _ _ _ _ _ _ _ _ _ _"`
- **When** I press `Ctrl+H` a second time
- **Then** Hint Tier 2 is revealed displaying Vietnamese meaning: `"sự kiên trì, bền bỉ"`
- **When** I press `Ctrl+H` a third time
- **Then** Hint Tier 3 is revealed displaying phonetic IPA: `"/ˌpɜː.sɪˈvɪə.rəns/"`
- **And** the speed bonus (+15 XP) for this question is marked as forfeited.

---

#### **Scenario 6: Incorrect Spelling with Character Diff Visualizer**

- **Given** the target word is `"accommodation"`
- **When** I type `"acomodation"` (missing a 'c' and 'm') and submit
- **Then** the input box shakes horizontally with a red warning state
- **And** the system reveals the correct spelling `"accommodation"`
- **And** a visual character diff clearly highlights the missing letters `'c'` and `'m'` in blue
- **And** the card is added to the "Missed Cards" review list in the final summary.

---

#### **Scenario 7: Countdown Timer Expiration**

- **Given** I am taking a listening quiz with the 20-second timer enabled
- **When** the countdown reaches `00:00` before I submit an answer
- **Then** the question is evaluated as incorrect
- **And** the correct spelling, meaning, and phonetic IPA are revealed
- **And** the combo streak resets to 1x.

---

#### **Scenario 8: Quiz Session Summary & XP Award**

- **Given** I have answered all 10 listening questions (9 correct, 1 missed)
- **When** the final answer is evaluated
- **Then** the `QuizResultsView` displays my total score (`90%`), total XP earned (including speed and combo bonuses), and peak combo streak
- **And** a list of missed words is shown with clickable audio replay buttons
- **And** I can click "Practice Again" or "Return to Deck".
