# Agent Orchestration

## Skill-Based Workflow

This project uses skills from `.agents/skills/` for all development workflows.
See `.agents/AGENTS.md` for the unified pipeline and mandatory tech skill enforcement.

### Planning Skills (Speckit)

| Skill | Purpose | When to Use |
|-------|---------|-------------|
| speckit-specify | Create feature specifications | New feature descriptions |
| speckit-plan | Generate implementation plans | After spec is approved |
| speckit-tasks | Break plan into ordered tasks | After plan is complete |
| speckit-implement | Execute task list | Ready to build |
| speckit-analyze | Cross-artifact consistency check | Before implementation |
| speckit-clarify | Resolve spec ambiguities | When requirements are unclear |
| speckit-checklist | Quality validation criteria | After spec, before implementation |
| speckit-converge | Find remaining unbuilt work | When implementation seems done |
| speckit-constitution | Project-wide governance rules | Project setup |
| speckit-taskstoissues | Convert tasks to GitHub Issues | For issue tracking |

### Execution Skills (Superpowers)

| Skill | Purpose | When to Use |
|-------|---------|-------------|
| brainstorming | Design exploration with user | Starting any new feature |
| subagent-driven-development | Parallel task execution | Independent tasks from plan |
| executing-plans | Sequential task execution | Dependent tasks |
| requesting-code-review | Code quality review | After implementation |
| verification-before-completion | Final verification | Before claiming done |
| systematic-debugging | Bug investigation | When encountering bugs |

### Tech Skills (Mandatory when coding)

| Skill | Trigger |
|-------|---------|
| frontend-patterns | Any .tsx/.jsx file |
| frontend-a11y | Interactive UI components |
| frontend-design-direction | Visual/design decisions |
| nestjs-patterns | NestJS files |
| backend-patterns | Any backend service code |
| api-design | REST API endpoints |
| prisma-patterns | Prisma schema/queries |
| postgres-patterns | Raw SQL/schema design |
| docker-patterns | Dockerfiles/Compose |
| e2e-testing | E2E/Playwright tests |
| git-workflow | Git operations |

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

## Delegation Completion Contract

Applies to every agent at every depth (parent, child, grandchild):

1. **Your final message IS the deliverable.** Never end your turn with "waiting for background agents" — a spawned task is not a completed task.
2. **If you delegate, you own collection.** Wait for results, integrate them, then return.
3. **Decompose only when the work cannot fit in one context.** Do not re-delegate a task already sized for a single agent.

## Multi-Perspective Analysis

For complex problems, use split role sub-agents:
- Factual reviewer
- Senior engineer
- Security expert
- Consistency reviewer
- Redundancy checker
