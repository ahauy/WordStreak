# Anti-Slop Checklist

Run through this before calling UI work done. It's a fast scan, not a rewrite — most of these take seconds to check and seconds to fix.

## Color and surface
- [ ] Is there a purple-to-blue gradient background with no real reason for it? (The single most common AI-generated tell — remove unless the brief specifically calls for it.)
- [ ] Are more than 1–2 cards using glassmorphism (translucent blur) without a reason tied to the content?
- [ ] Do all cards/panels have the exact same shadow, radius, and border, with nothing to distinguish importance?
- [ ] Does contrast actually hold up in whichever mode (light/dark) the project ships — not just the one visible while coding?

## Layout
- [ ] Is everything center-aligned in a single column, including things that would read better left-aligned or in an asymmetric layout?
- [ ] Is there a 3-column grid of "icon + bold title + one sentence" repeated 3, 4, or 6 times with near-identical sentence lengths?
- [ ] Does spacing follow an actual scale, or does it look eyeballed (e.g. 13px here, 22px there)?
- [ ] Is there one clear focal point per screen, or does everything compete for attention equally?

## Typography
- [ ] Is there real hierarchy (size + weight together), or does every heading look like body text with a size bump?
- [ ] Is line-length reasonable for body text (not full-width on a wide screen)?

## Interaction and states
- [ ] Does every clickable element have a hover/focus state and `cursor: pointer`?
- [ ] Is there a real loading state, or just a blank screen while data fetches?
- [ ] Is there a real empty state, or just "No data" with nothing else?
- [ ] Do error states explain what happened, or just show a raw error?
- [ ] Are animations purposeful (communicate a state change) rather than decorative bounce/fade-in on static content?

## Content
- [ ] Does copy sound specific to this product, or could it be pasted onto any competitor's site unchanged?
- [ ] Is any "social proof" or stat real, or is it a placeholder that should be removed until real data exists?
- [ ] Are icons used consistently (one icon set/style), not mixed emoji + icon library + inconsistent stroke widths?

## Final gut check
- [ ] If you saw this UI with no context, would you guess it was AI-generated in under 5 seconds? If yes, the most likely culprits are at the top of this list — start there.
