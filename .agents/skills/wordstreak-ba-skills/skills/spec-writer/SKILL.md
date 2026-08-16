---
name: spec-writer
description: >
  Use for WordStreak Bounded Task or Full Feature work once elicitation,
  domain modeling, and risk scanning are complete (or, for Bounded Tasks,
  once elicitation and a light domain model exist). Compiles the accumulated
  business analysis into the right specification document(s) — BRD, PRD,
  SRS, and/or Gherkin-style User Stories — assigning REQ-/US- IDs so every
  requirement traces back to a business goal. Trigger this whenever the user
  says "write the spec", "turn this into a spec", "write user stories for
  this", or once risk-contradiction-scanner's exit checklist is fully green.
  Do not write a spec directly from a raw request — this skill assumes the
  upstream BA stages already ran.
---

# Spec Writer

Phase 2, Stage 6. This is the first stage whose output looks like a
traditional deliverable — but it's still assembly, not authorship: every
sentence in the spec should trace back to something already decided in
`01-elicitation.md` through `04-risk-register.md`. If you find yourself
inventing a requirement here, stop and send it back to
`elicitation-interview` instead.

## 1. Choose the document set

Check `00-intake.md` for protocol and audience:

| Protocol | Documents produced |
|---|---|
| Bounded Task | `user-stories.md` only |
| Full Feature, single-team | `SRS.md` + `user-stories.md` |
| Full Feature, cross-team / needs non-technical sign-off | `BRD.md` + `PRD.md` + `SRS.md` + `user-stories.md` |

If unsure which Full Feature row applies, ask the user once — don't default
to producing all four for every feature; that's the over-classification
failure mode `intake-classifier` exists to prevent.

## 2. Assign IDs and write

**BRD.md** (business audience — leadership, product owner): problem
statement, target personas, success metrics, MoSCoW summary. No technical
detail. Pulled from Stage 1 of `01-elicitation.md` and Stage 5's MoSCoW
table.

**PRD.md** (product/design audience): BRD content plus the TO-BE experience
from `02-gap-analysis.md`, UX states from `03-domain-model.md` §6, and scope
boundaries (MoSCoW Must/Should/Could, with Won't-Have stated explicitly).

**SRS.md** (dev/QA/architect audience — the precise, testable layer):

```markdown
### REQ-STREAK-001: Streak freeze prevents daily reset
**Category**: Gamification
**Priority**: Must-Have
**Status**: Draft
**Description**: <precise, testable statement>
**Derived from**: BR-STREAK-004, ASM-STREAK-002
**Business Rules**: BR-STREAK-004
**Non-Functional Requirements**: <performance/security if applicable>
**Dependencies**: <other REQ IDs, if any>
```

Every `REQ-` ID must cite the `BR-`/`ASM-`/gap-analysis item it came from in
**Derived from** — this line is what makes `spec-validator`'s traceability
check possible later.

**user-stories.md** (always produced):

```markdown
### US-STREAK-001: <Title>
**As a** <role>
**I want to** <action>
**So that** <business value>
**Traces to**: REQ-STREAK-001

**Acceptance Criteria**:
- **Scenario 1 (happy path)**
  - Given <precondition>
  - When <action>
  - Then <expected result>
- **Scenario 2 (edge case)**
  - Given <precondition>
  - When <abnormal action>
  - Then <graceful handling>
```

Pull edge-case scenarios directly from `03-domain-model.md` §4 (Workflows &
edge cases) — every edge case documented there should show up as a Scenario
2+ somewhere, not just the happy path.

## 3. Update the baseline

Once all documents for this protocol are written, compile the full
**Domain Decision Baseline** into `baseline.md` (still `Status: DRAFT` —
only `handover` marks it signed off):

1. Business summary & problem statement
2. Gap analysis summary (Full Feature only)
3. Approved domain model summary (RBAC, states, rules — link to
   `03-domain-model.md`, don't duplicate)
4. MoSCoW table (link to `04-risk-register.md`)
5. Link to the full spec document set
6. Open risks accepted rather than mitigated (from `04-risk-register.md`)

## 4. Hand off

Proceed to `spec-validator`. Append one line to `CHANGELOG.md`.

## Exit checklist

- [ ] Correct document set chosen for the protocol/audience — not
      over-produced
- [ ] Every REQ has a **Derived from** line citing an upstream `BR-`/`ASM-`/
      gap item — none invented fresh at this stage
- [ ] Every user story has both a happy-path and an edge-case scenario
- [ ] Every edge case from `03-domain-model.md` §4 appears in at least one
      user story
- [ ] `baseline.md` compiled (still DRAFT), `CHANGELOG.md` updated
