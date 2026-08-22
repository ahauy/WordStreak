# Product Requirements Document (PRD)

## Feature: Core i18n Infrastructure & Instant Language Switcher (US-I18N-01)

- **Document Version**: 1.0
- **Feature Slug**: `i18n-core-switcher`
- **Product Backlog Reference**: `US-I18N-01`
- **Target Release**: Sprint 1 / Core Foundation

---

## 1. Product Overview & User Experience

The Core i18n infrastructure provides a lightning-fast, seamless bilingual experience for WordStreak web application users. The system automatically honors the user's browser language on first arrival and remembers manual overrides persistently in `localStorage`.

The primary touchpoint is the **Obsidian Pill Language Switcher**, a minimalist toggle button styled in accordance with WordStreak's Obsidian glass theme, placed consistently across all navigation headers.

---

## 2. User Experience & Component Specifications

### 2.1 Obsidian Pill Switcher Design

- **Visual Structure**:
  - Container: Pill shape (`rounded-full`), height `h-8` or `h-9`, explicit minimum width `min-w-[72px]`.
  - Color & Surface: Deep obsidian black (`#000000` / `bg-black/90`) with backdrop blur.
  - Border: 1px hairline border (`border-neutral-200` in light mode, `border-neutral-800` in dark mode, transition to `border-neutral-600` on hover).
  - Typography: Clean sans-serif uppercase (`text-xs font-semibold tracking-wider text-neutral-200`).
  - Iconography: Unicode/SVG Flag icons: `🇻🇳 VI` (Vietnamese) and `🇬🇧 EN` (English).
- **Interaction Model**:
  - Single click toggles directly between `vi` and `en`.
  - Micro-interaction: Smooth press state (`active:scale-95`), transition duration `150ms ease-in-out`.
  - No hover jitter or layout shifts: Bounding box remains identical in both states.

### 2.2 Navigation Bar Placement

1. **Public Header (`Header.tsx`)**: Placed in the right-side action cluster beside Login / Register CTA buttons.
2. **Dashboard Navbar (`DashboardNavbar.tsx`)**: Placed adjacent to the User Avatar / Streak indicator.
3. **Landing Page Top Navigation**: Mounted as the primary language control for guest visitors.

---

## 3. Detailed Product Capabilities

### 3.1 Zero-Reload Instant State Re-render

- Language switching executes instantaneously in React memory.
- Current form inputs, video/audio playback, and active learning queues remain uninterrupted without full page reload (`window.location.reload()` is strictly forbidden).

### 3.2 Intelligent Browser Auto-Detection

- Guests arriving without stored preference are automatically served Vietnamese if their browser header contains `vi` or `vi-VN`.
- All other languages (e.g. `en-US`, `en-GB`, `fr`, `ja`, `zh`) default gracefully to English (`en`).

### 3.3 Modular Namespaces

- Translation keys are isolated across 9 domains to ensure high developer velocity:
  1. `common` — Global navigation, buttons, generic actions, system alerts.
  2. `auth` — Authentication, sign-in, registration, password recovery.
  3. `dashboard` — Dashboard widgets, metrics, quick actions, streaks.
  4. `decks` — Flashcard decks, deck creation, deck filters.
  5. `study` — Study interface, flashcard flipping, spaced repetition rating.
  6. `practice` — Quiz modes (Multiple Choice, Fill in Blank, Matching, Listening).
  7. `community` — Public deck gallery, discovery, clone actions.
  8. `analytics` — Learning statistics, charts, heatmaps.
  9. `settings` — User preferences, profile, security settings.

---

## 4. Acceptance Criteria Summary

1. **AC-PRD-01 (Detection & Storage)**: First-time Vietnamese browser users see Vietnamese by default; switching writes `wordstreak_locale` to `localStorage`.
2. **AC-PRD-02 (Instant Switch)**: Clicking the Obsidian Pill toggles language across all mounted views in < 16ms without page reload.
3. **AC-PRD-03 (Fallback Integrity)**: Unimplemented or missing Vietnamese keys seamlessly display their English translation without error or placeholder artifacts.
4. **AC-PRD-04 (Obsidian Pill UX)**: The switcher renders flag + uppercase code (`🇻🇳 VI` / `🇬🇧 EN`) inside a rounded pill with a 1px border and zero hover jitter.
