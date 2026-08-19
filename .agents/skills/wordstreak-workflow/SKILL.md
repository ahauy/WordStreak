---
name: wordstreak-workflow
description: >
  MANDATORY when starting any new feature, user story, or significant code change in WordStreak.
  Orchestrates the unified pipeline: domain-analysis for structured business & domain exploration,
  then Speckit for specify → plan → tasks, then Superpowers for TDD implementation execution,
  and comprehensive quality verification. Use this skill BEFORE starting any feature work.
---

# WordStreak Unified Workflow

This skill orchestrates the end-to-end development pipeline for WordStreak, placing strong emphasis on **rigorous business analysis and domain requirement elicitation** before writing specifications or code, adhering to company-wide AI-Augmented SDLC governance.

---

## Unified Pipeline: BA Skill Pack (Analysis) + Speckit (Planning) + Superpowers (Execution)

**Core Principle:** BA Skill Pack gates all work with a signed-off domain baseline. Speckit handles technical planning. Superpowers executes code.

---

## When to Use

- Starting a **new feature** or **user story**
- Beginning any **significant code change** (not trivial one-line fixes)
- Clarifying complex business requirements, domain rules, or user flows
- Unsure which planning/implementation tools to use

---

## Pipeline Overview

```
Phase 1: Business Analysis & Domain Elicitation (wordstreak-ba-skills — 8-stage pipeline)
  1. intake-classifier         → classify complexity & select protocol
  2. elicitation-interview     → batched 6-pillar structured interview
  3. gap-analysis              → AS-IS / TO-BE / GAP (Full Feature only)
  4. domain-modeling           → RBAC matrix, state diagrams, BR- IDs, ERD
  5. risk-contradiction-scanner → contradiction scan, risk register, MoSCoW
  6. spec-writer               → BRD / PRD / SRS (REQ-) / User Stories (US-)
  7. spec-validator            → IEEE 29148 quality gate + traceability matrix
  8. handover                  → baseline SIGNED-OFF v1.0, handover brief
  ↓ (signed-off baseline.md + spec/ documents)
Phase 2: Specify (speckit-specify → spec.md)
  ↓
Phase 3: Plan (speckit-plan → plan.md, data-model.md, contracts/)
  ↓
Phase 4: Tasks (speckit-tasks → dependency-ordered tasks.md)
  ↓
Phase 5: Implement (Superpowers - TDD + Mandatory Tech Skills)
  ↓
Phase 6: Quality Verification, Review, Tech Docs (tech-doc-writer) & Delivery (Zero Critical Bugs + Rollback Plan)
```

---

## Phase 1: Business Analysis & Domain Elicitation (8-Stage BA Pipeline)

**Entry Point:** Always start with `intake-classifier`. Never skip straight to elicitation, spec, or code.

### Protocol Routing (decided by `intake-classifier`)

| Protocol                | Stages                                                                | When                                                   |
| ----------------------- | --------------------------------------------------------------------- | ------------------------------------------------------ |
| **Spike**               | Stage 1 only. No folder, no spec.                                     | Research / "is this even possible?"                    |
| **Bounded Task**        | 1 → 2 (short) → 4 (light) → 5 (light) → 6 (user-stories only) → 7 → 8 | Small, well-scoped change to existing flow             |
| **Full Feature / Epic** | All 8 stages, full depth                                              | New flow, new entity, cross-cutting, gamification core |

### Stage Descriptions

1. **`intake-classifier`** — Classifies complexity using measurable signals (entity count, DB schema change, screens touched, roles affected, cross-cutting concern). Creates `.specify/features/<slug>/` folder with `00-intake.md`, `baseline.md`, `CHANGELOG.md`.

2. **`elicitation-interview`** — Reads `00-intake.md` for protocol depth. Batched 2–3 questions per turn in structured format (Context + Options + Recommendation). Covers 6 pillars: RBAC, State Machine, Business Rules, Workflows/Edge Cases, Data/Privacy, UX/NFRs. Records every decision and assumption (`ASM-<SLUG>-###`) to `01-elicitation.md`.

3. **`gap-analysis`** _(Full Feature only)_ — Self-inspects existing code/schema (does not just ask user). Documents AS-IS, TO-BE, and 4 gap categories: Functional, Data, User Impact, **Transition Requirements** (migration scripts, dual-run, rollback, feature flags).

4. **`domain-modeling`** — Produces RBAC matrix, Mermaid `stateDiagram-v2` state machines, `BR-<SLUG>-###` business rules (mandatory **anti-abuse pass** for any rule affecting streaks/XP/rewards), Mermaid `erDiagram`, deletion policy, i18n, WCAG accessibility target, observability/alerting plan.

