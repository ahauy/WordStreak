# Implementation Plan: Core i18n Infrastructure & Instant Language Switcher

**Branch**: `feat/i18n-core` | **Date**: 2026-08-22 | **Spec**: [spec.md](./spec.md)  
**Feature Slug**: `i18n-core-switcher` | **Backlog Reference**: `US-I18N-01`

---

## 1. Summary

Establish a high-performance, type-safe internationalization runtime in `apps/web` utilizing `i18next`, `react-i18next`, and `i18next-browser-languagedetector`. The system partitions translations into 9 segregated domain namespaces, detects browser language preferences synchronously with fallback to `'en'`, persists the user's choice under localStorage key `'wordstreak_locale'`, and renders an Obsidian Pill `LanguageSwitcher` (`min-w-[72px]`, `rounded-full`, 1px hairline border `#e5e5e5`/`#262626`, anti-jitter anchor) across `Header.tsx`, `DashboardNavbar.tsx`, and `LandingPage.tsx` (`Navbar.tsx`).

---

## 2. Technical Context

- **Language / Version**: TypeScript ~6.0.2 / ES2023
- **Primary Dependencies**:
  - `i18next` (^24.x)
  - `react-i18next` (^15.x)
  - `i18next-browser-languagedetector` (^8.x)
  - `react` (^19.2.8) & `react-dom` (^19.2.8)
  - `lucide-react` (^1.31.0)
  - `framer-motion` (^13.1.0)
  - `tailwindcss` (^4.3.3)
- **Storage**: `window.localStorage` (key: `'wordstreak_locale'`, values: `'vi' | 'en'`) with defensive in-memory fallback.
- **Testing Stack**: Vitest 4.x, React Testing Library 16.x, `@testing-library/jest-dom`, JSDOM.
- **Target Platform**: Modern Evergreen Browsers (Chrome, Safari, Firefox, Edge) desktop and mobile viewports (320px–1920px).
- **Performance Goals**:
  - Zero-reload language transition latency: **< 16ms** (within 1 frame at 60fps).
  - Cumulative Layout Shift: **CLS = 0.000** (Zero layout displacement on hover/toggle).
  - Initial bundle overhead: **< 15KB gzipped**.
- **Constraints**:
  - Zero full-page reloads (`window.location.reload()` is strictly forbidden).
  - Strictly 2 locales supported in Sprint 1: `'vi'` and `'en'`.
  - 100% compile-time type-safety for `useTranslation()` via TypeScript module augmentation.

---

## 3. Constitution Check & Architecture Gates

| Principle / Gate       | Requirement                               | Compliance Status | Evidence / Implementation Detail                                                                                 |
| :--------------------- | :---------------------------------------- | :---------------: | :--------------------------------------------------------------------------------------------------------------- |
| **Clean Architecture** | UI separated from storage & runtime logic |      ✅ PASS      | `storage.ts` isolates browser storage; `i18n.ts` encapsulates configuration; UI consumes via hooks.              |
| **Type Safety**        | 0 `any`, full autocomplete for all keys   |      ✅ PASS      | `declare module 'i18next' { interface CustomTypeOptions { ... } }` validates all namespace keys at compile time. |
| **Design Fidelity**    | Adherence to `DESIGN.md` Obsidian specs   |      ✅ PASS      | Obsidian Pill (`#000000`, `rounded-full`, 1px hairline border, `min-w-[72px]`, `h-8`, font-mono text).           |
| **Performance Budget** | Sub-16ms transitions, < 15KB bundle       |      ✅ PASS      | Static JSON bundling with in-memory React state flipping, no network waterfalls.                                 |
| **Accessibility**      | WCAG 2.1 AA Compliance                    |      ✅ PASS      | Dynamic `aria-label`, keyboard focus rings, Enter/Space support, 4.5:1 contrast.                                 |

---

## 4. Project Structure & File Layout

### Documentation Artifacts (Feature Spec & Plan)

```text
.specify/features/i18n-core-switcher/
├── spec.md                      # Formal technical specification
├── checklists/
│   └── requirements.md          # Specification quality checklist
├── research.md                  # Phase 0 architecture decisions & stack evaluation
├── data-model.md                # Phase 1 domain entities, storage schema, & state machine
├── contracts/
│   ├── locale.contract.ts       # Locale & storage TypeScript contracts
│   └── namespaces.contract.ts   # 9 domain namespace typed schemas
├── quickstart.md                # Phase 1 developer validation & verification guide
├── plan.md                      # This implementation plan
└── tasks.md                     # Phase 2 dependency-ordered task breakdown
```

