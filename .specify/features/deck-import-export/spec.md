# Feature Specification: Deck Import & Export (CSV, Excel & Anki .apkg)

**Feature Branch**: `feat/deck-import-export`  
**Created**: 2026-08-21  
**Status**: Ready for Planning (Gate 2)  
**Input**: US-ECO-01: Nhập và xuất dữ liệu Bộ từ (Import/Export CSV, Excel & Anki .apkg) — Baseline & SRS Specifications

---

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Ingest Flashcards from CSV / Excel with Interactive Column Mapping (Priority: P1) 🎯 MVP

**User Journey**:  
As an Authenticated Learner, I want to drag and drop a `.csv` or `.xlsx` file into a 4-step modal wizard, have columns automatically mapped to card fields with a 5-row preview table, and bulk-import the cards into my deck so that I can onboard hundreds of vocabulary words in seconds.

**Why this priority**:  
P1 is the absolute minimum viable product (MVP). Most learners maintain word lists in spreadsheets (Excel/Google Sheets/CSV). Ingesting standard tabular formats instantly unlocks migration into WordStreak.

**Independent Test**:  
Can be verified independently by dropping a valid CSV/XLSX file with header row (`Front,Back,Phonetic,Example`) into `DeckImportModal`, checking auto-mapped fields, verifying the 5-row interactive preview, clicking "Import", and confirming that cards are created in the database and initialized in the `NEW` study queue.

**Acceptance Scenarios**:

1. **Given** an authenticated user viewing a deck with 0 cards, **When** they drop a CSV file containing 100 vocabulary rows with headers `Front`, `Back`, `IPA`, **Then** the parser parses in < 500ms, auto-maps `Front` → `word`, `Back` → `meaning`, `IPA` → `phonetic`, shows a 5-row preview with green "Valid" badges, and upon confirmation, creates 100 cards with initial SM-2 progress.
2. **Given** an uploaded CSV file with missing `meaning` column mapping, **When** the user is on the mapping screen, **Then** the `meaning` field shows a red required warning, all rows show invalid status badges, and the "Proceed" button is disabled until mapped.
3. **Given** a row in the preview table with an empty `word` cell, **When** the user clicks the cell and types "Ubiquitous", **Then** the row status updates to "Valid" dynamically without re-uploading the file.

---

### User Story 2 - Duplicate Detection & Configurable Conflict Resolution (Priority: P2)

**User Journey**:  
As a Deck Owner importing cards into an existing deck, I want the system to detect words that already exist in my deck and allow me to choose how to handle them (`SKIP` [default], `OVERWRITE`, or `KEEP_BOTH`) globally and per-row so that I avoid unwanted duplication or update stale definitions safely.

**Why this priority**:  
P2 ensures data integrity when importing into non-empty decks. Without conflict handling, re-importing updated lists would either crash or corrupt learning histories.

**Independent Test**:  
Can be verified by importing a file containing duplicate words into a deck with existing cards, verifying amber warning badges in preview, testing each strategy (`SKIP` leaves old card untouched, `OVERWRITE` updates content while keeping SM-2 interval, `KEEP_BOTH` creates new duplicate UUID), and verifying the final import summary count.

**Acceptance Scenarios**:

1. **Given** target deck contains "Resilient" (reviewed 5 times, interval 10 days), **When** importing a CSV with "Resilient" under `SKIP` strategy, **Then** the card is skipped, existing progress is preserved, and summary reports `skipped: 1`.
2. **Given** target deck contains "Ephemeral" with meaning "ngắn ngủi", **When** importing with `OVERWRITE` strategy and new meaning "tạm thời, phù du", **Then** the card meaning is updated to "tạm thời, phù du" while preserving its SM-2 review progress and interval.
3. **Given** a duplicate row in preview table with global `SKIP`, **When** the user toggles that single row's action switch to `OVERWRITE`, **Then** only that specific row is overwritten upon batch commit.

---

### User Story 3 - Migrate Anki `.apkg` Decks with HTML Sanitization (Priority: P3)

**User Journey**:  
As an Anki Power User, I want to upload an Anki `.apkg` package file, extract card notes from the embedded SQLite database, sanitize HTML formatting into clean Markdown, and import them into a new or existing deck.

