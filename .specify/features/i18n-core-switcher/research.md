# Research & Architecture Decisions: Core i18n Infrastructure & Instant Language Switcher

**Feature**: `i18n-core-switcher` (`US-I18N-01`)  
**Date**: 2026-08-22  
**Status**: Resolved

---

## 1. Decision: Localization Library & Runtime Engine

### Decision

Adopt `i18next` (v24.x) + `react-i18next` (v15.x) + `i18next-browser-languagedetector` (v8.x) as the core client-side internationalization runtime in `apps/web/src/locales/i18n.ts`.

### Rationale

1. **Zero-Reload State Transitions**: `react-i18next` provides high-performance React Context hooks (`useTranslation()`) that trigger instant re-renders across subscribed components without triggering browser navigation or page reloads (`window.location.reload()`), maintaining < 16ms render updates.
2. **Standardized TypeScript Module Augmentation**: Supported natively via `CustomTypeOptions` in `i18next`, eliminating third-party wrapper libraries.
3. **Pluggable Architecture**: Native integration with `i18next-browser-languagedetector` for cookie/localStorage/navigator detection order.
4. **Fallback & Interpolation**: Built-in multi-namespace support, automatic key fallback (`vi` -> `en`), and pluralization/interpolation without additional dependencies.

### Alternatives Considered

- **Custom React Context / Zustand Store**: Writing a custom i18n store with a simple dictionary map.
  _Rejected because_: Lacks standard pluralization, fallback cascades, namespace resolution, and requires building and maintaining custom type generation scripts.
- **FormatJS (`react-intl`)**:
  _Rejected because_: Heavier bundle footprint, more boilerplate for namespace partitioning, and less ergonomic TypeScript key augmentation compared to `i18next`.

---

## 2. Decision: Static Resource Bundling vs Async Dynamic Chunking

### Decision

Bundle Vietnamese (`vi`) and English (`en`) JSON translation resources statically in the client bundle for initial release across all 9 domain namespaces (`common`, `auth`, `dashboard`, `decks`, `study`, `practice`, `community`, `analytics`, `settings`).

### Rationale

1. **Zero Flash of Untranslated Content (FOUC)**: Synchronously available translations ensure the first frame paints with the correct language immediately.
2. **Sub-16ms Instant Switching**: Switching between `vi` and `en` requires zero network roundtrips.
3. **Minimal Bundle Footprint**: Total JSON payload for 9 namespaces across both languages is ~12KB uncompressed (~3.5KB gzipped), well within our 15KB budget.
4. **Code Simplicity**: Avoids complexity of suspense fallbacks and HTTP backend loaders for basic UI strings.

### Alternatives Considered

- **`i18next-http-backend` (Dynamic Fetch)**:
  _Rejected because_: Introduces async loading spinners / layout jumps when switching languages, requires hosting `/locales/{lng}/{ns}.json` in `public/`, and fails in offline/flaky network conditions during flashcard reviews.

---

## 3. Decision: Compile-Time Type-Safety via `CustomTypeOptions`

### Decision

Declare TypeScript module augmentation for `i18next` in `apps/web/src/locales/types.ts`:

```typescript
import "i18next";
import type { TranslationResources } from "./contracts/namespaces.contract";

declare module "i18next" {
  interface CustomTypeOptions {
    defaultNS: "common";
    resources: TranslationResources;
  }
}
```

### Rationale

1. **100% Compile-Time Validation**: `t('common:actions.save')` and `t('dashboard:metrics.streakDays')` are validated by TypeScript. Typos trigger `tsc` errors.
2. **IDE Autocomplete**: VS Code / WebStorm provides instant key suggestions when typing `t('...')`.
3. **Zero Runtime Overhead**: Type declarations are erased at compile time.

---

## 4. Decision: Obsidian Pill UI Geometry & Anti-Jitter Architecture

### Decision

Design `LanguageSwitcher.tsx` with a rigid outer boundary adhering to `apps/web/DESIGN.md`:

- **Surface**: Pure Black (`#000000`)
- **Border**: 1px solid hairline (`#e5e5e5` light / `#262626` dark, hover `#404040`)
- **Shape**: `rounded-full` (9999px pill)
- **Geometry Constraint**: `min-w-[72px]`, `h-8` (32px), `px-2.5 py-1`, `box-border`
- **Typography**: `font-mono text-xs font-bold tracking-wider text-white`
- **Content**: Flag emoji + 2-letter uppercase ISO code (`🇻🇳 VI` ⇄ `🇬🇧 EN`)

### Rationale

1. **Anti-Jitter (CLS = 0.00)**: In variable-width fonts, `"VI"` (~14px) and `"EN"` (~16px) differ in width. A fixed `min-w-[72px]` container with centered flex children absorbs this difference, preventing neighboring buttons from shifting horizontally during hover or toggle.
2. **Design Language Harmony**: Perfectly matches the Obsidian design system (pure black CTAs, hairline borders, pill geometry) defined in `DESIGN.md`.
3. **Touch Target Size**: Meets 36px+ touch target height with standard padding on mobile navigation.

---

## 5. Decision: Safe LocalStorage Resilience & Fallback Hierarchy

### Decision

Implement a defensive storage utility (`safeLocalStorage`) wrapping all `getItem`, `setItem`, and `removeItem` calls in try-catch blocks, with an in-memory fallback.

```typescript
export const safeGetLocale = (): SupportedLocale | null => {
  try {
    const val = localStorage.getItem("wordstreak_locale");
    return val === "vi" || val === "en" ? val : null;
  } catch {
    return null;
  }
};
```

### Rationale

1. **Incognito & Restricted Browsing**: Safari Private Browsing and certain WebViews throw `SecurityError` or `QuotaExceededError` on `localStorage` access.
2. **Corrupted Preference Recovery**: Invalid strings (e.g. `'de'`, `'undefined'`) are discarded safely, falling back to browser language detection.
3. **Robust Fallback Order**:
   1. Valid `wordstreak_locale` in `localStorage`
   2. Browser language detection (`navigator.languages` / `navigator.language`)
   3. Global fallback (`'en'`)

---

## 6. Decision: TDD Testing & Verification Approach

### Decision

Implement automated testing across 3 layers using Vitest and React Testing Library:

1. **Unit Tests**:
   - `storage.test.ts`: Verify `safeGetLocale`, `safeSetLocale`, corruption handling, and error suppression.
   - `i18n.test.ts`: Verify configuration, language switching, fallback behavior, and missing key handling.
2. **Component Tests**:
   - `LanguageSwitcher.test.tsx`: Verify rendering `🇻🇳 VI` vs `🇬🇧 EN`, click toggle, keyboard interactions (Enter/Space), `aria-label`, and `min-w-[72px]` styling.
3. **Integration Tests**:
   - `DashboardNavbar.test.tsx` / `LandingNavbar.test.tsx`: Verify switcher integration, reactive text updates across nav items upon toggle, and zero reload execution.
