# Developer Handover Brief: Chế độ Nối từ vựng (Word Matching Game)

- **Feature Slug**: `quiz-word-matching`
- **Epic**: `EPIC-04` (Multi-format Practice & Quiz Modes — US-QUIZ-04)
- **Baseline Version**: 1.0 (Signed off 2026-08-21)
- **Spec Documents**: [`spec/PRD.md`](./spec/PRD.md), [`spec/SRS.md`](./spec/SRS.md), [`spec/user-stories.md`](./spec/user-stories.md)
- **Validation Report**: [`validation-report.md`](./validation-report.md) (100% PASS)
- **Traceability Matrix**: [`traceability-matrix.md`](./traceability-matrix.md)

---

## 1. What's Being Built

A high-speed, tactile, 2-column Word Matching Game where learners pair English vocabulary words (Column A) with their Vietnamese definitions (Column B). The mode features independent Fisher-Yates column shuffling, instant match detection, combo streak multipliers ($1.0\times$ to $2.0\times$), speed & accuracy XP bonuses, synthesized zero-latency audio cues, and anti-abuse velocity checks.

---

## 2. Technical Architecture & File Deliverables

### 2.1. Shared Types (`packages/shared-types/src/practice.ts`)

- `MatchingPairDto`: `{ id: string; cardId: string; text: string; type: 'WORD' | 'MEANING'; phonetic?: string | null; audioUrl?: string | null; }`
- `MatchingRoundDto`: `{ roundIndex: number; totalRounds: number; wordTiles: MatchingPairDto[]; meaningTiles: MatchingPairDto[]; }`
- `GetMatchingQuestionsQueryDto`: `{ deckId: string; limit?: number; }`
- `MatchingAnswerSubmissionDto`: `{ cardId: string; matchedInMs: number; attempts: number; isCorrectFirstTry: boolean; }`
- `SubmitMatchingQuizDto`: `{ deckId: string; mode: 'MATCHING'; totalPairs: number; totalTimeMs: number; answers: MatchingAnswerSubmissionDto[]; }`

### 2.2. Backend Implementation (NestJS)

1. **`MatchingGeneratorService`** (`apps/api/src/modules/practice/matching-generator.service.ts`):
   - Validates that the target deck has $\ge 5$ cards; throws `BadRequestException('INSUFFICIENT_CARDS_FOR_MATCHING')` if $< 5$.
   - Slices active cards into 5-card chunks (rounds).
   - Independently shuffles English words and Vietnamese meanings using Fisher-Yates.
   - Generates deterministic unique tile IDs for client tracking.
2. **DTOs & Controllers**:
   - `apps/api/src/modules/practice/dto/get-matching-questions.dto.ts`
   - `apps/api/src/modules/practice/dto/submit-matching-quiz.dto.ts`
   - `apps/api/src/modules/practice/practice.controller.ts`: Expose `GET /api/v1/practice/matching` (guarded by `JwtAuthGuard`).
3. **Practice Evaluation Service** (`apps/api/src/modules/practice/practice.service.ts`):
   - Support `mode === 'MATCHING'` in `submitQuiz`.
   - Calculate combo multipliers ($1.0\times, 1.2\times, 1.5\times, 2.0\times$).
   - Apply Round Speed Bonus ($+10\text{ XP}$ for $\le 15\text{s}$ with 0 errors) and Perfect Bonus ($+5\text{ XP}$).
   - Run anti-abuse bot check ($< 1500\text{ms}$ round duration or $< 200\text{ms}$ pair velocity $\to 0\text{ XP}$).

### 2.3. Frontend Implementation (React 19 + Tailwind CSS + Framer Motion)

1. **Audio Synthesizer** (`apps/web/src/features/practice/utils/matchingSoundSynthesizer.ts`):
   - Uses Web Audio API `AudioContext` to generate instant chimes, error buzzes, and combo dings with zero audio file network latency.
   - Wraps calls in safe exception handlers to gracefully handle browser autoplay restrictions.
2. **Game State Engine Hook** (`apps/web/src/features/practice/hooks/useWordMatchingGame.ts`):
   - Implements 8-state machine: `IDLE`, `PLAYING`, `CARD_SELECTED`, `CHECKING_MATCH`, `MATCH_SUCCESS`, `MATCH_ERROR`, `ROUND_COMPLETED`, `SESSION_FINISHED`.
   - Manages active tile, same-column switching, tile self-deselection, input locking (300–400ms), timer / Zen mode countdown, and combo tracking.
3. **UI Components**:
   - `MatchingTile.tsx`: Tactile card tile with states: neutral, active (purple ring), success (emerald dissolve), error (rose shake `animate-shake`), keyboard shortcut badges.
   - `MatchingCardColumn.tsx`: 5-row responsive vertical column.
   - `WordMatchingGame.tsx`: Main board container displaying combo bar, timer/stopwatch, header mute toggle, round counter, and 2 columns.
   - `WordMatchingGamePage.tsx`: Full game page integrating game board and `QuizResultsView`.
   - `QuizSetupModal.tsx`: Add "Nối từ (Word Matching)" tab with card requirement badge ($< 5$ cards disabled state).
   - `App.tsx`: Register routes `/decks/:id/practice/matching` and `/practice/matching`.

---

## 3. What is Explicitly OUT OF SCOPE (Won't-Have)

- ❌ Real-time 1v1 multiplayer matchmaking / WebSockets battle mode.
- ❌ SVG line-drawing canvas drag-and-drop between columns (tap-to-pair is standard).
- ❌ Voice recognition matching.

---

## 4. Known Accepted Risks & Mitigations

- **RISK-MATCH-001 (Bot Farming)**: Mitigated via server-side telemetry validation ($< 1500\text{ms}$ round time $\to 0\text{ XP}$).
- **RISK-MATCH-002 (Deck $< 5$ Cards)**: Mitigated via server-side HTTP 400 guard and frontend disabled tab state.
- **RISK-MATCH-003 (Rapid Multi-Tap Race Conditions)**: Mitigated by locking tile pointer events during `CHECKING_MATCH`.

---

## 5. Next Steps for Implementation

1. Update shared types in `packages/shared-types/src/practice.ts`.
2. Implement backend generator service, DTOs, controller endpoint, and tests in `apps/api`.
3. Implement frontend audio synthesizer, state hook, components, pages, and tests in `apps/web`.
4. Run full test suite (`pnpm test`) and verify 100% green build.
