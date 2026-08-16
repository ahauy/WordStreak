---
name: intake-classifier
description: >
  MANDATORY first step whenever a new WordStreak feature, user story, bug-driven
  change, or business request is raised — before any elicitation, design, spec,
  or code. Classifies the request's complexity (Spike / Bounded Task / Full
  Feature) using measurable criteria, selects the right depth of the WordStreak
  BA Pipeline, and creates the feature's working folder. Trigger this whenever
  the user says things like "add a feature", "we need to support...", "can we
  change how X works", "new user story", or describes a product change of any
  size — even if they don't say the word "requirements" or "spec". Do not skip
  straight to elicitation-interview, domain-modeling, or code without running
  this classification first.
---

# Intake Classifier

Phase 1, Stage 0 of the WordStreak BA Pipeline. This skill's only job is to
answer two questions before anyone writes a single requirement: **how big is
this, really**, and **which protocol does that size call for**. Getting this
wrong in either direction wastes effort — over-classifying turns a one-field
tweak into a week of interviews; under-classifying lets a cross-cutting
change sneak through without RBAC, migration, or contradiction review.

See `/README.md` in this pack for the full pipeline, shared file layout, and
ID conventions — this skill creates that folder structure.

## 1. Classify

Ask yourself these measurable questions about the request. Don't classify on
vibes — count.

| Signal | Spike | Bounded Task | Full Feature |
|---|---|---|---|
| New or changed domain entities | 0 | 0–1 | 2+ |
| Existing DB schema change required | No | Maybe (additive only) | Likely (structural) |
| Screens/flows touched | 0 (research only) | 1 | 2+ |
| User roles affected | N/A | 1 | 2+ |
| Cross-cutting (auth, billing, gamification core) | No | No | Often |
| Reversible without user-facing consequence | N/A | Yes | Not always |

If signals disagree (e.g. 1 entity but cross-cutting), classify up, not down.
When genuinely on the boundary, say so explicitly to the user and give your
default with the reasoning — don't silently pick one.

- **Spike / Feasibility** — a research question, technical exploration, or
  "is this even possible" ask. No lasting product commitment yet.
- **Bounded Task** — a small, well-scoped change to an existing flow (add a
  field, tweak a validation rule, adjust a threshold).
- **Full Feature / Epic** — a new user flow, new domain entity, cross-cutting
  change, or anything touching the gamification core (streaks, XP, spaced
  repetition) or auth/RBAC.

## 2. Select the protocol

| Classification | Required protocol |
|---|---|
| Spike | Short technical summary + trade-off note. **Pipeline stops here** — do not create a feature folder, do not proceed to `elicitation-interview`. |
| Bounded Task | Rapid interview (2–3 targeted questions), then stages 4, 5 (light), 6 (User Story only), 7, 8. Stage 3 (`gap-analysis`) is skipped. |
| Full Feature | Full pipeline, stages 1–8, all at full depth. |

State the classification and protocol out loud to the user before doing
anything else, e.g.:

> This looks like a **Full Feature** (new entity: `StreakFreezeItem`, touches
> the gamification core, affects two roles). I'll run the full BA pipeline —
> starting with a structured interview.

If the user disagrees with the classification, defer to them but log the
override (see Exit checklist) rather than silently reclassifying.

## 3. Initialize the feature folder (Bounded Task and Full Feature only)

Pick a short kebab-case `<feature-slug>` from the request (e.g.
`streak-freeze-item`). Create:

```
.specify/features/<feature-slug>/
├── 00-intake.md
├── baseline.md
└── CHANGELOG.md
```

**`00-intake.md` template:**

```markdown
# Intake: <Feature Title>

- **Date**: <date>
- **Requested by**: <persona/stakeholder if known>
- **Classification**: Spike | Bounded Task | Full Feature
- **Classification signals**: <the counts from the table above>
- **Protocol selected**: <stage list this feature will run>
- **Override**: <none | user overrode classification from X to Y, reason: ...>

## One-line problem statement
<one sentence — expanded properly in elicitation-interview Stage 1>
```

**`baseline.md`** starts as a stub:

```markdown
# Domain Decision Baseline: <Feature Title>

**Status**: DRAFT
**Version**: 0.1-draft

This document is compiled incrementally by every stage of the WordStreak BA
Pipeline. Do not hand-edit sections owned by another skill.

## Stage 0 — Intake
See `00-intake.md`.
```

**`CHANGELOG.md`** starts as:

```markdown
# Changelog: <Feature Title>

- v0.1-draft — <date> — Feature folder created by intake-classifier. Classified as <X>.
```

## 4. Hand off

- **Spike** → answer directly in this turn. Nothing to hand off.
- **Bounded Task / Full Feature** → tell the user you're proceeding to
  `elicitation-interview`, and note which protocol depth it should use (this
  is already recorded in `00-intake.md`, so `elicitation-interview` can read
  it directly rather than being told again).

## Exit checklist

- [ ] Classification stated out loud with the signals that drove it
- [ ] Protocol selected and stage list is unambiguous
- [ ] If the user overrode the classification, the override and reason are
      logged in `00-intake.md`, not silently applied
- [ ] For Bounded/Full: feature folder created with `00-intake.md`,
      `baseline.md`, `CHANGELOG.md`
- [ ] For Spike: no feature folder created, no downstream skill invoked
