# Test Plan: Multiple Choice Quiz

**Feature slug**: `quiz-multiple-choice`  
**Baseline version**: 1.0 (SIGNED-OFF)  
**Written by**: AI (Antigravity) — Stage TDD (Pre-implementation)  
**Traces to**: `.specify/features/quiz-multiple-choice/spec/user-stories.md`

---

## 1. Unit Tests

### `QuizGeneratorService` (`apps/api/src/modules/practice/quiz-generator.service.spec.ts`)

#### TC-001: Generate balanced 4-choice questions from Deck

```gherkin
Given a deck with 10 cards
When QuizGeneratorService.generateQuestions(deckId, userId, limit=10) is called
Then it returns 10 questions
  And each question has exactly 4 options with 1 marked isCorrect=true
  And options are uniformly shuffled
  And questions contain a balanced mix of EN_TO_VI and VI_TO_EN formats
```

**Priority**: Must-Have  
**Traces to**: `US-QUIZ-001` Scenario 1, `BR-QUIZ-001`, `BR-QUIZ-003`

#### TC-002: Distractor fallback when deck has $< 4$ cards

```gherkin
Given a deck with 2 cards, and user has 5 cards in other decks
When QuizGeneratorService.generateQuestions(deckId, userId) is called
Then it successfully generates questions pulling distractors from user's other decks
  And each question still has 4 distinct options
```

**Priority**: Must-Have  
**Traces to**: `US-QUIZ-001`, `BR-QUIZ-002`

#### TC-003: Insufficient cards exception when total user cards $< 4$

```gherkin
Given a user with only 2 cards total across all decks
When QuizGeneratorService.generateQuestions(deckId, userId) is called
Then it throws BadRequestException with message indicating at least 4 cards are required
```

**Priority**: Must-Have  
**Traces to**: `US-QUIZ-001` Scenario 2, `BR-QUIZ-002`

---

### `PracticeService` (`apps/api/src/modules/practice/practice.service.spec.ts`)

#### TC-004: Calculate score, speed bonus, and combo multipliers

```gherkin
Given a quiz session submission with 10 answers (8 correct, 5 within 5s, max combo 5)
When PracticeService.submitQuiz(userId, submissionDto) is called
Then totalXpEarned is computed with base (+10 per correct) + speed bonus (+5 per <=5s) + combo bonus (1.5x for 5+)
  And accuracyPercentage is 80%
  And 2 missed cards are returned in the response
  And card SM-2 spaced repetition state is NOT altered
```

**Priority**: Must-Have  
**Traces to**: `US-QUIZ-003` Scenario 1, `BR-QUIZ-005`, `BR-QUIZ-006`

#### TC-005: Anti-abuse check for superhuman speed (<3s for 10 questions)

```gherkin
Given a quiz submission with 10 questions completed in 1500ms
When PracticeService.submitQuiz(userId, submissionDto) is called
Then totalXpEarned is capped at 0
```

**Priority**: Must-Have  
**Traces to**: `BR-QUIZ-007`

---

### `useQuizEngine` Hook (`apps/web/src/features/practice/hooks/useQuizEngine.spec.ts`)

#### TC-006: Hotkey selection, feedback state, and auto-advance

```gherkin
Given useQuizEngine initialized with 5 questions
When selectOption("opt-1") or key "1" is triggered
Then feedbackState becomes "CORRECT" or "INCORRECT"
  And after 1000ms timer ticks, currentIndex increments to 1
  And feedbackState resets to "IDLE"
```

**Priority**: Must-Have  
**Traces to**: `US-QUIZ-002` Scenario 1

#### TC-007: Spacebar skips 1.0s feedback delay

```gherkin
Given feedbackState is "CORRECT"
When user presses Spacebar
Then feedback delay is immediately skipped and currentIndex advances immediately
```

**Priority**: Must-Have  
**Traces to**: `US-QUIZ-002` Scenario 3

#### TC-008: 15s timer expiry marks answer wrong

```gherkin
Given Standard mode with 15s timer
When 15 seconds elapse without selection
Then feedbackState becomes "TIMEOUT"
  And answer is marked incorrect
  And correct option is visually highlighted
```

**Priority**: Must-Have  
**Traces to**: `US-QUIZ-002` Scenario 2, `BR-QUIZ-004`

---

## 2. Test Coverage Checklist

- [x] Tất cả `US-QUIZ-###` Scenario 1 (happy path) có TC tương ứng
- [x] Tất cả `US-QUIZ-###` Scenario 2+ (edge cases) có TC tương ứng
- [x] Business rules có anti-abuse đã có TC kiểm tra (`BR-QUIZ-007`)
- [x] Error states (400 Insufficient cards) có TC
- [x] Timer expiry & Zen mode có TC
