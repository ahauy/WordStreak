# Risk Register & Contradiction Scan: Spaced Repetition System (SRS Review)

## 1. Contradiction Scan

- **Scan Findings**: None found.
  - State machine transitions for `NEW` -> `LEARNING` -> `MASTERED` align with `interval >= 21` and `repetitions >= 4`.
  - Rating reset rules ($n'=0, I'=1$ for ratings 1 and 2) are consistent across domain model and algorithm doc `docs/algorithms/supermemo-2.md`.
  - Queue query priority ordering is deterministic.
- **Backward-Compatibility**: Zero breaking changes to `User`, `Deck`, `Card`, or `Session`. `UserCardProgress` table schema matches existing model.

---

## 2. Risk Register

| ID               | Risk                                                                    | Prob. | Impact | Mitigation                                                                                         |
| :--------------- | :---------------------------------------------------------------------- | :---: | :----: | :------------------------------------------------------------------------------------------------- |
| **RISK-SRS-001** | Rapid consecutive rating clicks causing duplicate submission            |  Med  |  Low   | Frontend debouncing + Backend atomic update on `UserCardProgress`.                                 |
| **RISK-SRS-002** | Large deck due queue causing slow initial load                          |  Low  |  Med   | Limit page size to 50 cards per review batch with compound indexing on `[userId, nextReviewDate]`. |
| **RISK-SRS-003** | Ease factor deflation trap ($EF < 1.3$) making cards permanently repeat |  Low  |  High  | Hard minimum clamp $EF \ge 1.3$ enforced at service level per `BR-SRS-001`.                        |
| **RISK-SRS-004** | Missing native audio playback causing user frustration                  |  Low  |  Low   | Fallback to Web Speech API SpeechSynthesis if `audioUrl` is missing or fails to load.              |

---

## 3. Assumptions & Constraints (Consolidated)

- **ASM-SRS-001**: Review supports dual-mode routing (`/review` global and `/decks/:deckId/review` deck-specific).
- **ASM-SRS-002**: Rating scale is 4 options: Again (1), Hard (2), Good (3), Easy (4), with intra-session loop for 'Again' cards.
- **ASM-SRS-003**: Per-card ratings are persisted immediately upon selection; session summary is presented upon queue exhaustion.
- **ASM-SRS-004**: SM-2 formula adheres to `docs/algorithms/supermemo-2.md` with minimum $EF = 1.3$.
- **Constraints**:
  - Pure white canvas design system (`apps/web/DESIGN.md`) with Obsidian button pills.
  - Zero generic AI slop (no multi-colored gradients, neon glows, or heavy glassmorphism).

---

## 4. MoSCoW Scope Table

### Must-Have (P0 - This Release)

- Pure `SrsService` implementing SuperMemo-2 calculations with 100% unit test coverage.
- Due Review Queue API (`GET /api/v1/reviews/due`) supporting global & deck-specific queries.
- Rating submission endpoint (`POST /api/v1/reviews/submit`).
- Dedicated Flashcard Review UI with 3D Flip, full keyboard navigation (`Space`, `1`, `2`, `3`, `4`), audio pronunciation button, and session progress bar.
- Completion Summary modal showing accuracy, cards reviewed, and streak status.

### Should-Have (P1 - Follow-up)

- Review queue stats endpoint (`GET /api/v1/reviews/stats`) for dashboard counter widgets.
- Fallback Web Speech Synthesis if audioUrl is absent.

### Could-Have (P2 - Next Sprint)

- Undo last rating action within 5 seconds.
- Custom SM-2 interval modifiers in user settings.

### Won't-Have (Out of Scope for v1)

- Free-form typing test inside flashcard review (deferred to Quiz mode `US-QUIZ-02`).
- FSRS algorithm (deferred to future engine upgrade).
- Offline background sync service worker (deferred to Phase 4 PWA).
