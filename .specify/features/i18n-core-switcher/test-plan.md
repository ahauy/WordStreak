# Test Plan: Core i18n Infrastructure & Instant Language Switcher

**Feature Slug**: `i18n-core-switcher`  
**Backlog Reference**: `US-I18N-01`  
**Date**: 2026-08-22  
**Target Coverage**: ≥ 90% unit & integration test coverage across all i18n modules and components.

---

## 1. Traceability Matrix (User Stories to Test Cases)

| User Story ID      | User Story Title                                       | Test Case ID    | Test Suite / Target File                                                             | Test Objective                                                                                                                                                                   |
| :----------------- | :----------------------------------------------------- | :-------------- | :----------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **US-I18N-01-001** | Instant 1-Click Toggle via Obsidian Pill Switcher      | **TC-I18N-002** | `apps/web/src/components/LanguageSwitcher/__tests__/LanguageSwitcher.test.tsx`       | Verifies instant locale toggle on click/keyboard, text/flag rendering (`🇻🇳 VI` ⇄ `🇬🇧 EN`), and callback invocation.                                                              |
| **US-I18N-01-001** | Instant 1-Click Toggle via Obsidian Pill Switcher      | **TC-I18N-003** | `apps/web/src/components/LanguageSwitcher/__tests__/LanguageSwitcher.test.tsx`       | Verifies design token compliance: Obsidian Pill geometry (`min-w-[72px]`, `h-8`, `rounded-full`, 1px hairline border, `font-mono text-xs font-bold`, stable outer anchor).       |
| **US-I18N-01-002** | Automatic Browser Detection & Storage Persistence      | **TC-I18N-001** | `apps/web/src/locales/utils/__tests__/storage.test.ts`                               | Verifies defensive localStorage getter/setter, corrupt value discarding, and `SecurityError` suppression in restricted/private modes.                                            |
| **US-I18N-01-002** | Automatic Browser Detection & Storage Persistence      | **TC-I18N-004** | `apps/web/src/locales/__tests__/i18n.test.ts`                                        | Verifies browser detection (`navigator.language` starting with `vi` -> `vi`, otherwise `en`), fallback to stored `wordstreak_locale`.                                            |
| **US-I18N-01-003** | Modular 9-Namespace Dictionaries & Fallback Resiliency | **TC-I18N-005** | `apps/web/src/locales/__tests__/fallback.test.ts`                                    | Verifies all 9 namespaces loaded (`common`, `auth`, `dashboard`, `decks`, `study`, `practice`, `community`, `analytics`, `settings`) and missing key fallback from `vi` to `en`. |
| **US-I18N-01-004** | Responsive Cross-Layout Navigation Integration         | **TC-I18N-006** | `apps/web/src/features/dashboard/components/__tests__/DashboardNavbar.i18n.test.tsx` | Verifies LanguageSwitcher mounting in `DashboardNavbar`, `Header`, and landing `Navbar` with instant navigation link localization and responsive touch target.                   |

---

## 2. Test Case Specifications

### TC-I18N-001: Storage Resilience & Error Handling

- **Scope**: `apps/web/src/locales/utils/storage.ts`
- **Preconditions**: JSDOM / browser storage environment.
- **Steps**:
  1. Test `safeGetLocale()` when storage is empty -> returns `null`.
  2. Test `safeSetLocale('vi')` -> writes `'vi'` and returns `true`.
  3. Test `safeGetLocale()` when storage contains invalid values (e.g. `'de'`, `'xyz'`, `'null'`) -> discards and returns `null`.
  4. Mock `localStorage.setItem` throwing `SecurityError` (incognito restriction) -> `safeSetLocale` returns `false` without throwing an unhandled exception.
  5. Mock `localStorage.getItem` throwing `SecurityError` -> `safeGetLocale` returns `null` safely.

### TC-I18N-002: Language Switcher Toggle & Interaction Mechanics

- **Scope**: `apps/web/src/components/LanguageSwitcher/LanguageSwitcher.tsx`
- **Preconditions**: Rendered inside `I18nextProvider`.
- **Steps**:
  1. Render `LanguageSwitcher` when active language is `'en'` -> displays `🇬🇧 EN` with `aria-label="Chuyển sang Tiếng Việt"`.
  2. Click the switcher button -> `i18n.language` switches to `'vi'`, UI displays `🇻🇳 VI`, `aria-label="Switch to English"`, and storage updates to `'vi'`.
  3. Press Enter / Space key -> toggles language back to `'en'`.
  4. Verify `onLocaleChange` callback is called with the next locale.

### TC-I18N-003: Obsidian Pill Design Token Compliance & Layout Stability

- **Scope**: `apps/web/src/components/LanguageSwitcher/LanguageSwitcher.tsx`
- **Preconditions**: Rendered component inspectable for DOM attributes and Tailwind classes.
- **Steps**:
  1. Inspect root button classes -> contains `min-w-[72px]`, `h-8`, `rounded-full`, `border`, `bg-black`, `text-white`, `font-mono`.
  2. Verify tabular character styling and centered flex layout (`inline-flex items-center justify-center gap-1.5`) preventing hover jitter.
  3. Check custom `className` pass-through and `variant="compact"` support.

### TC-I18N-004: Browser Detection Pipeline & Initialization

- **Scope**: `apps/web/src/locales/i18n.ts`
- **Preconditions**: Clean i18next instance.
- **Steps**:
  1. Mock `navigator.language = 'vi-VN'` without stored locale -> initializes with `'vi'`.
  2. Mock `navigator.language = 'en-US'` -> initializes with `'en'`.
  3. Mock `navigator.language = 'ja-JP'` -> initializes with fallback `'en'`.
  4. When `wordstreak_locale` is `'vi'` in storage, even if `navigator.language = 'en-US'` -> loads `'vi'`.

### TC-I18N-005: 9 Domain Namespaces & Missing Key Fallback Cascade

- **Scope**: `apps/web/src/locales/index.ts`, `apps/web/src/locales/__tests__/fallback.test.ts`
- **Preconditions**: Bundled 9 namespace resources (`vi` and `en`).
- **Steps**:
  1. Verify dictionary structure contains 9 namespaces: `common`, `auth`, `dashboard`, `decks`, `study`, `practice`, `community`, `analytics`, `settings`.
  2. Request a key present in `vi/common.json` -> resolves Vietnamese string.
  3. Request a missing key in `vi` namespace that exists in `en` namespace -> gracefully resolves English string without crash or raw placeholder.
  4. Verify interpolation with parameters (e.g. `cardCount_other`).

### TC-I18N-006: Cross-Layout Navigation Integration & Localization

- **Scope**: `DashboardNavbar.tsx`, `Header.tsx`, `Navbar.tsx`
- **Preconditions**: Router and i18n providers wrapped.
- **Steps**:
  1. Render `DashboardNavbar` -> verify `LanguageSwitcher` is rendered in the right action cluster.
  2. Switch language -> verify navigation links (`Tổng quan` ⇄ `Overview`, `Bộ từ vựng` ⇄ `Decks`, `Khám phá` ⇄ `Community`, `Thống kê` ⇄ `Analytics`) update synchronously.
  3. Verify `Header.tsx` forwards props and renders `DashboardNavbar` correctly.
  4. Render Landing Page `Navbar` -> verify `LanguageSwitcher` renders in both desktop action cluster and mobile drawer.
