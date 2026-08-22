# Software Requirements Specification (SRS)

## Feature: Complete UI Localization & Error Mapping (US-I18N-02)

- **Feature Slug**: `i18n-ui-localization`
- **Backlog Reference**: `US-I18N-02` (EPIC 10: Multi-language & Internationalization)
- **Target Release**: WordStreak MVP v1.0
- **Author**: Lead Business Analyst
- **Status**: Draft

---

## 1. System Architecture & Standards

All requirements specified herein adhere strictly to the WordStreak frontend architecture (`React 19`, `i18next`, `react-i18next`, ECMAScript `Intl` standard, and Tailwind CSS).

---

## 2. Detailed Functional & Non-Functional Requirements

### REQ-I18N-001: Complete UI Chrome String Extraction & Namespace Segregation

- **Category**: Localization Core
- **Priority**: Must-Have
- **Status**: Draft
- **Description**: The system must extract 100% of hardcoded UI strings across all 12 application domains (`common`, `auth`, `dashboard`, `decks`, `cards`, `study`, `practice`, `community`, `analytics`, `settings`, `gamification`, `ai_vocabulary`) into corresponding modular JSON files under `apps/web/src/locales/vi/` and `apps/web/src/locales/en/`.
- **Derived from**: `BR-I18N-007`, `ASM-I18N-005`
- **Business Rules**: `BR-I18N-007`, `BR-I18N-010`
- **Non-Functional Requirements**: P95 UI render time on locale switch < 16ms; translation bundle size per namespace < 15KB gzipped.
- **Dependencies**: `US-I18N-01`

### REQ-I18N-002: Strict Error Code Registry & Axios Interceptor Mapping

- **Category**: Error Handling
- **Priority**: Must-Have
- **Status**: Draft
- **Description**: The frontend must intercept all failed API responses via an Axios response interceptor, extract the machine-readable `errorCode` (or HTTP status), and resolve it to a human-friendly localized message in `errors.json` (`errors:<namespace>.<error_key>`) for both `vi` and `en` locales.
- **Derived from**: `BR-I18N-002`, `ASM-I18N-001`
- **Business Rules**: `BR-I18N-002`
- **Non-Functional Requirements**: Error resolution latency < 2ms.
- **Dependencies**: None

### REQ-I18N-003: Raw Stack Trace & Technical Error Suppression

- **Category**: Security & UX
- **Priority**: Must-Have
- **Status**: Draft
- **Description**: If an API error code is unmapped, unparseable, or results from an unhandled 500 server error, the interceptor must display `errors:generic.unexpected_error` and strictly suppress raw stack traces, database schema details, and SQL/Prisma error strings from end-user toasts and UI components.
- **Derived from**: `BR-I18N-002`, `ASM-I18N-001`
- **Business Rules**: `BR-I18N-002`
- **Non-Functional Requirements**: Zero technical/database tokens exposed in DOM.
- **Dependencies**: `REQ-I18N-002`

### REQ-I18N-004: Centralized Locale-Aware Number Formatting

- **Category**: Cultural Formatting
- **Priority**: Must-Have
- **Status**: Draft
- **Description**: The system must provide a centralized formatting helper (`formatNumber`) wrapping `Intl.NumberFormat` bound dynamically to the active locale (`vi-VN` vs `en-US`), correctly rendering thousand separators (`.` in `vi`, `,` in `en`) and decimals (`,` in `vi`, `.` in `en`) for all numbers, XP metrics, and percentage values.
- **Derived from**: `BR-I18N-001`, `BR-I18N-004`, `ASM-I18N-002`
- **Business Rules**: `BR-I18N-001`, `BR-I18N-004`
- **Non-Functional Requirements**: Zero hydration mismatch or layout shifting.
- **Dependencies**: None

### REQ-I18N-005: Centralized Locale-Aware Date and Timestamp Formatting

- **Category**: Cultural Formatting
- **Priority**: Must-Have
- **Status**: Draft
- **Description**: The system must provide a centralized formatting helper (`formatDate`) wrapping `Intl.DateTimeFormat` bound dynamically to the active locale (`vi-VN` vs `en-US`), rendering dates in `DD/MM/YYYY` format for Vietnamese and `MM/DD/YYYY` format for English across all review histories, streak logs, and deck creation dates.
- **Derived from**: `BR-I18N-001`, `BR-I18N-005`, `ASM-I18N-002`
- **Business Rules**: `BR-I18N-001`, `BR-I18N-005`
- **Non-Functional Requirements**: Formatting execution < 1ms per timestamp.
- **Dependencies**: None

### REQ-I18N-006: Relative Time Localization

- **Category**: Cultural Formatting
- **Priority**: Must-Have
- **Status**: Draft
- **Description**: The system must provide a helper (`formatRelativeTime`) wrapping `Intl.RelativeTimeFormat(canonicalLocale, { numeric: 'auto' })` to render localized relative time intervals (e.g. `"2 giờ trước"`, `"hôm qua"`, `"2 hours ago"`, `"yesterday"`) for activity feeds and review timestamps.
- **Derived from**: `BR-I18N-001`, `BR-I18N-005`, `ASM-I18N-002`
- **Business Rules**: `BR-I18N-001`, `BR-I18N-005`
- **Non-Functional Requirements**: Dynamic updates without full component remount.
- **Dependencies**: `REQ-I18N-005`

### REQ-I18N-007: Unified Pluralization Rule Implementation

- **Category**: Linguistic Grammar
- **Priority**: Must-Have
- **Status**: Draft
- **Description**: The system must utilize i18next pluralization syntax for all countable text keys (e.g. cards, days, freezes, reviews) supporting `_one` and `_other` in English and singular base keys in Vietnamese, eliminating improper phrasing such as `"1 cards"`.
- **Derived from**: `BR-I18N-006`, `ASM-I18N-003`
- **Business Rules**: `BR-I18N-006`
- **Non-Functional Requirements**: Fallback to base key if plural key is missing.
- **Dependencies**: `REQ-I18N-001`

