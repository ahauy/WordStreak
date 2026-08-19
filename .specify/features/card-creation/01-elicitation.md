# Elicitation: Contextual Card Creation (US-CARD-01)

## Stage 1 — Business Value

- **Problem**: Flashcard creation currently lacks rich contextual fields (IPA, example sentences, collocations, mnemonics, audio/image preview). Learners need rich multimodal cues to encode vocabulary effectively into long-term memory.
- **Personas**: Authenticated Learner (Deck Owner).
- **Success metrics**:
  - P95 Card Creation API latency < 150ms.
  - 100% of newly created cards automatically initialize a `UserCardProgress` record in `NEW` state.
  - Zero unhandled audio playback failures with fallback to Web Speech API.

## Pillar Decisions

### Pillar 1 — Personas, Actors & RBAC

- **Q1: Deck Ownership & Card Creation**
  - **Decision**: Learner can only create, view, edit, and delete cards inside Decks they own (`deck.userId === currentUser.id`). Unauthorized access returns `403 Forbidden` / `404 Not Found`.

### Pillar 2 — State Machine & Lifecycle

- **Q2: Card & Progress Lifecycle**
  - **Decision**: Creating a card automatically inserts a `UserCardProgress` record with default SM-2 values: `status = 'NEW'`, `interval = 0`, `repetitions = 0`, `easeFactor = 2.5`, `nextReviewDate = now()`.
  - Deleting a Card cascades and deletes the associated `UserCardProgress`.

### Pillar 3 — Business Rules & Algorithms

- **Q3: Duplicate Word Handling**
  - **Decision**: Option A (Soft Warning) — Backend allows multiple cards in the same deck, but frontend checks and displays a non-blocking informative warning ("This word is already in this deck") while still letting the user save if they have distinct contexts/meanings.
- **Q4: Audio Playback Mechanism**
  - **Decision**: Option A (Hybrid Web Speech Fallback) — If `audioUrl` is provided, play audio from URL; if `audioUrl` is empty, use browser `window.speechSynthesis` with `en-US` voice for pronunciation preview.

### Pillar 4 — Workflows & Edge Cases

- **Q5: Multi-card Input & Live Preview**
  - **Decision**: Option A (Split Live Preview & Fast Add) — Form displays required & optional rich fields, side-by-side with 3D interactive Flashcard preview (Front / Back flip). Offers "Save & Add Another" to streamline continuous card entry.
- **Q6: Error Handling & Form Recovery**
  - **Decision**: In case of network errors or server validation failures, form state is preserved and inline field errors are shown.

## Assumptions Confirmed

- **ASM-CARD-001**: Only authenticated users owning the deck can create cards for that deck.
- **ASM-CARD-002**: `word` and `meaning` are required fields; `phonetic`, `audioUrl`, `exampleSentence`, `collocations`, `mnemonic`, and `imageUrl` are optional rich fields.
- **ASM-CARD-003**: Creating a card generates a linked `UserCardProgress` entity with `NEW` status immediately.
- **ASM-CARD-004**: Duplicate words within the same deck trigger a soft client-side warning, not a hard blocking error.
- **ASM-CARD-005**: Audio button plays `audioUrl` or falls back to Web Speech API `window.speechSynthesis` (`en-US`).
- **ASM-CARD-006**: Card deletion cascades to remove `UserCardProgress` records.

## Open Questions

- None.
