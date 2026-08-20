# Intake: Fill-in-the-blank Quiz (US-QUIZ-02)

- **Date**: 2026-08-20
- **Requested by**: Product Roadmap (Sprint 3 / EPIC-04)
- **Classification**: Full Feature
- **Classification signals**:
  - New or changed domain entities: 1 (Fill-in-the-blank question generator algorithm & context sentence masking)
  - Existing DB schema change required: No (uses existing Card exampleSentence, meaning, word, and UserCardProgress)
  - Screens/flows touched: 2+ (Practice Mode Selector / Setup Modal, Fill-in-the-blank Quiz Player, Quiz Summary / Results)
  - User roles affected: 1 (Authenticated Learner)
  - Cross-cutting: Practice module, Deck/Card integration, Streak/XP progress hooks
  - Reversible without user-facing consequence: Yes
- **Protocol selected**: Full Feature Pipeline (Stages 1-8: Intake -> Elicitation -> Gap Analysis -> Domain Modeling -> Risk & Contradiction Scanner -> Spec Writer -> Spec Validator -> Handover)
- **Override**: None

## One-line problem statement

Learners need active-recall sentence completion practice where target vocabulary is masked inside authentic contextual example sentences, supporting typing with real-time validation, hints (first letter / word length), and letter scramble (anagram) fallback to build production vocabulary recall.
