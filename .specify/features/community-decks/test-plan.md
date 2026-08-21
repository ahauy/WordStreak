# Test Plan: Community Decks Marketplace (US-ECO-02)

**Feature slug**: `community-decks`  
**Baseline version**: 1.0 (SIGNED-OFF)  
**Written by**: AI (Antigravity) — Stage TDD (Pre-implementation)  
**Traces to**: `.specify/features/community-decks/spec/user-stories.md`

---

## Unit & Service Tests

### `CommunityService`

#### TC-001: Query Public Community Decks with Search, Category & Sorting

```gherkin
Given public decks exist with various categories, clone counts, and ratings
When  `getPublicDecks()` is invoked with category='IELTS' and sort='POPULAR'
Then  only public, non-archived decks matching category 'IELTS' are returned
  And items are ordered by descending cloneCount
  And sensitive author fields (email, password) are omitted
```

**File**: `apps/api/src/modules/community/community.service.spec.ts`  
**Priority**: Must-Have  
**Traces to**: `US-ECO-02` Scenario 1 & `BR-COMM-001`, `BR-COMM-006`, `BR-COMM-007`

---

#### TC-002: Query Public Deck Detail with Card Previews

```gherkin
Given a public deck with 30 cards
When  `getPublicDeckDetail(deckId)` is invoked
Then  the deck metadata, creator profile, and all 30 cards are returned
  And user-specific fields (hasCloned, userRating) are populated if userId is provided
```

**File**: `apps/api/src/modules/community/community.service.spec.ts`  
**Priority**: Must-Have  
**Traces to**: `US-ECO-02` Scenario 2

---

#### TC-003: 1-Click Clone Deck (Atomic Deep Copy & SM-2 Initialization)

```gherkin
Given an authenticated learner and a target public deck with 20 cards
When  `cloneDeck(userId, targetDeckId)` is invoked
Then  a new Deck is created for the learner with isPublic=false and originalDeckId=targetDeckId
  And 20 duplicate Card records are created linked to the new deck
  And 20 UserCardProgress records are created in 'NEW' state (interval=0, reps=0, easeFactor=2.5)
  And the target deck's cloneCount increments by 1
```

**File**: `apps/api/src/modules/community/community.service.spec.ts`  
**Priority**: Must-Have  
**Traces to**: `US-ECO-02` Scenario 3 & `BR-COMM-002`

---

#### TC-004: Anti-Abuse - Block Author Self-Cloning

```gherkin
Given an author who owns public deck D-1
When  `cloneDeck(authorId, D-1.id)` is invoked
Then  the service throws BadRequestException ('Bạn không thể sao chép bộ từ của chính mình')
```

**File**: `apps/api/src/modules/community/community.service.spec.ts`  
**Priority**: Must-Have  
**Traces to**: `US-ECO-02` Scenario 4 & `BR-COMM-003`

---

#### TC-005: 5-Star Rating Submission & Atomic Average Recalculation

```gherkin
Given a learner who has cloned or studied deck D-1
When  `rateDeck(userId, D-1.id, { rating: 5, comment: 'Great deck' })` is invoked
Then  a DeckRating record is created/updated (upsert)
  And Deck.averageRating and Deck.totalRatings are recalculated atomically in database
  And the response returns the updated average rating and total ratings count
```

**File**: `apps/api/src/modules/community/community.service.spec.ts`  
**Priority**: Must-Have  
**Traces to**: `US-ECO-02` Scenario 5 & `BR-COMM-004`, `BR-COMM-005`

---

#### TC-006: Anti-Abuse - Block Author Self-Rating

```gherkin
Given the author of deck D-1
When  `rateDeck(authorId, D-1.id, { rating: 5 })` is invoked
Then  the service throws ForbiddenException ('Tác giả không thể tự đánh giá bộ từ của mình')
```

**File**: `apps/api/src/modules/community/community.service.spec.ts`  
**Priority**: Must-Have  
**Traces to**: `US-ECO-02` Scenario 6 & `BR-COMM-003`

---

## Component & Frontend Tests

### `CommunityDecksPage`

#### TC-010: Renders Marketplace Grid & Search/Filter Controls

```gherkin
Given the /community route is mounted
When  mock public decks are loaded
Then  the search bar, category chips, and sort dropdown are rendered
  And deck cards display title, category, star rating, clone count, and creator avatar
```

**File**: `apps/web/src/features/community/pages/CommunityDecksPage.spec.tsx`  
**Priority**: Must-Have  
**Traces to**: `US-ECO-02` Scenario 1

---

### `CommunityDeckPreviewModal`

#### TC-011: Renders Card Preview Table & Triggers Clone Action

```gherkin
Given a selected public deck in CommunityDeckPreviewModal
When  the modal opens
Then  card words, phonetic, and meanings are visible
When  user clicks 'Sao chép vào Bộ từ của tôi'
Then  the clone API is called and a success message is displayed
```

**File**: `apps/web/src/features/community/components/CommunityDeckPreviewModal.spec.tsx`  
**Priority**: Must-Have  
**Traces to**: `US-ECO-02` Scenario 2 & 3

---

### `RateDeckModal`

#### TC-012: Selects Star Rating and Submits Feedback

```gherkin
Given RateDeckModal is opened for a cloned deck
When  user clicks the 4th star and types feedback
  And clicks 'Gửi đánh giá'
Then  the rating API is called with rating=4
```

**File**: `apps/web/src/features/community/components/RateDeckModal.spec.tsx`  
**Priority**: Must-Have  
**Traces to**: `US-ECO-02` Scenario 5

---

## Test Coverage Checklist

- [x] Tất cả `US-ECO-02` Scenario 1 (happy path) có TC tương ứng (TC-001, TC-010)
- [x] Tất cả `US-ECO-02` Scenario 2 (preview cards) có TC tương ứng (TC-002, TC-011)
- [x] Tất cả `US-ECO-02` Scenario 3 (clone cards) có TC tương ứng (TC-003, TC-011)
- [x] Tất cả `US-ECO-02` Scenario 4 (anti-abuse self clone) có TC tương ứng (TC-004)
- [x] Tất cả `US-ECO-02` Scenario 5 (rating upsert) có TC tương ứng (TC-005, TC-012)
- [x] Tất cả `US-ECO-02` Scenario 6 (anti-abuse self rating) có TC tương ứng (TC-006)
- [x] Business rules có anti-abuse đã có TC kiểm tra
