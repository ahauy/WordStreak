 ---
name: design-taste-product
description: >
  Anti-slop design skill for product UI — dashboards, in-app screens, data
  tables, multi-step forms and wizards, settings, admin panels. This is the
  sibling of design-taste-frontend, covering exactly the surfaces that skill's
  Section 13 excludes. Use whenever building or improving a screen a user
  returns to repeatedly (logged-in, task-driven), as opposed to a one-time
  visitor page. Trigger on requests to build a dashboard, app screen, form,
  wizard, settings page, or to make in-app UI "look better", "less generic",
  or "more polished" — even if the user doesn't say "product UI" explicitly.
triggers:
  - Building or redesigning any logged-in / in-app screen
  - Any dashboard, study/review flow, deck management screen, streak/XP display
  - Multi-step forms, wizards, onboarding flows inside the product
  - Settings pages, admin panels, data tables
  - User asks to make in-app UI look "better", "cleaner", "less generic", or "more polished"
  - Implementation-orchestrator reaches its UI-layer slice for a product screen
  - ui-design-review determines the surface is product UI (not landing/marketing)
---

# design-taste-product: Anti-Slop Product UI Skill

> Dashboards, in-app screens, data tables, multi-step forms, settings, admin
> panels. Not landing pages, portfolios, or marketing surfaces — those belong
> to `design-taste-frontend`. Not code editors, native mobile shells, or
> realtime collaboration UI either — those are different problem classes with
> their own official tooling (see Section 0.C).

This skill exists because `design-taste-frontend` explicitly and correctly
refuses product UI (its Section 13): a dashboard judged by landing-page
standards ends up either boring (if held back) or exhausting (if it "pops"
the way a hero section should). Product UI needs its own taste model, not a
diluted copy of the marketing one.

**Where this skill borrows instead of repeating:** performance/accessibility
guardrails, dark-mode protocol, and the em-dash ban are universal hygiene, not
marketing-specific. Read them fresh from `design-taste-frontend` Sections 6,
8, and 9.G rather than treating this file as a substitute — they apply here
exactly as written there.

---

## When to use this skill (Trigger Conditions)

Activate `design-taste-product` whenever **any** of the following apply:

| Signal                                                                                                   | Example                                               |
| -------------------------------------------------------------------------------------------------------- | ----------------------------------------------------- |
| Building or redesigning a logged-in / in-app screen                                                      | Study flow, deck editor, review session UI            |
| Dashboard, glanceable metrics, or streak/XP display                                                      | Home screen with streak counter, XP bar, daily goal   |
| Multi-step form, wizard, or onboarding flow inside the product                                           | Card creation wizard, account setup steps             |
| Settings page, admin panel, or management list                                                           | Profile settings, notification preferences, deck list |
| Data table with sort / filter / pagination needs                                                         | Leaderboard, history log, vocabulary list             |
| User says: "make this look better", "less generic", "more polished" — and the target is an in-app screen | Any product screen the user returns to repeatedly     |
| `implementation-orchestrator` reaches its UI-layer slice for a product surface                           | Confirmed by `00-intake.md` surface type = product UI |
| `ui-design-review` classifies the surface as product UI                                                  | Review table in `ui-design-review` Section 1          |

**Do NOT activate this skill for:**

- Landing pages, marketing sites, portfolio pages, or public-facing redesigns → use `design-taste-frontend` instead
- Code editors, native mobile shells, or realtime collaboration UI → use the specific tool named in Section 0.C
- Mixed surfaces (marketing page + in-app screen in one feature) → split the work: `design-taste-frontend` for the marketing surface, this skill for the in-app surface

---

## 0. Scope

### 0.A This skill covers

Dashboards, in-app/logged-in screens, data tables, multi-step forms and
wizards, settings pages, admin panels, onboarding flows, any screen inside a
product that a user operates repeatedly rather than visits once.

### 0.B Defers entirely to `design-taste-frontend`

Landing pages, marketing sites, portfolios, redesigns of any of those,
about/pricing pages. If a feature has both a marketing page and an in-app
screen, split the review: apply each skill to its own surfaces, don't blend
the two rubrics on one screen.

