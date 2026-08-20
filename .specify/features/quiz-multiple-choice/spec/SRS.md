# Software Requirements Specification (SRS): Multiple Choice Quiz

## 1. Functional Requirements

### REQ-QUIZ-001: Dynamic Question Generation API

- **Category**: Backend API / Question Engine
- **Priority**: Must-Have
- **Status**: Draft
- **Description**: The system shall provide an endpoint `GET /api/v1/practice/multiple-choice?deckId={deckId}&limit={limit}` that returns an array of randomized 4-choice questions.
- **Derived from**: BR-QUIZ-001, BR-QUIZ-002, BR-QUIZ-003, ASM-QUIZ-001, ASM-QUIZ-002
- **Business Rules**: BR-QUIZ-001, BR-QUIZ-002, BR-QUIZ-003
- **Non-Functional Requirements**: P95 latency $< 100$ms.

### REQ-QUIZ-002: Distractor Generation & Fallback Pooling

- **Category**: Backend / Data Sourcing
- **Priority**: Must-Have
- **Status**: Draft
- **Description**: For each question card, the engine shall pool 3 unique distractor options from the same deck. If the deck has $< 4$ cards, it shall pull from user's other decks. If total cards $< 4$, it shall return an error `INSUFFICIENT_CARDS`.
- **Derived from**: BR-QUIZ-002, ASM-QUIZ-002, RISK-QUIZ-001
- **Business Rules**: BR-QUIZ-002

### REQ-QUIZ-003: Interactive Quiz Player UI & Keyboard Navigation

- **Category**: Frontend UI / Interaction
- **Priority**: Must-Have
- **Status**: Draft
- **Description**: The web app shall render an interactive quiz player with prompt, 4 choices, hotkeys (`1-4`, `A-D`, `Space`), instant green/red answer highlighting, and a 1.0s auto-advance window.
- **Derived from**: BR-QUIZ-004, ASM-QUIZ-006, RISK-QUIZ-002
- **Business Rules**: BR-QUIZ-004

### REQ-QUIZ-004: Countdown Timer & Zen Mode

- **Category**: Frontend / Game Mechanics
- **Priority**: Must-Have
- **Status**: Draft
- **Description**: Each question shall feature an optional 15-second countdown timer. If the timer expires, the question is evaluated as wrong and the correct answer is revealed. Users can toggle Zen Mode to disable the countdown timer.
- **Derived from**: BR-QUIZ-004, ASM-QUIZ-005
- **Business Rules**: BR-QUIZ-004

### REQ-QUIZ-005: Scoring, Speed Bonus & XP Submission

- **Category**: Backend / Gamification
- **Priority**: Must-Have
- **Status**: Draft
- **Description**: The system shall calculate +10 base XP per correct answer, +5 XP speed bonus for answers in $\le 5$s, and combo multipliers (1.2x for 3+, 1.5x for 5+), submitting the session via `POST /api/v1/practice/submit-quiz`.
- **Derived from**: BR-QUIZ-005, BR-QUIZ-007, ASM-QUIZ-003
- **Business Rules**: BR-QUIZ-005, BR-QUIZ-007

### REQ-QUIZ-006: Results Screen & Missed Words Drill

- **Category**: Frontend / Learning Analytics
- **Priority**: Must-Have
- **Status**: Draft
- **Description**: After completing a quiz, the system shall display an interactive summary screen showcasing accuracy score, total XP gained, highest combo streak, and a review list of missed cards.
- **Derived from**: TO-BE Specification, ASM-QUIZ-003
