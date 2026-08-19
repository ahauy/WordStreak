# Quickstart: Contextual Card Creation

## API Testing with cURL

### 1. Create a Card in a Deck

```bash
curl -X POST http://localhost:3000/api/v1/decks/<DECK_ID>/cards \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <ACCESS_TOKEN>" \
  -d '{
    "word": "ephemeral",
    "meaning": "phù du, chóng tàn",
    "phonetic": "/ɪˈfem.ər.əl/",
    "exampleSentence": "Fame in the world of pop is largely ephemeral.",
    "collocations": "ephemeral pleasure, ephemeral nature",
    "mnemonic": "E-fem-eral -> giống như phim (film) ngắn trôi qua nhanh"
  }'
```

### 2. Get Cards in Deck

```bash
curl -X GET http://localhost:3000/api/v1/decks/<DECK_ID>/cards \
  -H "Authorization: Bearer <ACCESS_TOKEN>"
```

### 3. Update Card

```bash
curl -X PATCH http://localhost:3000/api/v1/cards/<CARD_ID> \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <ACCESS_TOKEN>" \
  -d '{
    "meaning": "phù du, sớm nở tối tàn"
  }'
```

### 4. Delete Card

```bash
curl -X DELETE http://localhost:3000/api/v1/cards/<CARD_ID> \
  -H "Authorization: Bearer <ACCESS_TOKEN>"
```
