# Intake: User Language Preferences Sync (US-I18N-03)

- **Date**: 2026-08-22
- **Requested by**: Product Owner / Product Roadmap (`US-I18N-03`, EPIC 10: Multi-language & Internationalization)
- **Classification**: Bounded Task
- **Classification signals**:
  - **New or changed domain entities**: 0 (Additive preference field `preferredLanguage` on existing `User` entity)
  - **Existing DB schema change required**: Maybe (Additive only: `preferredLanguage: String @default("vi")` on `User` model in PostgreSQL/Prisma)
  - **Screens/flows touched**: 1 (User Profile / Settings language preference control & background sync from Obsidian Pill switcher)
  - **User roles affected**: 1 (Authenticated Learner, with local cache fallback for Guest/Unauthenticated)
  - **Cross-cutting**: No (Self-contained profile preference synchronization between client `localStorage` and backend profile API)
  - **Reversible without user-facing consequence**: Yes (Users can update preference at any time; client gracefully falls back to local storage if API is unreachable)
- **Protocol selected**: Bounded Task Protocol (Stages 1 → 2 [2-3 focused questions] → 4 [light] → 5 [light] → 6 [User Story only] → 7 → 8; Stage 3 Gap Analysis skipped)
- **Override**: None

---

## One-line problem statement

Synchronize and persist the user's selected language preference (`vi` / `en`) between client-side cache (`localStorage`) and backend database (`User` profile entity), ensuring seamless cross-device language continuity for authenticated users while maintaining instant zero-reload UX and offline/guest fallback.
