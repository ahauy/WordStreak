# Handover Brief: Deck Import/Export (CSV, Excel & Anki .apkg)

**Baseline Version**: 1.0-draft (Compiled on 2026-08-21)  
**Spec Documents**:

- [BRD.md](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/.specify/features/deck-import-export/spec/BRD.md)
- [PRD.md](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/.specify/features/deck-import-export/spec/PRD.md)
- [SRS.md](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/.specify/features/deck-import-export/spec/SRS.md) (`REQ-IMP-001` through `REQ-IMP-015`)
- [user-stories.md](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/.specify/features/deck-import-export/spec/user-stories.md) (`US-IMP-001` through `US-IMP-004`)
- [traceability-matrix.md](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/.specify/features/deck-import-export/traceability-matrix.md)

---

## 1. What's Being Built

A bidirectional flashcard migration and data portability suite for WordStreak:

1. **Client-Side Import Wizard (`DeckImportModal`)**:
   - Ingests `.csv`, `.xlsx`, and Anki `.apkg` files up to 15MB / 2,000 cards.
   - Intelligent fuzzy column auto-detection (`term`, `front`, `tu_vung` -> `word`; `back`, `definition`, `nghia` -> `meaning`).
   - Sticky 5-row interactive preview table with validation badges and in-line cell editing.
   - Configurable duplicate resolution strategy (`SKIP` [default], `OVERWRITE`, `KEEP_BOTH`) with per-row overrides.
2. **Backend Atomic Batch Ingestion**:
   - `POST /api/v1/decks/:deckId/cards/bulk` executing all card inserts/updates and SM-2 `UserCardProgress` initialization in `NEW` state within a single Prisma `$transaction`.
3. **Deck Export Modal (`DeckExportModal`)**:
   - Generates RFC 4180 standard CSV files with UTF-8 Byte Order Mark (`\uFEFF`) and formula injection (CWE-1236) escaping.
   - Generates valid Anki `.apkg` packages containing formatted notes and tags.
   - Supports mastery status filtering (`ALL`, `MASTERED`, `LEARNING`).

---

## 2. What's Explicitly Out of Scope

- ❌ Direct private Quizlet scraper / scraping endpoints.
- ❌ Historical Anki review interval/log migration (all cards cleanly reset to `NEW` in WordStreak's SM-2 engine).
- ❌ Document OCR / Image text scanning.

---

## 3. Known Accepted Risks & Mitigations

- **CWE-1236 Formula Injection**: Fully mitigated by prepending `'` to trigger characters (`=`, `+`, `-`, `@`, `\t`, `\r`) during CSV export (`BR-IMP-007`).
- **Vietnamese Diacritics in Excel**: Fully mitigated by prefixing CSV files with UTF-8 BOM (`\uFEFF`) (`BR-IMP-005`).
- **Batch DB Transaction Timeouts**: Guarded by 5,000ms timeout ceiling and bulk `createMany` operations (`BR-IMP-009`).

---

## 4. Next Step

Proceed to Phase 2 (Architecture & Implementation Specs):

- System Architect subagent creates contracts in `packages/shared-types`, technical specification `spec.md`, implementation plan `plan.md`, and task breakdown `tasks.md`.
