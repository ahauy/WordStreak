# Test Plan: Listening & Typing Practice Quiz

**Feature slug**: `quiz-listening-practice`  
**Baseline version**: 1.0 (SIGNED-OFF)  
**Written by**: AI (Antigravity) — Stage TDD (Pre-implementation)  
**Traces to**: `.specify/features/quiz-listening-practice/spec/user-stories.md` and `tasks.md`

> **Purpose**: This document defines the formal pre-implementation test plan for the Listening & Typing Practice Quiz feature (`US-QUIZ-03`). Every test case is specified using standard Gherkin syntax, mapped to corresponding source files, requirements, business rules, and task IDs.

---

## 1. Normalization & Diff Engine Unit Tests (`apps/web/src/features/practice/utils/`)

### TC-LISTEN-001: Text Normalization and Spelling Validation

```gherkin
Given target word is "efficient"
When user inputs "  Efficient  " or "EFFICIENT" or "efficient"
Then normalizeSpelling and checkAnswer return isCorrect = true
Given target word is "state-of-the-art"
When user inputs "State-of-the-art!" or "State of the art"
Then normalizeSpelling strips punctuation/extra spaces and checkAnswer returns isCorrect = true
Given target word is "don't"
When user inputs "dont" or curly apostrophe "don’t"
Then checkAnswer returns isCorrect = true
Given target word is "efficient" and user inputs "eficient"
Then checkAnswer returns isCorrect = false
```

- **File**: `apps/web/src/features/practice/utils/spellingDiff.spec.ts`
- **Priority**: Must-Have
- **Traces to**: `US-QUIZ-03` Scenario 1, `REQ-LISTEN-005`, `BR-QUIZ-LISTEN-004`, `ASM-QUIZ-023`, `T004`, `T005`

---

### TC-LISTEN-002: Character-Level LCS Diff Computation

```gherkin
Given target word is "accommodation"
When user submits incorrect spelling "acomodation"
Then computeCharacterDiff("acomodation", "accommodation") produces a list of DiffSpan objects
  And missing characters 'c' (index 2) and 'm' (index 5) are flagged with type "MISSING"
  And matching characters ('a', 'o', 'd', 'a', 't', 'i', 'o', 'n') are flagged with type "MATCH"
Given target word is "separate"
When user submits "seperate"
Then diff identifies substituted character 'e' (index 3) vs target 'a' as "WRONG"
Given target word is "receive"
When user submits "recieve" (transposition)
Then diff identifies transposed characters 'i' and 'e' with exact span boundaries
```

- **File**: `apps/web/src/features/practice/utils/spellingDiff.spec.ts`
- **Priority**: Must-Have
- **Traces to**: `US-QUIZ-03` Scenario 6, `REQ-LISTEN-007`, `BR-QUIZ-LISTEN-006`, `T004`, `T005`

---

## 2. Audio Player Hook & Speech Synthesis Failover Tests (`apps/web/src/features/practice/hooks/`)

### TC-LISTEN-003: HTML5 Audio Playback and Playback Rate Controls (1.0x / 0.75x)

```gherkin
Given useAudioPlayer hook initialized with audioUrl "https://cdn.wordstreak.com/audio/phenomenon.mp3"
When playAudio() is invoked
Then HTML5 Audio element is instantiated and play() is called
  And playbackRate is initialized to 1.0
When setSpeed(0.75) is called
Then audio element playbackRate is updated to 0.75
  And currentSpeed state reflects 0.75
When replayAudio() is called
Then audio element currentTime is reset to 0 and playback starts immediately at 0.75x rate
```

- **File**: `apps/web/src/features/practice/hooks/useAudioPlayer.spec.ts`
- **Priority**: Must-Have
- **Traces to**: `US-QUIZ-03` Scenario 2, `REQ-LISTEN-002`, `BR-QUIZ-LISTEN-003`, `ASM-QUIZ-021`, `T006`, `T007`, `T017`, `T019`

