# Elicitation Interview: User Language Preferences Sync (US-I18N-03)

- **Feature**: `US-I18N-03`: Cài đặt tùy chọn ngôn ngữ & Đồng bộ hồ sơ người dùng (User Language Preferences Sync)
- **Slug**: `i18n-user-preferences-sync`
- **Protocol**: Bounded Task
- **Date**: 2026-08-22

---

## 1. Business Value & Goals

1. **Problem Statement & Friction**:
   - Currently in WordStreak, language selection is stored exclusively on the client in browser `localStorage`. When an authenticated learner switches devices (e.g. from desktop to mobile), clears browser data, or uses incognito mode, their preferred UI language resets to default.
   - If we don't build this, authenticated users will experience inconsistent language preferences across sessions and devices, creating friction during multilingual study routines.

2. **Target Personas**:
   - **Authenticated Learner**: Wants their language preference (`vi` / `en`) remembered across all devices and sessions seamlessly.
   - **Guest / Unauthenticated Visitor**: Can choose a language locally during onboarding/exploration, which should smoothly transfer into their newly registered account.

3. **Success Metrics**:
   - **Primary Metric**: 100% language preference persistence across authenticated sessions on different devices.
   - **Operational Metric**: Instant UI locale switch latency `< 16ms` (optimistic render); background profile sync API P95 latency `< 150ms`.

---

## 2. Elicitation Decisions & Pillar Alignment

### Pillar 1 & 4 — Sync Timing, Precedence & Conflict Resolution

- **Interview Question**: When an existing user logs in from a new device/browser (where `localStorage` might hold default `'vi'` or browser-detected `'en'`), or switches language during an active session, which source of truth takes precedence and how is sync triggered?
- **Decision (Option A Confirmed)**:
  - **On Authentication / Session Init (`GET /auth/me`)**: The database profile `preferredLanguage` strictly takes precedence over client `localStorage`. The client synchronizes `localStorage` with the DB value and updates the active `i18n` runtime language.
  - **On Language Switch (Obsidian Pill or Profile Settings)**:
    1. Optimistic UI update: The `i18n` language and `localStorage` update immediately (`< 16ms`).
    2. Background Async Sync: An asynchronous background `PATCH` request (`/api/v1/users/profile`) is dispatched to update `preferredLanguage` in the database.
    3. Network Failure / Offline: If the network request fails or the user is offline, the local UI remains uninterrupted; the error is logged silently without blocking the user.

### Pillar 1 & 5 — Guest-to-Authenticated Transition & Registration

- **Interview Question**: How should language preference be initialized when a guest user registers a new account?
- **Decision (Option A Confirmed)**:
  - The registration payload (`POST /auth/register`) accepts an optional `preferredLanguage` field (defaulting to current client `localStorage` / active locale).
  - The backend persists this value into the new `User` record upon signup, ensuring continuous language preference from guest onboarding to active learner.

### Pillar 3 & 5 — Schema & API Contract Architecture

- **Interview Question**: How should `preferredLanguage` be modeled in the database and API endpoints?
- **Decision (Option A Confirmed)**:
  - **Database Schema**: Additive field `preferredLanguage: String @default("vi")` on the `User` model in Prisma.
  - **API Contract**: Included in `UserResponseDto` (returned by `GET /auth/me`, `GET /users/profile`), accepted in `UpdateUserProfileDto` (`PATCH /api/v1/users/profile`), and accepted in `RegisterDto` (`POST /auth/register`).

---

## 3. Assumptions Confirmed

- **`ASM-I18N-SYNC-001`**: Supported languages are restricted strictly to `'vi'` (Tiếng Việt) and `'en'` (English). Any other value is rejected with `400 Bad Request`.
- **`ASM-I18N-SYNC-002`**: Database value always overrides local cache upon initial session restoration (`GET /auth/me`) to ensure multi-device consistency.
- **`ASM-I18N-SYNC-003`**: Language switching is non-blocking and optimistic; client state updates immediately without waiting for API response.
- **`ASM-I18N-SYNC-004`**: Unauthenticated guests continue to use `localStorage` key `wordstreak_locale` without backend sync.

---

## 4. Open Questions

_None. All scoping questions have been resolved._
