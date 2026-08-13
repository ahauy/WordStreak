# WordStreak Development Workflow

## Unified Pipeline: Speckit (Planning) + Superpowers (Execution)

**Core Principle:** Speckit manages documentation and planning. Superpowers executes code.

### Pipeline for New Features

```
Brainstorm (Superpowers) → Specify (Speckit) → Plan (Speckit) → Tasks (Speckit) → Implement (Superpowers) → Review (Both)
```

#### Phase 1: Brainstorm
- Use `superpowers:brainstorming` to classify (spike/bounded/architectural) and discuss with the user
- Output: User-approved design

#### Phase 2: Specify
- Use `speckit-specify` to create official spec in `.specify/features/`
- Input: Design from Phase 1

#### Phase 3: Plan
- Use `speckit-plan` to generate plan.md, data-model.md, contracts/
- **DO NOT use `writing-plans`** — speckit-plan already generates a complete plan

#### Phase 4: Tasks
- Use `speckit-tasks` to generate detailed tasks.md

#### Phase 5: Implement
- Use `subagent-driven-development` or `executing-plans` to execute tasks from speckit
- **MANDATORY**: Read and comply with Mandatory Tech Skills (below)

#### Phase 6: Review
- Use `speckit-analyze` + `requesting-code-review`
- Use `verification-before-completion` before marking as done

---

## Mandatory Tech Skills

**CRITICAL: Before writing ANY code, AI MUST read the corresponding skill BEFORE coding.**

| Context / File type | MANDATORY Skill |
|---------------------|-----------------|
| Any `.tsx`, `.jsx` file, React component | `frontend-patterns` + `frontend-a11y` |
| UI design, layout, visual direction | `frontend-design-direction` |
| Any NestJS file (controller, service, module, DTO) | `nestjs-patterns` + `backend-patterns` |
| API endpoint, REST resource | `api-design` + `backend-patterns` |
| Prisma schema, query, migration | `prisma-patterns` |
| PostgreSQL query, index, RLS policy | `postgres-patterns` |
| Dockerfile, docker-compose.yml | `docker-patterns` |
| E2E test, Playwright test | `e2e-testing` |
| Git branch, commit, merge | `git-workflow` |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React TypeScript + Vite |
| Backend | NestJS |
| Database | PostgreSQL |
| ORM | Prisma |
| Unit/Component Testing | Vitest + React Testing Library (frontend), Jest (backend) |
| E2E Testing | Playwright |
| Containerization | Docker + Docker Compose |

---

## Code Quality Rules

- Immutable data patterns — create new copies, do not mutate
- KISS, DRY, YAGNI
- File < 800 lines, function < 50 lines
- Feature-based folder structure
- Validate all inputs at boundaries
- Handle errors explicitly, never swallow silently
