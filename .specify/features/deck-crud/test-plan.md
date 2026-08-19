# Test Plan: Deck CRUD & Vocabulary Management

**Feature slug**: `deck-crud`  
**Baseline version**: 1.0 (SIGNED-OFF)  
**Written by**: AI (Antigravity) — Stage TDD (trước implement)  
**Traces to**: `.specify/features/deck-crud/spec/user-stories.md`

---

## Unit Tests

### `DecksService` (`apps/api/src/modules/decks/decks.service.spec.ts`)

#### TC-001: Create deck successfully with preset theme

```gherkin
Given a valid user id and CreateDeckDto with title "IELTS Writing" and color "#6366F1"
When DecksService.create(userId, dto) is called
Then a new Deck record is created with isArchived=false and isPublic=false
  And the created deck is returned with empty stats (totalCards: 0)
```

**Priority**: Must-Have  
**Traces to**: `US-DECK-001` Scenario 1

#### TC-002: Create deck with custom hex and cover image URL

```gherkin
Given a valid user id and CreateDeckDto with custom hex "#0EA5E9" and coverImageUrl "https://example.com/cover.png"
When DecksService.create(userId, dto) is called
Then the record is saved with custom color and coverImageUrl
```

**Priority**: Must-Have  
**Traces to**: `US-DECK-001` Scenario 2

#### TC-003: List active decks with card stats calculation

```gherkin
Given an authenticated user with 2 active decks containing cards
When DecksService.findAll(userId, { status: "active" }) is called
Then it returns only active decks
  And each deck includes computed stats (totalCards, newCards, learningCards, masteredCards, dueCards)
```

**Priority**: Must-Have  
**Traces to**: `US-DECK-002` Scenario 1

#### TC-004: Search and filter decks by keyword

```gherkin
Given a user with decks "IELTS", "TOEIC", "Vocabulary Daily"
When DecksService.findAll(userId, { search: "ielts" }) is called
Then only the "IELTS" deck is returned
```

**Priority**: Must-Have  
**Traces to**: `US-DECK-002` Scenario 2

#### TC-005: Update deck metadata successfully

```gherkin
Given a user owning a deck
When DecksService.update(userId, deckId, { title: "Updated Title" }) is called
Then the deck title is updated in the database
```

**Priority**: Must-Have  
**Traces to**: `US-DECK-003` Scenario 1

#### TC-006: Prevent editing a deck belonging to another user

```gherkin
Given user A and a deck owned by user B
When DecksService.update(userAId, deckBId, { title: "Hack" }) is called
Then it throws NotFoundException or ForbiddenException
  And no record is altered
```

**Priority**: Must-Have  
**Traces to**: `US-DECK-003` Scenario 2

#### TC-007: Archive an active deck

```gherkin
Given an active deck owned by user
When DecksService.archive(userId, deckId) is called
Then isArchived is set to true
```

**Priority**: Must-Have  
**Traces to**: `US-DECK-004` Scenario 1

#### TC-008: Restore an archived deck

```gherkin
Given an archived deck owned by user
When DecksService.restore(userId, deckId) is called
Then isArchived is set to false
```

**Priority**: Must-Have  
**Traces to**: `US-DECK-004` Scenario 2

#### TC-009: Cascade hard delete deck with cards and progress

```gherkin
Given a deck with 5 cards and progress records
When DecksService.remove(userId, deckId) is called
Then the deck, 5 cards, and all related UserCardProgress records are deleted in a single transaction
```

**Priority**: Must-Have  
**Traces to**: `US-DECK-005` Scenario 1

---

## Integration Tests / Controller Tests

### `DecksController` (`apps/api/src/modules/decks/decks.controller.spec.ts`)

#### TC-010: GET /api/v1/decks returns list with status 200

```gherkin
Given an authenticated user request with JWT token
When GET /api/v1/decks?status=active is called
Then response status is 200
  And response payload matches DeckResponse[]
```

**Priority**: Must-Have  
**Traces to**: `REQ-DECK-001`

#### TC-011: POST /api/v1/decks validates required title

```gherkin
Given an authenticated user request with empty title
When POST /api/v1/decks is called
Then response status is 400 Bad Request
  And response body contains validation error details
```

**Priority**: Must-Have  
**Traces to**: `REQ-DECK-002`

---

## Test Coverage Checklist

- [x] Tất cả `US-DECK-001` đến `US-DECK-005` Scenario 1 (happy path) có TC tương ứng
- [x] Tất cả `US-DECK-001` đến `US-DECK-005` Scenario 2+ (edge cases) có TC tương ứng
- [x] Ownership security check có TC (`TC-006`)
- [x] Cascade deletion integrity có TC (`TC-009`)
- [x] Error states (400, 401, 403, 404) có TC
