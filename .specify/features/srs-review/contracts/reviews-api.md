# API Contracts: Reviews & Spaced Repetition

All endpoints require `Authorization: Bearer <accessToken>` and are prefixed with `/api/v1/reviews`.

---

## 1. `GET /api/v1/reviews/due`

Fetches prioritized due cards and new cards for review.

### Request

- **Headers**: `Authorization: Bearer <JWT>`
- **Query Parameters**:
  - `deckId` (optional, string, UUID): If provided, filters cards by specific deck.
  - `limit` (optional, number, default: 50, max: 100): Number of cards to fetch.

### Response `200 OK`

```json
{
  "success": true,
  "data": [
    {
      "id": "progress-uuid-1",
      "cardId": "card-uuid-1",
      "deckId": "deck-uuid-1",
      "deckTitle": "IELTS Academic Vocabulary",
      "word": "ubiquitous",
      "meaning": "có mặt ở khắp nơi, phổ biến",
      "phonetic": "/juːˈbɪk.wə.təs/",
      "audioUrl": "https://cdn.example.com/audio/ubiquitous.mp3",
      "exampleSentence": "Smartphones have become ubiquitous in daily life.",
      "collocations": "ubiquitous presence, become ubiquitous",
      "mnemonic": "U bi qui tous -> You be quick to see it everywhere",
      "imageUrl": null,
      "status": "LEARNING",
      "interval": 1,
      "repetitions": 1,
      "easeFactor": 2.5,
      "nextReviewDate": "2026-08-20T08:00:00.000Z"
    }
  ],
  "meta": {
    "totalDue": 12,
    "overdueCount": 4,
    "dueTodayCount": 5,
    "newCount": 3
  }
}
```

---

## 2. `POST /api/v1/reviews/submit`

Submits user rating for a card, recalculating SM-2 interval and updating progress.

### Request

- **Headers**: `Authorization: Bearer <JWT>`, `Content-Type: application/json`
- **Body**:

```json
{
  "cardId": "card-uuid-1",
  "rating": 3
}
```

- **Validation**:
  - `cardId`: UUID, required.
  - `rating`: Integer in range `[1, 2, 3, 4]`, required.

### Response `200 OK`

```json
{
  "success": true,
  "data": {
    "cardId": "card-uuid-1",
    "status": "LEARNING",
    "interval": 6,
    "repetitions": 2,
    "easeFactor": 2.5,
    "lastReviewedAt": "2026-08-20T09:05:00.000Z",
    "nextReviewDate": "2026-08-26T09:05:00.000Z"
  }
}
```

---

## 3. `GET /api/v1/reviews/stats`

Returns high-level retention stats and counts for the authenticated user.

### Response `200 OK`

```json
{
  "success": true,
  "data": {
    "totalCards": 150,
    "dueCount": 12,
    "newCount": 35,
    "learningCount": 68,
    "masteredCount": 47
  }
}
```
