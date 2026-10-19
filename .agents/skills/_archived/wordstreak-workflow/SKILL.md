---
name: wordstreak-workflow
description: >
  MANDATORY when starting any new feature, user story, or significant code change in WordStreak.
  Orchestrates the unified pipeline: domain-analysis for structured business & domain exploration,
  then Speckit for specify → plan → tasks, then Superpowers for TDD implementation execution,
  and comprehensive quality verification. Use this skill BEFORE starting any feature work.
---

# WordStreak Unified Workflow

This skill orchestrates the end-to-end development pipeline for WordStreak, placing strong emphasis on **rigorous business analysis and domain requirement elicitation** before writing specifications or code, adhering to company-wide AI-Augmented SDLC governance.

---

## Unified Pipeline: BA Skill Pack (Analysis) + Speckit (Planning) + Superpowers (Execution)

**Core Principle:** BA Skill Pack gates all work with a signed-off domain baseline. Speckit handles technical planning. Superpowers executes code.

---

## When to Use

- Starting a **new feature** or **user story**
- Beginning any **significant code change** (not trivial one-line fixes)
- Clarifying complex business requirements, domain rules, or user flows
- Unsure which planning/implementation tools to use

---

## Pipeline Overview (Adaptive 2-Tier Fast-Accurate Lifecycle)

```mermaid
graph TD
    TASK["🎯 Backlog User Story Intake"] --> CLASSIFY{"Complexity Classification"}

    subgraph TIER1 ["TIER 1: Fast-Track (Bounded Tasks / Single-App / Clear AC < 150 LOC)"]
        T1_AC["⚡ Smart Clarification: AC already concrete? Skip Gate 1"]
        T1_SPEC["📄 Single Living Spec (.specify/features/<slug>/spec.md)"]
        T1_TDD["🧪 Direct TDD Execution (Orchestrator or 1 Scoped Implementer)"]
        T1_VERIFY["✅ Automated Verification (pnpm test && pnpm build)"]
        T1_CLOSE["📋 Update CHANGELOG.md & PRODUCT_BACKLOG_ROADMAP.md"]
        T1_AC --> T1_SPEC --> T1_TDD --> T1_VERIFY --> T1_CLOSE
    end

    subgraph TIER2 ["TIER 2: Deep-Track (Full Features / Multi-App / Schema Migration)"]
        T2_BA["🍉 business-analyst (pro / inherit)"]
        T2_G1{"🛑 Gate 1: Customer Elicitation"}
        T2_SA["🏗️ system-architect (pro / inherit)"]
        T2_G2{"🛑 Gate 2: Unified Spec & Plan Sign-Off"}
        T2_PAR["⚙️ Parallel Implementers (backend + frontend in single call)"]
        T2_REV["🛡️ Batch Review & Docs"]
        T2_BA --> T2_G1 --> T2_SA --> T2_G2 --> T2_PAR --> T2_REV
    end

    CLASSIFY -->|Single component, API, or clear AC| TIER1
    CLASSIFY -->|Multi-entity DB schema, new epic, ambiguous rules| TIER2
```

---

## Artifact Governance (Zero-Duplication Rule)

- **Tier 1 (Fast-Track - Default for standard stories)**:
  Maintain only **2 files** in `.specify/features/<slug>/`:
  1. **`spec.md`** — Single living specification combining Acceptance Criteria (`REQ-`), Technical Design/Contracts, and `TC-###` Test Cases.
  2. **`CHANGELOG.md`** — Version audit trail (`v1.0 Done`).
  *(Do NOT generate separate `baseline.md`, `plan.md`, `test-plan.md`, or `review-report.md` for Tier 1 tasks).*

- **Tier 2 (Deep-Track - For complex epics & schema migrations)**:
  Maintain the Lean 6-File canonical set (`baseline.md`, `spec.md`, `plan.md`, `test-plan.md`, `review-report.md`, `CHANGELOG.md`).

---

## Protocol Routing

