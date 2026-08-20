# Specification: Card List Management & Search/Filter (US-CARD-02)

**Feature**: `card-management`  
**Epic**: `EPIC-02` (Deck & Vocabulary Card Management)  
**Status**: DRAFT (Speckit Pipeline)  
**Priority**: P0 (Sprint 2 Core Feature)

---

## 1. Feature Description & Context

When learners create or import dozens or hundreds of flashcards into a Deck, navigating, searching, and managing them effectively becomes critical. Currently, the Deck Detail page loads cards without pagination or multi-status filtering, and lacks batch management actions.

This feature introduces:

1. **Server-side Paginated Querying & Filtering**: Full query support for `page`, `limit`, `search`, and `status` (`ALL`, `NEW`, `LEARNING`, `MASTERED`) with pagination metadata.
2. **Dual View Modes**: User-friendly view switcher between 3D Cards Grid and a high-density Data Table (Row view) with persistent preference in `localStorage`.
3. **High-Efficiency Bulk Actions**: Multi-select support to perform Bulk Delete (with confirmation), Bulk Move to Deck, and Bulk Reset Progress in atomic database transactions.

---

## 2. User Stories & Acceptance Scenarios

### US1: Server-side Paginated Search & Status Filtering (P1)

- **Goal**: Enable fast retrieval and status-based filtering of cards in any deck size.
- **Scenarios**:
  - **Scenario 1.1 (Search)**: Search keyword matches case-insensitively in `word`, `meaning`, or `exampleSentence`. Returns matching cards with pagination metadata.
  - **Scenario 1.2 (Status Filter)**: Filtering by status (`NEW`, `LEARNING`, `MASTERED`) returns only corresponding cards for the current user.
  - **Scenario 1.3 (Pagination Controls)**: Changing page (e.g. Page 1 → Page 2) or items per page (10, 20, 50) fetches the exact slice from server.

### US2: Dual View Mode (3D Grid & Data Table) (P1)

- **Goal**: Allow users to switch between visual card preview and compact tabular view.
- **Scenarios**:
  - **Scenario 2.1 (View Toggle)**: Switching between Grid and Table updates the view instantly. Choice is saved to `localStorage` (`wordstreak_deck_view_mode`).
  - **Scenario 2.2 (Table Audio Playback)**: Direct audio playback from the Table row speaker button.

### US3: Bulk Actions (Delete, Move, Reset Progress) (P2)

- **Goal**: Allow users to manage multiple cards simultaneously.
- **Scenarios**:
  - **Scenario 3.1 (Bulk Delete)**: Multi-selection with modal confirmation deletes selected cards and cascades progress cleanup.
  - **Scenario 3.2 (Bulk Move)**: Transfers selected cards to another deck owned by the user.
  - **Scenario 3.3 (Bulk Reset Progress)**: Resets `UserCardProgress` of selected cards to `status: 'NEW'`, `interval: 0`, `repetitions: 0`.

---

## 3. Success Criteria

- **SC-001**: P95 query response time < 100ms for paginated deck card queries with 1,000+ cards.
- **SC-002**: 100% of bulk operations execute within single ACID transactions without partial failure state.
- **SC-003**: View mode preference stays preserved across page reloads and browser sessions.
- **SC-004**: 100% unit test coverage for new backend controller/service query and bulk methods.
