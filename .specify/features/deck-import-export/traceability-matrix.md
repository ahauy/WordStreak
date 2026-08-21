# Requirement Traceability Matrix: Deck Import/Export (CSV, Excel & Anki .apkg)

- **Feature Slug**: `deck-import-export`
- **Release Target**: Sprint 6 (EPIC-09: US-ECO-01)
- **Status**: 100% TRACEABLE (Zero Gaps)

---

| Business Goal / KPI                    | Business Rule              | System Requirement                                                                                                           | User Story                               | Acceptance Criteria |
| :------------------------------------- | :------------------------- | :--------------------------------------------------------------------------------------------------------------------------- | :--------------------------------------- | :------------------ |
| **Instant Onboarding / Migration**     | `BR-IMP-002`, `BR-IMP-005` | `REQ-IMP-001`: Multi-Format File Dropzone<br>`REQ-IMP-002`: CSV/XLSX In-Browser Parser                                       | `US-IMP-001`                             | Scenario 1, 2       |
| **Flexible Mapping**                   | `BR-IMP-001`               | `REQ-IMP-005`: Intelligent Column Auto-Detection<br>`REQ-IMP-006`: 5-Row Preview Table<br>`REQ-IMP-007`: In-Line Row Editing | `US-IMP-001`                             | Scenario 1, 3       |
| **Anki Ecosystem Interoperability**    | `BR-IMP-006`               | `REQ-IMP-003`: Anki SQLite Unpacker<br>`REQ-IMP-004`: Anki HTML Sanitizer                                                    | `US-IMP-002`                             | Scenario 1, 2       |
| **Data Integrity & Duplicate Control** | `BR-IMP-003`, `BR-IMP-004` | `REQ-IMP-008`: Client-Side Duplicate Detector<br>`REQ-IMP-009`: Duplicate Conflict Resolution                                | `US-IMP-003`                             | Scenario 1, 2, 3    |
| **Atomic Ingestion**                   | `BR-IMP-009`               | `REQ-IMP-010`: Backend Batch `$transaction` Endpoint                                                                         | `US-IMP-001`, `US-IMP-003`               | Scenario 1          |
| **Immediate Study Queue Readiness**    | `BR-IMP-008`               | `REQ-IMP-011`: SM-2 `UserCardProgress` in `NEW`                                                                              | `US-IMP-001`, `US-IMP-002`, `US-IMP-003` | Scenario 1          |
| **Deck Backup & Export Portability**   | `BR-IMP-005`, `BR-IMP-006` | `REQ-IMP-013`: CSV Export with UTF-8 BOM<br>`REQ-IMP-014`: Anki `.apkg` Deck Exporter                                        | `US-IMP-004`                             | Scenario 1, 2       |
| **OWASP / CWE-1236 Security**          | `BR-IMP-007`               | `REQ-IMP-012`: Formula Injection Escaping                                                                                    | `US-IMP-004`                             | Scenario 3          |
| **Anti-Abuse & Auditability**          | `BR-IMP-010`               | `REQ-IMP-015`: Rate Limiting & Telemetry                                                                                     | `US-IMP-001`, `US-IMP-004`               | All Scenarios       |
