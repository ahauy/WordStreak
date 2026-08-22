# Handover Brief: Core i18n Infrastructure & Instant Language Switcher (US-I18N-01)

- **Feature Slug**: `i18n-core-switcher`
- **Backlog Reference**: `US-I18N-01`
- **Baseline Version**: 1.0 (SIGNED-OFF on 2026-08-22)
- **Document Index**:
  - Baseline: [`baseline.md`](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/.specify/features/i18n-core-switcher/baseline.md)
  - Intake: [`00-intake.md`](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/.specify/features/i18n-core-switcher/00-intake.md)
  - Elicitation: [`01-elicitation.md`](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/.specify/features/i18n-core-switcher/01-elicitation.md)
  - Gap Analysis: [`02-gap-analysis.md`](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/.specify/features/i18n-core-switcher/02-gap-analysis.md)
  - Domain Model: [`03-domain-model.md`](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/.specify/features/i18n-core-switcher/03-domain-model.md)
  - Risk Register: [`04-risk-register.md`](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/.specify/features/i18n-core-switcher/04-risk-register.md)
  - Validation & RTM: [`05-validation.md`](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/.specify/features/i18n-core-switcher/05-validation.md)
  - Specifications: [`spec/brd.md`](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/.specify/features/i18n-core-switcher/spec/brd.md), [`spec/prd.md`](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/.specify/features/i18n-core-switcher/spec/prd.md), [`spec/srs.md`](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/.specify/features/i18n-core-switcher/spec/srs.md), [`spec/user-stories.md`](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/.specify/features/i18n-core-switcher/spec/user-stories.md)

---

## 1. What Is Being Built

1. **Frontend i18n Core Module**: Initialized in `apps/web/src/locales/` with `i18n.ts`, loading 9 type-safe namespaces (`common`, `auth`, `dashboard`, `decks`, `study`, `practice`, `community`, `analytics`, `settings`) utilizing `i18next`, `react-i18next`, and `i18next-browser-languagedetector`.
2. **Translation Dictionaries**: Baseline JSON resource bundles for `vi` and `en` across core UI flows.
3. **Obsidian Pill Language Switcher**: Ergonomic, jitter-free `LanguageSwitcher` button (`#000000`, `rounded-full`, 1px hairline border, `🇻🇳 VI` ⇄ `🇬🇧 EN` 1-click toggle) mounted on `Header.tsx`, `DashboardNavbar.tsx`, and Landing Page.
4. **Browser Detection & Persistence**: Automatic browser detection mapping `vi*` to `vi` and all others to `en`, stored under `localStorage` key `'wordstreak_locale'` with fallback to `en` on missing keys.

---

## 2. Explicitly Out of Scope

- ❌ Languages other than `vi` and `en`.
- ❌ RTL layout support.
- ❌ Backend database schema migrations (user `locale` column) or API sync endpoints in this story.
- ❌ Backend API error localization middleware.

---

## 3. Key Architecture & Dev Guidelines

- **Zero-Reload**: `i18n.changeLanguage()` must trigger React context re-render only. Never call `window.location.reload()`.
- **Anti-Jitter Geometry**: The pill switcher container must declare `min-w-[72px]` and stable box-sizing (`box-border`) so `VI` and `EN` states never trigger layout shift (CLS = 0) or 60Hz hover jitter.
- **Safe Storage**: Wrap `localStorage` access in `try/catch` helper so incognito / restricted browsers do not throw unhandled exceptions.
- **Type Safety**: Enforce `CustomTypeOptions` TypeScript augmentation so `t('common:...')` is fully checked at compile time.

---

## 4. Next Step

Proceed to **Phase 2 (Spec-Kit Architecture & Planning)**:

- Invoke `speckit-specify` to generate `.specify/features/i18n-core-switcher/spec.md`.
- Invoke `speckit-plan` & `speckit-tasks` to create execution tasks in `plan.md` and `tasks.md`.
