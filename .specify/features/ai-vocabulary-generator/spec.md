# Specification: AI-Assisted Vocabulary Generator & Global Dictionary Cache

- **Feature**: `ai-vocabulary-generator`
- **Epics**: `EPIC-07` (US-AI-01: Auto-fill Card Data & US-AI-02: Shared Word Dictionary Cache)
- **Status**: SPECIFIED
- **Date**: 2026-08-21

---

## 1. Feature Overview

The **AI-Assisted Vocabulary Generator** accelerates flashcard creation by automatically generating high-quality card data (IPA phonetics, parts of speech, Vietnamese definitions, English nuances, example sentences + translations, collocations, mnemonics, and pronunciation links) from a single English word.

A **Centralized Global Dictionary Cache** stores all generated words in a shared PostgreSQL table across all learners, serving repeat queries in < 50ms with $0 API cost.

---

## 2. User Scenarios & Acceptance Criteria

### User Scenario 1: Fast Card Creation with Sparkle Auto-Fill
- User opens `AddCardModal` in `DeckDetailPage`.
- User types `"resilience"` in the Word input field.
- User clicks the `✨ Auto-Fill with AI` button (or hits Enter).
- The system checks `GlobalDictionaryCache`:
  - If cached: all fields are populated in < 50ms.
  - If uncached: Google Gemini Flash generates structured JSON in ~1.2s, writes to cache, and populates form.
- User edits or confirms fields and clicks "Save" or "Save & Add Next".

### User Scenario 2: High-Availability Fallback
- If Gemini API is unreachable, times out (>5s), or encounters quota exhaustion, the backend automatically invokes the Free Dictionary API (`https://api.dictionaryapi.dev/api/v2/entries/en/<word>`).
- The system parses definitions, phonetics, and examples, and populates the form with a subtle notice: `"Generated using Free Dictionary fallback"`.

### User Scenario 3: Non-Destructive Error Handling
- If the word is invalid, misspelled, or not found by either provider, the system displays an inline warning: `"Word not found. You can fill the fields manually."`
- The user's typed input is preserved and not cleared.

### User Scenario 4: Rate Limiting & Abuse Protection
- Users are granted 30 new uncached AI generations per UTC day.
- Cache hits are unlimited and do not decrement the quota.
- Burst limit of 5 requests/minute prevents automated spam.
- Exceeding limits returns HTTP 429 with clear UI notification.

---

## 3. Architecture & API Contracts

### Endpoints
- `POST /api/v1/ai/generate-card`
  - **Auth**: Protected by `JwtAuthGuard`
  - **Body**: `{ "word": "resilient" }`
  - **Response 200**:
    ```json
    {
      "card": {
        "word": "resilient",
        "partOfSpeech": "adjective",
        "phonetic": "/rɪˈzɪl.jənt/",
        "meaningVi": "kiên cường, có khả năng phục hồi nhanh chóng",
        "meaningEn": "able to quickly return to a previous good condition",
        "exampleSentence": "She is a resilient girl who bounces back from setbacks.",
        "exampleTranslation": "Cô ấy là một cô gái kiên cường luôn vượt qua mọi nghịch cảnh.",
        "collocations": ["resilient economy", "highly resilient", "remain resilient"],
        "mnemonic": "Re (lại) + silent (im lặng) -> dù gặp bão tố vẫn im lặng kiên cường vượt qua.",
        "audioUrl": "https://api.dictionaryapi.dev/media/pronunciations/en/resilient-us.mp3"
      },
      "isCached": true,
      "source": "GEMINI_FLASH",
      "dailyQuotaRemaining": 29,
      "dailyQuotaMax": 30
    }
    ```
  - **Response 404**: `{ "statusCode": 404, "message": "Word not found in dictionary or AI knowledge base", "error": "AI_WORD_NOT_FOUND" }`
  - **Response 429**: `{ "statusCode": 429, "message": "Daily AI generation limit reached (30/30). Cached words remain unlimited!", "error": "AI_DAILY_QUOTA_EXCEEDED" }`
