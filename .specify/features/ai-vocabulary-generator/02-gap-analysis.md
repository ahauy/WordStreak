# Gap Analysis: AI-Assisted Vocabulary Generator & Global Dictionary Cache

- **Feature Slug**: `ai-vocabulary-generator`
- **Epics**: `EPIC-07` (US-AI-01: Auto-fill Card Data & US-AI-02: Shared Word Dictionary Cache)

---

## 1. AS-IS (Current State)

- **Card Creation Flow**:
  - In `AddCardModal.tsx` and `EditCardModal.tsx`, users must manually type every single field: Word, Meaning (Vietnamese), Phonetic (IPA), Example Sentence, Collocations, Mnemonic notes, and Audio URL.
  - Creating a single rich flashcard takes ~90 to 120 seconds.
  - If a user doesn't know the exact IPA transcription or wants a contextual Vietnamese translation with good collocations, they must open external dictionary tabs (Cambridge, Oxford, Glosbe) and copy-paste each field into WordStreak.
- **Backend & Database**:
  - `Card` table exists with fields `word`, `meaning`, `phonetic`, `audioUrl`, `exampleSentence`, `collocations`, `mnemonic`, `imageUrl`.
  - No AI service, no LLM provider integration, no dictionary lookup endpoint, and no global caching table exist.
  - Every card is completely isolated and user-entered from scratch.

---

## 2. TO-BE (Target State)

- **AI-Powered Card Creation Flow**:
  - In `AddCardModal` (and `EditCardModal`), user enters an English word/phrase (e.g. `resilient`) and clicks the `✨ Auto-Fill with AI` button (or hits `Enter`/shortcut).
  - The system checks the `GlobalDictionaryCache` table (<50ms). If found, all fields (IPA `/rɪˈzɪl.jənt/`, Vietnamese definition, English definition, example sentence, Vietnamese translation, collocations, mnemonic tip, and audio URL) are instantly populated into the form.
  - If not cached, the backend invokes Google Gemini Flash with strict JSON schema, stores the verified result in `GlobalDictionaryCache`, and returns the structured payload.
  - If Gemini API is unreachable or rate-limited, it automatically falls back to Free Dictionary API.
  - All populated fields remain fully editable by the user before clicking "Save" or "Save & Add Next".
- **Backend Architecture & Caching**:
  - Dedicated `AiVocabularyModule` (Controller, Service, GeminiProvider, DictionaryProvider, CacheRepository).
  - `GlobalDictionaryCache` table storing normalized words, schema-validated JSON data, hit counters, and source tags.
  - Rate limiting & daily quotas (30 new generations/day per user, cache hits unlimited and free, 5 req/min burst limiter).

---

## 3. Gap Analysis

### 3.1. Functional Gaps
- **F-GAP-01 (AI Generator Endpoint)**: Need `POST /api/v1/ai/generate-card` receiving `{ word: string }`, returning structured card data.
- **F-GAP-02 (Multi-tier Provider)**: Need integration with Google Gemini Flash API (`@google/genai`) and fallback to Free Dictionary API (`api.dictionaryapi.dev`).
- **F-GAP-03 (Global Cache Engine)**: Need lookup, hit counter increment, and upsert logic for `GlobalDictionaryCache`.
- **F-GAP-04 (Frontend Sparkle Button & State)**: Need `Auto-Fill with AI` button in `AddCardModal` with loading pulse, graceful error toasts, and auto-focus transitions.
- **F-GAP-05 (Rate Limiting & Quota)**: Need daily quota tracking (30 new generations/day) and burst protection (5 req/min).

### 3.2. Data Gaps
- **D-GAP-01 (New Table `GlobalDictionaryCache`)**:
  - Add `global_dictionary_cache` model to Prisma schema with `@unique` indexed `word` (lowercase).
  - Include fields: `id`, `word`, `partOfSpeech`, `phonetic`, `meaningVi`, `meaningEn`, `exampleSentence`, `exampleTranslation`, `collocations` (PostgreSQL text array or JSON), `mnemonic`, `audioUrl`, `source`, `hitCount`, `createdAt`, `updatedAt`.
  - Migration script: `add_global_dictionary_cache`.
- **D-GAP-02 (Backward Compatibility)**: Existing cards in `Card` table require zero migration or schema modifications since `GlobalDictionaryCache` is an additive lookup/cache table.

### 3.3. User Impact
- **U-IMP-01 (Zero Disruption)**: Manual card creation continues to work 100% as before. The AI auto-fill is an assistive enhancement.
- **U-IMP-02 (Onboarding & Discoverability)**: Users see the new `✨ Auto-Fill with AI` sparkle button with a helpful tooltip ("Auto-fill definitions, IPA, collocations & examples with AI") on their next visit to `AddCardModal`.

### 3.4. Transition Requirements
- **T-REQ-01 (Database Migration)**: Standard additive Prisma migration `pnpm --filter api prisma migrate dev --name add_global_dictionary_cache`.
- **T-REQ-02 (Environment Variables)**: Add `GEMINI_API_KEY` to backend `.env.example` and runtime configuration. If `GEMINI_API_KEY` is not provided in local dev, system gracefully degrades to Free Dictionary API without crashing.
- **T-REQ-03 (Rollback Plan)**: If AI service has issues, disabling the feature flag or revoking API key causes instant fallback to Free Dictionary API or manual entry without data loss.

