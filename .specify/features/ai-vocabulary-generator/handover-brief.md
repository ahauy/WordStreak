# Handover Brief: AI-Assisted Vocabulary Generator & Global Dictionary Cache

- **Baseline Version**: 1.0 (Draft for Gate 1 Review)
- **Date**: 2026-08-21
- **Feature Slug**: `ai-vocabulary-generator`
- **Epics**: `EPIC-07` (US-AI-01 & US-AI-02)
- **Spec Documents**:
  - [PRD.md](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/.specify/features/ai-vocabulary-generator/spec/PRD.md)
  - [SRS.md](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/.specify/features/ai-vocabulary-generator/spec/SRS.md)
  - [user-stories.md](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/.specify/features/ai-vocabulary-generator/spec/user-stories.md)
- **Traceability Matrix**: [traceability-matrix.md](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/.specify/features/ai-vocabulary-generator/traceability-matrix.md)
- **Validation Report**: [validation-report.md](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/.specify/features/ai-vocabulary-generator/validation-report.md)

---

## 1. What's Being Built
1. **Shared Global Dictionary Cache Engine**: Standalone `GlobalDictionaryCache` table storing normalized English vocabulary payloads (IPA phonetics, parts of speech, Vietnamese definitions, English nuances, example sentences + translations, collocations, mnemonics, audio URLs) shared across all learners, serving repeat queries in < 50ms with $0 API cost.
2. **Multi-Tier Backend Generation Service**: `POST /api/v1/ai/generate-card` with Google Gemini Flash as primary provider and automatic fallback to Free Dictionary API on timeouts/network errors, protected by a 30 new calls/day quota and 5 req/min burst limiter.
3. **Interactive Sparkle Auto-Fill Frontend**: `✨ Auto-Fill with AI` button inside `AddCardModal` and `EditCardModal` that smoothly populates form fields while preserving 100% manual editability and preventing text loss on errors.

---

## 2. What's Explicitly Out of Scope (Won't-Have)
- Custom user-tuned LLM models.
- Server-side text-to-speech generation (handled client-side in Sprint 5 Voice Recognition).
- Chrome Extension integration (scheduled for Sprint 7).

---

## 3. Known Accepted Risks & Mitigations
- **RISK-AI-001 (Gemini Outage/Timeout)**: Mitigated by automatic fallback to Free Dictionary API.
- **RISK-AI-002 (Prompt Injection)**: Mitigated by input sanitization, regex checks, and strict JSON output schemas.
- **RISK-AI-004 (Concurrency on Cache Insert)**: Mitigated by unique DB constraints and atomic upsert operations.

---

## 4. Next Step
Upon user sign-off at **Confirmation Gate 1**, advance to **Phase 2–4: Speckit Technical Planning** (`speckit-specify`, `speckit-plan`, `speckit-tasks`).
