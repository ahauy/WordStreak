# Motion Design Principles

## Motion has a job

Every animation exists to do one of these things. If it's not doing one of them, cut it.

- **Feedback** — confirm an action happened (button press, form submit, item added to cart)
- **Orientation** — show where something came from or went to (a card expanding into a detail view, a drawer sliding in from its trigger)
- **Hierarchy** — direct attention to what matters right now (a staggered reveal that tells the eye what to read first)
- **Continuity** — preserve context across a state change (a shared element morphing instead of hard-cutting, so the user doesn't lose their place)
- **Delight** — a small moment of personality, spent deliberately and rarely, not sprinkled everywhere

Decorative motion — shimmer for its own sake, floating blobs, particles with no relationship to content — is the fastest way to make a page look AI-generated. It reads as filler because it is filler.

## Spend boldness in one place

A page with one orchestrated, well-timed hero sequence reads as intentional. A page where every card fades in, every icon wiggles on hover, and the background has ambient particles reads as anxious — like the design doesn't trust its content to hold attention on its own.

Pick the single moment that deserves choreography (usually the hero, or one key interaction that defines the product) and keep everything else quiet, fast, and understated. Restraint elsewhere makes the one bold moment land.

## Motion should match the brand's physical logic, not a library default

Ask: if this interface were a physical object, how would it move? A financial dashboard should move like glass and steel — precise, minimal overshoot, fast settle. A kids' app should move like it's made of rubber — bouncier, more elastic. A luxury brand should move slowly and deliberately, never snappy.

Defaulting to whatever the animation library ships with (usually a generic ease-in-out) skips this decision entirely. That's how two unrelated products end up moving identically.

## Orchestration beats simultaneity

When multiple elements enter together, staggering them (even by 40–80ms) reads as a designed sequence. Everything appearing at once reads as a browser paint event, not a design choice. But stagger with purpose — the order should follow reading order or visual hierarchy, not be arbitrary.

## Consistency is part of the system

Once you pick an easing curve and duration scale for a product, reuse them. A design where every modal, dropdown, and toast has its own bespoke easing feels inconsistent even if no single animation is bad. Motion needs a token system the same way color and type do — see `timing-and-easing.md` for how to define one.

## Less is a valid answer

Sometimes the right amount of motion is none. A content-dense dashboard, a data table, a settings page — these usually want near-zero animation beyond instant state feedback. Motion-heavy treatment on information-dense UI actively hurts usability by making the interface feel unstable while someone is trying to read it.

## Always respect reduced motion

`prefers-reduced-motion: reduce` should strip or drastically shorten non-essential motion (parallax, decorative reveals, autoplaying sequences) while keeping essential state-change feedback (so a toggle still visibly toggles, just without a spring). This is an accessibility requirement, not an enhancement — build it in from the first line of animation code, not bolted on at the end.