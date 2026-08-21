# Intake: Deck Import/Export (CSV, Excel & Anki .apkg)

- **Date**: 2026-08-21
- **Requested by**: Product Roadmap (Sprint 6 — EPIC-09: US-ECO-01)
- **Classification**: Full Feature
- **Classification signals**:
  - **New or changed domain entities**: 2+ (`Deck`, `Card`, `UserCardProgress` bulk operations; optional `ImportJob` / `ImportSession` staging DTO)
  - **Existing DB schema change required**: Additive / Minor (Batch insert/upsert operations, performance indexes for bulk card queries)
  - **Screens/flows touched**: 3+ (Deck List / Deck Detail Import Dropzone & Multi-step Wizard: File Upload -> Column Mapping & Preview -> Duplicate Conflict Resolution -> Import Progress/Summary; Deck Export Modal & Download trigger; Card Management bulk actions)
  - **User roles affected**: 2 (Authenticated Learner / Deck Owner, Guest [blocked from import/export], Background File Processing Engine)
  - **Cross-cutting**: File uploads & MIME validation, ZIP/SQLite decompression (`.apkg`), CSV/XLSX RFC 4180 parsing with UTF-8 BOM & Vietnamese diacritics support, CSV formula injection sanitization (`=`, `+`, `-`, `@`), SM-2 algorithm synchronization/conversion from Anki scheduler, atomic bulk DB transactions & rate limiting
  - **Reversible**: Not always (Bulk card imports & duplicate overwrite options alter user deck data irreversibly without backup/rollback mechanisms)
- **Protocol selected**: Full Feature Pipeline (Stages 1–8: Intake → Elicitation → Gap Analysis → Domain Modeling → Risk/Contradictions → Spec Writer → Spec Validator → Handover)
- **Override**: None

## One-line problem statement

Learners currently have to manually input every single flashcard (or generate them card-by-card with AI), creating immense friction and preventing seamless migration from legacy tools like Anki, Quizlet, and Excel spreadsheets; a robust, secure bidirectional Import/Export engine with column mapping preview, duplicate conflict handling, and `.apkg` / `.csv` format interoperability enables 1-click migration of hundreds of cards in under 5 seconds.
