# Timing and Easing

## Duration scale

Treat duration like a type scale — a small set of deliberate steps, reused consistently, not picked ad hoc per element.

| Tier | Duration | Use for |
|---|---|---|
| Instant | 80–120ms | Button press, checkbox toggle, tiny state flips |
| Micro | 150–200ms | Hover states, focus rings, small color/opacity changes |
| Standard | 200–350ms | Modals, dropdowns, tabs, accordion expand, tooltips |
| Emphasis | 400–600ms | Page-section reveals, card entrances, meaningful transitions |
| Sequence | 600–1000ms total (individual steps shorter, staggered) | Hero load sequences, orchestrated multi-element moments |

Rule of thumb: the larger the element or the more of the screen it affects, the longer the duration — but rarely past ~600ms for anything the user is waiting on, or it starts to feel slow rather than smooth.

## Easing — what curve to use when

Don't reach for `ease-in-out` by default. It's the least informative curve — same acceleration in and out, which suits almost nothing about how real objects or real attention move.

- **Entering the screen (element appearing):** ease-out — starts fast, settles gently. `cubic-bezier(0.16, 1, 0.3, 1)` is a good general-purpose "settle" curve.
- **Exiting the screen (element disappearing):** ease-in — starts slow, accelerates away. `cubic-bezier(0.7, 0, 0.84, 0)` works well.
- **Hover / press feedback:** fast ease-out, near-linear. `cubic-bezier(0.25, 0.46, 0.45, 0.94)` or simply `ease-out` at 100–150ms.
- **Playful / bouncy brand:** a spring, not a bezier — see the Framer Motion spring config below. Use overshoot deliberately, not by default; most products should NOT have bounce.
- **Scroll-linked motion:** linear, or better, directly driven by scroll progress (no easing function at all — the "easing" comes from how the user scrolls).
- **Loading / progress indicators:** linear for determinate progress; ease-in-out only for indeterminate pulsing.

Avoid: default `ease` (browser default, mushy), and generic `ease-in-out` for entrances — it's the single most common tell of an unconsidered animation, because it's whatever the framework gives you if you don't choose.

## Code reference

### CSS custom properties (define once, reuse everywhere)

```css
:root {
  --duration-instant: 100ms;
  --duration-micro: 180ms;
  --duration-standard: 280ms;
  --duration-emphasis: 500ms;

  --ease-out: cubic-bezier(0.16, 1, 0.3, 1);
  --ease-in: cubic-bezier(0.7, 0, 0.84, 0);
  --ease-standard: cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.card {
  transition: transform var(--duration-micro) var(--ease-out),
              box-shadow var(--duration-micro) var(--ease-out);
}

@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

### Framer Motion (Motion) — tween vs spring

```jsx
// Tween: precise, predictable — good for standard UI transitions
<motion.div
  initial={{ opacity: 0, y: 12 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
/>

// Spring: physical, good for playful brands or drag interactions — use deliberately
<motion.div
  initial={{ scale: 0.9, opacity: 0 }}
  animate={{ scale: 1, opacity: 1 }}
  transition={{ type: "spring", stiffness: 300, damping: 24 }}
/>

// Respect reduced motion
import { useReducedMotion } from "motion/react";
const shouldReduceMotion = useReducedMotion();
<motion.div
  animate={{ x: shouldReduceMotion ? 0 : 100 }}
  transition={{ duration: shouldReduceMotion ? 0 : 0.3 }}
/>
```

### GSAP

```js
gsap.to(".card", {
  y: 0,
  opacity: 1,
  duration: 0.5,
  ease: "power3.out", // GSAP's ease-out equivalent
  stagger: 0.06,       // 60ms between each element — orchestration, not simultaneity
});

// Respect reduced motion
if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
  gsap.set(".card", { y: 0, opacity: 1 }); // skip straight to end state
}
```

## Stagger values

- Tight list (nav items, small icon set): 20–40ms between items
- Card grid / content list: 50–80ms between items
- Cap total stagger time around 400–500ms even for long lists — past that, the end items feel like they're loading late rather than being part of a sequence. For long lists, either cap the number of staggered items (e.g. first 6) or reduce per-item delay as the list grows.