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
Phase 6: Quality Verification, Review, Tech Docs (tech-doc-writer) & Delivery
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

- Use `implementation-orchestrator` (Stage 9) or `subagent-driven-development` to execute tasks from speckit
- Decompose implementation into vertical slices (Data → Logic → API → UI) and delegate each slice to a scoped subagent
- Enforce independent adversarial review in a fresh context with no visibility into the implementer's reasoning
- Follow TDD (Red → Green → Refactor):
  1. **Write `test-plan.md` first** — create `.specify/features/<slug>/test-plan.md` from the template at `.specify/templates/test-plan.md`. Map every `US-<SLUG>-###` scenario to a `TC-###` test case.
  2. **Write failing tests** (Red) — implement test files based on `test-plan.md`
  3. **Write minimum code to pass** (Green)
  4. **Refactor** — clean up without breaking tests
- **MANDATORY**: Read and comply with Mandatory Tech Skills (below)

#### Phase 6: Quality Verification, Review, Tech Docs & Delivery

- **Step 1: Quality Gates & Adversarial Code Review**:
  - Run `speckit-analyze` to check spec/plan/task alignment.
  - Run `requesting-code-review` and `ui-design-review` (for UI slices).
  - Enforce **Bug Severity Gates**: `Critical` bugs strictly block completion / release. Zero `Critical` bugs permitted.
- **Step 2: Technical Documentation (MANDATORY immediately after review — delegate to `tech-doc-writer` subagent using `technical-documentation` skill)**:
  - Create `docs/features/<feature-slug>/README.md` using the template in [docs/features/README.md](../docs/features/README.md)
  - Update `docs/features/README.md` index table with the new feature entry.
  - If the feature changes architecture (new entity, new service, new API contract) — update the relevant file in `docs/architecture/`.
  - If algorithms or formulas change (e.g. SuperMemo-2, Streak, XP) — update `docs/algorithms/`.
  - Maintain Diataxis quadrants (Tutorial, How-To, Reference, Explanation) and apply Matt Palmer / OpenAI Cookbook standards.
  - Keep `AGENTS.md` / `CONTRIBUTING.md` / governance files synchronized.
- **Step 3: Verification Evidence & Delivery**:
  - Run `verification-before-completion` with passing test evidence (Vitest, Jest, Playwright).
  - Validate database migrations (`prisma migrate`), rollback strategy, and update `.specify/features/<slug>/CHANGELOG.md`.

---

## Mandatory Tech Skills

**CRITICAL: Before writing ANY code or documentation, AI MUST read the corresponding skill BEFORE execution.**

| Context / File type                                           | MANDATORY Skill                                              |
| ------------------------------------------------------------- | ------------------------------------------------------------ |
| **New feature intake / complexity classification**            | `intake-classifier`                                          |
| **Business value & 6-pillar domain elicitation**              | `elicitation-interview`                                      |
| **AS-IS / TO-BE / gap analysis (Full Feature)**               | `gap-analysis`                                               |
| **RBAC, state machines, business rules, ERD**                 | `domain-modeling`                                            |
| **Risk register, contradiction scan, MoSCoW**                 | `risk-contradiction-scanner`                                 |
| **Spec documents (BRD, PRD, SRS, user stories)**              | `spec-writer`                                                |
| **IEEE 29148 quality gate & traceability matrix**             | `spec-validator`                                             |
| **Baseline sign-off & dev handover**                          | `handover`                                                   |
| **Feature execution, slice delegation & review**              | `implementation-orchestrator`                                |
| Technical documentation, feature README, architecture, AGENTS | `technical-documentation` (Agent: `tech-doc-writer`)         |
| Any `.tsx`, `.jsx` file, React component                      | `frontend-patterns` + `frontend-a11y`                        |
| **UI Design: Landing, Marketing, Public surfaces**            | `frontend-design` + `design-taste-frontend` + `ui-taste-pro` |
| **UI Design: In-App, Dashboard, Study/Flashcards, Decks**     | `frontend-design` + `design-taste-product` + `ui-taste-pro`  |
| **UI Animation, Motion, Micro-interactions**                  | `motion-design`                                              |
| **UI visual review & component QA**                           | `ui-design-review`                                           |
| **User guide / end-user docs with screenshots**               | `user-guide-with-screenshots`                                |
| iOS Native UI / Widgets (SwiftUI/UIKit only)                  | `liquid-glass-design` (iOS ONLY)                             |
| Any NestJS file (controller, service, module, DTO)            | `nestjs-patterns` + `backend-patterns`                       |
| API endpoint, REST resource                                   | `api-design` + `backend-patterns`                            |
| Prisma schema, query, migration                               | `prisma-patterns`                                            |
| PostgreSQL query, index, RLS policy                           | `postgres-patterns`                                          |
| Dockerfile, docker-compose.yml                                | `docker-patterns`                                            |
| E2E test, Playwright test                                     | `e2e-testing`                                                |
| Git branch, commit, merge                                     | `git-workflow`                                               |

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
- **Post-Review Documentation Gate**: Every delivered feature must have technical documentation updated/created by `tech-doc-writer` (`technical-documentation` skill) before closing the task.
- **User Guide Gate**: Every feature with a UI must have a user-facing guide created or updated via the `user-guide-with-screenshots` skill (real screenshots, non-technical language, saved to `docs/user-guides/<slug>.md`) before the feature is considered done. Do not close the task without this.
- **Immutable Data Patterns**: Create new copies, do not mutate state directly.
- **KISS, DRY, YAGNI**: Avoid over-engineering and speculative features.
- **Code Limits**: File < 800 lines, function < 50 lines.
- **Feature-based Folder Structure**: Keep components, services, and tests organized by domain feature.
- **Boundary Validation**: Validate all inputs at boundaries via DTOs and schema validators.
- **Error Handling**: Handle errors explicitly, never swallow silently.
- **Data Privacy**: Strictly anonymize test data; never use real production credentials in dev.
- **Traceability**: All scope changes must be documented in the feature's Change Log.
- **Git Commit Governance**:
  - **Zero Auto-Commit**: Never commit without user review and explicit request.
  - **Modular Commits**: Break down commits into granular, logical parts (Spec/Docs -> Shared Types -> Backend API -> Frontend UI -> Feature Docs).
  - **Single-Line English Commits**: Strictly single-line Conventional Commits in English (e.g. `feat(scope): concise description`).
  - **Branch Reuse Priority**: Always prioritize existing active branches for related work, fixes, or refinements; avoid creating new branches unless strictly necessary for completely independent scope separation.
