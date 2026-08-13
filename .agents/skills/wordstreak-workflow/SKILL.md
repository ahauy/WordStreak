---
name: wordstreak-workflow
description: >
  MANDATORY when starting any new feature, user story, or significant code change in WordStreak.
  Orchestrates the unified pipeline: Superpowers brainstorming for design exploration,
  then Speckit for specify → plan → tasks, then Superpowers for implementation execution.
  Use this skill BEFORE starting any feature work to ensure correct pipeline ordering.
---

# WordStreak Unified Workflow

This skill orchestrates the correct pipeline for WordStreak development.

## When to Use

- Starting a **new feature** or **user story**
- Beginning any **significant code change** (not trivial one-line fixes)
- Unsure which planning/implementation tools to use

## Pipeline

### Step 1: Brainstorm (Superpowers)

Invoke `superpowers:brainstorming` to:
1. Classify the request (spike / bounded / architectural)
2. Explore design options with user
3. Get user approval on approach

**Output:** Approved design direction

### Step 2: Specify (Speckit)

Invoke `speckit-specify` to:
1. Create formal feature specification in `.specify/features/`
2. Encode the approved design from Step 1

**Output:** spec.md in `.specify/features/<feature-name>/`

### Step 3: Plan (Speckit)

Invoke `speckit-plan` to:
1. Generate implementation plan (plan.md)
2. Generate data model (data-model.md)
3. Generate API contracts (contracts/)

> **DO NOT** use `writing-plans` from Superpowers. speckit-plan handles planning.

**Output:** plan.md, data-model.md, contracts/

### Step 4: Tasks (Speckit)

Invoke `speckit-tasks` to:
1. Break plan into dependency-ordered tasks
2. Generate tasks.md with phases and parallel markers

**Output:** tasks.md

### Step 5: Implement (Superpowers)

Use `subagent-driven-development` or `executing-plans` to:
1. Execute tasks from tasks.md
2. **MUST** read and follow tech skills from `.agents/skills/` based on the code being written
3. Follow TDD approach

**Mandatory tech skill enforcement:**
- React/TSX → read `frontend-patterns` + `frontend-a11y`
- NestJS → read `nestjs-patterns` + `backend-patterns`
- API → read `api-design`
- Prisma → read `prisma-patterns`
- PostgreSQL → read `postgres-patterns`
- Docker → read `docker-patterns`
- E2E tests → read `e2e-testing`
- Git → read `git-workflow`

### Step 6: Review

1. Run `speckit-analyze` to verify spec/plan/task consistency
2. Run `requesting-code-review` for code quality
3. Run `verification-before-completion` before reporting done

## Bounded Tasks (Skip Steps 2-4)

For bounded changes (small, well-scoped edits to existing code):
1. Brainstorm → short design in chat → user approval
2. Implement directly with tech skill enforcement
3. Review

## Done When

- [ ] Correct pipeline stage invoked based on task classification
- [ ] Tech skills enforced during implementation
- [ ] Review completed before reporting done
