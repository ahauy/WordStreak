# Business Requirements Document (BRD)

## Feature: Deck Import/Export (CSV, Excel & Anki .apkg)

- **Feature Slug**: `deck-import-export`
- **Epic**: EPIC-09: Import/Export, Community & Ecosystem | Sprint 6
- **Target User Story**: `US-ECO-01: Nhập và xuất dữ liệu Bộ từ`
- **Version**: 1.0
- **Status**: APPROVED FOR SPECIFICATION
- **Date**: 2026-08-21

---

## 1. Executive Summary

Flashcard-based language learning relies on high-volume vocabulary acquisition. Learners often accumulate hundreds or thousands of cards in external tools such as Anki, Quizlet, and custom spreadsheets. Requiring users to manually re-enter their cards in WordStreak introduces high onboarding friction and leads to drop-offs.

The **Deck Import/Export** feature provides a bidirectional data portability suite:

1. **Multi-Format Ingestion**: Supports `.csv`, `.xlsx`, and Anki `.apkg` files with client-side interactive preview and fuzzy column auto-mapping.
2. **Duplicate Conflict Control**: Empowers users to choose how duplicate words are handled (`SKIP`, `OVERWRITE`, `KEEP_BOTH`) at global and row levels.
3. **SM-2 Engine Integration**: Automatically initializes imported cards into WordStreak's SM-2 spaced repetition queue.
4. **Deck Export**: Enables users to back up their decks or share offline study lists via standard CSV (UTF-8 BOM) and Anki `.apkg`.

---

## 2. Business Objectives & Success KPIs

| Metric                                  | Baseline         | Target (Post-Launch)                                        | Measurement Method                    |
| :-------------------------------------- | :--------------- | :---------------------------------------------------------- | :------------------------------------ |
| **New User Deck Migration Rate**        | 0% (Manual only) | **> 70%** of users with external lists import within 7 days | Analytics event `DECK_IMPORT_SUCCESS` |
| **Average Cards Added per Active User** | ~15 cards/week   | **> 120 cards/week**                                        | Weekly DB aggregation                 |
| **Time to Create 300 Cards**            | ~50 minutes      | **< 10 seconds** (1-click import)                           | UI telemetry                          |
| **Import Success Rate**                 | N/A              | **> 99.5%** error-free batches                              | Backend structured logs               |

---

## 3. Target Personas

1. **Alex (Anki Power User / IELTS Candidate)**: Has 2,500+ curated vocabulary cards in `.apkg` format. Wants to switch to WordStreak for its gamified streak mechanics, audio visualizer, and modern UI without losing existing card definitions.
2. **Minh (Corporate Learner / Excel User)**: Collects business English terms in Excel sheets. Needs to upload `.xlsx` or `.csv` files with varied column naming without manual reformatting.
3. **Linh (Community Sharer / Study Group Leader)**: Curates high-yield vocabulary decks and exports them as `.csv` and `.apkg` files to share with classmates.

---

## 4. Business Scope (MoSCoW Summary)

- **Must-Have (P0)**:
  - Drag-and-drop file ingestion (`.csv`, `.xlsx`, `.apkg`).
  - Interactive column mapping with 5-row preview table.
  - Duplicate resolution strategy (`SKIP`, `OVERWRITE`, `KEEP_BOTH`).
  - Backend batch atomic `$transaction` endpoint.
  - SM-2 `UserCardProgress` initialization in `NEW` state.
  - Deck export in CSV (UTF-8 BOM) and Anki `.apkg` formats.
  - Formula injection sanitization (CWE-1236).
- **Should-Have (P1)**:
  - Downloadable official sample template (`WordStreak_Template.csv`).
  - Anki HTML note tag cleaner to clean Markdown.
  - Post-import summary card with instant "Study Deck Now" CTA.
- **Won't-Have (Out of Scope)**:
  - Private Quizlet scraper.
  - Historical Anki revlog migration (all cards start fresh in `NEW` state).
  - OCR document scanning.
