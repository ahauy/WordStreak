---
name: risk-contradiction-scanner
description: >
  Use for WordStreak Bounded Task or Full Feature work, after domain-modeling,
  to scan the accumulated business rules and state machines for logic
  contradictions, unreachable states, and backward-compatibility breaks; to
  build a risk register (technical, operational, legal); to consolidate the
  assumptions and constraints log; and to bound scope with a MoSCoW table.
  Trigger this whenever a domain model is complete and scope needs to be
  locked down before writing a formal spec, or whenever the user asks
  "what could go wrong" or "are there any conflicts in these rules." This is
  the mandatory quality gate before spec-writer — do not let contradictory or
  unscoped requirements pass through to specification.
---

# Risk & Contradiction Scanner

Phase 1, Stage 5 — the last stage before specification, and the pipeline's
main quality gate. Nothing here should require new information from the
user; it's an analytical pass over what `elicitation-interview`,
`gap-analysis`, and `domain-modeling` already produced. If you find you need
to ask a new question, that's a sign a business rule was under-specified —
send it back rather than guessing.

## 1. Contradiction scan

Read `03-domain-model.md` in full and check for:

- **Logic contradictions** — two business rules that can't both be true
  (e.g. "streak increments on first review of the day" vs. a rule elsewhere
  implying 10 reviews/day are required for the same increment).
- **State deadlocks** — states in a state machine with no valid transition
  out, or transitions that reference a state that was never defined.
- **Backward-compatibility risks** — changes to existing schemas, REST
  contracts, or frontend contracts that would break current clients or
  existing user data (cross-check against `02-gap-analysis.md`'s data gaps
  if that file exists).

Every finding gets logged even if resolved in the same turn — the point is
an auditable record, not just a fixed document.

## 2. Risk register

Beyond logic contradictions, capture broader project risk. For each risk:
probability (Low/Med/High), impact (Low/Med/High), and a mitigation or
explicit acceptance:

```markdown
| ID | Risk | Prob. | Impact | Mitigation |
|---|---|---|---|---|
| RISK-STREAK-001 | Timezone-change abuse inflates streaks | Med | Med | Server-side timezone lock per BR-STREAK-004 |
```

Consider at minimum: technical risk (new dependency, performance under
load), operational risk (migration failure, rollback complexity), and — only
if genuinely applicable — legal/compliance risk (data handling for minors,
new jurisdictions).

## 3. Consolidate assumptions & constraints

Pull every `ASM-` entry from `01-elicitation.md` into one place here, and add
any **constraints** that weren't captured as assumptions — budget, deadline,
required tech stack, third-party SLAs. This consolidated log is what
`spec-validator` checks requirements against later; an assumption that only
exists in `01-elicitation.md` is easy to lose track of once the spec is
written.

## 4. MoSCoW scope table

Categorize every distinct piece of scope that came out of stages 2–4:

- **Must-Have (P0)** — non-negotiable for this release.
- **Should-Have (P1)** — important, but a temporary manual workaround exists
  if the timeline is tight.
- **Could-Have (P2)** — nice-to-have, candidate for a future iteration.
- **Won't-Have (out of scope)** — explicitly excluded from this
  release/sprint. State it even when obvious — this line is what prevents
  scope-creep arguments later.

## 5. Record

Append to `04-risk-register.md`:

```markdown
# Risk Register: <Feature Title>

## Contradiction scan
- Findings: ... (or "none found")

## Risk register
| ID | Risk | Prob. | Impact | Mitigation |
|---|---|---|---|

## Assumptions & constraints (consolidated)
- ASM-...
- Constraints: ...

## MoSCoW
### Must-have
- ...
### Should-have
- ...
### Could-have
- ...
### Won't-have (out of scope)
- ...
```

Link a summary into `baseline.md`'s Stage 5 section.

## 6. Hand off

Only proceed to `spec-writer` once the contradiction scan shows zero
**unresolved** findings — a finding can be resolved by fixing the rule (loop
back to `domain-modeling`) or by explicit user acceptance logged in the risk
register. Append one line to `CHANGELOG.md`.

## Exit checklist

- [ ] Full domain model scanned for logic contradictions and state deadlocks
- [ ] Every finding is either fixed or explicitly accepted — none left
      silently unresolved
- [ ] Backward-compatibility risk checked against existing schema/contracts
- [ ] Risk register has at least technical and operational risk considered
- [ ] All `ASM-` entries consolidated here; constraints added
- [ ] MoSCoW table complete, including an explicit Won't-Have list
- [ ] `04-risk-register.md`, `baseline.md`, `CHANGELOG.md` updated
