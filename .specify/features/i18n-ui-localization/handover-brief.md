# Handover Brief: Complete UI Localization & Error Mapping (US-I18N-02)

- **Feature Slug**: `i18n-ui-localization`
- **Backlog Reference**: `US-I18N-02` (EPIC 10: Multi-language & Internationalization)
- **Baseline Version**: 1.0-draft (Ready for Confirmation Gate 1 on 2026-08-22)
- **Document Index**:
  - Baseline: [`baseline.md`](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/.specify/features/i18n-ui-localization/baseline.md)
  - Intake: [`00-intake.md`](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/.specify/features/i18n-ui-localization/00-intake.md)
  - Elicitation: [`01-elicitation.md`](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/.specify/features/i18n-ui-localization/01-elicitation.md)
  - Gap Analysis: [`02-gap-analysis.md`](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/.specify/features/i18n-ui-localization/02-gap-analysis.md)
  - Domain Model: [`03-domain-model.md`](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/.specify/features/i18n-ui-localization/03-domain-model.md)
  - Risk Register: [`04-risk-register.md`](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/.specify/features/i18n-ui-localization/04-risk-register.md)
  - Validation & RTM: [`05-validation.md`](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/.specify/features/i18n-ui-localization/05-validation.md)
  - Specifications: [`spec/brd.md`](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/.specify/features/i18n-ui-localization/spec/brd.md), [`spec/prd.md`](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/.specify/features/i18n-ui-localization/spec/prd.md), [`spec/srs.md`](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/.specify/features/i18n-ui-localization/spec/srs.md), [`spec/user-stories.md`](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/.specify/features/i18n-ui-localization/spec/user-stories.md)

---

## 1. What Is Being Built

1. **100% Comprehensive UI Shell Localization**: Extraction and translation of all hardcoded strings across 12 domain namespaces (`common`, `auth`, `dashboard`, `decks`, `cards`, `study`, `practice`, `community`, `analytics`, `settings`, `gamification`, `ai_vocabulary`) in both Vietnamese (`vi`) and English (`en`).
2. **Centralized Error Code Registry & Friendly Toast Mapping**: Axios interceptor mapping backend API error codes to localized strings in `errors.json`, suppressing raw stack traces and database errors with friendly fallbacks.
3. **Unified Locale-Aware Formatting (`Intl` & Pluralization)**: A centralized `useLocaleFormat` helper wrapping `Intl.NumberFormat`, `Intl.DateTimeFormat`, and `Intl.RelativeTimeFormat`, paired with i18next plural keys (`_one`/`_other`).
4. **Strict UI Shell vs UGC Isolation**: Complete isolation guaranteeing User-Generated Content (cards, definitions, IPA transcriptions) remains 100% untouched while localizing SRS review rating buttons (`Again` / `Lại`, `Hard` / `Khó`, `Good` / `Tốt`, `Easy` / `Dễ`).

---

## 2. What Is Explicitly Out of Scope

- ❌ Machine translation of user flashcards (terms, definitions, IPA).
- ❌ Third or fourth languages beyond Vietnamese (`vi`) and English (`en`).
- ❌ Database schema changes or ORM migrations.
- ❌ Right-to-Left (RTL) layout support.

---

## 3. Key Architecture & Quality Guidelines

- **Zero-Reload**: Language toggle updates React state instantaneously (< 16ms, 60fps) with zero full-page reloads.
- **Error Sanitization**: No SQL tokens, Prisma schema names, or raw stack traces may ever be exposed to users (`BR-I18N-002`).
- **Layout Elasticity**: All containers must support up to +40% Vietnamese text length expansion with `flex-wrap` and tooltipped truncation (`BR-I18N-010`).
- **A11y Conformance**: Dynamic `aria-label` tags must update in sync with the active locale (WCAG 2.1 AA).

---

## 4. Next Step

1. **User Confirmation Gate 1**: Present the Domain Decision Baseline to the Product Owner/User for formal review and sign-off.
2. **Phase 2 (Spec-Kit Architecture & Implementation)**: Once approved, invoke `speckit-specify` to generate implementation specifications and execution tasks.
