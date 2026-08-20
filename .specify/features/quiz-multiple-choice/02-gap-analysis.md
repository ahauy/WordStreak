# Gap Analysis: Multiple Choice Quiz Mode (US-QUIZ-01)

## 1. AS-IS (Current State)

- **Review Mode Only**: The system currently only offers flashcard review (`/decks/:id/review` and `/review`) implementing standard SuperMemo-2 (SM-2) flip cards with 4 rating buttons (`Again`, `Hard`, `Good`, `Easy`).
- **No Practice / Quiz Engine**: The `PracticeModule` in `apps/api/src/modules/practice/` is an empty stub. There is no question generation endpoint, no distractor generator, and no quiz interface in `apps/web/src/features/practice/`.
- **Card Data Available**: Cards in database already possess rich contextual attributes (`word`, `meaning`, `phonetic`, `audioUrl`, `exampleSentence`, `collocations`, `mnemonic`, `imageUrl`), which can be leveraged directly for question prompts and distractor choices.

---

## 2. TO-BE (Target State)

- **Practice Hub & Quiz Mode**:
  - Backend `PracticeController` & `PracticeService`:
    - `GET /api/v1/practice/multiple-choice?deckId=...&limit=10` endpoint that dynamically generates balanced 4-choice questions (50% EN->VI, 50% VI->EN) with intelligent distractor pooling from same deck or user decks.
    - `POST /api/v1/practice/submit-quiz`: Validates completed session answers, computes accuracy, speed bonuses, combo multipliers, and records earned XP.
  - Frontend Interactive Player:
    - Dedicated Route `/decks/:id/quiz` and `/practice/quiz`.
    - Setup drawer/modal (Presets: 10, 20, All cards; Zen Mode switch).
    - Modern Quiz Player adhering to WordStreak Design System (Pure white `#ffffff` canvas, 1px hairline borders, `#000000` obsidian pills, countdown timer bar, keyboard shortcuts `1-4`/`A-D`, instant feedback green/red states, and audio pronunciation on reveal).
    - Summary / Results Screen with accuracy donut, XP breakdown, combo streak, and review-missed-words CTA.

---

## 3. Gap Analysis

### Functional Gaps

1. **Dynamic Question & Distractor Generation**: Algorithm to select questions and pull 3 plausible distractors without duplicate choices.
2. **Interactive Player Engine**: Client-side state machine handling timer ticks, keyboard selection, feedback freeze (1.0s), combo counter, and results calculation.
3. **Practice Result & XP Logging**: Calculation and awarding of practice XP.

### Data Gaps

- **Prisma Schema**:
  - Existing `Card` and `Deck` entities are 100% sufficient for generating multiple choice questions.
  - Optional additive session logging: Add `PracticeSession` model or record directly into `UserActivityLog` / XP tracker.

### User Impact

- No breaking changes to existing decks, cards, or SM-2 reviews.
- Adds a "Practice Quiz" CTA button on `DeckDetailPage` and Dashboard quick actions.

### Transition Requirements

- Zero database migrations required for core question generation.
- Zero downtime; new endpoints and UI routes are purely additive.
