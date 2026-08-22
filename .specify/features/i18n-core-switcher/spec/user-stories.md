# User Stories: Core i18n Infrastructure & Instant Language Switcher (US-I18N-01)

- **Document Version**: 1.0
- **Feature Slug**: `i18n-core-switcher`
- **Product Backlog Reference**: `US-I18N-01`
- **Target Release**: Sprint 1 / Core Foundation

---

### US-I18N-01-001: Automatic Browser Language Detection for Visitors

**As a** first-time visitor arriving at WordStreak  
**I want** the website to automatically display in my native language (Vietnamese if detected, otherwise English)  
**So that** I can understand the platform value immediately without having to manually hunt for language settings.

**Traces to**: `REQ-I18N-001`, `REQ-I18N-002`

#### Acceptance Criteria

##### Scenario 1 (Happy Path — Vietnamese Browser Detected)

- **Given** I am a first-time visitor with no prior `wordstreak_locale` entry in `localStorage`
- **And** my browser `navigator.language` is `'vi-VN'` or `'vi'`
- **When** I load the WordStreak Landing Page (`/`)
- **Then** the application shall initialize with locale `'vi'`
- **And** the Landing Page navigation and text shall render in Vietnamese
- **And** the Obsidian Pill switcher shall display `🇻🇳 VI`
- **And** `'vi'` shall be saved to `localStorage` under key `'wordstreak_locale'`

##### Scenario 2 (Happy Path — Non-Vietnamese Browser Fallback to English)

- **Given** I am a first-time visitor with no prior `wordstreak_locale` entry in `localStorage`
- **And** my browser `navigator.language` is `'en-US'`, `'fr-FR'`, or `'ja-JP'`
- **When** I load the WordStreak Landing Page (`/`)
- **Then** the application shall initialize with the default fallback locale `'en'`
- **And** the Landing Page shall render in English
- **And** the Obsidian Pill switcher shall display `🇬🇧 EN`
- **And** `'en'` shall be saved to `localStorage` under key `'wordstreak_locale'`

---

### US-I18N-01-002: Instant 1-Click Toggle via Obsidian Pill Switcher

**As an** active learner or visitor on any page  
**I want to** toggle between Vietnamese and English with a single click on the Obsidian Pill button  
**So that** I can switch languages instantaneously without waiting for a full page reload or losing my place.

**Traces to**: `REQ-I18N-005`, `REQ-I18N-006`, `REQ-I18N-007`

#### Acceptance Criteria

##### Scenario 1 (Happy Path — Instant Switch from EN to VI)

- **Given** the current active language is `'en'` and the Obsidian Pill displays `🇬🇧 EN`
- **When** I click on the Obsidian Pill Language Switcher
- **Then** the active locale shall immediately switch to `'vi'`
- **And** all mounted UI text (Header, Navbar, buttons) shall reactively update to Vietnamese within 16ms
- **And** the Obsidian Pill shall smoothly transition to display `🇻🇳 VI`
- **And** `localStorage.getItem('wordstreak_locale')` shall equal `'vi'`
- **And** the browser shall NOT execute a full page reload (`window.location.reload()`)

##### Scenario 2 (Happy Path — Instant Switch from VI to EN)

- **Given** the current active language is `'vi'` and the Obsidian Pill displays `🇻🇳 VI`
- **When** I click on the Obsidian Pill Language Switcher
- **Then** the active locale shall immediately switch to `'en'`
- **And** all mounted UI text shall reactively update to English within 16ms
- **And** the Obsidian Pill shall smoothly transition to display `🇬🇧 EN`
- **And** `localStorage.getItem('wordstreak_locale')` shall equal `'en'`

##### Scenario 3 (Edge Case — Rapid Consecutive Clicks)

- **Given** the Obsidian Pill switcher is rendered on the screen
- **When** I double-click or click 5 times in rapid succession (< 300ms intervals)
- **Then** each click shall deterministically toggle between `vi` and `en` without state corruption, race conditions, or animation lockup

---

### US-I18N-01-003: Preference Persistence Across Sessions & Tabs

**As a** returning learner  
**I want** my chosen language preference to persist across browser reloads, new tabs, and return visits  
**So that** I do not have to reselect my preferred language every time I open WordStreak.

**Traces to**: `REQ-I18N-002`, `REQ-I18N-006`

#### Acceptance Criteria

##### Scenario 1 (Happy Path — Persistent Selection on Refresh)

- **Given** I previously switched my language to `'vi'` (stored as `'wordstreak_locale' = 'vi'`)
- **When** I refresh the page (`Cmd+R` / `F5`) or close and reopen the tab
- **Then** the application shall immediately initialize in `'vi'`
- **And** the Obsidian Pill shall render `🇻🇳 VI` on the very first painted frame without flickering from English

---

### US-I18N-01-004: Resilient Fallback for Missing Keys & Storage Restrictions

**As a** user navigating localized views  
**I want** missing translations or browser storage restrictions to be handled gracefully in the background  
**So that** my learning session never encounters broken UI placeholders, crashes, or unhandled exceptions.

**Traces to**: `REQ-I18N-001`, `REQ-I18N-004`, `REQ-I18N-008`

#### Acceptance Criteria

##### Scenario 1 (Edge Case — Missing Key in Vietnamese Locale)

- **Given** a component calls `t('common:untranslatedAction')` which exists in `en/common.json` but is omitted in `vi/common.json`
- **When** the user is viewing the application in Vietnamese (`vi`)
- **Then** the application shall render the English text fallback for that key
- **And** the application shall NOT throw a JavaScript error or render raw key strings (`common:untranslatedAction`)

##### Scenario 2 (Edge Case — Corrupted Storage Preference)

- **Given** `localStorage.getItem('wordstreak_locale')` contains an invalid string (e.g. `'de'`, `'null'`, `'undefined'`)
- **When** the application initializes
- **Then** the system shall discard the corrupted value
- **And** run browser detection (`BR-I18N-002`), setting the locale to `vi` (if browser is Vietnamese) or `en`
- **And** overwrite `localStorage` with the newly resolved valid locale

##### Scenario 3 (Edge Case — Incognito / Blocked LocalStorage)

- **Given** the user is in private browsing mode where `localStorage.setItem` throws a `SecurityError`
- **When** the user clicks the Obsidian Pill Language Switcher
- **Then** the application shall catch the storage exception silently
- **And** update the active language in React memory without crashing the UI
