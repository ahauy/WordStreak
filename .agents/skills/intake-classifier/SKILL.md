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
metadata:
  stage: "BA Pipeline — Stage 1 of 8"
  phase: "Phase 1: Business Analysis"
  model_recommendation: "Extended thinking preferred (Claude Sonnet Thinking / Gemini Flash Thinking)"
  next_skill: "elicitation-interview"
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

**Step 0 — Micro Task fast-path (check this first):**

A request is a **Micro Task** if ALL four conditions hold:

1. Changes ≤ 1 existing file (no new files created)
2. Estimated diff < 50 lines
3. No new DB schema column/table/migration required
4. No new API endpoint or route required

If it qualifies as a Micro Task → **skip the BA pipeline entirely**, go straight
to code. No feature folder, no elicitation, no gates. Just implement & verify.

---

**For everything else**, use the signals table:

| Signal                                           | Spike             | Bounded Task          | Full Feature        |
| ------------------------------------------------ | ----------------- | --------------------- | ------------------- |
| New or changed domain entities                   | 0                 | 0–1                   | 2+                  |
| Existing DB schema change required               | No                | Maybe (additive only) | Likely (structural) |
| Screens/flows touched                            | 0 (research only) | 1                     | 2+                  |
| User roles affected                              | N/A               | 1                     | 2+                  |
| Cross-cutting (auth, billing, gamification core) | No                | No                    | Often               |
| Reversible without user-facing consequence       | N/A               | Yes                   | Not always          |

If signals disagree (e.g. 1 entity but cross-cutting), classify up, not down.
When genuinely on the boundary, say so explicitly to the user and give your
default with the reasoning — don't silently pick one.

- **Micro Task** — ≤1 file changed, <50 lines, no new DB/API. Zero gates. Straight to code.
- **Spike / Feasibility** — a research question, technical exploration, or
  "is this even possible" ask. No lasting product commitment yet.
- **Bounded Task** — a small, well-scoped change to an existing flow (add a
  field, tweak a validation rule, adjust a threshold).
- **Full Feature / Epic** — a new user flow, new domain entity, cross-cutting
  change, or anything touching the gamification core (streaks, XP, spaced
  repetition) or auth/RBAC.

## 2. Select the protocol

| Classification | Gates | Required protocol                                                                                                  |
| -------------- | ----- | ------------------------------------------------------------------------------------------------------------------ |
| Micro Task     | 0     | **No pipeline.** Implement directly. Run `pnpm test` after. No feature folder created.                             |
| Spike          | 0     | Short technical summary + trade-off note. **Pipeline stops here** — no feature folder, no `elicitation-interview`. |
| Bounded Task   | 1     | Rapid interview (2–3 questions) + draft spec shown together → **single Gate** for user confirm → implement.        |
| Full Feature   | 2     | Full pipeline, stages 1–8. Gate 1 (elicitation) + Gate 2 (spec/plan sign-off).                                     |

> **Bounded Task optimization**: After elicitation, the system-architect drafts `spec.md` + `plan.md` in the **same turn** and presents a combined summary for user approval — eliminating the second separate stop.

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

- **Micro Task** → implement directly in this turn. No feature folder. Verify with `pnpm test` after.
- **Spike** → answer directly in this turn. Nothing to hand off.
- **Bounded Task / Full Feature** → tell the user you're proceeding to
  `elicitation-interview`, and note which protocol depth it should use (this
  is already recorded in `00-intake.md`, so `elicitation-interview` can read
  it directly rather than being told again).

## Exit checklist

- [ ] Classification stated out loud with the signals that drove it
- [ ] Protocol selected and stage list is unambiguous
- [ ] **Micro Task**: no feature folder created, code implemented, `pnpm test` passed
- [ ] If the user overrode the classification, the override and reason are
      logged in `00-intake.md`, not silently applied
- [ ] For Bounded/Full: feature folder created with `00-intake.md`,
      `baseline.md`, `CHANGELOG.md`
- [ ] For Spike: no feature folder created, no downstream skill invoked