5. **`risk-contradiction-scanner`** — Pure analytical pass (no new user questions unless rule was under-specified). Scans for logic contradictions, state deadlocks, backward-compatibility breaks. Produces `RISK-<SLUG>-###` register with probability/impact/mitigation. Consolidates all `ASM-` entries. Locks scope with MoSCoW table (Won't-Have list is mandatory).

6. **`spec-writer`** — Compiles the right document set for the protocol/audience: `BRD.md` (business), `PRD.md` (product), `SRS.md` (`REQ-<SLUG>-###` each with **Derived from** pointing to `BR-`/`ASM-`/gap items), `user-stories.md` (`US-<SLUG>-###` each with Given-When-Then happy + edge-case scenarios).

7. **`spec-validator`** — Adversarial check of every `REQ-` and `US-` against 8 IEEE 29148 criteria (Necessary, Unambiguous, Complete, Singular, Feasible, Verifiable, Consistent, Traceable). Builds traceability matrix (Business Goal → REQ → US → AC). **Loops back to `spec-writer`** on failure; never silently accepts a failing spec.

8. **`handover`** — Verifies all 7 upstream exit gates. Marks `baseline.md` as `SIGNED-OFF v1.0`. Produces dev-facing Handover Brief (what's in scope, what's out, accepted risks). Authorizes proceeding to `speckit-specify`.

**Core Principles:**

1. **AI as Elicitation Partner, Human as Decision Maker**: AI proactively uncovers blind spots; user makes business decisions.
2. **No Silent Assumptions**: Every assumption confirmed by the user gets an `ASM-` ID. If it isn't in `01-elicitation.md`, it's unconfirmed.
3. **Zero Code Before SIGNED-OFF Baseline**: Nothing in this pipeline authorizes writing implementation code. That authorization is granted by `handover` after all exit gates are green.
4. **Change Management After Sign-off**: Any scope change after `SIGNED-OFF` gets a new version in `CHANGELOG.md` and is routed back through the owning stage. Never edit a signed-off section in place.

**Exit Gate:** `handover` confirms all boxes checked before advancing to Phase 2.

---

## Phase 2: Specify (Speckit)

Invoke `speckit-specify` to:

1. Create a formal feature specification in `.specify/features/<feature-name>/spec.md`.
2. Encode the approved domain decisions, business rules, scenarios, and edge cases from Phase 1.
3. Validate against the Spec Quality Checklist.

**Output:** `spec.md` in `.specify/features/<feature-name>/`

---

## Phase 3: Plan (Speckit)

Invoke `speckit-plan` to:

1. Generate technical architecture and implementation plan (`plan.md`).
2. Generate data model documentation (`data-model.md`).
3. Generate API contracts (`contracts/`):
   - Enforce **API Versioning** (e.g., `/api/v1/...`).
   - Document Endpoint, Method, Request DTO, Response DTO, and Auth Guards.

> **DO NOT** use `writing-plans` from Superpowers. `speckit-plan` handles all planning.

**Output:** `plan.md`, `data-model.md`, `contracts/`

---

## Phase 4: Tasks (Speckit)

Invoke `speckit-tasks` to:

1. Break down the plan into dependency-ordered, testable tasks.
2. Generate `tasks.md` with phases, file paths, and parallel execution markers.
3. Map every task back to its parent User Story.

**Output:** `tasks.md`

---

## Phase 5: Implement (Superpowers & Implementation Orchestrator)

Use `implementation-orchestrator` (Stage 9) or `subagent-driven-development` to:

1. **Decompose into Vertical Slices**: Break work down by dependency layers (Data → Domain Logic → API → UI) and assign scoped excerpts to fresh subagents.
2. **Write `test-plan.md` FIRST** — before any implementation code:
   - Create `.specify/features/<slug>/test-plan.md` using the template at `.specify/templates/test-plan.md`
   - Map every `US-<SLUG>-###` scenario (happy + edge cases) to a numbered `TC-###` test case
   - Confirm coverage: every edge case in `spec/user-stories.md` has a corresponding TC
3. **Execute tasks following TDD (Red → Green → Refactor)**:
   - **Red**: Write failing test files based on `test-plan.md` (Vitest / Jest / Playwright)
   - **Green**: Write minimum code to make tests pass
   - **Refactor**: Clean up without breaking tests
4. **Adversarial Code Review**: Route review to a fresh-context subagent with no visibility into the implementer's reasoning.
5. **MANDATORY**: Read and comply with Tech Skills in `.agents/skills/` BEFORE writing code or documentation:
   - Technical docs, architecture & AGENTS → `technical-documentation`
   - React/TSX → `frontend-patterns` + `frontend-a11y`
   - UI design: Landing, Marketing, Public surfaces → `frontend-design` + `design-taste-frontend` + `ui-taste-pro`
   - UI design: In-App, Dashboard, Study/Flashcards, Decks → `frontend-design` + `design-taste-product` + `ui-taste-pro`
   - UI animation & micro-interactions → `motion-design`
   - UI visual review & component QA → `ui-design-review`
   - NestJS backend → `nestjs-patterns` + `backend-patterns`
   - REST API → `api-design` + `backend-patterns`
   - Prisma ORM → `prisma-patterns`
   - PostgreSQL → `postgres-patterns`
   - Docker → `docker-patterns`
   - E2E tests → `e2e-testing`
   - Git operations → `git-workflow`
6. **Adhere to Clean Code & Security Standards**:
   - No hard-coded secrets or API keys.
   - Never commit directly to main/production branches; use pull requests.
   - Ensure all input boundaries are validated via DTOs and class-validator.

---

## Phase 6: Quality Verification, Review & Delivery

1. **Spec Consistency Check**: Run `speckit-analyze` to verify consistency between `spec.md`, `plan.md`, and `tasks.md`.
2. **Code & UI Review Gate**: Run `requesting-code-review` to inspect security, architecture, and code cleanliness, plus `ui-design-review` for visual/UX quality.
3. **Bug Severity Classification Gate**:
   - `Critical`: System crash, data loss, security vulnerability, broken core study flow → **BLOCKS MERGE / RELEASE**.
   - `High`: Major feature malfunctioning without workaround → Must fix before completion.
   - `Medium`: Minor edge case glitch with viable workaround.
   - `Low`: Cosmetic / UI polish items.
   - **RULE**: Zero `Critical` bugs permitted prior to task completion.
4. **Technical Documentation (MANDATORY immediately after review — delegate to `tech-doc-writer` subagent using `technical-documentation`)**:
   - Create `docs/features/<feature-slug>/README.md` using the template in [`docs/features/README.md`](../../../docs/features/README.md).
   - Add a row to the index table in `docs/features/README.md`.
   - If feature adds/changes an entity, endpoint, or architecture pattern → update the relevant file in `docs/architecture/`.
   - If feature changes algorithms or mechanics (SuperMemo-2, Streak, XP) → update `docs/algorithms/`.
   - Cross-reference `test-plan.md` in the feature README for test traceability.
   - Keep `AGENTS.md` / `CONTRIBUTING.md` / instruction files synchronized.
5. **Verification Evidence**: Run `verification-before-completion` with passing test reports (Vitest, Jest, Playwright).
6. **Deployment & Rollback Readiness**:
   - Verify database migrations (`prisma migrate`).
   - Define rollback plan for schema or service regressions.
   - Update `.specify/features/<slug>/CHANGELOG.md` with completed deliverables.

---

## Bounded Tasks (Simplified Path)

For small, well-scoped edits to existing code (`intake-classifier` will classify these as **Bounded Task**):

1. **`intake-classifier`** classifies as Bounded Task and creates the feature folder.
2. **`elicitation-interview`** runs a short targeted pass (2–3 questions, only on relevant pillars).
3. Skip `gap-analysis` (Stage 3 not required for Bounded Tasks).
4. **`domain-modeling`** runs at light depth (only sections relevant to the change).
5. **`risk-contradiction-scanner`** runs at light depth.
6. **`spec-writer`** produces `user-stories.md` only.
7. **`spec-validator`** validates the user stories.
8. **`handover`** signs off and hands to implementation.
9. **Implement directly**: Enforce mandatory tech skills and TDD.
10. **Review & Documentation**: Verify tests, complete code review, then (if UI was changed) run `user-guide-with-screenshots` to capture real screenshots and write/update `docs/user-guides/<slug>.md` **before committing**. Update technical documentation with `technical-documentation`, check for zero regressions, and update `CHANGELOG.md`.

---

## Done When

- [ ] `intake-classifier` ran, protocol selected, feature folder created
- [ ] All required BA stages (per protocol) completed with green exit checklists
- [ ] `baseline.md` marked `SIGNED-OFF v1.0` by `handover`
- [ ] No silent business assumptions — all assumptions have `ASM-` IDs
- [ ] Spec, Plan, and Tasks generated through Speckit pipeline
- [ ] `test-plan.md` written in `.specify/features/<slug>/` before any code was written
- [ ] All `TC-###` test cases implemented as actual test files
- [ ] Mandatory tech skills enforced during implementation
- [ ] Code & UI review passed with zero `Critical` bugs remaining
- [ ] **If feature has UI**: `user-guide-with-screenshots` skill executed — `docs/user-guides/<slug>.md` created/updated with real screenshots — **BEFORE any `git commit`**
- [ ] `technical-documentation` executed: `docs/features/<slug>/README.md` created, index table updated, architecture/algorithms docs synced
- [ ] All automated tests pass (Unit, Integration, E2E)
- [ ] Verification, rollback strategy, and `CHANGELOG.md` updated
