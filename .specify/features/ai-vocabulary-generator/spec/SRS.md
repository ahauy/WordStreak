# Software Requirements Specification (SRS): AI-Assisted Vocabulary Generator

- **Feature Slug**: `ai-vocabulary-generator`
- **Epics**: `EPIC-07` (US-AI-01 & US-AI-02)

---

## Functional Requirements

### REQ-AI-001: Global Dictionary Cache Persistence
- **Category**: Persistence & Caching
- **Priority**: Must-Have
- **Status**: Draft
- **Description**: The system must persist normalized dictionary entries in a global table `global_dictionary_cache` with a unique index on `word` (lowercase, trimmed).
- **Derived from**: BR-AI-001, BR-AI-002, D-GAP-01, ASM-AI-003, ASM-AI-004
- **Business Rules**: BR-AI-001, BR-AI-002, BR-AI-008
- **NFRs**: P95 query response time < 50ms.

### REQ-AI-002: Multi-Tier Generation Service
- **Category**: AI & External Integration
- **Priority**: Must-Have
- **Status**: Draft
- **Description**: When a word is not present in `global_dictionary_cache`, the system must query Google Gemini Flash using a strict JSON schema. If the Gemini API fails, times out (>5s), or encounters a quota limit, the system must automatically fallback to querying the Free Dictionary API (`https://api.dictionaryapi.dev/api/v2/entries/en/<word>`).
- **Derived from**: BR-AI-005, BR-AI-006, F-GAP-01, F-GAP-02, ASM-AI-001, ASM-AI-002
- **Business Rules**: BR-AI-005, BR-AI-006
- **Dependencies**: REQ-AI-001

### REQ-AI-003: Daily User Quota & Burst Rate Limiting
- **Category**: Security & Quota Management
- **Priority**: Must-Have
- **Status**: Draft
- **Description**: The system must enforce a daily quota of 30 *new* AI lookups per authenticated user per UTC day (`00:00 UTC` reset). Cache hits must never decrement the daily quota. The system must also enforce a burst limit of 5 requests per minute per user.
- **Derived from**: BR-AI-003, BR-AI-004, F-GAP-05, ASM-AI-005
- **Business Rules**: BR-AI-003, BR-AI-004

### REQ-AI-004: REST API Endpoint for Card Generation
- **Category**: API Design
- **Priority**: Must-Have
- **Status**: Draft
- **Description**: Provide endpoint `POST /api/v1/ai/generate-card` accepting payload `{ word: string }` and returning status `200 OK` with structured `AiGeneratedCardDto` and metadata `{ isCached: boolean, source: string, remainingDailyQuota: number }`.
- **Derived from**: F-GAP-01, BR-AI-005, ASM-AI-007
- **Business Rules**: BR-AI-001, BR-AI-005

### REQ-AI-005: Interactive Sparkle Auto-Fill UI
- **Category**: Frontend & UX
- **Priority**: Must-Have
- **Status**: Draft
- **Description**: In `AddCardModal` (and `EditCardModal`), provide a `✨ Auto-Fill with AI` button next to the Word input. Clicking the button triggers the generation endpoint, displays an inline pulse animation, populates all form fields upon completion, and keeps all fields fully editable.
- **Derived from**: BR-AI-007, F-GAP-04, ASM-AI-006
- **Business Rules**: BR-AI-007
- **NFRs**: Adheres to WordStreak Minimalist Design System (`apps/web/DESIGN.md`), WCAG 2.1 AA compliant.

### REQ-AI-006: Resilient Error Handling & Zero Data Loss
- **Category**: Error Handling & Resiliency
- **Priority**: Must-Have
- **Status**: Draft
- **Description**: If a word cannot be found by any provider (HTTP 404), or if network/quota errors occur, the UI must display a clear, non-blocking error notice while preserving any text the user has already entered.
- **Derived from**: WF-4, WF-5, WF-6, ASM-AI-008
- **Business Rules**: BR-AI-007
