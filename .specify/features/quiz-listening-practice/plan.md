# Implementation Plan: Listening & Typing Practice Quiz (US-QUIZ-03)

**Branch**: `feat/quiz-listening-practice` | **Date**: 2026-08-21 | **Spec**: [spec.md](spec.md)  
**Epic**: EPIC-04 Multi-format Practice & Quiz Modes (Sprint 5)  
**Input**: Approved Feature Specification (`spec.md`) and Technical Research (`research.md`)

---

## 1. Summary

The Listening & Typing Practice mode provides an auditory-to-orthographic vocabulary training drill. Learners listen to spoken words at normal (`1.0x`) or slow (`0.75x`) speeds, type the target word with letter-slot guidance, access 3-tier progressive hints when stuck, and receive instant character-level diff feedback on mistakes.

The feature spans:

1. **`packages/shared-types`**: Shared contracts for `ListeningQuestionDto`, `GetListeningQuestionsQueryDto`, `ListeningAnswerSubmissionDto`.
2. **`apps/api` (NestJS)**: `ListeningGeneratorService` with `GET /api/v1/practice/listening` endpoint and extended XP calculation in `PracticeService`.
3. **`apps/web` (React 19)**: `useAudioPlayer` (HTML5 Audio + Web Speech API failover), `useListeningQuiz` state hook, `ListeningQuizCard`, `ListeningTypingInput`, `ProgressiveHintBox`, and `ListeningQuizPage`.

---

## 2. Technical Context

- **Language/Version**: TypeScript 5.8+ (Strict mode enabled across all packages)
- **Runtime**: Node.js v20+ (LTS)
- **Monorepo Management**: pnpm workspaces
- **Backend Stack (`apps/api`)**: NestJS 11, Prisma ORM, PostgreSQL, class-validator, class-transformer, Passport JWT
- **Frontend Stack (`apps/web`)**: React 19, Vite, Tailwind CSS, Lucide React icons, Web Speech API (`window.speechSynthesis`), HTML5 Audio API
- **Shared Library (`packages/shared-types`)**: TypeScript interface definitions & DTO contracts
- **Testing Frameworks**: Vitest / Jest for unit and integration testing, React Testing Library for frontend component tests
- **Target Platform**: Desktop & Mobile Web (Responsive from 320px to 1440px)
- **Performance Goals**:
  - API question generation latency: $< 100\text{ms}$ for decks up to 100 cards
  - Audio playback initiation: $< 150\text{ms}$ for remote MP3, $< 50\text{ms}$ for Web Speech API fallback
  - Client-side answer evaluation & character diff: $< 16\text{ms}$ (single frame)
- **Constraints**:
  - 100% audio availability via local Web Speech API failover cascade
  - Zero mutations to `UserCardProgress` spaced repetition memory parameters
  - Strict compliance with `apps/web/DESIGN.md` (Obsidian palette, pill CTAs, SF Pro Rounded / Nunito headings, JetBrains Mono IPA)

---

## 3. Constitution Check

_GATE: Must pass before implementation. Evaluated against `.specify/memory/constitution.md`._

| Principle                                  | Assessment                                                                                                                                                                                                                                                 |  Status  |
| :----------------------------------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :------: |
| **I. Code Quality First**                  | Strict TypeScript throughout. All shared interfaces placed in `packages/shared-types`. No `any` types. Single responsibility per service/hook/component. Files kept $< 800$ lines and functions $< 50$ lines.                                              | **PASS** |
| **II. Testing Standards (Non-negotiable)** | TDD approach with Red-Green-Refactor ordering. Unit tests for `ListeningGeneratorService`, answer normalizer, spelling diff utility, `useAudioPlayer`, `useListeningQuiz`, and component rendering. Minimum 80% branch coverage.                           | **PASS** |
| **III. User Experience Consistency**       | Full Obsidian design tokens compliance: canvas `#ffffff`, buttons `rounded-full` black pills `#000000`, 1px `#e5e5e5` hairline cards, JetBrains Mono for IPA. Complete WCAG 2.1 AA keyboard navigation (`Space`, `Shift+Space`, `Enter`, `Ctrl+H`, `Esc`). | **PASS** |
| **IV. Performance Requirements**           | In-memory shuffling and filtering $< 100\text{ms}$. Streamlined audio hook with local Web Speech synthesis for zero-network fallback. Client-side diff computation in $< 16\text{ms}$. No extra bundle weight (zero heavy audio libraries).                | **PASS** |

---

## 4. Monorepo Project Structure & File Locations

