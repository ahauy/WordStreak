# Changelog

All notable changes to the WordStreak project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- **US-I18N-03: User Language Preferences Sync & Profile Persistence**
  - **Shared Types**: Added `AppLanguage = 'vi' | 'en'` and updated `AuthUser`, `RegisterDto`, and `UpdateProfileDto` in `@wordstreak/shared-types`.
  - **Database Migration**: Added `preferredLanguage` column (`VARCHAR(10) DEFAULT 'vi'`) to `User` model with check constraint `CHECK (preferredLanguage IN ('vi', 'en'))`.
  - **Backend API**:
    - Validated and updated `UpdateProfileDto` and `RegisterDto` with `@IsIn(['vi', 'en'])`.
    - Integrated `preferredLanguage` persistence and mapping across `UsersService`, `UsersController`, and `AuthService`.
  - **Frontend Auth & State Management**:
    - Hydrated `localStorage` and synchronized `i18next` on `login()` and `initializeAuth()` in `useAuthStore`.
    - Preserved active guest locale during registration payload submission in `RegisterForm`.
  - **In-Session Sync & Settings UI**:
    - Added debounced optimistic synchronization manager (`syncManager.ts` / `languageSync.ts`) to avoid API flooding.
    - Integrated sync into `LanguageSwitcher` for authenticated learners with zero lag (<16ms) UI updates.
    - Added interactive "Language & Region" tab in `SettingsModal` with real-time feedback and offline graceful degradation.
- **US-I18N-02: Full UI Localization & Error Mapping**
  - 13 comprehensive translation namespaces for Vietnamese (`vi`) and English (`en`).
  - Dynamic error mapper with backend error code translation.
  - Formatter utilities for currency, dates, numbers, and relative time.
- **US-I18N-01: i18n Architecture & Core Foundation**
  - Configured `i18next` and `react-i18next` with local storage detection and fallback mechanics.
  - Parity test suite guaranteeing 100% key matching between Vietnamese and English dictionaries.

### Verified
- Full monorepo typecheck passed across `@wordstreak/shared-types`, `apps/api`, and `apps/web`.
- Full monorepo build succeeded (`nest build` and `vite build`).
- Full test suites passed (39 API test suites / 310 tests, 67 Web test suites / 394 tests).
- Offline resilience and debouncing verified.
