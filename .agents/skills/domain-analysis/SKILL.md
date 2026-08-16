---
name: domain-analysis
description: >
  [DEPRECATED — superseded by wordstreak-ba-skills 8-stage pipeline]
  This skill has been replaced by the modular BA Skill Pack in
  .agents/skills/wordstreak-ba-skills/. Use intake-classifier as the new
  entry point. This file is retained for historical reference only.
---

> **⚠️ DEPRECATED — Do not use for new features.**
>
> This skill has been superseded by the **wordstreak-ba-skills 8-stage BA pipeline**.
> Use `intake-classifier` as the new entry point for all feature work.
>
> The replacement pipeline lives in `.agents/skills/`:
> `intake-classifier` → `elicitation-interview` → `gap-analysis` → `domain-modeling` → `risk-contradiction-scanner` → `spec-writer` → `spec-validator` → `handover`
>
> See `.agents/skills/wordstreak-ba-skills/README.md` for the full pipeline and file layout.

# Domain Analysis & Deep Requirement Elicitation

This skill governs **Phase 1 (Deep Business Analysis & Domain Elicitation)** of the WordStreak Development Lifecycle. It combines international Business Analysis standards (**BABOK v3 / IREB / Agile BA**) with **AI-Augmented SDLC Governance** to ensure zero ambiguity, no scope creep, and complete traceability before any technical specification or code is written.

---

## 1. Core Principles

1. **AI as an Elicitation Partner, Human as Decision Maker**: AI proactively uncovers blind spots, models workflows, and detects logic contradictions; the user provides authoritative business decisions.
2. **No Silent Assumptions**: AI MUST NOT assume business rules, default values, or edge-case behavior silently. All ambiguities must be surfaced through structured questions with recommendations.
3. **No Code Before Approved Baseline**: Absolutely no implementation, prototyping, or drafting of technical files until the business domain baseline is formally signed off.
4. **Scope Integrity & Traceability**: Every requirement must trace directly to a measurable business value. Out-of-scope items must be explicitly bounded to prevent scope creep.

---

## 2. Request Intake & Classification

Upon receiving a request, immediately classify its complexity out loud:

| Classification          | Scope & Characteristics                                                              | Required Protocol                                                                      |
| :---------------------- | :----------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------- |
| **Spike / Feasibility** | Quick exploratory question, research, or proof of concept.                           | Short technical summary, trade-off matrix, quick recommendation.                       |
| **Bounded Task**        | Minor, well-scoped change to an existing flow (e.g., add 1 field, tweak validation). | Rapid Bounded Interview (2–3 targeted questions on validation, scope, and edge cases). |
| **Full Feature / Epic** | New user flow, new domain entity, cross-cutting feature, or architecture change.     | **Full 5-Stage Business Analysis Framework** (below).                                  |

---

## 3. The 5-Stage Business Analysis Framework

```
Stage 1: Problem Intake & Business Value Positioning
   ↓
Stage 2: Current State vs Future State & Gap Analysis (AS-IS → GAP → TO-BE)
   ↓
Stage 3: Deep Domain Elicitation via 6-Pillar Framework
   ↓
Stage 4: Scope Bounding, Prioritization (MoSCoW) & AI Contradiction Scanning
   ↓
Stage 5: Baseline Sign-off, Change Log & Handover Deliverables (to speckit-specify)
```

---

### Stage 1: Problem Intake & Business Value Positioning

Establish the business justification and measurable goals before diving into functional details:

1. **Problem Statement & Core Pain Points**:
   - What specific learner/user friction or business inefficiency does this solve?
   - What happens if we do _not_ build this feature?
2. **Target Personas**:
   - Who is this for? (`Guest`, `Learner / Authenticated User`, `Pro / Premium Subscriber`, `System Admin`, `Content Creator`).
3. **Success Metrics & KPIs (Measurable Business Outcomes)**:
   - Primary metric (e.g., _Increase 7-day retention by 15%_, _Reduce flashcard review drop-off by 20%_).
   - Operational metric (e.g., _API response latency < 150ms_, _Zero data loss during offline study_).

---

### Stage 2: Current State vs Future State & Gap Analysis

Expose the delta between existing functionality and future expectations:

1. **Current State (AS-IS)**:
   - How does the system / user handle this scenario today?
   - What are the current limitations, bottlenecks, or manual workarounds?
2. **Future State (TO-BE)**:
   - What is the ideal end-to-end user experience and system state once implemented?
3. **Gap Analysis & Transition Impact**:
   - **Functional Gaps**: What new domain logic or user interactions must be introduced?
   - **Data Gaps**: What existing database schemas or records need migration or backward compatibility handling?
   - **User Impact**: Will existing user workflows change or require migration alerts?

---

### Stage 3: Deep Domain Elicitation (The 6-Pillar Framework)

For any new feature or substantial enhancement, thoroughly analyze and clarify each of the 6 pillars:

#### Pillar 1: Personas, Actors & RBAC Matrix

- Define user roles and access rights using a Role-Based Access Control matrix:
  - Create / View / Edit / Delete / Share permissions.
  - Ownership rules: Can users only modify their own flashcards/decks, or can admins override?
  - Unauthenticated / Guest constraints: What preview data is visible before mandatory sign-in?

#### Pillar 2: State Machine & Entity Lifecycle

- Model every entity through a deterministic Finite State Machine (FSM):
  - Example: `DRAFT` → `PUBLISHED` → `ARCHIVED` or `NEW` → `LEARNING` → `REVIEWING` → `MASTERED`.
  - Identify exact transition triggers (user action, scheduled cron, AI grading).
  - Identify terminal states and rollback/cancellation recovery states.

#### Pillar 3: Business Rules & Domain Algorithms

