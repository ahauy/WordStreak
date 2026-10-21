# Specification: TOEIC Practice Quizzes (Mini Part 5 & Word Family Quiz)

**Feature Slug:** `toeic-part5-quiz`  
**User Story:** `US-LIB-07`  
**Sprint:** 10 (TSL Expansion, Retention & Learning Quality)  
**Status:** In Progress  

---

## 1. Requirements & Acceptance Criteria

### US-LIB-07: Quiz kiểu đề thi TOEIC (Mini Part 5 & Word Family Quiz)
> **As a** learner preparing for TOEIC using TSL decks,  
> **I want** specialized practice exercises (Mini Part 5 sentence completion, Word Family derivation, Paraphrase, and Audio typing) generated directly from official cards,  
> **So that** I practice vocabulary in realistic TOEIC test contexts and automatically update my spaced repetition schedule without manual self-rating.

### Acceptance Criteria (REQ-TOEIC)
1. **REQ-TOEIC-001 (Question Types)**:
   - **`MINI_PART_5`**: Sentence with blank `______` (from `example_en`), 4 choices (correct headword + 3 distractors preferentially chosen from `confusables` or deck peers).
   - **`WORD_FAMILY`**: Sentence blank testing morphological inflection (correct form vs alternatives from `word_family`).
   - **`PARAPHRASE`**: Finding business context synonym or Vietnamese meaning correspondence with 3 distractors.
   - **`LISTENING_TYPING`**: Audio playback with spelling verification and hints.
2. **REQ-TOEIC-002 (Deck / Path Scoping)**:
   - Endpoint supports querying by `deckId` (for both Official Decks and Custom Decks) or `pathCode` (e.g. `TOEIC`).
   - Graceful fallback: If a card lacks `confusables` or `word_family`, fallback to randomly selected distractors from the deck cards to always ensure 4 valid options.
3. **REQ-TOEIC-003 (SM-2 Auto-Grading)**:
   - Auto-calculate SM-2 rating on submission:
     - `!isCorrect`: rating = 1 (`Again`)
     - `isCorrect && timeSpentMs <= 4000`: rating = 4 (`Easy` - reflex response)
     - `isCorrect && timeSpentMs <= 10000`: rating = 3 (`Good` - standard recall)
     - `isCorrect && timeSpentMs > 10000`: rating = 2 (`Hard` - hesitant response)
   - Update `UserOfficialCardProgress` or `UserCardProgress` via SRS service, record daily activity/XP (+10 XP per correct question, +5 speed bonus).
4. **REQ-TOEIC-004 (Obsidian Pill UI & Practice Flow)**:
   - Interactive quiz interface adhering to WordStreak Design System (Obsidian pill, `#ffffff` canvas, hairline borders `#e5e5e5`, Nunito typography).
   - Instant feedback with explanation, word details (`meaning_vi`, `pos`, `ipa_us`), and auto-advance.

---

## 2. Technical Approach

### Contracts & Types (`packages/shared-types/src/practice.ts`)
- `ToeicQuizType = 'MINI_PART_5' | 'WORD_FAMILY' | 'PARAPHRASE' | 'LISTENING_TYPING'`
- `ToeicQuizQuestionDto`
- `GetToeicQuizQueryDto`
- `SubmitToeicQuizDto`
- `ToeicQuizResultDto`

### Backend Architecture (`apps/api`)
- `ToeicQuizGeneratorService` (`apps/api/src/modules/practice/toeic-quiz-generator.service.ts`):
  - Fetches cards from `OfficialDeck` or `Deck`.
  - Parses `content` JSON (`OfficialCardContent`).
  - Constructs `MINI_PART_5`, `WORD_FAMILY`, `PARAPHRASE`, or `LISTENING_TYPING` questions with robust distractor generation.
- `PracticeService`:
  - `submitToeicQuiz(userId, dto, clientTimezone)`: evaluates answers, applies auto-grading SM-2 formula, updates SRS records and user XP.
- `PracticeController`:
  - `GET /api/v1/practice/toeic`: generates quiz questions.
  - `POST /api/v1/practice/toeic/submit`: submits answers and returns auto-graded SRS summary.

### Frontend Architecture (`apps/web`)
- Hook `useToeicQuiz(deckId, type)`
- Components:
  - `ToeicQuizContainer.tsx`
  - `MiniPart5QuizCard.tsx`
  - `WordFamilyQuizCard.tsx`
  - `ToeicResultSummary.tsx`
- Integration:
  - Accessible from `OfficialDeckDetailPage` or practice section.

---

## 3. Test Cases (`TC-###`)
- `TC-001`: `ToeicQuizGeneratorService` generates 4-choice questions with `confusables` when available.
- `TC-002`: `ToeicQuizGeneratorService` generates `WORD_FAMILY` distractors from morphological derivations.
- `TC-003`: `PracticeService.submitToeicQuiz` converts incorrect answers to SM-2 rating 1 (`Again`).
- `TC-004`: `PracticeService.submitToeicQuiz` converts fast correct answers (<= 4s) to SM-2 rating 4 (`Easy`).
- `TC-005`: `PracticeService.submitToeicQuiz` updates `UserOfficialCardProgress` and awards XP.
- `TC-006`: Frontend renders `MiniPart5QuizCard` and triggers answer selection correctly.