---

### TC-LISTEN-004: Automatic Web Speech API Failover Cascade

```gherkin
Given a card with word "perseverance" and audioUrl is null
When playAudio() is called
Then hook immediately invokes window.speechSynthesis.speak() within 50ms
  And SpeechSynthesisUtterance text is "perseverance"
  And utterance lang is "en-US"
  And utterance rate matches active speed (1.0 or 0.75)
  And isFallbackTTS state is set to true
Given a card with audioUrl "https://broken-cdn.com/missing.mp3" that triggers an error event or times out after 3000ms
When playAudio() fails
Then hook cancels remote audio request and automatically falls back to window.speechSynthesis.speak()
  And no fatal runtime exception is thrown to the UI
```

- **File**: `apps/web/src/features/practice/hooks/useAudioPlayer.spec.ts`
- **Priority**: Must-Have
- **Traces to**: `US-QUIZ-03` Scenario 3, `REQ-LISTEN-003`, `BR-QUIZ-LISTEN-002`, `ASM-QUIZ-022`, `EDGE-002`, `T006`, `T007`, `T017`, `T019`

---

### TC-LISTEN-005: Browser Autoplay Restriction Detection & User Gesture Unlock

```gherkin
Given browser autoplay policy blocks audio and audio.play() rejects with NotAllowedError
When playAudio() is invoked on initial question load
Then needsUserGesture state becomes true
  And isPlaying state remains false
When user triggers unlockAudio() via button click or Spacebar key press
Then audio element play() resolves successfully
  And needsUserGesture state resets to false
  And subsequent questions auto-play smoothly without requiring further unlock gestures
```

- **File**: `apps/web/src/features/practice/hooks/useAudioPlayer.spec.ts`
- **Priority**: Must-Have
- **Traces to**: `US-QUIZ-03` Scenario 4, `ASM-QUIZ-020`, `ASM-QUIZ-027`, `EDGE-001`, `T006`, `T018`, `T019`, `T020`

---

## 3. Backend Generator, Service & Controller Tests (`apps/api/src/modules/practice/`)

### TC-LISTEN-006: Listening Questions Generator Service (Happy Path & Deck Constraints)

```gherkin
Given an authenticated user "user-1" and a deck "deck-1" containing 10 vocabulary cards
When ListeningGeneratorService.generateQuestions("user-1", { deckId: "deck-1", limit: 10 }) is called
Then it returns an array of 10 ListeningQuestionDto objects
  And each question contains { id, cardId, word, wordLength, firstLetterHint, phonetic, meaning, audioUrl }
  And wordLength matches exact character count of word
  And firstLetterHint matches lowercase first character of word
  And the questions are uniformly shuffled in randomized order
  And cards without audioUrl are included with audioUrl = null (allowing client TTS fallback)
```

- **File**: `apps/api/src/modules/practice/listening-generator.service.spec.ts`
- **Priority**: Must-Have
- **Traces to**: `US-QUIZ-03` Scenario 1, `REQ-LISTEN-001`, `BR-QUIZ-LISTEN-001`, `T008`, `T011`

---

### TC-LISTEN-007: Deck Access Control & Empty Deck Exception Handling

```gherkin
Given deckId "deck-private" belongs to "user-2" (isPublic = false)
When ListeningGeneratorService.generateQuestions("user-1", { deckId: "deck-private" }) is called
Then it throws NotFoundException with message indicating deck was not found or inaccessible
Given deckId "deck-empty" has 0 cards
When ListeningGeneratorService.generateQuestions("user-1", { deckId: "deck-empty" }) is called
Then it throws BadRequestException with message "Deck has no cards to practice"
```

- **File**: `apps/api/src/modules/practice/listening-generator.service.spec.ts`
- **Priority**: Must-Have
- **Traces to**: `REQ-LISTEN-001`, `BR-QUIZ-LISTEN-001`, `EDGE-005`, `T008`, `T011`

