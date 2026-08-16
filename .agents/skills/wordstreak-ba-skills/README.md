# WordStreak BA & Implementation Skill Pack

Nine skills implementing an end-to-end business-analysis-to-implementation pipeline
for the WordStreak product. They combine BABOK v3, IREB CPRE, and
ISO/IEC/IEEE 29148 practices into a gated pipeline: **no code, no
specification, and no stage begins until the stage before it has been
explicitly signed off.**

## Pipeline

```
PHASE 1 — Business Analysis
  1. intake-classifier          → classifies complexity, selects a protocol
  2. elicitation-interview      → structured 6-pillar interview
  3. gap-analysis               → AS-IS / TO-BE / GAP (Full Feature only)
  4. domain-modeling            → RBAC, state machines, business rules, ERD
  5. risk-contradiction-scanner → risk register, contradiction scan, MoSCoW

PHASE 2 — Specification
  6. spec-writer                → BRD / PRD / SRS / User Stories
  7. spec-validator             → IEEE 29148 checklist + traceability matrix
                                   (loops back to spec-writer on failure)

PHASE 3 — Handover
  8. handover                   → baseline sign-off, version, dev handoff

PHASE 4 — Implementation & Review
  9. implementation-orchestrator → vertical slice delegation, isolated subagents,
                                   adversarial fresh-context review
```

Routing by protocol (decided by `intake-classifier`):

| Protocol                | Stages run                                                                                             |
| ----------------------- | ------------------------------------------------------------------------------------------------------ |
| **Spike / Feasibility** | 1 only. Short technical note, no baseline.                                                             |
| **Bounded Task**        | 1 → 2 (2–3 targeted questions) → 4 (light) → 5 (light) → 6 (User Story only) → 7 → 8. Stage 3 skipped. |
| **Full Feature / Epic** | 1 → 2 → 3 → 4 → 5 → 6 → 7 → 8, full depth.                                                             |

The only loop in the pipeline is 7 → 6: if `spec-validator` fails an item, it
sends the spec back to `spec-writer` for revision, then re-validates. Every
other transition is one-directional.

## Shared file convention

All skills read and write a single per-feature folder:

```
.specify/features/<feature-slug>/
├── 00-intake.md              # intake-classifier
├── 01-elicitation.md         # elicitation-interview
├── 02-gap-analysis.md        # gap-analysis (Full Feature only)
├── 03-domain-model.md        # domain-modeling
├── 04-risk-register.md       # risk-contradiction-scanner
├── spec/
│   ├── BRD.md                # spec-writer (Full Feature, cross-team only)
│   ├── PRD.md                # spec-writer (Full Feature only)
│   ├── SRS.md                # spec-writer (functional + non-functional reqs)
│   └── user-stories.md       # spec-writer (always produced)
├── test-plan.md              # Phase 5 (TDD — written BEFORE code, from .specify/templates/test-plan.md)
├── traceability-matrix.md    # spec-validator
├── validation-report.md      # spec-validator
├── baseline.md                # living Domain Decision Baseline, all skills append
└── CHANGELOG.md               # version history, all skills append an entry
```

`<feature-slug>` is a short kebab-case name for the feature (e.g.
`streak-freeze-item`). `intake-classifier` creates the folder and the first
four files (`baseline.md`, `CHANGELOG.md` included) on first run; every
downstream skill reads what it needs and appends its own section rather than
overwriting another skill's section.

## ID conventions

- Requirements: `REQ-<SLUG>-###` (e.g. `REQ-STREAK-001`)
- User stories: `US-<SLUG>-###` (e.g. `US-STREAK-001`)
- Business rules: `BR-<SLUG>-###` (e.g. `BR-STREAK-001`)
- Risks: `RISK-<SLUG>-###`
- Assumptions: `ASM-<SLUG>-###`
- `<SLUG>` is the feature slug, upper-cased, truncated to a short recognizable
  token (e.g. `streak-freeze-item` → `STREAK`).

IDs are assigned once, by `domain-modeling` (`BR-` for business rules
referenced later) and `spec-writer` (`REQ-`/`US-`), and never renumbered —
later skills only append status or link to existing IDs. This is what makes the
`traceability-matrix.md` in stage 7 possible.

## Baseline versioning

`baseline.md` and `CHANGELOG.md` exist from stage 1 onward but stay in
`DRAFT` status until `handover` (stage 8) marks a version `SIGNED-OFF`. Every
skill that materially changes scope, rules, or requirements after that point
appends a new `CHANGELOG.md` entry with a bumped version — it never edits a
signed-off section in place. This gives the project an audit trail of what
was decided when, matching the "No Silent Assumptions" and "Scope Integrity"
principles the whole pack is built on.

## Quality gates

Every skill ends with an explicit exit checklist. A skill must not report
"done" — and the next skill must not start — while its own checklist has
unchecked items, unless the person explicitly overrides the gate (which
`intake-classifier` and `spec-validator` log as an accepted risk, not a
silent skip).

## Installing

```
cp -r skills/* ~/.claude/skills/
```

Each skill's `SKILL.md` frontmatter `description` is written to trigger on
WordStreak feature/requirement work without the user needing to name the
skill explicitly — see the individual files for the exact trigger phrases.
