# WordStreak Development Workflow

## Unified Pipeline: BA Skill Pack (Analysis) + Speckit (Planning) + Superpowers (Execution)

**Core Principle:** BA Skill Pack gates all work with a signed-off domain baseline. Speckit handles technical planning. Superpowers executes code.

### Pipeline for New Features

```
Phase 1: Business Analysis & Domain Elicitation (wordstreak-ba-skills — 8-stage pipeline)
  Stage 1: intake-classifier       → classifies complexity, selects protocol
  Stage 2: elicitation-interview   → structured 6-pillar batched interview
  Stage 3: gap-analysis            → AS-IS / TO-BE / GAP (Full Feature only)
  Stage 4: domain-modeling         → RBAC, state machines, BR- IDs, ERD
  Stage 5: risk-contradiction-scanner → risk register, contradiction scan, MoSCoW
  Stage 6: spec-writer             → BRD / PRD / SRS (REQ-) / User Stories (US-)
  Stage 7: spec-validator          → IEEE 29148 quality gate + traceability matrix
  Stage 8: handover                → baseline SIGNED-OFF v1.0, handover brief
  ↓
Phase 2: Specify (speckit-specify → spec.md from signed-off baseline)
  ↓
Phase 3: Plan (speckit-plan → plan.md, data-model.md, contracts/)
  ↓
Phase 4: Tasks (speckit-tasks → tasks.md)
  ↓
Phase 5: Implement (Superpowers - TDD + Mandatory Tech Skills)
  ↓
Phase 6: Quality Verification, Review & Delivery (Zero Critical Bugs + Rollback Plan)
```

#### Phase 1: Business Analysis & Domain Elicitation (8-Stage BA Pipeline)

- **MANDATORY**: Start every new feature or significant change with `intake-classifier`. This is the entry point to the BA pipeline — never skip straight to elicitation, spec, or code.
- **Protocol routing by complexity** (decided by `intake-classifier`):
  - **Spike**: Research note only. No feature folder, no downstream stages.
  - **Bounded Task**: Stages 1 → 2 (short) → 4 (light) → 5 (light) → 6 (user-stories only) → 7 → 8. Stage 3 skipped.
  - **Full Feature / Epic**: All 8 stages at full depth.
