# Domain Decision Baseline: AI-Assisted Vocabulary Generator & Global Dictionary Cache

**Status**: SIGNED-OFF  
**Version**: 1.0  
**Signed off by**: User (2026-08-21)  
**Feature Slug**: `ai-vocabulary-generator`  
**Target Release**: Sprint 4 (EPIC-07: US-AI-01 & US-AI-02)  

---

## Stage 0 — Intake
- **Classification**: Full Feature (EPIC-07)
- **Protocol**: Full BA Pipeline (Stages 1–8)
- See [00-intake.md](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/.specify/features/ai-vocabulary-generator/00-intake.md).

## Stage 1 & 2 — Business Value & Elicitation
- **Problem**: Manual card creation takes ~90–120s per card. AI generation + shared global caching cuts time by >90% and API fees by 95%.
- **Personas**: Alex (Exam prepper), Minh (Busy professional), Linh (Casual learner).
- **KPIs**: P95 cache hit < 50ms, P95 AI generation < 1500ms, >= 75% cache hit rate.
- See [01-elicitation.md](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/.specify/features/ai-vocabulary-generator/01-elicitation.md).

## Stage 3 — Gap Analysis
- **AS-IS**: Manual entry for all 8 card fields; no AI or dictionary integration.
- **TO-BE**: `✨ Auto-Fill with AI` button populates all fields via `GlobalDictionaryCache` + Gemini Flash + Free Dictionary fallback.
- See [02-gap-analysis.md](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/.specify/features/ai-vocabulary-generator/02-gap-analysis.md).

## Stage 4 — Domain Model & Rules
- **RBAC**: Authenticated learners can generate card data; guest access blocked.
- **Business Rules**: `BR-AI-001` (Word normalization), `BR-AI-002` (Global shared cache), `BR-AI-003` (30 new calls/day quota), `BR-AI-004` (5 req/min burst limit), `BR-AI-005` (Rich payload schema), `BR-AI-006` (Multi-tier fallback), `BR-AI-007` (Non-destructive form fill).
- See [03-domain-model.md](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/.specify/features/ai-vocabulary-generator/03-domain-model.md).

## Stage 5 — Risk Register & MoSCoW
- **Risks**: 5 risks identified with complete mitigations (multi-tier fallback, input sanitization, unique index).
- **MoSCoW**: Must-Have (Cache table, backend generation endpoint, rate limiters, frontend sparkle button), Won't-Have (Custom LLM models, server TTS, Chrome extension).
- See [04-risk-register.md](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/.specify/features/ai-vocabulary-generator/04-risk-register.md).

## Stage 6 & 7 — Specification & Validation
- **Specifications**: [PRD.md](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/.specify/features/ai-vocabulary-generator/spec/PRD.md), [SRS.md](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/.specify/features/ai-vocabulary-generator/spec/SRS.md), [user-stories.md](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/.specify/features/ai-vocabulary-generator/spec/user-stories.md).
- **Validation**: IEEE 29148 check passed 100% with zero traceability gaps. See [validation-report.md](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/.specify/features/ai-vocabulary-generator/validation-report.md) & [traceability-matrix.md](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/.specify/features/ai-vocabulary-generator/traceability-matrix.md).

## Stage 8 — Handover
- See [handover-brief.md](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/.specify/features/ai-vocabulary-generator/handover-brief.md).
