---
name: ui-design-review
description: >
  Use as the independent visual/design review step whenever a WordStreak UI
  slice has been implemented — whether inside implementation-orchestrator's
  Stage 4 review or run on its own — and needs a fresh, adversarial look
  before it ships. Owns exactly the surfaces design-taste-frontend explicitly
  excludes: dashboards, multi-step study/review flows, streak and XP
  displays, deck management — WordStreak's actual product UI. For landing,
  marketing, or portfolio surfaces, defers to design-taste-frontend's own
  rubric instead of duplicating it. Trigger this whenever the user asks to
  "review this screen", "check if this UI is good", "does this look right",
  or once implementation-orchestrator reaches its review stage for a
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
`skills/design-taste-frontend/SKILL.md` for the sibling skill this one
defers to for non-product surfaces.

## 1. Determine which surface this is

Check the feature's `00-intake.md` and `03-domain-model.md` §6 for what kind
of UI this is:

| Surface | Rubric to use |
|---|---|
| Landing page, marketing site, portfolio, public redesign | `design-taste-frontend`'s own rubric |
| App screens: dashboards, study/review flow, deck management, settings — anything multi-step or data-bearing | This skill's product-UI rubric (§3) — `design-taste-frontend` explicitly excludes these surfaces |
| Mixed (e.g. a marketing site plus in-app screens in the same feature) | Split the review; apply each rubric to its own screens, don't blend them |

## 2. For landing/marketing/portfolio surfaces — defer, don't duplicate

If the surface matches `design-taste-frontend`'s scope, read that skill's
Section 9 (AI Tells) and Section 14 (Final Pre-Flight Check) **fresh, each
time** — don't copy its checklist into this file or into memory, since a
copy will drift out of sync with the source the next time that skill is
edited. Run the checklist adversarially: this review's entire value is
fresh eyes, not re-confirming the generating agent's own self-report of the
same checklist.

## 3. For product UI — the rubric design-taste-frontend doesn't cover

This is WordStreak's actual surface area most of the time. Check:

**Design system consistency**
- One component library/design system is actually used across the surface,
  not a different ad-hoc pattern per screen — `design-taste-frontend`
  Section 2.A's logic for choosing an official system applies here, not
  marketing-page freehand CSS.
- Spacing scale, corner radius, and type scale match the rest of the app,
  not reinvented for this feature.

**UX states, grounded in the spec**
- Every state from `03-domain-model.md` §6 (empty, loading, error,
  feedback/recovery) is actually implemented and visually distinct — not
  just the happy path with a generic spinner substituted for the rest.
- Every acceptance criterion in `spec/user-stories.md` that has a UI
  component is checkable by looking at the screen, not just inferred from
  reading the code.

**Information hierarchy for the task at hand**
- A study/review screen (flashcard, spaced-repetition session) stays
  low-distraction and single-focus — no dashboard-style clutter competing
  with the thing the learner is supposed to be doing right now.
- A dashboard (streak, XP, progress) is glanceable — the primary number is
  unambiguous at a glance, not buried among secondary stats.

**Accessibility, checked in context, not just in code**
- Keyboard-only pass: can the flow (e.g. completing a flashcard review) be
  finished without a mouse?
- Screen-reader labels exist for icon+number indicators — a streak flame
  icon paired with just "12" needs an accessible name, not only a visual
  pairing.
- Contrast and focus states hold up against the *actual* rendered
  background, not just the design token in isolation.

**i18n resilience**
- If `03-domain-model.md` §6 named target languages, test with a long
  string (German, Vietnamese, and similar tend to run longer than English)
  that labels, buttons, and streak/XP counters don't truncate or break
  layout.

**Gamification ethics (WordStreak-specific)**
- Streak/XP/reward UI nudges toward genuine engagement rather than anxiety
  or guilt — e.g. loss-framed copy like "you'll lose everything" versus
  informative framing. This connects to the anti-abuse pass already
  required in `domain-modeling` §3: if a `BR-` rule has an anti-abuse note,
  the UI shouldn't undermine it with dark-pattern urgency.
- Reward/streak-increment animations are motivated — feedback for a
  completed action — and respect `prefers-reduced-motion`, not decoration
  for its own sake.

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
**Rubric(s) applied**: <design-taste-frontend §9/§14 | this skill's §3 | both>
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

- [ ] Surface type determined and the correct rubric selected — landing/
      marketing deferred to `design-taste-frontend`, product UI checked
      against this skill's own rubric, never both applied where only one
      fits
- [ ] For landing/marketing surfaces: `design-taste-frontend`'s Section 9
      and Section 14 read fresh, not from memory or a stale copy
- [ ] For product UI: design-system consistency, every spec'd UX state,
      accessibility in context, and i18n resilience all checked
- [ ] Gamification/reward UI checked against the relevant `BR-` anti-abuse
      notes, not judged on aesthetics alone
- [ ] A real screenshot pass attempted where a browser tool exists; its
      absence is stated explicitly, never silently skipped
- [ ] This skill made no code edits — findings routed back to the owning
      slice, not fixed in place
- [ ] `implementation/ui-review-report.md` updated
