# Technical Research & Architecture Decisions: User Language Preferences Sync (US-I18N-03)

**Feature**: `US-I18N-03`: Cài đặt tùy chọn ngôn ngữ & Đồng bộ hồ sơ người dùng (User Language Preferences Sync)  
**Slug**: `i18n-user-preferences-sync`  
**Date**: 2026-08-22  
**Status**: Resolved

---

## 1. Decision 1: Optimistic UI Transition with Debounced Sync Mutex

- **Context**: When a user clicks the language switcher (in header Obsidian Pill or Settings Modal), the UI must update instantly (<16ms) without waiting for network roundtrip. However, users might rapidly click or toggle between languages, risking out-of-order API requests and unnecessary backend writes.
- **Decision**:
  - Update `i18n.changeLanguage(newLocale)` and `localStorage` synchronously (<16ms).
  - Use a debounced dispatch utility (`300ms` trailing debounce) for the network API request `PATCH /api/v1/users/profile`.
  - Maintain an in-flight mutation controller so only the latest intended locale is persisted.
- **Rationale**: Guarantees zero latency on UI interaction (60fps compliant, CLS = 0.00), prevents API flooding, and guarantees database convergence with the user's final state.
- **Alternatives Considered**:
  - _Immediate un-debounced HTTP requests on every click_: Rejected due to risk of request race conditions where an earlier request could overwrite a later request if network packets arrive out of order.
  - _Blocking loading spinner during sync_: Rejected because it harms perceived performance and violates anti-AI-slop fluid UI principles.

---

## 2. Decision 2: Cross-Device Session Hydration Order (DB Authority)

- **Context**: When an authenticated user logs in (`POST /auth/login`) or restores an existing session on app startup (`GET /auth/me`), their device may have a different locale stored in `localStorage` (e.g. guest default `'vi'` vs. saved account preference `'en'`).
- **Decision**:
  - The database user profile `preferredLanguage` strictly overrides local browser cache.
  - During `useAuthStore.initializeAuth()` and `login()`, after receiving `user.preferredLanguage`:
    1. If `user.preferredLanguage !== currentLocale`:
       - `safeSetLocale(user.preferredLanguage)`
       - `i18n.changeLanguage(user.preferredLanguage)`
- **Rationale**: Adheres to `BR-I18N-SYNC-002`. Ensures multi-device continuity so user preferences travel seamlessly across laptops, tablets, and mobile devices.
- **Alternatives Considered**:
  - _Local storage overrides DB_: Rejected because a newly opened device would overwrite the user's deliberate account setting from another device.
  - _Prompt user on mismatch_: Rejected as intrusive friction for a simple preference.

---

## 3. Decision 3: Database Schema & Migration Strategy for Existing Users

- **Context**: Existing WordStreak PostgreSQL database already contains user rows. We need to add `preferredLanguage` to the `User` model without breaking existing data or requiring downtime.
- **Decision**:
  - Add `preferredLanguage String @default("vi")` in `apps/api/prisma/schema.prisma`.
  - Create a Prisma migration with SQL:
    ```sql
    ALTER TABLE "users" ADD COLUMN "preferredLanguage" VARCHAR(5) NOT NULL DEFAULT 'vi';
    ALTER TABLE "users" ADD CONSTRAINT "users_preferred_language_check" CHECK ("preferredLanguage" IN ('vi', 'en'));
    ```
- **Rationale**: `NOT NULL DEFAULT 'vi'` guarantees zero NULL values for existing and future rows without complex backfill scripts.
- **Alternatives Considered**:
  - _Nullable column without default_: Rejected because application code would have to handle null checks across all profile consumers.

---

## 4. Decision 4: Shared Types & DTO Validation Boundary

- **Context**: Language preference must be type-safe across frontend (`apps/web`), backend (`apps/api`), and shared contracts (`packages/shared-types`).
- **Decision**:
  - In `packages/shared-types/src/auth.ts`:
    - Define `export type AppLanguage = 'vi' | 'en';`
    - Update `AuthUser`, `User`, `UpdateProfileDto`, and `RegisterDto` to include `preferredLanguage?: AppLanguage`.
  - In `apps/api/src/modules/users/dto/update-profile.dto.ts` & `register.dto.ts`:
    - Use `@IsOptional()`, `@IsString()`, `@IsIn(['vi', 'en'], { message: 'preferredLanguage must be either "vi" or "en"' })`.
- **Rationale**: Strict compile-time and runtime validation prevents injection of unsupported locales and provides standardized error responses (`400 Bad Request`).
- **Alternatives Considered**:
  - _Accepting arbitrary BCP 47 strings_: Rejected because WordStreak only supports Vietnamese and English.

---

## 5. Decision 5: UI Settings Integration Pattern

- **Context**: The existing `SettingsModal.tsx` contains Profile & Goals, Avatar, Security, and Level & XP tabs. Translations in `settings.json` already have keys for `"tabs.language"`, but the UI tab was not yet rendered.
- **Decision**:
  - Add `"language"` tab to `SettingsModal.tsx` navigation.
  - Render an intuitive Language & Region selection card with interactive locale options (`Tiếng Việt 🇻🇳` and `English 🇺🇸`).
  - Wire language switches to trigger optimistic update and background profile patch via `userService.updateProfile({ preferredLanguage })`.
- **Rationale**: Delivers comprehensive settings discovery while keeping the Obsidian Pill switcher in the header for quick 1-click toggling.
