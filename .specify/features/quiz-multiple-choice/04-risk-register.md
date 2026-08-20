# Risk Register & Scope: Multiple Choice Quiz (US-QUIZ-01)

## 1. Contradiction Scan

- **Logic Contradictions**: None found.
- **State Deadlocks**: None found. All states (`CONFIGURING`, `IN_PROGRESS`, `SHOWING_FEEDBACK`, `SUBMITTING`, `COMPLETED`, `ABANDONED`) have deterministic outgoing transitions.
- **Backward-Compatibility**: Zero breaking changes. All new endpoints are placed under `/api/v1/practice/*` and existing card/deck data structures remain untouched.

---

## 2. Risk Register

| ID                | Risk                                                                            | Prob. | Impact | Mitigation                                                                                                                           |
| :---------------- | :------------------------------------------------------------------------------ | :---: | :----: | :----------------------------------------------------------------------------------------------------------------------------------- |
| **RISK-QUIZ-001** | Duplicate distractors if deck has cards with identical Vietnamese meanings      |  Med  |  Low   | Server deduplicates distractor choices by normalized lowercase string before returning options.                                      |
| **RISK-QUIZ-002** | Double-click or rapid keypress during feedback window triggers multiple submits | High  |  Med   | Frontend locks question interactive state to `READ_ONLY` immediately upon the first option selection.                                |
| **RISK-QUIZ-003** | User opens quiz on empty deck or deck with $< 4$ total user cards               |  Med  |  Low   | Backend returns structured `400 Bad Request` with `INSUFFICIENT_CARDS` code; Frontend renders friendly modal explaining requirement. |
| **RISK-QUIZ-004** | Client offline during final quiz submission                                     |  Low  |  Low   | Quiz result summary is calculated and rendered optimistically on client; submission payload is retried if network drops.             |

---

## 3. Assumptions & Constraints (Consolidated)

### Assumptions

- `ASM-QUIZ-001`: Bidirectional 50/50 split between EN->VI and VI->EN questions.
- `ASM-QUIZ-002`: Distractor options drawn from same deck, then other user decks, requiring $\ge 4$ total cards.
- `ASM-QUIZ-003`: Independent Practice Mode that does not modify SM-2 spaced repetition intervals.
- `ASM-QUIZ-004`: Preset session sizes: 10 (default), 20, or All cards.
- `ASM-QUIZ-005`: 15s countdown timer with speed bonus (+15 XP for $\le 5$s) and toggleable Zen Mode.
- `ASM-QUIZ-006`: Keyboard navigation (1-4, A-D, Space) with 1.0s feedback pause.

### Constraints

- Must strictly comply with WordStreak Design System tokens (`#ffffff` canvas, 1px `#e5e5e5` borders, `#000000` obsidian pills, `Nunito`/`Inter`/`JetBrains Mono`).
- P95 backend response time for question generation $< 100$ms.

---

## 4. MoSCoW Scope Table

### Must-Have (P0 - This Release)

- Dynamic 4-choice question generation API (`GET /api/v1/practice/multiple-choice`) with smart distractors.
- Interactive Quiz Player UI with question card, 4 clickable/hotkey-enabled options, 15s countdown progress bar, and instant green/red feedback.
- Zen Mode toggle (disable countdown timer).
- Quiz Configuration drawer/modal (10 / 20 / All cards presets).
- Results & Summary screen with score percentage, XP earned, combo streak, and list of missed cards.
- Deck Detail page integration ("Practice Quiz" CTA button).

### Should-Have (P1)

- Audio playback on question prompt (EN->VI) and on reveal (VI->EN).
- Sound effects on correct/wrong answers (toggleable).

### Could-Have (P2)

- "Retake Missed Words Only" button on Results screen.
- Practice history log in user profile analytics.

### Won't-Have (Explicitly Out of Scope for v1)

- Multi-player live quiz battles.
- Custom distractor manual editing per card.
- Direct SM-2 interval modification from quiz answers.
