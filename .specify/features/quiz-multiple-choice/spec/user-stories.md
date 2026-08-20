# User Stories: Multiple Choice Quiz (US-QUIZ-01)

### US-QUIZ-001: Start & Configure Practice Quiz Session

**As a** Learner  
**I want to** configure and start a Multiple Choice Quiz from my deck  
**So that** I can practice active recall on vocabulary in manageable bites  
**Traces to**: REQ-QUIZ-001, REQ-QUIZ-002

**Acceptance Criteria**:

- **Scenario 1 (Happy Path - Quick 10 Questions)**
  - Given I am on the Deck Detail page of a deck with 15 cards
  - When I click "Practice Quiz", select 10 questions and click "Start Quiz"
  - Then I am navigated to `/decks/:deckId/quiz` and the first question renders immediately.
- **Scenario 2 (Edge Case - Deck with $< 4$ Cards)**
  - Given I am on a deck with only 2 cards and I have no other cards in my account
  - When I attempt to launch a Multiple Choice Quiz
  - Then the system displays an alert modal stating "At least 4 cards are required to generate multiple choice options" and prevents starting.

---

### US-QUIZ-002: Answering Questions with Timer & Instant Feedback

**As a** Learner  
**I want to** select answers using mouse clicks or keyboard hotkeys (1-4, A-D) with visual timer feedback  
**So that** I can build rapid, reflexive vocabulary recognition  
**Traces to**: REQ-QUIZ-003, REQ-QUIZ-004

**Acceptance Criteria**:

- **Scenario 1 (Happy Path - Correct Answer via Hotkey)**
  - Given a question is displayed with 15s timer running
  - When I press key `2` which corresponds to the correct answer option
  - Then option 2 lights up with green highlight and checkmark, my combo increments, and after 1.0s the next question loads automatically.
- **Scenario 2 (Edge Case - Timer Expiry)**
  - Given question 3 is displayed with countdown timer
  - When the 15s countdown reaches 0 without any option selected
  - Then the correct choice is revealed in green, the prompt indicates time out in red, combo resets to 0, and the quiz auto-advances after 1.0s.
- **Scenario 3 (Fast-forward with Spacebar)**
  - Given I have just selected an answer and the 1.0s feedback pause is active
  - When I press `Space`
  - Then the feedback pause is instantly skipped and the next question loads immediately.

---

### US-QUIZ-003: Reviewing Quiz Performance & Earning XP

**As a** Learner  
**I want to** view my final quiz accuracy, XP breakdown, and missed words upon completion  
**So that** I understand my strengths and can review words I struggled with  
**Traces to**: REQ-QUIZ-005, REQ-QUIZ-006

**Acceptance Criteria**:

- **Scenario 1 (Happy Path - Quiz Completion Summary)**
  - Given I answer the last question of a 10-question quiz
  - When the session completes
  - Then the Results screen displays my accuracy percentage (e.g. 90%), total XP gained (+120 XP with speed/combo bonuses), and a list of missed cards.
- **Scenario 2 (Action - Retake or Return)**
  - Given I am on the Results screen
  - When I click "Retake Quiz"
  - Then a new randomized 10-question session is generated and started.
