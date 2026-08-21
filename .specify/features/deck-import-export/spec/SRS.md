# Software Requirements Specification (SRS)

## Feature: Deck Import/Export (CSV, Excel & Anki .apkg)

- **Feature Slug**: `deck-import-export`
- **Epic**: EPIC-09: Import/Export, Community & Ecosystem | Sprint 6
- **Target User Story**: `US-ECO-01: Nhập và xuất dữ liệu Bộ từ`
- **Version**: 1.0
- **Status**: APPROVED FOR IMPLEMENTATION
- **Date**: 2026-08-21

---

## 1. System Requirements & Functional Specifications

### REQ-IMP-001: Multi-Format File Dropzone & Validation

- **Category**: Frontend / UI Ingestion
- **Priority**: Must-Have
- **Status**: Ready
- **Description**: The system must provide a drag-and-drop file upload zone accepting `.csv`, `.xlsx`, and `.apkg` files with a maximum file size limit of 15MB. Files with invalid MIME types or exceeding 15MB must be immediately rejected with an inline error message without uploading to the server.
- **Derived from**: `BR-IMP-002`, `BR-IMP-005`, `RISK-IMP-001`
- **Business Rules**: `BR-IMP-002`

### REQ-IMP-002: CSV/XLSX In-Browser Parsing & Delimiter Detection

- **Category**: Frontend / Data Parser
- **Priority**: Must-Have
- **Status**: Ready
- **Description**: The system must parse CSV and XLSX files in-memory in the browser using PapaParse and SheetJS. The parser must automatically detect column delimiters (comma, semicolon, tab, pipe), handle quoted multiline strings, support UTF-8 BOM, and preserve Vietnamese diacritics.
- **Derived from**: `BR-IMP-005`, `ASM-IMP-002`, `RISK-IMP-005`
- **Business Rules**: `BR-IMP-005`

### REQ-IMP-003: Anki `.apkg` Archive Extraction & SQLite Querying

- **Category**: Frontend / Data Parser
- **Priority**: Must-Have
- **Status**: Ready
- **Description**: The system must decompress Anki `.apkg` zip archives in-memory using JSZip and query the embedded `collection.anki2` or `collection.anki21` SQLite database via sql.js/WASM to extract card notes, field strings (`\x1f` separated), and tags.
- **Derived from**: `BR-IMP-006`, `ASM-IMP-002`
- **Business Rules**: `BR-IMP-006`

### REQ-IMP-004: Anki HTML Sanitization & Markdown Conversion

- **Category**: Security / Data Normalization
- **Priority**: Must-Have
- **Status**: Ready
- **Description**: The parser must sanitize HTML formatting from Anki notes, converting `<br>`/`<div>` to newlines, converting formatting tags (`<b>`, `<i>`) to Markdown, converting cloze syntax `{{c1::answer}}` to plain text, and stripping malicious tags (`<script>`, `<iframe>`, `<style>`).
- **Derived from**: `BR-IMP-006`
- **Business Rules**: `BR-IMP-006`

### REQ-IMP-005: Intelligent Fuzzy Column Auto-Detection

- **Category**: Frontend / Column Mapping
- **Priority**: Must-Have
- **Status**: Ready
- **Description**: The system must analyze detected file headers and automatically match them against WordStreak fields using alias dictionaries (e.g. `word`, `term`, `front`, `tu_vung` -> `word`; `meaning`, `back`, `definition`, `nghia` -> `meaning`). Users must be able to manually override column mappings via interactive dropdown selectors.
- **Derived from**: `BR-IMP-001`, `ASM-IMP-003`
- **Business Rules**: `BR-IMP-001`

### REQ-IMP-006: Interactive 5-Row Preview Table & Validation Badges

- **Category**: Frontend / Data Preview
- **Priority**: Must-Have
- **Status**: Ready
- **Description**: The wizard must display a sticky interactive preview table rendering the first 5 rows with total count, displaying real-time validation badges: Green (Valid), Amber (Duplicate), and Red (Missing required `word` or `meaning`).
- **Derived from**: `BR-IMP-001`, `BR-IMP-003`
- **Business Rules**: `BR-IMP-001`, `BR-IMP-003`

### REQ-IMP-007: In-Line Row Editing & Exclusion in Preview Wizard

- **Category**: Frontend / UX
- **Priority**: Should-Have
- **Status**: Ready
- **Description**: Users must be able to click directly on table cells in the preview step to fix invalid words/meanings or uncheck specific rows to exclude them from the import batch.
- **Derived from**: `BR-IMP-001`
- **Business Rules**: `BR-IMP-001`

