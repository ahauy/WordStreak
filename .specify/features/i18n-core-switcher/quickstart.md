# Quickstart Validation Guide: Core i18n Infrastructure & Instant Language Switcher

**Feature**: `i18n-core-switcher` (`US-I18N-01`)  
**Target Release**: Sprint 1 / Core Foundation

---

## 1. Prerequisites & Installation

Ensure you are in the workspace root and dependencies are installed:

```bash
# Verify workspace setup
pnpm install

# Check web app package dependencies
pnpm --filter web add i18next react-i18next i18next-browser-languagedetector
```

---

## 2. Validation Scenarios

### Scenario 1: Initial Browser Language Detection Test

1. Open Chrome DevTools -> Application -> Storage -> Clear site data (ensure `localStorage` is empty).
2. Set DevTools sensor/language to Vietnamese (`vi-VN`).
3. Navigate to `http://localhost:5173/`.
4. **Expected Outcome**:
   - Navigation links render in Vietnamese (e.g. _"Tổng quan"_, _"Bộ từ vựng"_, _"Khám phá"_).
   - Obsidian Pill Switcher displays `🇻🇳 VI`.
   - `localStorage.getItem('wordstreak_locale')` equals `'vi'`.

---

### Scenario 2: Instant 1-Click Toggle (Zero-Reload)

1. With the app running on `http://localhost:5173/dashboard` (or Landing Page).
2. Click the `LanguageSwitcher` pill in the navigation bar.
3. **Expected Outcome**:
   - The pill transitions from `🇻🇳 VI` to `🇬🇧 EN` (or vice versa).
   - All navigation labels and headings reactively flip language in **< 16ms** without full page refresh (`window.location.reload()`).
   - `localStorage.getItem('wordstreak_locale')` updates synchronously to `'en'`.

---

### Scenario 3: Type-Safe Translation Usage in Code

Create or inspect any React component using `useTranslation`:

```tsx
import { useTranslation } from "react-i18next";

export function ExampleCard() {
  const { t } = useTranslation(["dashboard", "common"]);

  return (
    <div>
      <h3>{t("dashboard:welcome.greeting")}</h3>
      <button>{t("common:actions.save")}</button>
    </div>
  );
}
```

Verify compile-time validation:

- Intentionally typo a key: `t('common:actions.invalidKey')` -> TypeScript highlights error: `Argument of type '"common:actions.invalidKey"' is not assignable...`.

---

### Scenario 4: Automated Vitest Test Suite

Run unit and integration test suite:

```bash
# Run tests for locales and LanguageSwitcher
pnpm --filter web test src/locales src/components/LanguageSwitcher

# Run typecheck
pnpm --filter web typecheck

# Run production build
pnpm --filter web build
```

---

## 3. Reference Links

- Technical Specification: [spec.md](./spec.md)
- Implementation Plan: [plan.md](./plan.md)
- Data Model: [data-model.md](./data-model.md)
- Contracts: [contracts/](./contracts/)
- Task Breakdown: [tasks.md](./tasks.md)
