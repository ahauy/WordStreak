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

## Execution Workflow (Adaptive 2-Tier Pipeline)

### Step 0: Smart Pre-flight Git & Environment Check

Run a fast, non-blocking local check before starting:

1. **Fast Branch & Working Tree Check**:
   - Run `git status -sb` to inspect the active branch and uncommitted changes.
   - **Skip redundant network sync**: Do **not** run `git fetch` or `git rebase` if already working on an active feature branch in the same session. Only fetch/checkout a new branch (`git checkout -b feat/<slug>`) when starting a net-new scope from `main` or when explicitly requested.
2. **Conditional Drift Refresh (On-Change Only)**:
   - Run `pnpm install` **only** if `pnpm-lock.yaml` or `package.json` was modified.
   - Run `pnpm --filter api prisma generate` **only** if `prisma/schema.prisma` was modified.

---

### Step 1: Scan Backlog & Classify Execution Tier

1. Read `docs/PRODUCT_BACKLOG_ROADMAP.md` to find the first User Story with status `[/]` (In Progress) or `[ ]` (To Do) in the active Sprint.
2. Extract the **US ID** (e.g., `US-ECO-07`), **Title**, and **Acceptance Criteria (AC)**.
3. **Classify Execution Tier**:
   - **⚡ Tier 1: Fast-Track (Default)**:
     - Single-app changes (`apps/api`, `apps/web`, or `apps/extension` only).
     - Standard Bounded Tasks, bug fixes, or any story whose Acceptance Criteria in the Roadmap are already concrete and actionable.
     - Expected LOC $\le$ 150 lines, no major database schema overhaul.
   - **🏗️ Tier 2: Deep-Track**:
     - Net-new Epics or cross-cutting fullstack features modifying database schema and multiple apps.
     - Ambiguous business requirements requiring architectural clarification.

---

### Step 2: Route & Execute by Tier

#### ⚡ TIER 1: Fast-Track Execution (High Speed, Zero Token Waste)

1. **Smart Clarification**:
   - If Acceptance Criteria (AC) in `PRODUCT_BACKLOG_ROADMAP.md` are concrete and actionable: **DO NOT pause for artificial questions**. Automatically convert AC into confirmed assumptions (`ASM-<slug>-001`) and inform the user:
     > *"🎯 Đã nhận diện đủ Acceptance Criteria từ Roadmap cho [<US ID>]. Tiến hành tạo Living Spec và triển khai TDD..."*
   - Only ask questions if there is a genuine technical contradiction or missing required credential/config.

2. **Single Living Spec (Zero Duplication)**:
   - Create or update only **1 file** in `.specify/features/<slug>/spec.md`:
     - **Section 1: Requirements & Acceptance Criteria** (Mapped to `US-` and `REQ-`).
     - **Section 2: Technical Approach** (Files to touch, types/contracts, `ponytail` simplicity).
     - **Section 3: Test Plan & Test Cases** (`TC-001`, `TC-002`, etc.).
   - Create `.specify/features/<slug>/CHANGELOG.md` with initial entry.
   - *(Strictly avoid creating duplicate `baseline.md`, `plan.md`, `test-plan.md`, or `review-report.md`).*

3. **Direct TDD Implementation & Verification**:
   - Execute directly in the primary context (or spawn 1 scoped `slice-implementer` subagent if context preservation is desired):
     1. Write failing tests (`Red`) covering all `TC-###` cases.
     2. Implement minimal passing code (`Green`) following `ponytail` simplicity (standard library and native APIs first, no unneeded abstractions).
     3. Refactor and verify passing by running `pnpm test` and `pnpm build`.

4. **Streamlined Close-Out**:
   - Verify all tests pass cleanly.
   - Update `.specify/features/<slug>/CHANGELOG.md` (`v1.0 Done`).
   - Mark the story as `[x]` in `docs/PRODUCT_BACKLOG_ROADMAP.md`.
   - Complete in 1 pass! *(User guides with screenshots are batched at the Epic/Release milestone level).*

---

#### 🏗️ TIER 2: Deep-Track Execution (For Complex Epics & Schema Overhauls)

##### Case A: Intake & Elicitation (Gate 1)
- Dispatch `business-analyst` (`pro` / `inherit`) via `invoke_subagent` to inspect domain models and formulate **2–3 targeted Elicitation Questions**.
- **🛑 GATE 1 — Interactive Elicitation**: Present clarification questions via `ask_question` and wait for user reply.

##### Case B: Unified Spec, Architecture & Test Plan (Gate 2)
- Once Gate 1 is answered, dispatch `system-architect` (`pro` / `inherit`) via `invoke_subagent` to produce the full specification and technical plan.
- **🛑 GATE 2 — Technical Plan Sign-Off**: Present a concise architectural summary and wait for user approval.

##### Case C: Parallel Implementation
- If modifying both API and Web: dispatch **`backend-developer` and `frontend-developer` concurrently in a single parallel `invoke_subagent` call**.
- Run `pnpm test` and `pnpm build` until green.

##### Case D: Batch Review & Documentation
- **Batch 1 (Review)**: Dispatch `code-reviewer` + `ui-ux-reviewer` in a single parallel call.
- **Batch 2 (Docs)**: Dispatch `tech-doc-architect` + `user-guide-creator` in a single parallel call.
- Close out in `docs/PRODUCT_BACKLOG_ROADMAP.md` and `CHANGELOG.md`.

---

## Output Format for User

When `/command-continue-project` runs, output a concise status header:

```markdown
🎯 **Target User Story:** [<US ID> - <Story Title>]
📌 **Epic / Sprint:** [<Epic Name> | Sprint <Number>]
⚡ **Execution Tier:** [Tier 1: Fast-Track | Tier 2: Deep-Track]
🚀 **Next Action:** [Đang thực thi TDD trực tiếp / Đang tổng hợp Living Spec...]
```
