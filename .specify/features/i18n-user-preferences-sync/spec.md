# Feature Specification: User Language Preferences Sync (US-I18N-03)

**Feature Branch**: `feat/i18n-user-preferences-sync`  
**Feature Slug**: `i18n-user-preferences-sync`  
**Backlog Reference**: `US-I18N-03`  
**Created**: 2026-08-22  
**Status**: Approved (Phase 2 - Specify)  
**Domain Baseline**: [`.specify/features/i18n-user-preferences-sync/baseline.md`](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/.specify/features/i18n-user-preferences-sync/baseline.md)

---

## 1. Executive Summary & Value Proposition

WordStreak provides a dual-language (Vietnamese `vi` and English `en`) flashcard and spaced repetition learning platform. Currently, language toggling is cached purely in client-side `localStorage` via `i18next-browser-languagedetector`.

This specification defines the end-to-end synchronization pipeline that bridges local cache with server-side profile persistence in PostgreSQL. It ensures that whenever an authenticated learner configures their language preference on any device (via the Obsidian Pill switcher in the header or the Profile Settings modal), their preference is persisted to the database and seamlessly hydrated across all connected devices and subsequent sessions, while maintaining instant (<16ms) optimistic UI responsiveness and zero page reloads.

---

## 2. User Scenarios & Testing _(mandatory)_

### User Story 1 - Multi-Device Preference Hydration on Login (Priority: P1 - MVP)

**As an** Authenticated Learner who uses WordStreak across multiple devices (e.g. desktop laptop at home and mobile browser on the go),  
**I want** my account's language preference to be automatically loaded upon login and session initialization,  
**So that** I don't have to manually re-select my preferred language on every new device or after browser cache resets.

**Why this priority**: Core cross-device continuity requirement. Eliminates repetitive manual configuration and establishes the database as the authoritative source of truth for user profile preferences.

**Independent Test**:

- Set user preference to `'en'` in database or on Device A.
- Open app on Device B with empty/`vi` `localStorage`.
- Log in or run `initializeAuth()`. Verify `localStorage` and active `i18next` language instantly switch to `'en'` without page reload.

**Acceptance Scenarios**:

1. **Given** a user with account `preferredLanguage = 'en'` in PostgreSQL, **When** the user logs in (`POST /auth/login`) or restores session (`GET /auth/me`), **Then** the client must update `localStorage['wordstreak_locale']` to `'en'` and invoke `i18n.changeLanguage('en')` seamlessly.
2. **Given** a user with account `preferredLanguage = 'vi'`, **When** the user authenticates on a device currently cached as `'en'`, **Then** the client must overwrite the local cache to `'vi'` and re-render the UI in Vietnamese.

---

### User Story 2 - In-Session Optimistic Switch with Background Sync (Priority: P1 - MVP)

**As an** Authenticated Learner actively studying on WordStreak,  
**I want** the application interface to switch languages instantaneously when I click the language switcher, while persisting the change in the background,  
**So that** my learning flow is never interrupted by loading spinners, page reloads, or layout shifts.

**Why this priority**: Critical user experience and performance requirement (60fps / <16ms frame budget). Meets anti-AI-slop design standards for fluid, tactile UI interactions.

**Independent Test**:

- Click Obsidian Pill switcher on Dashboard.
- Verify UI string re-render completes in <16ms with zero page reload.
- Verify network inspector shows asynchronous non-blocking `PATCH /api/v1/users/profile` dispatched and succeeding with HTTP 200.

**Acceptance Scenarios**:

1. **Given** an authenticated user on any page, **When** the user toggles the Obsidian Pill or changes language in Settings, **Then** the UI must re-render all localized text within `< 16ms`, update `localStorage`, and dispatch `PATCH /api/v1/users/profile` with `{ preferredLanguage: targetLocale }`.
2. **Given** rapid consecutive clicks on the language switcher (e.g., 5 clicks in 1 second), **Then** UI and `localStorage` must update immediately on each click, while the background API request is debounced (300ms) so only 1 request with the final state is sent.

