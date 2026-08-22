# Feature Specification: Core i18n Infrastructure & Instant Language Switcher

**Feature Branch**: `feat/i18n-core`  
**Feature Slug**: `i18n-core-switcher`  
**Backlog Reference**: `US-I18N-01`  
**Created**: 2026-08-22  
**Status**: Ready for Implementation  
**Input**: Signed-off baseline from `.specify/features/i18n-core-switcher/baseline.md` and elicitation specifications in `spec/`

---

## 1. Executive Summary & Goals

The **Core i18n Infrastructure & Instant Language Switcher** (`US-I18N-01`) establishes a zero-reload, type-safe internationalization runtime in `apps/web` powering all public and authenticated learning surfaces on WordStreak.

The system delivers:

1. **Zero-Reload State Transitions**: Instantaneous locale flipping (`vi` ⇄ `en`) executed purely in React memory via `i18next` context re-renders with sub-16ms latency.
2. **Automatic Browser Locale Detection**: First-time visitors are automatically routed to Vietnamese (`'vi'`) if their browser language starts with `vi*` (e.g. `vi-VN`), defaulting to English (`'en'`) for all others.
3. **Persistent Preference**: Stored under localStorage key `'wordstreak_locale'`, resilient to storage corruption and private browsing restrictions.
4. **9 Domain Namespaces with Type-Safety**: Segregated dictionaries (`common`, `auth`, `dashboard`, `decks`, `study`, `practice`, `community`, `analytics`, `settings`) backed by TypeScript module declaration augmentation (`CustomTypeOptions`) for 100% compile-time autocomplete and key validation.
5. **Obsidian Pill Language Switcher**: High-craft UI component adhering to `apps/web/DESIGN.md` (Obsidian dark surface `#000000`, `rounded-full`, 1px hairline border, `min-w-[72px]` fixed-geometry container, anti-jitter anchor, no hover layout shift) mounted across all primary navigation layouts (`Header.tsx`, `DashboardNavbar.tsx`, `LandingPage.tsx` / `Navbar.tsx`).

---

## 2. User Scenarios & Testing

### User Story 1 - Instant 1-Click Toggle via Obsidian Pill Switcher (Priority: P1) 🎯 MVP

**Journey**: An active learner or visitor on any page wants to toggle between Vietnamese and English with a single click on the Obsidian Pill button without losing state, resetting forms, or waiting for a page reload.

**Why this priority**: Core interactive affordance required for multilingual users across all pages of the application.

**Independent Test**: Mount `LanguageSwitcher` in isolation or on any navbar, click the pill, verify text immediately changes within 16ms without `window.location.reload()`, and localStorage updates to the corresponding locale.

**Acceptance Scenarios**:

1. **Given** the current active language is `'en'` and the Obsidian Pill displays `🇬🇧 EN`, **When** the user clicks the Obsidian Pill, **Then** the active locale switches to `'vi'`, all mounted UI strings update to Vietnamese within 16ms, the pill smoothly displays `🇻🇳 VI`, and `localStorage.getItem('wordstreak_locale')` equals `'vi'`.
2. **Given** the current active language is `'vi'` and the Obsidian Pill displays `🇻🇳 VI`, **When** the user clicks the Obsidian Pill, **Then** the active locale switches to `'en'`, all mounted UI strings update to English within 16ms, the pill smoothly displays `🇬🇧 EN`, and `localStorage.getItem('wordstreak_locale')` equals `'en'`.
3. **Given** the user triggers multiple rapid clicks in succession (< 300ms intervals), **Then** each click deterministically toggles state between `vi` and `en` without state corruption, race conditions, or animation glitching.

---

### User Story 2 - Automatic Browser Language Detection & Storage Persistence (Priority: P1)

**Journey**: A first-time visitor arrives at WordStreak without having previously configured a language. The system inspects their browser settings to display the appropriate native language automatically, persisting the choice for subsequent sessions.

**Why this priority**: Eliminates onboarding friction for Vietnamese learners who would otherwise have to hunt for language settings.

**Independent Test**: Clear `localStorage`, mock `navigator.language` as `'vi-VN'` or `'en-US'`, load the application, and verify the correct locale initializes synchronously before initial paint.

**Acceptance Scenarios**:

1. **Given** a first-time visitor with no prior `wordstreak_locale` in `localStorage` and `navigator.language` is `'vi-VN'`, **When** they load the application, **Then** the application initializes in `'vi'`, renders Vietnamese strings, displays `🇻🇳 VI` on the switcher, and writes `'vi'` to `localStorage`.
2. **Given** a first-time visitor with `navigator.language` is `'en-US'`, `'fr-FR'`, or `'ja-JP'`, **When** they load the application, **Then** the application initializes in `'en'`, renders English strings, displays `🇬🇧 EN` on the switcher, and writes `'en'` to `localStorage`.
3. **Given** a returning visitor with `localStorage.getItem('wordstreak_locale') === 'vi'`, **When** they reload or revisit in a new tab, **Then** the application initializes in `'vi'` regardless of browser language settings.

