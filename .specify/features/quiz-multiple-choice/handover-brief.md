# Handover Brief: Multiple Choice Quiz (US-QUIZ-01)

**Baseline version**: 1.0 (Signed off 2026-08-20)  
**Spec documents**: `spec/SRS.md`, `spec/user-stories.md`  
**Traceability matrix**: `traceability-matrix.md`

## What's being built

A fullstack multiple choice quiz practice mode allowing learners to test active vocabulary recall with balanced 50/50 EN->VI and VI->EN questions, smart distractors sourced from the same deck (or user decks), 15s timer / Zen Mode, keyboard hotkeys (1-4, A-D, Space), instant green/red feedback, combo multiplier XP rewards, and an end-of-quiz results screen.

## What's explicitly out of scope

Multiplayer live quiz battles, direct SM-2 spaced repetition state mutation from quiz responses, and manual custom distractor editing per card.

## Known accepted risks/gaps

None. All 4 risks in `04-risk-register.md` have concrete mitigations incorporated.

## Next step

Execute Speckit pipeline (`speckit-specify` -> `speckit-plan` -> `speckit-tasks`) to establish technical architecture, data contracts, and task breakdown.
