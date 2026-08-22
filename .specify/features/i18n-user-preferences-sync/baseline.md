# Domain Decision Baseline: User Language Preferences Sync (US-I18N-03)

**Status**: **SIGNED-OFF**  
**Version**: **1.0**  
**Feature Slug**: `i18n-user-preferences-sync`  
**Backlog Reference**: `US-I18N-03`  
**Signed off by**: Product Owner & BA Pipeline on 2026-08-22

---

## 1. Executive Summary

This baseline defines the business rules, data model architecture, API contracts, UX behaviors, and quality validation criteria for **US-I18N-03 (User Language Preferences Sync)**. The feature bridges frontend client-side `localStorage` caching with backend PostgreSQL `User.preferredLanguage` persistence in NestJS, ensuring seamless cross-device language continuity for authenticated learners while delivering instant (<16ms) optimistic UI transitions and resilient offline/guest fallback.

---

## 2. Core Decisions & Business Rules

1. **Supported Locales (`BR-I18N-SYNC-001`)**: Strictly `'vi'` (Tiếng Việt) and `'en'` (English). All invalid inputs rejected with `400 Bad Request`.
2. **DB Authority on Authentication (`BR-I18N-SYNC-002`)**: Upon login or session init (`GET /auth/me`), backend `preferredLanguage` strictly overrides local cache and synchronizes client runtime.
3. **Optimistic UI with Background Sync (`BR-I18N-SYNC-003`)**: Manual language switches update the UI in `< 16ms` with zero page reload, updating `localStorage` immediately while asynchronously persisting via `PATCH /api/v1/users/profile`.
4. **Registration Carryover (`BR-I18N-SYNC-004`)**: Unauthenticated guest language preference is transmitted in `POST /auth/register` and initialized as the user's account preference.
5. **Offline & Network Resiliency (`BR-I18N-SYNC-005`)**: Failed background sync calls degrade gracefully; local UI stays responsive in the selected language without intrusive error alerts.
6. **Database Default (`BR-I18N-SYNC-006`)**: Database schema default is `'vi'` (`NOT NULL DEFAULT 'vi'`).
7. **Debounced API Dispatch (`BR-I18N-SYNC-007`)**: Rapid language switcher clicks update UI immediately while debouncing background API requests (300ms).

---

## 3. Artifact Index

- **Intake**: [`00-intake.md`](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/.specify/features/i18n-user-preferences-sync/00-intake.md)
- **Elicitation**: [`01-elicitation.md`](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/.specify/features/i18n-user-preferences-sync/01-elicitation.md)
- **Domain Model & State Machine**: [`04-domain-model.md`](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/.specify/features/i18n-user-preferences-sync/04-domain-model.md)
- **Risk Matrix & MoSCoW**: [`05-risk-matrix.md`](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/.specify/features/i18n-user-preferences-sync/05-risk-matrix.md)
- **Specification & User Stories**: [`06-spec-user-stories.md`](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/.specify/features/i18n-user-preferences-sync/06-spec-user-stories.md)
- **Validation Report**: [`07-validation-report.md`](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/.specify/features/i18n-user-preferences-sync/07-validation-report.md)
- **Developer Handover Brief**: [`handover-brief.md`](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/.specify/features/i18n-user-preferences-sync/handover-brief.md)
- **Changelog**: [`CHANGELOG.md`](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/.specify/features/i18n-user-preferences-sync/CHANGELOG.md)