---

### TC-LISTEN-008: Controller Endpoint `GET /practice/listening`

```gherkin
Given user is authenticated with valid JWT token (sub: "user-1")
When GET /api/v1/practice/listening?deckId=deck-1&limit=10 is requested
Then response status is 200 OK
  And response body matches { success: true, data: ListeningQuestionDto[] }
  And request payload is validated via GetListeningQuestionsQueryDto (limit min: 1, max: 100)
When GET /api/v1/practice/listening without deckId is requested
Then response status is 400 Bad Request
```

- **File**: `apps/api/src/modules/practice/practice.controller.spec.ts`
- **Priority**: Must-Have
- **Traces to**: `REQ-LISTEN-001`, `T003`, `T009`, `T012`

---

### TC-LISTEN-009: Gamification XP Scoring, Speed Bonus (+15 XP) and Anti-Abuse in PracticeService

```gherkin
Given a quiz session submission with 10 listening answers
  And question 1: isCorrect = true, timeSpentMs = 3500, hintsUsed = 0, replayCount = 1
  And question 2: isCorrect = true, timeSpentMs = 7000, hintsUsed = 0, replayCount = 2
  And question 3: isCorrect = true, timeSpentMs = 4000, hintsUsed = 1, replayCount = 0
  And question 4: isCorrect = true, timeSpentMs = 2000, hintsUsed = 0, replayCount = 3
  And question 5: isCorrect = false, timeSpentMs = 6000, hintsUsed = 0, replayCount = 1
When PracticeService.submitQuiz(userId, submissionDto) is called
Then question 1 and 2 receive +10 base XP + 15 speed bonus
  And question 3 receives +10 base XP + 0 speed bonus (forfeited due to hint)
  And question 4 receives +10 base XP + 0 speed bonus (forfeited due to >2 replays)
  And combo multipliers (1.2x for streak >=3, 1.5x for streak >=5) apply correctly
  And totalXpEarned reflects aggregate scoring
  And accuracyPercentage is 80% (4/5)
  And missedCards returns card details for question 5
  And UserCardProgress SM-2 spaced repetition state is NOT modified in database
Given a submission with 10 questions completed in totalTimeMs = 1500ms (<3000ms) or timeSpentMs < 400ms per question
When PracticeService.submitQuiz(userId, botSubmission) is called
Then totalXpEarned is 0 (anti-abuse bot detection triggered)
```

- **File**: `apps/api/src/modules/practice/practice.service.spec.ts`
- **Priority**: Must-Have
- **Traces to**: `US-QUIZ-03` Scenario 1, 5, 8, `REQ-LISTEN-008`, `BR-QUIZ-LISTEN-007`, `BR-QUIZ-LISTEN-008`, `ASM-QUIZ-025`, `EDGE-006`, `T030`, `T032`

---

## 4. Frontend Component & Hook Tests (`apps/web/src/features/practice/`)

### TC-LISTEN-010: `useListeningQuiz` State Machine & Feedback Delay Auto-Advance

```gherkin
Given useListeningQuiz initialized with 5 listening questions
Then currentIndex is 0, feedbackState is "IDLE", typedInput is "", and currentCombo is 0
When user inputs "efficient" and calls submitAnswer()
Then feedbackState becomes "CORRECT"
  And currentCombo increments to 1
When 1200ms timer elapses
Then currentIndex advances to 1
  And feedbackState resets to "IDLE"
  And typedInput resets to ""
When feedbackState is "CORRECT" and user presses Space or Enter before 1200ms
Then the feedback delay is immediately skipped and currentIndex advances instantly
```

- **File**: `apps/web/src/features/practice/hooks/useListeningQuiz.spec.ts`
- **Priority**: Must-Have
- **Traces to**: `US-QUIZ-03` Scenario 1, `REQ-LISTEN-004`, `REQ-LISTEN-010`, `EDGE-004`, `T010`, `T014`