```text
WordStreak/
├── packages/
│   └── shared-types/
│       └── src/
│           ├── practice.ts                     # Extend with ListeningQuestionDto, etc.
│           └── index.ts                        # Re-export practice types
├── apps/
│   ├── api/
│   │   └── src/
│   │       └── modules/
│   │           └── practice/
│   │               ├── dto/
│   │               │   ├── get-listening-questions.dto.ts # Query validation DTO
│   │               │   └── submit-quiz.dto.ts             # Updated with listening modes
│   │               ├── listening-generator.service.ts     # Question generator service
│   │               ├── listening-generator.service.spec.ts# Generator unit tests
│   │               ├── practice.controller.ts             # GET /practice/listening
│   │               ├── practice.controller.spec.ts        # Controller integration tests
│   │               ├── practice.service.ts                # XP scoring & anti-abuse guards
│   │               └── practice.module.ts                 # Provider registration
│   └── web/
│       └── src/
│           ├── features/
│           │   └── practice/
│           │       ├── components/
│           │       │   ├── ListeningQuizCard.tsx          # Central audio card & waveform
│           │       │   ├── ListeningTypingInput.tsx       # Character slot input & diff view
│           │       │   ├── ProgressiveHintBox.tsx         # 3-Tier progressive hint panel
│           │       │   └── ListeningQuizCard.spec.tsx     # Component test
│           │       ├── hooks/
│           │       │   ├── useAudioPlayer.ts              # Audio & Web Speech API hook
│           │       │   ├── useAudioPlayer.spec.ts         # Audio hook test
│           │       │   ├── useListeningQuiz.ts            # Quiz state machine hook
│           │       │   └── useListeningQuiz.spec.ts       # Quiz hook test
│           │       ├── utils/
│           │       │   ├── spellingDiff.ts                # Normalizer & LCS diff logic
│           │       │   └── spellingDiff.spec.ts           # Normalizer & diff unit tests
│           │       ├── pages/
│           │       │   └── ListeningQuizPage.tsx          # Main practice page
│           │       └── services/
│           │           └── practiceService.ts             # getListeningQuiz API method
│           └── App.tsx                                    # Route registration: /practice/listening
```

---

## 5. Architectural Component Design

### 5.1 Backend Layer (`apps/api`)

#### 1. `ListeningGeneratorService`

- **Class**: `ListeningGeneratorService`
- **Dependencies**: `PrismaService`
- **Method**: `generateQuestions(userId: string, options: GetListeningQuestionsDto): Promise<ListeningQuestionDto[]>`
- **Logic**:
  1. Finds deck by `id`, ensuring it exists and is not archived.
  2. Asserts ownership (`deck.userId === userId`) or public visibility (`deck.isPublic === true`).
  3. Validates that `deck.cards.length >= 1`.
  4. Shuffles cards using Fisher-Yates.
  5. Slices cards up to `limit` (default 10, max 100).
  6. Maps to `ListeningQuestionDto`:
     - `id`: `lq_${card.id}_${index}`
     - `cardId`: `card.id`
     - `word`: `card.word`
     - `phonetic`: `card.phonetic`
     - `meaning`: `card.meaning`
     - `audioUrl`: `card.audioUrl`
     - `wordLength`: `card.word.length`
     - `firstLetterHint`: `card.word.charAt(0).toUpperCase()`

#### 2. `PracticeController`

- Endpoint: `GET /practice/listening`
- Decorators: `@UseGuards(JwtAuthGuard)`, `@CurrentUser() user: JwtPayload`, `@Query() query: GetListeningQuestionsDto`
- Returns: `ApiResponse<ListeningQuestionDto[]>`

#### 3. `PracticeService.submitQuiz` Extension

- Handles listening quiz answers with speed bonus (+15 XP if `timeSpentMs <= 8000`, `hintsUsed === 0`, `replayCount <= 2`).
- Combos: 1.0x (<3), 1.5x (3-4), 2.0x (5+).
- Enforces anti-abuse: rejects sessions with underhuman submission velocity ($< 400\text{ms}$ per item).

---

### 5.2 Frontend Layer (`apps/web`)

#### 1. `useAudioPlayer` Hook

- **State**:
  - `isPlaying: boolean`
  - `playbackSpeed: 1.0 | 0.75`
  - `audioSourceType: 'REMOTE_MP3' | 'WEB_SPEECH_TTS' | 'NONE'`
  - `isAutoplayBlocked: boolean`
  - `hasError: boolean`
- **Functions**:
  - `playAudio(word: string, audioUrl?: string | null): Promise<void>`
  - `stopAudio(): void`
  - `toggleSpeed(): void` (toggles between 1.0x and 0.75x)
  - `unlockAutoplay(): void` (explicit user gesture unlock)
