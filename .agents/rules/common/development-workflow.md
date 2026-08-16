# Development Workflow

> This file extends [common/git-workflow.md](./git-workflow.md) with the full feature development process that happens before git operations.

The Feature Implementation Workflow describes the development pipeline: research, planning, TDD, code review, and then committing to git.

0. **Deep Business Analysis & Domain Elicitation** _(mandatory before any technical specification)_
   - Probe the **6-Pillar Domain Framework** (`wordstreak-workflow`):
     1. Goal & Personas (Mục tiêu & Phân quyền RBAC)
     2. Business Rules & Logic (Validation, thuật toán SM-2/Streak, state machines)
     3. Workflows & Edge Cases (Happy path, negative cases, concurrency, error recovery)
     4. Entities & Data Model (Trường dữ liệu, quan hệ Prisma models, lifecycle)
     5. UX/UI Behaviors (Empty/Loading/Error states, feedbacks, toasts/modals)
     6. Impact & Non-Functional (Tương thích ngược, bảo mật, hiệu năng)
   - **Interactive Interview**: Ask structured questions with recommended options and trade-offs. Never make silent business assumptions.
   - **Research & Reuse**: GitHub search (`gh search repos/code`), library docs, and package registries for battle-tested solutions before writing net-new code.

1. **Plan First (Speckit Pipeline)**
   - Use `speckit-specify` → `spec.md` with verified domain decisions.
   - Use `speckit-plan` → `plan.md`, `data-model.md`, `contracts/`.
   - Use `speckit-tasks` → `tasks.md` with dependency-ordered phases.

2. **TDD Approach**
   - Use **tdd-guide** agent
   - Write tests first (RED)
   - Implement to pass tests (GREEN)
   - Refactor (IMPROVE)
   - Verify 80%+ coverage

3. **Code Review**
   - Use **code-reviewer** agent immediately after writing code
   - Address CRITICAL and HIGH issues
   - Fix MEDIUM issues when possible

4. **Commit & Push**
   - Detailed commit messages
   - Follow conventional commits format
   - See [git-workflow.md](./git-workflow.md) for commit message format and PR process

5. **Pre-Review Checks**
   - Verify all automated checks (CI/CD) are passing
   - Resolve any merge conflicts
   - Ensure branch is up to date with target branch
   - Only request review after these checks pass
