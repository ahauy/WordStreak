# Elicitation Interview: Core i18n Infrastructure & Instant Language Switcher (US-I18N-01)

- **Feature Slug**: `i18n-core-switcher`
- **Backlog Reference**: `US-I18N-01`
- **Date**: 2026-08-22
- **Interviewer**: Business Analyst Agent
- **Stakeholder / Sign-off**: Product Owner

---

## Stage 1 — Business Value

### 1. Problem & Pain Points

- **Current Limitation**: WordStreak's frontend UI components currently contain hardcoded English strings and lack a centralized, modular internationalization (i18n) framework.
- **User Friction**: Vietnamese learners (primary launch demographic) face cognitive overhead when navigating English-only interfaces, while English and international users require seamless English localization.
- **Consequence of Non-Action**: Inability to onboard Vietnamese native learners effectively, high bounce rate on Landing Page, fragmented translation attempts across components leading to technical debt and translation key collision.

### 2. Target Personas

1. **Guest / Unauthenticated Visitor (`Persona-Guest`)**: Visiting Landing Page or Auth modals; expects immediate auto-detection of Vietnamese (if browser is set to `vi`/`vi-VN`) or fallback to English, with the ability to instantly toggle.
2. **Authenticated Learner (`Persona-Learner`)**: Navigates Dashboard, Decks, Study sessions, and Settings; requires persistent language selection stored in `localStorage` (`wordstreak_locale`) with zero page reloads.
3. **Content Creator & Admin (`Persona-Admin`)**: Manages vocabulary decks and system settings; needs clear, consistent UI localization without broken key placeholders (`i18n:missingKey`).

### 3. Success Metrics

- **Primary Business Metric**: 100% elimination of hardcoded navigation and common UI strings across Landing Page, Header, and DashboardNavbar.
- **Performance / Technical Metric**: Instant locale toggle execution with **P95 latency < 16ms (1 frame at 60fps)**, zero full-page reloads (`window.location.reload()` prohibited), zero layout shift (CLS = 0).
- **Quality Metric**: 100% type-safety on translation keys via TypeScript module augmentation, 0 untranslated raw keys visible to end users.

---

## Stage 2 — The 6 Domain Pillars

### Pillar 1 — Personas, Actors & RBAC

- **Decision**: Language selection is a universal client-side capability accessible to all personas without authorization checks.
- **RBAC Matrix**:
  - `Guest`: Can view localized UI, toggle language on Header and Landing Page; selection saved to `localStorage`.
  - `Learner`: Full access to localized UI across all routes; toggle available on DashboardNavbar and Header.
  - `Admin`: Full access to localized UI; same client-side switcher capability.

### Pillar 2 — State Machine & Lifecycle

- **Locale Lifecycle**:
  1. `INIT`: Check `localStorage.getItem('wordstreak_locale')`.
  2. `DETECT_BROWSER`: If not found in storage, read `navigator.language` / `navigator.languages`. If starts with `vi` (e.g. `vi`, `vi-VN`), resolve to `vi`. Otherwise resolve to `en`.
  3. `APPLY_LOCALE`: Initialize `i18next` with resolved locale, load active namespaces (`common`, `auth`, `dashboard`, `settings`, etc.).
  4. `USER_TOGGLE`: User clicks Obsidian Pill switcher (`VI` ⇄ `EN`).
  5. `PERSIST_AND_UPDATE`: Update active i18next language, update `localStorage.setItem('wordstreak_locale', newLocale)`, re-render React component tree instantaneously.

### Pillar 3 — Business Rules & Algorithms

