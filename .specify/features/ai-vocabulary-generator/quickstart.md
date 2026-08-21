# Quickstart Validation Guide: AI-Assisted Vocabulary Generator

---

## 1. Prerequisites
- Monorepo dependencies installed: `pnpm install`
- PostgreSQL running locally (Docker or native)
- Backend API running on port 3000 (`pnpm --filter api dev`)
- Frontend Web running on port 5173 (`pnpm --filter web dev`)
- Optional: `GEMINI_API_KEY` in `apps/api/.env` (if omitted, falls back to Free Dictionary API)

---

## 2. API Validation (cURL)

```bash
# 1. Login to obtain JWT Token
JWT_TOKEN=$(curl -s -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Password123!"}' | jq -r '.data.accessToken')

# 2. Test Uncached Word Generation
curl -X POST http://localhost:3000/api/v1/ai/generate-card \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -d '{"word":"ubiquitous"}' | jq .

# 3. Test Cached Word Retrieval (<50ms)
curl -X POST http://localhost:3000/api/v1/ai/generate-card \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -d '{"word":"ubiquitous"}' | jq .
```

---

## 3. UI Validation
1. Navigate to `http://localhost:5173/decks` and open any Deck.
2. Click **"Thêm thẻ mới" (Add Card)**.
3. Type `"serendipity"` into the Word input field.
4. Click the **"✨ Auto-Fill with AI"** button.
5. Verify:
   - Button shows `"Đang tạo..."` with animated pulse.
   - Within 1.5s, Meaning (`sự tình cờ may mắn`), IPA (`/ˌser.ənˈdɪp.ə.ti/`), Example sentence, Collocations, and Mnemonic are filled.
   - Click "Lưu thẻ" (Save Card) to successfully create the card.