**Why this priority**:  
P3 caters to advanced language learners who possess large Anki decks. Anki `.apkg` is the dominant open flashcard export format globally.

**Independent Test**:  
Can be verified by dropping a valid `.apkg` file containing 200 notes with HTML formatting (`<b>`, `<br>`, `<div>`, cloze syntax), verifying client-side decompression and SQLite extraction via WASM, verifying clean Markdown in preview, and confirming cards are cleanly created in the database.

**Acceptance Scenarios**:

1. **Given** an Anki `.apkg` export with notes formatted with `<br>` and `<b>` tags, **When** uploaded to the import wizard, **Then** JSZip decompresses the archive, sql.js queries `collection.anki2`, HTML is converted (`<br>` → `\n`, `<b>` → `**`), cloze markup is normalized, and all cards preview cleanly.
2. **Given** a corrupted `.apkg` file (missing `collection.anki2`), **When** dropped into the dropzone, **Then** the parser safely catches the error and shows a user-friendly error toast without crashing the wizard.

---

### User Story 4 - Export Deck to Standard CSV & Anki `.apkg` with Formula Defense (Priority: P4)

**User Journey**:  
As an Authenticated User, I want to export any deck I own (or public community deck) to RFC 4180 CSV (with UTF-8 BOM) or Anki `.apkg` with optional mastery filters (`ALL`, `MASTERED`, `LEARNING`) so that I can have portable backups, study in Excel with Vietnamese diacritics, or share with Anki users.

**Why this priority**:  
P4 completes the bidirectional ecosystem loop. Users gain data sovereignty and portability, reducing lock-in anxiety.

**Independent Test**:  
Can be verified by opening `DeckExportModal` on a deck with Vietnamese words, choosing CSV, downloading the file, checking for `\uFEFF` BOM in a hex viewer/Excel, verifying formula triggers (`=`, `+`, `-`, `@`) are escaped with `'`, and choosing Anki `.apkg` export and opening the result in Anki desktop.

**Acceptance Scenarios**:

1. **Given** a deck containing cards with Vietnamese text (e.g., "Kiên cường"), **When** exported as CSV, **Then** the downloaded file begins with UTF-8 BOM (`\uFEFF`), fields with commas/newlines are properly quoted, and opening in Excel renders Vietnamese characters correctly.
2. **Given** a card whose definition begins with `=CMD|' /C calc'!A0`, **When** exported to CSV, **Then** the generated cell is escaped as `'=CMD|' /C calc'!A0` (CWE-1236 defense).
3. **Given** a deck with 50 cards (20 Mastered, 30 Learning), **When** user selects filter "Mastered Only" and exports to `.apkg`, **Then** the generated package contains exactly 20 cards.

---

## Edge Cases

- **Huge File / Card Limit Exceeded**: Uploading a file with > 2,000 cards stages the first 2,000 cards with an alert to split the file.
- **File Bomb / Memory Exhaustion**: Client validates file size ≤ 15MB before reading buffers into memory.
- **Interactive Transaction Timeout**: Backend batch operations use chunked batching with a 5,000ms database transaction timeout ceiling.
- **Intra-File Duplicates**: When the same word appears multiple times within the uploaded file, the wizard detects and flags both rows, applying the chosen conflict strategy sequentially.
- **Special Delimiters & Line Breaks**: CSVs with semicolon (`;`), tab (`\t`), or pipe (`|`) delimiters and multiline quoted cells are auto-detected and parsed accurately without breaking row alignments.
- **Private Deck Authorization**: Unauthenticated users or non-owners attempting to import to or export private decks receive immediate 401/403 errors.

