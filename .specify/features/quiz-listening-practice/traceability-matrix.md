# Traceability Matrix: Listening & Typing Practice Quiz (US-QUIZ-03)

| Requirement ID   | Derived From                               | User Story & Scenario        | Target Component / Layer                                                    |
| :--------------- | :----------------------------------------- | :--------------------------- | :-------------------------------------------------------------------------- |
| `REQ-LISTEN-001` | `BR-QUIZ-LISTEN-001`, `01-elicitation.md`  | `US-QUIZ-03` (All Scenarios) | Backend: `PracticeController.getListeningQuestions`, `QuizGeneratorService` |
| `REQ-LISTEN-002` | `BR-QUIZ-LISTEN-003`, `ASM-QUIZ-021`       | `US-QUIZ-03` (Scenario 2)    | Frontend: `AudioSpeedToggle`, `useAudioPlayer` hook                         |
| `REQ-LISTEN-003` | `BR-QUIZ-LISTEN-002`, `ASM-QUIZ-022`       | `US-QUIZ-03` (Scenario 3)    | Frontend: `useAudioFallback` hook (Web Speech API)                          |
| `REQ-LISTEN-004` | `01-elicitation.md`, `03-domain-model.md`  | `US-QUIZ-03` (Scenario 1)    | Frontend: `ListeningInputField`, `CharacterSlotGuides`                      |
| `REQ-LISTEN-005` | `BR-QUIZ-LISTEN-004`, `ASM-QUIZ-023`       | `US-QUIZ-03` (Scenario 1, 6) | Frontend & Backend: `normalizeAnswer` utility                               |
| `REQ-LISTEN-006` | `BR-QUIZ-LISTEN-005`, `ASM-QUIZ-024`       | `US-QUIZ-03` (Scenario 5)    | Frontend: `ListeningProgressiveHints` component                             |
| `REQ-LISTEN-007` | `BR-QUIZ-LISTEN-006`, `01-elicitation.md`  | `US-QUIZ-03` (Scenario 6)    | Frontend: `SpellingDiffVisualizer`, error shake                             |
| `REQ-LISTEN-008` | `BR-QUIZ-LISTEN-007`, `BR-QUIZ-LISTEN-008` | `US-QUIZ-03` (Scenario 1, 8) | Backend: `submitQuiz`, Frontend: `QuizResultsView`                          |
| `REQ-LISTEN-009` | `BR-QUIZ-LISTEN-009`                       | `US-QUIZ-03` (Scenario 7)    | Frontend: `useCountdownTimer` hook, Zen toggle                              |
| `REQ-LISTEN-010` | `BR-QUIZ-LISTEN-010`, `ASM-QUIZ-026`       | `US-QUIZ-03` (Scenario 1–7)  | Frontend: `useListeningKeyboardShortcuts` hook                              |
