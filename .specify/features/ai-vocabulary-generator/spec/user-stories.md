# User Stories: AI-Assisted Vocabulary Generator & Global Dictionary Cache

- **Feature Slug**: `ai-vocabulary-generator`
- **Epics**: `EPIC-07` (US-AI-01 & US-AI-02)

---

### US-AI-01: Auto-Fill Flashcard Data with AI (In-Modal Auto-Fill)
**As a** learner building a vocabulary deck  
**I want to** click a single "Auto-Fill with AI" button after typing an English word  
**So that** IPA phonetics, definitions, examples, collocations, and memory tips are filled instantly without manual typing.  
**Traces to**: REQ-AI-002, REQ-AI-004, REQ-AI-005, REQ-AI-006

**Acceptance Criteria**:
- **Scenario 1 (Happy Path - Cache Miss & Gemini AI Generation)**
  - Given I am authenticated and have the `AddCardModal` open
  - And I have typed `"ineffable"` into the Word input field
  - When I click the `✨ Auto-Fill with AI` button
  - Then the button enters a loading state with `"Generating..."` text
  - And within 1.5 seconds, the fields for Part of Speech (`"adjective"`), Phonetic (`"/ɪnˈef.ə.bəl/"`), Meaning (`"không thể diễn tả bằng lời"`), English meaning, Example sentence, Example translation, Collocations, and Mnemonic are populated
  - And all fields remain editable by me before I click "Save".

- **Scenario 2 (Happy Path - Cache Hit Retrieval)**
  - Given the word `"serendipity"` already exists in `GlobalDictionaryCache`
  - When I enter `"serendipity"` and click `✨ Auto-Fill with AI`
  - Then the card fields are populated in < 50ms
  - And my daily generation quota is NOT decremented.

- **Scenario 3 (Edge Case - Fallback to Free Dictionary API)**
  - Given the Gemini API is unreachable or times out (>5s)
  - When I request auto-fill for `"resilience"`
  - Then the backend automatically queries the Free Dictionary API
  - And populates IPA, definitions, and examples
  - And displays a subtle notice: `"Generated using Free Dictionary fallback"`.

- **Scenario 4 (Edge Case - Word Not Found)**
  - Given I enter a non-existent word or random string `"xyzabc99"`
  - When I click `✨ Auto-Fill with AI`
  - Then the system displays an inline warning: `"Word not found. You can fill the fields manually."`
  - And my entered text in the Word input is NOT cleared or lost.

---

### US-AI-02: Shared Global Dictionary Cache Engine
**As a** WordStreak system architect and product owner  
**I want** vocabulary lookups to be cached in a shared global database table  
**So that** repeated lookups across all learners cost $0 in API fees and load sub-50ms.  
**Traces to**: REQ-AI-001, REQ-AI-003, REQ-AI-004

**Acceptance Criteria**:
- **Scenario 1 (Happy Path - Cache Insertion & Hit Counting)**
  - Given Learner A is the first user in the system to query `"ubiquitous"`
  - When the backend generates card data from Gemini Flash
  - Then a new record is created in `global_dictionary_cache` with `word = "ubiquitous"`, `hitCount = 1`, and `source = "GEMINI_FLASH"`
  - And when Learner B later queries `"Ubiquitous"` (with capital U)
  - Then the system normalizes the string to `"ubiquitous"`, fetches the record from `global_dictionary_cache`, increments `hitCount` to 2, and returns without calling Gemini.

- **Scenario 2 (Edge Case - Daily Quota Exceeded)**
  - Given I have already performed 30 new uncached AI generations today
  - When I attempt to generate another uncached word `"flabbergasted"`
  - Then the backend returns HTTP 429 (`AI_DAILY_QUOTA_EXCEEDED`)
  - And the UI displays a toast: `"Daily AI limit reached (30/30). Cached words remain unlimited!"`
  - And I can still generate any words that already exist in the Global Dictionary Cache.

- **Scenario 3 (Edge Case - Concurrent Lookup for Same Uncached Word)**
  - Given two learners query the uncached word `"ephemeral"` at the exact same millisecond
  - When both requests proceed to persist into `global_dictionary_cache`
  - Then the database unique constraint on `word` prevents duplicate rows and both learners receive valid payloads without 500 errors.
