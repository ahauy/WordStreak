# Business Requirements Document (BRD)

## Feature: Core i18n Infrastructure & Instant Language Switcher (US-I18N-01)

- **Document Version**: 1.0
- **Feature Slug**: `i18n-core-switcher`
- **Product Backlog Reference**: `US-I18N-01`
- **Target Release**: Sprint 1 / Core Foundation

---

## 1. Executive Summary & Business Context

WordStreak is an AI-powered gamified vocabulary learning platform designed primarily for Vietnamese learners mastering English, as well as global learners. Currently, the web frontend lacks a structured localization framework, containing hardcoded English strings.

To maximize user acquisition in the primary domestic market (Vietnam) and provide an international-grade UX, WordStreak requires an institutionalized, zero-latency internationalization (i18n) framework. This feature delivers the core client-side i18n architecture, browser locale auto-detection, type-safe namespace contracts, and an instant Obsidian Pill language switcher.

---

## 2. Business Objectives & Success Metrics

| Metric                                     | Baseline               | Target                    | Business Impact                                            |
| :----------------------------------------- | :--------------------- | :------------------------ | :--------------------------------------------------------- |
| **Landing Page Bounce Rate (VN Visitors)** | ~45% (Estimated)       | < 25%                     | Immediate Vietnamese presentation lowers initial friction. |
| **Language Toggle Latency**                | Full page reload (N/A) | < 16ms (Instant 60fps)    | High-polish UX matching Obsidian design standards.         |
| **Localization Key Coverage**              | 0% (Hardcoded)         | 100% Navigation / Core UI | Structured modularity across 9 application domains.        |
| **Translation Type Safety**                | 0%                     | 100% TypeScript Checked   | Eliminates missing key bugs during continuous releases.    |

---

## 3. Target Personas

1. **Guest / First-Time Visitor (`Persona-Guest`)**: Experiences automatic browser detection (`vi` for Vietnamese browsers, `en` for all others) with immediate visibility of the Obsidian Pill toggle on the public Landing Page and Header.
2. **Active Learner (`Persona-Learner`)**: Seamlessly toggles language across Dashboard, Study, and Decks without losing current progress, active session, or form inputs.
3. **Product & Dev Team (`Persona-Engineering`)**: Gains a scalable 9-namespace architecture that prevents git merge conflicts and ensures compile-time translation key validation.

---

## 4. Scope & MoSCoW Prioritization

### In-Scope (Must / Should Have)

- Caching and initialization of `i18next` + `react-i18next` + `i18next-browser-languagedetector`.
- 9 domain namespaces (`common`, `auth`, `dashboard`, `decks`, `study`, `practice`, `community`, `analytics`, `settings`).
- Initial translation dictionary JSON files for `vi` and `en` across core flows.
- Obsidian Pill `LanguageSwitcher` button with 1-click toggle (`🇻🇳 VI` ⇄ `🇬🇧 EN`) on `Header`, `DashboardNavbar`, and Landing Page.
- Fallback chain to `en` and persistent storage in `localStorage` under `wordstreak_locale`.

### Out-of-Scope (Won't Have in Sprint 1)

- Additional languages beyond `vi` and `en`.
- Backend database schema changes or user profile API sync.
- Backend API localized response middleware.
- Automated third-party TMS / cloud localization integration.
