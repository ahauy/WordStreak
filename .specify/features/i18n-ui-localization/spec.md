# Technical Specification: Complete UI Localization & Error Mapping (US-I18N-02)

- **Feature**: `i18n-ui-localization`
- **Epics**: `EPIC-10` (Multi-language & Internationalization — US-I18N-02)
- **Status**: SPECIFIED
- **Date**: 2026-08-22
- **Author**: Principal System Architect

---

## 1. Executive Summary & Objectives

Building on the foundational i18n engine (`US-I18N-01`), **`US-I18N-02` (Complete UI Localization & Error Mapping)** delivers end-to-end linguistic localization and culturally accurate data presentation across the entire WordStreak web application for Vietnamese (`vi`) and English (`en`).

### Core Objectives

1. **100% UI Shell Localization**: Eliminate all remaining hardcoded strings across **12 domain namespaces** (`common`, `auth`, `dashboard`, `decks`, `cards`, `study`, `practice`, `community`, `analytics`, `settings`, `gamification`, `ai_vocabulary`) plus `errors`.
2. **Centralized Error Code Registry & Sanitization**: Provide an automated Axios error mapper that intercepts API exceptions, maps backend `errorCode` strings to localized user-friendly messages in `errors.json`, and strictly suppresses server stack traces, database identifiers, and raw 500 exceptions.
3. **Locale-Aware Formatting (`Intl`)**: Provide centralized, reactive formatting helpers leveraging ECMAScript `Intl` standards (`Intl.NumberFormat`, `Intl.DateTimeFormat`, `Intl.RelativeTimeFormat`) and standard pluralization (`_one`/`_other` in English, singular base in Vietnamese).
4. **Strict UI Shell vs UGC Isolation**: Guarantee 100% preservation of User-Generated Content (flashcard terms, definitions, phonetic IPA, user notes, deck descriptions) while fully localizing chrome and SRS rating actions (`Again` / `Lại`, `Hard` / `Khó`, `Good` / `Tốt`, `Easy` / `Dễ`).
5. **Robustness & Accessibility**: Enforce error toast deduplication (2000ms window), dynamic `aria-label` tags, and layout invariance accommodating +40% Vietnamese text expansion without visual clipping.

---

## 2. Business Rules & Governance (`BR-I18N-001` .. `BR-I18N-010`)

| Rule ID           | Name                                    | Specification                                                                                                                                                                                                                                    |
| :---------------- | :-------------------------------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **`BR-I18N-001`** | **Canonical Locales & BCP-47 Tags**     | The application strictly supports `'vi'` and `'en'`. For ECMAScript `Intl` formatters, `'vi'` maps to canonical tag `'vi-VN'` and `'en'` maps to `'en-US'`.                                                                                      |
| **`BR-I18N-002`** | **Error Resolution & Sanitization**     | All backend API exceptions map to `errors:<namespace>.<key>`. Unmapped codes or 500 errors fallback to `errors:generic.unexpected_error`. Raw stack traces, SQL tokens, and database table names are strictly banned from UI presentation.       |
| **`BR-I18N-003`** | **Strict UI Shell vs UGC Boundary**     | System chrome (navbars, modals, buttons, table headers, toasts, SRS buttons) is 100% translated. Flashcard front/back text, IPA transcription, and user notes are rendered verbatim without translation pass.                                    |
| **`BR-I18N-004`** | **Locale-Aware Number Formatting**      | Numbers, XP figures, streak counts, and percentages must format via `Intl.NumberFormat(canonicalTag)`. `vi-VN`: thousand separator `.`, decimal `,` (`10.000 XP`, `95,5%`). `en-US`: thousand separator `,`, decimal `.` (`10,000 XP`, `95.5%`). |
| **`BR-I18N-005`** | **Locale-Aware Date & Time Formatting** | Dates format via `Intl.DateTimeFormat(canonicalTag)` (`DD/MM/YYYY` for `vi-VN`, `MM/DD/YYYY` for `en-US`). Relative times format via `Intl.RelativeTimeFormat(canonicalTag, { numeric: 'auto' })` (`"2 giờ trước"`, `"2 hours ago"`).            |
| **`BR-I18N-006`** | **Standard Pluralization Rules**        | Countable English entities require `_one` and `_other` suffix keys. Vietnamese entities require only the base key (no grammatical noun inflection). Interpolation syntax is `{{count}}`.                                                         |
| **`BR-I18N-007`** | **12-Namespace Modular Structure**      | Translation resources are partitioned into 12 domain namespaces (`common`, `auth`, `dashboard`, `decks`, `cards`, `study`, `practice`, `community`, `analytics`, `settings`, `gamification`, `ai_vocabulary`) + `errors`.                        |
| **`BR-I18N-008`** | **SRS Rating Action Localization**      | SRS review rating buttons render localized labels: Rating 1 (`Lại` / `Again`), Rating 2 (`Khó` / `Hard`), Rating 3 (`Tốt` / `Good`), Rating 4 (`Dễ` / `Easy`), preserving interval duration cues (`< 10p` / `< 10m`, `1 ngày` / `1d`).           |
| **`BR-I18N-009`** | **Error Toast Rate-Limiting**           | Consecutive identical error toast notifications within a `2000ms` window are deduplicated into a single toast to prevent toast flood during network drops.                                                                                       |
| **`BR-I18N-010`** | **Boundary & Layout Expansion**         | All UI elements, buttons, cards, and modal dialogs must tolerate **+40% text expansion** without horizontal overflow, text truncation bugs, or button distortion.                                                                                |

