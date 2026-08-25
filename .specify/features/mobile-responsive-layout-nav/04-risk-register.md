# Risk Register & Scope: Mobile Responsive Layout & Header Navigation (TASK-MOBILE-RESPONSIVE)

## 1. Contradiction Scan

- **Scan Summary**: Analyzed `03-domain-model.md` against existing CSS styles (`apps/web/src/features/landing/landing.css`), `apps/web/DESIGN.md`, and shared navigation components (`Navbar.tsx`, `DashboardNavbar.tsx`).
- **Findings**:
  - _Logic Contradictions_: None found. Breakpoint boundaries (`320px`, `640px`, `768px`, `1024px`) align directly with Tailwind CSS default breakpoints (`sm: 640px`, `md: 768px`, `lg: 1024px`, `xl: 1280px`).
  - _Design Alignment_: Conforms completely to `DESIGN.md` (Pill shapes, SF Pro Rounded typography, monochrome palette with `#fafafa` surfaces and `#e5e5e5` hairlines).
  - _Backward Compatibility_: 100% backward compatible. No API changes, no database schema changes, purely client-side layout and responsive state management.

---

## 2. Risk Register

| ID                  | Risk                                                                                                        | Prob. | Impact | Mitigation Strategy                                                                                                                              |
| :------------------ | :---------------------------------------------------------------------------------------------------------- | :---- | :----- | :----------------------------------------------------------------------------------------------------------------------------------------------- |
| **RISK-MOBILE-001** | iOS Safari dynamic address bar causing 100vh viewport clipping on bottom navigation / drawer buttons        | High  | Med    | Utilize modern CSS dynamic viewport units `100dvh` (with fallback to `100vh`) and iOS safe area padding `pb-[env(safe-area-inset-bottom)]`.      |
| **RISK-MOBILE-002** | Horizontal layout overflow on 320px ultra-compact screens caused by unyielding child containers or 3D cards | Med   | High   | Enforce `overflow-x: clip` / `overflow-x: hidden` on root containers; set `max-w-full` and responsive `clamp()` padding on hero & preview cards. |
| **RISK-MOBILE-003** | Touch target tap frustration due to small icons (< 44px) or tightly packed links on mobile                  | Med   | Med    | Enforce minimum 44x44px hit bounds or `p-2.5` padding for all tap targets per WCAG 2.1 AA (BR-MOBILE-006).                                       |
| **RISK-MOBILE-004** | Background page scroll bouncing while Mobile Drawer is open                                                 | Med   | Low    | Automatically toggle `document.body.style.overflow = 'hidden'` on drawer open and restore on drawer close.                                       |
| **RISK-MOBILE-005** | Drawer state sticking open when resizing or flipping device orientation to desktop                          | Low   | Low    | Add responsive resize listener / Tailwind `md:hidden` guard to clean up drawer state when viewport width >= 768px.                               |

---

## 3. Assumptions & Constraints Log

- **ASM-MOBILE-001**: Minimum supported mobile viewport width is 320px (Galaxy Fold outer display / iPhone SE 1st gen).
- **ASM-MOBILE-002**: On screens `< 768px`, top navigation collapses desktop menu items into a circular hamburger button triggering the Mobile Drawer.
- **ASM-MOBILE-003**: Mobile Drawer activation opens a backdrop overlay and locks background page scrolling.
- **ASM-MOBILE-004**: In-app Dashboard (`/dashboard`, `/decks`, `/study`) and Auth pages (`/login`, `/register`) use flexible padding and stacking grids with zero horizontal overflow.
- **ASM-MOBILE-005**: All interactive tap targets meet WCAG 2.1 AA touch target standards (minimum 44x44px hit area).
- **Constraint-01**: Must strictly adhere to `apps/web/DESIGN.md` styling guidelines and typography tokens.
- **Constraint-02**: Zero external heavy UI libraries added; rely on existing Tailwind CSS, Lucide React, and Framer Motion.

---

## 4. MoSCoW Scope Table

### Must-Have (P0)

- Landing Page Navbar with responsive collapse (`< 768px`) to circular hamburger button.
- Full Mobile Drawer component containing search input, navigation links, Language Switcher, Sign In, and "Start Learning Free" CTA.
- Body scroll locking when Mobile Drawer is open.
- Zero horizontal overflow (`0px` horizontal scroll) across all Landing Page sections down to 320px.
- Responsive scaling for Landing Page Hero section, terminal preview, 3D interactive flashcards, and FAQ accordion.
- Dashboard Topbar & Navbar responsive condensation for mobile screens (< 640px).
- Responsive layout for Auth pages (`/login`, `/register`) on 320px–375px screens.
- Accessible tap targets (minimum 44x44px hit area) for all primary mobile actions.

### Should-Have (P1)

- Support for iOS Safari dynamic viewport heights (`100dvh`) and safe area insets (`env(safe-area-inset-bottom)`).
- Auto-closing mobile drawer upon window resize / device orientation flip to >= 768px.
- Smooth backdrop tap dismiss and `Escape` key listener.

### Could-Have (P2)

- Touch swipe-up gesture to dismiss drawer.
- Quick floating back-to-top button on long landing page mobile scroll.

### Won't-Have (Out of Scope for TASK-MOBILE-RESPONSIVE)

- Native mobile app wrapper (React Native / Capacitor) — WordStreak operates as a responsive web app / PWA.
- Redesigning desktop-specific visual aesthetics or desktop navigation flows.
- Backend API or Database schema modifications.
