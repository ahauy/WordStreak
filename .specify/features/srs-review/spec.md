# Specification: Spaced Repetition System & Flashcard Review Flow (SRS Review)

## 1. Feature Overview

The Spaced Repetition System (SRS) provides WordStreak learners with a scientifically optimized vocabulary review mechanism using the SuperMemo-2 (SM-2) algorithm. The feature includes due review queue querying, instant per-card progress submission, dual-route review navigation (`/review` and `/decks/:deckId/review`), and a distraction-free 3D flip flashcard review UI with complete keyboard controls.

## 2. User Scenarios & Acceptance Criteria

- **Scenario 1 (Review Scheduling Calculation)**:
  - Rating `Again` (1) or `Hard` (2): Repetitions reset to 0, interval reset to 1 day, ease factor adjusted down ($EF \ge 1.3$). Card re-queued in current session if rated `Again`.
  - Rating `Good` (3): Repetitions incremented, interval calculated exponentially ($I(1)=1\text{d}, I(2)=6\text{d}, I(n)=\text{round}(I(n-1) \times EF)$).
  - Rating `Easy` (4): Repetitions incremented, ease factor increased, 1.3x bonus interval multiplier applied.
- **Scenario 2 (Queue Retrieval & Prioritization)**:
  - `GET /api/v1/reviews/due` returns cards prioritized: Overdue $\rightarrow$ Due Today $\rightarrow$ New cards up to learner's `dailyGoal`.
  - Supports optional query `deckId` to review a single deck or all active decks.
- **Scenario 3 (Flashcard Flip UI & Hotkeys)**:
  - Front face displays Word, IPA phonetics, and audio play button.
  - Pressing `Space` flips to back face revealing Meaning, Example with Vietnamese translation, Collocations, and Mnemonic.
  - Hotkeys `1`, `2`, `3`, `4` submit corresponding SRS rating immediately.
  - Hotkey `R` plays pronunciation audio.
  - Progress bar shows `Current / Total Remaining`.
- **Scenario 4 (Session Summary & Streak Trigger)**:
  - When queue is finished, summary screen shows cards reviewed, accuracy %, time elapsed, and celebrates streak progression.

## 3. Non-Functional Requirements

- **Performance**: Review queue retrieval latency P95 < 50ms; SM-2 calculation < 1ms.
- **Accessibility**: WCAG 2.1 AA compliant keyboard navigation and ARIA attributes.
- **Design Consistency**: Adheres to `apps/web/DESIGN.md` (pure white canvas `#ffffff`, 1px borders `#e5e5e5`, Obsidian buttons `#000000`, Nunito/Inter/JetBrains Mono typography).