---

### User Story 3 - Modular 9-Namespace Type-Safe Architecture with Resilient Fallbacks (Priority: P1)

**Journey**: Developers create and maintain features using localized strings across 9 isolated domain namespaces with full TypeScript compiler autocompletion and compile-time key validation. Users never encounter broken strings or crashes even if a key is missing.

**Why this priority**: Enforces architectural maintainability, modular bundle sizes, and zero runtime crashes due to translation oversights.

**Independent Test**: Invoke `useTranslation(['dashboard', 'common'])` in a test component, verify TypeScript compiler validates keys, and verify missing keys in Vietnamese gracefully fall back to English.

**Acceptance Scenarios**:

1. **Given** a developer writes `t('dashboard:metrics.streakDays')`, **When** compiled with `tsc -b --noEmit`, **Then** TypeScript verifies the key path against the namespace schema with 0 compilation errors.
2. **Given** a key exists in `en/common.json` but is temporarily missing in `vi/common.json`, **When** viewed in Vietnamese locale, **Then** the application resolves and displays the English fallback string without throwing an exception or rendering raw key placeholders.
3. **Given** `localStorage` contains a corrupt value (e.g. `'de'` or `'null'`), **When** the app initializes, **Then** the invalid value is discarded, browser detection runs, and a valid locale (`'vi'` or `'en'`) is activated and persisted.
4. **Given** `localStorage.setItem` throws a `SecurityError` (incognito/restricted mode), **When** switching language, **Then** the error is caught silently, and the language updates in React memory seamlessly.

---

### User Story 4 - Responsive Cross-Layout Navigation Integration (Priority: P2)

**Journey**: A learner navigates between the public Landing Page, the authenticated Dashboard, and individual feature headers, experiencing consistent language toggle placement and zero Cumulative Layout Shift (CLS = 0.00).

**Why this priority**: Guarantees visual polish, consistent branding, and accessibility across desktop, tablet, and mobile breakpoints.

**Independent Test**: Render `Header.tsx`, `DashboardNavbar.tsx`, and `Navbar.tsx` (Landing Page) at 320px, 768px, and 1280px viewports; verify switcher alignment, touch target size, and layout stability.

**Acceptance Scenarios**:

1. **Given** the `Header` / `DashboardNavbar` component is rendered, **When** viewed on desktop (1280px), **Then** the Obsidian Pill Language Switcher is anchored in the right action cluster adjacent to the Streak Flame and User Avatar.
2. **Given** the public `Navbar` (Landing Page) is rendered, **When** viewed on mobile (< 640px), **Then** the switcher remains accessible in the mobile drawer and/or header cluster with at least 36px touch target height.
3. **Given** any layout with the Obsidian Pill switcher, **When** hovering or clicking the pill, **Then** container dimensions remain fixed (`min-w-[72px]`), causing 0px layout shift to neighboring elements.

---

## 3. Edge Cases & Resiliency

1. **Storage Quota & Incognito Restrictions**:
   - `localStorage` operations are wrapped in safe utility functions (`safeGetLocale`, `safeSetLocale`).
   - If `setItem` throws `DOMException` / `SecurityError` / `QuotaExceededError`, the error is caught and logged, while in-memory `i18next` state remains fully functional.
2. **Corrupted / Invalid Storage Value**:
   - Any value in `localStorage.getItem('wordstreak_locale')` that is not strictly `'vi'` or `'en'` is discarded. The detector re-evaluates `navigator.languages` and writes a valid locale.
3. **Missing Keys Across Locales**:
   - `fallbackLng: 'en'` ensures missing keys in `'vi'` fall back to `'en'`.
   - `returnNull: false` and `returnEmptyString: false` prevent blank UI rendering.
4. **Zero Layout Shift (Anti-Jitter Geometry)**:
   - Glyph width differences between `"VI"` and `"EN"` are absorbed by `min-w-[72px]` and centered flex layout (`inline-flex items-center justify-center gap-1.5`).
   - Monospace font styling for locale label (`font-mono text-xs font-bold tracking-wider`) ensures uniform tabular character widths.
5. **SSR / Hydration Safety**:
   - Client checks verify `typeof window !== 'undefined'` and `typeof navigator !== 'undefined'` before accessing browser APIs.

---

## 4. Functional Requirements

