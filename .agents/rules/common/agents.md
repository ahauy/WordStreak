# Agent Orchestration & Subagent Catalog

## Skill-Based Workflow & Subagents

This project uses skills from `.agents/skills/` and structured subagent personas from `.agents/agents/` across all development phases.
See `.agents/AGENTS.md` for the unified pipeline and mandatory quality gates.

---

## WordStreak Subagent Persona Catalog

| Subagent                 | Role                                                                              |   Lifecycle Phase   | Model               |
| :----------------------- | :-------------------------------------------------------------------------------- | :-----------------: | :------------------ |
| **`business-analyst`**   | 8-Stage BA Pipeline, IEEE 29148, BR- rules, SRS/US, Baseline Sign-off             |     **Phase 1**     | `claude-opus-4.6`   |
| **`system-architect`**   | Speckit Specify/Plan/Tasks, API DTO contracts, Prisma migrations, ADRs            |    **Phase 2–4**    | `claude-sonnet-4.6` |
| **`code-explorer`**      | Read-only codebase research, execution path tracing, dependency mapping           |     **Phase 5**     | `gemini-3.7-flash`  |
| **`backend-developer`**  | NestJS 11, Prisma ORM, PostgreSQL, shared-types DTOs, Jest unit/integration tests |     **Phase 5**     | `gemini-3.7-flash`  |
| **`frontend-developer`** | React 19, Vite, Tailwind CSS, 4 UX states, WCAG AA a11y, Vitest component tests   |     **Phase 5**     | `gemini-3.7-flash`  |
| **`slice-implementer`**  | Fullstack vertical slice orchestrator & cross-layer TDD integration               |     **Phase 5**     | `gemini-3.7-flash`  |
| **`build-resolver`**     | Monorepo typecheck, compile, bundling & Prisma client fixes                       |     **Phase 5**     | `gemini-3.7-flash`  |
| **`e2e-runner`**         | Playwright E2E test journeys & critical flow verification                         |     **Phase 5**     | `gemini-3.7-flash`  |
| **`code-reviewer`**      | Adversarial code review (Security, Types, React 19, NestJS, DB N+1)               |    **Phase 6A**     | `gemini-3.7-flash`  |
| **`ui-ux-reviewer`**     | Adversarial UI/UX review (Anti-AI-slop, 4 UX states, WCAG AA, motion)             |    **Phase 6A**     | `gemini-3.7-flash`  |
| **`tech-doc-architect`** | Diataxis technical docs, feature READMEs, Architecture/Algorithm sync             |    **Phase 6B**     | `gemini-3.7-flash`  |
| **`user-guide-creator`** | End-user guides with Playwright screenshots & Red Callout boxes (#EF4444)         |    **Phase 6B**     | `gemini-3.7-flash`  |
| **`agent-evaluator`**    | 5-axis agent quality evaluation, session friction & rule refinement               | **Phase 6B / Meta** | `gemini-3.7-flash`  |

---

## Model Allocation Policy

- **Deep Reasoning, Analysis & System Design** (`Phase 1–4`): Prioritize `claude-opus-4.6` or `claude-sonnet-4.6` for multi-step domain modeling, risk scanning, architectural trade-offs, and contract design.
- **Fast Execution, Coding, Review & Docs** (`Phase 5–6`): Prioritize `gemini-3.7-flash` for high-throughput TDD iteration, diagnostic commands, multi-lane checklist reviews, and screenshot/documentation generation.

---

## Parallel Task Execution

ALWAYS use parallel task execution for independent operations:

```markdown
# GOOD: Parallel execution

Launch 3 agents in parallel:

1. Agent 1: Security analysis of auth module
2. Agent 2: Performance review of cache system
3. Agent 3: Type checking of utilities

# BAD: Sequential when unnecessary

First agent 1, then agent 2, then agent 3
```

---

## Delegation Completion Contract

Applies to every agent at every depth (parent, child, grandchild):

1. **Your final message IS the deliverable.** Never end your turn with "waiting for background agents" — a spawned task is not a completed task.
2. **If you delegate, you own collection.** Wait for results, integrate them, then return.
3. **Decompose only when the work cannot fit in one context.** Do not re-delegate a task already sized for a single agent.
