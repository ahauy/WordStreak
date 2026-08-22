# Domain Decision Baseline: Complete UI Localization & Error Mapping (US-I18N-02)

**Status**: SIGNED-OFF
**Version**: 1.0  
**Feature Slug**: `i18n-ui-localization`  
**Backlog Reference**: `US-I18N-02` (EPIC 10: Multi-language & Internationalization)  
**Created**: 2026-08-22  
**Author**: Lead Business Analyst

---

## 1. Executive Summary

This baseline establishes the functional specifications, domain modeling, risk controls, and validation requirements for **`US-I18N-02` (Complete UI Localization & Error Mapping)**. Building upon the core i18n engine (`US-I18N-01`), this feature delivers:

1. **100% UI Shell Localization**: Elimination of all remaining hardcoded English strings across 12 domain namespaces (`common`, `auth`, `dashboard`, `decks`, `cards`, `study`, `practice`, `community`, `analytics`, `settings`, `gamification`, `ai_vocabulary`).
2. **Strict Error Code Mapping Registry**: Centralized Axios response error interception resolving backend error codes to localized, friendly toasts in `errors.json`, with strict suppression of raw stack traces, database schema details, and technical exception jargon (`BR-I18N-002`).
3. **Unified Locale-Aware Formatting (`Intl`)**: Dynamic formatting for dates (`Intl.DateTimeFormat`), relative timestamps (`Intl.RelativeTimeFormat`), numbers/XP counters (`Intl.NumberFormat`), and standard pluralization (`_one`/`_other`) bound to active locale (`vi-VN` vs `en-US`).
4. **Strict UI Shell vs UGC Isolation**: 100% preservation of User-Generated Content (flashcard terms, definitions, phonetic IPA, user notes) while fully localizing SRS review rating action buttons (`Again` / `Lại`, `Hard` / `Khó`, `Good` / `Tốt`, `Easy` / `Dễ`).

---

## 2. Core Decisions & Business Rules

1. **Canonical Locale Mapping (`BR-I18N-001`)**: Supported locales `'vi'` and `'en'` map to canonical BCP-47 tags `'vi-VN'` and `'en-US'` for ECMAScript `Intl` operations.
2. **Error Code Resolution & Sanitization (`BR-I18N-002`)**: API errors map via `errors.json`. Unmapped/500 errors fallback to `errors:generic.unexpected_error`, strictly suppressing raw stack traces.
3. **Strict UI Shell vs UGC Boundary (`BR-I18N-003`)**: System chrome is 100% translated; User-Generated Content is rendered verbatim without translation pass.
4. **Unified Locale-Aware Number Formatting (`BR-I18N-004`)**: All numeric values, XP metrics, and counts formatted dynamically (`10.000 XP` in `vi` vs `10,000 XP` in `en`).
5. **Unified Locale-Aware Date & Time Formatting (`BR-I18N-005`)**: Dates rendered in `DD/MM/YYYY` (`vi`) vs `MM/DD/YYYY` (`en`); relative times formatted via `Intl.RelativeTimeFormat`.
6. **Standard Pluralization Rules (`BR-I18N-006`)**: Countable entities use `_one`/`_other` in English and base single form in Vietnamese, eliminating bugs like `"1 cards"`.
7. **Namespace Partitioning (`BR-I18N-007`)**: Modular organization across 12 feature namespaces + `errors.json`.
8. **SRS Rating Button Localization (`BR-I18N-008`)**: Review ratings display `Lại` / `Again`, `Khó` / `Hard`, `Tốt` / `Good`, `Dễ` / `Easy` with interval duration indicators.
9. **Error Toast Deduplication (`BR-I18N-009`)**: Consecutive identical error toasts within 2000ms window are deduplicated.
10. **Boundary & Layout Overflow Invariance (`BR-I18N-010`)**: UI containers accommodate +40% Vietnamese text length expansion without clipping or layout breakage.

---

## 3. MoSCoW Scope Summary

- **Must-Have (P0)**: 100% UI extraction across 12 namespaces; `errors.json` registry with friendly fallback; `useLocaleFormat` helper (`Intl.NumberFormat`, `Intl.DateTimeFormat`, `Intl.RelativeTimeFormat`); i18next pluralization; strict UGC isolation; localized SRS rating buttons.
- **Should-Have (P1)**: Toast deduplication rate limiter (2000ms); dynamic WCAG 2.1 AA `aria-label` tags; text overflow flex-wrap protection.
- **Could-Have (P2)**: Translation management system (TMS) synchronization scripts; Sentry error telemetry.
- **Won't-Have (Out of Scope)**: Automatic translation of user flashcards; additional languages beyond `vi` and `en`; database schema migrations; RTL layout support.

---

## 4. Pipeline Artifact Index

- **Intake Classification**: [`00-intake.md`](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/.specify/features/i18n-ui-localization/00-intake.md)
- **Elicitation Interview**: [`01-elicitation.md`](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/.specify/features/i18n-ui-localization/01-elicitation.md)
- **Gap Analysis**: [`02-gap-analysis.md`](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/.specify/features/i18n-ui-localization/02-gap-analysis.md)
- **Domain Model**: [`03-domain-model.md`](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/.specify/features/i18n-ui-localization/03-domain-model.md)
- **Risk Register**: [`04-risk-register.md`](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/.specify/features/i18n-ui-localization/04-risk-register.md)
- **Business Requirements (BRD)**: [`spec/brd.md`](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/.specify/features/i18n-ui-localization/spec/brd.md)
- **Product Requirements (PRD)**: [`spec/prd.md`](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/.specify/features/i18n-ui-localization/spec/prd.md)
- **Software Requirements (SRS)**: [`spec/srs.md`](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/.specify/features/i18n-ui-localization/spec/srs.md)
- **User Stories & Scenarios**: [`spec/user-stories.md`](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/.specify/features/i18n-ui-localization/spec/user-stories.md)
- **Validation Report & RTM**: [`05-validation.md`](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/.specify/features/i18n-ui-localization/05-validation.md)
- **Handover Brief**: [`handover-brief.md`](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/.specify/features/i18n-ui-localization/handover-brief.md)