### Source Code Changes (`apps/web/`)

```text
apps/web/
├── package.json                                         # Add i18next, react-i18next, i18next-browser-languagedetector
├── src/
│   ├── main.tsx                                         # Import './locales/i18n' before App mount
│   ├── locales/
│   │   ├── i18n.ts                                      # Core i18next initialization & detector config
│   │   ├── types.ts                                     # CustomTypeOptions module declaration augmentation
│   │   ├── constants.ts                                 # Supported locales, default namespace, storage key
│   │   ├── utils/
│   │   │   ├── storage.ts                               # Safe localStorage getter/setter with fallback
│   │   │   └── __tests__/
│   │   │       └── storage.test.ts                      # Unit tests for storage resilience
│   │   ├── vi/                                          # Vietnamese translation dictionaries
│   │   │   ├── common.json
│   │   │   ├── auth.json
│   │   │   ├── dashboard.json
│   │   │   ├── decks.json
│   │   │   ├── study.json
│   │   │   ├── practice.json
│   │   │   ├── community.json
│   │   │   ├── analytics.json
│   │   │   └── settings.json
│   │   ├── en/                                          # English translation dictionaries
│   │   │   ├── common.json
│   │   │   ├── auth.json
│   │   │   ├── dashboard.json
│   │   │   ├── decks.json
│   │   │   ├── study.json
│   │   │   ├── practice.json
│   │   │   ├── community.json
│   │   │   ├── analytics.json
│   │   │   └── settings.json
│   │   ├── __tests__/
│   │   │   └── i18n.test.ts                             # Unit tests for i18n configuration & fallback
│   │   └── index.ts                                     # Barrel export for locales
│   │
│   ├── components/
│   │   ├── LanguageSwitcher/
│   │   │   ├── LanguageSwitcher.tsx                     # Obsidian Pill Language Switcher component
│   │   │   ├── LanguageSwitcher.test.tsx                # RTL component tests
│   │   │   └── index.ts                                 # Barrel export
│   │   └── layout/
│   │       └── Header.tsx                               # Mounts LanguageSwitcher in header layout
│   │
│   └── features/
│       ├── dashboard/
│       │   └── components/
│       │       └── DashboardNavbar.tsx                  # Mounts LanguageSwitcher in dashboard topbar
│       └── landing/
│           └── components/
│               └── Navbar.tsx                           # Mounts LanguageSwitcher in public landing navbar
```

---

## 5. Implementation Strategy & TDD Approach

### 1. Test-Driven Development (TDD) Workflow

1. **Red Phase (Tests First)**:
   - Create unit tests for `safeGetLocale` and `safeSetLocale` verifying corrupted values and `SecurityError` suppression.
   - Create unit tests for `i18n.ts` verifying language change and fallback behavior.
   - Create component tests for `LanguageSwitcher.tsx` verifying toggle mechanics, `aria-label`, and text changes.
2. **Green Phase (Implementation)**:
   - Configure `i18next` instance and register resources in `apps/web/src/locales/i18n.ts`.
   - Build `LanguageSwitcher.tsx` with Tailwind Obsidian styling (`min-w-[72px]`, `rounded-full`, 1px border).
   - Integrate switcher into `Header.tsx`, `DashboardNavbar.tsx`, and `Navbar.tsx`.
3. **Refactor & Validate**:
   - Run Vitest suite: `pnpm --filter web test`.
   - Run typecheck: `pnpm --filter web typecheck`.
   - Run build: `pnpm --filter web build`.

---

## 6. Complexity Tracking

| Decision / Pattern                            | Why Needed                                                   | Simpler Alternative Rejected Because                                                              |
| :-------------------------------------------- | :----------------------------------------------------------- | :------------------------------------------------------------------------------------------------ |
| **9 Namespaces instead of 1 large JSON**      | Domain isolation, maintainability, and clean code boundaries | A single monolith JSON file causes merge conflicts and degrades readability as vocabulary grows.  |
| **Module Augmentation (`CustomTypeOptions`)** | Guarantees compile-time typo detection on keys               | Plain string keys without typing lead to silent runtime fallback bugs during refactoring.         |
| **Defensive Storage Wrapper**                 | Handles Private Browsing / Incognito Safari storage locks    | Bare `localStorage.setItem` throws fatal unhandled exceptions in restricted browser environments. |
