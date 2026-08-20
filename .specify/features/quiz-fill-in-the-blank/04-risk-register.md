# Risk Register & Contradiction Scan: Fill-in-the-blank Quiz (US-QUIZ-02)

- **Feature**: Fill-in-the-blank Quiz Mode
- **Date**: 2026-08-20
- **Status**: COMPLETE

---

## 1. Risk Register

| Risk ID         | Category            | Description                                                                                                  | Probability | Impact | Mitigation Strategy                                                                                             |
| :-------------- | :------------------ | :----------------------------------------------------------------------------------------------------------- | :---------: | :----: | :-------------------------------------------------------------------------------------------------------------- |
| `RISK-FILL-001` | Data Quality        | Cards with missing or poor `exampleSentence` cannot create natural blanks.                                   |   Medium    |  Low   | `BR-FILL-004` implements automatic fallback to contextual meaning prompt with character count guide.            |
| `RISK-FILL-002` | Logic / Grammatical | Target word in sentence has complex irregular inflection (e.g. "go" -> "went") not captured by simple regex. |     Low     | Medium | Multi-strategy matcher tests root word, regular suffixes, and accepts both root and token in validation.        |
| `RISK-FILL-003` | Mobile UX           | Typing long words on mobile virtual keyboard obscures sentence context or breaks layout.                     |   Medium    | Medium | Anagram letter tile picker provides tap-to-select without opening virtual keyboard. Sized $\ge 44 \times 44$px. |
| `RISK-FILL-004` | Cheating / Exploit  | User uses inspector/network payload to peek at `targetWord`.                                                 |     Low     |  Low   | Pure practice mode; XP awards are capped per day and do not manipulate competitive rankings.                    |

---

## 2. Contradiction & Deadlock Scan

- **Contradiction Check 1**: Does fill-in-the-blank conflict with SM-2 spaced repetition?
  - _Resolution_: No. `BR-FILL-007` guarantees strict isolation from SM-2 intervals (`UserCardProgress`).
- **Contradiction Check 2**: What if a sentence contains the target word multiple times?
  - _Resolution_: Regex replaces the first matching whole-word token to maintain clean, singular focus per question.
- **Contradiction Check 3**: What if a card has 0 characters or punctuation in word?
  - _Resolution_: Normalization trims non-alphanumeric punctuation when building scrambled letter tiles.

---

## 3. Assumptions Log Consolidation

- `ASM-QUIZ-010`: Target word in example sentence is masked with `[ _____ ]` via case-insensitive morphological regex matching root word and inflections.
- `ASM-QUIZ-011`: If exampleSentence is missing or does not contain the target word, a contextual fallback prompt is generated so cards are not discarded.
- `ASM-QUIZ-012`: The UI provides dual input: freeform text typing and an interactive letter scramble (anagram) tile picker, with a progressive Hint button.
- `ASM-QUIZ-013`: Answer validation is case-insensitive, whitespace-trimmed, and accepts either the inflected token or base word.
- `ASM-QUIZ-014`: Fill-in-the-blank is a standalone Practice Mode awarding XP and combo streaks without altering SuperMemo-2 card review intervals.
- `ASM-QUIZ-015`: Keyboard shortcuts (`Enter` to submit/advance, `Ctrl+H` for hint) are fully supported alongside touch interactions.

---

## 4. MoSCoW Scope Table

| Priority            | Scope Item                                                                                    | Traceability                  |
| :------------------ | :-------------------------------------------------------------------------------------------- | :---------------------------- |
| **Must-Have**       | Morphological sentence masking & question generator endpoint                                  | `REQ-FILL-001`, `BR-FILL-002` |
| **Must-Have**       | Fallback prompt for cards lacking example sentences                                           | `REQ-FILL-002`, `BR-FILL-004` |
| **Must-Have**       | Interactive sentence completion UI with text typing input                                     | `REQ-FILL-003`, `US-QUIZ-02`  |
| **Must-Have**       | Scrambled letter tiles (anagram) selector                                                     | `REQ-FILL-004`, `US-QUIZ-02`  |
| **Must-Have**       | Progressive hints (First letter / IPA audio)                                                  | `REQ-FILL-005`, `BR-FILL-008` |
| **Must-Have**       | Instant answer validation & feedback animation (Correct/Incorrect)                            | `REQ-FILL-006`, `BR-FILL-005` |
| **Must-Have**       | Integration with Practice Setup Modal & Quiz Results recap view                               | `REQ-FILL-007`, `BR-FILL-006` |
| **Should-Have**     | 25s Countdown timer with toggleable Zen Mode                                                  | `REQ-FILL-008`, `BR-FILL-009` |
| **Should-Have**     | Full keyboard navigation (`Enter`, `Space`, `Ctrl+H`, `Backspace`)                            | `REQ-FILL-009`, `BR-FILL-010` |
| **Won't-Have (v1)** | Natural Language Processing (NLP) AI auto-sentence generation on the fly (handled in Epic 07) | Out of scope for Sprint 3     |
| **Won't-Have (v1)** | Voice speech-to-text input (handled in Epic 08)                                               | Out of scope for Sprint 3     |
