---
name: wordstreak-ba-skills
description: >
  Orchestrator entry-point for the WordStreak 8-stage Business Analysis
  pipeline. Read this skill first whenever you need to run any BA stage —
  it tells you which sub-skill to invoke and in what order, based on the
  protocol selected by intake-classifier (Spike / Bounded Task / Full
  Feature). Trigger this whenever you are about to start Phase 1 of the
  WordStreak pipeline and are unsure which sub-skill to call next, or
  whenever a stage transition needs a routing decision.
metadata:
  stage: "BA Pipeline — Orchestrator (all stages)"
  phase: "Phase 1: Business Analysis"
  model_recommendation: "Extended thinking preferred for routing decisions"
---

# WordStreak BA Skill Pack — Orchestrator

This skill is the **index and router** for the 8 BA sub-skills that live
alongside it. It does not perform analysis itself — it directs you to the
right sub-skill for each stage.

All sub-skills share the file layout described in `README.md` in this
folder. Read `README.md` once when you first start Phase 1.

---

## Pipeline Map

```
Stage 1  intake-classifier          → Classify & create feature folder
Stage 2  elicitation-interview      → Structured 6-pillar interview
Stage 3  gap-analysis               → AS-IS / TO-BE / GAP (Full Feature only)
Stage 4  domain-modeling            → RBAC, state machines, BR- IDs, ERD
Stage 5  risk-contradiction-scanner → Risk register, MoSCoW, contradictions
Stage 6  spec-writer                → BRD / PRD / SRS / User Stories
Stage 7  spec-validator             → IEEE 29148 quality gate + traceability
Stage 8  handover                   → Baseline SIGNED-OFF v1.0, dev brief
```

---

## Routing by Protocol

| Protocol             | Stages to run |
| -------------------- | ------------- |
| **Spike**            | Stage 1 only. No folder created. Pipeline stops here. |
| **Bounded Task**     | 1 → 2 (2-3 questions) → 4 (light) → 5 (light) → 6 (user-stories only) → 7 → 8 |
| **Full Feature**     | 1 → 2 → 3 → 4 → 5 → 6 → 7 → 8, all at full depth |

Protocol is decided by `intake-classifier` (Stage 1) and recorded in
`.specify/features/<slug>/00-intake.md`. Every downstream sub-skill reads
`00-intake.md` to know its own depth — you do not need to pass the protocol
explicitly.

---

## Stage Transition Rules

1. **Never start a stage before the previous stage's exit checklist is green.**
   Each sub-skill ends with an explicit exit checklist. If any item is
   unchecked, the current stage is not done.

2. **The only loop is Stage 7 → Stage 6.**
   If `spec-validator` fails a requirement or user story, send it back to
   `spec-writer` for revision, then re-validate. All other transitions are
   one-directional.

3. **User overrides must be logged, not silently applied.**
   If the user disagrees with a classification or asks to skip a stage,
   record the override and reason in `00-intake.md` or `CHANGELOG.md`.

---

## How to Invoke a Sub-skill

Reference each sub-skill by its folder name. The sub-skill's `SKILL.md`
contains its own detailed instructions. Example routing sequence:

```
You: [read this orchestrator skill]
You: [read .agents/skills/intake-classifier/SKILL.md]  → run Stage 1
You: [read .agents/skills/elicitation-interview/SKILL.md] → run Stage 2
...
You: [read .agents/skills/handover/SKILL.md] → run Stage 8
```

Do not hold the content of all 8 sub-skills in context at once. Load each
one only when you are about to execute that stage.

---

## Output Location

Every sub-skill writes into:

```
.specify/features/<feature-slug>/
```

See `README.md` in this folder for the complete file layout and ID
conventions (`BR-`, `REQ-`, `US-`, `ASM-`, `RISK-`).

---

## Exit Gate (this orchestrator)

This skill has no exit checklist of its own — the exit gate for Phase 1
as a whole is owned by `handover` (Stage 8). When `handover` marks
`baseline.md` as `SIGNED-OFF v1.0`, Phase 1 is complete and the pipeline
advances to `speckit-specify`.