### REQ-IMP-008: Client-Side Duplicate Detection Against Target Deck

- **Category**: Core Logic / Deduplication
- **Priority**: Must-Have
- **Status**: Ready
- **Description**: The client must compare parsed incoming words against the target deck's existing card index using case-insensitive, whitespace-trimmed, NFC-normalized string comparison, as well as detecting intra-file duplicate rows.
- **Derived from**: `BR-IMP-003`
- **Business Rules**: `BR-IMP-003`

### REQ-IMP-009: Configurable Duplicate Conflict Resolution

- **Category**: Core Logic / Deduplication
- **Priority**: Must-Have
- **Status**: Ready
- **Description**: The system must allow users to choose a global duplicate conflict strategy (`SKIP` [default], `OVERWRITE`, or `KEEP_BOTH`), and provide per-row override switches for each detected duplicate in the preview table.
- **Derived from**: `BR-IMP-004`, `RISK-IMP-004`
- **Business Rules**: `BR-IMP-004`

### REQ-IMP-010: Backend Atomic Batch Card Ingestion Endpoint

- **Category**: Backend / REST API
- **Priority**: Must-Have
- **Status**: Ready
- **Description**: The API must expose `POST /api/v1/decks/:deckId/cards/bulk` accepting `{ cards: CardBatchItemDto[], conflictStrategy: ConflictStrategyEnum }`. The backend must verify deck ownership and execute all insertions/updates in a single Prisma interactive `$transaction` with zero partial state on failure.
- **Derived from**: `BR-IMP-009`, `RISK-IMP-003`
- **Business Rules**: `BR-IMP-009`

### REQ-IMP-011: Automatic SM-2 `UserCardProgress` Initialization

- **Category**: Gamification / SM-2 Engine
- **Priority**: Must-Have
- **Status**: Ready
- **Description**: For every newly inserted card, the backend must create an associated `UserCardProgress` record initialized with `status: 'NEW'`, `repetitions: 0`, `interval: 0`, `easeFactor: 2.5`, and `nextReviewDate: now()`, immediately making cards available in the study queue.
- **Derived from**: `BR-IMP-008`, `ASM-IMP-001`
- **Business Rules**: `BR-IMP-008`

### REQ-IMP-012: CSV Formula Injection (CWE-1236) Defense

- **Category**: Security
- **Priority**: Must-Have
- **Status**: Ready
- **Description**: When generating export CSV files, any cell starting with `=`, `+`, `-`, `@`, `\t`, or `\r` must be escaped by prepending a single quote `'`. During import, dangerous formulas must be sanitized to prevent code execution in spreadsheet applications.
- **Derived from**: `BR-IMP-007`, `RISK-IMP-002`
- **Business Rules**: `BR-IMP-007`

### REQ-IMP-013: Deck Export to CSV with UTF-8 BOM & Mastery Filtering

- **Category**: Data Portability / Export
- **Priority**: Must-Have
- **Status**: Ready
- **Description**: The system must provide a Deck Export modal generating RFC 4180 compliant CSV files encoded in UTF-8 with Byte Order Mark (`\uFEFF`), supporting mastery filter chips (`ALL`, `MASTERED`, `LEARNING`).
- **Derived from**: `BR-IMP-005`, `BR-IMP-007`, `RISK-IMP-005`
- **Business Rules**: `BR-IMP-005`, `BR-IMP-007`

### REQ-IMP-014: Deck Export to Anki `.apkg` Package

- **Category**: Data Portability / Export
- **Priority**: Must-Have
- **Status**: Ready
- **Description**: The system must package deck flashcards into a valid Anki `.apkg` zip archive containing a generated `collection.anki2` SQLite database with standard Basic note types, compatible with Anki 2.1+ desktop and mobile apps.
- **Derived from**: `BR-IMP-006`
- **Business Rules**: `BR-IMP-006`

### REQ-IMP-015: Rate Limiting, Anti-Abuse & Observability

- **Category**: Non-Functional / Security & Ops
- **Priority**: Must-Have
- **Status**: Ready
- **Description**: The API must enforce rate limits (5 requests/min per IP/User, max 5,000 cards/day for free users) and log structured audit events (`DECK_IMPORT_BATCH`, `DECK_EXPORT_FILE`) with latency and count telemetry.
- **Derived from**: `BR-IMP-010`, `RISK-IMP-001`, `RISK-IMP-003`
- **Business Rules**: `BR-IMP-010`
