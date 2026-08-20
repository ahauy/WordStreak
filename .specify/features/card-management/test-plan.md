# Test Plan: Card List Management & Search/Filter (US-CARD-02)

## 1. Traceability & Test Cases Mapping

| Test Case ID    | User Story Scenario           | Layer        | Test Description                                                 | Target File                                |
| :-------------- | :---------------------------- | :----------- | :--------------------------------------------------------------- | :----------------------------------------- |
| **TC-CARD-001** | US-CARD-02.1 / Scenario 1     | Backend Unit | Keyword search across word, meaning, exampleSentence             | `cards.service.spec.ts`                    |
| **TC-CARD-002** | US-CARD-02.1 / Scenario 2     | Backend Unit | Filter cards by progress status (`NEW`, `LEARNING`, `MASTERED`)  | `cards.service.spec.ts`                    |
| **TC-CARD-003** | US-CARD-02.1 / Scenario 3     | Backend Unit | Server-side pagination metadata (total, totalPages, hasNextPage) | `cards.service.spec.ts`                    |
| **TC-CARD-004** | US-CARD-02.3 / Scenario 1     | Backend Unit | Bulk delete cards with transaction cascade                       | `cards.service.spec.ts`                    |
| **TC-CARD-005** | US-CARD-02.3 / Scenario 2     | Backend Unit | Bulk move cards to another user-owned deck                       | `cards.service.spec.ts`                    |
| **TC-CARD-006** | US-CARD-02.3 / Scenario 3     | Backend Unit | Bulk reset progress to `NEW`                                     | `cards.service.spec.ts`                    |
| **TC-CARD-007** | Controller Guard & DTO        | Backend Unit | Controller route mapping, validation pipes & user authorization  | `cards.controller.spec.ts`                 |
| **TC-CARD-008** | US-CARD-02.2 / Scenario 1 & 2 | Frontend     | Dual view switcher, CardDataTable render & selection checkboxes  | `DeckDetailPage.tsx` / `CardDataTable.tsx` |

## 2. Test Execution Strategy

1. **Red**: Write failing unit tests for `CardsService` and `CardsController` testing `findAllByDeck` (paginated/filtered) and `bulkAction`.
2. **Green**: Implement DTOs, Service logic, and Controller endpoints to make all tests pass.
3. **Refactor**: Clean up and optimize Prisma queries.
4. **UI Validation**: Validate CardDataTable, search debounce, status chips, and bulk action toolbar on the frontend.