---

### TC-LISTEN-011: 3-Tier Progressive Hint Engine & Bonus Forfeiture

```gherkin
Given current question targetWord is "perseverance", meaning "sự kiên trì, bền bỉ", phonetic "/ˌpɜː.sɪˈvɪə.rəns/"
  And hintLevel is 0
When triggerHint() is called for the first time
Then hintLevel becomes 1
  And hint displays Tier 1: length 12 and first letter "p _ _ _ _ _ _ _ _ _ _ _"
  And speedBonusEligible becomes false
When triggerHint() is called a second time
Then hintLevel becomes 2
  And hint displays Tier 2: Vietnamese meaning "sự kiên trì, bền bỉ"
When triggerHint() is called a third time
Then hintLevel becomes 3
  And hint displays Tier 3: Phonetic IPA "/ˌpɜː.sɪˈvɪə.rəns/"
When triggerHint() is called a fourth time
Then hintLevel remains 3 and hint button is disabled with max hints indication
```

- **File**: `apps/web/src/features/practice/components/ProgressiveHintBox.spec.tsx` and `useListeningQuiz.spec.ts`
- **Priority**: Must-Have
- **Traces to**: `US-QUIZ-03` Scenario 5, `REQ-LISTEN-006`, `BR-QUIZ-LISTEN-005`, `ASM-QUIZ-024`, `T022`, `T023`, `T024`, `T025`

---

### TC-LISTEN-012: `ListeningTypingInput` Slot Rendering & Error Diff Animation

```gherkin
Given question with targetWord length 9
When ListeningTypingInput mounts
Then it renders 9 character slot dashes "_ _ _ _ _ _ _ _ _"
  And input field is automatically focused
When user types "efficient" and submit is triggered
Then input container displays emerald green border (#27c93f) with a Checkmark icon
When user types incorrect word "acomodation" for target "accommodation"
Then input container applies red shake animation class (#ff5f56)
  And character diff view renders below the input highlighting missing 'c' and 'm' in blue badges
```

- **File**: `apps/web/src/features/practice/components/ListeningTypingInput.spec.tsx`
- **Priority**: Must-Have
- **Traces to**: `US-QUIZ-03` Scenario 1, 6, `REQ-LISTEN-004`, `REQ-LISTEN-007`, `BR-QUIZ-LISTEN-006`, `T015`, `T027`, `T029`

---

### TC-LISTEN-013: `ListeningQuizCard` Audio Controls, Speed Pill & Speaker Pulse

```gherkin
Given ListeningQuizCard rendering active question
When audio is actively playing (isAudioPlaying = true)
Then speaker icon renders with pulsating wave animation
When user clicks the "0.75x" speed toggle pill
Then onSpeedChange(0.75) is invoked
  And active pill style switches to obsidian highlighted badge
When user clicks Replay button (or presses Space/R)
Then onReplayAudio() is invoked
  And replayCount increments
When autoplay restriction is active (needsUserGesture = true)
Then card displays "Click to Listen (Space)" action button
```

- **File**: `apps/web/src/features/practice/components/ListeningQuizCard.spec.tsx`
- **Priority**: Must-Have
- **Traces to**: `US-QUIZ-03` Scenario 2, 4, `REQ-LISTEN-002`, `REQ-LISTEN-003`, `T016`, `T018`, `T020`, `T026`

---

## 5. Full Integration, Timer & Accessibility Tests (`apps/web/src/features/practice/pages/`)

### TC-LISTEN-014: 20-Second Countdown Timer & Zen Mode

```gherkin
Given ListeningQuizPage mounted in Standard Mode with 20s timer
When 20 seconds elapse without user submission
Then timer expires (timerSeconds = 0)
  And question is automatically evaluated as incorrect
  And correct spelling, meaning, and phonetic IPA are revealed
  And combo streak resets to 0
Given ListeningQuizPage mounted with isZenMode = true
Then timer bar and countdown badge are hidden
  And no automated timeout occurs regardless of elapsed duration
```

