# User Stories & Acceptance Criteria: Complete UI Localization & Error Mapping (US-I18N-02)

- **Feature Slug**: `i18n-ui-localization`
- **Backlog Reference**: `US-I18N-02` (EPIC 10: Multi-language & Internationalization)
- **Target Release**: WordStreak MVP v1.0
- **Author**: Lead Business Analyst
- **Status**: Draft

---

## User Stories

### US-I18N-02-01: Full UI Shell Localization across all Feature Screens

**As a** Vietnamese ESL Learner (`Persona-Learner`)  
**I want to** experience a fully localized Vietnamese user interface across all screens (Dashboard, Decks, Cards, Practice Quizzes, Speech Assessment, Gamification, Analytics, and Settings)  
**So that** I can study vocabulary efficiently without cognitive friction caused by untranslated English system chrome.

**Traces to**: `REQ-I18N-001`, `REQ-I18N-010`, `REQ-I18N-011`, `REQ-I18N-012`, `REQ-I18N-013`, `REQ-I18N-015`

**Acceptance Criteria**:

- **Scenario 1 (Happy Path - Vietnamese UI Navigation)**
  - **Given** the user has selected `'vi'` (Vietnamese) as the active language
  - **When** the user navigates through Dashboard, Decks, Practice Quiz modes, Speech Pronunciation, and Analytics
  - **Then** 100% of visible system headers, button labels, tabs, filter chips, chart axes, and modal dialogs are displayed in Vietnamese
  - **And** no English fallback strings or raw dot-notation keys (e.g. `"dashboard.title"`) are visible
  - **And** all interactive icon buttons have localized Vietnamese `aria-label` attributes (e.g. `aria-label="Đóng cửa sổ"`).
- **Scenario 2 (Edge Case - Vietnamese Text Length Expansion & Layout Invariance)**
  - **Given** a button or table header containing a Vietnamese string that is 40% longer than its English counterpart (e.g. `"Bắt đầu phiên ôn tập hàng ngày"` vs `"Start Daily Review"`)
  - **When** the page renders on both mobile (375px) and desktop (1440px) viewports
  - **Then** the container layout flex-wraps or truncates gracefully with a tooltip
  - **And** no horizontal page scrolling or visual element clipping occurs (`CLS = 0`).

---

### US-I18N-02-02: Unified Error Code Toast & Inline Validation Localization

**As a** WordStreak Learner (`Persona-Learner`)  
**I want to** receive friendly, localized toast notifications and form validation errors when operations fail  
**So that** I clearly understand what went wrong and how to fix it without being intimidated by technical exception stack traces.

**Traces to**: `REQ-I18N-002`, `REQ-I18N-003`, `REQ-I18N-014`

**Acceptance Criteria**:

- **Scenario 1 (Happy Path - Mapped Error Toast in Vietnamese)**
  - **Given** the user is in Vietnamese locale (`vi`)
  - **When** an API call fails with backend error code `AUTH_INVALID_CREDENTIALS` (HTTP 401)
  - **Then** a toast notification appears with title `"Đăng nhập thất bại"` and message `"Email hoặc mật khẩu không chính xác."`
  - **And** no raw HTTP status code (`401`) or English backend message (`"Unauthorized"`) is displayed.
- **Scenario 2 (Edge Case - Unregistered / 500 Internal Error Suppression)**
  - **Given** the user triggers an action that causes a 500 Internal Server Error or returns an unmapped error code `DATABASE_TIMEOUT_EXCEPTION`
  - **When** the Axios interceptor processes the failure
  - **Then** the UI displays the friendly generic message `"Đã có lỗi xảy ra. Vui lòng thử lại sau."`
  - **And** database table names, SQL queries, and server stack traces are strictly suppressed from the toast and DOM.
- **Scenario 3 (Edge Case - Network Offline Disconnect & Deduplication)**
  - **Given** the user loses internet connection
  - **When** 4 background API requests fail simultaneously within a 1-second window
  - **Then** only 1 toast is displayed with `"Không thể kết nối đến máy chủ. Vui lòng kiểm tra mạng của bạn."` due to the 2000ms deduplication rule (`BR-I18N-009`).

---

### US-I18N-02-03: Dynamic Locale-Aware Date, Number & Plural Formatting

**As an** International English Learner or Vietnamese Learner  
**I want to** see numbers, XP values, timestamps, and card counts formatted according to my language's cultural and grammatical standards  
**So that** numeric information and dates are natural, accurate, and free of grammatical bugs like `"1 cards"`.

**Traces to**: `REQ-I18N-004`, `REQ-I18N-005`, `REQ-I18N-006`, `REQ-I18N-007`

**Acceptance Criteria**:

- **Scenario 1 (Happy Path - English vs Vietnamese Number & Date Formatting)**
  - **Given** a learner has earned `10000` XP and reviewed a deck on August 22, 2026
  - **When** viewing the profile in English (`en`), the XP displays as `"10,000 XP"` and the date as `"Aug 22, 2026"`
  - **When** the learner switches language to Vietnamese (`vi`), the XP instantaneously updates to `"10.000 XP"` and the date to `"22 thg 8, 2026"`.
- **Scenario 2 (Happy Path - Grammatical Pluralization)**
  - **Given** a deck containing `1` card
  - **When** viewed in English (`en`), the badge renders `"1 card"` (using `_one`)
  - **When** the deck contains `15` cards, the badge renders `"15 cards"` (using `_other`)
  - **When** viewed in Vietnamese (`vi`), it renders `"1 thẻ"` and `"15 thẻ"` respectively.
- **Scenario 3 (Edge Case - Relative Timestamp Transition)**
  - **Given** an activity logged 5 minutes ago
  - **When** rendered in Vietnamese, it displays `"5 phút trước"`
  - **When** rendered in English, it displays `"5 minutes ago"` via `Intl.RelativeTimeFormat`.

---

### US-I18N-02-04: Strict UI Shell Isolation for Flashcard & UGC Content

**As a** Flashcard Learner (`Persona-Learner`)  
**I want to** study English vocabulary cards inside a Vietnamese UI shell while ensuring the English words, definitions, and IPA phonetic symbols are never altered  
**So that** my vocabulary study material remains 100% accurate and untranslated.

**Traces to**: `REQ-I18N-008`, `REQ-I18N-009`

**Acceptance Criteria**:

- **Scenario 1 (Happy Path - English Vocabulary Study in Vietnamese UI Shell)**
  - **Given** a deck containing the English card `"serendipity"` with IPA `"/ˌserənˈdɪpəti/"` and definition `"the occurrence of events by chance in a happy way"`
  - **When** studying this card while the application locale is set to Vietnamese (`vi`)
  - **Then** the front term `"serendipity"`, IPA `"/ˌserənˈdɪpəti/"`, and back definition remain 100% in English exactly as authored
  - **And** the SRS rating action buttons are displayed in Vietnamese: `"Lại (< 10p)"`, `"Khó (1 ngày)"`, `"Tốt (3 ngày)"`, `"Dễ (7 ngày)"`
  - **And** header progress renders in Vietnamese (e.g. `"Thẻ 1 trên 10"`).
- **Scenario 2 (Edge Case - UGC Containing Special HTML / Markdown Characters)**
  - **Given** a user card definition containing characters like `<br>`, `{}` or quotes
  - **When** the flashcard component renders
  - **Then** the text is safely displayed as raw text without triggering i18next variable interpolation errors or XSS injections.
