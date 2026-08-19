# Motion Patterns

Concrete recipes. Each includes when to use it, when NOT to, and working code. All respect `prefers-reduced-motion` — see the shared snippet at the bottom, applied to every pattern here.

## Hover

**Use for:** signaling interactivity on things that are actually clickable/draggable. Not for static decorative elements.

**Avoid:** the reflexive `scale: 1.05` on every card in a grid — it's become the single most recognizable "AI template" hover state because it requires zero thought about the specific content. Prefer a hover treatment that relates to what the element actually is: a link underline that draws in, a button that shifts shadow/elevation rather than scaling, an image that reveals a caption.

```css
/* Elevation shift — better default than scale for cards */
.card {
  transition: box-shadow 180ms var(--ease-out), transform 180ms var(--ease-out);
}
.card:hover {
  box-shadow: 0 12px 24px rgba(0,0,0,0.12);
  transform: translateY(-2px); /* subtle lift, not scale */
}

/* Underline draw for text links — more specific than a color change */
.link {
  background-image: linear-gradient(currentColor, currentColor);
  background-size: 0% 1px;
  background-position: 0 100%;
  background-repeat: no-repeat;
  transition: background-size 200ms var(--ease-out);
}
.link:hover { background-size: 100% 1px; }
```

## Scroll reveal

**Use for:** content where entrance order genuinely matches reading order, or where you want to draw attention to sections as they become relevant (a features list, a timeline, a case-study narrative).

**Avoid:** applying it to every single section of a page uniformly — it becomes wallpaper, and it actively slows down someone who scrolls fast to find something. Also avoid heavy parallax on text-bearing content; it hurts readability and can trigger motion sickness.

```jsx
// Framer Motion — reveal on enter, once
import { motion } from "motion/react";

<motion.div
  initial={{ opacity: 0, y: 24 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: true, margin: "-80px" }}
  transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
>
  {content}
</motion.div>
```

```js
// Vanilla — IntersectionObserver, no library
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("is-visible");
      observer.unobserve(entry.target); // reveal once, don't re-trigger on scroll-back
    }
  });
}, { threshold: 0.15 });
document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));
```

```css
.reveal { opacity: 0; transform: translateY(24px); transition: opacity 500ms var(--ease-out), transform 500ms var(--ease-out); }
.reveal.is-visible { opacity: 1; transform: none; }
```

## Page / route transition

**Use for:** SPAs where preserving context across navigation genuinely helps (e.g. a shared image or title morphing from a list into a detail view). Skip for plain content sites — a hard navigation is often the most honest, fastest option, and forcing a transition just adds perceived latency.

**Avoid:** the generic full-page crossfade or slide applied uniformly regardless of what's actually changing — it looks like a template default because it usually is one. If you don't have a specific continuity story (this element becomes that element), a transition isn't adding information.

```jsx
// Framer Motion + React Router — simple crossfade with exit
import { AnimatePresence, motion } from "motion/react";

<AnimatePresence mode="wait">
  <motion.div
    key={location.pathname}
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.2 }}
  >
    <Outlet />
  </motion.div>
</AnimatePresence>

// Shared-element (layoutId) — use when a specific element continues across routes
<motion.img layoutId={`thumb-${item.id}`} src={item.src} />
// ...on the detail page, an element with the same layoutId morphs into place automatically
```

## Staggered list entrance

**Use for:** grids/lists where showing items arrive in sequence communicates something (order of relevance, a feed loading). Cap it — see stagger values in `timing-and-easing.md`.

```jsx
const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};
const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } },
};

<motion.ul variants={container} initial="hidden" animate="show">
  {items.map((i) => <motion.li key={i.id} variants={item}>{i.label}</motion.li>)}
</motion.ul>
```

## Loading states

**Use for:** any operation over ~300ms. Under that, a loading state usually just flashes and adds noise — better to let it feel instant.

**Prefer:** skeleton screens (shape-matched placeholders) over spinners for content that has a known layout — they reduce perceived wait time and don't require an extra decode step from the user. Reserve spinners for genuinely unknown-duration operations.

```css
.skeleton {
  background: linear-gradient(90deg, var(--surface-2) 25%, var(--surface-3) 37%, var(--surface-2) 63%);
  background-size: 400% 100%;
  animation: skeleton-shimmer 1.4s ease-in-out infinite;
}
@keyframes skeleton-shimmer {
  0% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}
```

## Shared reduced-motion guard

Apply once at the top of your CSS or animation setup — every pattern above inherits it automatically if built on these primitives:

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

For JS-driven animation (Framer Motion, GSAP), check `window.matchMedia("(prefers-reduced-motion: reduce)").matches` (or the framework's built-in hook, e.g. `useReducedMotion()`) and skip straight to the end state rather than trying to shorten the animation — a 0.01ms animation can still cause a flash; explicitly setting the final state is cleaner.