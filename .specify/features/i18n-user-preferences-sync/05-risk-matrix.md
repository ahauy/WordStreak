# Risk Matrix & Scope: User Language Preferences Sync (US-I18N-03)

- **Feature**: `US-I18N-03`: Cài đặt tùy chọn ngôn ngữ & Đồng bộ hồ sơ người dùng (User Language Preferences Sync)
- **Slug**: `i18n-user-preferences-sync`
- **Protocol**: Bounded Task
- **Date**: 2026-08-22

---

## 1. Contradiction & Compatibility Scan

| Category                   | Check Performed                                                                              | Finding                                                                                                            | Resolution / Status |
| -------------------------- | -------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ | ------------------- |
| **Logic Contradictions**   | Evaluated DB authority on login vs optimistic UI on manual toggle                            | None. Rules are clearly demarcated: login loads from DB; manual toggle triggers optimistic UI with async DB write. | ✅ Resolved & Clean |
| **State Deadlocks**        | Checked transitions between GuestMode, AuthenticatedActive, SyncingToDB, and DegradedOffline | No deadlocks. All paths recover back to `AuthenticatedActive` or `GuestMode`.                                      | ✅ Resolved & Clean |
| **Backward Compatibility** | Existing database users without `preferredLanguage` column                                   | Additive migration with `@default("vi")` and `NOT NULL` prevents null-pointer exceptions in existing code.         | ✅ Resolved & Clean |
| **API Contract Breaks**    | `PATCH /api/v1/users/profile` and `POST /auth/register` payload changes                      | `preferredLanguage` is optional in DTOs with `IsOptional()`, `IsEnum(AppLanguage)` validation.                     | ✅ Resolved & Clean |

---

## 2. Risk Register

| ID                       | Risk Description                                                                                                                                                    | Probability | Impact | Mitigation Strategy                                                                                                                                                               |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :---------: | :----: | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **`RISK-I18N-SYNC-001`** | **UI Flash of Default Language on Slow Profile Fetch**: Slow network causes initial render in local/default language before `/auth/me` resolves and flips language. |   Medium    |  Low   | Hydrate initial UI immediately from `localStorage['wordstreak_locale']`. If DB differs upon `/auth/me` resolution, perform smooth `<16ms` context transition without page reload. |
| **`RISK-I18N-SYNC-002`** | **Rapid Toggle API Request Flooding**: User repeatedly clicks the language switcher rapidly, firing multiple concurrent PATCH requests.                             |     Low     |  Low   | Implement debounced API dispatcher (300ms debounce) or abort previous in-flight requests using `AbortController`.                                                                 |
| **`RISK-I18N-SYNC-003`** | **Offline / Network Outage during Switch**: User switches language while offline, causing API PATCH to fail.                                                        |   Medium    |  Low   | Graceful degradation (`BR-I18N-SYNC-005`): local `localStorage` persists choice; UI stays in chosen language; errors are logged silently without intrusive alert modals.          |
| **`RISK-I18N-SYNC-004`** | **Invalid Locale Injection via API**: Malicious or malformed client request sends unsupported locale string (e.g. `'fr'`, `'; DROP TABLE'`).                        |     Low     |  High  | Strict NestJS validation pipe with `class-validator` `@IsEnum(['vi', 'en'])` and PostgreSQL schema constraints (`BR-I18N-SYNC-001`).                                              |

---

## 3. Consolidated Assumptions & Constraints

### Assumptions

- **`ASM-I18N-SYNC-001`**: Supported application languages are strictly `'vi'` and `'en'`.
- **`ASM-I18N-SYNC-002`**: Database user profile is the authoritative source of truth on authenticated application launch.
- **`ASM-I18N-SYNC-003`**: UI language switching must be non-blocking and optimistic; client state updates immediately.
- **`ASM-I18N-SYNC-004`**: Unauthenticated guest users persist language in browser `localStorage` without backend sync.

### Technical Constraints

- **`CON-I18N-SYNC-001`**: Zero full-page reloads (`window.location.reload()` is strictly forbidden).
- **`CON-I18N-SYNC-002`**: Must use existing Prisma ORM migration patterns in `apps/api/prisma/schema.prisma`.
- **`CON-I18N-SYNC-003`**: Must share locale type definitions (`AppLanguage = 'vi' | 'en'`) via `packages/shared-types` or `apps/web/src/i18n`.

---

## 4. MoSCoW Scope Table

| Priority                      | Scope Item                                | Description                                                                                    |
| ----------------------------- | ----------------------------------------- | ---------------------------------------------------------------------------------------------- |
| **Must-Have (P0)**            | **Prisma Schema Update**                  | Add `preferredLanguage String @default("vi")` to `User` model with migration.                  |
| **Must-Have (P0)**            | **API DTO & Service Update**              | Support `preferredLanguage` in `UpdateUserProfileDto`, `RegisterDto`, and `UserResponseDto`.   |
| **Must-Have (P0)**            | **Session Profile Hydration**             | On `GET /auth/me` success, sync DB `preferredLanguage` to `localStorage` and `i18next`.        |
| **Must-Have (P0)**            | **Optimistic Language Switch Sync**       | Dispatch background async PATCH on language change via Obsidian Pill & Settings.               |
| **Must-Have (P0)**            | **Registration Locale Carryover**         | Pass active client locale during `POST /auth/register` to initialize new account.              |
| **Should-Have (P1)**          | **Debounced API Dispatch**                | Debounce rapid language switcher clicks (300ms) to prevent unnecessary backend load.           |
| **Should-Have (P1)**          | **Settings UI Language Radio / Dropdown** | Dedicated language preference selector in User Profile / Settings tab alongside Obsidian Pill. |
| **Could-Have (P2)**           | **Auto-sync Toast / Indicator**           | Subtle indicator showing "Preferences saved" in Settings view.                                 |
| **Won't-Have (Out of Scope)** | **Additional Languages**                  | Support for third languages (e.g. Japanese, French) is out of scope for this release.          |
| **Won't-Have (Out of Scope)** | **Deck Content Translation**              | User-generated card text is not translated or modified by preference sync.                     |
