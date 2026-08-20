# Risk Register & Contradiction Scan: Card List Management (US-CARD-02)

## 1. Contradiction & Deadlock Scan

- **Check 1: Backward Compatibility**: Existing `GET /api/v1/decks/:deckId/cards` can return paginated object `{ data, meta }` or support backwards-compatible shape.
- **Check 2: Bulk Move Target Ownership**: Target deck could belong to another user -> Resolved: Explicit validation `targetDeck.userId === currentUser.id`.
- **Check 3: Empty Filter Pagination**: Deleting all items on page N -> Handled by client/server returning max available page.

## 2. Risk Register

| Risk ID           | Description                                                        | Severity | Likelihood | Mitigation Strategy                                                                             |
| :---------------- | :----------------------------------------------------------------- | :------: | :--------: | :---------------------------------------------------------------------------------------------- |
| **RISK-CARD-001** | Accidental bulk deletion of valuable cards                         |   High   |   Medium   | Require modal confirmation with exact card count display                                        |
| **RISK-CARD-002** | Slow query performance on large decks with search & status filters |  Medium  |    Low     | Use Prisma `findMany` with compound index on `(deckId, word)` and proper limit caps ($\le 100$) |
| **RISK-CARD-003** | Partial failure during bulk move or reset                          |   High   |    Low     | Wrap all bulk operations inside Prisma `$transaction`                                           |

## 3. MoSCoW Scope Lock

- **Must-Have**:
  - Server-side paginated card list (`page`, `limit`, `search`, `status`).
  - Dual View Mode switcher (3D Cards Grid vs Dense Data Table) with localStorage persistence.
  - Status filter chips (All, New, Learning, Mastered).
  - Bulk actions: Bulk Delete, Bulk Move to Deck, Bulk Reset Progress with confirmation modal.
  - Multi-select checkbox on cards / table rows.
- **Should-Have**:
  - Quick word audio pronunciation play directly from Table row.
  - Keyboard shortcuts (e.g., `/` to focus search).
- **Won't-Have (in this iteration)**:
  - Drag-and-drop manual custom card sorting across decks.
  - Inline batch card content editing.