---

### User Story 3 - Guest Registration Preference Inheritance (Priority: P1 - MVP)

**As a** Guest Visitor exploring WordStreak who selected English before signing up,  
**I want** my chosen language to be preserved when I create my new account,  
**So that** my newly created profile immediately retains my preferred language without defaulting back to Vietnamese.

**Why this priority**: Prevents post-registration friction where guest choices are discarded upon account creation.

**Independent Test**:

- Set guest landing page language to English (`'en'`).
- Submit registration form (`POST /auth/register`).
- Query database to verify newly created user row has `preferredLanguage = 'en'`.

**Acceptance Scenarios**:

1. **Given** an unauthenticated guest whose active UI language is `'en'`, **When** the guest completes registration, **Then** the registration payload must include `preferredLanguage: 'en'`, and the backend must store `preferredLanguage: 'en'` in the new user record.
2. **Given** an unauthenticated guest registering without explicit language payload, **Then** the backend must default `preferredLanguage` to `'vi'`.

---

### User Story 4 - Language Preference Configuration in Settings Modal (Priority: P2)

**As an** Authenticated Learner,  
**I want** a dedicated "Language & Region" tab inside the Settings Modal,  
**So that** I can view and manage my language preferences alongside my profile goals, avatar, and security settings.

**Why this priority**: Secondary UX discovery channel. Provides explicit settings UI for learners who look for language configuration within Account Settings.

**Independent Test**:

- Open Settings Modal -> Navigate to "Language & Region" tab.
- Select alternative language (e.g. English).
- Verify instant update in Settings Modal itself, the backdrop, and header navigation.

**Acceptance Scenarios**:

1. **Given** an authenticated user opening Settings Modal, **When** selecting the "Language & Region" tab, **Then** the current language must be visually indicated as selected.
2. **Given** the user selects a different language option chip/dropdown, **Then** the entire UI (including the open modal) must immediately reflect the new language and persist the change.

---

### User Story 5 - Offline & Network Outage Graceful Degradation (Priority: P3)

**As an** Authenticated Learner on a flaky mobile connection,  
**I want** language switching to continue working locally even if the network fails,  
**So that** my active study session is not disrupted by network error popups.

**Why this priority**: Network resiliency. Ensures zero crashes or blocking modal interruptions on mobile/offline scenarios.

**Independent Test**:

- Simulate offline network (`navigator.onLine = false` or devtools offline).
- Switch language in header.
- Verify UI switches language, local cache updates, and failed API call is handled silently without error toasts or crashes.

**Acceptance Scenarios**:

1. **Given** an authenticated user offline, **When** switching language, **Then** local UI updates immediately and stays in the selected language, while the background network error is logged silently.

---

## 3. Edge Cases & Error Scenarios

| Edge Case / Scenario                    | Trigger Condition                                                          | Expected System Behavior                                                                             | Business Rule      |
| --------------------------------------- | -------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- | ------------------ |
| **Invalid Locale Payload**              | Direct API call with `{"preferredLanguage": "fr"}` or malformed string     | Backend rejects with HTTP `400 Bad Request` (`VALIDATION_ERROR`). Database unchanged.                | `BR-I18N-SYNC-001` |
| **Simultaneous Multi-Tab Toggles**      | User switches language in Tab A, then Tab B concurrently                   | `storage` event syncs client tabs; debounced API call ensures latest timestamp wins in DB.           | `BR-I18N-SYNC-007` |
| **Guest to Login Transition**           | Guest switches to `'en'`, then logs into an account configured with `'vi'` | DB authority wins (`BR-I18N-SYNC-002`). Client switches UI to `'vi'` to match user account.          | `BR-I18N-SYNC-002` |
| **Existing User DB Migration**          | Existing user rows in PostgreSQL prior to feature release                  | Prisma migration adds column `preferredLanguage VARCHAR(5) NOT NULL DEFAULT 'vi'`. Zero null values. | `BR-I18N-SYNC-006` |
| **Token Expiry during Background Sync** | Auth token expires while `PATCH /users/profile` is dispatched              | Axios interceptor refreshes token via `/auth/refresh` and retries patch transparently.               | `BR-I18N-SYNC-005` |

