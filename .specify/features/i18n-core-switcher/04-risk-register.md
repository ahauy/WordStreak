# Risk Register & Scope Boundaries: Core i18n Infrastructure (US-I18N-01)

- **Feature Slug**: `i18n-core-switcher`
- **Backlog Reference**: `US-I18N-01`
- **Date**: 2026-08-22
- **Author**: Business Analyst Agent

---

## 1. Contradiction & Compatibility Scan

| Check Category             | Verification Item                                                              | Scan Result | Resolution / Status                                                                                                   |
| :------------------------- | :----------------------------------------------------------------------------- | :---------: | :-------------------------------------------------------------------------------------------------------------------- |
| **Logic Contradiction**    | Browser detection vs. Stored locale preference priority                        |   Passed    | `BR-I18N-002` strictly gives `localStorage` priority over browser detection when valid.                               |
| **State Deadlock**         | Invalid / Corrupt localStorage locale value handling                           |   Passed    | Handled gracefully: invalid value routes to browser detection fallback, setting state to `Ready`.                     |
| **Backward Compatibility** | Existing component hardcoded strings vs i18n wrappers                          |   Passed    | Missing translation keys default to English fallback without throwing React runtime crashes.                          |
| **Layout Integrity**       | Variable string lengths between Vietnamese and English causing visual breakage |   Passed    | UI buttons and cards must use flexible layout / wrapping; Obsidian Pill switcher has fixed min-width (`BR-I18N-008`). |

---

## 2. Risk Register

| ID                | Risk Description                                                                                                        | Prob. | Impact | Mitigation Strategy                                                                                                          |
| :---------------- | :---------------------------------------------------------------------------------------------------------------------- | :---: | :----: | :--------------------------------------------------------------------------------------------------------------------------- |
| **RISK-I18N-001** | **Missing Key in Production Bundle**: New UI components deployed with missing translation keys in `vi.json`.            |  Med  |  Med   | Enforce strict TypeScript compilation typing (`CustomTypeOptions`) and runtime fallback hierarchy to `en` per `BR-I18N-003`. |
| **RISK-I18N-002** | **Flicker / Hydration Mismatch**: Initial render displaying English for a split-second before switching to Vietnamese.  |  Low  |  Med   | Initialize `i18next` synchronously in `i18n.ts` prior to React root mounting in `main.tsx`.                                  |
| **RISK-I18N-003** | **Layout Shift (CLS) on Hover or Toggle**: Pill button changing width between `VI` and `EN` or hovering causing jitter. |  Low  |  Low   | Fix min-width to `min-w-[72px]`, ensure equal typography bounding boxes and stable CSS border box (`BR-I18N-008`).           |
| **RISK-I18N-004** | **Private Browsing / Blocked Storage**: User in incognito mode blocking `localStorage` access.                          |  Low  |  Low   | Wrap storage reads/writes in safe `try/catch` helper; keep active locale in React memory if storage fails.                   |
| **RISK-I18N-005** | **Namespace Bloat**: Loading all application translation files in a single monolithic bundle.                           |  Low  |  Low   | Namespace architecture cleanly segregates translation files across 9 distinct modules (`BR-I18N-006`).                       |

---

## 3. Consolidated Assumptions & Constraints

### Assumptions (`ASM-I18N-###`)

- **ASM-I18N-001**: Application supports 2 core locales at launch: `vi` (Tiếng Việt) and `en` (English).
- **ASM-I18N-002**: Missing translation keys in secondary locales must fall back to `en` rather than rendering raw dot-notation keys.
- **ASM-I18N-003**: Persistence uses the isolated key `wordstreak_locale` in client `localStorage`.
- **ASM-I18N-004**: Language toggle is direct 1-click between VI and EN without intermediate dropdown menus.
- **ASM-I18N-005**: All UI translation keys must have compile-time TypeScript type checking via `CustomTypeOptions`.
- **ASM-I18N-006**: The Obsidian Pill switcher is embedded directly into Header (Landing/Public), DashboardNavbar (Learner), and Settings page.

### Constraints (`CST-I18N-###`)

- **CST-I18N-001 (Tech Stack)**: Must utilize `i18next` + `react-i18next` + `i18next-browser-languagedetector` within React 19 / Vite environment.
- **CST-I18N-002 (Performance)**: Language toggle must execute within < 16ms (P95) with zero page reloads.
- **CST-I18N-003 (No DB Migration)**: `US-I18N-01` must not require backend database migrations or API endpoints.

---

## 4. MoSCoW Scope Table

### Must-Have (P0 — Non-negotiable for Release)

- Setup `i18next`, `react-i18next`, and `i18next-browser-languagedetector` in `apps/web`.
- Core configuration module `apps/web/src/locales/i18n.ts` with type-safe schema definitions.
- Baseline translation JSON files (`common.json`, `auth.json`, `dashboard.json`, `settings.json`) for both `vi` and `en`.
- `LanguageSwitcher` Obsidian Pill component with instant 1-click toggle, flag icons (`🇻🇳` / `🇬🇧`), and uppercase locale codes.
- Stable placement on `Header` (Landing/Public layout) and `DashboardNavbar`.
- Automatic browser language detection with `localStorage` (`wordstreak_locale`) persistence and English fallback.

### Should-Have (P1 — Important for Complete Experience)

- Full namespace baseline files for remaining modules (`decks.json`, `study.json`, `practice.json`, `community.json`, `analytics.json`).
- Dynamic `aria-label` accessibility tags conforming to WCAG 2.1 AA.
- Safe storage helper with `try/catch` fallback for restricted/incognito browser environments.

### Could-Have (P2 — Future Iterations)

- Language selection preference dropdown in User Profile / Settings tab (`US-AUTH-04` integration).
- Animated micro-interactions (subtle flag flip or cross-fade) using Framer Motion.

### Won't-Have (Out of Scope for `US-I18N-01`)

- ❌ Third or fourth languages (e.g. Japanese, French, Spanish, German, Chinese) — strictly `vi` and `en` only.
- ❌ Right-to-Left (RTL) layout support (Arabic, Hebrew).
- ❌ Backend database persistence / user model `locale` column migration.
- ❌ Backend error message localization API middleware (covered in future backend user stories).
- ❌ Cloud-based automated localization management / TMS integration (e.g. Crowdin, Lokalise).
