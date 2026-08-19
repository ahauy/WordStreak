# WordStreak Design & Engineering Memory

This document synthesizes core product principles, design system tokens, animation physics rules, and architectural lessons learned to ensure consistent, error-free development in future iterations.

---

## 1. Product Nature & Business Model

- **Product Core**: WordStreak is an English vocabulary retention platform based on Spaced Repetition (SuperMemo-2 / SM-2 algorithm), contextual multi-sensory flashcards, varied active recall quizzes, and habit-forming streak loops (as specified in [`vocabulary-app-feature-ideas.md`](vocabulary-app-feature-ideas.md)).
- **Business Model**: **100% Free & Open-Source Forever**. Never introduce paid subscription tiers, pricing tables, or mocked CLI installation commands like `npx wordstreak learn`.
- **Data Ownership**: Full exportability to standard Anki (`.apkg`), CSV, and JSON at any time. Built local-first for offline synchronization without vendor lock-in.

---

## 2. Brand Identity & Mascot (Purple Streak Flame)

- **Streak Mascot**: Always an **Animated Burning Purple Flame (Electric Violet Flame)**:
  - Multi-layered violet gradients: deep purple (`#4c1d95` / `#7e22ce`), electric violet (`#9333ea` / `#c084fc`), and pure white core hotspot (`#ffffff`).
  - Living animations: dual alternating flickering flame tongues (`flame-flicker-1`, `flame-flicker-2`), ambient purple aura glow (`flame-pulse-glow`), and floating ember particles (`flame-ember-1`, `flame-ember-2`).
- **Hero Section**: Concise, punchy, directly highlighting the daily habit loop and streak protection, integrated with a compact instant AI vocabulary lookup simulator and IPA phonetic preview.

---

## 3. Design System & Typography ([apps/web/DESIGN.md](apps/web/DESIGN.md))

- **Palette & Canvas**:
  - Canvas Background: Pure white (`#ffffff`).
  - Borders: Clean hairline borders (`#e5e5e5` / `#d4d4d4`).
  - Primary Action (CTA): Obsidian pill button (`#000000`, `.btn-primary`) with pure white text and full pill curvature (`rounded-full`).
  - Accent Color: Royal violet (`#9333ea`, `#7e22ce`, `#c084fc`).
- **Typography Tokens**:
  - Display Headings: `Nunito` (500/600/700/800 font weights).
  - Body Copy: `Inter` (400/500/600 font weights).
  - Code, Tags & Telemetry: `JetBrains Mono` (400/500/600 font weights).

---

## 4. Card Animation Physics & Interaction Rules

### 📌 Lesson 1: Eliminating Hover Oscillation Flicker (Stable Outer Anchor)

- **Problem**: Never attach `onMouseEnter` / `onMouseLeave` directly to an element that translates upwards upon hover. When the cursor is near the bottom edge, the card lifts up and moves away from the cursor $\rightarrow$ triggers `onMouseLeave` $\rightarrow$ card drops down $\rightarrow$ cursor is inside again $\rightarrow$ creates a 60Hz rapid flickering loop.
- **Standard Solution**:
  - **Stable Outer Anchor**: Stays strictly anchored to its scroll coordinates, provides an extended hit boundary (`pt-14 -mt-14 pb-6 -mb-6`), and holds hover events.
  - **Inner Visual Card**: Performs the smooth spring translation (`stiffness: 360, damping: 24`).
  - The cursor remains 100% inside the outer anchor boundary even when the inner card lifts up $\rightarrow$ **Zero hover jitter/flicker**.

### 📌 Lesson 2: Radial Card Pull-Out along its own Vector

- When hovering or drawing a card from a fanned deck, **DO NOT straighten the card back to $0^\circ$**.
- Preserve the card's natural tilt angle $\theta$ and slide it outward along its own radial vector:
  $$\Delta x = D \cdot \sin(\theta)$$
  $$\Delta y = -D \cdot \cos(\theta)$$
  $$\text{Rotation} = \theta \quad (\text{Maintains original fanned tilt angle})$$

### 📌 Lesson 3: Scroll-Driven Progressive Decks (Fanned-Out & Converging)

- Applied to sections such as _How WordStreak builds retention_ and _Your words stay yours_:
  - Cards begin in a tightly flush stack at the center.
  - Using Framer Motion `useScroll` + `useTransform`: as the user scrolls towards the center, cards progressively fan out to full apex curve matching the scroll speed; as the user scrolls past, cards automatically gather/collapse back into the tight stack.
  - Center card elevated higher at the apex (`y: -28px`) to form a graceful arch crown.
  - Hovering triggers an immediate zero-delay pull-out with `z-index: 60`.

### 📌 Lesson 4: Continuous Left-to-Right Curved Arc Stream

- Applied to _Engineered for effortless retention_:
  - 12 capability cards (2 sets of 6) glide continuously and seamlessly at 60fps from **Left to Right** along a parabolic arch trajectory ($x, y = (x/R)^2 \times 36\text{px}, \text{rotate} = (x/R) \times 9.5^\circ$).
  - Pure uninterrupted stream without hover pauses or hover displacements, GPU-accelerated via `translate3d` directly in `requestAnimationFrame`.

---

## 5. Git Commit & Quality Standards

- Always write concise commit messages on **strictly a single line** following Conventional Commits format (e.g. `feat(landing): redesign landing page with animated purple streak flame and interactive card decks`).
- Verify quality gates before committing: `pnpm --filter web build` & `pnpm --filter web lint` must pass with **0 errors**.
