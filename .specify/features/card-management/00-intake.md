# Intake: Card List Management & Search/Filter (US-CARD-02)

- **Date**: 2026-08-20
- **Requested by**: Product Roadmap (docs/PRODUCT_BACKLOG_ROADMAP.md) / Persona A & B
- **Classification**: Bounded Task
- **Classification signals**:
  - New or changed domain entities: 0 (re-uses existing `Card`, `Deck`, `UserCardProgress`)
  - Existing DB schema change required: No (pure additive pagination/filter query & optional indexes)
  - Screens/flows touched: 1 (`DeckDetailPage` table/grid views, status filters, bulk actions)
  - User roles affected: 1 (Deck Owner / Authenticated Learner)
  - Cross-cutting: No
  - Reversible: Yes
- **Protocol selected**: Bounded Task protocol (Stage 1 Intake -> Stage 2 Elicitation interview -> Stage 4 Domain Modeling light -> Stage 5 Risk scan light -> Stage 6 User Stories -> Stage 7 Spec validation -> Stage 8 Handover -> Speckit -> TDD Implementation -> Documentation)
- **Override**: none

## One-line problem statement

Learners need to efficiently search, filter by learning status (New, Learning, Mastered), paginate through large vocabulary decks, and perform bulk operations (bulk delete, bulk move) directly inside the Deck Detail view.
