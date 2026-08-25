# Elicitation: Mobile Responsive Layout & Header Navigation Fixes (TASK-MOBILE-RESPONSIVE)

## Stage 1 — Business Value

- **Problem**: Users on mobile devices (viewports from 320px to 414px+) currently encounter horizontal scroll overflow, clipped CTA buttons, cramped or overlapping header navigation elements, and unreadable interactive preview elements. Mobile learners need a seamless, fluid experience that fits their screens perfectly without horizontal panning or awkward layout clipping.
- **Personas**:
  - _Mobile Learner_ (Learner accessing WordStreak via iPhone SE, Galaxy Fold cover, standard Android/iOS smartphones).
  - _Guest Mobile Visitor_ (Prospective learner discovering WordStreak on mobile via landing page).
- **Success Metrics**:
  - `0px` horizontal scroll/overflow across all landing page and in-app routes on viewports down to 320px.
  - 100% compliant touch target sizes (minimum 44x44px for primary interactive targets) per WCAG 2.1 AA.
  - Mobile drawer open/close transition latency < 200ms with smooth 60 FPS animation.
  - Zero layout shift (CLS < 0.1) during responsive breakpoint transitions.

---

## Pillar Decisions

### Pillar 1 — Viewport Constraints & Breakpoints

- **Q1: Target Viewport Range & Minimum Screen Width**
  - **Decision**: Full responsive optimization from ultra-compact screens at **320px** (e.g. Galaxy Fold outer screen, iPhone SE 1st gen) through standard mobile (375px–414px), tablets (640px–768px), up to wide desktops (1024px+).

### Pillar 2 — Header & Navigation State Machine

- **Q2: Header Mobile Navigation Architecture**
  - **Decision**: On viewports `< 768px` (`md` breakpoint), desktop navigation links and secondary actions collapse into a circular hamburger button (`w-9 h-9` / 44px hit area). Clicking triggers a sliding/expanding Mobile Drawer containing:
    - Real-time Search input pill.
    - Navigation section links (Interactive Demo, Features, How It Works, Study Goals, FAQ).
    - Integrated Language Switcher (`LanguageSwitcher`).
    - "Sign In" link and "Start Learning Free" CTA button.

### Pillar 3 — Responsive Grid & Overflow Rules

- **Q3: Content Width & Layout Scaling Rules**
  - **Decision**:
    - No element may have a fixed width greater than `100vw` or fixed pixel min-widths that exceed 320px minus padding (`px-4` = 288px max inner content).
    - Landing page hero interactive 3D card and preview keyboard dynamically scale down with fluid typography (`clamp()`) and flex-wrapping.
    - Root containers enforce `overflow-x: hidden` / `overflow-x: clip`.

### Pillar 4 — Workflows & Edge Cases

- **Q4: Interaction State & Edge Case Handling**
  - **Decision**:
    - Drawer automatically closes when the user clicks a navigation anchor link, clicks the backdrop overlay, or presses the `Escape` key.
    - Body scrolling is locked (`overflow: hidden` on `document.body`) while the mobile drawer is active to prevent background scroll interference.
    - If the user resizes or rotates the device to `>= 768px`, the mobile drawer automatically resets to closed state.

### Pillar 5 — Accessibility (a11y) & Touch Targets

- **Q5: Mobile Accessibility & Touch Targets**
  - **Decision**:
    - Hamburger button and close buttons have explicit `aria-label="Toggle menu"` / `aria-expanded` attributes.
    - Tap targets have a minimum bounding box of 44x44px or sufficient padding.
    - High contrast ratio (>= 4.5:1) preserved for all text and icons in accordance with `DESIGN.md`.

### Pillar 6 — Non-Functional Requirements & Performance

- **Q6: Performance & Animation NFRs**
  - **Decision**:
    - Mobile drawer uses hardware-accelerated CSS / Framer Motion animations (`opacity`, `transform`, `height`).
    - Use `100dvh` (dynamic viewport height) with `100vh` fallback to prevent iOS Safari address bar clipping.

---

## Assumptions Confirmed

- **ASM-MOBILE-001**: The minimum supported mobile viewport width is 320px (Galaxy Fold cover / ultra-compact smartphone).
- **ASM-MOBILE-002**: On screens `< 768px`, the top navigation collapses all desktop nav links into a circular hamburger button triggering the Mobile Drawer.
- **ASM-MOBILE-003**: Opening the mobile drawer activates a backdrop overlay and locks `document.body` scrolling.
- **ASM-MOBILE-004**: In-app Dashboard (`/dashboard`, `/decks`, `/study`) and Auth pages (`/login`, `/register`) use flexible padding and stacking grids to ensure zero horizontal clipping on mobile screens.
- **ASM-MOBILE-005**: All interactive mobile tap targets meet WCAG 2.1 AA touch target standards (minimum 44x44px).

---

## Open Questions

- None. All elicitation decisions confirmed with Product Owner.
