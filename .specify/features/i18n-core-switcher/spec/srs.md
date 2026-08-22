# Software Requirements Specification (SRS)

## Feature: Core i18n Infrastructure & Instant Language Switcher (US-I18N-01)

- **Document Version**: 1.0
- **Feature Slug**: `i18n-core-switcher`
- **Product Backlog Reference**: `US-I18N-01`
- **Target Release**: Sprint 1 / Core Foundation

---

## 1. System Requirements

### REQ-I18N-001: Core i18next Runtime Configuration

- **Category**: Architecture / Infrastructure
- **Priority**: Must-Have (P0)
- **Status**: Ready for Implementation
- **Description**: The system shall configure and initialize `i18next` with `react-i18next` and `i18next-browser-languagedetector` in `apps/web/src/locales/i18n.ts`, supporting `'vi'` and `'en'` locales with `'en'` designated as the global fallback.
- **Derived from**: `BR-I18N-001`, `BR-I18N-003`, `ASM-I18N-001`, `CST-I18N-001`
- **Business Rules**: `BR-I18N-001`, `BR-I18N-003`
- **Non-Functional Requirements**: `NFR-PERF-02` (Initialization bundle footprint < 15KB gzipped).
- **Dependencies**: None.

---

### REQ-I18N-002: Browser Language Auto-Detection & Storage Cache

- **Category**: Functional / Client State
- **Priority**: Must-Have (P0)
- **Status**: Ready for Implementation
- **Description**: On application boot without an existing preference, the detector shall evaluate `navigator.languages` / `navigator.language`. If the primary tag begins with `'vi'`, the system shall activate `'vi'`; otherwise, it shall activate `'en'`. The resolved locale shall be cached in `localStorage` under key `'wordstreak_locale'`.
- **Derived from**: `BR-I18N-002`, `BR-I18N-004`, `ASM-I18N-003`
- **Business Rules**: `BR-I18N-002`, `BR-I18N-004`
- **Non-Functional Requirements**: Must execute synchronously prior to React tree paint to prevent flash of untranslated text.
- **Dependencies**: `REQ-I18N-001`.

---

### REQ-I18N-003: Type-Safe Namespace Contracts

- **Category**: Development Quality & Architecture
- **Priority**: Must-Have (P0)
- **Status**: Ready for Implementation
- **Description**: The system shall declare TypeScript module augmentation for `i18next` via `CustomTypeOptions` defining 9 domain namespaces (`common`, `auth`, `dashboard`, `decks`, `study`, `practice`, `community`, `analytics`, `settings`), enabling strict compile-time autocompletion and key validation.
- **Derived from**: `BR-I18N-006`, `ASM-I18N-005`
- **Business Rules**: `BR-I18N-006`
- **Non-Functional Requirements**: 0 TypeScript compilation errors under `tsc -b --noEmit`.
- **Dependencies**: `REQ-I18N-001`.

---

### REQ-I18N-004: Modular Baseline Translation Dictionaries

- **Category**: Localization Content
- **Priority**: Must-Have (P0)
- **Status**: Ready for Implementation
- **Description**: The system shall provide structured JSON translation files in `apps/web/src/locales/` for locales `en` and `vi`, covering baseline strings for `common.json`, `auth.json`, `dashboard.json`, and `settings.json`, with stubs for `decks.json`, `study.json`, `practice.json`, `community.json`, and `analytics.json`.
- **Derived from**: `BR-I18N-006`, `GAP-FUNC-02`
- **Business Rules**: `BR-I18N-006`
- **Non-Functional Requirements**: All JSON files must be valid UTF-8 and formatted with 2-space indentation.
- **Dependencies**: `REQ-I18N-003`.

---

### REQ-I18N-005: Obsidian Pill Language Switcher Component

- **Category**: UI / UX
- **Priority**: Must-Have (P0)
- **Status**: Ready for Implementation
- **Description**: The system shall provide a `LanguageSwitcher` component rendered as an Obsidian Pill (`#000000` dark surface, `rounded-full`, 1px hairline border `#e5e5e5`/`#262626`, minimum width `min-w-[72px]`, stable box-sizing). The button displays `🇻🇳 VI` when active locale is `vi`, and `🇬🇧 EN` when active locale is `en`.
- **Derived from**: `BR-I18N-007`, `BR-I18N-008`, `ASM-I18N-004`
- **Business Rules**: `BR-I18N-007`, `BR-I18N-008`
- **Non-Functional Requirements**: `NFR-CLS-01` (Zero layout shift on toggle or hover, anti-jitter stable outer anchor).
- **Dependencies**: `REQ-I18N-001`.

---

### REQ-I18N-006: Instant 1-Click Toggle & Zero-Reload State Update

- **Category**: Functional / Performance
- **Priority**: Must-Have (P0)
- **Status**: Ready for Implementation
- **Description**: Clicking the `LanguageSwitcher` button shall trigger an instant 1-click flip between `vi` and `en`, updating `localStorage` (`wordstreak_locale`) and triggering a reactive React re-render of all mounted components without calling `window.location.reload()`.
- **Derived from**: `BR-I18N-004`, `BR-I18N-005`, `ASM-I18N-004`
- **Business Rules**: `BR-I18N-004`, `BR-I18N-005`
- **Non-Functional Requirements**: `NFR-PERF-01` (Execution latency < 16ms, 60fps frame budget).
- **Dependencies**: `REQ-I18N-002`, `REQ-I18N-005`.

---

### REQ-I18N-007: Navigation Layout Integration

- **Category**: Integration / UI
- **Priority**: Must-Have (P0)
- **Status**: Ready for Implementation
- **Description**: The `LanguageSwitcher` component shall be integrated into `apps/web/src/components/layout/Header.tsx`, `DashboardNavbar`, and the public Landing Page navigation bar, positioned consistently across responsive breakpoints.
- **Derived from**: `ASM-I18N-006`, `GAP-FUNC-04`
- **Business Rules**: `BR-I18N-007`
- **Non-Functional Requirements**: Mobile and desktop responsive alignment without overlapping navigation links.
- **Dependencies**: `REQ-I18N-005`.

---

### REQ-I18N-008: Accessibility & Resilient Fallback Handling

- **Category**: Accessibility & Resiliency
- **Priority**: Should-Have (P1)
- **Status**: Ready for Implementation
- **Description**: The `LanguageSwitcher` button shall expose dynamic `aria-label` attributes (`"Switch to English"` / `"Chuyển sang Tiếng Việt"`), support keyboard focus and Enter/Space actuation, and wrap `localStorage` access in safe error handling for restricted/incognito environments.
- **Derived from**: `RISK-I18N-004`, `NFR-A11Y-01`
- **Business Rules**: `BR-I18N-003`, `BR-I18N-004`
- **Non-Functional Requirements**: `NFR-A11Y-01` (WCAG 2.1 AA Compliance).
- **Dependencies**: `REQ-I18N-005`, `REQ-I18N-006`.