| Protocol | Execution Path | When |
| :--- | :--- | :--- |
| **Spike** | Intake + short technical note in chat. No folder, no spec. | Research / "is this even possible?" |
| **Tier 1 (Fast-Track)** | Smart Clarification (skip Gate 1 if AC clear) $\rightarrow$ Single Living `spec.md` $\rightarrow$ Direct TDD loop $\rightarrow$ Automated test verification | Bounded Task, single-app change, or well-scoped User Story with clear AC |
| **Tier 2 (Deep-Track)** | Full Multi-Agent Pipeline: BA (Gate 1) $\rightarrow$ Architect (Gate 2) $\rightarrow$ Parallel Implementers $\rightarrow$ Batch Review & Docs | New flow, new entity, cross-cutting multi-app, DB schema change |

### Stage Execution Rules

1. **Single-Pass Intake + Elicitation Preparation**:
   - `business-analyst` (`pro` / `inherit`) classifies complexity, inspects existing codebase/schema, and immediately prepares **2–3 targeted Elicitation Questions** with `(Recommended)` options.
2. **🛑 GATE 1 — Interactive Elicitation Interview (MANDATORY CUSTOMER GATE)**:
   - AI pauses and asks the user 2–3 targeted questions via `ask_question` or chat covering ambiguities in business rules, state transitions, or edge cases.
   - **Strict Zero-Hallucination Policy**: Never invent or silently assume business logic; all ambiguities must be confirmed by the customer and logged as `ASM-<SLUG>-###`.
3. **Domain Modeling, Risk Scan & Spec Generation**:
   - Once the user answers Gate 1, compile `baseline.md` (`ASM-`, `BR-`, State Machine, `RISK-`, MoSCoW) and `spec.md` (`REQ-`, `US-` Given-When-Then, IEEE 29148 check, Traceability Matrix).

---

## Phases 2–4: Unified Specify, Plan & Tasks (with `ponytail` Architecture Ladder)

For **Bounded Tasks** and standard Backlog User Stories, `system-architect` (`pro` / `inherit`) runs in the same planning phase right after Gate 1 answers to produce:

1. **`spec.md`** — Formal requirements (`REQ-`), scenarios (`US-`), edge cases, and traceability matrix.
2. **`plan.md`** — Technical architecture, data model (`erDiagram`), `/api/v1/...` or Extension contracts, and dependency-ordered implementation tasks. **Enforce the `ponytail` 7-rung ladder in architecture planning**: reuse existing helpers/types first, prefer stdlib & native platform APIs over new libraries or custom classes, forbid single-implementation interfaces/factories, and minimize touched/created files.
3. **`test-plan.md`** — `TC-###` test cases mapped 1:1 to every `US-` scenario and edge case (**`ponytail` YAGNI never applies to test coverage**).
4. **🛑 GATE 2 — Unified Spec & Technical Plan Sign-Off**:
   - Present the unified summary (Scope/`BR-`, Technical Architecture/Contracts, and `TC-###` Test Plan) to the user.
   - Upon user approval, mark `baseline.md` as `SIGNED-OFF v1.0` and advance to Phase 5.

---

## Phase 5: Scope-Aware Parallel TDD Implementation (with Scoped `ponytail`)

1. **Zero Direct Feature Coding by Orchestrator**: Always delegate implementation slices to subagents via `invoke_subagent`.
2. **Scoped `ponytail` Enforcement**:
   - **Production Code (`ponytail` ON)**: Subagents MUST apply the `ponytail` ladder — reuse existing repo utilities, use native/stdlib features (`Intl`, native DOM/CSS, Prisma constraints), write zero unrequested abstractions/wrappers, and keep the diff as short and boring as possible.
   - **Tests & Spec Conformance (`ponytail` OFF)**: Subagents MUST implement 100% of approved `REQ-`/`BR-` rules and 100% of `TC-###` test cases in `test-plan.md`.