- Specify explicit domain formulas, constraints, and validation logic:
  - Input validations: Field lengths, allowed character sets, uniqueness constraints, daily limits.
  - Core algorithms: Spaced Repetition parameters (SM-2 Easiness Factor, Repetition intervals), Streak calculation rules (grace periods, timezone resets at midnight), XP/Gamification reward tables.
  - Rate limiting and throttling rules per user tier.

#### Pillar 4: Workflows & Edge Cases

- **Happy Path**: Step-by-step standard success scenario.
- **Negative & Resiliency Scenarios**:
  - _Network Interruption / Offline Mode_: Local caching, sync conflict resolution (last-write-wins vs server-wins).
  - _Concurrency & Race Conditions_: Simultaneous updates from multiple devices or tabs.
  - _Idempotency & Double Clicks_: Preventing duplicate submissions, repeat billing, or duplicate streak increments.
  - _Session Expiry_: Behavior when JWT expires mid-study session (silent token refresh vs graceful modal save).
  - _Cancel / Abandon Flow_: State cleanup when user navigates away or closes the app midway.

#### Pillar 5: Entities, Data Boundaries & Privacy

- **Entity Schema Mapping**: Identify required models, attributes, default values, and relations (`User`, `Word`, `Deck`, `StudySession`, `Streak`, etc.).
- **Deletion Policy**: Hard delete vs Soft delete (`deletedAt` timestamp). Define cascade behavior.
- **Data Privacy & Compliance**:
  - Test data anonymization (strictly prohibit real PII in development environments).
  - Data retention and purge schedules.

#### Pillar 6: UX Behaviors & Non-Functional Requirements (ISO/IEC 25010)

- **UX States**:
  - _Empty State_: First-time user onboarding or empty lists.
  - _Loading State_: Skeleton screens vs spinners, Optimistic UI updates.
  - _Error State_: Inline field validation, Toast notifications, Modal alerts for destructive actions.
  - _Feedback & Recovery_: Undo toasts (e.g., "Word removed — Undo (5s)").
- **Non-Functional Requirements (NFRs)**:
  - Performance: P95 API response time < 200ms, initial page load < 1.5s.
  - Security: Input sanitization (XSS prevention), SQL injection protection via Prisma, JWT Bearer authentication.
  - Maintainability: Strict TypeScript types, modular feature architecture.

---

### Stage 4: Scope Bounding, Prioritization (MoSCoW) & AI Contradiction Scanning

#### 1. MoSCoW Scope Categorization

To prevent Scope Creep, categorize all identified items:

- **Must-Have (P0)**: Critical for the MVP release; non-negotiable core functionality.
- **Should-Have (P1)**: Important features that can have a temporary manual workaround if timeline is tight.
- **Could-Have (P2)**: Desirable enhancements (Nice-to-have) planned for future iterations.
- **Won't-Have (Out of Scope)**: Explicitly excluded from this phase/sprint. Prevents misunderstandings.

#### 2. Automated AI Logic & Conflict Detector

The AI must analyze the collected requirements and explicitly flag:

- **Logic Contradictions**: Clashing business rules (e.g., "Streak increments on first review" vs "Streak requires 10 reviews/day").
- **State Deadlocks**: Unreachable states in the Finite State Machine.
- **Backward Compatibility Risks**: Breaking changes to existing Prisma models, REST APIs, or frontend contracts.

---

### Stage 5: Baseline Sign-off, Change Log & Handover Deliverables

#### 1. Interactive Domain Interview Protocol

When asking clarifying questions during Stages 1–4:

- **Batch Questions**: Group into logical sets of 2–3 questions per turn (never overwhelm with 15 questions at once).
- **Standard Question Format**:
  ```markdown
  **Question [Number]: [Clear Subject Title]**

  - **Context & Why It Matters**: [Briefly explain the business or architectural consequence]
  - **Proposed Options**:
    - **Option A**: [Description] — [Pros / Cons]
    - **Option B**: [Description] — [Pros / Cons]
  - **Recommended**: [State the recommended choice and justification]
  ```

#### 2. Output Deliverables

Upon completing the interview and obtaining user approval, compile the **Domain Decision Baseline**:

1. **Business Summary & Problem Statement**
2. **Gap Analysis (AS-IS → TO-BE)**
3. **Approved 6-Pillar Domain Specifications**
4. **MoSCoW Scope Table (including explicit Out-of-Scope boundaries)**
5. **Structured User Stories** in standard Agile format with Gherkin acceptance criteria:
   ```markdown
   ### Story [ID]: [Title]

   **As a** [Role]
   **I want to** [Action]
   **So that** [Business Value]

   **Acceptance Criteria (Given-When-Then)**:

   - **Scenario 1**: [Happy Path]
     - Given [precondition]
     - When [action taken]
     - Then [expected result]
   - **Scenario 2**: [Edge / Negative Case]
     - Given [precondition]
     - When [error/abnormal action]
     - Then [graceful handling]
   ```
6. **Change Log Record**: Initialized for the feature branch to track all subsequent scope changes.

---

## 4. Quality Gate & Handover to Phase 2 (`speckit-specify`)

Before passing artifacts to `speckit-specify`, verify the **Exit Gate Checklist**:

- [ ] Problem statement and measurable success metrics clearly defined
- [ ] AS-IS, GAP, and TO-BE states documented
- [ ] All 6 pillars thoroughly elicited without silent assumptions
- [ ] MoSCoW prioritization completed (with explicit Won't-Have / Out-of-Scope boundary)
- [ ] AI contradiction scan passed with zero unresolved logic conflicts
- [ ] User stories have testable Given-When-Then Acceptance Criteria
- [ ] User has explicitly approved and signed off on the Domain Baseline

**Next Step**: Invoke `speckit-specify` to generate the formal `.specify/features/<feature-name>/spec.md`.
