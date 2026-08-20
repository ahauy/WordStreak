# Elicitation: Spaced Repetition System & Flashcard Review Flow (SRS Review)

## Stage 1 — Business Value & Personas

- **Problem & Pain Point**: Learners struggle with forgetting vocabulary quickly after adding cards without a scientifically scheduled review system. An automated SuperMemo-2 (SM-2) engine ensures words are reinforced at increasing intervals right before they fade from memory.
- **Target Personas**:
  - Persona A (Alex - Exam Prep): Reviews 20-30 due cards daily across specific IELTS/TOEIC decks.
  - Persona B (Minh - Busy Professional): Needs a quick global review queue (5-10 mins) from any device with instant progress saving and streak continuity.
  - Persona C (Linh - Web Reader): Reviews cards captured from varied contexts in one consolidated session.
- **Success Metrics**:
  - Primary Metric: +30% 7-day retention rate of vocabulary items.
  - Operational Metric: P95 SRS submission and queue fetch latency < 100ms.

---

## 6-Pillar Domain Elicitation

### Pillar 1 — Personas, Actors & RBAC

- **Roles**: Authenticated User (Learner).
- **Permissions**:
  - A user can only fetch due cards and submit review ratings for their own cards or decks they have access to.
  - Guest/unauthenticated requests to review queues are blocked (`401 Unauthorized`).
  - Strict data isolation: `userId` is enforced on all progress queries and updates.

### Pillar 2 — State Machine & Lifecycle

- **Card Learning States**:
  - `NEW`: Card created, never reviewed before (`repetitions == 0`, `interval == 0`).
  - `LEARNING`: Card in active early review cycle (`1 <= interval < 21` days).
  - `MASTERED` / `GRADUATED`: Card thoroughly remembered with long interval (`interval >= 21` days, `repetitions >= 4`).
- **Rating Transitions (SM-2)**:
  - Rating 1 (`AGAIN`): Repetitions reset to `0`, Interval set to `1` day, Ease Factor decreased (`EF' = max(1.3, EF - 0.2)`). Card re-queued in current session.
  - Rating 2 (`HARD`): Repetitions reset to `0`, Interval set to `1` day, Ease Factor decreased (`EF' = max(1.3, EF - 0.15)`).
  - Rating 3 (`GOOD`): Repetitions incremented (`n += 1`). $I(1)=1d, I(2)=6d, I(n)=\text{round}(I(n-1) \times EF)$.
  - Rating 4 (`EASY`): Repetitions incremented (`n += 1`). Ease Factor increased (`EF' = EF + 0.15`), interval given ease bonus multiplier.

### Pillar 3 — Business Rules & Algorithms

- **BR-SRS-001 (Queue Priority)**: Due review queue ordering:
  1. Overdue cards (`nextReviewDate < today`).
  2. Cards due today (`nextReviewDate == today`).
  3. New cards (`status == 'NEW'`), capped by the user's `dailyGoal` minus new cards already introduced today.
- **BR-SRS-002 (In-Session Repeat)**: In a review session, rating a card `AGAIN` keeps the card in the session queue to be re-tested at the end of the batch until a non-fail rating is achieved.
- **BR-SRS-003 (SM-2 Parameter Bounds)**:
  - Minimum Ease Factor: `1.3` (prevent infinite difficulty trap).
  - Initial Ease Factor for new cards: `2.5`.
  - Next review date timestamp calculated from current time + computed interval in days.

### Pillar 4 — Workflows & Edge Cases

- **WF-SRS-01 (Dual Mode Entry)**:
  - `/review`: Global review session across all active (non-archived) decks.
  - `/decks/:deckId/review`: Deck-scoped review session.
- **WF-SRS-02 (Drop Resilience)**: Ratings are submitted immediately per card (`POST /api/v1/reviews/submit`), preventing data loss if user closes tab mid-session.
- **WF-SRS-03 (Session Summary)**: When remaining due cards in the session reach 0, display a summary screen with total cards reviewed, retention breakdown (% Good/Easy vs Again/Hard), time spent, and streak celebration.

### Pillar 5 — Entities, Data Boundaries & Privacy

- **Entity**: `UserCardProgress` (mapped to `user_card_progress` table):
  - `userId`: String (Foreign key to `User`)
  - `cardId`: String (Foreign key to `Card`)
  - `interval`: Int (days until next review)
  - `easeFactor`: Float (SM-2 difficulty multiplier, default `2.5`)
  - `repetitions`: Int (consecutive successful reviews)
  - `lastReviewedAt`: DateTime?
  - `nextReviewDate`: DateTime
  - `status`: String (`NEW` | `LEARNING` | `MASTERED`)
- **Index Requirements**: Compound index on `[userId, nextReviewDate]` and `[userId, status]` for ultra-fast queue resolution.

### Pillar 6 — UX & Non-Functional Requirements

- **UI & Motion**:
  - Minimalist pure white canvas (`#ffffff`), 1px hairline borders (`#e5e5e5`), obsidian pills (`#000000`).
  - 3D Card Flip interaction with smooth perspective transition.
  - Keyboard shortcuts: `Space` (flip card), `1` (Again), `2` (Hard), `3` (Good), `4` (Easy), `R` (replay audio).
  - Stable outer hover anchor to prevent jitter.
- **Performance**:
  - Zero layout shift during card transition.
  - Due queue retrieval query < 50ms.

---

## Assumptions Confirmed

- **ASM-SRS-001**: Review supports dual-mode routing (`/review` global and `/decks/:deckId/review` deck-specific).
- **ASM-SRS-002**: Rating scale is 4 options: Again (1), Hard (2), Good (3), Easy (4), with intra-session loop for 'Again' cards.
- **ASM-SRS-003**: Per-card ratings are persisted immediately upon selection; session summary is presented upon queue exhaustion.
- **ASM-SRS-004**: SM-2 formula adheres to `docs/algorithms/supermemo-2.md` with minimum $EF = 1.3$.

## Open Questions

- None. All 6 pillars confirmed.
