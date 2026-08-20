---
name: verification-before-completion
description: >
  Use at the end of Phase 5 (Implementation) and Phase 6 (Quality Review)
  to verify that a WordStreak feature is fully complete and safe to close.
  Enforces two hard documentation gates: spec docs must exist BEFORE tests
  run, and technical docs plus user guide must be completed AFTER tests pass.
  Runs all automated test suites, checks zero Critical bugs, validates
  schema changes and rollback readiness. Trigger this whenever the user says
  "we are done", "mark this complete", "ready to merge", or "close this
  story". Do not mark a user story as [x] in PRODUCT_BACKLOG_ROADMAP.md
  without a passing run of this skill.
metadata:
  stage: "Phase 6 — Verification Gate"
  phase: "Phase 6: Quality Verification & Delivery"
  model_recommendation: "Standard thinking sufficient — gate verification and report"
  prev_skill: "ui-design-review / requesting-code-review"
  next_skill: "technical-documentation (tech-doc-writer)"
---

# Verification Before Completion

This skill enforces a three-part rule grounded in TDD and SDD:

1. **Documentation before tests** — spec docs drive what tests exist.
2. **Tests before code is declared done** — automated suites must pass.
3. **Documentation after tests** — results and usage must be recorded.

No step can be skipped. Each is a hard gate.

---

## Gate 0 (PRE-TEST): Spec Documentation Must Exist

Before running any test suite, confirm the following documents exist and
are complete for `.specify/features/<slug>/`:

- [ ] `spec/user-stories.md` — acceptance criteria source of truth
- [ ] `test-plan.md` — maps every `US-<SLUG>-###` scenario to a `TC-###`
- [ ] `traceability-matrix.md` — `REQ-` → `US-` chain is recorded
- [ ] `baseline.md` is marked `SIGNED-OFF` (not DRAFT)

**Gate:** If any of the above is missing or `baseline.md` is still DRAFT,
**STOP immediately**. Tests run without spec documentation cannot be
verified against agreed requirements — the feature is not ready to verify.
Return: "BLOCKED — spec documentation incomplete. Complete Gate 0 first."

---

## 1. Run Automated Test Suites

Execute all test layers in order. Record pass / fail counts and failure
messages.

```bash
# Unit + Component tests (frontend)
pnpm --filter web test --run

# Unit + Integration tests (backend)
pnpm --filter api test

# End-to-end tests
npx playwright test
```

> If the project uses a different runner, adapt and note the deviation
> in the verification report.

**Gate:** All suites must pass (exit code 0). On failure, stop and return a
failure report — do not proceed to the next step.

---

## 2. Check Bug Severity Gate

Review open bugs from code review or QA. Classify each:

| Severity     | Definition                                                     | Gate                  |
| ------------ | -------------------------------------------------------------- | --------------------- |
| **Critical** | System crash, data loss, security hole, broken core study flow | **BLOCKS completion** |
| **High**     | Major malfunction without workaround                           | Must fix before done  |
| **Medium**   | Minor edge-case glitch, workaround available                   | Log, may defer        |
| **Low**      | Cosmetic / polish                                              | Log, may defer        |

**Gate:** Zero `Critical` bugs. Zero unresolved `High` bugs unless the user
explicitly accepts each as a logged risk in `CHANGELOG.md`.

---

## 3. Validate Database Schema Changes

If the feature touched `prisma/schema.prisma` or added migration files:

- [ ] Migration file exists in `prisma/migrations/`
- [ ] Migration has been tested against a clean database
- [ ] Migration is reversible OR manual rollback is documented
- [ ] Prisma client regenerated (`pnpm --filter api prisma generate`)
- [ ] Seed data updated in `prisma/seed.ts` if applicable

---

## 4. Confirm test-plan.md Coverage

Open `.specify/features/<slug>/test-plan.md` and verify:

- [ ] Every `US-<SLUG>-###` happy-path scenario has a `TC-###`
- [ ] Every edge-case scenario in `spec/user-stories.md` has a `TC-###`
- [ ] Every `TC-###` maps to an actual test file and test name
- [ ] No `TC-###` is "skipped" or "TODO" without an accepted-risk note

---

## 5. Traceability Spot-Check

