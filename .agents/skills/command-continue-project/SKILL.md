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

## Execution Workflow (Fast-Accurate Unified Pipeline)

### Step 0: Smart Pre-flight Git & Environment Check

Run a fast, non-blocking local check before starting:

1. **Fast Branch & Working Tree Check**:
   - Run `git status -sb` to inspect the active branch and uncommitted changes.
   - **Skip redundant network sync**: Do **not** run `git fetch` or `git rebase` if already working on an active feature branch in the same session. Only fetch/checkout a new branch (`git checkout -b feat/<slug>`) when starting a net-new scope from `main` or when explicitly requested.
2. **Conditional Drift Refresh (On-Change Only)**:
   - Run `pnpm install` **only** if `pnpm-lock.yaml` or `package.json` was modified.
   - Run `pnpm --filter api prisma generate` **only** if `prisma/schema.prisma` was modified.

---

### Step 1: Scan Backlog & Inspect Deliverables

1. Read `docs/PRODUCT_BACKLOG_ROADMAP.md` to find the first User Story with status `[/]` (In Progress) or `[ ]` (To Do) in the active Sprint.
2. Extract the **US ID** (e.g., `US-ECO-07`), **Title**, and **Acceptance Criteria (AC)**.
3. Check `.specify/features/<slug>/` for the **Lean Canonical Artifact Set (max 6 files, zero duplication)**:
   - `baseline.md` — Unified Intake, Elicitation (`ASM-`), RBAC, State Machine, Business Rules (`BR-`), Risk Register (`RISK-`), MoSCoW, and `SIGNED-OFF` status.
   - `spec.md` — Single canonical specification containing `REQ-<SLUG>-###`, `US-<SLUG>-###` (Given-When-Then happy + edge cases), Edge Case Matrix, and Traceability Matrix (`Goal -> REQ -> US -> TC`). _(Do NOT generate duplicate `spec/srs.md`, `spec/user-stories.md`, `00-intake.md`, `01-elicitation.md`, `03-domain-model.md`, or `04-risk-scope.md` for Bounded Tasks)._
   - `plan.md` — Unified Technical Plan, Data Model (`erDiagram` + types), API/Storage Contracts, and dependency-ordered Tasks. _(Do NOT generate separate `data-model.md`, `contracts/`, or `tasks.md` unless the feature is a massive Full Feature > 500 lines)._
   - `test-plan.md` — Maps every `US-` scenario and edge case to a concrete `TC-###` test case and test file path.
   - `review-report.md` — Unified Adversarial Code Review, UI/UX Review (if UI touched), and DoD Scorecard.
   - `CHANGELOG.md` — Version history (`v0.1-draft` → `v1.0 SIGNED-OFF` → `v1.1 Verified`).

---

### Step 2: Route & Execute by Current State

#### Case A: No Elicitation / Domain Baseline Yet (Start of Story)

- **Single-Pass Intake + Elicitation Prep**:
  - Dispatch `business-analyst` (`pro` / `inherit`) via `invoke_subagent` to:
    1. Classify complexity (`Spike` | `Bounded Task` | `Full Feature`) and inspect existing relevant files/types in the repo.
    2. Identify genuine ambiguities not yet covered by `PRODUCT_BACKLOG_ROADMAP.md` or existing code.
    3. Formulate **2–3 targeted Elicitation Questions** with `(Recommended)` default options grounded in the codebase.

- **🛑 GATE 1 — Interactive Elicitation Interview (MANDATORY CUSTOMER GATE)**:
  - Present the 2–3 clarification questions to the user via `ask_question` (or chat).
  - **Strict Zero-Hallucination Policy**: Never invent business rules, formulas, or edge-case behaviors silently. Wait for the user's answers before drafting the spec and plan.

---

#### Case B: Elicitation Answered → Unified Spec, Tech Plan & Test Plan

