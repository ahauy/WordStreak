# Intake: Contextual Card Creation (US-CARD-01)

- **Date**: 2026-08-19
- **Requested by**: Product Owner / Product Backlog Roadmap (`US-CARD-01`)
- **Classification**: Bounded Task
- **Classification signals**:
  - New or changed domain entities: 1-2 (`Card` entity CRUD, auto-link to `UserCardProgress`)
  - Existing DB schema change required: No (schema `Card` and `UserCardProgress` are already present in Prisma)
  - Screens/flows touched: 1-2 (`DeckDetailPage` / `/decks/:id`, `AddCardModal` / `CardEditorForm`, Quick Flashcard Preview)
  - User roles affected: 1 (Authenticated Learner / Deck Owner)
  - Cross-cutting: No (Scoped to deck cards management, protected by JWT auth & deck ownership)
  - Reversible without user-facing consequence: Yes
- **Protocol selected**: Bounded Task (Stages 1 → 2 short interview → 4 light domain model → 5 light risk scan → 6 User Stories only → 7 validation → 8 handover; Stage 3 Gap Analysis skipped)
- **Override**: None

## One-line problem statement

Allow authenticated learners to create rich contextual vocabulary flashcards (word, IPA, meaning, example sentence, collocations, mnemonic, audio, image) inside their decks, with automatic `UserCardProgress` initialization in `NEW` status and live preview capabilities.