- **Failover Logic**:
  - Tries remote `<audio>` element with 3000ms timeout guard.
  - If fails or `audioUrl` is missing $\rightarrow$ switches to `window.speechSynthesis.speak(utterance)`.
  - Sets utterance `rate = playbackSpeed` and `lang = 'en-US'`.

#### 2. `spellingDiff` Utility

- `normalizeSpelling(str: string): string`: Trims, converts to lowercase, normalizes curly apostrophes, strips non-alphanumeric punctuation.
- `checkAnswer(submitted: string, target: string): boolean`: Returns `normalizeSpelling(submitted) === normalizeSpelling(target)`.
- `computeCharacterDiff(submitted: string, target: string): DiffSpan[]`: Computes LCS between target and submitted string to mark matching, missing, and extra characters for visual display.

#### 3. `useListeningQuiz` State Machine Hook

- **State**:
  - `questions: ListeningQuestionDto[]`
  - `currentIndex: number`
  - `typedAnswer: string`
  - `hintLevel: 0 | 1 | 2 | 3`
  - `replayCount: number`
  - `isSubmitted: boolean`
  - `isCorrect: boolean | null`
  - `characterDiff: DiffSpan[] | null`
  - `score: number`
  - `comboStreak: number`
  - `maxCombo: number`
  - `totalXpEarned: number`
  - `missedCards: MissedCardDto[]`
  - `isCompleted: boolean`
  - `timeLeft: number` (if timer enabled)
- **Actions**:
  - `setTypedAnswer(val: string)`
  - `requestHint()`: Increments `hintLevel` (max 3), marks speed bonus forfeited.
  - `submitAnswer()`: Evaluates answer, triggers emerald/red feedback, schedules auto-advance (1.2s).
  - `skipToNext()`: Instantly advances if already submitted.
  - `replayAudio()`: Calls `useAudioPlayer.playAudio()`, increments `replayCount`.

#### 4. UI Components (`apps/web/src/features/practice/components`)

- **`ListeningQuizCard.tsx`**:
  - Speaker wave pulse animation (Royal violet `#9333ea`).
  - Speed toggle button: Obsidian pill showing `"1.0x"` or `"0.75x Slow"`.
  - Replay button with tooltip `"Space"`.
  - Hint button displaying `"Hint (Ctrl+H)"` and badge for current tier.
  - `ProgressiveHintBox`: Tier 1 length/first-letter, Tier 2 Vietnamese meaning, Tier 3 IPA.
- **`ListeningTypingInput.tsx`**:
  - Dynamic input field with character slot background markers `_ _ _ _ _`.
  - Border transitions: default `#e5e5e5`, focus `#000000`, correct `#27c93f`, incorrect `#ff5f56`.
  - Character diff overlay rendered below input on incorrect answers.
- **`ListeningQuizPage.tsx`**:
  - Header: Deck title, `QuizProgressBar`, combo flame counter, timer badge / Zen mode indicator.
  - Body: `ListeningQuizCard` or `QuizResultsView` when finished.
  - Keyboard event listeners for global shortcuts (`Space`, `Shift+Space`, `Enter`, `Ctrl+H`, `Esc`).

---

## 6. Security & Anti-Abuse Controls

1. **Authentication & RBAC**: `JwtAuthGuard` on all practice endpoints. Private decks are inaccessible to non-owners; public decks are accessible to all authenticated users.
2. **Anti-Automation Guard**: Submissions with `timeSpentMs < 400` are rejected as bot scripts.
3. **Daily Practice Cap**: Practice drill XP is capped at 500 XP per calendar day per user.
4. **Input Sanitization**: User input is trimmed and bounded to 100 characters max to prevent buffer attacks.

---

## 7. Verification & Testing Plan

1. **Unit Tests**:
   - `apps/api/src/modules/practice/listening-generator.service.spec.ts`: Tests card shuffling, limit constraints, access control, first-letter hint generation.
   - `apps/web/src/features/practice/utils/spellingDiff.spec.ts`: Tests normalization (spaces, cases, hyphens, contractions) and character diff output.
   - `apps/web/src/features/practice/hooks/useAudioPlayer.spec.ts`: Mocks HTML5 Audio and `window.speechSynthesis` to test fallback cascade and speed toggling.
   - `apps/web/src/features/practice/hooks/useListeningQuiz.spec.ts`: Tests state progression, combo calculations, hint forfeiture, and recap generation.
2. **Integration Tests**:
   - `apps/api/src/modules/practice/practice.controller.spec.ts`: Tests `GET /practice/listening` endpoint with valid/invalid deck IDs and auth tokens.
3. **Component Tests**:
   - `apps/web/src/features/practice/components/ListeningQuizCard.spec.tsx`: Tests keyboard hotkeys, speed pill click, hint rendering, and submission flow.
