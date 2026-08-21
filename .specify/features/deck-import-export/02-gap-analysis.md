# Gap Analysis: Deck Import/Export (CSV, Excel & Anki .apkg)

- **Date**: 2026-08-21
- **Feature Slug**: `deck-import-export`
- **Target Release**: Sprint 6 (EPIC-09: US-ECO-01)
- **Status**: COMPLETED

---

## 1. AS-IS (Current State)

### Existing Functionality

- **Deck & Card Creation**: Users can create decks via `POST /api/v1/decks` and add individual flashcards one-by-one via `POST /api/v1/cards` (`AddCardModal` / `CardEditorForm`).
- **AI Card Generation**: Single-word AI auto-fill (`POST /api/v1/ai/generate-card`) accelerates individual card authoring (~10s/card), but still requires user confirmation per word.
- **Card Progress**: Every created card generates an associated `UserCardProgress` record upon review or creation.

### Bottlenecks & Limitations

1. **Manual Entry Overhead**: Importing a 300-word IELTS vocabulary list requires ~50 minutes of repetitive manual card creation.
2. **Zero File Portability**: No mechanism exists to ingest `.csv`, `.xlsx`, or `.apkg` files. Users migrating from Anki or Quizlet must abandon their existing deck libraries.
3. **No Batch API Endpoints**: Backend lacks atomic bulk ingestion endpoints (`/cards/bulk`), meaning high network roundtrips if simulated client-side.
4. **No Deck Export**: Users cannot back up their decks locally or share offline study files with peers.

---

## 2. TO-BE (Target State)

### Target End-to-End Experience

1. **Seamless 4-Step Import Wizard**:
   - **Upload**: User drops any `.csv`, `.xlsx`, or `.apkg` file into the dropzone (or downloads the standard CSV template).
   - **Map & Preview**: Client instantly detects delimiters, parses contents, auto-maps columns to WordStreak schema (`word`, `meaning`, `phonetic`, `exampleSentence`, etc.), and renders an interactive preview table with real-time validation badges.
   - **Conflict Strategy**: User specifies target deck (or creates a new deck on the fly) and picks duplicate resolution behavior (`SKIP`, `OVERWRITE`, `KEEP_BOTH`) with per-row overrides.
   - **Atomic Ingestion**: Client submits sanitized JSON payload to `POST /api/v1/decks/:deckId/cards/bulk`. Backend inserts cards and initializes `UserCardProgress` in a single `$transaction` in < 1.5 seconds for 1,000 cards.
2. **Flexible Deck Export**:
   - User triggers "Export Deck" from Deck Detail or Management menu.
   - Chooses format (Standard CSV with UTF-8 BOM, Anki `.apkg`) and mastery filter (`ALL`, `MASTERED`, `LEARNING`).
   - Browser generates and downloads the file instantly with full formula injection sanitization.

---

## 3. Gap Analysis

### Functional Gaps

- **Backend**:
  - New batch card creation endpoint: `POST /api/v1/decks/:deckId/cards/bulk` accepting array of card payloads, conflict strategy, and creating cards + `UserCardProgress` atomically.
  - New export endpoint / data serializer for CSV and Anki `.apkg` (or client-side serialization with clean server card retrieval).
  - Rate limiting & payload size guards (max 2,000 cards / 15MB file).
- **Frontend**:
  - Multi-step modal component `DeckImportModal` with sub-steps (`DropzoneStep`, `ColumnMapperStep`, `PreviewTableStep`, `DuplicateResolverStep`, `SummaryStep`).
  - Parsing engines: PapaParse integration for CSV (auto-delimiter detection `,`, `;`, `\t`), SheetJS for Excel `.xlsx`, and JSZip/sql.js for Anki `.apkg` extraction.
  - Column auto-detection fuzzy matching dictionary.
  - HTML tag stripper and sanitizer for Anki rich notes.
  - Export modal component `DeckExportModal` with format selector, filter chips, and download trigger.

### Data Gaps

- **Database Schema**:
  - `Deck`, `Card`, and `UserCardProgress` schemas already exist in `schema.prisma`.
  - Add composite index or query optimization for case-insensitive duplicate checking `[deckId, word]`.
  - Zero breaking schema migrations required; 100% additive and backward-compatible.

### User Impact

- **Existing User Workflows**: Completely non-breaking.
- **UI Enhancements**:
  - New "Import Cards" button in `DeckDetailPage` action bar, `DeckManagementPage` toolbar, and `EmptyDeckState`.
  - New "Export Deck" action in deck context menus and detail header.
  - Informative tooltips and downloadable sample template.

### Transition Requirements

- **Migration**: No database migration needed.
- **Rollout**: Immediate availability upon Sprint 6 deployment.
- **Collateral**: Embedded sample template (`WordStreak_Vocabulary_Template.csv`) bundled with client assets.
