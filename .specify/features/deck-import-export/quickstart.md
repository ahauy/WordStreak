# Quickstart & End-to-End Validation Guide: Deck Import/Export

**Feature Slug**: `deck-import-export`  
**Date**: 2026-08-21  
**Status**: APPROVED

---

## 1. Prerequisites & Environment Setup

Ensure the development environment is running with PostgreSQL and dependencies installed:

```bash
# 1. Install dependencies
pnpm install

# 2. Start PostgreSQL container (if not running)
docker compose up -d postgres

# 3. Apply Prisma migrations & generate client
pnpm --filter api prisma:generate
pnpm --filter api prisma:push

# 4. Build shared contracts
pnpm --filter @wordstreak/shared-types build

# 5. Start API and Web servers
pnpm --filter api start:dev
pnpm --filter web dev
```

---

## 2. Automated Test Execution

Run the complete test suite across backend and frontend to verify contracts, unit logic, and integration flows:

```bash
# Run Shared Types Typecheck & Build
pnpm --filter @wordstreak/shared-types typecheck

# Run Backend Unit & Integration Tests (Cards & Decks Bulk Import/Export)
pnpm --filter api test -- cards.service.spec.ts cards.controller.spec.ts decks.controller.spec.ts

# Run Frontend Unit & Component Tests (Parsers, Sanitizers & Wizard Modals)
pnpm --filter web test -- csvParser excelParser ankiParser formulaSanitizer DeckImportModal DeckExportModal
```

---

## 3. End-to-End API Validation (cURL Scenarios)

### Scenario A: Bulk Import Cards into Deck (`POST /api/v1/decks/:deckId/cards/bulk`)

```bash
# 1. Obtain JWT Access Token
TOKEN=$(curl -s -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@wordstreak.com","password":"Password123!"}' \
  | jq -r '.data.accessToken')

# 2. Create Target Test Deck
DECK_ID=$(curl -s -X POST http://localhost:3000/api/v1/decks \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"IELTS Test Import","description":"Deck for testing bulk import"}' \
  | jq -r '.data.id')

# 3. Execute Bulk Import with SKIP Strategy
curl -X POST "http://localhost:3000/api/v1/decks/$DECK_ID/cards/bulk" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "conflictStrategy": "SKIP",
    "cards": [
      {
        "word": "Resilient",
        "meaning": "Có khả năng phục hồi nhanh chóng",
        "phonetic": "/rɪˈzɪl.jənt/",
        "exampleSentence": "She is resilient in the face of adversity."
      },
      {
        "word": "Ubiquitous",
        "meaning": "Có mặt ở khắp mọi nơi",
        "phonetic": "/juːˈbɪk.wə.təs/",
        "exampleSentence": "Smartphones are ubiquitous nowadays."
      }
    ]
  }'
```

**Expected Response (HTTP 200 OK)**:

```json
{
  "success": true,
  "deckId": "<DECK_ID>",
  "totalSubmitted": 2,
  "imported": 2,
  "skipped": 0,
  "overwritten": 0,
  "message": "Đã nhập thành công 2 thẻ từ vựng"
}
```

---

### Scenario B: Deck Export to CSV / JSON (`GET /api/v1/decks/:deckId/export`)

```bash
# Fetch raw deck export payload for client file packaging
curl -s -X GET "http://localhost:3000/api/v1/decks/$DECK_ID/export?status=ALL" \
  -H "Authorization: Bearer $TOKEN" | jq .
```

**Expected Response (HTTP 200 OK)**:

```json
{
  "deck": {
    "id": "<DECK_ID>",
    "title": "IELTS Test Import",
    "description": "Deck for testing bulk import",
    "tags": null,
    "isPublic": false,
    "totalCards": 2
  },
  "cards": [
    {
      "id": "...",
      "word": "Resilient",
      "meaning": "Có khả năng phục hồi nhanh chóng",
      "phonetic": "/rɪˈzɪl.jənt/",
      "exampleSentence": "She is resilient in the face of adversity.",
      "status": "NEW"
    },
    {
      "id": "...",
      "word": "Ubiquitous",
      "meaning": "Có mặt ở khắp mọi nơi",
      "phonetic": "/juːˈbɪk.wə.təs/",
      "exampleSentence": "Smartphones are ubiquitous nowadays.",
      "status": "NEW"
    }
  ]
}
```

---

## 4. UI Walkthrough Scenarios

1. **CSV Import with Auto-Detection**:
   - Open browser to `http://localhost:5173/decks/<DECK_ID>`.
   - Click **"Import Cards"** button.
   - Drag `sample_ielts.csv` into the dropzone.
   - Verify columns map automatically (`Front` -> `word`, `Back` -> `meaning`).
   - Review 5 preview rows and click "Import Cards".
   - Verify success modal displays "2 cards imported" and cards appear in deck view.
2. **Duplicate Conflict Handling**:
   - Re-open "Import Cards" and upload the same CSV.
   - Notice duplicate rows highlighted with amber status badge.
   - Select strategy `SKIP` -> Click Import -> Verify "2 cards skipped".
   - Select strategy `OVERWRITE` -> Click Import -> Verify "2 cards overwritten" and interval is preserved.
3. **Deck Export**:
   - Click **"Export Deck"** in Deck toolbar.
   - Choose **"CSV (Excel Compatible)"** -> Click "Download File".
   - Open downloaded `.csv` in Microsoft Excel to confirm UTF-8 Vietnamese characters render cleanly.
