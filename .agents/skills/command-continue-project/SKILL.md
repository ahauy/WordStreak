---
name: command-continue-project
description: >-
  Activated when the user types /command-continue-project (or shortcuts /continue, /next, /auto-continue-project).
  Automatically scans docs/PRODUCT_BACKLOG_ROADMAP.md, identifies the next uncompleted User Story or Task,
  and activates the WordStreak development pipeline (BA Pipeline -> Speckit -> TDD -> Docs).
triggers:
  - "/command-continue-project"
  - "/continue"
  - "/next"
  - "/auto-continue-project"
  - "continue project"
  - "next roadmap task"
  - "work on next user story"
---

# Command: Continue Project Workflow (/command-continue-project)

This command skill automatically inspects project progress in [PRODUCT_BACKLOG_ROADMAP.md](../../docs/PRODUCT_BACKLOG_ROADMAP.md) and triggers the next development phase in full compliance with [AGENTS.md](../../.agents/AGENTS.md) and [wordstreak-workflow](../wordstreak-workflow/SKILL.md).

---

## Execution Workflow

### Step 1: Scan Backlog & Roadmap

1. Read `docs/PRODUCT_BACKLOG_ROADMAP.md`.
2. Determine the current active Sprint and find the first User Story with status:
   - `[/]` (In Progress / Partially completed)
   - Or `[ ]` (To Do / Next in backlog)
3. Extract the US ID (e.g., `US-CARD-02`, `US-SRS-01`), story title, and Acceptance Criteria (AC).

### Step 2: Inspect Current Story Deliverables

1. Check `.specify/features/<slug>/` and `specs/<num>-<slug>/` to determine the current state:
   - Domain Baseline (`baseline.md` - is it `SIGNED-OFF`?)
   - Speckit artifacts (`spec.md`, `plan.md`, `tasks.md`)
   - Test Plan (`test-plan.md`)
   - Source code and test implementation progress.

### Step 3: Route & Execute the Appropriate Phase

#### Case A: No Domain Baseline (Net-New Feature)

- Activate **Phase 1: BA Skill Pack**:
  - Run `intake-classifier` to determine complexity (Bounded Task vs Full Feature) and create `.specify/features/<slug>/`.
  - Execute `elicitation-interview`, `domain-modeling`, `risk-contradiction-scanner`, `spec-writer`, `spec-validator`, and `handover`.
  - Pause at checkpoints requiring user input or domain clarification.

#### Case B: Domain Baseline SIGNED-OFF but Technical Plan Missing

- Activate **Phase 2, 3, 4: Speckit Pipeline**:
  - Run `speckit-specify` -> create `spec.md`.
  - Run `speckit-plan` -> create `plan.md`, `data-model.md`, `contracts/`.
  - Run `speckit-tasks` -> create `tasks.md`.

#### Case C: Technical Plan Complete, Ready to Implement

- Activate **Phase 5: Implementation (TDD + Tech Skills)**:
  - Create `test-plan.md` mapping User Stories to `TC-###` test cases.
  - Read corresponding mandatory tech skills (`nestjs-patterns`, `frontend-patterns`, `prisma-patterns`, etc.).
  - Follow TDD cycle: Write failing tests (Red) -> Implement minimal passing code (Green) -> Refactor.

#### Case D: Implementation Finished, Final Review & Documentation

- Activate **Phase 6: Quality Verification, Review & Documentation**:
  - Run full test suites (`pnpm test`, `pnpm --filter api test`, `pnpm --filter web test`).
  - If UI was added or modified: Run `/command-user-guide` to generate/update `docs/user-guides/<slug>.md` with real screenshots.
  - Update technical documentation `docs/features/<slug>/README.md` and index tables.
  - Mark the User Story as `[x]` in `docs/PRODUCT_BACKLOG_ROADMAP.md`.

---

## Output Format for User

When `/command-continue-project` runs, output a concise status summary:

```markdown
🎯 **Target User Story:** [<US ID> - <Story Title>]
📌 **Epic / Sprint:** [<Epic Name> | Sprint <Number>]
📊 **Current Stage:** [<Not Started / BA Analysis / Technical Planning / TDD Implementation / Quality Review & Docs>]
🚀 **Next Immediate Action:** [<Specific step the agent is executing now>]
```