---

## 3. Namespace Architecture & Scope

Translations are organized in modular JSON dictionaries under `apps/web/src/locales/{en,vi}/`:

```
apps/web/src/locales/
├── en/
│   ├── common.json         # Navigation, global buttons, generic actions, brand chrome
│   ├── auth.json           # Login, registration, password recovery, verification modals
│   ├── dashboard.json      # Widgets, daily goal progress, streak overview, mascots
│   ├── decks.json          # Deck listing, deck modal, deck filters, tags
│   ├── cards.json          # Card creation, editing, bulk toolbar, card data table headers
│   ├── study.json          # SRS review interface, rating buttons, summary stats
│   ├── practice.json       # 5 quiz modes (MCQ, Fill-in-blank, Matching, Listening, Voice)
│   ├── community.json      # Public deck gallery, ratings, clone actions, deck sharing
│   ├── analytics.json      # Heatmaps, retention charts, mastery distribution, metrics
│   ├── settings.json       # Profile, security, language switcher, audio preferences
│   ├── gamification.json   # XP rewards, level up dialogs, streak freezes, badge alerts
│   ├── ai_vocabulary.json  # AI generator modal, CEFR badges, prompt triggers
│   └── errors.json         # Centralized API error code registry and fallback messages
└── vi/
    ├── common.json
    ├── auth.json
    ├── dashboard.json
    ├── decks.json
    ├── cards.json
    ├── study.json
    ├── practice.json
    ├── community.json
    ├── analytics.json
    ├── settings.json
    ├── gamification.json
    ├── ai_vocabulary.json
    └── errors.json
```

---

## 4. Error Code Registry & Axios Interception

### 4.1. Error Mapping Table

