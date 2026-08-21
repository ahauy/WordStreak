# Intake: AI-Assisted Vocabulary Generator & Global Dictionary Cache

- **Date**: 2026-08-21
- **Requested by**: Product Roadmap (Sprint 4 — EPIC-07: US-AI-01 & US-AI-02)
- **Classification**: Full Feature
- **Classification signals**:
  - New or changed domain entities: 1 (`GlobalDictionaryCache`)
  - Existing DB schema change required: Yes (`GlobalDictionaryCache` table with indexed word, normalized JSON payload, hit count, timestamps)
  - Screens/flows touched: 2 (`AddCardModal` / `CardEditorForm`, Quick-add AI generator flow in Deck Detail)
  - User roles affected: 1 (Authenticated Learner) + System background caching service
  - Cross-cutting: LLM integration (Gemini / OpenAI), Centralized caching, Rate Limiting & Anti-abuse, Fallback to Free Dictionary API
  - Reversible: Yes
- **Protocol selected**: Full Feature Pipeline (Stages 1–8: Intake → Elicitation → Gap Analysis → Domain Modeling → Risk/Contradictions → Spec Writer → Spec Validator → Handover)
- **Override**: None

## One-line problem statement

Manual flashcard creation is time-consuming (typing IPA, meanings, collocations, examples, and mnemonics takes ~2 minutes per card), leading to user drop-off; automated AI generation combined with a global shared dictionary cache reduces card creation time by 90% and AI provider API costs by up to 95%.
