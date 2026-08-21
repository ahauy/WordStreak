# Elicitation Interview: Deck Import/Export (CSV, Excel & Anki .apkg)

- **Date**: 2026-08-21
- **Feature Slug**: `deck-import-export`
- **User Story**: `US-ECO-01: Nhập và xuất dữ liệu Bộ từ (Import/Export CSV & Anki .apkg)`
- **Epic**: Epic 09: Import/Export, Community & Ecosystem | Sprint 6 (Community & Data Portability)
- **Status**: COMPLETED

---

## Stage 1 — Business Value & Personas

### 1. Problem Statement & Pain Points

Flashcard creation in WordStreak currently requires manual input or card-by-card AI generation. Learners with hundreds of existing flashcards in legacy tools (Anki, Quizlet, Excel, CSV files) face a massive switching cost and onboarding barrier. Providing seamless, bidirectional Import and Export allows instant onboarding, zero vendor lock-in, effortless study list sharing, and portable backups.

### 2. Target Personas

- **Alex (Exam Prepper / Anki Power User)**: Has curated 2,000+ IELTS/TOEFL vocabulary cards in Anki (`.apkg`). Wants to migrate all decks into WordStreak without retyping or losing card definitions.
- **Minh (Busy Professional / Corporate Learner)**: Keeps vocabulary lists in Excel spreadsheets / Google Sheets. Wants to copy-paste or upload CSV files with custom headers and map columns directly into new WordStreak decks.
- **Linh (Casual Learner / Community Sharer)**: Wants to export her curated decks into CSV or Anki packages to share with study groups and classmates.

### 3. Success Metrics & KPIs

- **Primary Metric**: > 70% of new users with external flashcard lists successfully migrate their decks on Day 1.
- **Speed & UX Performance**: P95 Client-side parsing & preview of 1,000 rows < 800ms; Server-side batch commit of 1,000 cards < 1,500ms.
- **Data Integrity**: 100% Vietnamese UTF-8 diacritics preservation; 0% CSV formula injection vulnerabilities.

---

## Stage 3 — The 6 Domain Pillars

### Pillar 1 — Personas, Actors & RBAC

- **Q1: Permissions & Deck Access Rules**
  - **Decision**: Authenticated Deck Owners can import into their own decks or create a new deck directly during import. Logged-in users can export their own decks (with optional progress) or public community decks (card content only). Guest / unauthenticated users are blocked and prompted to sign in.

### Pillar 2 — State Machine & Processing Lifecycle

- **Q2: File Processing Architecture**
  - **Decision**: Hybrid Architecture — Client-side parsing (PapaParse for CSV, SheetJS/xlsx for Excel, JSZip + sql.js for Anki `.apkg`) enables instant interactive table preview, fuzzy column auto-detection, and duplicate conflict resolution in the browser. Once confirmed, the sanitized, validated JSON batch is dispatched to `POST /api/v1/decks/:deckId/cards/bulk` executed within an atomic database transaction.

### Pillar 3 — Business Rules & Algorithms

- **Q3: Duplicate Detection & Conflict Resolution Strategy**
  - **Decision**: Configurable in Preview Screen. The user can select a global default rule (`SKIP` [default], `OVERWRITE`, `KEEP_BOTH`) and has granular per-row override switches in the interactive preview table for detected duplicate words (case-insensitive & trimmed comparison against target deck).
- **Q4: Column Auto-Detection & Required Field Fallbacks**
  - **Decision**: Dual path supported:
    1. Direct download of official WordStreak Standard CSV template.
    2. Smart fuzzy column mapper matching common aliases (`word`, `term`, `front`, `vocab`, `tu_vung` -> `word`; `meaning`, `back`, `definition`, `nghia` -> `meaning`).
    - Mandatory fields: `word` (max 200 chars) and `meaning` (max 2,000 chars).
    - Optional fields: `phonetic`, `exampleSentence`, `collocations`, `mnemonic`, `imageUrl`, `audioUrl`.
    - Rows missing mandatory fields are flagged in red and blocked from import until fixed or excluded.
- **Q5: Security & CSV Formula Injection (CWE-1236) Defense**
  - **Decision**: Mandatory cell sanitization. Export prepends single quote `'` to cells starting with `=`, `+`, `-`, `@`, `\t`, `\r`. Import sanitizes dangerous formulas.

### Pillar 4 — Workflows & Edge Cases

- **Q6: Anki `.apkg` Extraction Scope & SM-2 Progress Initialization**
  - **Decision**: Extract note fields (Front, Back, Phonetic, Examples, Tags) from Anki SQLite `notes` and `cards` tables. Strip and sanitize HTML tags (`<br>`, `<div>`, `<b>` -> clean text/markdown). All imported cards initialize cleanly into the `NEW` state (Repetitions = 0, Ease Factor = 2.5, Interval = 0, state = `NEW`) with freshly created `UserCardProgress` records.
- **Q7: Batch Limits, Atomicity & Error Handling**
  - **Decision**: Maximum 2,000 cards per import batch (max file size 15MB). Batch commit is executed in a single Prisma `$transaction` — if any fatal database constraint fails, the batch rolls back completely. Malformed client-side rows are excluded prior to submission.

### Pillar 5 — Entities, Data Boundaries & Export Scope

- **Q8: Export Capabilities & Format Scope**
  - **Decision**: Export supports Standard CSV (`.csv` UTF-8 with BOM) and Anki Deck Package (`.apkg`). Export modal provides scope filters: Export All cards in deck, or filter by mastery status (`ALL`, `MASTERED`, `LEARNING`).

### Pillar 6 — UX & Non-Functional Requirements

- **Q9: Multi-step Guided Import Wizard UX**
  - **Decision**: 4-Step Modal Wizard:
    1. **Upload**: Drag-and-drop zone with format badge indicators, file size validation, sample CSV template download.
    2. **Map & Preview**: Auto-mapped columns with manual dropdown overrides; 5-row interactive sticky preview with status badges (Green = Valid, Amber = Duplicate, Red = Invalid/Missing fields).
    3. **Target & Conflict Strategy**: Choose existing deck or specify title for a new deck; choose duplicate strategy (`SKIP` / `OVERWRITE` / `KEEP_BOTH`).
    4. **Execution & Summary**: Progress bar with live count -> Final outcome dialog with action buttons ("Review Deck", "Done").

---

## Assumptions Confirmed

- **ASM-IMP-001**: Newly imported cards are always initialized in `NEW` state in WordStreak's SM-2 spaced repetition engine (`reps = 0`, `interval = 0`, `easeFactor = 2.5`, `status = 'NEW'`).
- **ASM-IMP-002**: Client-side parsing using lightweight browser libraries (PapaParse, SheetJS, JSZip, sql.js) provides the lowest latency (< 1s preview) and highest server security by avoiding raw file persistence on the backend.
- **ASM-IMP-003**: Column mapping requires at least `word` and `meaning` to be mapped; all other attributes are optional and default to `null` if omitted.

---

## Open Questions & Resolutions

- _All domain pillars confirmed by user — zero blocking open questions._