| Backend Error Code          |   HTTP Status    | `errors.json` Key Path             | Vietnamese Translation (`vi`)                          | English Translation (`en`)                             |
| :-------------------------- | :--------------: | :--------------------------------- | :----------------------------------------------------- | :----------------------------------------------------- |
| `AUTH_INVALID_CREDENTIALS`  |       401        | `errors:auth.invalid_credentials`  | Email hoặc mật khẩu không chính xác.                   | Invalid email or password.                             |
| `AUTH_EMAIL_ALREADY_EXISTS` |       409        | `errors:auth.email_already_exists` | Email này đã được đăng ký tài khoản.                   | This email is already registered.                      |
| `AUTH_UNAUTHORIZED`         |       401        | `errors:auth.unauthorized`         | Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.    | Session expired. Please log in again.                  |
| `AUTH_FORBIDDEN`            |       403        | `errors:auth.forbidden`            | Bạn không có quyền thực hiện hành động này.            | You do not have permission to perform this action.     |
| `AUTH_ACCOUNT_LOCKED`       |       423        | `errors:auth.account_locked`       | Tài khoản tạm thời bị khóa. Vui lòng thử lại sau.      | Account is temporarily locked. Please try again later. |
| `DECK_NOT_FOUND`            |       404        | `errors:decks.not_found`           | Bộ từ không tồn tại hoặc đã bị xóa.                    | Deck not found or has been deleted.                    |
| `DECK_TITLE_REQUIRED`       |       400        | `errors:decks.title_required`      | Tên bộ từ không được để trống.                         | Deck title is required.                                |
| `DECK_PERMISSION_DENIED`    |       403        | `errors:decks.permission_denied`   | Bạn không có quyền chỉnh sửa bộ từ này.                | You do not have permission to edit this deck.          |
| `CARD_NOT_FOUND`            |       404        | `errors:cards.not_found`           | Thẻ từ vựng không tồn tại.                             | Vocabulary card not found.                             |
| `CARD_LIMIT_EXCEEDED`       |       403        | `errors:cards.limit_exceeded`      | Đã đạt giới hạn số lượng thẻ trong bộ từ.              | Card limit exceeded for this deck.                     |
| `PRACTICE_NO_CARDS_DUE`     |       400        | `errors:practice.no_cards_due`     | Không có thẻ nào cần ôn tập lúc này!                   | No cards due for review at this time!                  |
| `PRACTICE_SESSION_EXPIRED`  |       410        | `errors:practice.session_expired`  | Phiên luyện tập đã kết thúc.                           | Practice session has expired.                          |
| `AI_GENERATION_FAILED`      |       502        | `errors:ai.generation_failed`      | Trí tuệ nhân tạo tạm thời bận. Vui lòng thử lại sau.   | AI service is temporarily busy. Please try again.      |
| `AI_QUOTA_EXCEEDED`         |       429        | `errors:ai.quota_exceeded`         | Bạn đã đạt hạn mức tạo từ AI hôm nay.                  | Daily AI generation quota reached.                     |
| `NETWORK_ERROR` / Timeout   | 0 / ECONNABORTED | `errors:network.connection_failed` | Không thể kết nối đến máy chủ. Vui lòng kiểm tra mạng. | Unable to connect to server. Check your connection.    |
| `RATE_LIMIT_EXCEEDED`       |       429        | `errors:generic.rate_limited`      | Bạn đang thao tác quá nhanh. Vui lòng chậm lại.        | Too many requests. Please slow down.                   |
| _Unmapped / 500_            |       500        | `errors:generic.unexpected_error`  | Đã có lỗi xảy ra. Vui lòng thử lại sau.                | An unexpected error occurred. Please try again.        |

### 4.2. Error Interceptor Flow

1. Axios response interceptor catches rejection.
2. If `error.code === 'ERR_NETWORK'` or `error.message.includes('timeout')`, map to `errors:network.connection_failed`.
3. If `error.response?.data?.errorCode` exists and matches `errorRegistry[code]`, resolve key `errors:<domain>.<key>`.
4. If HTTP status 401, handle silent token refresh flow; if refresh fails or unauthorized, resolve `errors:auth.unauthorized`.
5. For all other unmapped errors or HTTP 500, fallback to `errors:generic.unexpected_error`.
6. Rate-limiter drops duplicate toast if identical key was dispatched < 2000ms ago.

---

## 5. User Scenarios & Acceptance Criteria

### User Scenario 1: Language Switcher UI Transformation

- **Given** a user is on any application page (`/decks`, `/study`, `/practice`, `/analytics`, `/settings`),
- **When** the user clicks the `LanguageSwitcher` in the header or settings and selects `Tiếng Việt`,
- **Then**:
  - All navigation items, headers, button labels, and table column titles switch to Vietnamese within 16ms without page reload.
  - Number counters (e.g., `12,450 XP`) reformat dynamically to `12.450 XP`.
  - Review timestamps (e.g., `08/22/2026`) reformat dynamically to `22/08/2026`.
  - Flashcard learning terms, phonetic IPA, and definitions remain 100% untranslated English.

