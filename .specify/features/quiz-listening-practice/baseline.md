# Domain Decision Baseline: Listening & Typing Practice Quiz (US-QUIZ-03)

**Status**: SIGNED-OFF v1.0 (Confirmation Gate 1 Approved)  
**Version**: 1.0  
**Feature**: Listening & Typing Practice Mode (`quiz-listening-practice`)  
**Epic**: EPIC-04 Multi-format Practice & Quiz Modes (Sprint 5)  
**Date**: 2026-08-21

---

## Stage 0 — Intake

- **Classification**: Full Feature
- **Key Signals**: 1 client-side audio engine with Web Speech API failover cascade, 2+ UI screens/flows (Setup Modal, Practice Player, Recap Summary), 1 Authenticated Learner role, purely additive.
- **Reference**: [`00-intake.md`](00-intake.md)

## Stage 1 — Elicitation & Domain Decisions

- **Problem Statement**: Learners need active auditory-to-orthographic training with adjustable playback speeds (1.0x / 0.75x slow), resilient audio fallback (Web Speech API TTS), progressive hints, and immediate character diff feedback.
- **Key Domain Decisions**:
  - `ASM-QUIZ-020`: Audio plays automatically on question load (with user-gesture fallback trigger).
  - `ASM-QUIZ-021`: Discrete dual-speed playback rates: `1.0x` (Normal) and `0.75x` (Slow articulation).
  - `ASM-QUIZ-022`: Browser Web Speech API (`window.speechSynthesis`) acts as an immediate zero-latency fallback when `audioUrl` is missing or fails.
  - `ASM-QUIZ-023`: Answer validation performs whitespace trimming, case-insensitivity, and punctuation normalization.
  - `ASM-QUIZ-024`: Progressive 3-tier hint engine (Length + 1st Letter $\rightarrow$ Meaning $\rightarrow$ Phonetic IPA).
  - `ASM-QUIZ-025`: Pure practice drill isolated from SM-2 spaced repetition memory intervals (`UserCardProgress`).
  - `ASM-QUIZ-026`: Full keyboard shortcuts (`Space`/`R`, `Shift+Space`/`S`, `Enter`, `Ctrl+H`, `Esc`).
  - `ASM-QUIZ-027`: Offline/low-bandwidth resilience via client-side Web Speech synthesis cascade.
- **Reference**: [`01-elicitation.md`](01-elicitation.md)

## Stage 2 — Gap Analysis

- **AS-IS**: Multiple choice and fill-in-the-blank practice modes available; no dedicated audio ear-training and spelling drill with speed controls or speech synthesis failover.
- **TO-BE**: Backend endpoint `GET /api/v1/practice/listening` + React audio quiz player with 0.75x slow speed, Web Speech API fallback, progressive hints, and results recap view.
- **Reference**: [`02-gap-analysis.md`](02-gap-analysis.md)

## Stage 3 — Domain Model & Business Rules

- **Access & RBAC**: Authenticated learners can generate practice from owned or public decks; guest users redirect to login.
- **Business Rules**: Numbered rules `BR-QUIZ-LISTEN-001` through `BR-QUIZ-LISTEN-010` fully specified with gamification anti-abuse limits (400ms speed threshold, 500 XP daily practice cap).
- **Reference**: [`03-domain-model.md`](03-domain-model.md) and [`contracts/listening-quiz.contract.ts`](contracts/listening-quiz.contract.ts)

## Stage 4 — Risk Register & Contradiction Scan

- **Identified Risks**: 5 risks (`RISK-LISTEN-001` through `005`) with verified technical and UX mitigations.
- **Contradiction Scan**: 5 checks executed and resolved (zero open deadlocks).
- **MoSCoW**: Must-Have and Should-Have scope locked; Voice STT recording explicitly deferred to Epic 08.
- **Reference**: [`04-risk-register.md`](04-risk-register.md)

## Stage 5 — Specifications & User Stories

- **Functional Requirements**: `REQ-LISTEN-001` through `REQ-LISTEN-010`.
- **User Story**: `US-QUIZ-03` with 8 comprehensive Gherkin Given-When-Then scenarios.
- **Reference**: [`spec/user-stories.md`](spec/user-stories.md)

## Stage 6 — Quality Validation & Traceability

- **Quality Conformance**: 100% ISO/IEC/IEEE 29148:2018 compliance across all 8 criteria.
- **Traceability**: Unbroken 1-to-1 chain from Roadmap goals to testable acceptance criteria.
- **Reference**: [`validation-report.md`](validation-report.md) and [`traceability-matrix.md`](traceability-matrix.md)

## Stage 7 — Developer Handover

- **Handover Brief**: Prepared for Phase 2 Speckit Specification (`speckit-specify` $\rightarrow$ `speckit-plan` $\rightarrow$ `speckit-tasks`).
- **Reference**: [`handover-brief.md`](handover-brief.md)
