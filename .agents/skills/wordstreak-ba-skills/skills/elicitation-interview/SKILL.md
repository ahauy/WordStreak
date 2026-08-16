---
name: elicitation-interview
description: >
  Use after intake-classifier has classified a WordStreak request as a Bounded
  Task or Full Feature. Runs a structured, batched interview (BABOK/IREB
  elicitation style) to surface business value, personas, and — for Full
  Features — all 6 domain pillars (RBAC, state machine, business rules,
  workflows/edge cases, data/privacy, UX/NFR). Trigger this whenever the
  intake protocol says to interview, whenever a feature's business value,
  scope, or edge-case behavior is still unclear, or whenever the user starts
  describing a feature in prose and hasn't yet answered structured questions
  about roles, states, rules, or edge cases. Never assume a business rule,
  default value, or edge case silently — ask.
---

# Elicitation Interview

Phase 1, Stage 2. This is the main information-gathering skill in the
pipeline. It reads `00-intake.md` for the protocol depth, then interviews the
user to fill `01-elicitation.md` — the raw material every later stage builds
on. **AI proactively surfaces blind spots; the user makes the business
decisions.** Never fill a gap with a plausible-sounding default without
asking first.

## 1. Read the protocol depth

Open `00-intake.md`. If `Protocol selected` is:

- **Bounded Task** → run only §2 (Business Value, abbreviated) and a targeted
  2–3 question pass on whichever pillars are actually touched. Skip pillars
  that are clearly irrelevant (e.g. no RBAC questions for a copy change).
- **Full Feature** → run §2 in full, then all 6 pillars in §3.

## 2. Stage 1 — Business value (always, but depth varies)

Batch these into one turn (2–3 questions at a time, never more):

1. **Problem & pain point** — what friction or inefficiency does this solve?
   What happens if we don't build it?
2. **Target personas** — Guest / Learner / Pro subscriber / System Admin /
   Content Creator — who is this for?
3. **Success metrics** — a primary metric (e.g. "+15% 7-day retention") and,
   if relevant, an operational metric (e.g. "P95 API latency < 150ms").

## 3. Stage 3 — The 6-Pillar interview (Full Feature only)

For each pillar, ask targeted questions using the standard question format
below. Don't dump all 6 pillars' worth of questions in one turn — batch 2–3
questions per turn, in this order, skipping pillars with nothing left to
resolve:

1. **Personas, Actors & RBAC** — Create/View/Edit/Delete/Share per role;
   ownership rules; guest/unauthenticated constraints.
2. **State Machine & Lifecycle** — states, transition triggers, terminal and
   rollback states.
3. **Business Rules & Algorithms** — validations, limits, formulas (spaced
   repetition parameters, streak rules, XP tables), rate limits per tier.
4. **Workflows & Edge Cases** — happy path; then explicitly probe: offline
   mode & sync conflicts, concurrency/race conditions, idempotency (double
   clicks, duplicate streak increments), session expiry mid-flow,
   cancel/abandon cleanup.
5. **Entities, Data Boundaries & Privacy** — entity/attribute/relation
   sketch; hard vs soft delete + cascade behavior; PII handling; whether
   minors may use this feature (triggers stricter data rules downstream).
6. **UX & Non-Functional Requirements** — empty/loading/error/feedback
   states; performance targets; security needs; **i18n/l10n** (which
   languages, RTL?) if the feature touches learner-facing content;
   **accessibility** target (e.g. WCAG level) if it's a new UI surface.

### Standard question format

```markdown
**Question <N>: <Subject>**
- **Context & why it matters**: <business/architectural consequence>
- **Proposed options**:
  - **Option A**: <description> — <pros/cons>
  - **Option B**: <description> — <pros/cons>
- **Recommended**: <your recommendation and justification>
```

## 4. Record answers and assumptions

After each batch of answers, append to `01-elicitation.md` immediately —
don't wait until the interview is "done." Use this structure:

```markdown
## Stage 1 — Business Value
- Problem: ...
- Personas: ...
- Success metrics: ...

## Pillar 1 — Personas, Actors & RBAC
**Q1: <subject>** → **Decision**: <what the user chose> (Option A/B/custom)

## Pillar 2 — State Machine & Lifecycle
...

## Assumptions confirmed
- ASM-<SLUG>-001: <assumption, and the answer that confirmed or set it>

## Open questions (not yet answered)
- <question> — blocking for: <which pillar/stage>
```

Any assumption the user confirms (including by picking your "Recommended"
option) gets an `ASM-` ID here — this is the audit trail
`risk-contradiction-scanner` and `spec-validator` will check against later.
Never let an assumption exist only in your own reasoning; if it isn't in this
file, treat it as unconfirmed.

## 5. Hand off

When all required pillars for this protocol have answers with no blocking
open questions, tell the user you're proceeding to `gap-analysis` (Full
Feature) or directly to `domain-modeling` (Bounded Task, since Stage 3/gap
analysis is skipped). Append one line to `CHANGELOG.md`.

## Exit checklist

- [ ] Stage 1 business value answered (problem, personas, success metric)
- [ ] For Full Feature: all 6 pillars covered with no silent defaults
- [ ] Every assumption the user confirmed has an `ASM-` entry, not just a
      note in conversation
- [ ] No open question remains that blocks the next stage — or, if one does,
      the user has explicitly agreed to proceed with it flagged as open
- [ ] `01-elicitation.md` and `CHANGELOG.md` updated
