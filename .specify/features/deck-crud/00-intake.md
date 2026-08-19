# Intake: Deck CRUD & Management (US-DECK-01)

- **Date**: 2026-08-19
- **Requested by**: Product Owner / Product Backlog Roadmap (`US-DECK-01`)
- **Classification**: Bounded Task
- **Classification signals**:
  - New or changed domain entities: 1 (`Deck` model extension for color/icon/tag)
  - Existing DB schema change required: Maybe (additive: `color`, `icon`, `tags` fields in `Deck`)
  - Screens/flows touched: 1-2 (Decks List Page `/decks`, Create/Edit Deck Modal, Delete Confirmation)
  - User roles affected: 1 (Authenticated Learner / Deck Owner)
  - Cross-cutting: No (Standard resource CRUD, protected by JWT auth)
  - Reversible without user-facing consequence: Yes
- **Protocol selected**: Bounded Task (Stages 1 → 2 short interview → 4 light domain model → 5 light risk scan → 6 User Stories only → 7 validation → 8 handover; Stage 3 Gap Analysis skipped)
- **Override**: None

## One-line problem statement

Allow authenticated learners to create, view, search, edit, and delete their custom vocabulary decks with personalized metadata (title, description, color/icon tags, visibility) and view card count & progress summary.
