# Intake: Complete UI Localization & Error Mapping (US-I18N-02)

- **Date**: 2026-08-22
- **Requested by**: Product Owner / Product Roadmap (`US-I18N-02`, EPIC 10: Multi-language & Internationalization)
- **Classification**: Full Feature (Broad Cross-Cutting UI Sweep)
- **Classification signals**:
  - **New or changed domain entities**: 0 (Client-side translation keys, error code dictionary, and locale formatting utilities; no database entity changes)
  - **Existing DB schema change required**: No
  - **Screens/flows touched**: 2+ (~10 core user flows: Landing, Auth, Dashboard, Decks, Cards, Study/Review, Practice/Quizzes, Speech Pronunciation Assessment, Community Decks, Learning Analytics, Profile/Settings, Gamification)
  - **User roles affected**: 2+ (Guest / Unauthenticated Visitors, Authenticated Learners, Community Contributors)
  - **Cross-cutting**: Yes (Global UI text extraction, Axios/API error mapping, toast notifications, date/time and number localized formatting across all components)
  - **Reversible without user-facing consequence**: Yes (Instant runtime locale toggle without data loss)
- **Protocol selected**: Full Pipeline (Stages 1 through 8: Intake → Elicitation Interview → Gap Analysis → Domain Modeling & Business Rules → Risk & Contradiction Scanner → Spec Writer → Spec Validator → Handover)
- **Override**: None

---

## One-line problem statement

Eliminate all remaining hardcoded strings, inconsistent Vietnamese/English mixed UI elements, and raw backend exception messages across all 10+ WordStreak web application modules by establishing comprehensive namespace translation dictionaries, unified backend error-code-to-toast localization mapping, and locale-aware date/number formatting while strictly preserving user-generated flashcard content.
