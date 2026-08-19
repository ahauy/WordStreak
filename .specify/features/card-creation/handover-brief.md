# Handover Brief: Contextual Card Creation (US-CARD-01)

**Baseline version**: 1.0 (Signed off 2026-08-19)  
**Spec documents**: [spec/user-stories.md](./spec/user-stories.md)  
**Traceability matrix**: [traceability-matrix.md](./traceability-matrix.md)  
**Domain model**: [03-domain-model.md](./03-domain-model.md)

## What's being built

A complete contextual vocabulary card creation system:

1. Backend NestJS `cards` module (`POST /api/v1/decks/:deckId/cards`, `GET /api/v1/decks/:deckId/cards`, `GET /api/v1/cards/:id`, `PATCH /api/v1/cards/:id`, `DELETE /api/v1/cards/:id`) with JWT auth guard, deck ownership validation, and automatic `UserCardProgress` creation (`status: 'NEW'`, `easeFactor: 2.5`, `interval: 0`, `repetitions: 0`).
2. Shared DTOs and types in `packages/shared-types/src/cards.ts`.
3. Frontend `AddCardModal` with rich fields (word, meaning, phonetic, exampleSentence, collocations, mnemonic, audioUrl, imageUrl), live 3D flip card preview, "Save & Add Another" quick entry, soft duplicate warning badge, and Web Speech API audio pronunciation fallback.
4. Update `DeckDetailPage` to display cards, add card trigger, quick edit, and delete card with cascade.

## What's explicitly out of scope (Won't-Have)

- AI Auto-fill via LLM API (`EPIC-07 / US-AI-01`).
- Advanced multi-criteria search/filter data table for 100+ cards (`US-CARD-02`).
- SM-2 repetition review engine execution (`EPIC-03 / US-SRS-01`).
- Anki / CSV file bulk import (`EPIC-09 / US-ECO-01`).

## Known accepted risks / gaps

- None. Validation report is 100% PASS with unbroken traceability.

## Next step

Handoff to Phase 2 (Specify) & Phase 3 (Plan) using `speckit-specify` and `speckit-plan` under `.specify/features/card-creation/` or `specs/004-card-creation/`.