- **FR-001**: The system MUST configure `i18next`, `react-i18next`, and `i18next-browser-languagedetector` in `apps/web/src/locales/i18n.ts`.
- **FR-002**: The system MUST designate `'en'` as the global fallback language (`fallbackLng: 'en'`).
- **FR-003**: The system MUST detect browser locale on initial boot via `i18next-browser-languagedetector` configured with lookup key `'wordstreak_locale'`.
- **FR-004**: If `navigator.languages` / `navigator.language` begins with `'vi'`, the system MUST initialize with `'vi'`; otherwise, it MUST initialize with `'en'`.
- **FR-005**: The system MUST store and retrieve the active locale from `localStorage` under key `'wordstreak_locale'`.
- **FR-006**: The system MUST partition translations into 9 segregated domain namespaces:
  1. `common.json` — Global UI, nav, buttons, generic alerts, headers, footers.
  2. `auth.json` — Login, registration, password reset, OAuth, sessions.
  3. `dashboard.json` — Overview statistics, daily streaks, goal progress.
  4. `decks.json` — Deck management, vocabulary lists, card creation, deck import/export.
  5. `study.json` — SRS flashcard study session, rating buttons (Again, Hard, Good, Easy), summary.
  6. `practice.json` — Quiz modes, multiple choice, fill in blanks, pronunciation practice.
  7. `community.json` — Public deck repository, creator profiles, clone actions.
  8. `analytics.json` — Accuracy metrics, retention heatmaps, learning velocity.
  9. `settings.json` — Profile preferences, avatar selector, security, gamification audio.
- **FR-007**: The system MUST declare TypeScript module augmentation (`declare module 'i18next' { interface CustomTypeOptions { ... } }`) in `apps/web/src/locales/types.ts` referencing all 9 namespaces with `'common'` as `defaultNS`.
- **FR-008**: The system MUST provide complete Vietnamese (`vi`) and English (`en`) JSON resource files for all 9 namespaces in `apps/web/src/locales/vi/` and `apps/web/src/locales/en/`.
- **FR-009**: The system MUST provide an `apps/web/src/components/LanguageSwitcher/LanguageSwitcher.tsx` component designed as an Obsidian Pill:
  - Surface: `#000000` (Obsidian Dark)
  - Border: 1px hairline border (`#e5e5e5` light / `#262626` dark, hover `#404040`)
  - Shape: `rounded-full`
  - Dimensions: `min-w-[72px]`, `h-8` (32px), `px-2.5 py-1`
  - Content: `🇻🇳 VI` when `vi`, `🇬🇧 EN` when `en`
  - Typography: `font-mono text-xs font-bold tracking-wider text-white`
- **FR-010**: Clicking the `LanguageSwitcher` button MUST toggle between `'vi'` and `'en'` in memory via `i18n.changeLanguage()`, synchronously updating `localStorage` without calling `window.location.reload()`.
- **FR-011**: The `LanguageSwitcher` MUST be mounted in `apps/web/src/components/layout/Header.tsx`, `apps/web/src/features/dashboard/components/DashboardNavbar.tsx`, and `apps/web/src/features/landing/components/Navbar.tsx`.
- **FR-012**: The `LanguageSwitcher` MUST provide accessible attributes (`aria-label`, `role="button"`, keyboard focus rings, Enter/Space key support).

---

## 5. Success Criteria

- **SC-001 (Zero-Reload Latency)**: Language toggle executes and re-renders all mounted components within **< 16ms** (within 1 frame at 60fps).
- **SC-002 (Layout Stability)**: Switching languages or hovering the switcher produces **CLS = 0.000** (Zero Cumulative Layout Shift).
- **SC-003 (Initial Bundle Overhead)**: i18n core libraries and static namespace resources contribute **< 15KB gzipped** to the web application bundle.
- **SC-004 (Type Safety & Build Cleanliness)**: 100% type-safety for `useTranslation()` calls with **0 TypeScript compilation errors** (`tsc -b --noEmit`).
- **SC-005 (Accessibility)**: Full compliance with **WCAG 2.1 AA** including dynamic `aria-label`, 4.5:1 text contrast ratio on Obsidian surface, and full keyboard navigation.
- **SC-006 (Test Coverage)**: ≥ 90% unit test coverage across `i18n.ts`, `storage.ts`, `LanguageSwitcher.tsx`, and layout integration points.

---

## 6. Key Entities & Domain Types

- **`SupportedLocale`**: `'vi' | 'en'`
- **`NamespaceName`**: `'common' | 'auth' | 'dashboard' | 'decks' | 'study' | 'practice' | 'community' | 'analytics' | 'settings'`
- **`LocaleMetadata`**:
  - `code`: `'vi' | 'en'`
  - `label`: `'VI' | 'EN'`
  - `name`: `'Tiếng Việt' | 'English'`
  - `flag`: `'🇻🇳' | '🇬🇧'`
  - `dir`: `'ltr'`
- **`LanguageSwitcherProps`**:
  - `className?: string`
  - `variant?: 'obsidian' | 'compact'`
  - `onLocaleChange?: (locale: SupportedLocale) => void`
  - `ariaLabel?: string`

---

## 7. Assumptions & Boundaries

1. **Target Platforms**: Modern evergreen desktop and mobile browsers (Chrome, Safari, Firefox, Edge).
2. **Locale Scope**: Strictly Vietnamese (`vi`) and English (`en`) for Sprint 1. Future locales (e.g. `ja`, `ko`, `zh`) will plug into the same namespace contract without breaking changes.
3. **Storage Mechanism**: Client-side `localStorage` with in-memory fallback. Backend sync of user locale preference to user profile in Postgres DB is supported via existing profile API when authenticated.
