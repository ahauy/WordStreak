# Domain Decision Baseline: Contextual Card Creation (US-CARD-01)

**Status**: SIGNED-OFF  
**Version**: 1.0  
**Signed off by**: Product Owner & AI Pair (2026-08-19)

This document is compiled incrementally by every stage of the WordStreak BA Pipeline.

## 1. Business Problem & Personas

- **Problem**: Flashcard creation needs rich contextual fields (IPA, example sentences, collocations, mnemonics, audio/image preview) to trigger effective multimodal vocabulary retention.
- **Persona**: Authenticated Learner (Deck Owner).
- **Target Metrics**: P95 Card Creation API < 150ms; 100% card progress initialization in `NEW` state; robust audio fallback.

## 2. Approved Domain Decisions & Model Summary

- **RBAC**: Learner can only create, view, edit, and delete cards in Decks they own (`deck.userId === user.id`).
- **Lifecycle & SM-2 Init**: Creating a Card atomically creates `UserCardProgress` (`status: "NEW"`, `interval: 0`, `repetitions: 0`, `easeFactor: 2.5`, `nextReviewDate = now()`).
- **Duplicate Word Policy**: Soft client warning badge, non-blocking.
- **Audio Strategy**: Hybrid URL playback with Web Speech API (`window.speechSynthesis` `en-US`) fallback.
- **Detailed Domain Model**: See [03-domain-model.md](./03-domain-model.md).

## 3. Scope Boundaries (MoSCoW)

- **Must-Have**: Backend Card CRUD module, automatic `UserCardProgress` creation, `AddCardModal` with rich fields, 3D interactive Flashcard preview, Fast continuous entry ("Save & Add Another"), Web Speech API audio fallback.
- **Should-Have**: Soft duplicate warning, Edit card modal, Delete card confirmation.
- **Won't-Have**: AI auto-fill (EPIC-07), Complex search/filter table (US-CARD-02), SM-2 rating review engine (EPIC-03), CSV/Anki import (EPIC-09).
- **Detailed Risk Register**: See [04-risk-register.md](./04-risk-register.md).

## 4. Specification Document Set

- **User Stories**: See [spec/user-stories.md](./spec/user-stories.md).
- **Handover Brief**: See [handover-brief.md](./handover-brief.md).
- **Traceability Matrix**: See [traceability-matrix.md](./traceability-matrix.md).