- **Stage descriptions**:
  1. `intake-classifier` — classifies complexity with measurable signals; creates `.specify/features/<slug>/` folder.
  2. `elicitation-interview` — batched 6-pillar interview (RBAC, State Machine, Business Rules, Workflows/Edge Cases, Data/Privacy, UX/NFRs). Records all answers and `ASM-` IDs to `01-elicitation.md`.
  3. `gap-analysis` — (Full Feature only) self-inspects existing code/schema; documents AS-IS, TO-BE, and 4 gap categories including transition/migration requirements.
  4. `domain-modeling` — produces RBAC matrix, Mermaid state diagrams, numbered `BR-<SLUG>-###` business rules (with mandatory anti-abuse pass for streak/XP rules), ERD, i18n/a11y/observability NFRs.
  5. `risk-contradiction-scanner` — analytical scan for logic contradictions, state deadlocks, backward-compatibility breaks; builds `RISK-` register; consolidates all `ASM-` entries; locks scope with MoSCoW (must include explicit Won't-Have).
  6. `spec-writer` — compiles BRD / PRD / SRS (`REQ-<SLUG>-###` with mandatory **Derived from** traceability) / User Stories (`US-<SLUG>-###` with Given-When-Then happy + edge-case scenarios).
  7. `spec-validator` — adversarial IEEE 29148 quality check (8 criteria per REQ/US); builds requirement traceability matrix; loops back to `spec-writer` on failure.
  8. `handover` — verifies all exit gates; marks `baseline.md` as `SIGNED-OFF v1.0`; produces dev-facing Handover Brief; hands off to `speckit-specify`.
- **STRICT RULE**: Zero code or spec before `handover` completes and `baseline.md` is `SIGNED-OFF`. No silent business assumptions. Any post-sign-off scope change bumps version in `CHANGELOG.md` — never edits signed-off content in place.
- **Working files**: `.specify/features/<feature-slug>/` — see `wordstreak-ba-skills/README.md` for full file layout and ID conventions.
  - `test-plan.md` is created in **Phase 5 (before coding)** from `spec/user-stories.md` using the template at `.specify/templates/test-plan.md`.

#### Phase 2: Specify

- Use `speckit-specify` to create official spec in `.specify/features/<feature-name>/spec.md`
- Input: Approved domain decisions & business rules from Phase 1

#### Phase 3: Plan

- Use `speckit-plan` to generate plan.md, data-model.md, contracts/
- Enforce API versioning (`/api/v1/...`) and structured DTO contracts
- **DO NOT use `writing-plans`** — speckit-plan already generates a complete plan

#### Phase 4: Tasks

- Use `speckit-tasks` to generate detailed tasks.md with dependency ordering

#### Phase 5: Implement

- Use `subagent-driven-development` or `executing-plans` to execute tasks from speckit
- Follow TDD (Red → Green → Refactor):
  1. **Write `test-plan.md` first** — create `.specify/features/<slug>/test-plan.md` from the template at `.specify/templates/test-plan.md`. Map every `US-<SLUG>-###` scenario to a `TC-###` test case.
  2. **Write failing tests** (Red) — implement test files based on `test-plan.md`
  3. **Write minimum code to pass** (Green)
  4. **Refactor** — clean up without breaking tests
- **MANDATORY**: Read and comply with Mandatory Tech Skills (below)

#### Phase 6: Quality Verification & Delivery

- Use `speckit-analyze` + `requesting-code-review`
- Enforce **Bug Severity Gates**: `Critical` bugs strictly block completion / release
- Use `verification-before-completion` with test evidence before marking as done
- Validate migration safety, rollback strategy, and update Change Log
- **Docs update (MANDATORY before closing task)**:
  1. Create `docs/features/<feature-slug>/README.md` using the template in [docs/features/README.md](../docs/features/README.md)
  2. Update `docs/features/README.md` index table with the new feature entry
  3. If the feature changes architecture (new entity, new service, new API contract) — update the relevant file in `docs/architecture/`

---

## Mandatory Tech Skills

**CRITICAL: Before writing ANY code, AI MUST read the corresponding skill BEFORE coding.**

| Context / File type                                | MANDATORY Skill                        |
| -------------------------------------------------- | -------------------------------------- |
| **New feature intake / complexity classification** | `intake-classifier`                    |
| **Business value & 6-pillar domain elicitation**   | `elicitation-interview`                |
| **AS-IS / TO-BE / gap analysis (Full Feature)**    | `gap-analysis`                         |
| **RBAC, state machines, business rules, ERD**      | `domain-modeling`                      |
| **Risk register, contradiction scan, MoSCoW**      | `risk-contradiction-scanner`           |
| **Spec documents (BRD, PRD, SRS, user stories)**   | `spec-writer`                          |
| **IEEE 29148 quality gate & traceability matrix**  | `spec-validator`                       |
| **Baseline sign-off & dev handover**               | `handover`                             |
| Any `.tsx`, `.jsx` file, React component           | `frontend-patterns` + `frontend-a11y`  |
| UI design, layout, visual direction                | `frontend-design-direction`            |
| Any NestJS file (controller, service, module, DTO) | `nestjs-patterns` + `backend-patterns` |
| API endpoint, REST resource                        | `api-design` + `backend-patterns`      |
| Prisma schema, query, migration                    | `prisma-patterns`                      |
| PostgreSQL query, index, RLS policy                | `postgres-patterns`                    |
| Dockerfile, docker-compose.yml                     | `docker-patterns`                      |
| E2E test, Playwright test                          | `e2e-testing`                          |
| Git branch, commit, merge                          | `git-workflow`                         |

---

## Tech Stack

| Layer                  | Technology                                                |
| ---------------------- | --------------------------------------------------------- |
| Frontend               | React TypeScript + Vite                                   |
| Backend                | NestJS                                                    |
| Database               | PostgreSQL                                                |
| ORM                    | Prisma                                                    |
| Unit/Component Testing | Vitest + React Testing Library (frontend), Jest (backend) |
| E2E Testing            | Playwright                                                |
| Containerization       | Docker + Docker Compose                                   |

---

## Corporate Governance & Code Quality Rules

- **Zero Code Before Approved Spec**: Never write code or create mockups without an approved domain baseline and specification.
- **Bug Severity Gate**: No feature branch can be merged or marked complete with unresolved `Critical` bugs.
- **Immutable Data Patterns**: Create new copies, do not mutate state directly.
- **KISS, DRY, YAGNI**: Avoid over-engineering and speculative features.
- **Code Limits**: File < 800 lines, function < 50 lines.
- **Feature-based Folder Structure**: Keep components, services, and tests organized by domain feature.
- **Boundary Validation**: Validate all inputs at boundaries via DTOs and schema validators.
- **Error Handling**: Handle errors explicitly, never swallow silently.
- **Data Privacy**: Strictly anonymize test data; never use real production credentials in dev.
- **Traceability**: All scope changes must be documented in the feature's Change Log.