3. **No Redundant `code-explorer`**: File paths and existing patterns are already documented in `plan.md`.
4. **Scope-Aware Subagent Dispatch**:
   - **Single-App / Single-Layer Story** (e.g., `apps/extension` only, `apps/api` only, or `apps/web` only):
     - Dispatch **1 scoped implementer subagent** (`slice-implementer`, `backend-developer`, or `frontend-developer`) to execute the complete TDD loop (`Red` failing tests from `test-plan.md` → `Green` minimal `ponytail` code → `Refactor` → `pnpm test && pnpm build`) in a single turn.
   - **Multi-App Fullstack Story (`apps/api` + `apps/web`)**:
     - Update and build `packages/shared-types` first, then dispatch **`backend-developer` and `frontend-developer` concurrently in a single parallel `invoke_subagent` call**.
   - **On-Demand `build-resolver`**: Only invoke `build-resolver` if a compilation or lint issue remains unresolved.
5. **MANDATORY Tech Skills**: Comply with Tech Skills in `.agents/skills/` and read `apps/web/DESIGN.md` + `apps/web/MEMORY.md` before any UI work.

---

## Phase 6: Parallel Quality Review, Docs & Delivery

1. **Batch 1 — Parallel Adversarial Review (Single `invoke_subagent` Call)**:
   - Dispatch `code-reviewer` (`flash` / `inherit`) in a fresh context (no implementer reasoning) to audit:
     - Code quality, security, `BR-`/`REQ-` compliance, and DoD scorecard.
     - **`ponytail-review` Over-Engineering Audit**: Hunt unnecessary complexity using `delete:`, `stdlib:`, `native:`, `yagni:`, and `shrink:` tags in `review-report.md`.
   - **Enforce 4 Review Stopping Rules**:
     1. *Max 3 Iterations*: Review-fix cycle hard-capped at 3 rounds; non-critical nits auto-accepted on Round 3.
     2. *Incremental Diff Only*: In Rounds 2 & 3, audit only the latest git diff (`git diff HEAD~1`).
     3. *Categorized Findings*: Group findings into Security, Logic, Performance, and Cleanliness.
     4. *No Regurgitation*: Never re-report resolved or accepted issues.
   - **Conditionally** dispatch `ui-ux-reviewer` (`gemini-3.7-flash`) in the **same parallel call** **only if** UI files were modified.
   - **Bug Severity Gate**: Zero `Critical` bugs permitted prior to completion.
2. **Batch 2 — Parallel Technical Docs & User Guide (Single `invoke_subagent` Call — `ponytail` OFF)**:
   - Dispatch `tech-doc-architect` (`gemini-3.7-flash`) to create `docs/features/<feature-slug>/README.md` and update `docs/features/README.md` (plus `docs/architecture/` or `docs/algorithms/` if changed).
   - **Conditionally** dispatch `user-guide-creator` (`gemini-3.7-flash`) in the **same parallel call** to create/update `docs/user-guides/<slug>.md` with real Playwright screenshots if user-facing UI changed.
3. **Close-Out**:
   - Verify all automated test suites pass, update `.specify/features/<slug>/CHANGELOG.md`, and mark the User Story as `[x]` in `docs/PRODUCT_BACKLOG_ROADMAP.md`.

---

## Done When

- [ ] Gate 1 (Interactive Elicitation Interview) completed with zero silent assumptions (`ASM-` IDs recorded)
- [ ] Lean canonical artifacts (`baseline.md`, `spec.md`, `plan.md`, `test-plan.md`, `CHANGELOG.md`) created with zero duplicate files
- [ ] Gate 2 (Unified Spec & Tech Plan Sign-Off) approved by user and `baseline.md` marked `SIGNED-OFF v1.0`
- [ ] All `TC-###` test cases implemented via TDD and passing (`pnpm test && pnpm build`)
- [ ] Parallel Adversarial Review (`review-report.md`) passed with zero `Critical` bugs
- [ ] **If feature has UI**: `docs/user-guides/<slug>.md` created/updated with real screenshots **BEFORE any `git commit`**
- [ ] `docs/features/<slug>/README.md` created and `docs/features/README.md` index updated
- [ ] `CHANGELOG.md` and `docs/PRODUCT_BACKLOG_ROADMAP.md` (`[x]`) updated
