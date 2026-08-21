# Elicitation Record: AI-Assisted Vocabulary Generator & Global Dictionary Cache

- **Feature Slug**: `ai-vocabulary-generator`
- **Epics**: `EPIC-07` (US-AI-01: Auto-fill Card Data & US-AI-02: Shared Word Dictionary Cache)
- **Protocol Depth**: Full Feature

---

## Stage 1 — Business Value

- **Problem & Pain Point**:
  - Creating rich vocabulary flashcards manually (typing IPA phonetics, parts of speech, Vietnamese definitions, English nuances, natural example sentences with translations, collocations, and mnemonics) takes ~90–120 seconds per card.
  - This friction causes learner fatigue, limits deck growth, and increases early drop-off.
  - Making raw LLM calls for every single card generation is costly and slow (~1–2 seconds per word).
- **Target Personas**:
  - **Persona A (Alex - Exam Prepper)**: Needs academic IELTS/TOEIC definitions, collocations, and contextual examples with 1-click generation.
  - **Persona B (Minh - Busy Professional)**: Has 5 minutes to create a quick 10-word deck and needs instant, reliable card creation.
  - **Persona C (Linh - Web Reader)**: Wants instant dictionary lookup without typing full explanations manually.
- **Success Metrics**:
  - **Primary**: Reduce card creation time from ~90s to < 5s (>90% time savings).
  - **Operational**: Achieve >= 75% Global Dictionary Cache hit rate for common vocabulary, reducing API costs by 95% and delivering < 50ms response times on cached words.
  - **Reliability**: 99.9% lookup success rate via Gemini Flash with graceful fallback to Free Dictionary API.

---

## 6-Pillar Domain Elicitation

### Pillar 1 — Personas, Actors & RBAC
- **Learner (Authenticated User)**:
  - Can trigger AI vocabulary generation from Card Editor modal (`AddCardModal` / `CardEditorForm`).
  - Has a quota of 30 new LLM generations per calendar day (UTC reset); cache hits are unlimited and free.
  - Has a burst limiter of 5 requests/minute to prevent scripted spam.
- **Guest / Unauthenticated**:
  - Cannot access card creation or AI generation endpoints (protected by `JwtAuthGuard`).
- **System Service**:
  - Automatically reads and populates the `GlobalDictionaryCache` upon successful AI generation or dictionary lookup.
  - Normalizes words (lowercase, trimmed) to maximize cache hits.

### Pillar 2 — State Machine & Lookup Lifecycle
- **States of an AI Lookup Request**:
  1. `IDLE`: User inputs word in the card modal.
  2. `LOOKING_UP_CACHE`: Backend checks `GlobalDictionaryCache` by normalized word.
     - *If HIT*: Increment `hitCount`, return cached data immediately (<50ms).
     - *If MISS*: Proceed to `QUERYING_AI`.
  3. `QUERYING_AI`: Backend checks user daily quota and invokes Google Gemini Flash with strict JSON schema.
     - *If SUCCESS*: Write normalized response to `GlobalDictionaryCache`, return payload to client.
     - *If FAILURE/TIMEOUT/QUOTA*: Transition to `FALLBACK_DICTIONARY`.
  4. `FALLBACK_DICTIONARY`: Backend queries Free Dictionary API (`api.dictionaryapi.dev`).
     - *If SUCCESS*: Construct partial card data, cache it, return to client with notice.
     - *If FAILURE*: Return `WORD_NOT_FOUND` error to frontend.
  5. `POPULATING_FORM`: Frontend receives structured JSON and auto-fills form fields, keeping all fields fully editable.

### Pillar 3 — Business Rules & Algorithms
- **BR-AI-001 (Word Normalization)**: All lookups and cache keys must normalize the input string (`word.trim().toLowerCase()`).
- **BR-AI-002 (Global Shared Cache)**: Cache entries in `GlobalDictionaryCache` are shared across all users. Zero PII or user IDs are attached to cache entries.
- **BR-AI-003 (Daily Generation Quota)**: Free-tier users are granted 30 new LLM generations per day. Cache hits do NOT decrement the quota.
- **BR-AI-004 (Burst Rate Limiting)**: Maximum 5 generation requests per minute per authenticated user.
- **BR-AI-005 (Schema Completeness)**: Full payload includes:
  - `word`: English word/phrase
  - `phonetic`: IPA transcription (e.g., `/ˌsɛr.ənˈdɪp.ə.ti/`)
  - `partOfSpeech`: noun / verb / adjective / adverb / phrase
  - `meaningVi`: Clear Vietnamese definition
  - `meaningEn`: Nuanced English definition
  - `exampleSentence`: Natural English sentence illustrating usage
  - `exampleTranslation`: Vietnamese translation of the example sentence
  - `collocations`: Array of common collocations (e.g., `["pure serendipity", "by serendipity"]`)
  - `mnemonic`: Vietnamese memory hook or etymology tip
  - `audioUrl`: Pronunciation audio link (if available from Free Dictionary API or CDN)

