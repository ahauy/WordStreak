# Intake: Spaced Repetition System & Flashcard Review Flow (SRS Review)

- **Date**: 2026-08-20
- **Requested by**: Product Roadmap (Sprint 2 - Epic 03)
- **Classification**: Full Feature
- **Classification signals**:
  - New or changed domain entities: 1-2 (`UserCardProgress`, `ReviewLog` / `UserActivityLog`)
  - Existing DB schema change required: Additive / Verification (`UserCardProgress` indexing, status transitions)
  - Screens/flows touched: 2+ (Dashboard review callout, Dedicated Study/Review Flow `/review` and `/decks/:deckId/review`, Summary Session Dialog/View)
  - User roles affected: 1 (Authenticated User)
  - Cross-cutting: Yes (Spaced Repetition core USP, Streaks integration, Daily goals)
  - Reversible: Not easily (SM-2 progress state changes are stateful per user review)
- **Protocol selected**: Full BA Pipeline (Stages 1 through 8)
- **Override**: None

## One-line problem statement

Learners need an algorithmically-driven Spaced Repetition (SuperMemo-2) flashcard review engine with a focused, keyboard-accessible 3D flip study interface and due-queue scheduling to retain vocabulary in long-term memory.
