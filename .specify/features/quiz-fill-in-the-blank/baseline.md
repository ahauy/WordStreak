# Domain Decision Baseline: Fill-in-the-blank Quiz (US-QUIZ-02)

**Status**: SIGNED-OFF v1.0
**Version**: 1.0
**Feature**: Fill-in-the-blank Sentence Completion Quiz
**Date**: 2026-08-20
**Signed Off By**: User Approval (Confirmation Gate 1)

---

## Stage 0 — Intake

- **Classification**: Full Feature
- **Signals**: 1 domain generator algorithm, 2+ UI flows, 1 Learner role, additive practice capability.
- **Reference**: `00-intake.md`

## Stage 1 — Elicitation & Domain Decisions

- **Problem**: Active-recall sentence completion with contextual usage and spelling practice.
- **Key Decisions**:
  - `ASM-QUIZ-010`: Morphological regex masking (`[ _____ ]`) matching root words and inflections.
  - `ASM-QUIZ-011`: Graceful fallback prompt using card meaning when exampleSentence is missing.
  - `ASM-QUIZ-012`: Dual input (direct typing + scrambled letter chips) with progressive hint.
  - `ASM-QUIZ-013`: Normalized case-insensitive validation against root and inflected token.
  - `ASM-QUIZ-014`: Pure practice mode granting XP (+10 XP base, +15 XP speed bonus, combo multiplier) without altering SM-2 intervals.
- **Reference**: `01-elicitation.md`

## Stage 2 — Gap Analysis

- **AS-IS**: Multiple choice practice mode in place; `cards` have `exampleSentence`.
- **TO-BE**: Backend fill-in-the-blank question generator endpoint + React quiz player with dual input & anagram tiles.
- **Reference**: `02-gap-analysis.md`

## Stage 3 — Domain Model & Business Rules

- **Business Rules**: `BR-FILL-001` through `BR-FILL-010` fully specified.
- **Reference**: `03-domain-model.md`

## Stage 4 — Risk Register & Scoping

- **Identified Risks**: 4 risks with active mitigations.
- **MoSCoW**: Must-Have scope clearly defined; advanced NLP dynamic sentence generation and voice STT deferred to later phases.
- **Reference**: `04-risk-register.md`

## Stage 5 — User Stories & Specifications

- **Requirements**: `REQ-FILL-001` through `REQ-FILL-009`.
- **User Story**: `US-QUIZ-02` with 6 detailed Gherkin scenarios.
- **Reference**: `spec/user-stories.md`

## Stage 6 — Quality Validation

- **Quality Score**: 100% IEEE 29148 conformance.
- **Traceability**: 1-to-1 traceability established.
- **Reference**: `traceability-matrix.md`, `validation-report.md`

## Stage 7 — Handover

- **Dev Handover Brief**: Completed and ready for Speckit Technical Planning (`speckit-specify`, `speckit-plan`, `speckit-tasks`).
- **Reference**: `handover-brief.md`