### Pillar 4 — Workflows & Edge Cases
- **WF-1 (Happy Path - Cache Hit)**: User enters "resilient" -> Clicks Sparkle button -> <50ms response -> Fields populated -> User edits/saves card.
- **WF-2 (Happy Path - Cache Miss & AI Generation)**: User enters "ineffable" -> Cache miss -> Gemini Flash structured JSON generated -> Saved to `GlobalDictionaryCache` -> Fields populated.
- **WF-3 (Graceful Fallback)**: Gemini API network timeout -> Backend calls Free Dictionary API -> Returns phonetic, definitions, examples -> Shows subtle info toast "Generated using Free Dictionary fallback".
- **WF-4 (Unknown / Non-existent Word)**: User enters random gibberish -> AI and Dictionary API fail -> Shows helpful error "Word not found. You can fill the fields manually." Form inputs remain intact.
- **WF-5 (Quota Exceeded)**: User exceeds 30 new generations/day -> Attempting uncached word returns `429 Too Many Requests` with friendly message "Daily AI limit reached (30/30). Cached words remain unlimited!"

### Pillar 5 — Entities, Data Boundaries & Privacy
- **Entity: `GlobalDictionaryCache`**:
  - `id`: UUID (Primary Key)
  - `word`: String (Unique, indexed, lowercase)
  - `partOfSpeech`: String?
  - `phonetic`: String?
  - `meaningVi`: String
  - `meaningEn`: String?
  - `exampleSentence`: String?
  - `exampleTranslation`: String?
  - `collocations`: String[]
  - `mnemonic`: String?
  - `audioUrl`: String?
  - `source`: Enum (`GEMINI_FLASH` | `FREE_DICTIONARY` | `MANUAL_CURATED`)
  - `hitCount`: Int (default 1)
  - `createdAt`: DateTime (default now)
  - `updatedAt`: DateTime (@updatedAt)
- **User Activity Quota Tracking**:
  - Tracked in Redis / in-memory cache or `UserActivityLog` keyed by `userId` and current UTC date.
- **Privacy & Safety**:
  - No user deck, card ID, or user information is logged into `GlobalDictionaryCache`.
  - Prompts are strictly sanitized to prevent prompt injection.

### Pillar 6 — UX & Non-Functional Requirements
- **Visual Design**:
  - In `AddCardModal` / `CardEditorForm`: Sparkle icon button (`✨ Auto-Fill with AI`) positioned next to the Word input field.
  - Loading State: Elegant inline pulse animation with subtle disabled state; no modal blocking or screen freeze.
  - Adherence to WordStreak Minimalist Design System (`#ffffff` canvas, 1px `#e5e5e5` borders, Obsidian `#000000` buttons, `Nunito` headings, `Inter` body, stable outer anchors for zero-flicker hover).
- **Performance**:
  - Cache hit response: < 50ms
  - AI generation response: < 1500ms
- **Accessibility**:
  - WCAG 2.1 AA compliant, full keyboard support (`Enter` / shortcut on Sparkle button, clear `aria-label` for screen readers).

---

## Assumptions Confirmed

- **ASM-AI-001**: Google Gemini Flash (via `@google/genai` or standard REST API) is the primary LLM provider due to low latency, high JSON fidelity, and generous free tier.
- **ASM-AI-002**: Free Dictionary API (`https://api.dictionaryapi.dev/api/v2/entries/en/<word>`) is used as a zero-cost fallback if Gemini API is unreachable or rate limited.
- **ASM-AI-003**: The dictionary cache is global across all users to maximize cache efficiency and eliminate duplicate API calls.
- **ASM-AI-004**: Words in the cache are indexed by trimmed, lowercased strings.
- **ASM-AI-005**: Free tier quota is set to 30 new AI generations per day, with cache hits being 100% free and unlimited.
- **ASM-AI-006**: Generated results populate modal form fields directly, allowing manual review and modification prior to saving.
- **ASM-AI-007**: No user PII or sensitive data is included in AI generation requests.
- **ASM-AI-008**: Unknown words or API failures degrade gracefully to manual input without erasing user-entered text.

## Open Questions (Resolved)
- None. All 6 pillars verified and agreed upon.
