# 🏛️ Architecture: Official Data Models & Lazy Enrollment (US-LIB-02)

## 1. Overview & Business Problem
In earlier versions of WordStreak, cloning decks from the community performed a deep copy of all cards into the user's account. For official starter libraries consisting of ~4,000 words (TSL 1.2 + NGSL 1.2) across tens of thousands of learners, this would lead to millions of duplicate database rows and severe database bloat.

**US-LIB-02** introduces **Shared Official Cards with Lazy Progress Tracking**:
1. Official cards and decks are shared and immutable.
2. Enrolling in an official deck creates a lightweight `UserDeckEnrollment` record.
3. User SM-2 progress (`UserOfficialCardProgress`) is created only when a card is first reviewed or triaged.
4. Review queues seamlessly merge custom cards and official cards using chronological ordering.
5. Users can still fork any official card into a custom deck via `POST /api/v1/library/cards/:id/fork` when custom notes are needed.

---

## 2. Database Schema

The architecture adds 8 relational models in `apps/api/prisma/schema.prisma`:
- `WordList`: Word list catalog (TSL, NGSL, NAWL, BSL).
- `WordListEntry`: Metadata linking word list entries with rank and frequency.
- `OfficialCard`: Shared card content stored as structured JSON.
- `OfficialDeck`: Official curated deck definition (slug, title, pathCode, level).
- `OfficialDeckCard`: Join table linking decks and cards.
- `UserDeckEnrollment`: Lightweight tracking of user enrollment in an official deck.
- `UserOfficialCardProgress`: Lazy-loaded SuperMemo-2 progress record per user/card.
- `OfficialCardFeedback`: User issue reporting for card corrections.

---

## 3. Review Engine Integration

The `ReviewsService` in `apps/api/src/modules/reviews/reviews.service.ts` supports:
- **Unified Due Queue (`getDueCards`)**: Queries both `UserCardProgress` and `UserOfficialCardProgress`, merges them, and sorts chronologically by `nextReviewDate`.
- **Unified Review Submission (`submitReview`)**: Detects whether a `cardId` belongs to a custom card or an official card. If official, it initializes progress lazily if missing, runs the SM-2 algorithm, updates the progress record, tracks daily streaks, and awards XP.
- **Unified Review Stats & Summary**: Combines total, due, new, learning, and mastered counts across both custom and official cards.

---

## 4. API Endpoints

### Fork Official Card
- **Endpoint**: `POST /api/v1/library/cards/:id/fork`
- **Auth**: Bearer JWT (`JwtAuthGuard`)
- **Body**: `{ "targetDeckId"?: string }`
- **Response**:
```json
{
  "cardId": "uuid",
  "deckId": "uuid",
  "word": "reimburse",
  "meaning": "hoàn trả, thanh toán lại (chi phí)",
  "status": "NEW"
}
```

---

## 5. Verification & Tests

- **Unit Tests**:
  - `apps/api/src/modules/reviews/reviews.service.spec.ts` (`TC-ODA-002`, `TC-ODA-003`, `TC-ODA-004`).
  - `apps/api/src/modules/library/library.service.spec.ts` (`TC-ODA-005`).
- **Full Suite**: 42 test suites, 361 tests in backend, 428 tests workspace-wide passing 100%.
