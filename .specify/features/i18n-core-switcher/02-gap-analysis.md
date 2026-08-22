# Gap Analysis: Core i18n Infrastructure & Instant Language Switcher (US-I18N-01)

- **Feature Slug**: `i18n-core-switcher`
- **Backlog Reference**: `US-I18N-01`
- **Date**: 2026-08-22
- **Author**: Business Analyst Agent

---

## 1. AS-IS (Current State)

1. **Hardcoded UI Strings**: Frontend components in `apps/web/src/` (e.g. `Header.tsx`, modal forms, navigation labels) contain static, hardcoded English text strings.
2. **Lack of i18n Core**: The application has no internationalization framework installed (`i18next`, `react-i18next`, and `i18next-browser-languagedetector` are not configured in `apps/web/package.json`).
3. **No Language Selection UI**: There is no UI component for switching or viewing active locale on any navigation bar (Header, DashboardNavbar, Landing Page).
4. **No Locale Persistence**: User preference is neither detected from browser settings nor persisted across browser sessions.
5. **No Key Typing Contract**: Absence of TypeScript types for localization keys, leaving high risk for runtime missing key errors or typo bugs.

---

## 2. TO-BE (Target State)

1. **Centralized i18n Module**: `apps/web/src/locales/` initialized with standard `i18n.ts` configuration, loading modular namespaces with fallback to `en`.
2. **Type-Safe Namespaces**: Full TypeScript integration via module augmentation (`react-i18next`) providing compile-time autocompletion and type-checking for `t('common:...')`, `t('auth:...')`, etc.
3. **Multi-Locale Translation Resources**: Baseline JSON resource bundles for `vi` and `en` across 9 distinct domains (`common`, `auth`, `dashboard`, `decks`, `study`, `practice`, `community`, `analytics`, `settings`).
4. **Instant Obsidian Pill Switcher**: Ergonomic, jitter-free Obsidian Pill component (`LanguageSwitcher`) mounted on Header, DashboardNavbar, and LandingPage.
5. **Smart Persistence & Detection**: Automatic browser language detection (mapping `vi*` to `vi`, others to `en`), cached in `localStorage` (`wordstreak_locale`), with instant 0-reload re-rendering.

---

## 3. Gap Breakdown

### Functional Gaps

- **GAP-FUNC-01**: Missing i18n core configuration, React context provider, and namespace loader.
- **GAP-FUNC-02**: Missing translation JSON dictionaries for `vi` and `en` across application modules.
- **GAP-FUNC-03**: Missing `LanguageSwitcher` Obsidian Pill component with direct toggle and accessible metadata.
- **GAP-FUNC-04**: Missing layout integration in `Header.tsx`, `DashboardNavbar`, and Landing Page layouts.

### Data & Storage Gaps

- **GAP-DATA-01**: Absence of client storage schema for language preference (`localStorage.getItem('wordstreak_locale')`).
- **Note**: No backend database schema migration is required for `US-I18N-01` (purely client-side and additive).

### User Impact Gaps

- **GAP-USER-01**: Existing users currently see only English. After deployment, Vietnamese browser users will automatically be welcomed in Vietnamese, while English users experience zero friction or disruption.
- **GAP-USER-02**: Language toggle does not reset user inputs, learning state, or scroll position.

### Transition Requirements

- **GAP-TRANS-01**: Additive deployment with no migration script needed.
- **GAP-TRANS-02**: Fallback safety net ensuring that if any component references an unmapped key or uncreated namespace during future rollout, it renders the English fallback without throwing React render errors.