Open `traceability-matrix.md` and verify the full chain:

```
Business Goal → REQ-<SLUG>-### → US-<SLUG>-### → TC-### (test file)
```

Flag any `US-` without a `TC-`, or any `REQ-` without a traceable `US-`.

---

## 6. Rollback Readiness

Confirm documented (in `handover-brief.md` or `CHANGELOG.md`):

- [ ] Rollback plan for schema changes
- [ ] Feature flag or toggle if the rollout is risky
- [ ] No hard-coded environment-specific values committed

---

## 7. Produce Verification Report

Write a concise summary inline in the response (not a new file):

```
## Verification Report — <feature-slug>

Date: <date>
Branch: <branch-name>

Gate 0 (Pre-test docs): PASS / BLOCKED
Test Results
  - Frontend unit/component: X passed, 0 failed
  - Backend unit/integration: X passed, 0 failed
  - E2E: X passed, 0 failed
Bug Gate: Critical 0 / High 0 (or N accepted risks in CHANGELOG.md)
Schema Changes: Applied / N-A
test-plan.md Coverage: All TC covered / Missing: TC-XXX
Traceability: Chain intact / Gaps: ...
Rollback: Documented / N-A

Verdict: READY FOR POST-TEST DOCS  |  BLOCKED — <reason>
```

---

## Gate 8 (POST-TEST): Documentation Must Be Completed After Tests Pass

**This gate is MANDATORY. A story is NOT done until both documents below exist.**

### 8a. Technical Documentation (always required)

Delegate to `technical-documentation` skill (tech-doc-writer subagent):

- [ ] `docs/features/<slug>/README.md` created using the template at
      `docs/features/README.md`
- [ ] Feature entry added to the index table in `docs/features/README.md`
- [ ] If a new entity, service, or API contract was added: relevant file
      in `docs/architecture/` updated
- [ ] If an algorithm changed (SuperMemo-2, Streak, XP): `docs/algorithms/`
      updated

**Gate:** `docs/features/<slug>/README.md` must exist before story is [x].

### 8b. User Guide (required if the feature has any UI — user confirmation required first)

This step requires an explicit confirmation from the user before writing
any documentation. The reason: UI may still receive feedback or minor
adjustments after review, and writing the guide before the UI is final
creates rework.

**Protocol:**

1. **Present the UI for review.** Show the user the implemented screens
   (live app, screenshots, or recording). Do NOT start writing the guide yet.
2. **Ask explicitly:** _"The UI is ready for the user guide. Please confirm
   the screens are final and I should proceed to write `docs/user-guides/<slug>.md`."
3. **Wait for user confirmation.** Do not proceed until the user says yes.
4. **Only after confirmation**, invoke `user-guide-with-screenshots` skill:
   - [ ] `docs/user-guides/<slug>.md` created or updated with real screenshots
   - [ ] Language is non-technical and action-oriented (end-user readable)
   - [ ] Every changed screen or flow is covered

**Gate:** If the feature touches any UI screen, `docs/user-guides/<slug>.md`
must exist before story is [x] — but it is written only after user confirms
the UI is final. The story stays open until both confirmation and guide exist.

---

## On ALL GATES PASSED

1. Append a completion entry to `.specify/features/<slug>/CHANGELOG.md`
2. Mark the User Story `[x]` in `docs/PRODUCT_BACKLOG_ROADMAP.md`

---

## Exit Checklist

- [ ] **Gate 0**: `spec/user-stories.md`, `test-plan.md`, `traceability-matrix.md` exist; `baseline.md` is SIGNED-OFF
- [ ] All automated test suites pass (exit 0)
- [ ] Zero Critical bugs, zero unaccepted High bugs
- [ ] Schema change validated (or marked N/A)
- [ ] test-plan.md coverage confirmed — no uncovered TC-###
- [ ] Traceability chain intact
- [ ] Rollback plan documented
- [ ] Verification report produced
- [ ] **Gate 8a**: `docs/features/<slug>/README.md` created/updated
- [ ] **Gate 8b**: User confirmed UI is final → `docs/user-guides/<slug>.md` created/updated (if UI)
- [ ] CHANGELOG.md updated with completion entry
- [ ] PRODUCT_BACKLOG_ROADMAP.md story marked [x]
