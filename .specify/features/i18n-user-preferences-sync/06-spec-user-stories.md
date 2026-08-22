# Specification & User Stories: User Language Preferences Sync (US-I18N-03)

- **Feature**: `US-I18N-03`: Cài đặt tùy chọn ngôn ngữ & Đồng bộ hồ sơ người dùng (User Language Preferences Sync)
- **Slug**: `i18n-user-preferences-sync`
- **Protocol**: Bounded Task
- **Date**: 2026-08-22

---

## 1. System Requirements Specification (SRS)

### `REQ-I18N-SYNC-001`: Database Persistence of Language Preference

- **Category**: Backend / Data Model
- **Priority**: Must-Have (P0)
- **Status**: Approved
- **Description**: The system shall persist the user's preferred application language (`preferredLanguage`) in the PostgreSQL `users` table as a `VARCHAR(5)` with default `'vi'`.
- **Derived from**: `BR-I18N-SYNC-001`, `BR-I18N-SYNC-006`, `ASM-I18N-SYNC-001`
- **Business Rules**: `BR-I18N-SYNC-001`, `BR-I18N-SYNC-006`
- **Non-Functional Requirements**: PostgreSQL column indexed or included in primary User query without extra join overhead.

### `REQ-I18N-SYNC-002`: Profile API Preference Synchronization

- **Category**: Backend / API
- **Priority**: Must-Have (P0)
- **Status**: Approved
- **Description**: The API shall return `preferredLanguage` in `GET /auth/me` and `GET /api/v1/users/profile`, accept `preferredLanguage` in `PATCH /api/v1/users/profile`, and validate that only `'vi'` and `'en'` are accepted.
- **Derived from**: `BR-I18N-SYNC-001`, `BR-I18N-SYNC-002`, `BR-I18N-SYNC-003`
- **Business Rules**: `BR-I18N-SYNC-001`, `BR-I18N-SYNC-002`, `BR-I18N-SYNC-003`
- **Non-Functional Requirements**: API P95 latency `< 150ms`; validation returns `400 Bad Request` for unauthorized values.

### `REQ-I18N-SYNC-003`: Registration Locale Inheritance

- **Category**: Backend & Frontend / Auth
- **Priority**: Must-Have (P0)
- **Status**: Approved
- **Description**: The registration endpoint `POST /auth/register` shall accept an optional `preferredLanguage` property in the registration payload, saving the guest's active client language as their initial user account preference.
- **Derived from**: `BR-I18N-SYNC-004`, `ASM-I18N-SYNC-004`
- **Business Rules**: `BR-I18N-SYNC-004`

### `REQ-I18N-SYNC-004`: Optimistic Frontend Language Transition

- **Category**: Frontend / UI Runtime
- **Priority**: Must-Have (P0)
- **Status**: Approved
- **Description**: When an authenticated user switches language via the navigation Obsidian Pill or the Settings page, the web client shall immediately update the active `i18n` language and `localStorage` within `< 16ms` (zero full-page reload) and asynchronously dispatch `PATCH /api/v1/users/profile`.
- **Derived from**: `BR-I18N-SYNC-003`, `BR-I18N-SYNC-005`, `BR-I18N-SYNC-007`
- **Business Rules**: `BR-I18N-SYNC-003`, `BR-I18N-SYNC-005`, `BR-I18N-SYNC-007`
- **Non-Functional Requirements**: UI transition latency `< 16ms`; Zero Cumulative Layout Shift (`CLS = 0.00`).

### `REQ-I18N-SYNC-005`: Session Initialization DB Precedence

- **Category**: Frontend / Auth & State
- **Priority**: Must-Have (P0)
- **Status**: Approved
- **Description**: Upon authenticating or restoring session via `GET /auth/me`, if the returned `preferredLanguage` differs from the client's current `localStorage` value, the client shall overwrite `localStorage` with the DB value and seamlessly switch the active `i18n` runtime language.
- **Derived from**: `BR-I18N-SYNC-002`, `ASM-I18N-SYNC-002`
- **Business Rules**: `BR-I18N-SYNC-002`

---

## 2. User Stories & Acceptance Criteria

### `US-I18N-03`: Cài đặt tùy chọn ngôn ngữ & Đồng bộ hồ sơ người dùng (User Language Preferences Sync)

**As an** Authenticated Learner  
**I want to** have my chosen application language preference persisted in my account profile and synchronized across all my devices  
**So that** I enjoy a consistent multilingual learning experience without needing to re-select my preferred language every time I switch devices or log back in

**Traces to**: `REQ-I18N-SYNC-001`, `REQ-I18N-SYNC-002`, `REQ-I18N-SYNC-003`, `REQ-I18N-SYNC-004`, `REQ-I18N-SYNC-005`

---

### Scenario 1: Multi-Device Login Profile Hydration (Happy Path)

- **Given** an authenticated user whose account `preferredLanguage` is set to `'en'` in the database
- **And** the user opens WordStreak on a second device where `localStorage['wordstreak_locale']` is `'vi'`
- **When** the application authenticates and receives the user profile from `GET /auth/me`
- **Then** the client must update `localStorage['wordstreak_locale']` to `'en'`
- **And** the active `i18n` language must immediately change to English (`'en'`) without reloading the page.

### Scenario 2: In-Session Language Switch with Optimistic Background Sync (Happy Path)

- **Given** an authenticated user logged in and browsing the Dashboard in Vietnamese (`'vi'`)
- **When** the user clicks the Obsidian Pill switcher in the top navigation to toggle to English (`'en'`)
- **Then** the UI must instantly re-render all visible text in English in `< 16ms`
- **And** `localStorage['wordstreak_locale']` must be updated to `'en'`
- **And** a background asynchronous `PATCH /api/v1/users/profile` with `{ preferredLanguage: "en" }` must be dispatched
- **And** the backend must update the `User.preferredLanguage` record to `'en'` in PostgreSQL.

### Scenario 3: Guest-to-Authenticated Registration Locale Inheritance (Happy Path)

- **Given** an unauthenticated guest visitor who switched the landing page language to English (`'en'`)
- **When** the guest submits the registration form to create a new account
- **Then** the client must include `"preferredLanguage": "en"` in the `POST /auth/register` payload
- **And** the backend must create the new `User` record with `preferredLanguage = 'en'`
- **And** subsequent logins on any device must load English as the user's default language.

### Scenario 4: Offline / Network Outage Resiliency (Edge Case)

- **Given** an authenticated user whose device temporarily loses internet connectivity
- **When** the user switches language preference from Vietnamese to English
- **Then** the client UI must transition to English immediately and persist `'en'` in `localStorage`
- **And** the background `PATCH /api/v1/users/profile` request failure must be caught silently
- **And** no blocking error modal or UI crash shall occur.

### Scenario 5: Invalid Locale Rejection (Edge Case / Security)

- **Given** an authenticated user or client making a direct API call to `PATCH /api/v1/users/profile`
- **When** the request body contains an unsupported language code (e.g. `{"preferredLanguage": "fr"}`)
- **Then** the API must respond with HTTP `400 Bad Request`
- **And** the database record must remain unchanged.

### Scenario 6: Rapid Switcher Clicks Debounce (Edge Case / Performance)

- **Given** an authenticated user rapidly clicking the Obsidian Pill switcher 5 times in 1 second
- **When** the clicks occur
- **Then** the local UI and `localStorage` must toggle on each click with zero latency
- **And** the background API PATCH request must be debounced so that at most 1 API request is dispatched with the final state.
