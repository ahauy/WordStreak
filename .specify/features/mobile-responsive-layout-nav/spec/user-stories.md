# User Stories: Mobile Responsive Layout & Header Navigation (TASK-MOBILE-RESPONSIVE)

### US-MOBILE-001: Responsive Header & Mobile Drawer Navigation

**As a** Mobile Learner or Visitor  
**I want to** have a compact header on mobile viewports (< 768px) with a circular hamburger button that opens an accessible, full-featured Mobile Drawer  
**So that** I can easily navigate site sections, switch languages, search vocabulary, and access login/signup without layout distortion or clipped elements.  
**Derived from**: BR-MOBILE-002, BR-MOBILE-003, BR-MOBILE-004, BR-MOBILE-006, ASM-MOBILE-002, ASM-MOBILE-003, ASM-MOBILE-005

**Acceptance Criteria**:

- **Scenario 1 (Header Responsive Collapse on Mobile Viewports)**
  - **Given** I am on the WordStreak Landing Page with a screen width `< 768px` (e.g. 375px or 320px)
  - **When** the page renders
  - **Then** desktop nav links and desktop CTA buttons are hidden
  - **And** the header displays the brand logo on the left and a circular hamburger button (`w-9 h-9`, `rounded-full`) on the right
  - **And** the hamburger button has `aria-label="Toggle menu"` and `aria-expanded="false"`.

- **Scenario 2 (Opening Mobile Drawer & Viewing Navigation)**
  - **Given** the mobile header is rendered
  - **When** I tap the hamburger button
  - **Then** the icon toggles to a close (`X`) icon with `aria-expanded="true"`
  - **And** a dark backdrop overlay (`bg-black/40`) renders behind the drawer
  - **And** the Mobile Drawer animates open containing:
    - Search input field
    - Section links: "Interactive Demo", "Features", "How It Works", "Study Goals", "FAQ"
    - Language switcher row with label and `LanguageSwitcher` pill
    - "Sign In" link (`/login`)
    - "Start Learning Free" CTA button (`/register`)
  - **And** background page scrolling is locked (`overflow: hidden` on `document.body`).

- **Scenario 3 (Navigating via Drawer Section Anchor)**
  - **Given** the Mobile Drawer is open
  - **When** I tap "How It Works"
  - **Then** the Mobile Drawer smoothly closes
  - **And** the page smoothly scrolls to the `#how-it-works` section
  - **And** body scroll is restored.

- **Scenario 4 (Language Switching inside Mobile Drawer)**
  - **Given** the Mobile Drawer is open
  - **When** I tap the Language Switcher and choose "Tiếng Việt"
  - **Then** the interface language switches immediately to Vietnamese
  - **And** all drawer links and landing page content reflect the translated text
  - **And** the drawer remains open and responsive.

- **Scenario 5 (Dismissing Drawer via Backdrop or Escape Key)**
  - **Given** the Mobile Drawer is open
  - **When** I tap the backdrop overlay outside the drawer or press the `Escape` key
  - **Then** the Mobile Drawer closes smoothly
  - **And** body scroll is restored.

- **Scenario 6 (Touch Target Sizing & a11y Compliance)**
  - **Given** the header and mobile drawer are rendered
  - **When** interactive targets are inspected
  - **Then** all tap buttons, links, and switches have an effective hit target area of at least 44x44px per WCAG 2.1 AA.

---

### US-MOBILE-002: Landing Page Viewport Scaling & Overflow Prevention down to 320px

**As a** Learner using an ultra-compact smartphone (e.g. iPhone SE, Galaxy Fold cover display at 320px–375px)  
**I want** all sections of the Landing Page to scale fluidly and prevent horizontal scrolling  
**So that** I can read descriptions, interact with vocabulary lookup, and view flashcard previews seamlessly.  
**Derived from**: BR-MOBILE-001, BR-MOBILE-005, BR-MOBILE-006, ASM-MOBILE-001, ASM-MOBILE-005

**Acceptance Criteria**:

- **Scenario 1 (Zero Horizontal Scrollbar on 320px Viewport)**
  - **Given** the browser viewport width is set to `320px`
  - **When** I load the Landing Page and scroll from top to bottom
  - **Then** `document.documentElement.scrollWidth` equals `window.innerWidth` (exactly 0px horizontal scroll overflow)
  - **And** `overflow-x: hidden` / `overflow-x: clip` prevents any horizontal panning.

- **Scenario 2 (Hero Section & Interactive Card Scaling)**
  - **Given** I am viewing the Hero section on a `320px` to `375px` viewport
  - **When** the hero title, lookup input, and 3D preview card are displayed
  - **Then** the hero title font scales comfortably (`clamp()` / responsive font size) without word breaking
  - **And** the interactive 3D flashcard fits within 100% of the container width (`max-w-full`) with comfortable margins (`px-3 sm:px-6`).

- **Scenario 3 (Terminal Preview & Stream Retention Cards Responsive Wrap)**
  - **Given** I am scrolling past the Terminal Preview and retention stream sections
  - **When** the components render on mobile
  - **Then** code snippets wrap or provide smooth horizontal touch scroll within their card boundaries without stretching the page
  - **And** flashcard stream items stack cleanly or scroll horizontally in an isolated touch container.

- **Scenario 4 (Pricing, FAQ Accordion, and Footer Mobile Stacking)**
  - **Given** I view the Pricing, FAQ, and Footer sections on a mobile screen
  - **When** the sections render
  - **Then** pricing comparison cards stack into a single column
  - **And** FAQ accordions expand/collapse smoothly without pushing layout bounds
  - **And** footer link columns stack vertically with aligned touch targets and copyright notice.

---

### US-MOBILE-003: Dashboard & In-App Layout Compact Responsiveness

**As an** Authenticated Learner using WordStreak on mobile  
**I want** the in-app navigation bar (`DashboardNavbar`), deck overview, and auth screens to adapt gracefully to small viewports  
**So that** I can study flashcards, check my streak flame, and manage settings comfortably on mobile.  
**Derived from**: BR-MOBILE-006, BR-MOBILE-007, BR-MOBILE-008, ASM-MOBILE-004, ASM-MOBILE-005

**Acceptance Criteria**:

- **Scenario 1 (Dashboard Topbar Mobile Condensation)**
  - **Given** I am logged into WordStreak and navigating `/dashboard` on a `< 640px` viewport
  - **When** the `DashboardNavbar` renders
  - **Then** streak flame, level badge, and profile avatar are displayed compactly without overlapping
  - **And** offline sync pill and language selector adapt cleanly.

- **Scenario 2 (Auth Pages Responsive Centering on 320px–375px)**
  - **Given** I navigate to `/login` or `/register` on a 320px screen
  - **When** the auth card renders
  - **Then** the card width spans 100% of available width within container padding (`px-4 py-6`)
  - **And** all form fields, show/hide password toggles, and submit buttons are fully accessible and tap-friendly (>= 44px).

- **Scenario 3 (Deck List & Study View Responsive Layout)**
  - **Given** I navigate to `/decks` or start a study session at `/study` on mobile
  - **When** the cards and study controls render
  - **Then** flashcard rating buttons (Again, Hard, Good, Easy) stack or fit horizontally without clipping
  - **And** deck statistics fit comfortably within the viewport.
