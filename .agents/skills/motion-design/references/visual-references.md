# Visual References: Feeding AI a Concrete Example

The single most effective way to avoid generic AI motion is to stop asking for animation in the abstract ("make it feel modern and smooth") and instead point at one concrete example, then explicitly ask for the same *spirit* applied differently to your actual brief. An abstract request forces the model back onto its most statistically common defaults — a specific reference gives it something real to react to and diverge from.

## The technique

1. Find one (or two, rarely more — too many references dilutes into mush) example whose motion *quality* you want, not necessarily its exact visual style.
2. Name specifically what you want carried over: the timing, the restraint, the choreography, the easing feel — not "make it look like this."
3. Explicitly ask for divergence: "same spirit of [X], but the actual treatment should come from my brief, not copy the reference's layout/palette/content."
4. If reviewing AI output that already feels generic, do the same thing retroactively: show the reference and ask "what specifically does this do differently from what you built, and why does it feel more considered?" — this forces a diagnostic pass instead of a vague "make it better."

Example prompt: *"Here's a Codrops demo of a staggered card reveal [link]. I like how understated the entrance is — short duration, small stagger, no bounce. Apply that same restraint to my pricing table, but the actual visual treatment (colors, card shape, content) should come from my brief, not copy this demo."*

## Curated sources worth pointing AI at

### Real, working code (best for "build this pattern" requests)
- **reactbits.dev** / repo `DavidHDev/react-bits` — large library of React animation components (text effects, backgrounds, interactive elements), copy-paste-able, genuinely varied rather than templated.
- **Aceternity UI** — 3D/parallax/spotlight-heavy effects, Tailwind + Framer Motion. Good reference for "wow" hero moments specifically — don't apply this density elsewhere on the page.
- **Magic UI** — landing-page-focused (marquee, particle effects, border animations). Useful reference for marketing sites; overkill for dashboards/tools.
- **Motion Primitives** — more restrained, minimal aesthetic than the above two. Better reference when the brief calls for quiet/premium rather than flashy.
- **Cult UI** — shadcn-compatible, tasteful restraint. Good reference for B2B/SaaS products that shouldn't feel playful.

### Curated inspiration (best for "what does good motion look like" browsing, not direct code)
- **Awwwards** (Animation collection) — award-winning sites, good for seeing full-page orchestration rather than isolated components.
- **Codrops (Tympanus)** — interactive demos paired with real tutorials/code, generally more restrained and craft-focused than trend-chasing.
- **Ripplix** — a large library of real micro-interactions captured from shipped products (not concepts), useful specifically because it's grounded in production reality rather than portfolio-piece excess.

### Aggregators (point AI here when you don't have a specific link yet)
- `birobirobiro/awesome-shadcn-ui` or `2-fly-4-ai/awesome-shadcnui` — indexes of most current shadcn-compatible animated component libraries.
- `fliptheweb/motion-ui-design` — curated list of motion design resources, tools, and articles (not just component libraries) — useful for the "when to use what" reasoning, not just code to copy.

## Why this beats describing motion in words

Words like "smooth," "modern," "premium," or "polished" carry almost no information — every AI-generated animation could plausibly be described that way, including the generic ones. A link carries the actual timing, restraint, and choreography that adjectives can't specify. Reserve the adjectives for describing what should be *different* from the reference (the content, the palette, the layout), and let the reference itself carry the motion quality.