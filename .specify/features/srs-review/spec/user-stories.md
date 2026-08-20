# User Stories: Spaced Repetition System (SRS Review)

### US-SRS-01: SM-2 Algorithm Calculation Engine

- **As an** authenticated learner,
- **I want** the system to compute the scientifically optimal review interval for each card based on my performance rating,
- **So that** I remember vocabulary longer with minimal daily review time.
- **Traces to**: `REQ-SRS-001`

**Acceptance Criteria**:

- **Scenario 1 (Happy Path - Rating Good/Easy increments interval)**
  - Given a card with repetitions $n=1$, easeFactor $2.5$, interval $1$
  - When the user rates the card with rating `3` (`Good`)
  - Then repetitions becomes $2$, interval becomes $6$ days, and next review date is scheduled 6 days in future.
- **Scenario 2 (Rating Again resets repetitions and schedules next day)**
  - Given a card in `LEARNING` state with repetitions $n=3$, interval $15$
  - When the user rates the card with rating `1` (`Again`)
  - Then repetitions resets to $0$, interval resets to $1$ day, ease factor decreases by $0.2$, and next review date is tomorrow.
- **Scenario 3 (Edge Case - Ease Factor Clamping)**
  - Given a card with ease factor $1.35$
  - When the user rates it `1` (`Again`)
  - Then ease factor is clamped to minimum $1.30$ and does not drop below $1.30$.

---

### US-SRS-02: Query Due Cards for Review

- **As an** authenticated learner,
- **I want** to see my due cards prioritized when I start a review session,
- **So that** I focus on the cards that need urgent reinforcement before new cards.
- **Traces to**: `REQ-SRS-002`

**Acceptance Criteria**:

- **Scenario 1 (Happy Path - Fetching due queue with mixed cards)**
  - Given a learner has 5 overdue cards, 5 cards due today, and 20 new cards with `dailyGoal = 10`
  - When `GET /api/v1/reviews/due` is requested
  - Then the response returns overdue cards first, then today's due cards, then up to 10 new cards.
- **Scenario 2 (Empty Queue Handling)**
  - Given a learner has 0 cards due and 0 new cards available in the selected deck
  - When `GET /api/v1/reviews/due?deckId=...` is requested
  - Then an empty list `[]` is returned and UI renders a celebratory "All caught up" state.
- **Scenario 3 (Deck Scoped Filter)**
  - Given cards belong to different decks
  - When `GET /api/v1/reviews/due?deckId=deck-123` is requested
  - Then only cards belonging to `deck-123` are returned.

---

### US-SRS-03: Interactive Flashcard Review Experience

- **As an** authenticated learner,
- **I want** a clean, distraction-free 3D flip card interface with keyboard shortcuts,
- **So that** I can rapidly test my memory and rate difficulty effortlessly.
- **Traces to**: `REQ-SRS-003`, `REQ-SRS-004`, `REQ-SRS-005`

**Acceptance Criteria**:

- **Scenario 1 (Happy Path - Flipping and Rating via Keyboard)**
  - Given the learner is on `/review` looking at the front of a flashcard
  - When they press `Space`
  - Then the card flips smoothly in 3D to reveal meaning, example sentence, and 4 rating buttons.
  - When they press `3`
  - Then the rating `Good` is submitted immediately, and the next card in queue appears.
- **Scenario 2 (Intra-Session Repeat for Again Rating)**
  - Given a review session with 3 cards [Card A, Card B, Card C]
  - When the user rates Card A as `1` (`Again`)
  - Then Card A is appended to the back of the queue [Card B, Card C, Card A] to be tested again before session ends.
- **Scenario 3 (Session Completion Summary)**
  - Given the user rates the final card in the queue
  - When the queue reaches 0 remaining cards
  - Then a completion modal appears displaying cards studied, retention percentage, time spent, and a "Return to Dashboard" action button.
