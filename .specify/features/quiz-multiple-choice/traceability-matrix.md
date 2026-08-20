# Traceability Matrix: Multiple Choice Quiz (US-QUIZ-01)

| Business Goal                     | REQ / BR                      | User Story    | Acceptance Criteria | Test Case Mapping                                      |
| :-------------------------------- | :---------------------------- | :------------ | :------------------ | :----------------------------------------------------- |
| Active Recall Drill               | `REQ-QUIZ-001`, `BR-QUIZ-001` | `US-QUIZ-001` | Scenario 1          | `TC-QUIZ-001` (Session generation)                     |
| Distractor Generation & Fallback  | `REQ-QUIZ-002`, `BR-QUIZ-002` | `US-QUIZ-001` | Scenario 2          | `TC-QUIZ-002` (Distractor pooling & $< 4$ cards guard) |
| Rapid Hotkey Navigation           | `REQ-QUIZ-003`, `BR-QUIZ-003` | `US-QUIZ-002` | Scenario 1, 3       | `TC-QUIZ-003` (Keyboard selection & skip)              |
| Timer & Auto-Advance              | `REQ-QUIZ-004`, `BR-QUIZ-004` | `US-QUIZ-002` | Scenario 2          | `TC-QUIZ-004` (Timer expiry & feedback freeze)         |
| Gamification & XP                 | `REQ-QUIZ-005`, `BR-QUIZ-005` | `US-QUIZ-003` | Scenario 1          | `TC-QUIZ-005` (XP calculation & combo multiplier)      |
| Learning Retention & Missed Drill | `REQ-QUIZ-006`                | `US-QUIZ-003` | Scenario 1, 2       | `TC-QUIZ-006` (Results summary & retake)               |
