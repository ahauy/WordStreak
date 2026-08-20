# Test Plan: Spaced Repetition System (SRS Review)

## 1. Test Case Mapping Matrix

| Test ID        | User Story  | Scenario Description                                                                     | Target Test Layer                     |
| :------------- | :---------- | :--------------------------------------------------------------------------------------- | :------------------------------------ |
| **TC-SRS-001** | `US-SRS-01` | Rating `Good` ($q=3$) on card with $n=1$ calculates $n'=2, I'=6\text{d}$.                | Unit (`SrsService`)                   |
| **TC-SRS-002** | `US-SRS-01` | Rating `Easy` ($q=4$) applies ease factor increase and bonus multiplier.                 | Unit (`SrsService`)                   |
| **TC-SRS-003** | `US-SRS-01` | Rating `Again` ($q=1$) or `Hard` ($q=2$) resets repetitions to 0 and interval to 1 day.  | Unit (`SrsService`)                   |
| **TC-SRS-004** | `US-SRS-01` | Ease factor clamping prevents $EF < 1.30$.                                               | Unit (`SrsService`)                   |
| **TC-SRS-005** | `US-SRS-02` | `getDueCards` returns overdue, due today, and new cards within daily goal limit.         | Unit/Integration (`ReviewsService`)   |
| **TC-SRS-006** | `US-SRS-02` | `getDueCards` with `deckId` filters cards exclusively for the given deck.                | Unit/Integration (`ReviewsService`)   |
| **TC-SRS-007** | `US-SRS-03` | `submitReview` validates card ownership and atomically updates progress in DB.           | Unit/Integration (`ReviewsService`)   |
| **TC-SRS-008** | `US-SRS-03` | Flashcard front/back 3D flip renders correct card information and responds to Space key. | Component (`FlashcardReviewCard`)     |
| **TC-SRS-009** | `US-SRS-03` | Rating hotkeys `1`, `2`, `3`, `4` trigger rating submissions.                            | Component / Hook (`useReviewSession`) |
| **TC-SRS-010** | `US-SRS-03` | Cards rated `Again` are re-queued at the end of session until passed.                    | Hook (`useReviewSession`)             |
| **TC-SRS-011** | `US-SRS-03` | Session completion modal renders summary metrics when queue is finished.                 | Component (`ReviewSummaryModal`)      |