---

## 4. System Requirements Specification (SRS)

- **`REQ-I18N-SYNC-001` (DB Schema)**: PostgreSQL `users` table shall include `preferredLanguage` column with `NOT NULL DEFAULT 'vi'` and check constraint `CHECK (preferredLanguage IN ('vi', 'en'))`.
- **`REQ-I18N-SYNC-002` (Profile & Auth API)**: `GET /auth/me`, `POST /auth/login`, `POST /auth/register`, `GET /users/profile`, and `PATCH /users/profile` shall include `preferredLanguage` in DTOs.
- **`REQ-I18N-SYNC-003` (Registration Carryover)**: `POST /auth/register` shall accept optional `preferredLanguage?: 'vi' | 'en'`.
- **`REQ-I18N-SYNC-004` (Optimistic UI Runtime)**: Frontend shall execute language transition in `< 16ms` with zero full-page reload and dispatch debounced `PATCH` in background.
- **`REQ-I18N-SYNC-005` (Auth Store Hydration)**: `useAuthStore.initializeAuth()` and `login()` shall synchronize `localStorage` and `i18n` with DB `preferredLanguage`.

---

## 5. Traceability Matrix

| Requirement         | Business Rule                          | User Story | Components / Files Affected                                          | Test Verification                      |
| ------------------- | -------------------------------------- | ---------- | -------------------------------------------------------------------- | -------------------------------------- |
| `REQ-I18N-SYNC-001` | `BR-I18N-SYNC-001`, `BR-I18N-SYNC-006` | US1, US3   | `schema.prisma`, DB Migration                                        | Migration test, Prisma schema check    |
| `REQ-I18N-SYNC-002` | `BR-I18N-SYNC-001`, `BR-I18N-SYNC-002` | US1, US2   | `users.service.ts`, `users.controller.ts`, `auth.service.ts`, `dto/` | NestJS Controller & Service unit tests |
| `REQ-I18N-SYNC-003` | `BR-I18N-SYNC-004`                     | US3        | `register.dto.ts`, `auth.service.ts`, `RegisterForm.tsx`             | Auth register integration test         |
| `REQ-I18N-SYNC-004` | `BR-I18N-SYNC-003`, `BR-I18N-SYNC-007` | US2        | `LanguageSwitcher.tsx`, `userService.ts`, `useAuthStore.ts`          | Switcher component test, debounce test |
| `REQ-I18N-SYNC-005` | `BR-I18N-SYNC-002`, `BR-I18N-SYNC-005` | US1        | `useAuthStore.ts`, `i18n.ts`, `storage.ts`                           | AuthStore initialization unit test     |

---

## 6. Success Criteria _(measurable & tech-agnostic)_

- **SC-001 (Zero Reload Switching)**: 100% of language toggle actions occur with zero full-page reload (`window.location.reload()` forbidden) and UI visual transition latency `< 16ms` (1 frame at 60fps).
- **SC-002 (Cross-Device Consistency)**: 100% of multi-device login sessions reflect the user's latest saved language preference upon application boot.
- **SC-003 (Registration Retention)**: 100% of new account signups preserve the guest's selected language preference.
- **SC-004 (Background Sync Latency)**: P95 background profile sync API latency `< 150ms`.
- **SC-005 (Layout Stability)**: Zero Cumulative Layout Shift (`CLS = 0.00`) during language switching.
- **SC-006 (Type Safety & Validation)**: 100% of invalid locale codes rejected with HTTP 400 at backend boundary.
