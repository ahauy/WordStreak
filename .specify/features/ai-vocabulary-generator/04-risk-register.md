# Risk Register & Scope Boundary: AI-Assisted Vocabulary Generator

- **Feature Slug**: `ai-vocabulary-generator`
- **Epics**: `EPIC-07` (US-AI-01: Auto-fill Card Data & US-AI-02: Shared Word Dictionary Cache)

---

## 1. Contradiction Scan

- **Logic Contradictions**: Zero found. Quota tracking explicitly decouples cached reads (0 cost, unlimited) from new AI LLM queries (30/day limit), ensuring zero contradiction between system cost control and user usability.
- **State Deadlocks**: Zero found. Every error state (AI timeout, network failure, quota exceeded, word not found) provides a clean transition back to the user's editable form with zero data loss.
- **Backward Compatibility**: Fully backward compatible. `GlobalDictionaryCache` is a standalone additive table; existing `Card` and `Deck` records are untouched.

---

## 2. Risk Register

| ID | Risk Description | Prob. | Impact | Mitigation Strategy |
| :--- | :--- | :---: | :---: | :--- |
| **RISK-AI-001** | Gemini API outage, network latency, or quota exhaustion | Med | High | Multi-tier fallback: Automatically route query to Free Dictionary API; if all fail, preserve user input and allow manual typing without blocking. |
| **RISK-AI-002** | Prompt injection or malicious / non-word query strings | Med | Med | Strict input sanitization: string trimming, regex validation, max length 64 chars, and structured schema prompt parameters. |
| **RISK-AI-003** | LLM hallucination or imprecise Vietnamese definitions | Low | Med | Strict JSON output schema with specific Vietnamese linguistic prompts; all fields remain fully editable by the learner prior to saving. |
| **RISK-AI-004** | Concurrent write race condition when 2 users query the same uncached word simultaneously | Low | Low | PostgreSQL `@unique` index on `word` + atomic upsert / `ON CONFLICT DO NOTHING` handling in Prisma repository. |
| **RISK-AI-005** | Missing `GEMINI_API_KEY` in local dev or CI test environments | High | Low | Service automatically detects missing key and operates in Free Dictionary fallback / mock mode with zero test suite failures. |

---

## 3. Consolidated Assumptions & Constraints

### Assumptions Log
- **ASM-AI-001**: Google Gemini Flash is the primary LLM provider via official SDK (`@google/genai` or REST).
- **ASM-AI-002**: Free Dictionary API (`api.dictionaryapi.dev`) serves as the secondary zero-cost fallback provider.
- **ASM-AI-003**: The dictionary cache is shared system-wide across all users in `GlobalDictionaryCache`.
- **ASM-AI-004**: Cache queries are keyed by normalized, lowercased, trimmed word strings.
- **ASM-AI-005**: Authenticated users have a quota of 30 new uncached AI generations/day; cache hits are unlimited.
- **ASM-AI-006**: Generated results populate card modal inputs directly with complete user editability before commit.
- **ASM-AI-007**: No user identifiers or PII are stored in the global dictionary cache.
- **ASM-AI-008**: Unknown words degrade gracefully to manual entry without clearing existing user text.

### Technical & System Constraints
- **CON-AI-001**: Response time for cached lookups must be < 50ms; AI generation < 1500ms.
- **CON-AI-002**: Strict adherence to WordStreak Design Tokens (`apps/web/DESIGN.md` & `apps/web/MEMORY.md`): Pure white canvas (`#ffffff`), 1px borders (`#e5e5e5`), Obsidian black pills (`#000000`), zero generic AI slop, stable hover anchors.

---

## 4. MoSCoW Scope Table

### Must-Have (P0 — Non-negotiable for this release)
- [x] Additive `GlobalDictionaryCache` Prisma model and migration.
- [x] Backend `POST /api/v1/ai/generate-card` endpoint with Gemini Flash provider, fallback Free Dictionary provider, and cache repository.
- [x] Rate limiting: 30 new generations/day quota and 5 req/min burst protection.
- [x] Frontend `AddCardModal` Sparkle `✨ Auto-Fill with AI` button with interactive loading and feedback states.
- [x] Auto-populating all core fields: Word, Part of Speech, IPA Phonetics, Vietnamese Meaning, English Meaning, Example Sentence, Example Translation, Collocations, Mnemonic tip, and Audio link.
- [x] Comprehensive Jest and Vitest automated test suites with 100% coverage on cache hit/miss and fallback flows.

### Should-Have (P1 — Important, ready for follow-up)
- [x] Sparkle auto-fill button integrated into `EditCardModal`.
- [x] Subtle cache-hit indicator badge in UI.

### Could-Have (P2 — Candidate for future sprint)
- [ ] Direct in-modal audio preview player for suggested audio URLs.
- [ ] Batch card generator mode (generate 5-10 cards at once from a text list).

### Won't-Have (Out of scope for this release)
- User-level custom fine-tuned LLM models.
- Server-side text-to-speech audio synthesis (deferred to Sprint 5 Voice Recognition).
- Chrome Extension integration (deferred to Sprint 7).