- **File**: `apps/web/src/features/practice/pages/ListeningQuizPage.spec.tsx`
- **Priority**: Must-Have
- **Traces to**: `US-QUIZ-03` Scenario 7, `REQ-LISTEN-009`, `BR-QUIZ-LISTEN-009`, `T031`, `T033`, `T034`

---

### TC-LISTEN-015: End-to-End Quiz Flow, Keyboard Navigation & Results Recap (WCAG 2.1 AA)

```gherkin
Given an authenticated user on route /practice/listening?deckId=deck-1
When user completes all 10 questions using keyboard shortcuts:
  - Space / R to replay audio
  - Shift+Space / S to toggle 0.75x speed
  - Ctrl+H to request progressive hints
  - Enter to submit typed answer and advance
Then page transitions to QuizResultsView
  And results card displays accuracy percentage (e.g. 90%), total XP earned, and peak combo
  And missed cards list renders with clickable audio replay buttons
  And keyboard focus is trapped appropriately and ARIA live regions announce feedback
  And user can click "Retake Quiz" or "Back to Deck"
```

- **File**: `apps/web/src/features/practice/pages/ListeningQuizPage.spec.tsx`
- **Priority**: Must-Have
- **Traces to**: `US-QUIZ-03` Scenario 1, 2, 5, 8, `REQ-LISTEN-010`, `BR-QUIZ-LISTEN-010`, `ASM-QUIZ-026`, `T031`, `T034`, `T035`, `T036`, `T037`

---

## 6. Test Coverage & Traceability Matrix

| Test Case ID      | Test Category            | Target File                           | Traces To (User Story / Rule / Task)                                                                     | Priority  |
| :---------------- | :----------------------- | :------------------------------------ | :------------------------------------------------------------------------------------------------------- | :-------- |
| **TC-LISTEN-001** | Diff & Normalization     | `spellingDiff.spec.ts`                | `US-QUIZ-03` Scen 1, `REQ-LISTEN-005`, `BR-QUIZ-LISTEN-004`, `T004`                                      | Must-Have |
| **TC-LISTEN-002** | Diff & Normalization     | `spellingDiff.spec.ts`                | `US-QUIZ-03` Scen 6, `REQ-LISTEN-007`, `BR-QUIZ-LISTEN-006`, `T004`                                      | Must-Have |
| **TC-LISTEN-003** | Audio Engine             | `useAudioPlayer.spec.ts`              | `US-QUIZ-03` Scen 2, `REQ-LISTEN-002`, `BR-QUIZ-LISTEN-003`, `T006`, `T017`                              | Must-Have |
| **TC-LISTEN-004** | Audio Engine             | `useAudioPlayer.spec.ts`              | `US-QUIZ-03` Scen 3, `REQ-LISTEN-003`, `BR-QUIZ-LISTEN-002`, `EDGE-002`, `T006`, `T017`                  | Must-Have |
| **TC-LISTEN-005** | Audio Engine             | `useAudioPlayer.spec.ts`              | `US-QUIZ-03` Scen 4, `ASM-QUIZ-020`, `ASM-QUIZ-027`, `EDGE-001`, `T006`, `T018`                          | Must-Have |
| **TC-LISTEN-006** | Backend Generator        | `listening-generator.service.spec.ts` | `US-QUIZ-03` Scen 1, `REQ-LISTEN-001`, `BR-QUIZ-LISTEN-001`, `T008`                                      | Must-Have |
| **TC-LISTEN-007** | Backend Generator        | `listening-generator.service.spec.ts` | `REQ-LISTEN-001`, `BR-QUIZ-LISTEN-001`, `EDGE-005`, `T008`                                               | Must-Have |
| **TC-LISTEN-008** | Backend Controller       | `practice.controller.spec.ts`         | `REQ-LISTEN-001`, `T003`, `T009`                                                                         | Must-Have |
| **TC-LISTEN-009** | Backend Practice Service | `practice.service.spec.ts`            | `US-QUIZ-03` Scen 5, 8, `REQ-LISTEN-008`, `BR-QUIZ-LISTEN-007`, `BR-QUIZ-LISTEN-008`, `EDGE-006`, `T030` | Must-Have |
| **TC-LISTEN-010** | Frontend Hook            | `useListeningQuiz.spec.ts`            | `US-QUIZ-03` Scen 1, `REQ-LISTEN-004`, `REQ-LISTEN-010`, `EDGE-004`, `T010`                              | Must-Have |
| **TC-LISTEN-011** | Frontend Component       | `ProgressiveHintBox.spec.tsx`         | `US-QUIZ-03` Scen 5, `REQ-LISTEN-006`, `BR-QUIZ-LISTEN-005`, `T022`, `T023`                              | Must-Have |
| **TC-LISTEN-012** | Frontend Component       | `ListeningTypingInput.spec.tsx`       | `US-QUIZ-03` Scen 1, 6, `REQ-LISTEN-004`, `REQ-LISTEN-007`, `T015`, `T027`                               | Must-Have |
| **TC-LISTEN-013** | Frontend Component       | `ListeningQuizCard.spec.tsx`          | `US-QUIZ-03` Scen 2, 4, `REQ-LISTEN-002`, `REQ-LISTEN-003`, `T016`, `T018`                               | Must-Have |
| **TC-LISTEN-014** | Frontend Page            | `ListeningQuizPage.spec.tsx`          | `US-QUIZ-03` Scen 7, `REQ-LISTEN-009`, `BR-QUIZ-LISTEN-009`, `T031`                                      | Must-Have |
| **TC-LISTEN-015** | Frontend Integration     | `ListeningQuizPage.spec.tsx`          | `US-QUIZ-03` Scen 1, 2, 5, 8, `REQ-LISTEN-010`, `BR-QUIZ-LISTEN-010`, `T031`, `T034`, `T037`             | Must-Have |