### 0.C Out of scope for both skills — use the named tool instead

- Code editors → Monaco / CodeMirror with their official skinning.
- Native mobile shells → Apple HIG / Material directly, or `liquid-glass-design`
  for iOS 26 Liquid Glass specifically.
- Realtime collaboration UI (presence, cursors, OT-aware surfaces) → different
  problem class; design taste is not the bottleneck there.

If a request lands here, say so explicitly and point to the right tool rather
than stretching this skill to cover it.

---

## 1. Brief inference (read the room, product-UI version)

Before writing code, work out:

1. **Purpose** — what task does this screen let the user complete?
2. **Repeat user, not visitor** — this person will see this screen dozens or
   hundreds of times. Familiarity and predictability are worth more here than
   a strong first impression.
3. **Existing app conventions** — if the app already has screens, this one
   must match them (component library, spacing scale, radius, nav pattern),
   not introduce a parallel visual system. Check for an existing `DESIGN.md`
   or equivalent token file first (Section 5) — it overrides everything below.
4. **Data/action shape** — is this primarily about reading data (dashboard,
   report), entering data (form, wizard), or managing a collection (table,
   list, settings)? Each has a different center of gravity.
5. **Tone** — utilitarian, playful, calm, dense, technical — product UI has
   a tone too (a kids' learning app and an enterprise analytics tool
   shouldn't feel the same), it just expresses through restraint and detail
   rather than through the bold moves a landing page can make.
6. **Quiet constraints** — accessibility-critical audiences, regulated data,
   kids' products, anything that overrides aesthetic preference.

State a one-line design read before generating, same discipline as
`design-taste-frontend` Section 0.B:

> _"Reading this as: a daily spaced-repetition review screen, single-task,
> low-distraction, matching the app's existing zinc/emerald token system."_

> _"Reading this as: an admin settings panel, dense, table-heavy, no
> motion beyond state feedback."_

If genuinely ambiguous, ask **one** question — same discipline as
`design-taste-frontend` Section 0.C. Most of the time the existing app or the
brief already answers this; don't ask when you can infer.

---

## 2. Design system — don't reinvent, delegate

Check `design-taste-frontend` Section 2.A first. It already maps brief
signals to the right official package:

- Microsoft/enterprise SaaS → Fluent UI
- Google-ish product → Material 3
- IBM-style B2B/analytics → Carbon
- Shopify admin surfaces → Polaris
- Atlassian/Jira-style → Atlaskit
- Modern accessible React foundation → Radix Themes
- Own-the-code modern SaaS → shadcn/ui

For data tables specifically (a case `design-taste-frontend` names but
doesn't implement, since it's out of that skill's scope): **TanStack Table**
for headless/flexible needs, **AG Grid** when the product genuinely needs
enterprise-grid features (pivoting, virtualization at scale, Excel-like
editing). Don't hand-roll a sortable/filterable table from scratch — it's a
solved problem with mature libraries.

**The existing app wins.** If the project already has an established design
system or component library in use, match it — do not introduce a second
system "because it's more official" for this one screen. Consistency with
what's already shipped beats textbook-correct system selection.

---

## 3. The dials, recalibrated for product UI

`design-taste-frontend` uses three dials (`DESIGN_VARIANCE`,
`MOTION_INTENSITY`, `VISUAL_DENSITY`) tuned for pages that need to stand out.
Product UI inverts the priority: **consistency beats novelty.** A user who
sees this screen every day is not impressed by variance — they're slowed
down by it.

- **`VISUAL_DENSITY`** — reuse the same 1-10 scale and definitions from
  `design-taste-frontend` Section 7. Product UI typically lands 4-8
  (Daily App to Cockpit) rather than the 2-4 (Art Gallery) range common on
  marketing pages. A dashboard with 15 metrics genuinely needs density; don't
  pad it with landing-page whitespace just to look "clean."
- **`MOTION_INTENSITY`** — same scale, but the product-UI baseline is lower:
  2-4 by default (state feedback only), not the 6-8 that suits a marketing
  hero. Motion here should almost always be answering "what just changed?"
  rather than "look how alive this page is."
- **`DESIGN_VARIANCE` is replaced by `CONSISTENCY`** as the operative
  constraint. Every screen in the product should be recognizable as the same
  product. A settings page that looks like a different app than the
  dashboard is a bug, not a design choice. If you want a number: treat this
  as `DESIGN_VARIANCE` locked at 1-3 (Predictable) relative to the rest of
  the app, regardless of how expressive the brief sounds.

---

## 4. Information hierarchy for the task at hand

Different product-UI tasks need different hierarchy strategies:

- **A focused task screen** (a flashcard review, a single-step form, a
  checkout step) stays low-distraction and single-focus. Nothing competes
  with the one thing the user is supposed to do right now — no dashboard
  widgets, no secondary stats, no upsell card, bolted onto the side.
- **A glanceable dashboard** (streak, XP, KPIs, status overview) makes the
  primary number unambiguous at a glance. If everything is bold and colored
  equally, nothing is primary — pick the one or two numbers that matter most
  and give everything else less visual weight.
- **A management surface** (table, list, settings) prioritizes scannability
  and predictable row/field structure over visual flourish. Users are
  hunting for a specific item or field, not absorbing a narrative.

---

## 5. Design anchor (`DESIGN.md`)

The first time real visual decisions are made for a project (color, type
scale, spacing scale, radius, shadow), write them to a short `DESIGN.md` at
the project root instead of re-deciding per screen. Every screen after that
reads the existing file first and stays consistent with it.

```markdown
# Design System — <project name>

## Palette

- Neutral: <background, surface, border, text>
- Primary accent: <hex>
- Secondary accent (optional): <hex>
- Semantic (only if the domain needs it): success / warning / danger

## Type

- Family: <font(s)>
- Scale: <e.g. 12 / 14 / 16 / 20 / 24 / 32>
- Weight usage: <e.g. 400 body, 600 headings>

## Spacing

- Scale: <e.g. 4 / 8 / 12 / 16 / 24 / 32 / 48>

## Radius / Shadow / Motion

- <corner-radius system, shadow usage, default transition duration>

## Notes

- <anything worth remembering — a system this is anchored to, things to avoid>
```

If a `DESIGN.md` already exists, treat it as the source of truth and update
it only when the user explicitly changes direction — don't regenerate it from
scratch because a new screen has different needs.

---

## 6. UX states, grounded in the spec

Every view that loads or submits data needs all four states designed, not
just the happy path:

- **Loading** — a skeleton roughly matching the eventual layout, not a
  generic centered spinner on a blank page.
- **Empty** — a real explanation and, where relevant, a next action — not
  just "No data."
- **Error** — says what happened and what to do next, not a raw error
  string.
- **Populated** — check it at edge densities too (1 row, 100 rows), not just
  the demo-data case.

If the project has a spec (user stories, acceptance criteria, a domain
model), every UI-relevant state named there should be visually distinct and
checkable by looking at the screen — not just inferable from reading the
code.

---

## 7. Accessibility, in context

`frontend-a11y` (if present in this project) covers the code-level patterns —
label association, ARIA, keyboard handling, focus management. This skill adds
the judgment layer on top, applied to the actual rendered screen rather than
the markup in isolation:

- **Keyboard-only pass** — can the core flow (completing a form, finishing a
  review session) be done without a mouse?
- **Icon+number pairings need accessible names** — a streak-flame icon next
  to "12" needs an accessible label, not just a visual pairing a sighted user
  can infer.
- **Contrast checked against the actual rendered background**, not the
  design token in isolation — a token that passes on paper can still fail
  against a photo, gradient, or translucent surface behind it.

---

## 8. i18n resilience

If the project targets more than one language, test labels, buttons, and any
number/counter displays with a long string — German, Vietnamese, and several
other languages routinely run longer than English — and confirm nothing
truncates or breaks layout. This matters more in product UI than marketing:
a truncated button label blocks a task; a truncated landing-page headline is
just ugly.

---

## 9. Engagement mechanics (streaks, XP, rewards, urgency)

When the product uses streaks, XP, levels, badges, or similar mechanics:

- Make the current state legible at a glance — today's status, current
  streak, progress to the next milestone — without requiring math or a trip
  to settings.
- Reserve strong visual energy for genuine milestones (leveling up,
  completing a streak). If routine states get the same celebratory treatment
  as real milestones, nothing feels earned.
- Check reward/urgency copy against any documented anti-abuse or ethical
  constraints in the project's own domain rules before shipping loss-framed
  language ("you'll lose everything") — nudge toward genuine engagement, not
  anxiety.
- Reward/streak-increment animations should be motivated feedback for a
  completed action, and must respect `prefers-reduced-motion` like any other
  motion (`design-taste-frontend` Section 6.B applies here unchanged).

---

## 10. AI tells specific to product UI

These are the dashboard/app equivalents of `design-taste-frontend` Section 9
— read that section too for the tells that apply everywhere (em-dash ban,
Inter-as-default, AI-purple, hand-rolled SVGs). The ones below are specific
to product surfaces:

- **Card soup.** Every element wrapped in an identical white card with the
  same shadow and radius, with nothing to distinguish a KPI tile from a
  settings panel from a list item. Use elevation only where it communicates
  real hierarchy; group with spacing or a hairline divider otherwise.
- **Cards inside cards.** A card containing another card containing the
  actual content is a strong tell of not having thought about layout —
  flatten it.
- **Meaningless KPI tiles.** A number with an up/down arrow and a percentage
  that doesn't map to anything the user actually tracks. If a stat isn't
  something the user would ask about, it doesn't deserve a tile.
- **Sidebar nav with no grouping.** A dozen ungrouped icons in a rail is not
  information architecture. Group by function, and don't force icon-only nav
  when a labeled list would be clearer.
- **A table that pretends to be data-dense but has no sort, filter, or
  pagination.** If there's enough data to need a "data table," it needs the
  actual table functionality, not just table-shaped styling.
- **A settings page as one long flat form.** Group related settings into
  sections; don't present 30 fields in one uninterrupted column.
- **Uniform buttons regardless of intent.** Primary, secondary, and
  destructive actions all styled the same way forces the user to read every
  label to know what a click will do.
- **Happy-path-only screens.** A polished populated state with no loading,
  empty, or error state designed is not a finished screen (see Section 6).
- **Marketing copy leaking into product UI.** Hiding the actual workflow,
  tool, or object behind an onboarding-style hero, a feature-explainer
  section, or persuasive copy on a screen the user already chose to be on.
  Once someone is inside the product, show them the tool — they don't need
  to be sold on it again.

---

## 11. Pre-flight check

Before calling product UI done:

- [ ] Design read stated (Section 1) and matches existing app conventions
      where an app already exists?
- [ ] Design system chosen per Section 2, or an existing project system
      reused instead of introducing a second one?
- [ ] `DESIGN.md` (or equivalent) checked first if it exists, and updated if
      this is the first real screen for a new project (Section 5)?
- [ ] All four UX states (loading/empty/error/populated) implemented for
      every view that loads or submits data (Section 6)?
- [ ] Hierarchy matches the task type — single-focus for task screens,
      glanceable for dashboards, scannable for management surfaces
      (Section 4)?
- [ ] Keyboard-only pass done for the core flow; icon+number pairings have
      accessible names; contrast checked against the real rendered
      background (Section 7)?
- [ ] Long-string i18n check done if the project targets more than one
      language (Section 8)?
- [ ] Engagement/reward copy checked against anti-abuse constraints, not
      judged on aesthetics alone, if the product has streak/XP/reward
      mechanics (Section 9)?
- [ ] None of the Section 10 tells present — no card soup, no cards-in-cards,
      no meaningless KPI tiles, no ungrouped nav, no fake-data-table, no flat
      settings wall, no uniform buttons regardless of intent?
- [ ] Universal hygiene from `design-taste-frontend` applied: zero em-dashes
      (Section 9.G), reduced-motion respected for anything above
      `MOTION_INTENSITY 3` (Section 6.B), both light and dark mode tested if
      the product supports both (Section 8)?
- [ ] A real screenshot pass attempted if a browser/screenshot tool is
      available in this environment; its absence stated explicitly if not?

If a box can't be honestly ticked, the screen isn't done yet.
