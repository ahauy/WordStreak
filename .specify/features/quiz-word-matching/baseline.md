# Domain Decision Baseline: Chế độ Nối từ vựng (Word Matching Game)

**Status**: SIGNED-OFF
**Version**: 1.0
**Signed off by**: Lead Business Analyst (BA Lead & Domain Architect), 2026-08-21
**Feature Slug**: `quiz-word-matching`
**Epic**: `EPIC-04` (Multi-format Practice & Quiz Modes — US-QUIZ-04)

---

## 1. Executive Summary & Business Intent

Word Matching Game provides an interactive, tactile, 2-column vocabulary pairing game mode. The feature is completely decoupled from core Spaced Repetition (SM-2) memory state while rewarding gamification XP, maintaining combo streaks, and offering round speed bonuses.

---

## 2. Stage Summaries & Core Decisions

### Stage 1 — Intake

- **Classification**: Full Feature (Protocol Stages 1–8).
- **Scope**: Additive practice mode touching backend generator endpoint, responsive 2-column UI board, Web Audio API sound synthesizer, and gamification calculations.
- _Reference_: [`00-intake.md`](./00-intake.md)

### Stage 2 — Elicitation & Assumptions

- Confirmed assumptions `ASM-MATCH-001` through `ASM-MATCH-008`.
- 5 pairs per round, independent column randomization, bidirectional matching (Left $\to$ Right or Right $\to$ Left), Web Audio API sound synthesis.
- _Reference_: [`01-elicitation.md`](./01-elicitation.md)

### Stage 3 — Gap Analysis

- Identified functional gaps `F-GAP-01` through `F-GAP-06`, data contract gap `D-GAP-01`, and UX gaps `U-GAP-01` through `U-GAP-03`.
- _Reference_: [`02-gap-analysis.md`](./02-gap-analysis.md)

### Stage 4 — Domain Modeling & Business Rules

- Established RBAC Matrix and 8-state deterministic machine (`IDLE`, `PLAYING`, `CARD_SELECTED`, `CHECKING_MATCH`, `MATCH_SUCCESS`, `MATCH_ERROR`, `ROUND_COMPLETED`, `SESSION_FINISHED`).
- Formulated business rules `BR-MATCH-001` through `BR-MATCH-012` covering base XP, combo multipliers ($1.0\times, 1.2\times, 1.5\times, 2.0\times$), speed bonus ($+10\text{ XP}$ for $\le 15\text{s}$), perfect accuracy bonus ($+5\text{ XP}$), anti-abuse velocity check ($< 1500\text{ms}$ or $< 200\text{ms}$ pair), daily practice cap ($500\text{ XP/day}$), and SM-2 decoupling.
- _Reference_: [`03-domain-model.md`](./03-domain-model.md)

### Stage 5 — Risk Register & MoSCoW Scoping

- Mitigated `RISK-MATCH-001` through `RISK-MATCH-005`.
- MoSCoW Scope locked: Real-time 1v1 multi-player battle mode and SVG drag-and-drop line drawing are explicitly **Won't-Have (v1.0)**.
- _Reference_: [`04-risk-register.md`](./04-risk-register.md)

### Stage 6 — Specifications

- Product Requirements Document: [`spec/PRD.md`](./spec/PRD.md)
- Software Requirements Specification (`REQ-MATCH-001` through `REQ-MATCH-012`): [`spec/SRS.md`](./spec/SRS.md)
- User Stories & Gherkin Acceptance Scenarios (`US-QUIZ-04` Scenarios 1–12): [`spec/user-stories.md`](./spec/user-stories.md)

### Stage 7 — Spec Validation Gate (IEEE 29148:2018)

- 100% compliance across all 8 IEEE 29148 criteria (Necessary, Unambiguous, Complete, Singular, Feasible, Verifiable, Consistent, Traceable).
- Requirement Traceability Matrix verified with zero unbroken chains.
- _Reference_: [`validation-report.md`](./validation-report.md), [`traceability-matrix.md`](./traceability-matrix.md)

### Stage 8 — Handover

- Handover brief compiled for fullstack engineering.
- _Reference_: [`handover-brief.md`](./handover-brief.md)

---

## 3. Change Management Policy

This baseline is locked at **Version 1.0**. Any subsequent changes to business rules, formulas, or scope must be recorded in [`CHANGELOG.md`](./CHANGELOG.md) with a corresponding version bump and validated through the BA Pipeline quality gate.