- **Confirmed Decisions**:
  - **BR-I18N-001 (Supported Locales)**: Supported locales are strictly restricted to `vi` (Vietnamese) and `en` (English).
  - **BR-I18N-002 (Browser Detection Rule)**: If no stored locale exists, browser languages matching `vi*` (e.g., `vi`, `vi-VN`) map to `vi`. All other browser locales default to `en`.
  - **BR-I18N-003 (Fallback Hierarchy)**: Default international fallback language is `en`. If a key is missing in `vi`, `i18next` falls back to `en` instead of displaying raw key names.
  - **BR-I18N-004 (Persistence Key)**: Stored preference is saved under key `'wordstreak_locale'` in `localStorage`.
  - **BR-I18N-005 (Zero-Reload UX)**: Language switching must occur via React context/state re-rendering without triggering browser document reload.
  - **BR-I18N-006 (Modular Namespaces)**: Translation resources are segregated into 9 distinct namespaces: `common`, `auth`, `dashboard`, `decks`, `study`, `practice`, `community`, `analytics`, `settings`.
  - **BR-I18N-007 (Obsidian Pill UI Geometry)**: Switcher button features an Obsidian dark theme (`#000000` background, `rounded-full`, 1px hairline border `#e5e5e5`/`#262626`, flag icon + uppercase code `🇻🇳 VI` / `🇬🇧 EN`).
  - **BR-I18N-008 (Layout Stability)**: The switcher button must have a stable outer anchor with fixed dimension/min-width to prevent 60Hz hover jitter and cumulative layout shift.

### Pillar 4 — Workflows & Edge Cases

- **Edge Case 1: Corrupted / Invalid `localStorage` Value**: If `localStorage.getItem('wordstreak_locale')` contains an invalid value (e.g. `"fr"` or `"undefined"`), the system ignores it and executes browser detection (`BR-I18N-002`), overriding storage with valid locale.
- **Edge Case 2: Missing Translation Key in Locale**: If a key exists in `en.json` but is omitted in `vi.json`, `i18next` resolves the English string seamlessly without throwing runtime exceptions.
- **Edge Case 3: Rapid Multi-Click on Switcher**: Switcher handler is idempotent and non-blocking; state updates cleanly without race conditions.
- **Edge Case 4: Private Browsing / Disabled `localStorage`**: If accessing `localStorage` throws a SecurityError/DOMException, the application catches the error gracefully and keeps the locale in memory for the session.

### Pillar 5 — Entities, Data Boundaries & Privacy

- **Client-Side Scope**: In this phase (`US-I18N-01`), language preference is strictly client-side (`localStorage`). No backend database mutation or API calls are required.
- **Privacy & PII**: Storing locale preference (`'vi'` or `'en'`) does not contain personally identifiable information (PII) and complies with GDPR/privacy standards.

### Pillar 6 — UX & Non-Functional Requirements

- **Design Language**: WordStreak Obsidian Pill styling. Smooth hover transition with subtle glow/border highlight.
- **Accessibility (A11y)**: `aria-label` dynamic attribute (`"Switch to English"` / `"Chuyển sang Tiếng Việt"`), keyboard focus ring, `role="button"`, fully navigable via Tab and Enter/Space.
- **Performance**: Bundle size impact for i18n core libraries < 15KB gzipped. Translation files bundled or loaded statically.

---

## Assumptions Confirmed

- **ASM-I18N-001**: Application supports 2 core locales at launch: `vi` (Vietnamese) and `en` (English).
- **ASM-I18N-002**: Missing translation keys in secondary locales must fall back to `en` rather than showing raw dot-notation keys.
- **ASM-I18N-003**: Persistence uses the isolated key `wordstreak_locale` in client `localStorage`.
- **ASM-I18N-004**: Language toggle is direct 1-click between VI and EN without intermediate dropdown menus.
- **ASM-I18N-005**: All UI translation keys must have compile-time TypeScript type checking to prevent typo bugs during development.
- **ASM-I18N-006**: The Obsidian Pill switcher is embedded directly into Header (Landing/Public), DashboardNavbar (Learner), and Settings page.

---

## Open Questions

- _None_ — All business rules, fallback policies, persistence keys, and UI interaction specifications have been confirmed and locked.