---

## 7. Test Execution & Verification Checklist

- [ ] `TC-LISTEN-001`: Spelling normalization & punctuation stripping unit tests pass
- [ ] `TC-LISTEN-002`: Character-level LCS diff algorithm unit tests pass
- [ ] `TC-LISTEN-003`: HTML5 audio dual playback rates (`1.0x` and `0.75x`) unit tests pass
- [ ] `TC-LISTEN-004`: Browser Web Speech API failover cascade unit tests pass
- [ ] `TC-LISTEN-005`: Autoplay restriction detection & gesture unlock unit tests pass
- [ ] `TC-LISTEN-006`: Backend `ListeningGeneratorService` question formatting unit tests pass
- [ ] `TC-LISTEN-007`: Backend deck ownership & empty deck validation tests pass
- [ ] `TC-LISTEN-008`: Controller endpoint `GET /api/v1/practice/listening` integration tests pass
- [ ] `TC-LISTEN-009`: Practice service XP computation (+15 XP speed bonus), combo multipliers & anti-abuse tests pass
- [ ] `TC-LISTEN-010`: `useListeningQuiz` state transitions & 1.2s auto-advance delay tests pass
- [ ] `TC-LISTEN-011`: 3-Tier progressive hint disclosure & speed bonus forfeiture component tests pass
- [ ] `TC-LISTEN-012`: `ListeningTypingInput` slot rendering & error diff animation tests pass
- [ ] `TC-LISTEN-013`: `ListeningQuizCard` audio controls, replay count & speed toggle tests pass
- [ ] `TC-LISTEN-014`: 20s countdown timer expiry & Zen Mode toggle component tests pass
- [ ] `TC-LISTEN-015`: End-to-end keyboard shortcuts, results recap & WCAG 2.1 AA accessibility tests pass
