# Feature Specification: Contextual Card Creation & Management

**Feature Branch**: `feat/contextual-card-creation`  
**Created**: 2026-08-19  
**Status**: Approved  
**Input**: Signed-off Domain Decision Baseline `card-creation` (`US-CARD-01`)

---

## User Scenarios & Testing

### User Story 1 — Contextual Card Creation with Rich Fields (Priority: P0)

As an authenticated learner (Deck Owner), I want to create vocabulary cards containing word, phonetic IPA, meaning, example sentence, collocations, mnemonic note, audio URL, and image URL so that I have rich contextual associations for memory encoding.

**Acceptance Scenarios**:

1. **Given** a logged-in learner viewing deck details (`/decks/:deckId`), **When** they click "+ Thêm thẻ mới" (+ Add Card), fill in `word: "resilient"`, `meaning: "kiên cường, có khả năng phục hồi nhanh"`, `phonetic: "/rɪˈzɪl.jənt/"`, `exampleSentence: "She is a resilient woman who quickly bounces back."`, `collocations: "resilient economy, highly resilient"`, and submit, **Then** `POST /api/v1/decks/:deckId/cards` creates the card and initializes `UserCardProgress` (`status: "NEW"`, `interval: 0`, `repetitions: 0`, `easeFactor: 2.5`), updating the deck's card list.
2. **Given** the user submitting without required `word` or `meaning`, **When** they click Save, **Then** validation errors indicate missing fields and block API dispatch.
3. **Given** the user typing a word already present in the deck, **When** the input matches an existing word (case-insensitive), **Then** a non-blocking soft warning badge appears: _"Từ này đã có trong bộ từ"_.
4. **Given** the user clicking "Lưu & Thêm từ tiếp" (Save & Add Another), **When** creation succeeds, **Then** the card is added to the list, a success toast is shown, and the modal remains open with blank fields and autofocus on the word input.

---

### User Story 2 — Interactive Live 3D Preview & Hybrid Audio (Priority: P0)

As an authenticated learner, I want to see a live 3D preview of the card (front and back) and listen to pronunciation while composing.

**Acceptance Scenarios**:

1. **Given** `AddCardModal` or `EditCardModal` is open, **When** any field changes, **Then** the preview card updates instantly. Clicking the preview flips the card between Front (Word, IPA, Audio, Image) and Back (Meaning, Example, Collocations, Mnemonic).
2. **Given** a word without `audioUrl`, **When** clicking the 🔊 button, **Then** the browser speaks the word using Web Speech API (`en-US`).
3. **Given** a word with a valid `audioUrl`, **When** clicking the 🔊 button, **Then** the audio URL is played.

---

### User Story 3 — View, Edit, and Delete Cards (Priority: P0)

As an authenticated learner, I want to view all cards in my deck, edit card content, and delete cards with automatic cascade cleanup of progress.

**Acceptance Scenarios**:

1. **Given** an existing card in a deck, **When** owner requests `PATCH /api/v1/cards/:id` with updated meaning or mnemonic, **Then** card is updated and reflected in UI.
2. **Given** an existing card, **When** owner requests `DELETE /api/v1/cards/:id`, **Then** the card and its linked `UserCardProgress` are deleted via cascade and removed from the UI.
3. **Given** a non-owner attempting to modify or delete a card, **When** requested, **Then** `404 Not Found` or `403 Forbidden` is returned.

---

## Functional Requirements

- **FR-001**: API MUST provide `POST /api/v1/decks/:deckId/cards` to create a card and atomically initialize `UserCardProgress`.
- **FR-002**: API MUST provide `GET /api/v1/decks/:deckId/cards` returning cards in the deck with user progress info.
- **FR-003**: API MUST provide `GET /api/v1/cards/:id` returning detailed card information.
- **FR-004**: API MUST provide `PATCH /api/v1/cards/:id` to update card fields.
- **FR-005**: API MUST provide `DELETE /api/v1/cards/:id` with cascade deletion of `UserCardProgress`.
- **FR-006**: Frontend MUST provide `AddCardModal` with rich input fields, accordion organization (Core vs Advanced), live 3D preview, "Save & Add Another", and soft duplicate check.
- **FR-007**: Frontend MUST provide `EditCardModal` and `DeleteCardModal`.
- **FR-008**: Frontend MUST provide `DeckDetailPage` (`/decks/:id`) showing deck header, stats bar, card list/grid, and "+ Thêm thẻ" trigger.
