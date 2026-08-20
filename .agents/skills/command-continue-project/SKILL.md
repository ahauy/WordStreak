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

### Step 0: Pre-flight Git Sync & Environment Refresh

Before starting analysis or code, ensure the working environment is synced with the latest codebase:

1. **Check Branch & Sync with Remote**:
   - Fetch remote main: `git fetch origin main`.
   - If on `main`: Prompt/switch to the designated feature/chore branch (`git checkout -b feat/<slug> origin/main`).
   - If on an active feature branch: Safely rebase onto latest `origin/main` (`git rebase origin/main`).
   - _Working tree protection_: If uncommitted changes exist, run `git stash push -m "pre-sync-stash"`, execute rebase, and restore with `git stash pop`.

2. **Monorepo Ecosystem Drift Check**:
   - If `pnpm-lock.yaml` or `package.json` was updated during sync: Run `pnpm install`.
   - If `prisma/schema.prisma` or `prisma/migrations/` was updated during sync: Run `pnpm --filter api prisma generate`.

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
  - Pause at every checkpoint requiring user input or domain clarification.

- **🛑 CONFIRMATION GATE 1 — Spec Sign-Off (MANDATORY)**:
  After Phase 1 completes and `baseline.md` is drafted, the AI **MUST STOP** and present a structured summary of the Domain Baseline to the user for review. The AI may **not** proceed to Speckit or any implementation work until the user gives explicit approval.

  **Present to user:**
  - A concise summary of: scope, key business rules (`BR-`), user stories drafted, risks identified, and anything marked Won't-Have.
  - Any open questions or assumptions (`ASM-`) that are still unresolved.
  - Concrete proposals for unresolved items, formatted as selectable options where possible.

  **If the user does NOT confirm (asks questions, requests changes, or is unsure):**
  - Do NOT proceed.
  - Identify the specific blocker (missing information, disagreement, unclear scope, etc.).
  - Ask targeted follow-up questions (max 3 at a time) OR present a concrete proposal with options.
  - Re-present the updated spec summary and loop back to this gate until the user explicitly says "approve", "confirmed", "let's proceed", or equivalent.

  **Only when the user explicitly approves**: mark `baseline.md` as `SIGNED-OFF v1.0` and advance to Case B.

---

#### Case B: Domain Baseline SIGNED-OFF but Technical Plan Missing

- Activate **Phase 2, 3, 4: Speckit Pipeline**:
  - Run `speckit-specify` -> create `spec.md`.
  - Run `speckit-plan` -> create `plan.md`, `data-model.md`, `contracts/`.
  - Run `speckit-tasks` -> create `tasks.md`.

- **🛑 CONFIRMATION GATE 2 — Technical Plan & Task Sign-Off (MANDATORY)**:
  After Speckit artifacts are generated, the AI **MUST STOP** and present the technical plan summary to the user for review. The AI may **not** begin any code writing until the user explicitly approves.

  **Present to user:**
  - A concise summary of: architecture decisions, data model changes, API contracts, implementation phases from `tasks.md`.
  - Any technical risks or trade-offs identified during planning.
  - Proposals for any unresolved design questions.

  **If the user does NOT confirm (asks questions, requests changes, or is unsure):**
  - Do NOT proceed.
  - Identify the specific blocker and ask targeted follow-up questions (max 3 at a time) OR present concrete alternatives.
  - Update the relevant speckit artifact(s) and re-present for approval.
  - Loop back to this gate until the user explicitly approves.

  **Only when the user explicitly approves**: advance to Case C.

---

#### Case C: Technical Plan Complete & Approved, Ready to Implement

- Activate **Phase 5: Implementation (Automatic Subagent Delegation + TDD)**:
  - Create `test-plan.md` mapping User Stories to `TC-###` test cases.
  - **AUTOMATIC SUBAGENT DELEGATION (MANDATORY)**:
    1. Dispatch `backend-developer` (or `slice-implementer`) via `invoke_subagent` for Backend API, DTOs, Services, and Jest tests.
    2. Dispatch `frontend-developer` via `invoke_subagent` for React components, state hooks, pages, and Vitest tests.
  - Follow TDD cycle in each slice: Write failing tests (Red) -> Implement minimal passing code (Green) -> Refactor.

#### Case D: Implementation Finished, Final Review & Documentation

- Activate **Phase 6: Quality Verification, Review & Documentation (Automatic Subagent Delegation)**:
  - **AUTOMATIC SUBAGENT DELEGATION (MANDATORY)**:
    1. Dispatch `ui-ux-reviewer` via `invoke_subagent` to perform adversarial UI & Anti-AI-Slop audit.
    2. Dispatch `user-guide-creator` via `invoke_subagent` to generate [docs/user-guides/<slug>.md](../../docs/user-guides/).
    3. Dispatch `tech-doc-architect` via `invoke_subagent` to update [docs/features/<slug>/README.md](../../docs/features/).
  - Run full test suites (`pnpm test`, `pnpm --filter api test`, `pnpm --filter web test`).
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
