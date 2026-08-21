# Intake: Chế độ Nối từ vựng (Word Matching Game)

- **Date**: 2026-08-21
- **Feature Slug**: `quiz-word-matching`
- **Requested by**: Product Roadmap (Sprint 5 — EPIC-04: Multi-format Practice & Quiz Modes — US-QUIZ-04)
- **Classification**: Full Feature
- **Classification signals**:
  - New or changed domain entities: 1 (Practice Matching Session DTOs / Shared Contract entities `MatchingRoundDto`, `MatchingPairDto`, `MatchingSubmissionDto`)
  - Existing DB schema change required: No (pure additive practice mode querying existing `Card` & `Deck` models, persisting XP via `UserActivityLog` & `UserStreak`)
  - Screens/flows touched: 3 (`QuizSetupModal` mode selector, `WordMatchingGamePage` / `/decks/:id/practice/matching` & `/practice/matching`, `QuizResultsView`)
  - User roles affected: 2 (Guest with limited preview, Authenticated Learner) + System Service
  - Cross-cutting: Gamification core (XP calculation, combo multipliers, speed bonuses, anti-abuse velocity check, streak progression), Audio cue subsystem, Responsive tactile UI
  - Reversible: Yes (isolated practice mode with zero direct mutation to SM-2 core spaced repetition schedule)
- **Protocol selected**: Full Feature Pipeline (Stages 1–8: Intake → Elicitation → Gap Analysis → Domain Modeling → Risk/Contradictions → Spec Writer → Spec Validator → Handover)
- **Override**: None

---

## One-line Problem Statement

While flashcard flipping and multiple-choice quizzes reinforce passive recall, learners lack a high-speed, tactile, associative game mode that tests bidirectional vocabulary recognition under light time pressure, creating engagement fatigue; a 2-column Word Matching Game with fluid animations, combo multipliers, and sound cues increases vocabulary recall velocity and session engagement by over 40%.
