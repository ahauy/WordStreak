# Business Requirements Document (BRD)

## Feature: Complete UI Localization & Error Mapping (US-I18N-02)

- **Feature Slug**: `i18n-ui-localization`
- **Backlog Reference**: `US-I18N-02` (EPIC 10: Multi-language & Internationalization)
- **Target Release**: WordStreak MVP v1.0
- **Author**: Lead Business Analyst
- **Status**: Draft

---

## 1. Executive Summary & Business Problem

### 1.1. Background

WordStreak is an intelligent English vocabulary learning platform tailored for Vietnamese ESL learners and international students. While `US-I18N-01` established the baseline i18n core engine and top-level switcher, significant portions of the application still display hardcoded English text, untranslated technical exception toasts, and un-localized numbers and dates.

### 1.2. Problem Statement

The current mixture of English UI elements on Vietnamese language views creates cognitive friction, diminishes trust, and causes high drop-off rates during vocabulary study and quiz sessions. Furthermore, exposing raw NestJS or database error strings (such as `"Unique constraint failed"`, `"Internal Server Error"`, or unmapped error codes) severely confuses non-technical users and makes the platform appear unstable.

### 1.3. Business Objectives

1. **Flawless Bilingual Experience**: Deliver 100% UI localization coverage across all 12 platform domains in both Vietnamese and English.
2. **User-Friendly Error Handling**: Shield learners from technical jargon by mapping 100% of API errors to empathetic, actionable localized toasts.
3. **Cultural & Linguistic Accuracy**: Ensure standard number/date formatting and grammatically accurate pluralization across both supported locales.
4. **Learning Integrity Preservation**: Guarantee 100% isolation between system chrome and user-generated vocabulary cards so flashcard definitions and IPA phonetic transcripts are never corrupted.

---

## 2. Target Personas & Stakeholders

| Persona                                         | Description & Needs                                                                                                                                           |
| :---------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **`Persona-Learner` (Vietnamese Native)**       | Seeks a distraction-free, fully Vietnamese interface for reviewing decks, taking quizzes, and viewing streak progress, with clear guidance when errors occur. |
| **`Persona-Learner` (International / English)** | Expects clean, grammatically correct English UI with native pluralization (`1 card` vs `5 cards`) and US formatting (`10,000 XP`, `08/22/2026`).              |
| **`Persona-Admin` / `Persona-Creator`**         | Creates and curates public vocabulary decks; requires localized form controls and clear validation feedback without risk to deck contents.                    |
| **Product & Support Operations**                | Requires standard error codes to streamline customer support troubleshooting without leaking server internals to users.                                       |

---

## 3. Success Metrics & Business KPIs

| Metric Type                  | KPI Description                                                                        | Target Baseline |      Success Target      |
| :--------------------------- | :------------------------------------------------------------------------------------- | :-------------: | :----------------------: |
| **UI Localization Coverage** | Percentage of UI shell strings localized into `vi` and `en` across all 12 domains      |      ~35%       |         **100%**         |
| **Error Message Clarity**    | Percentage of API error responses mapped to friendly localized toasts in `errors.json` |       0%        |         **100%**         |
| **Stack Trace Exposure**     | Incidents of raw server stack traces or Prisma errors displayed to end users           |    Multiple     |  **0% (Zero Leakage)**   |
| **Content Integrity**        | Preservation rate of User-Generated Content during localization rendering              |      100%       | **100% (Zero Mutation)** |
| **Format Accuracy**          | Compliance with `Intl` number, date, and pluralization standards                       |      ~40%       |         **100%**         |

---

## 4. MoSCoW Scope Summary

- **Must-Have (P0)**: Complete UI string localization across 12 namespaces; centralized error code mapping registry (`errors.json`); Axios error interceptor with friendly fallback; unified `Intl` number/date formatting hook; strict User-Generated Content isolation; localized SRS rating buttons.
- **Should-Have (P1)**: Error toast rate-limiting/deduplication (2000ms); dynamic WCAG 2.1 AA `aria-label` tags; text overflow resilience (+40% expansion tolerance).
- **Could-Have (P2)**: Translation management system (TMS) synchronization scripts; Sentry telemetry for unmapped error codes.
- **Won't-Have (Out of Scope)**: Automatic machine translation of flashcard content; third languages beyond `vi` and `en`; database schema migrations; RTL layout support.