### REQ-I18N-008: Strict User-Generated Content (UGC) Isolation

- **Category**: Content Integrity
- **Priority**: Must-Have
- **Status**: Draft
- **Description**: The frontend architecture must enforce a strict boundary preventing User-Generated Content (flashcard front term, back definition, phonetic IPA, user examples, custom notes, user deck descriptions) from being passed into `t()` or modified by localization functions.
- **Derived from**: `BR-I18N-003`, `ASM-I18N-004`
- **Business Rules**: `BR-I18N-003`
- **Non-Functional Requirements**: 100% byte-for-byte fidelity of flashcard text rendered in DOM.
- **Dependencies**: None

### REQ-I18N-009: SRS Review Rating Action Localization

- **Category**: Study & Spaced Repetition
- **Priority**: Must-Have
- **Status**: Draft
- **Description**: The SRS flashcard review interface must display localized rating action buttons: Rating 1 (`Lại` / `Again`), Rating 2 (`Khó` / `Hard`), Rating 3 (`Tốt` / `Good`), Rating 4 (`Dễ` / `Easy`), while appending localized interval duration previews (`< 10p` / `< 10m`, `1 ngày` / `1d`).
- **Derived from**: `BR-I18N-008`, `ASM-I18N-004`
- **Business Rules**: `BR-I18N-008`
- **Non-Functional Requirements**: Button keybinding events (`1`, `2`, `3`, `4`) remain invariant across locales.
- **Dependencies**: `REQ-I18N-001`

### REQ-I18N-010: Quiz & Practice Mode UI Localization

- **Category**: Practice & Quiz
- **Priority**: Must-Have
- **Status**: Draft
- **Description**: All 5 practice quiz modules (Multiple Choice, Fill in the Blank, Word Matching, Listening Practice, Speech Pronunciation Assessment) must localize instruction headers, timer badges, submission buttons, hint triggers, score dialogs, and pronunciation feedback tips into `vi` and `en`.
- **Derived from**: `BR-I18N-007`, `ASM-I18N-005`
- **Business Rules**: `BR-I18N-007`, `BR-I18N-010`
- **Non-Functional Requirements**: Audio playback triggers and score calculation remain unaltered.
- **Dependencies**: `REQ-I18N-001`

### REQ-I18N-011: AI Vocabulary Generator Interface Localization

- **Category**: AI Features
- **Priority**: Must-Have
- **Status**: Draft
- **Description**: The AI Vocabulary Generator modal must localize topic prompt inputs, CEFR level selection badges (A1–C2), card count sliders, generation progress indicators, and confirmation buttons.
- **Derived from**: `BR-I18N-007`, `ASM-I18N-005`
- **Business Rules**: `BR-I18N-007`
- **Non-Functional Requirements**: Prompt payload to backend preserves user-requested topic verbatim.
- **Dependencies**: `REQ-I18N-001`, `REQ-I18N-002`

### REQ-I18N-012: Learning Analytics & Chart Label Localization

- **Category**: Analytics & Reporting
- **Priority**: Must-Have
- **Status**: Draft
- **Description**: The Learning Analytics dashboard must localize chart axis labels, tooltip summaries, retention rate indicators, mastery tier cards, and date range selector dropdowns.
- **Derived from**: `BR-I18N-007`, `ASM-I18N-005`
- **Business Rules**: `BR-I18N-004`, `BR-I18N-007`
- **Non-Functional Requirements**: Chart re-render on language switch < 32ms.
- **Dependencies**: `REQ-I18N-001`, `REQ-I18N-004`

### REQ-I18N-013: Gamification, Streaks & XP Notification Localization

- **Category**: Gamification
- **Priority**: Must-Have
- **Status**: Draft
- **Description**: The gamification subsystem must localize XP toast popups, level-up celebration modal dialogs, streak milestone achievement banners, and streak freeze activation alerts in `gamification.json`.
- **Derived from**: `BR-I18N-007`, `ASM-I18N-005`
- **Business Rules**: `BR-I18N-004`, `BR-I18N-007`
- **Non-Functional Requirements**: Animation framerate >= 60fps during modal popup.
- **Dependencies**: `REQ-I18N-001`, `REQ-I18N-004`

### REQ-I18N-014: Error Toast Rate-Limiting & Deduplication

- **Category**: Toast UX & Anti-Abuse
- **Priority**: Should-Have
- **Status**: Draft
- **Description**: The toast dispatching system must suppress duplicate consecutive error toasts with identical error keys within a 2000ms sliding time window to prevent notification spamming during network disconnections.
- **Derived from**: `BR-I18N-009`
- **Business Rules**: `BR-I18N-009`
- **Non-Functional Requirements**: In-memory debounce queue memory footprint < 100KB.
- **Dependencies**: `REQ-I18N-002`

### REQ-I18N-015: Dynamic Accessibility & aria-label Conformance

- **Category**: Accessibility (A11y)
- **Priority**: Should-Have
- **Status**: Draft
- **Description**: All icon-only buttons (close triggers, audio play buttons, SRS shortcuts), modal dialog wrappers, and status indicators must expose dynamic `aria-label` and `aria-live` attributes matching the active locale, achieving WCAG 2.1 AA compliance.
- **Derived from**: `BR-I18N-001`, `ASM-I18N-005`
- **Business Rules**: `BR-I18N-001`, `BR-I18N-007`
- **Non-Functional Requirements**: WCAG 2.1 AA screen reader compatibility.
- **Dependencies**: `REQ-I18N-001`
