# Intake: Listening & Typing Practice Quiz (US-QUIZ-03)

- **Date**: 2026-08-21
- **Requested by**: Product Roadmap (Sprint 5 / EPIC-04: Multi-format Practice & Quiz Modes)
- **Classification**: Full Feature
- **Classification signals**:
  - New or changed domain entities: 1 (Listening Quiz Generator & Client-side Audio Orchestrator with Web Speech Fallback)
  - Existing DB schema change required: No (uses existing Card `word`, `phonetic`, `meaning`, `audioUrl`, `exampleSentence`, and `UserCardProgress`)
  - Screens/flows touched: 2+ (Practice Mode Selector / Setup Modal, Listening Quiz Player, Quiz Summary / Results Recap)
  - User roles affected: 1 (Authenticated Learner)
  - Cross-cutting: Practice module, Deck/Card integration, Web Audio & Web Speech API Synthesis, Streak/XP progress hooks
  - Reversible without user-facing consequence: Yes
- **Protocol selected**: Full Feature Pipeline (Stages 1–8: Intake → Elicitation → Gap Analysis → Domain Modeling → Risk & Contradiction Scanner → Spec Writer → Spec Validator → Handover)
- **Override**: None

## One-line problem statement

Learners need focused auditory comprehension and spelling production practice where they listen to target vocabulary audio at adjustable speeds (1.0x normal / 0.75x slow speed) and type the exact word with progressive hints, resilient audio fallback (Web Speech API TTS), and gamified XP/streak integration.
