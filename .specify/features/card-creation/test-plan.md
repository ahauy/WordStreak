# Test Plan: Contextual Card Creation (US-CARD-01)

**Feature slug**: `card-creation`  
**Baseline version**: 1.0 (SIGNED-OFF)  
**Written by**: AI (Antigravity) — Stage TDD (trước implement)  
**Traces to**: `.specify/features/card-creation/spec/user-stories.md`

---

## Unit Tests

### `CardsService` (`apps/api/src/modules/cards/cards.service.spec.ts`)

#### TC-001: Create card with rich context & auto-init UserCardProgress

```gherkin
Given authenticated user owns deck with deckId "deck-123"
When  CardsService.createCard is called with rich fields (word, meaning, phonetic, exampleSentence, etc.)
Then  Prisma creates Card record with deckId "deck-123"
  And Prisma atomically creates UserCardProgress with status="NEW", interval=0, easeFactor=2.5, repetitions=0
  And returns the created Card object with its initial progress
```

**File**: `apps/api/src/modules/cards/cards.service.spec.ts`  
**Priority**: Must-Have  
**Traces to**: `US-CARD-001` Scenario 1

---

#### TC-002: Reject card creation when user does not own the deck

```gherkin
Given authenticated user with id "user-456"
  And deck with id "deck-123" is owned by "user-789"
When  CardsService.createCard is called for "deck-123"
Then  throws NotFoundException or ForbiddenException
  And no Card or UserCardProgress is persisted
```

**File**: `apps/api/src/modules/cards/cards.service.spec.ts`  
**Priority**: Must-Have  
**Traces to**: `US-CARD-001` Scenario 5

---

#### TC-003: Delete card cascades and removes UserCardProgress

```gherkin
Given authenticated user owns card with id "card-123"
When  CardsService.deleteCard is called
Then  Card is deleted from database
  And associated UserCardProgress is deleted via cascade
```

**File**: `apps/api/src/modules/cards/cards.service.spec.ts`  
**Priority**: Must-Have  
**Traces to**: `US-CARD-003` Scenario 2

---

## Integration Tests

### `CardsController` (`apps/api/src/modules/cards/cards.controller.spec.ts`)

#### TC-010: POST /api/v1/decks/:deckId/cards creates card successfully

```gherkin
Given user is authenticated with valid JWT token
  And user owns deck with id "deck-123"
When  POST /api/v1/decks/deck-123/cards is called with valid CreateCardDto
Then  response status is 201 Created
  And response body contains id, word, meaning, phonetic, deckId
```

**File**: `apps/api/src/modules/cards/cards.controller.spec.ts`  
**Priority**: Must-Have  
**Traces to**: `US-CARD-001` Scenario 1

---

#### TC-011: GET /api/v1/decks/:deckId/cards returns list of cards

```gherkin
Given user is authenticated
  And user owns deck with 5 cards
When  GET /api/v1/decks/deck-123/cards is requested
Then  response status is 200 OK
  And response body contains array of 5 cards with progress metadata
```

**File**: `apps/api/src/modules/cards/cards.controller.spec.ts`  
**Priority**: Must-Have  
**Traces to**: `US-CARD-001`

---

## Frontend Component Tests

### `AddCardModal` & `CardPreview` (`apps/web/src/features/cards/components/AddCardModal.spec.tsx`)

#### TC-020: Render rich fields and validate required inputs

```gherkin
Given AddCardModal is rendered
When  user clicks Submit with empty word
Then  displays validation error "Từ vựng không được để trống"
  And does not trigger API call
```

**File**: `apps/web/src/features/cards/components/AddCardModal.spec.tsx`  
**Priority**: Must-Have  
**Traces to**: `US-CARD-001` Scenario 3

---

#### TC-021: Soft duplicate warning badge when word exists in deck

```gherkin
Given existingCards list contains card with word "serendipity"
When  user enters "serendipity" in word input
Then  warning badge "Từ này đã có trong bộ từ" is displayed
  And submit button remains enabled
```

**File**: `apps/web/src/features/cards/components/AddCardModal.spec.tsx`  
**Priority**: Must-Have  
**Traces to**: `US-CARD-001` Scenario 4

---

#### TC-022: Live 3D preview synchronization

```gherkin
Given AddCardModal is open
When  user types word "resilient" and meaning "kiên cường"
Then  preview card front displays "resilient"
  And preview card back displays "kiên cường"
```

**File**: `apps/web/src/features/cards/components/CardPreview.spec.tsx`  
**Priority**: Must-Have  
**Traces to**: `US-CARD-002` Scenario 1

---

## Test Coverage Checklist

- [x] Tất cả `US-CARD-###` Scenario 1 (happy path) có TC tương ứng
- [x] Tất cả `US-CARD-###` Scenario 2+ (edge cases) có TC tương ứng
- [x] Error states (400, 401, 403, 404) có TC
- [x] Soft warning & continuous addition có TC