- **Unified Specification & Architecture Pass (with `ponytail` Architecture Ladder)**:
  - Once the user answers Gate 1, dispatch `business-analyst` / `system-architect` (`pro` / `inherit`) via `invoke_subagent` to generate the complete, non-duplicated planning set in `.specify/features/<slug>/`:
    1. `baseline.md` (`Status: DRAFT v0.9`, containing confirmed `ASM-`, `BR-`, State Machine, `RISK-`, MoSCoW Won't-Have).
    2. `spec.md` (`REQ-`, `US-` Given-When-Then scenarios, Edge Case Matrix, IEEE 29148 check, Traceability Matrix).
    3. `plan.md` (Architecture, Data Model/DTOs, `/api/v1/...` or Extension contracts, and ordered implementation tasks). **Apply the `ponytail` 7-rung ladder during planning**: reuse existing monorepo helpers/types first, prefer stdlib & native platform APIs (`Intl`, native DOM/CSS, Prisma/DB constraints) over new dependencies, avoid single-implementation abstractions/wrappers, and minimize the number of new files.
    4. `test-plan.md` (`TC-###` test cases mapped 1:1 to every `US-` scenario and edge case — **never apply `ponytail` YAGNI to skip required `TC-###` tests**).
    5. `CHANGELOG.md`.
  - _(Note: For net-new, multi-entity **Full Features / Epics** where technical architecture cannot be planned until complex domain modeling is reviewed, you may pause for a separate BA Baseline sign-off first. For all **Bounded Tasks** and standard Backlog User Stories, present them together in Gate 2 below)._

- **🛑 GATE 2 — Unified Spec & Technical Plan Sign-Off (MANDATORY)**:
  - Present a concise, structured summary to the user covering:
    1. **Scope & Business Rules**: Key `BR-` rules, confirmed `ASM-` decisions, `RISK-` mitigations, and explicit Won't-Have items.
    2. **Technical Plan & Contracts**: Data model/type changes, API/storage contracts, and files to be created/modified.
    3. **TDD Verification Plan**: Summary of `TC-###` test cases in `test-plan.md`.
  - **STOP and wait for explicit user approval** ("approve", "ok", "triển khai", etc.).
  - Upon approval, mark `baseline.md` as `SIGNED-OFF v1.0` and immediately proceed to Case C.

---

#### Case C: Approved Plan → Scope-Aware Parallel TDD Implementation (with Scoped `ponytail`)

- **Strict Orchestrator Invariant**: The Orchestrator MUST NOT write feature code or test files directly; delegate via `invoke_subagent`.
- **Scoped `ponytail` Rules for Implementers (`backend-developer`, `frontend-developer`, `slice-implementer`)**:
  - **Production Code (`ponytail` ON)**: Follow the `ponytail` ladder — reuse existing repo utilities/types, use stdlib/native platform features before custom classes, zero speculative abstractions/wrappers/configs, fewest files, shortest working diff. Mark deliberate simplifications with a `// ponytail: <ceiling & upgrade path>` comment when applicable.
  - **Tests & Requirements (`ponytail` OFF)**: Never use `ponytail` to skip approved `REQ-`/`BR-` rules, boundary validation, or `TC-###` test cases in `test-plan.md`. Full unit/edge-case test coverage is mandatory.
- **Smart Scope-Aware Dispatch (Minimize Cold-Start Handoffs)**:
  - **Do NOT spawn a separate `code-explorer`** (file paths and patterns are already documented in `plan.md`).
  - **Single-App / Single-Layer Story** (e.g., `apps/extension` only, `apps/api` only, or `apps/web` only):
    - Dispatch **1 scoped implementer subagent** (`slice-implementer`, `backend-developer`, or `frontend-developer` using `gemini-3.7-flash`) to complete the full TDD cycle in a single turn:
      1. Update shared types in `packages/shared-types` (if needed) and build `shared-types`.
      2. Write failing unit/integration tests (`Red`) matching `test-plan.md` (`TC-###`).
      3. Implement minimal passing code (`Green` with `ponytail` simplicity) and refactor (`Refactor`).
      4. Run `pnpm test`, `pnpm lint`, and `pnpm build` within its own turn until green.
  - **Multi-App Fullstack Story (`apps/api` + `apps/web`)**:
    1. Update and build `packages/shared-types` first.
    2. Dispatch **`backend-developer` and `frontend-developer` concurrently in a SINGLE `invoke_subagent` call** (parallel array).
    3. Dispatch `slice-implementer` / `e2e-runner` only if cross-app wiring or Playwright E2E tests are required.
  - **On-Demand `build-resolver`**: Only invoke `build-resolver` if a build/type error remains unresolved after the implementer subagent finishes.

---

#### Case D: Implementation Green → Parallel Review & Documentation

1. **Batch 1 — Parallel Adversarial Review (`invoke_subagent` single call)**:
   - Always dispatch `code-reviewer` (`flash` / `inherit`) in a fresh context (passing only the git diff, `spec.md`, `baseline.md`, and `test-plan.md`) to audit:
     1. Code quality, security, `BR-`/`REQ-` compliance, and DoD scorecard.
     2. **`ponytail-review` Over-Engineering Pass**: Flag unnecessary complexity using `delete:`, `stdlib:`, `native:`, `yagni:`, and `shrink:` tags so bloat is cut before merge.
        Record all findings in `review-report.md`.
   - **Conditionally** include `ui-ux-reviewer` (`gemini-3.7-flash`) in the **same parallel `invoke_subagent` call** **ONLY IF** the story modified UI files (`.tsx`, `.jsx`, `.css` in `apps/web` or `apps/extension/src/popup|options|content`). Skip `ui-ux-reviewer` for pure backend, service-worker, or algorithm stories.
   - If any `Critical` or `High` issues are found, dispatch a targeted fix to the implementer subagent and re-verify.

2. **Batch 2 — Parallel Documentation & User Guide (`invoke_subagent` single call — `ponytail` OFF)**:
   - Dispatch `tech-doc-architect` (`gemini-3.7-flash`) to create `docs/features/<slug>/README.md` and update `docs/features/README.md` (plus `docs/architecture/` or `docs/algorithms/` if applicable).
   - **Conditionally** include `user-guide-creator` (`gemini-3.7-flash`) in the **same parallel `invoke_subagent` call** to generate `docs/user-guides/<slug>.md` with real Playwright screenshots **if** the story has user-facing UI/UX behavior.
   - Update `.specify/features/<slug>/CHANGELOG.md` and mark the User Story as `[x]` in `docs/PRODUCT_BACKLOG_ROADMAP.md`.

---

## Output Format for User

When `/command-continue-project` runs, output a concise status header:

```markdown
🎯 **Target User Story:** [<US ID> - <Story Title>]
📌 **Epic / Sprint:** [<Epic Name> | Sprint <Number>] (Protocol: <Bounded Task | Full Feature>)
📊 **Current Stage:** [<Gate 1: Elicitation | Gate 2: Unified Spec & Plan | Phase 5: TDD Implementation | Phase 6: Parallel Review & Docs>]
🚀 **Next Immediate Action:** [<Specific step executing now>]
```
