# Domain Model: Community Decks Marketplace (US-ECO-02)

- **Date**: 2026-08-22
- **Feature Slug**: `community-decks`
- **User Story**: `US-ECO-02: Chia sẻ Bộ từ vựng cộng đồng (Community Decks Marketplace)`
- **Status**: COMPLETED

---

## 1. Actor & RBAC Matrix

| Role                      | Browse Marketplace |   Preview Cards   |      Clone Deck       |       Rate / Review Deck       |     Edit / Delete Deck     |
| :------------------------ | :----------------: | :---------------: | :-------------------: | :----------------------------: | :------------------------: |
| **Guest / Anonymous**     |       ✅ Yes       | ✅ First 10 cards |   ❌ Requires Login   |       ❌ Requires Login        |         ❌ Blocked         |
| **Authenticated Learner** |       ✅ Yes       |   ✅ All cards    | ✅ 1-Click Deep Copy  | ✅ Allowed (if cloned/studied) |         ❌ Blocked         |
| **Deck Author / Owner**   |       ✅ Yes       |   ✅ All cards    | ❌ Self-clone blocked |      ❌ Self-rate blocked      |      ✅ Full Control       |
| **System Admin**          |       ✅ Yes       |   ✅ All cards    |      ✅ Allowed       |  ✅ Moderate / Delete Review   | ✅ Archive / Remove Public |

---

## 2. State Machines & Entity Lifecycles

### 2.1. Community Deck Visibility State Machine

```mermaid
stateDiagram-v2
    [*] --> PRIVATE: Create Deck (default isPublic=false)
    PRIVATE --> PUBLIC: Publish to Community (isPublic=true, cardCount > 0)
    PUBLIC --> PRIVATE: Unpublish / Make Private
    PUBLIC --> ARCHIVED: Author archives deck
    PRIVATE --> ARCHIVED: Author archives deck
    ARCHIVED --> [*]: Permanent Delete

    note right of PUBLIC
      Discoverable in /community
      Eligible for ratings & cloning
      Cached stats: cloneCount, averageRating
    end note
```

### 2.2. 1-Click Clone Lifecycle

```mermaid
sequenceDiagram
    autonumber
    actor Learner as Authenticated Learner
    participant Client as Web Frontend (apps/web)
    participant API as NestJS CommunityController
    participant Service as CommunityService
    participant DB as PostgreSQL (Prisma $transaction)

    Learner->>Client: Click "Sao chép vào Bộ từ của tôi"
    Client->>API: POST /api/v1/community/decks/:id/clone
    API->>Service: cloneDeck(userId, targetDeckId)
    Service->>DB: Check targetDeck.isPublic === true && targetDeck.userId !== userId
    alt Is not public or not found
        Service-->>API: 404 NotFound / 403 Forbidden
        API-->>Client: Error Notification
    else Valid Target Deck
        Service->>DB: Begin $transaction
        DB->>DB: 1. Create cloned Deck (userId=learner.id, isPublic=false, originalDeckId=target.id)
        DB->>DB: 2. Bulk copy Cards with new deckId
        DB->>DB: 3. Bulk insert UserCardProgress (status='NEW', easeFactor=2.5, interval=0, reps=0)
        DB->>DB: 4. Increment targetDeck.cloneCount by 1
        DB->>Service: Commit transaction -> Cloned Deck Object
        Service-->>API: { success: true, clonedDeckId, clonedCardsCount, message }
        API-->>Client: 201 Created
        Client->>Learner: Show Success Toast & Redirect / Navigation option
    end
```

---

## 3. Numbered Business Rules (`BR-COMM-###`)

- **`BR-COMM-001` (Marketplace Eligibility)**: A deck is eligible to appear in the Community Marketplace if and only if:
  1. `deck.isPublic === true`
  2. `deck.isArchived === false`
  3. Total cards in deck $\ge 1$.
- **`BR-COMM-002` (Deep Copy Isolation)**: When a deck is cloned:
  1. A new `Deck` is created with `userId = learner.id`, `isPublic = false`, `originalDeckId = sourceDeck.id`.
  2. All `Card` entities are duplicated with new UUIDs and mapped to the new `deckId`.
  3. `UserCardProgress` records are created for all cloned cards with initial SM-2 defaults: `status = 'NEW'`, `easeFactor = 2.5`, `interval = 0`, `repetitions = 0`, `nextReviewDate = now()`.
  4. Modifications in the cloned deck have zero effect on the original deck or other clones.
