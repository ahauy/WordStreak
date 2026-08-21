# Domain Decision Baseline: Deck Import/Export (CSV, Excel & Anki .apkg)

**Status**: DRAFT (READY FOR GATE 1 SIGN-OFF)  
**Version**: 1.0-draft  
**Feature Slug**: `deck-import-export`  
**Target Release**: Sprint 6 (EPIC-09: US-ECO-01)  
**Target User Story**: `US-ECO-01: Nhập và xuất dữ liệu Bộ từ (Import/Export CSV & Anki .apkg)`

This document consolidates the end-to-end domain analysis and formal specification compiled by the WordStreak Business Analysis Pipeline (Stages 1 through 8).

---

## Stage 0 — Intake

- **Classification**: Full Feature (EPIC-09: US-ECO-01).
- **Classification Signals**: 2+ domain entities touched, 3+ screens/flows affected, 2 roles, cross-cutting file parsing, formula injection sanitization, atomic transactions.
- **Protocol**: Full Feature Pipeline (Stages 1–8).
- See [00-intake.md](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/.specify/features/deck-import-export/00-intake.md).

## Stage 1 & 2 — Business Value & Elicitation

- **Problem Statement**: Learners with hundreds of existing flashcards in legacy tools (Anki, Quizlet, Excel) face severe friction migrating to WordStreak.
- **Personas**: Alex (Anki power user), Minh (Excel corporate learner), Linh (Community study group leader).
- **KPIs**: P95 client preview < 800ms for 1,000 rows; P95 backend batch commit < 1,500ms for 1,000 cards; > 70% Day 1 migration conversion.
- See [01-elicitation.md](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/.specify/features/deck-import-export/01-elicitation.md).

## Stage 3 — Gap Analysis

- **AS-IS**: Single-card manual creation (`POST /api/v1/cards`) or single-word AI generation; no file ingestion or batch export.
- **TO-BE**: 4-Step Import Wizard (`DeckImportModal`) with file drag-and-drop, fuzzy column auto-mapping, interactive 5-row preview, duplicate conflict handling (`SKIP`, `OVERWRITE`, `KEEP_BOTH`), atomic `$transaction` backend ingestion, and Deck Export modal (`DeckExportModal`) generating CSV (UTF-8 BOM) and Anki `.apkg`.
- See [02-gap-analysis.md](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/.specify/features/deck-import-export/02-gap-analysis.md).

## Stage 4 — Domain Model & Rules

- **RBAC**: Authenticated deck owners can import and export; public community decks exportable for card content without author's private learning progress; unauthenticated guests blocked.
- **Business Rules**:
  - `BR-IMP-001`: Mandatory Field Validation (`word` 1-200 chars, `meaning` 1-2000 chars).
  - `BR-IMP-002`: Maximum Batch Limit (2,000 cards / 15MB file).
  - `BR-IMP-003`: Duplicate Detection (NFC-normalized case-insensitive trimmed matching).
  - `BR-IMP-004`: Conflict Strategies (`SKIP` default, `OVERWRITE`, `KEEP_BOTH`).
  - `BR-IMP-005`: CSV/Excel Delimiter & UTF-8 BOM Standard.
  - `BR-IMP-006`: Anki `.apkg` Extraction & HTML Sanitization.
  - `BR-IMP-007`: CSV Formula Injection (CWE-1236) Defense.
  - `BR-IMP-008`: SM-2 Spaced Repetition Initialization in `NEW` state.
  - `BR-IMP-009`: Atomic Batch Database `$transaction`.
  - `BR-IMP-010`: Rate Limiting & Anti-Abuse (5 req/min, 5,000 cards/day).
- See [03-domain-model.md](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/.specify/features/deck-import-export/03-domain-model.md).

## Stage 5 — Risk Register & MoSCoW

- **Risks**: 5 risks identified and mitigated (file bomb guard, formula injection escaping, interactive transaction timeout, safe skip default, UTF-8 BOM).
- **MoSCoW**: Must-Have (Dropzone, auto-mapping, preview table, conflict handling, bulk API, SM-2 init, CSV & APKG export), Won't-Have (Quizlet scraper, historical revlog sync, OCR document scanner).
- See [04-risk-contradiction.md](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/.specify/features/deck-import-export/04-risk-contradiction.md).

## Stage 6 & 7 — Specification & Validation

- **Specifications**: [BRD.md](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/.specify/features/deck-import-export/spec/BRD.md), [PRD.md](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/.specify/features/deck-import-export/spec/PRD.md), [SRS.md](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/.specify/features/deck-import-export/spec/SRS.md) (`REQ-IMP-001` through `REQ-IMP-015`), [user-stories.md](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/.specify/features/deck-import-export/spec/user-stories.md) (`US-IMP-001` through `US-IMP-004`).
- **Validation**: 100% ISO/IEC/IEEE 29148 compliance with zero traceability gaps.
- See [05-validation.md](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/.specify/features/deck-import-export/05-validation.md) and [traceability-matrix.md](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/.specify/features/deck-import-export/traceability-matrix.md).

## Stage 8 — Handover

- See [handover-brief.md](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/.specify/features/deck-import-export/handover-brief.md).
