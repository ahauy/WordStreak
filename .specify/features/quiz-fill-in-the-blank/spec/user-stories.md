# User Stories & Functional Requirements: Fill-in-the-blank Quiz (US-QUIZ-02)

- **Feature**: Fill-in-the-blank Sentence Completion Quiz
- **Date**: 2026-08-20
- **Status**: COMPLETE

---

## 1. Functional Requirements

- **REQ-FILL-001**: The system MUST provide an endpoint `GET /api/v1/practice/fill-in-the-blank` to generate fill-in-the-blank questions for a given deck.
  - _Derived from_: `BR-FILL-001`, `BR-FILL-002`, `01-elicitation.md` (Stage 1).
- **REQ-FILL-002**: The sentence generator MUST mask target words and inflections (`-s`, `-ed`, `-ing`, `-d`, `-es`) within `exampleSentence` using `[ _____ ]`, and split the sentence into prefix and suffix.
  - _Derived from_: `BR-FILL-002`, `ASM-QUIZ-010`.
- **REQ-FILL-003**: The generator MUST apply a fallback prompt template for cards lacking an `exampleSentence` or when no token match occurs.
  - _Derived from_: `BR-FILL-004`, `ASM-QUIZ-011`.
- **REQ-FILL-004**: The system MUST generate randomized scrambled letter tiles (anagrams) for each target word.
  - _Derived from_: `BR-FILL-003`, `ASM-QUIZ-012`.
- **REQ-FILL-005**: The UI MUST provide a dual input mechanism: direct keyboard text entry and clickable/tappable anagram letter chips.
  - _Derived from_: `ASM-QUIZ-012`, `01-elicitation.md` (Pillar 3).
- **REQ-FILL-006**: The UI MUST provide a progressive Hint button that reveals the first letter and displays phonetic IPA.
  - _Derived from_: `BR-FILL-008`, `ASM-QUIZ-012`.
- **REQ-FILL-007**: The system MUST validate submitted answers in a case-insensitive, whitespace-trimmed manner, accepting either root or inflected tokens.
  - _Derived from_: `BR-FILL-005`, `ASM-QUIZ-013`.
- **REQ-FILL-008**: The practice flow MUST integrate with the quiz submission endpoint `POST /api/v1/practice/submit-quiz` to reward XP, track combo multipliers, and display recap statistics.
  - _Derived from_: `BR-FILL-006`, `BR-FILL-007`, `ASM-QUIZ-014`.
- **REQ-FILL-009**: The UI MUST support keyboard shortcuts (`Enter` to submit/advance, `Ctrl+H` for hints) and optional 25s timer with Zen mode.
  - _Derived from_: `BR-FILL-009`, `BR-FILL-010`, `ASM-QUIZ-015`.

---

## 2. User Stories & Gherkin Scenarios

### **US-QUIZ-02: Fill-in-the-blank Vocabulary Practice**

_As an authenticated learner,_  
_I want to practice completing target vocabulary inside real example sentences with typing, anagram tiles, and hints,_  
_So that I can develop strong active recall, proper spelling, and grammatical contextual usage._

#### **Scenario 1: Successful Answer via Direct Typing (Happy Path)**

- **Given** I have launched a Fill-in-the-blank quiz for Deck "IELTS Core"
- **And** the current question displays: _"The scientist made an important [ _____ ] in genetics."_ with meaning _"sự khám phá"_
- **When** I type `"discovery"` into the input box and press `Enter`
- **Then** the input borders glow green with a success checkmark
- **And** the combo counter increments (e.g. `2x Combo`)
- **And** the player auto-advances to the next question after a 1.2s visual pause (or immediately upon pressing `Enter`/`Space`).

#### **Scenario 2: Anagram Letter Scramble Tiles Selection**

- **Given** I am answering a question in Anagram mode
- **And** the scrambled letter tiles `["e", "v", "d", "s", "r", "c", "i", "o", "y"]` are displayed
- **When** I click the letter tiles in sequence: `d`, `i`, `s`, `c`, `o`, `v`, `e`, `r`, `y`
- **Then** the tiles animate into the active word slot
- **And** clicking `Submit` or completing the last letter evaluates the word as correct.

#### **Scenario 3: Graceful Fallback for Cards without Example Sentences**

- **Given** a card has word `"ubiquitous"` and meaning `"có mặt ở khắp nơi"` but `exampleSentence` is null
- **When** the fill-in-the-blank question is generated
- **Then** the prompt displays: _"Complete the word: \"có mặt ở khắp nơi\""_ with letter length indicators `_ _ _ _ _ _ _ _ _ _`
- **And** typing `"ubiquitous"` correctly completes the question.

#### **Scenario 4: Using Progressive Hint**

- **Given** I am stuck on a question with target word `"ephemeral"`
- **When** I click the "Hint" button (or press `Ctrl+H`)
- **Then** the first letter `"e"` is filled in with remaining blanks `_ _ _ _ _ _ _ _`
- **And** the IPA phonetic `/ɪˈfem.ər.əl/` is displayed
- **And** the speed bonus for this question is disabled.

#### **Scenario 5: Incorrect Answer / Timer Expiry**

- **Given** I am on a question with 25s timer running
- **When** the timer runs out or I submit an incorrect spelling `"discovry"`
- **Then** the input shakes with a red error indicator
- **And** the correct answer `"discovery"` is highlighted in emerald green
- **And** the card is added to the "Missed Cards" review list in the final recap.

#### **Scenario 6: Quiz Session Summary & XP Award**

- **Given** I have answered all 10 questions in the session (8 correct, 2 missed)
- **When** the final question is submitted
- **Then** the `QuizResultsView` displays my score `80%`, XP earned, and maximum combo streak
- **And** I can click "Practice Again" or "Review Missed Cards".
