---
name: ui-design-review
description: >
  Use as the independent visual/design review step whenever a WordStreak UI
  slice has been implemented — whether inside implementation-orchestrator's
  Stage 4 review or run on its own — and needs a fresh, adversarial look
  before it ships. Reads fresh from whichever generation-time skill owns the
  surface — design-taste-frontend for landing/marketing/portfolio,
  design-taste-product for dashboards, study/review flows, streak/XP
  displays, deck management, and other WordStreak product UI — rather than
  keeping its own copy of either rubric. Trigger this whenever the user asks
  to "review this screen", "check if this UI is good", "does this look
  right", or once implementation-orchestrator reaches its review stage for a
  UI-layer slice. This skill never edits code — it only produces a review
  report; fixes route back through the implementing slice.
---

# UI Design Review

A Phase 4 companion skill — extends `implementation-orchestrator`'s Stage 4
(Independent review) for the UI layer specifically. Read-only and
fresh-context by design: it must never be run by the same context/subagent
that implemented the slice, or it just reproduces the implementer's own
blind spots, the same reasoning `spec-validator` and Stage 4 already apply
to specs and code.

See `/README.md` for the shared file conventions this skill reuses, and
`skills/design-taste-frontend/SKILL.md` / `skills/design-taste-product/SKILL.md`
for the two generation-time skills this one reviews against.

## 1. Determine which surface this is

Check the feature's `00-intake.md` and `03-domain-model.md` §6 for what kind
of UI this is:

| Surface | Rubric to use |
|---|---|
| Landing page, marketing site, portfolio, public redesign | `design-taste-frontend`'s own rubric |
| App screens: dashboards, study/review flow, deck management, settings — anything multi-step or data-bearing | `design-taste-product`'s own rubric — `design-taste-frontend` explicitly excludes these surfaces |
| Mixed (e.g. a marketing site plus in-app screens in the same feature) | Split the review; apply each rubric to its own screens, don't blend them |

## 2. Read the owning skill fresh, don't duplicate

Whichever surface this is, read the matching skill's own checklist **fresh,
each time** — don't copy either checklist into this file or into memory,
since a copy will drift out of sync with the source the next time that skill
is edited. Run it adversarially: this review's entire value is fresh eyes,
not re-confirming the generating agent's own self-report of the same
checklist.

- **Landing/marketing/portfolio surfaces** — read `design-taste-frontend`
  Section 9 (AI Tells) and Section 14 (Final Pre-Flight Check).
- **Product UI surfaces** — read `design-taste-product` Section 10 (AI Tells
  Specific to Product UI — plus the universal tells it points back to in
  `design-taste-frontend` Section 9) and Section 11 (Pre-flight Check).

Neither rubric lives in this file. If a future change to either generation
skill isn't reflected here, that's expected — this skill has no rubric of
its own to fall out of sync.

## 3. What this review adds beyond the generation-time checklist

The generation-time skills already cover design-system consistency, states,
hierarchy, accessibility, i18n, and gamification ethics in detail — re-read
their checklists rather than re-deriving these from scratch. What this
review step adds on top, because it's only checkable with fresh eyes on the
finished artifact rather than during generation:

- **Cross-check against the spec, not just the checklist.** Every
  acceptance criterion in `spec/user-stories.md` that has a UI component
  should be checkable by looking at the screen, not just inferred from
  reading the code or trusting the implementer's self-report.
- **Cross-check against sibling screens.** For product UI, confirm this
  screen actually matches the design system, spacing scale, and radius the
  rest of the app already uses — not just that it followed the rubric in
  isolation. A screen can pass every item on `design-taste-product`'s
  checklist and still look like a different app if nobody compared it side
  by side with an existing screen.
- **Adversarial re-check of anything the implementer flagged as
  ambiguous or skipped.** If the implementation notes mention a state,
  a11y pass, or i18n check that was deferred or assumed, verify it directly
  rather than accepting the note as sufficient.

## 4. Look at it, don't just read the code

If a browser/screenshot tool is available in this environment (e.g. a
Playwright-based skill), render the actual screen and capture a screenshot
before judging anything above — code-pattern checks catch a missing
`aria-label` but not real visual overlap, truncated text, or a contrast
ratio that only fails against the actual rendered background. If no such
tool is available here, say so explicitly in the report rather than
silently skipping the visual pass.

## 5. Record

```markdown
# UI Review Report: <Feature Title>

**Surface(s) reviewed**: <landing | product UI | mixed>
**Rubric(s) applied**: <design-taste-frontend §9/§14 | design-taste-product §10/§11 | both>
**Screenshot pass**: <done | skipped — no browser tool available>
**Result**: PASS | FAIL

| Area | Finding | Severity |
|---|---|---|
```

Append to `implementation/ui-review-report.md`. If this feature is also
going through `implementation-orchestrator`'s generic Stage 4 review, this
report is that stage's UI-specific input, not a separate gate — a FAIL here
fails the overall slice review and routes through the same scoped fix loop
(Stage 5), not a parallel one.

## 6. Hand off

- **PASS** → tell the user the UI slice cleared review; if running inside
  `implementation-orchestrator`, this feeds Stage 4's overall PASS/FAIL.
- **FAIL** → list findings ranked by severity and stop — do not fix the code
  from inside this skill. Route each finding back to whichever slice
  produced it, the same way `spec-validator` routes issues back to
  `spec-writer` rather than editing the spec in place.

## Exit checklist

- [ ] Surface type determined and the correct owning skill identified —
      landing/marketing to `design-taste-frontend`, product UI to
      `design-taste-product`, never both applied where only one fits
- [ ] The owning skill's checklist read fresh this run, not from memory or a
      stale copy
- [ ] Findings cross-checked against the actual spec (`spec/user-stories.md`)
      and, for product UI, against sibling screens already shipped — not
      just re-confirmed from the checklist in isolation
- [ ] A real screenshot pass attempted where a browser tool exists; its
      absence is stated explicitly, never silently skipped
- [ ] This skill made no code edits — findings routed back to the owning
      slice, not fixed in place
- [ ] `implementation/ui-review-report.md` updated
