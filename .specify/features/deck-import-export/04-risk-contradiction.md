# Risk & Contradiction Scan: Deck Import/Export (CSV, Excel & Anki .apkg)

- **Date**: 2026-08-21
- **Feature Slug**: `deck-import-export`
- **Target Release**: Sprint 6 (EPIC-09: US-ECO-01)
- **Status**: PASSED (Zero unresolved conflicts)

---

## 1. Contradiction & Compatibility Scan

| Category                   | Scan Target                                    |  Result  | Analysis & Resolution                                                                                                                                           |
| :------------------------- | :--------------------------------------------- | :------: | :-------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Logic Contradiction**    | SM-2 Progress Initialization vs Existing Cards | **PASS** | Newly created cards get initialized in `NEW` state (`BR-IMP-008`). Overwritten cards preserve their existing `UserCardProgress` without reset (`BR-IMP-004`).   |
| **Logic Contradiction**    | Ownership & Public Deck Export                 | **PASS** | Export of owned decks includes deck definition + user stats. Export of public decks copies card definitions without leaking original author's progress history. |
| **State Deadlocks**        | Client Wizard Lifecycle                        | **PASS** | Every state (`IDLE`, `PARSING`, `MAPPED_PREVIEW`, `COMMITTING`, `COMPLETED`, `FAILED`) has defined backward and exit transitions; no trapped states.            |
| **State Deadlocks**        | SM-2 Review State Machine                      | **PASS** | `NEW` state integrates directly with existing WordStreak SM-2 review scheduler (`ReviewSessionPage`).                                                           |
| **Backward Compatibility** | Prisma Schema & Existing Endpoints             | **PASS** | 100% additive; `POST /api/v1/cards` single card creation and existing `Card` / `Deck` records remain unaffected.                                                |

---

## 2. Risk Register

| ID               | Risk Description                                                                              | Prob. | Impact | Mitigation Strategy                                                                                                                       |
| :--------------- | :-------------------------------------------------------------------------------------------- | :---: | :----: | :---------------------------------------------------------------------------------------------------------------------------------------- |
| **RISK-IMP-001** | Client browser freeze or memory spike from massive `.apkg` or large CSV archives              |  Low  |  High  | Enforce strict 15MB file size limit and cap preview parsing at 2,000 rows (`BR-IMP-002`). Use web workers / non-blocking parsing chunks.  |
| **RISK-IMP-002** | CSV Formula Injection (CWE-1236) executing arbitrary code in spreadsheet software upon export |  Med  |  High  | Prepend single quote `'` to all cell strings starting with `=`, `+`, `-`, `@`, `\t`, `\r` during CSV generation (`BR-IMP-007`).           |
| **RISK-IMP-003** | Database transaction timeout during bulk insert of 2,000 cards and progress records           |  Med  |  Med   | Utilize Prisma `createMany` and batch operations inside an interactive `$transaction` with a 5,000ms timeout guard (`BR-IMP-009`).        |
| **RISK-IMP-004** | Accidental data loss from user selecting `OVERWRITE` on existing cards                        |  Med  |  Med   | Safe default set to `SKIP` (`BR-IMP-004`); preview UI displays explicit amber warning badges on duplicate rows and requires confirmation. |
| **RISK-IMP-005** | Vietnamese diacritics / unicode garbled (Mojibake) in Excel exports                           |  Med  |  Med   | Prepend UTF-8 Byte Order Mark (`\uFEFF`) to all CSV export blobs (`BR-IMP-005`) ensuring Microsoft Excel automatically recognizes UTF-8.  |

---

## 3. Consolidated Assumptions & Constraints

### Assumptions Log

- **ASM-IMP-001**: Newly imported cards are always initialized in `NEW` state in WordStreak's SM-2 spaced repetition engine (`reps = 0`, `interval = 0`, `easeFactor = 2.5`, `status = 'NEW'`).
- **ASM-IMP-002**: Client-side parsing using lightweight browser libraries (PapaParse, SheetJS, JSZip, sql.js) provides the lowest latency (< 1s preview) and highest server security by avoiding raw file persistence on the backend.
- **ASM-IMP-003**: Column mapping requires at least `word` and `meaning` to be mapped; all other attributes are optional and default to `null` if omitted.

### Technical & Operational Constraints

- **Stack Compatibility**: Pure TypeScript monorepo (`apps/web` React 19 + `apps/api` NestJS 11 + `packages/shared-types`).
- **Zero Cloud Storage Lock-in**: File parsing and preview are self-contained in-memory without requiring AWS S3 or temporary disk storage.
- **Payload Constraint**: Max 2,000 cards per import batch; max 15MB file size.

---

## 4. MoSCoW Scope Table

### Must-Have (P0 — Non-Negotiable for Sprint 6)

- [x] Client-side drag-and-drop dropzone supporting `.csv`, `.xlsx`, and `.apkg` files.
- [x] Column auto-detection with interactive dropdown remapping.
- [x] 5-row interactive preview table with real-time validation badges (Valid, Duplicate, Invalid).
- [x] Configurable duplicate conflict resolution (`SKIP`, `OVERWRITE`, `KEEP_BOTH`) with per-row overrides.
- [x] Backend endpoint `POST /api/v1/decks/:deckId/cards/bulk` with atomic Prisma `$transaction`.
- [x] Automatic `UserCardProgress` initialization in `NEW` state for imported cards.
- [x] Deck Export modal supporting Standard CSV (UTF-8 BOM) and Anki `.apkg` with mastery filters (`ALL`, `MASTERED`, `LEARNING`).
- [x] CSV Formula Injection (CWE-1236) escaping and input sanitization.

### Should-Have (P1 — Important Ergonomics)

- [x] Downloadable standard `WordStreak_Template.csv` file with sample vocabulary rows.
- [x] Anki HTML/Cloze syntax cleaner converting to clean Markdown.
- [x] Post-import completion summary dialog with direct "Review Deck" CTA.

### Could-Have (P2 — Future Iterations)

- [ ] Anki embedded media (audio/images) extraction and cloud synchronization.
- [ ] Direct Google Sheets public URL live sync.

### Won't-Have (Explicitly Out of Scope for Sprint 6)

- ❌ Direct private Quizlet scraper / API ingestion (avoids Terms of Service violations).
- ❌ Historical Anki review log migration (all cards cleanly reset to `NEW` in WordStreak's SM-2 engine).
- ❌ PDF / Image OCR scanning to flashcards (reserved for future AI Vision epic).
