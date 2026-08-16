---
name: domain-modeling
description: >
  Use for WordStreak Bounded Task or Full Feature work, after elicitation (and
  gap-analysis, if run) to turn interview answers into concrete domain
  artifacts — RBAC matrix, entity state machines, business rules/algorithms
  with assigned IDs, ERD, and non-functional requirements including
  i18n/accessibility/observability and gamification anti-abuse rules. Trigger
  this whenever a feature needs its access rules, entity lifecycle, streak/XP
  formulas, or data model made explicit and unambiguous before writing a
  spec. Do not let domain logic stay implicit — every state, rule, and role
  boundary from elicitation should end up modeled here.
metadata:
  stage: "BA Pipeline — Stage 4 of 8"
  phase: "Phase 1: Business Analysis"
  model_recommendation: "Extended thinking preferred — complex state machine and business rule formalization"
  prev_skill: "gap-analysis (Full Feature) or elicitation-interview (Bounded Task)"
  next_skill: "risk-contradiction-scanner"
---

# Domain Modeling

Phase 1, Stage 4. Converts elicitation answers (and gap analysis, if
present) into structured, checkable models. This is where ambiguity dies —
if a rule can't be stated precisely enough to put in this document, it isn't
ready for a spec yet; go back to `elicitation-interview` for that piece.

For Bounded Task protocol, only build the sub-sections that are actually
relevant to the change (check `00-intake.md`); skip the rest rather than
padding them out.

## 1. RBAC matrix

Table of role × (Create/View/Edit/Delete/Share), for every role touched:
`Guest`, `Learner`, `Pro Subscriber`, `System Admin`, `Content Creator`.
Explicitly state ownership rules (can users only touch their own
decks/flashcards?) and guest/unauthenticated preview limits.

## 2. State machine & entity lifecycle

For every entity whose lifecycle changes or is introduced, draw the finite
state machine as a Mermaid `stateDiagram-v2` block (or a simple
state-transition table if Mermaid isn't practical), including:

- Every named state and its exact transition triggers (user action,
  scheduled job, AI grading, etc.)
- Terminal states
- Rollback / cancellation recovery states

## 3. Business rules & algorithms

Every formula, threshold, or validation gets a `BR-<SLUG>-###` ID so
`spec-writer` and `spec-validator` can trace it later:

```markdown
**BR-STREAK-004**: Streak increments once per calendar day in the user's
local timezone at time of the qualifying review; grace period is 4 hours
past local midnight.
```

Cover at minimum: field validations (length, charset, uniqueness, daily
limits), core algorithms (SM-2 easiness factor and repetition intervals,
streak calculation including timezone/grace-period handling, XP/reward
tables), and rate limits per user tier.

**Anti-abuse pass (mandatory whenever a rule affects streaks, XP, or any
reward):** for each such rule, explicitly note how it resists gaming —
timezone/clock manipulation, rapid-repeat submission to farm rewards,
scripted/automated review completion. If a rule has no abuse resistance
noted, ask the user whether that's acceptable or needs one before moving on.

## 4. Workflows & edge cases

Restate the happy path from elicitation as a numbered sequence, then confirm
each negative/resiliency scenario has a concrete resolution (not just "TBD"):
offline/sync conflict resolution strategy, concurrency handling, idempotency
mechanism, session-expiry behavior, cancel/abandon cleanup.

## 5. Entities, data boundaries & privacy

- Entity/attribute/relation sketch as a Mermaid `erDiagram` block.
- Deletion policy per entity: hard delete vs soft delete (`deletedAt`),
  cascade behavior.
- Data retention/purge schedule if the entity holds user content.
- If minors may use this feature (flagged in elicitation Pillar 5), note
  which additional compliance constraints apply (e.g. stricter deletion
  rights, no behavioral profiling) rather than defaulting to the adult-user
  data policy.

## 6. UX states & non-functional requirements

- UX states: empty, loading (skeleton vs spinner, optimistic UI), error
  (inline vs toast vs modal), feedback/recovery (undo windows).
- Performance targets (P95 latency, load time).
- Security: input sanitization, injection protection, auth mechanism.
- **i18n/l10n**: which languages this feature must support at launch,
  RTL handling if applicable, translation workflow for new content.
- **Accessibility**: target conformance level (e.g. WCAG 2.1 AA) for any
  new UI surface.
- **Observability**: what gets logged/monitored/alerted for this feature's
  critical paths (e.g. streak-reset job, spaced-repetition scheduler).

## 7. Record

Append all of the above to `03-domain-model.md`, and link (don't duplicate)
a summary into `baseline.md`'s Stage 4 section.

## 8. Hand off

Proceed to `risk-contradiction-scanner`. Append one line to `CHANGELOG.md`.

## Exit checklist

- [ ] RBAC matrix covers every role touched, ownership rules explicit
- [ ] Every entity with a lifecycle has a state diagram with named triggers
- [ ] Every business rule has a `BR-` ID and, if reward-related, an
      anti-abuse note
- [ ] Every edge case from elicitation has a concrete resolution, not "TBD"
- [ ] ERD covers deletion policy and retention for every entity
- [ ] i18n, accessibility, and observability addressed (or explicitly N/A
      with reason)
- [ ] `03-domain-model.md`, `baseline.md`, `CHANGELOG.md` updated