---

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: System MUST provide a client-side drag-and-drop file ingestion zone accepting `.csv`, `.xlsx`, and `.apkg` files up to 15MB.
- **FR-002**: System MUST parse CSV and XLSX files in-browser using PapaParse and SheetJS, detecting delimiters (`,`, `;`, `\t`, `|`) and supporting UTF-8 BOM.
- **FR-003**: System MUST decompress Anki `.apkg` files in-browser using JSZip and query `collection.anki2` / `collection.anki21` using sql.js WASM.
- **FR-004**: System MUST sanitize Anki HTML tags (`<br>` → `\n`, `<b>` → `**`, strip `<script>/<iframe>`) and normalize cloze syntax.
- **FR-005**: System MUST perform fuzzy header auto-detection mapping column names (`term`, `front`, `tu_vung` → `word`; `back`, `definition`, `nghia` → `meaning`).
- **FR-006**: System MUST display an interactive 5-row preview table with real-time validation badges (🟢 Valid, 🟡 Duplicate, 🔴 Invalid).
- **FR-007**: Users MUST be able to edit invalid cells directly in the preview table or uncheck specific rows to exclude them from the batch.
- **FR-008**: System MUST perform client-side duplicate detection comparing incoming words against existing deck cards (NFC-normalized, case-insensitive, whitespace-trimmed).
- **FR-009**: System MUST support duplicate conflict resolution strategies: `SKIP` (default), `OVERWRITE`, and `KEEP_BOTH`, with per-row overrides.
- **FR-010**: System MUST provide a transactional backend endpoint `POST /api/v1/decks/:deckId/cards/bulk` executing all card creations and updates in a single Prisma `$transaction`.
- **FR-011**: System MUST initialize `UserCardProgress` in `NEW` state (`interval: 0`, `easeFactor: 2.5`, `repetitions: 0`, `status: 'NEW'`, `nextReviewDate: now()`) for all newly inserted cards.
- **FR-012**: System MUST defend against CSV Formula Injection (CWE-1236) by escaping leading formula trigger characters (`=`, `+`, `-`, `@`, `\t`, `\r`) on export and sanitizing on import.
- **FR-013**: System MUST support exporting decks to RFC 4180 CSV with UTF-8 BOM (`\uFEFF`) and mastery status filtering (`ALL`, `MASTERED`, `LEARNING`).
- **FR-014**: System MUST support exporting decks to valid Anki `.apkg` packages containing standard SQLite note schemas.
- **FR-015**: System MUST enforce rate limits (5 batch import requests/min, max 5,000 cards/day for Free users) and log structured audit events.

### Key Entities

- **Deck**: Target container for flashcards (`id`, `userId`, `title`, `description`, `isPublic`).
- **Card**: Flashcard entity (`id`, `deckId`, `word`, `meaning`, `phonetic`, `exampleSentence`, `collocations`, `mnemonic`, `imageUrl`, `audioUrl`).
- **UserCardProgress**: SM-2 spaced repetition state (`id`, `userId`, `cardId`, `status`, `interval`, `easeFactor`, `repetitions`, `nextReviewDate`).
- **CardBatchItemDto**: Normalized card payload for bulk ingestion (`word`, `meaning`, `phonetic`, `exampleSentence`, `collocations`, `mnemonic`, `imageUrl`, `audioUrl`, `conflictAction`).
- **ImportBatchResult**: Summary returned by bulk endpoint (`totalSubmitted`, `imported`, `skipped`, `overwritten`, `errors`).
- **ColumnMappingConfig**: Map of standard card field names to detected file header indices/names.

---

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: Client-side parsing and preview generation for 1,000 rows completes in **< 800ms** at P95.
- **SC-002**: Backend atomic batch transaction commit for 1,000 cards completes in **< 1,500ms** at P95.
- **SC-003**: Deck export generation and browser download trigger for 2,000 cards completes in **< 1,000ms** at P95.
- **SC-004**: 100% of exported CSV files open in Microsoft Excel with intact Vietnamese diacritics and zero spreadsheet formula execution vulnerabilities.
- **SC-005**: 100% of imported Anki `.apkg` decks load cleanly into WordStreak with zero unhandled HTML markup in card fields.

---

## Assumptions

- Parsing is executed client-side in the user's modern web browser (Chrome, Firefox, Safari, Edge) to offload server compute and provide zero-latency previews.
- Target user decks have < 2,000 cards per single batch; larger collections can be imported in multiple batches.
- When exporting public community decks, only card vocabulary content is exported; author's private `UserCardProgress` history is strictly excluded.
- Anki `.apkg` files follow standard Anki 2.0 / 2.1 SQLite schemas (`collection.anki2` or `collection.anki21`).
