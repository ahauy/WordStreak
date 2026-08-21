# Product Requirements Document (PRD)

## Feature: Deck Import/Export (CSV, Excel & Anki .apkg)

- **Feature Slug**: `deck-import-export`
- **Epic**: EPIC-09: Import/Export, Community & Ecosystem | Sprint 6
- **Target User Story**: `US-ECO-01: Nhập và xuất dữ liệu Bộ từ`
- **Version**: 1.0
- **Status**: APPROVED FOR SPECIFICATION
- **Date**: 2026-08-21

---

## 1. Product Overview & Vision

The **Deck Import/Export** capability eliminates data friction in WordStreak, enabling learners to freely migrate their flashcards from spreadsheets, Anki packages, and external vocabulary databases into WordStreak in seconds, as well as export their study content into open formats anytime.

---

## 2. User Experience & Flows

### 2.1 Multi-Step Import Wizard (`DeckImportModal`)

```
┌────────────────────────────────────────────────────────────────────────────┐
│                        IMPORT FLASHCARDS WIZARD                            │
│  [1. Upload File] ──► [2. Map & Preview] ──► [3. Conflict] ──► [4. Summary]│
├────────────────────────────────────────────────────────────────────────────┤
│                                                                            │
│   ┌────────────────────────────────────────────────────────────────────┐   │
│   │                                                                    │   │
│   │               📂 Drag & Drop your file here                        │   │
│   │           Supports .CSV, .XLSX, and Anki .APKG (Max 15MB)          │   │
│   │                                                                    │   │
│   │                 [ Browse Local Files ]                             │   │
│   │                                                                    │   │
│   └────────────────────────────────────────────────────────────────────┘   │
│                                                                            │
│   💡 Don't have a file? [ 📥 Download Sample Template (.csv) ]            │
│                                                                            │
└────────────────────────────────────────────────────────────────────────────┘
```

#### Step 1: Upload File

- Dropzone accepts `.csv`, `.xlsx`, `.apkg`.
- Validates file type and size (< 15MB).
- Provides immediate link to download `WordStreak_Template.csv`.

#### Step 2: Map Columns & Interactive Preview

- Displays detected file columns mapped to WordStreak schema fields:
  - `word` (Mandatory)
  - `meaning` (Mandatory)
  - `phonetic` (Optional)
  - `exampleSentence` (Optional)
  - `collocations` (Optional)
  - `mnemonic` (Optional)
  - `imageUrl` / `audioUrl` (Optional)
- Shows a sticky interactive preview table displaying the first 5 rows with total row counter (`"Showing 5 of 342 rows"`).
- Color-coded row status chips:
  - 🟢 **Valid**: Row ready for import.
  - 🟡 **Duplicate**: Word already exists in target deck.
  - 🔴 **Invalid**: Missing mandatory `word` or `meaning`.

#### Step 3: Target Deck & Duplicate Resolution

- **Target Selection**: "Import into Current Deck" or "Create New Deck (Name: [input])".
- **Duplicate Strategy Selection**:
  - `SKIP` (Default): Exclude duplicate cards, insert novel cards only.
  - `OVERWRITE`: Update existing card fields, preserving SM-2 progress.
  - `KEEP_BOTH`: Insert new card records even if word matches existing cards.
- Allows per-row override toggles directly in the preview table.

#### Step 4: Summary & Progress

- Displays progress bar during atomic submission.
- Renders final summary dialog upon success:
  - `✅ 312 cards successfully imported`
  - `⏭️ 18 duplicate cards skipped`
  - `🔄 0 cards overwritten`
- Primary CTA: **"Review Deck Now"** (routes to `ReviewSessionPage`).
- Secondary CTA: **"Close"** (returns to `DeckDetailPage`).

---

### 2.2 Deck Export Flow (`DeckExportModal`)

1. User clicks **"Export Deck"** in Deck Detail header or Deck Action menu.
2. Modal opens offering:
   - **Format Selection**:
     - `Standard CSV (.csv)` (UTF-8 with BOM, compatible with Excel, Google Sheets, Quizlet).
     - `Anki Package (.apkg)` (Compatible with Anki desktop & mobile).
   - **Filter Options**:
     - All Cards in Deck (`ALL`)
     - Mastered Cards (`MASTERED`, interval >= 21 days)
     - Learning Cards (`LEARNING` / `NEW`)
3. User clicks **"Download File"** -> File generated and downloaded instantly via browser blob.

---

## 3. Product Scope & Functional Requirements

| Capability                    | Requirement Description                                                                                                  |  Priority   |
| :---------------------------- | :----------------------------------------------------------------------------------------------------------------------- | :---------: |
| **Multi-Format Parsing**      | Parse `.csv` (auto delimiter detection `,`, `;`, `\t`), `.xlsx`, and `.apkg` client-side                                 |  Must-Have  |
| **Fuzzy Column Auto-Mapping** | Automatically map common column names (`term`, `front`, `tu_vung` -> `word`; `back`, `definition`, `nghia` -> `meaning`) |  Must-Have  |
| **Duplicate Control**         | Global and per-row conflict resolution (`SKIP`, `OVERWRITE`, `KEEP_BOTH`)                                                |  Must-Have  |
| **Atomic Transaction**        | Server-side bulk insert ensuring all-or-nothing database integrity                                                       |  Must-Have  |
| **SM-2 Progress Init**        | Automatically instantiate `UserCardProgress` in `NEW` state for imported cards                                           |  Must-Have  |
| **Export Engine**             | Export to CSV with UTF-8 BOM and Anki `.apkg` with mastery status filtering                                              |  Must-Have  |
| **Security Sanitization**     | CSV Formula Injection (CWE-1236) escaping and Anki HTML tag stripping                                                    |  Must-Have  |
| **Template Download**         | Embedded downloadable CSV template with pre-filled vocabulary examples                                                   | Should-Have |

---

## 4. Non-Functional Product Targets

- **Latency**: Preview generation for 1,000 rows in < 800ms; Batch commit for 1,000 cards in < 1,500ms.
- **Accessibility**: Full WCAG 2.1 AA compliance with keyboard navigation and ARIA alerts.
- **Localization**: English and Vietnamese interface strings with 100% UTF-8 character integrity.