### User Scenario 2: Standard SRS Review Rating Localization

- **Given** a user is reviewing flashcards in `/study/:deckId`,
- **When** the flashcard flips to the back definition,
- **Then**:
  - The rating buttons display:
    - Button 1: `"Lại"` (`vi`) / `"Again"` (`en`) with interval `< 10p` / `< 10m`
    - Button 2: `"Khó"` (`vi`) / `"Hard"` (`en`) with interval `1 ngày` / `1d`
    - Button 3: `"Tốt"` (`vi`) / `"Good"` (`en`) with interval `4 ngày` / `4d`
    - Button 4: `"Dễ"` (`vi`) / `"Easy"` (`en`) with interval `10 ngày` / `10d`
  - Keyboard shortcuts (`1`, `2`, `3`, `4`) trigger the expected SRS intervals identically regardless of locale.

### User Scenario 3: API Error Sanitization & Friendly Toast

- **Given** the backend database is unreachable or throws an unhandled `PrismaClientKnownRequestError` with table names and SQL constraints,
- **When** an API endpoint returns HTTP 500,
- **Then**:
  - The Axios error mapper intercepts the response.
  - The UI displays a friendly toast: `"Đã có lỗi xảy ra. Vui lòng thử lại sau."` (`vi`) or `"An unexpected error occurred. Please try again."` (`en`).
  - Zero SQL table names, Prisma codes, or stack traces leak into the toast or DOM.

### User Scenario 4: Error Toast Deduplication

- **Given** a user clicks a failing action button 5 times in 1 second during an offline state,
- **When** 5 rejected requests are received,
- **Then** exactly 1 toast notification is rendered to the user within the 2000ms window, avoiding layout thrashing.

---

## 6. Edge Cases & Handling Strategies

1. **Missing Translation Key in Active Locale**:
   - _Behavior_: `i18next` automatically falls back to `en` resource dictionary (`fallbackLng: 'en'`). If missing in both, returns key string gracefully without throwing runtime errors.
2. **Network Offline / Disconnection**:
   - _Behavior_: Interceptor detects `ERR_NETWORK` and resolves `errors:network.connection_failed` with deduplication.
3. **Vietnamese Diacritics & Font Rendering**:
   - _Behavior_: Tailwind font stack includes `system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif` supporting all Vietnamese Unicode diacritics (e.g. `ắ, ằ, ẳ, ẵ, ặ, ơ, ư`).
4. **Layout Text Expansion (+40%)**:
   - _Behavior_: Flexbox/Grid containers use `flex-wrap`, `min-w-0`, and responsive padding to ensure Vietnamese text does not overflow container bounds or clip action buttons.
5. **Extreme Numeric Quantities**:
   - _Behavior_: Formatters handle values from `0` to billions, negative numbers, and floating-point percentages without `NaN` outputs.
6. **Pluralization Boundary Conditions**:
   - _Behavior_: `count = 0` resolves to `_other` in English (`"0 cards"`), `count = 1` resolves to `_one` (`"1 card"`), `count > 1` resolves to `_other` (`"5 cards"`). Vietnamese resolves to single invariant key.

---

## 7. Success Criteria & Quality Verification

1. **Completeness**: 100% UI extraction across all 12 feature namespaces + `errors` (0 hardcoded English strings in UI chrome).
2. **UGC Integrity**: 100% preservation of flashcard words, definitions, IPA phonetics, and user notes.
3. **Error Code Coverage**: 100% of defined backend error codes mapped to localized entries in `errors.json`.
4. **Formatting Coverage**: All dates, numbers, XP, and relative times use `formatNumber`, `formatDate`, `formatRelativeTime` or `useLocaleFormat`.
5. **Automated Testing**: Comprehensive Vitest suite covering locale switching, error mapping, deduplication, and formatting utilities with 100% pass rate.
