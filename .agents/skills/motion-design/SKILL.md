---
name: motion-design
description: >
  Use this skill whenever building, reviewing, or refining UI/web animation — hover effects,
  scroll reveals, page transitions, loading states, micro-interactions, spring physics, or any
  motion on a frontend. Covers timing, easing curves, reduced-motion compliance, and concrete
  implementation patterns in CSS, Motion (Framer Motion), and GSAP.
triggers:
  - Building or modifying animations, transitions, or micro-interactions
  - Implementing hover effects, button presses, card lifts, or interactive state changes
  - Creating scroll-driven animations, sticky stacks, or entrance reveals
  - Implementing page transitions, tab switches, modal openings, or dropdown animations
  - User asks to make animations "smoother", "less jerky", "feel more native", or "less like AI slop"
  - Implementing loading skeletons, spinners, or ambient indicators
  - Reviewing motion for `prefers-reduced-motion` compliance or performance jank
---

# Motion Design

Motion is a design decision, not a default. Every animation should answer "what does this communicate?" — feedback, hierarchy, continuity, or delight. If the answer is "nothing, it just looks nice," that's the seed of AI slop: fade-ins on every element, the same 300ms ease on everything, cards that all scale 1.05 on hover.

This skill pairs with `frontend-design` (visual identity, layout, typography) and `design-taste-frontend` / `design-taste-product` — use them together when building UI.

## When to Use This Skill (Trigger Conditions)

Activate `motion-design` whenever any of the following apply:

| Trigger Signal                 | Example Scenario                                                            | Primary Reference                      |
| ------------------------------ | --------------------------------------------------------------------------- | -------------------------------------- |
| **Hover & Micro-interactions** | Buttons, cards, links, interactive list items, tactile clicks               | `references/patterns.md#hover`         |
| **Scroll-reveals & Staggers**  | Feature lists, case studies, staggered card entrances                       | `references/patterns.md#scroll-reveal` |
| **Timing & Easing Selection**  | Choosing durations and cubic-bezier curves instead of default ease-in-out   | `references/timing-and-easing.md`      |
| **Component Inspiration**      | Modern UI motion recipes (Aceternity, Magic UI, Codrops, Motion Primitives) | `references/visual-references.md`      |
| **Motion Anti-Slop Audit**     | Removing repetitive 1.05 scale, janky loops, and unmotivated motion         | `references/anti-slop.md`              |
| **Accessibility Compliance**   | Wrapping animations with `prefers-reduced-motion` / `useReducedMotion()`    | `references/principles.md`             |

## Workflow

1. **Gate: does this need motion at all?** Read `references/principles.md`. Most elements should stay still. Motion earns its place only where it clarifies something static design can't.
2. **Anchor to a concrete reference, not an adjective.** Before generating from scratch, prefer pointing at one real example (a specific Codrops demo, an Aceternity/Magic UI/Motion Primitives component, an Awwwards site) and asking for that motion's _quality_ applied differently to this brief — see `references/visual-references.md`. This single move prevents more genericness than any other step in this workflow, because "smooth and modern" collapses to the same defaults every time, while a real reference gives something concrete to diverge from.
3. **Pick the pattern.** Read `references/patterns.md` for concrete recipes (hover, scroll-reveal, page transition, list entrance, loading state) with working code in CSS, Framer Motion, and GSAP.
4. **Set timing and easing deliberately.** Read `references/timing-and-easing.md` — don't default to `ease-in-out 300ms` for everything. Different jobs need different curves.
5. **Self-critique before shipping.** Run the output against `references/anti-slop.md`'s checklist. This is the step people skip, and it's the one that actually prevents the generic look.

For a quick one-off animation (a single hover state, one transition), you often only need step 2 and 3 — read the relevant section of `patterns.md` and `timing-and-easing.md` directly rather than the whole workflow.

## Quick reference (for simple cases)

| Motion type                                   | Duration                          | Easing                                      | Notes                                                                   |
| --------------------------------------------- | --------------------------------- | ------------------------------------------- | ----------------------------------------------------------------------- |
| Micro (hover, press, toggle)                  | 100–200ms                         | ease-out                                    | Fast in, no bounce unless brand is playful                              |
| Standard UI transition (modal, dropdown, tab) | 200–350ms                         | ease-out (enter) / ease-in (exit)           | Enter slower-feeling than exit                                          |
| Page-level / hero / orchestrated sequence     | 400–800ms, staggered              | custom cubic-bezier                         | One deliberate sequence, not everything at once                         |
| Scroll-linked                                 | tied to scroll position, not time | linear (it's driven by scroll, not a clock) | Use sparingly — only for content that's genuinely sequential or spatial |

Full detail, code, and the reasoning behind these numbers is in `references/timing-and-easing.md`.

## The one-sentence test

Before adding any animation, finish this sentence: "This motion helps the user ___." If you can't finish it with something concrete (notice a state change, understand what's now interactive, keep spatial orientation, feel the weight of an action), don't add it. This single check prevents most of what makes AI-generated frontends feel templated.

## Reference files

- `references/visual-references.md` — how to use a concrete example (link) instead of vague adjectives, plus a curated list of component libraries and inspiration sources worth pointing at.
- `references/principles.md` — core doctrine on when and why to animate.
- `references/timing-and-easing.md` — duration/easing values and code.
- `references/patterns.md` — recipes for hover, scroll, page transitions, stagger, loading.
- `references/anti-slop.md` — checklist for self-critique before shipping.

## Respect reduced motion

Every pattern in this skill must be wrapped to respect `prefers-reduced-motion`. This isn't optional polish — ship it by default, not as an afterthought. See `references/patterns.md` for the implementation snippet used across all patterns.
