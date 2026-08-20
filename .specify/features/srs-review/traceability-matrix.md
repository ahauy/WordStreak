# Requirement Traceability Matrix: Spaced Repetition System (SRS Review)

| Business Goal                              | REQ / BR ID                                | User Story  | Acceptance Criteria | Target Test Layer                                |
| :----------------------------------------- | :----------------------------------------- | :---------- | :------------------ | :----------------------------------------------- |
| Maximize memory retention with SM-2        | `REQ-SRS-001` / `BR-SRS-001`, `BR-SRS-002` | `US-SRS-01` | Scenario 1, 2, 3    | Unit (`SrsService.spec.ts`)                      |
| Prioritized due review queue               | `REQ-SRS-002` / `BR-SRS-003`               | `US-SRS-02` | Scenario 1, 2, 3    | Unit + Integration (`ReviewsController.spec.ts`) |
| Rapid per-card persistence & anti-abuse    | `REQ-SRS-003` / `BR-SRS-004`, `BR-SRS-005` | `US-SRS-03` | Scenario 1          | Integration (`ReviewsService.spec.ts`)           |
| Distraction-free 3D flip card review UI    | `REQ-SRS-004` / `Pillar 6`                 | `US-SRS-03` | Scenario 1, 2       | Component (`FlashcardReview.spec.tsx`)           |
| End-of-session completion summary & streak | `REQ-SRS-005` / `WF-SRS-03`                | `US-SRS-03` | Scenario 3          | Component (`ReviewSummaryModal.spec.tsx`)        |
