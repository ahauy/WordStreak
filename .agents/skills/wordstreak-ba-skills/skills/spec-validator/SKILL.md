---
name: spec-validator
description: >
  Use for WordStreak Bounded Task or Full Feature work immediately after
  spec-writer produces its documents. Checks every requirement and user story
  against the ISO/IEC/IEEE 29148 quality criteria (necessary, unambiguous,
  complete, singular, feasible, verifiable, consistent, traceable) and builds
  the requirement traceability matrix (business goal → requirement → user
  story → acceptance criteria). Trigger this whenever a spec document set
  exists but hasn't been validated yet, or whenever the user asks to "review
  the spec" or "check these requirements." On failure this sends the spec
  back to spec-writer for revision — never silently accept a spec with
  unresolved quality issues, and never proceed to handover without a clean
  pass or an explicit, logged user override.
---

# Spec Validator

Phase 2, Stage 7 — the pipeline's second and final quality gate, and the
only stage with a loop-back. Its job is adversarial: assume the spec has a
problem and try to find it, rather than skimming for confirmation.

## 1. Run the IEEE 29148 checklist

For **every** `REQ-` and `US-` item in `spec/SRS.md` and
`spec/user-stories.md`, check:

| Criterion | Fails if... |
|---|---|
| Necessary | It doesn't trace to a business goal, `BR-`, or `ASM-` item |
| Unambiguous | It can reasonably be read two different ways |
| Complete | Implementing it exactly as written still requires guessing something |
| Singular (atomic) | It bundles more than one distinct requirement in one ID |
| Feasible | It conflicts with a known technical or timeline constraint |
| Verifiable | No test or acceptance criterion could confirm it's been met |
| Consistent | It contradicts another `REQ-`/`US-` or a `BR-` from the domain model |
| Traceable | It has no ID, or its **Derived from** line is missing/broken |

Log every failure with the specific ID and criterion — "REQ-STREAK-003
fails Unambiguous: 'promptly' has no defined time bound" — not a general
impression.

## 2. Build the traceability matrix

```markdown
| Business Goal | REQ/BR | User Story | Acceptance Criteria | Test Case |
|---|---|---|---|---|
| +15% 7-day retention | REQ-STREAK-001 | US-STREAK-001 | Scenario 1, 2 | (assigned at test-design time) |
```

Every row must have an unbroken chain from goal to acceptance criteria. A
`REQ-` with no `US-` pointing to it, or a `US-` with no `REQ-` in its
**Traces to**, is a traceability gap — log it as a checklist failure too.

## 3. Decide: pass or send back

- **All criteria pass, matrix has no gaps** → proceed to §4.
- **Any failure** → do not proceed. Write the specific failures to
  `validation-report.md`, then hand control back to `spec-writer` with the
  exact IDs and criteria that need fixing. Re-run this skill once
  `spec-writer` reports the revision is done. This is the pipeline's only
  loop — don't try to patch the spec yourself from inside this skill.
- **User wants to proceed despite a failure** → allowed, but log it as an
  explicit accepted gap in `validation-report.md` with the user's reasoning,
  not a silent pass.

## 4. Record

```markdown
# Validation Report: <Feature Title>

**Result**: PASS | FAIL | PASS WITH ACCEPTED GAPS
**Date**: ...
**Iteration**: <n>th pass

## Checklist results
| ID | Criterion | Result | Note |
|---|---|---|---|

## Traceability gaps
- ...

## Accepted gaps (if any)
- <ID> — <criterion failed> — accepted because: <user's reasoning>
```

## 5. Hand off

On a clean pass (or explicitly accepted gaps), proceed to `handover`. Append
one line to `CHANGELOG.md`.

## Exit checklist

- [ ] Every `REQ-` and `US-` checked against all 8 IEEE 29148 criteria
- [ ] Traceability matrix has no unbroken-chain gaps, or gaps are logged
- [ ] Any failure either triggered a `spec-writer` revision loop or was
      explicitly accepted and logged with reasoning
- [ ] `validation-report.md`, `traceability-matrix.md`, `CHANGELOG.md`
      updated
