# Domain Decision Baseline: Core i18n Infrastructure & Instant Language Switcher (US-I18N-01)

**Status**: SIGNED-OFF  
**Version**: 1.0  
**Feature Slug**: `i18n-core-switcher`  
**Backlog Reference**: `US-I18N-01`  
**Signed off by**: Product Owner & BA Pipeline on 2026-08-22

---

## 1. Executive Summary

This baseline defines the business rules, architecture, UX specifications, and quality validation criteria for **US-I18N-01 (Core i18n Infrastructure & Instant Language Switcher)**. The feature establishes a zero-reload, type-safe internationalization runtime in `apps/web` utilizing `i18next`, with 9 isolated domain namespaces, smart browser locale detection, client-side persistence in `localStorage`, and an Obsidian Pill language switcher component mounted across all navigation layouts.

---

## 2. Core Decisions & Business Rules

1. **Supported Locales (`BR-I18N-001`)**: Strictly `'vi'` (Tiếng Việt) and `'en'` (English).
2. **Browser Detection (`BR-I18N-002`)**: First-time visitors with `vi*` browser settings default to `'vi'`; all others default to `'en'`.
3. **Fallback Chain (`BR-I18N-003`)**: Missing or untranslated keys in `'vi'` fall back to `'en'` seamlessly without breaking UI rendering or throwing runtime exceptions.
4. **Persistence Key (`BR-I18N-004`)**: Client language preference is saved under key `'wordstreak_locale'` in `localStorage`.
5. **Zero-Reload State Transitions (`BR-I18N-005`)**: Language switching is executed purely in React memory via context re-renders (`< 16ms`), with `window.location.reload()` strictly prohibited.
6. **Namespace Modularity (`BR-I18N-006`)**: 9 segregated domain namespaces (`common`, `auth`, `dashboard`, `decks`, `study`, `practice`, `community`, `analytics`, `settings`) backed by TypeScript module augmentation for 100% compile-time key validation.
7. **Obsidian Pill UI Geometry (`BR-I18N-007`)**: Switcher styled with Obsidian dark surface (`#000000`), `rounded-full`, 1px hairline border (`#e5e5e5`/`#262626`), flag icon + uppercase code (`🇻🇳 VI` ⇄ `🇬🇧 EN`), and instant 1-click toggle.
8. **Layout Stability & Anti-Jitter (`BR-I18N-008`)**: Fixed container sizing (`min-w-[72px]`, `box-border`) preventing 60Hz hover jitter and ensuring zero Cumulative Layout Shift (`CLS = 0.00`).

---

## 3. Artifact Index

- **Intake**: [`00-intake.md`](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/.specify/features/i18n-core-switcher/00-intake.md)
- **Elicitation**: [`01-elicitation.md`](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/.specify/features/i18n-core-switcher/01-elicitation.md)
- **Gap Analysis**: [`02-gap-analysis.md`](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/.specify/features/i18n-core-switcher/02-gap-analysis.md)
- **Domain Model**: [`03-domain-model.md`](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/.specify/features/i18n-core-switcher/03-domain-model.md)
- **Risk Register**: [`04-risk-register.md`](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/.specify/features/i18n-core-switcher/04-risk-register.md)
- **Validation Report**: [`05-validation.md`](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/.specify/features/i18n-core-switcher/05-validation.md)
- **Business Requirements (BRD)**: [`spec/brd.md`](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/.specify/features/i18n-core-switcher/spec/brd.md)
- **Product Requirements (PRD)**: [`spec/prd.md`](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/.specify/features/i18n-core-switcher/spec/prd.md)
- **Software Requirements (SRS)**: [`spec/srs.md`](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/.specify/features/i18n-core-switcher/spec/srs.md)
- **User Stories & Acceptance Criteria**: [`spec/user-stories.md`](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/.specify/features/i18n-core-switcher/spec/user-stories.md)
- **Handover Brief**: [`handover-brief.md`](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/.specify/features/i18n-core-switcher/handover-brief.md)
