---
name: wordstreak-workflow
description: >
  MANDATORY when starting any new feature, user story, or significant code change in WordStreak.
  Orchestrates the unified pipeline: Deep Business Analysis & Brainstorming for domain exploration,
  then Speckit for specify → plan → tasks, then Superpowers for implementation execution.
  Use this skill BEFORE starting any feature work to ensure correct pipeline ordering and thorough business elicitation.
---

# WordStreak Unified Workflow

This skill orchestrates the end-to-end development pipeline for WordStreak, placing strong emphasis on **rigorous business analysis and domain requirement elicitation** before writing specifications or code.

## When to Use

- Starting a **new feature** or **user story**
- Beginning any **significant code change** (not trivial one-line fixes)
- Clarifying complex business requirements, domain rules, or user flows
- Unsure which planning/implementation tools to use

## Pipeline Overview

```
Phase 1: Deep Business Analysis & Brainstorming (Domain Elicitation)
  ↓ (User-approved domain decisions)
Phase 2: Specify (Speckit - Formal spec.md)
  ↓
Phase 3: Plan (Speckit - Architecture, Data Models, Contracts)
  ↓
Phase 4: Tasks (Speckit - Dependency-ordered tasks.md)
  ↓
Phase 5: Implement (Superpowers - TDD + Mandatory Tech Skills)
  ↓
Phase 6: Review & Quality Verification (Speckit + Superpowers)
```

---

## Phase 1: Deep Business Analysis & Brainstorming (Domain Elicitation)

**Core Mandate:** Never rush into technical solutions or make silent business assumptions. Act as a proactive Business Analyst / Domain Expert to interview the requester and explore the problem space thoroughly.

### Step 1.1: Request Classification

Classify the task out loud:

- **Spike:** Feasibility/exploratory question (throwaway code, quick recommendation).
- **Bounded:** Small, well-scoped change to existing flow. Ask targeted business questions in chat, present short design, get approval.
- **Architectural / New Feature:** New feature, new user flow, or cross-cutting change. Requires the full 6-Pillar Domain Interview below.

### Step 1.2: The 6-Pillar Domain Framework (Khung 6 Trục Phân Tích Nghiệp Vụ)

For any new feature or substantial change, the AI **MUST** probe the following 6 pillars:

1. **Mục tiêu & Đối tượng (Goal & Personas)**:
   - What core user problem or learning pain point does this solve?
   - Target personas: Guest, Authenticated User, Premium Subscriber, Admin?
   - Permission / RBAC matrix: Who can view, create, edit, delete, or share?

2. **Quy tắc Nghiệp vụ & Ràng buộc Logic (Business Rules & Domain Logic)**:
   - What are the input validation rules (lengths, allowed characters, uniqueness, limits per day/user)?
   - Domain-specific algorithms & formulas (e.g. Spaced Repetition SM-2 intervals, Streak counting, XP/Points calculation)?
   - Entity Lifecycle & State Machine (e.g. `NEW` → `LEARNING` → `REVIEWING` → `MASTERED`; `DRAFT` → `PUBLISHED` → `ARCHIVED`). What triggers each state transition?

3. **Luồng Nghiệp vụ & Tình huống Biên (Workflows & Edge Cases)**:
   - **Happy Path:** Step-by-step end-to-end standard user flow.
   - **Negative / Edge Cases:** What happens when:
     - User cancels or navigates away mid-session?
     - Network drops or offline mode occurs?
     - Duplicate submissions / double clicks occur?
     - Concurrent operations / race conditions happen (e.g., 2 devices)?
     - Session / JWT token expires during the action?

4. **Dữ liệu & Thực thể (Entities & Data Model)**:
   - What new fields or models are required? Which are required vs. optional? Defaults?
   - Relationships with existing Prisma schema (`User`, `Word`, `StudySession`, `Deck`, `Streak`, etc.)?
   - Deletion & retention policy: Hard delete vs Soft delete? Cascade rules?

5. **Trải nghiệm Giao diện & Tương tác (UX/UI Behaviors)**:
   - What does the **Empty State** look like (when no data exists yet)?
   - What does the **Loading State** look like (skeleton, spinner, optimistic UI)?
   - What does the **Error State** look like (inline form validation, toast alert, modal)?
   - Confirmation & Recovery: Does the action require a modal confirmation or an Undo toast?

