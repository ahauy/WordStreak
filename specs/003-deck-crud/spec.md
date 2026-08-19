# Feature Specification: Deck CRUD & Vocabulary Deck Management

**Feature Branch**: `003-deck-crud`  
**Created**: 2026-08-19  
**Status**: Approved  
**Input**: Signed-off Domain Decision Baseline `deck-crud` (`US-DECK-01`)

---

## User Scenarios & Testing

### User Story 1 — Create New Vocabulary Deck (Priority: P0)

As an authenticated learner, I want to create a new vocabulary deck with custom title, description, visual theme (preset color/icon or custom hex/cover image), and visibility so that I can organize my vocabulary learning by topic.

**Acceptance Scenarios**:

1. **Given** a logged-in learner on `/decks`, **When** they open the Create Deck modal, enter title `"IELTS Speaking Part 1"`, choose preset color `#6366F1` (Indigo) and icon `Book`, and submit, **Then** `POST /api/v1/decks` persists the deck with `isArchived = false`, `isPublic = false`, and returns the created deck object with empty stats (`totalCards: 0`), rendering it in the active deck grid immediately.
2. **Given** a learner providing a custom hex color (`#0EA5E9`) and valid HTTPS cover image URL, **When** submitted, **Then** the deck is created with custom visual attributes and rendered properly.
3. **Given** a learner entering an empty or whitespace-only title, **When** they attempt to save, **Then** client and server validation block the request with a clear message: `"Tiêu đề bộ từ không được để trống (1-100 ký tự)"`.

---

### User Story 2 — View, Search, Filter & Summary Stats (Priority: P0)

As an authenticated learner, I want to view all my decks with summary learning stats, and be able to search by keyword or filter between Active and Archived decks.

**Acceptance Scenarios**:

1. **Given** a learner with existing decks, **When** they navigate to `/decks`, **Then** `GET /api/v1/decks?status=active` returns their active decks, each containing summary stats: `totalCards`, `newCards`, `learningCards`, `masteredCards`, `dueCards`.
2. **Given** a learner typing a search query (e.g. `"ielts"`), **When** they type in the search input, **Then** the deck grid filters real-time to match titles or descriptions containing `"ielts"`.
3. **Given** a learner switching to the "Đã lưu trữ" (Archived) tab, **When** `GET /api/v1/decks?status=archived` runs, **Then** only archived decks are displayed with options to restore or permanently delete.

---

### User Story 3 — Edit Deck Metadata (Priority: P0)

As an authenticated learner, I want to update my deck's title, description, color, icon, cover image, and public/private visibility.

**Acceptance Scenarios**:

1. **Given** the owner of a deck, **When** they update the title to `"IELTS Academic Master"` via `PATCH /api/v1/decks/:id`, **Then** the record is updated in the database and reflected in the UI.
2. **Given** a user attempting to edit a deck owned by another user, **When** `PATCH /api/v1/decks/:id` is requested, **Then** the API returns `403 Forbidden` or `404 Not Found`.

---

### User Story 4 — Archive & Restore Deck (Priority: P0)

As an authenticated learner, I want to archive inactive decks to declutter my main workspace without losing any cards or SM-2 progress, and restore them whenever I want.

**Acceptance Scenarios**:

1. **Given** an active deck, **When** the user clicks "Lưu trữ bộ từ" (`PATCH /api/v1/decks/:id/archive`), **Then** `Deck.isArchived` becomes `true`, and the deck moves to the Archived tab.
2. **Given** an archived deck, **When** the user clicks "Khôi phục" (`PATCH /api/v1/decks/:id/restore`), **Then** `Deck.isArchived` becomes `false`, returning to the Active list.

---

### User Story 5 — Permanently Delete Deck with Safety Warning (Priority: P0)

As an authenticated learner, I want to permanently delete a deck when I no longer need it, with full clarity on the irreversible cascade impact.

**Acceptance Scenarios**:

1. **Given** a deck with 20 cards, **When** the user clicks Delete, **Then** a confirmation modal warns: _"Bộ từ này có 20 thẻ và toàn bộ tiến độ học sẽ bị xóa vĩnh viễn"_.
2. **Given** confirmation, **When** `DELETE /api/v1/decks/:id` executes, **Then** the deck, all 20 cards, and their `UserCardProgress` records are deleted in a single transaction, and the deck is removed from the UI.

---

## Requirements

### Functional Requirements

- **FR-001**: System MUST provide `GET /api/v1/decks` supporting query filters `status` (`active` | `archived` | `all`), `search`, `sortBy` (`createdAt` | `title` | `cardCount`), and `sortOrder` (`asc` | `desc`).
- **FR-002**: System MUST provide `POST /api/v1/decks` creating a deck bound to the authenticated `userId`.
- **FR-003**: System MUST provide `GET /api/v1/decks/:id` returning detailed deck info with card stats.
- **FR-004**: System MUST provide `PATCH /api/v1/decks/:id` to update deck metadata.
- **FR-005**: System MUST provide `PATCH /api/v1/decks/:id/archive` and `PATCH /api/v1/decks/:id/restore`.
- **FR-006**: System MUST provide `DELETE /api/v1/decks/:id` with cascade deletion of cards and progress.
- **FR-007**: Frontend MUST implement `DecksListPage` at route `/decks` featuring search, tabs (Active/Archived), sorting, and responsive Cosmos deck cards.
- **FR-008**: Frontend MUST implement `CreateDeckModal`, `EditDeckModal`, and `DeleteDeckConfirmModal`.

### Key Entities

- `Deck`: `id`, `userId`, `title`, `description`, `color`, `icon`, `coverImageUrl`, `tags`, `isPublic`, `isArchived`, `createdAt`, `updatedAt`.
- `Card`: `id`, `deckId`, `word`, `meaning`, `...`
- `UserCardProgress`: `id`, `userId`, `cardId`, `interval`, `easeFactor`, `repetitions`, `nextReviewDate`, `status`.
