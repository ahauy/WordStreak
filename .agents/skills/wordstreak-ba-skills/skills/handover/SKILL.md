---
name: handover
description: >
  Use for WordStreak Bounded Task or Full Feature work as the final step,
  once spec-validator has returned a clean pass (or explicitly accepted
  gaps). Finalizes and version-locks the Domain Decision Baseline, produces a
  short handover brief for development, and formally hands off to
  implementation (e.g. speckit-specify or the dev team directly). Trigger
  this whenever validation has passed and the user is ready to move from
  business analysis into implementation. Do not let code, prototyping, or
  technical file drafting begin before this skill has signed off the
  baseline — that is the pipeline's core rule.
---

# Handover

Phase 3, Stage 8 — the final gate. Nothing in this pipeline authorizes
writing implementation code; that authorization is what this skill grants,
and only after every upstream checklist is green.

## 1. Confirm the exit gate

Before doing anything else, verify against `validation-report.md` and every
upstream file:

- [ ] Problem statement and success metrics clearly defined (Stage 2)
- [ ] AS-IS, GAP, TO-BE documented — Full Feature only (Stage 3)
- [ ] All required pillars modeled without silent assumptions (Stage 4)
- [ ] MoSCoW complete with explicit Won't-Have (Stage 5)
- [ ] Contradiction scan passed with zero unresolved conflicts (Stage 5)
- [ ] Every user story has testable Given-When-Then acceptance criteria
      (Stage 6)
- [ ] Spec validation passed, or failures explicitly accepted (Stage 7)

If any box is unchecked, stop and go back to the owning stage — do not sign
off a baseline with open items, even under time pressure. If the user
insists on proceeding anyway, log it exactly like `spec-validator` does:
an explicit accepted gap with their reasoning, not a silent skip.

## 2. Sign off the baseline

Update `baseline.md`:

```markdown
**Status**: SIGNED-OFF
**Version**: 1.0
**Signed off by**: <user, date>
```

From this point, `baseline.md` and the `spec/` documents are locked as
written. Any further scope change is a **new** version, not an edit to the
signed-off one — see §4.

## 3. Produce the handover brief

A short, dev-facing summary (not a re-statement of the full spec — link to
it):

```markdown
# Handover Brief: <Feature Title>

**Baseline version**: 1.0 (signed off <date>)
**Spec documents**: spec/SRS.md, spec/user-stories.md [, BRD.md, PRD.md]
**Traceability matrix**: traceability-matrix.md

## What's being built
<2-3 sentences>

## What's explicitly out of scope
<from the MoSCoW Won't-Have list>

## Known accepted risks/gaps
<from validation-report.md and 04-risk-register.md, if any>

## Next step
Invoke `speckit-specify` (or hand to the dev team) to generate
`.specify/features/<feature-slug>/spec.md` implementation artifacts.
```

## 4. Change management after sign-off

If new information surfaces after handover that changes scope or a business
rule:

- Don't edit the signed-off `baseline.md` section in place.
- Append a new `CHANGELOG.md` entry (e.g. `v1.1 — <date> — <what changed and
  why>`), and route the actual change through whichever upstream stage owns
  it (a new business rule → `domain-modeling`; a new risk →
  `risk-contradiction-scanner`; a requirement wording fix →
  `spec-writer` → `spec-validator` again).
- Bump `baseline.md`'s version once the change is itself validated — the
  baseline is always either the last signed-off version or a draft of the
  next one, never a silently-edited hybrid.

## Exit checklist

- [ ] Full exit gate from §1 confirmed, all boxes checked or explicitly
      accepted
- [ ] `baseline.md` marked `SIGNED-OFF` with a version number
- [ ] Handover brief written and links to the real documents rather than
      duplicating them
- [ ] User explicitly told what's next (who/what receives the handoff)
- [ ] `CHANGELOG.md` updated with the sign-off entry