- **`BR-COMM-003` (Anti-Abuse: Self-Cloning & Self-Rating)**:
  1. A user cannot clone their own deck (`userId !== sourceDeck.userId`). Attempting self-clone returns `400 Bad Request`.
  2. A user cannot rate their own deck (`userId !== sourceDeck.userId`). Attempting self-rate returns `403 Forbidden`.
- **`BR-COMM-004` (Rating Eligibility & Uniqueness)**:
  1. A user may rate a deck only if they have cloned the deck or completed at least 1 study/quiz session on that deck (`UserCardProgress.count > 0` or `originalDeckId === sourceDeck.id`).
  2. Rating is on a discrete scale of $1 \le \text{rating} \le 5$ (integer stars).
  3. Exactly 1 rating record per `(deckId, userId)` pair. Submitting a new rating updates the existing record (upsert semantics).
  4. Optional text comment max length is 500 characters.
- **`BR-COMM-005` (Atomic Rating Denormalization)**:
  Upon any `DeckRating` creation, update, or deletion:
  $$\text{averageRating} = \frac{\sum_{i=1}^{N} \text{rating}_i}{N}, \quad \text{totalRatings} = N$$
  Calculated and stored directly on `Deck.averageRating` (rounded to 1 decimal place) and `Deck.totalRatings` within the rating transaction.
- **`BR-COMM-006` (Marketplace Sorting & Query Optimization)**:
  Marketplace query supports 3 standard sorts:
  - `POPULAR`: Order by `cloneCount DESC, totalRatings DESC, createdAt DESC`.
  - `TOP_RATED`: Order by `averageRating DESC, totalRatings DESC, cloneCount DESC`.
  - `NEWEST`: Order by `createdAt DESC`.
- **`BR-COMM-007` (Public Projection Privacy)**:
  Endpoints returning deck creator info MUST ONLY expose safe public fields (`id`, `name`, `username`, `avatarUrl`). Sensitive fields (`email`, `passwordHash`, `role`, `dailyGoal`, `settings`) MUST NEVER be returned.
- **`BR-COMM-008` (Clone Rate-Limiting)**:
  A single user is rate-limited to a maximum of 5 clone operations per minute to prevent database bloat and bot scraping.

---

## 4. Entity Relationship Diagram (ERD)

```mermaid
erDiagram
    User ||--o{ Deck : "creates"
    User ||--o{ DeckRating : "submits"
    Deck ||--o{ Card : "contains"
    Deck ||--o{ DeckRating : "receives"
    Card ||--o{ UserCardProgress : "tracks"
    User ||--o{ UserCardProgress : "owns"
    Deck ||--o{ Deck : "cloned_from (originalDeckId)"

    User {
        string id PK
        string email
        string username
        string name
        string avatarUrl
    }

    Deck {
        string id PK
        string userId FK
        string title
        string description
        string color
        string icon
        string category
        string tags
        boolean isPublic
        boolean isArchived
        int cloneCount
        float averageRating
        int totalRatings
        string originalDeckId FK
        datetime createdAt
        datetime updatedAt
    }

    DeckRating {
        string id PK
        string deckId FK
        string userId FK
        int rating
        string comment
        datetime createdAt
        datetime updatedAt
    }

    Card {
        string id PK
        string deckId FK
        string word
        string meaning
        string phonetic
        string exampleSentence
        string collocations
        string mnemonic
        string imageUrl
        string audioUrl
    }

    UserCardProgress {
        string id PK
        string userId FK
        string cardId FK
        string status
        int repetitions
        float easeFactor
        int interval
        datetime nextReviewDate
    }
```

---

## 5. Non-Functional Requirements (NFRs)

- **Performance**:
  - Marketplace list response time P95 < 80ms for catalog queries up to 10,000 decks.
  - Clone execution time P95 < 400ms for decks containing up to 300 cards.
- **Security & A11y**:
  - All public search inputs sanitized against SQL / NoSQL / XSS injection.
  - WCAG 2.1 AA compliant color contrasts on rating badges, category tags, and clone action buttons.
  - Keyboard navigation support (`Tab`, `Enter`, `Escape`) for modal previews and star rating selections.
