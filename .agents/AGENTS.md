# WordStreak Development Workflow

## Unified Pipeline: Speckit (Planning) + Superpowers (Execution)

**Core Principle:** Speckit manages documentation and planning. Superpowers executes code.

### Pipeline for New Features

```
Phase 1: Deep Business Analysis & Brainstorming (Domain Elicitation)
  ↓
Phase 2: Specify (Speckit - spec.md)
  ↓
Phase 3: Plan (Speckit - plan.md, data-model.md, contracts/)
  ↓
Phase 4: Tasks (Speckit - tasks.md)
  ↓
Phase 5: Implement (Superpowers - TDD + Mandatory Tech Skills)
  ↓
Phase 6: Review & Verification (Both)
```

#### Phase 1: Deep Business Analysis & Brainstorming

- Must follow `wordstreak-workflow` Phase 1 and probe the **6-Pillar Domain Framework**:
  1. Goal & Personas (Mục tiêu & Phân quyền RBAC)
  2. Business Rules & Domain Logic (Quy tắc nghiệp vụ, validation, thuật toán SM-2/Streak, state machines)
  3. Workflows & Edge Cases (Luồng chính, luồng ngoại lệ, concurrency, offline/error recovery)
  4. Entities & Data Model (Trường dữ liệu, Prisma models, quan hệ thực thể)
  5. UX/UI Behaviors (Empty/Loading/Error states, Toast/Modal feedback, Optimistic UI)
  6. Impact & Non-Functional (Tương thích ngược, bảo mật, hiệu năng)
- **STRICT RULE**: Do NOT make silent business assumptions. Ask structured questions with recommendations and trade-offs.
- Output: User-approved domain & business decisions

#### Phase 2: Specify

- Use `speckit-specify` to create official spec in `.specify/features/<feature-name>/spec.md`
- Input: Approved domain decisions & business rules from Phase 1

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

| Context / File type                                | MANDATORY Skill                        |
| -------------------------------------------------- | -------------------------------------- |
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

## Code Quality Rules

- Immutable data patterns — create new copies, do not mutate
- KISS, DRY, YAGNI
- File < 800 lines, function < 50 lines
- Feature-based folder structure
- Validate all inputs at boundaries
- Handle errors explicitly, never swallow silently