6. **Tác động Hệ thống & Phi chức năng (Impact & Non-Functional Requirements)**:
   - Impact on existing APIs, database tables, or frontend components (backward compatibility)?
   - Security & privacy (sensitive data, authorization checks, rate limiting)?
   - Performance targets (response latency < 200ms, query optimization, caching)?

### Step 1.3: Interactive Domain Interview Protocol

- **Grouped Questions:** Do not ask 20 disconnected questions at once. Group them into 2-3 prioritized logical batches (e.g., Pillar 1 & 2 first, then Pillar 3 & 4, then Pillar 5 & 6).
- **Format for Each Question:**
  ```markdown
  **Câu hỏi [Số]: [Chủ đề]**

  - **Lý do cần làm rõ:** [Giải thích tại sao quyết định này quan trọng với hệ thống]
  - **Các phương án đề xuất:**
    - Option A: [Mô tả] - [Ưu/Nhược điểm]
    - Option B: [Mô tả] - [Ưu/Nhược điểm]
  - **Khuyến nghị (Recommended):** [Option được khuyên dùng và lý do]
  ```
- **NO Silent Assumptions:** If a business rule is unspecified, AI MUST NOT silently assume a default. Present the recommendation and ask for confirmation.
- **Exit Gate:** Proceed to Phase 2 ONLY when all critical domain questions across the 6 pillars have been answered and approved by the user.

---

## Phase 2: Specify (Speckit)

Invoke `speckit-specify` to:

1. Create a formal feature specification in `.specify/features/<feature-name>/spec.md`
2. Encode the approved domain decisions, business rules, scenarios, and edge cases from Phase 1.
3. Validate against the Spec Quality Checklist.

**Output:** `spec.md` in `.specify/features/<feature-name>/`

---

## Phase 3: Plan (Speckit)

Invoke `speckit-plan` to:

1. Generate technical architecture and implementation plan (`plan.md`)
2. Generate data model documentation (`data-model.md`)
3. Generate API contracts (`contracts/`)

> **DO NOT** use `writing-plans` from Superpowers. `speckit-plan` handles all planning.

**Output:** `plan.md`, `data-model.md`, `contracts/`

---

## Phase 4: Tasks (Speckit)

Invoke `speckit-tasks` to:

1. Break down the plan into dependency-ordered, testable tasks
2. Generate `tasks.md` with phases and parallel markers

**Output:** `tasks.md`

---

## Phase 5: Implement (Superpowers)

Use `subagent-driven-development` or `executing-plans` to:

1. Execute tasks from `tasks.md` following TDD (Red → Green → Refactor).
2. **MANDATORY**: Read and comply with Tech Skills in `.agents/skills/` BEFORE writing code:
   - React/TSX → `frontend-patterns` + `frontend-a11y`
   - UI design & visual direction → `frontend-design-direction`
   - NestJS backend → `nestjs-patterns` + `backend-patterns`
   - REST API → `api-design` + `backend-patterns`
   - Prisma ORM → `prisma-patterns`
   - PostgreSQL → `postgres-patterns`
   - Docker → `docker-patterns`
   - E2E tests → `e2e-testing`
   - Git operations → `git-workflow`

---

## Phase 6: Review & Quality Verification

1. Run `speckit-analyze` to verify consistency between `spec.md`, `plan.md`, and `tasks.md`.
2. Run `requesting-code-review` for code quality, architectural compliance, and security.
3. Run `verification-before-completion` with test evidence before reporting completion.

---

## Bounded Tasks (Simplified Path)

For bounded changes (well-scoped edits to existing code):

1. **Targeted Domain Questions:** Ask 2-3 focused business questions on scope & edge cases.
2. **Short In-Chat Design:** Present approach, touched files, test strategy.
3. **Approval Gate:** Wait for user approval before touching code.
4. **Implement directly:** Enforce mandatory tech skills and TDD.
5. **Review:** Request code review & verify tests.

---

## Done When

- [ ] All 6 pillars of business analysis explored and approved in Phase 1
- [ ] No silent business assumptions made
- [ ] Spec, Plan, and Tasks generated through Speckit pipeline
- [ ] Tech skills enforced during implementation
- [ ] Verification and code review completed before reporting done
