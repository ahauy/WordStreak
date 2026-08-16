---
name: gap-analysis
description: >
  Use for WordStreak Full Feature work, after elicitation-interview has
  captured business value and the 6 pillars. Documents AS-IS (current system
  or manual workaround), TO-BE (target end-to-end experience), and the
  functional/data/user-impact/transition gaps between them. Trigger this
  whenever a Full Feature baseline is being built, whenever the user
  describes how something works "today" vs how they want it to work, or
  whenever a change could break or migrate existing user data or workflows.
  Not used for Bounded Tasks — intake-classifier's protocol selection skips
  this stage for small, well-scoped changes.
metadata:
  stage: "BA Pipeline — Stage 3 of 8 (Full Feature only)"
  phase: "Phase 1: Business Analysis"
  model_recommendation: "Extended thinking preferred — requires self-directed code/schema inspection and gap reasoning"
  prev_skill: "elicitation-interview"
  next_skill: "domain-modeling"
---

# Gap Analysis

Phase 1, Stage 3. Only runs for **Full Feature** protocol — check
`00-intake.md` before starting; if the protocol is Bounded Task, skip
straight to `domain-modeling` and don't invoke this skill at all.

The purpose here is narrow but easy to skip past: don't just describe the
new feature — describe the *delta*, including what breaks, what migrates,
and who has to be told.

## 1. AS-IS — current state

Read `01-elicitation.md` for what the user has already said. If there's
existing code, database schema, or documentation to inspect, do that
investigation yourself (document/code analysis) rather than asking the user
to describe their own system from memory — bring findings back, don't just
ask more questions.

- How does the system or user handle this scenario today?
- What are the current limitations, bottlenecks, or manual workarounds?
- If nothing exists today, say so explicitly — "AS-IS: no equivalent
  functionality" is a valid and important answer.

## 2. TO-BE — target state

- What is the ideal end-to-end user experience once this ships?
- What does the system do differently from AS-IS, concretely?

## 3. Gap analysis

Break the gap into four categories — the fourth is easy to forget and
causes the most downstream pain when skipped:

- **Functional gaps** — new domain logic, new user interactions required.
- **Data gaps** — schema changes, new tables/columns, backward-compatibility
  handling for existing records.
- **User impact** — will existing user workflows change? Do users need a
  migration notice, a one-time modal, re-onboarding?
- **Transition requirements** — requirements that exist *only* during the
  changeover, not in the final TO-BE state:
  - Data migration scripts and their rollback plan
  - Whether old and new behavior must run in parallel for a period
    (dual-run), and for how long
  - User communication/training needed before or at launch
  - Any feature flag or staged-rollout plan

## 4. Record

Append to `02-gap-analysis.md`:

```markdown
# Gap Analysis: <Feature Title>

## AS-IS
...

## TO-BE
...

## Functional gaps
- ...

## Data gaps
- ...

## User impact
- ...

## Transition requirements
- ...
```

Append a short pointer to this file's summary under `baseline.md`'s Stage 3
section — don't duplicate the full content, link to it.

## 5. Hand off

Proceed to `domain-modeling`, which will read both `01-elicitation.md` and
`02-gap-analysis.md`. Append one line to `CHANGELOG.md`.

## Exit checklist

- [ ] AS-IS documented (or explicitly "none")
- [ ] TO-BE documented as the concrete end-to-end experience
- [ ] All four gap categories addressed, including Transition requirements
- [ ] Data gaps specifically checked against existing schema, not assumed
- [ ] `02-gap-analysis.md`, `baseline.md`, `CHANGELOG.md` updated
