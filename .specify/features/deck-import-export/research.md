# Phase 0 Research & Technology Decisions: Deck Import/Export

**Feature Slug**: `deck-import-export`  
**Date**: 2026-08-21  
**Status**: COMPLETED & APPROVED

---

## 1. Client-Side vs. Server-Side Parsing Architecture

### Decision

Parse CSV, Excel (`.xlsx`), and Anki (`.apkg`) entirely **client-side in the browser** using dedicated WebAssembly and JavaScript libraries. Only send validated, normalized JSON payloads (`CardBatchItemDto[]`) to the backend `POST /api/v1/decks/:deckId/cards/bulk`.

### Rationale

1. **Zero Server Load & Cost**: Uploading files to the backend for parsing consumes server CPU, disk I/O, and memory, opening vectors for Zip bombs and memory exhaustion (DoS). Client-side parsing shifts compute to the client browser.
2. **Instant Interactive Preview**: Users get sub-500ms column mapping and preview without roundtrip network delays.
3. **In-Line Corrections**: Users can edit cells, remap columns, or exclude invalid rows prior to sending any network payload.
4. **Security Isolation**: Dangerous spreadsheet macros and binary files never touch the server filesystem.

### Alternatives Considered

- _Server-side multipart upload_: Requires file upload middleware (`multer`), temp storage management, background worker queues (BullMQ), and asynchronous job polling. Rejected as over-engineered for batches ≤ 2,000 cards.

---

## 2. In-Browser Tabular Parsers (CSV & Excel)

### Decision

- **CSV**: Use `papaparse` (lightweight, stream-capable, handles delimiter auto-detection, quotes, UTF-8 BOM, multiline cells).
- **Excel (.xlsx)**: Use `xlsx` (SheetJS) with lazy dynamic import `import('xlsx')` to avoid inflating the initial bundle size.

### Rationale

- `papaparse` is the industry standard for fast browser CSV parsing (~15KB gzipped), auto-detecting comma, semicolon, tab, and pipe delimiters.
- `xlsx` is loaded dynamically only when the user uploads a `.xlsx` file, keeping initial bundle size strictly compliant with WordStreak's < 200KB constraint.

---

## 3. In-Browser Anki `.apkg` Extraction (JSZip + sql.js WASM)

### Decision

- Use `jszip` to decompress the `.apkg` ZIP archive in-memory.
- Use `sql.js` (SQLite compiled to WebAssembly) loaded dynamically to query `collection.anki2` or `collection.anki21` database files in-memory.
- Query SQL: `SELECT id, flds, tags FROM notes` and decode the unit separator delimiter `\x1f`.

### Rationale

- Anki `.apkg` is a standard ZIP container containing a SQLite database and media files.
- `sql.js` WASM executes in client memory with zero native binary compilation required on the backend.
- Decompressing and reading SQL directly in WASM completes for 1,000 cards in ~300ms.

---

## 4. CWE-1236 (CSV Formula Injection) Defense

### Decision

- **On Export**: For any string field where the first character is one of `=`, `+`, `-`, `@`, `\t`, `\r`, prepend a single quote `'`.
- **On Import**: Strip leading `=` or control characters from user text fields to neutralize malicious formula execution.

### Rationale

- Spreadsheet software (Microsoft Excel, Google Sheets, LibreOffice Calc) automatically executes strings starting with formula trigger characters as formulas or DDE macro commands.
- Prepending `'` forces spreadsheet parsers to treat the cell as plain text without altering the visible text value.

---

## 5. UTF-8 Byte Order Mark (BOM) for Vietnamese Diacritics

### Decision

- When generating CSV export blobs in the browser or server, prefix the UTF-8 text with `\uFEFF` (`0xEF, 0xBB, 0xBF`).

### Rationale

- Microsoft Excel on Windows defaults to legacy ANSI/Windows-1252 encoding unless a UTF-8 BOM is explicitly present at byte 0.
- Without BOM, Vietnamese diacritic marks (e.g. `Tiếng Việt`, `Ngữ pháp`) render as garbled text (mojibake). With BOM, Excel displays all Vietnamese diacritics natively.

---

## 6. Database Batch Transaction & Deduplication Strategy

### Decision

- Expose `POST /api/v1/decks/:deckId/cards/bulk` in `cards.controller.ts` / `cards.service.ts`.
- Execute all operations inside `prisma.$transaction(async (tx) => { ... }, { timeout: 5000 })`.
- For `SKIP`: Query existing cards in target deck, filter out matching words, batch-insert new cards with `tx.card.createManyAndReturn` (or sequential create in tx), and batch-create initial `UserCardProgress` records.
- For `OVERWRITE`: Update matched existing cards' text fields while leaving `UserCardProgress` untouched; insert non-duplicate cards with initial `UserCardProgress`.
- For `KEEP_BOTH`: Insert all submitted cards regardless of duplication.

### Rationale

- Single atomic transaction guarantees zero partial state or orphan records if a failure occurs mid-batch.
- Setting transaction timeout to 5,000ms ensures database connection pool health.
