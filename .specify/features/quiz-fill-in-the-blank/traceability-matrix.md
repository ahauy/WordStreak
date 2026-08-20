# Traceability Matrix: Fill-in-the-blank Quiz (US-QUIZ-02)

| Requirement ID | Derived From                        | User Story & Scenario           | Target Component / Layer                              |
| :------------- | :---------------------------------- | :------------------------------ | :---------------------------------------------------- |
| `REQ-FILL-001` | `BR-FILL-001`, `01-elicitation.md`  | `US-QUIZ-02` (All Scenarios)    | Backend: `PracticeController`, `QuizGeneratorService` |
| `REQ-FILL-002` | `BR-FILL-002`, `ASM-QUIZ-010`       | `US-QUIZ-02` (Scenario 1)       | Backend: Sentence Masking Engine                      |
| `REQ-FILL-003` | `BR-FILL-004`, `ASM-QUIZ-011`       | `US-QUIZ-02` (Scenario 3)       | Backend: Fallback Template Generator                  |
| `REQ-FILL-004` | `BR-FILL-003`, `ASM-QUIZ-012`       | `US-QUIZ-02` (Scenario 2)       | Backend/Shared: Anagram Generator                     |
| `REQ-FILL-005` | `ASM-QUIZ-012`, `01-elicitation.md` | `US-QUIZ-02` (Scenario 1, 2)    | Frontend: `FillBlankInput`, `AnagramTilePicker`       |
| `REQ-FILL-006` | `BR-FILL-008`, `ASM-QUIZ-012`       | `US-QUIZ-02` (Scenario 4)       | Frontend: Hint display & IPA audio trigger            |
| `REQ-FILL-007` | `BR-FILL-005`, `ASM-QUIZ-013`       | `US-QUIZ-02` (Scenario 1, 5)    | Frontend & Backend: Answer normalizer                 |
| `REQ-FILL-008` | `BR-FILL-006`, `ASM-QUIZ-014`       | `US-QUIZ-02` (Scenario 6)       | Backend: `submitQuiz`, Frontend: `QuizResultsView`    |
| `REQ-FILL-009` | `BR-FILL-009`, `BR-FILL-010`        | `US-QUIZ-02` (Scenario 1, 4, 5) | Frontend: Keyboard Hook & Timer Hook                  |
