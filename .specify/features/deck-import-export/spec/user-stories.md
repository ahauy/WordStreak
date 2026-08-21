# User Stories: Deck Import/Export (CSV, Excel & Anki .apkg)

- **Feature Slug**: `deck-import-export`
- **Epic**: EPIC-09: Import/Export, Community & Ecosystem | Sprint 6
- **Target User Story**: `US-ECO-01: Nhập và xuất dữ liệu Bộ từ`
- **Version**: 1.0
- **Status**: APPROVED
- **Date**: 2026-08-21

---

### US-IMP-001: Ingest Flashcards from CSV / Excel with Interactive Column Mapping

**As an** Authenticated Learner  
**I want to** drag and drop a `.csv` or `.xlsx` file and map its columns to WordStreak card attributes  
**So that** I can import hundreds of vocabulary words into my deck in seconds without retyping them  
**Traces to**: `REQ-IMP-001`, `REQ-IMP-002`, `REQ-IMP-005`, `REQ-IMP-006`, `REQ-IMP-007`

#### Acceptance Criteria

##### Scenario 1: Happy Path — Standard CSV Import with Auto-Detected Headers

- **Given** I am logged into WordStreak and view the "IELTS Vocabulary" deck
- **When** I click "Import Cards" and drop `ielts_words.csv` containing columns `Front`, `Back`, `IPA`, `Example`
- **Then** the wizard parses the file in < 500ms, auto-maps `Front` -> `word`, `Back` -> `meaning`, `IPA` -> `phonetic`, `Example` -> `exampleSentence`
- **And** displays a 5-row preview table with green "Valid" badges on all rows
- **When** I click "Import 150 Cards"
- **Then** all 150 cards are inserted into the database and initialized in the `NEW` SM-2 study queue
- **And** the summary screen displays "✅ 150 cards successfully imported".

##### Scenario 2: Edge Case — Malformed CSV Syntax and Missing Required Columns

- **Given** I upload a CSV file where the `meaning` column is completely missing
- **When** the parser reaches Step 2 (Mapping & Preview)
- **Then** the `meaning` dropdown is unselected and marked in red
- **And** the preview table displays a red badge "Missing required field: meaning" on all rows
- **And** the "Next" button is disabled until I assign a valid column to `meaning`.

##### Scenario 3: Edge Case — In-line Cell Editing for Invalid Rows

- **Given** row 4 in the uploaded file has an empty `word` cell
- **When** I view the preview table
- **Then** row 4 displays a red warning badge
- **When** I click into the empty cell, type "Eloquent", and press Enter
- **Then** the row badge updates immediately to green "Valid" and the card is included in the import batch.

---

### US-IMP-002: Migrate Anki `.apkg` Decks with HTML Sanitization

**As an** Anki Power User  
**I want to** upload an Anki `.apkg` package file  
**So that** I can seamlessly migrate my flashcard collections into WordStreak with clean formatting  
**Traces to**: `REQ-IMP-001`, `REQ-IMP-003`, `REQ-IMP-004`, `REQ-IMP-006`, `REQ-IMP-011`

#### Acceptance Criteria

##### Scenario 1: Happy Path — Unpacking `.apkg` and Converting Note Types

- **Given** I have an Anki deck package `TOEFL_Mastery.apkg` containing 500 cards with HTML styling (`<b>`, `<br>`, cloze syntax)
- **When** I drop the file into the import wizard
- **Then** the client-side parser unpacks the zip, reads `collection.anki2`, and extracts all 500 card notes
- **And** sanitizes HTML formatting into clean Markdown (`<br>` -> `\n`, `<b>text</b>` -> `**text**`)
- **And** presents a clean 5-row preview table
- **When** I confirm the import into a new deck named "TOEFL Mastery"
- **Then** a new deck is created with 500 cards initialized in `NEW` state with zero data loss.

##### Scenario 2: Edge Case — Corrupted `.apkg` Archive

- **Given** I upload a corrupted `.apkg` file missing the `collection.anki2` SQLite file
- **When** the parser attempts decompression
- **Then** the parser safely catches the error without crashing
- **And** displays an error alert: "Invalid or corrupted Anki package. Please verify your .apkg export from Anki."

---

### US-IMP-003: Duplicate Detection & Configurable Conflict Resolution Strategy

**As a** Deck Owner  
**I want to** choose how duplicate words are handled during bulk import  
**So that** I can prevent duplicate clutter or intentionally update existing definitions  
**Traces to**: `REQ-IMP-008`, `REQ-IMP-009`, `REQ-IMP-010`, `REQ-IMP-011`

#### Acceptance Criteria

##### Scenario 1: Happy Path — `SKIP` Strategy (Safe Default)

- **Given** my target deck already contains the card "Serendipity"
- **And** the imported CSV also contains "Serendipity"
- **When** I view Step 3 with the default strategy set to `SKIP`
- **Then** row 12 is flagged with an amber "Duplicate: Serendipity" badge
- **When** I click "Import"
- **Then** the existing "Serendipity" card is left untouched with its current SM-2 progress
- **And** the final summary displays "✅ 49 cards imported, ⏭️ 1 duplicate skipped".

##### Scenario 2: Alternative Flow — `OVERWRITE` Strategy

- **Given** I choose the `OVERWRITE` strategy to update old vocabulary definitions
- **When** I submit the import batch
- **Then** existing matching cards update their `meaning`, `phonetic`, and `exampleSentence` fields
- **And** their existing `UserCardProgress` interval and repetition count are preserved.

##### Scenario 3: Alternative Flow — Per-Row Conflict Override

- **Given** the global strategy is set to `SKIP`
- **And** row 5 is a duplicate word "Ephemeral" that I specifically want to replace
- **When** I toggle the dropdown on row 5 from "Skip" to "Overwrite"
- **Then** row 5 is marked for overwrite while all other duplicates remain skipped.

---

### US-IMP-004: Export Deck to Standard CSV and Anki `.apkg`

**As an** Authenticated User  
**I want to** export my deck to CSV or Anki `.apkg` with optional mastery filtering  
**So that** I can create portable offline backups and share my decks with friends  
**Traces to**: `REQ-IMP-012`, `REQ-IMP-013`, `REQ-IMP-014`, `REQ-IMP-015`

#### Acceptance Criteria

##### Scenario 1: Happy Path — Exporting Deck to CSV with UTF-8 BOM

- **Given** I own a deck "Business English" with 120 cards (including Vietnamese meanings)
- **When** I open the Export Modal, select "Standard CSV (.csv)", and click "Download File"
- **Then** the browser downloads `Business_English.csv` encoded in UTF-8 with Byte Order Mark (`\uFEFF`)
- **And** opening the file in Microsoft Excel displays all Vietnamese diacritics perfectly without garbled text.

##### Scenario 2: Happy Path — Exporting Deck to Anki `.apkg`

- **Given** I select "Anki Deck Package (.apkg)" in the Export Modal
- **When** I click "Download File"
- **Then** the client packages the cards into `Business_English.apkg` with valid SQLite note schema
- **And** importing the generated file into Anki desktop successfully opens the deck with 120 cards.

##### Scenario 3: Edge Case — CSV Formula Injection Defense (CWE-1236)

- **Given** a card contains a meaning starting with `=SUM(A1:A10)` or `@cmd`
- **When** the CSV export generator processes this card
- **Then** it prepends a single quote `'` (`'=SUM(A1:A10)`)
- **And** opening the CSV in Excel treats the cell as inert text rather than executing a formula.
