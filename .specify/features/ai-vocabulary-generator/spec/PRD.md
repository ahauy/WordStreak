# Product Requirements Document (PRD): AI-Assisted Vocabulary Generator & Global Dictionary Cache

- **Feature Slug**: `ai-vocabulary-generator`
- **Epics**: `EPIC-07` (US-AI-01: Auto-fill Card Data & US-AI-02: Shared Word Dictionary Cache)
- **Target Release**: Sprint 4

---

## 1. Product Summary & Problem Statement

Creating comprehensive English flashcards manually (IPA phonetics, parts of speech, Vietnamese definitions, English nuances, example sentences, collocations, mnemonics) requires 90–120 seconds of tedious copy-pasting per card.

WordStreak's **AI-Assisted Vocabulary Generator** allows learners to type any English word or phrase and click `✨ Auto-Fill with AI`. The system instantly populates rich card fields. A **Centralized Global Dictionary Cache** ensures instant (<50ms) retrieval for common vocabulary across all learners, reducing API costs by 95% while keeping all fields 100% editable before saving.

---

## 2. Target Personas

- **Alex (Exam Candidate - IELTS/TOEIC)**: Needs accurate academic definitions, standard IPA transcriptions, and natural collocations with 1-click speed.
- **Minh (Busy Professional)**: Needs to build high-quality custom decks in minutes rather than hours.
- **Linh (Casual Learner)**: Relies on mnemonic tips and clear Vietnamese translations to retain difficult vocabulary.

---

## 3. Scope & Feature Boundaries

### In Scope (Must-Have & Should-Have)
- Global Dictionary Cache schema & repository (`GlobalDictionaryCache`).
- Multi-tier backend generation service: Google Gemini Flash (primary) + Free Dictionary API (fallback).
- Frontend `AddCardModal` and `EditCardModal` `✨ Auto-Fill with AI` sparkle button with inline loader and graceful feedback.
- Rich field population: Word, Part of Speech, IPA Phonetics, Vietnamese Meaning, English Meaning, Example Sentence + Translation, Collocations, Mnemonic tip, and Audio link.
- Daily quota tracking (30 new generations/day per user, cache hits unlimited and free) with 5 req/min burst rate limiter.

### Out of Scope (Won't-Have)
- Custom user-tuned LLM models.
- Server-side voice generation (handled client-side in Sprint 5 Voice Recognition).
- Chrome Extension integration (deferred to Sprint 7).

---

## 4. Key Performance Indicators (KPIs)

- **Card Creation Velocity**: Mean card creation time drops from ~90s to < 5s.
- **Cache Hit Efficiency**: >= 75% of lookups served directly from `GlobalDictionaryCache` within 30 days.
- **Latency**: P95 Cache Hit < 50ms; P95 Gemini Generation < 1500ms.
- **Reliability**: 99.9% lookup success with automated Free Dictionary API fallback.
