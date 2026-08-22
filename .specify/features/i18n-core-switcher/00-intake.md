# Intake: Core i18n Infrastructure & Instant Language Switcher (US-I18N-01)

- **Date**: 2026-08-22
- **Requested by**: Product Owner / Product Backlog Roadmap (`US-I18N-01`)
- **Classification**: Full Feature (Foundation / Cross-Cutting Infrastructure)
- **Classification signals**:
  - **New or changed domain entities**: 0 (Client-side locale types and namespace mapping only; no backend entity created in this story)
  - **Existing DB schema change required**: No (Client-side persistence via `localStorage` and browser language detector at this stage)
  - **Screens/flows touched**: 2+ (Landing Page, Top Header, DashboardNavbar, Auth modals/views, and sets up global text localization for all UI modules)
  - **User roles affected**: 2+ (Guest / Unauthenticated Visitors, Authenticated Learners, System Administrators)
  - **Cross-cutting**: Yes (Foundational frontend localization layer touching all UI views, routing, layout headers, and future backend localized messages)
  - **Reversible without user-facing consequence**: Yes (Instant toggle between supported languages without data loss)
- **Protocol selected**: Full Pipeline (Stages 1 through 8: Intake → Elicitation Interview → Gap Analysis → Domain Modeling & Business Rules → Risk & Contradiction Scanner → Spec Writer → Spec Validator → Handover)
- **Override**: None

---

## One-line problem statement

Establish a robust, type-safe frontend internationalization (`i18n`) architecture using `i18next` with namespace modularity and browser language auto-detection, accompanied by an instant, zero-reload Obsidian Pill language switcher across all top-level application navigation bars.
