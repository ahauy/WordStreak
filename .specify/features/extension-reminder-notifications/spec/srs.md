# Software Requirements Specification (SRS): Conditional Study Reminder Notifications (`US-ECO-06`)

- **Feature Slug**: `extension-reminder-notifications`
- **Version**: `1.0`
- **Date**: 2026-10-13
- **Upstream References**: [01-elicitation.md](../01-elicitation.md), [03-domain-model.md](../03-domain-model.md), [04-risk-scope.md](../04-risk-scope.md)

---

## Functional & Technical Requirements (`REQ-REMD-###`)

### REQ-REMD-001: Manifest Permission & Default Reminder Settings Contract
- **Category**: Extension Configuration & Contracts
- **Priority**: Must-Have (P0)
- **Status**: Approved
- **Description**: `apps/extension/manifest.json` SHALL declare the `"notifications"` permission, and `ExtensionSettingsPayload` / `DEFAULT_SETTINGS` SHALL define default reminder settings (`remindersEnabled: true`, `dailyReminderTime: "20:00"`, `quietHoursStart: "22:00"`, `quietHoursEnd: "07:00"`, `streakAtRiskReminderEnabled: true`).
- **Derived from**: `BR-REMD-001`, `ASM-REMD-001`
- **Business Rules**: `BR-REMD-001`
- **Non-Functional Requirements**: Backward-compatible merge with existing `ws_settings` in `chrome.storage.local`.
- **Dependencies**: None

---

### REQ-REMD-002: Persistent Reminder State (`ws_reminder_state`) & Local Date Rollover
- **Category**: State Persistence & Timezone Normalization
- **Priority**: Must-Have (P0)
- **Status**: Approved
- **Description**: The Extension SHALL persist `ReminderState` (`lastResetDate`, `sentTodayCount`, `dailyReminderSentToday`, `consecutiveIgnores`, `lastNotifiedAt`, `snoozedUntil`, `activeNotificationId`, `lastStudiedToday`) under `ws_reminder_state` in `chrome.storage.local`. When the local calendar date (`YYYY-MM-DD` in `summary.timezone` or browser local timezone) changes from `lastResetDate`, `normalizeReminderStateForDate` SHALL reset `sentTodayCount = 0` and `dailyReminderSentToday = false`, increment `consecutiveIgnores` by `1` if `activeNotificationId !== null`, and preserve `consecutiveIgnores` across days.
- **Derived from**: `BR-REMD-002`, `ASM-REMD-004`, `ASM-REMD-005`, `RISK-REMD-004`, `RISK-REMD-005`
- **Business Rules**: `BR-REMD-002`
- **Non-Functional Requirements**: Survives MV3 background service worker restarts (`CON-REMD-002`).
- **Dependencies**: `REQ-REMD-001`

---

### REQ-REMD-003: Quiet Hours Suppression (Including Overnight Wrap-Around)
- **Category**: Pure Rule Engine (`reminderRules.ts`)
- **Priority**: Must-Have (P0)
- **Status**: Approved
- **Description**: The pure helper `isWithinQuietHours(now, timezone, quietHoursStart, quietHoursEnd)` in `reminderRules.ts` SHALL suppress all notifications (`shouldNotify: false, reason: "QUIET_HOURS"`) whenever the current local time (`HH:mm` in `timezone`) falls within `[quietHoursStart, quietHoursEnd)`, supporting both same-day windows (`start < end`) and overnight wrap-around windows (`start > end`, such as `22:00` to `07:00`).
- **Derived from**: `BR-REMD-003`, `ASM-REMD-002`
- **Business Rules**: `BR-REMD-003`
- **Non-Functional Requirements**: Pure function execution `< 1ms`; zero notifications created during quiet hours.
- **Dependencies**: `REQ-REMD-001`

---

### REQ-REMD-004: Daily Notification Ceiling (3/Day) & Consecutive-Ignore Frequency Backoff (1/Day)
- **Category**: Pure Rule Engine (`reminderRules.ts`)
- **Priority**: Must-Have (P0)
- **Status**: Approved
- **Description**: `evaluateReminderRules` SHALL enforce a maximum of `3` notifications per local calendar day when `consecutiveIgnores < 3`, and automatically reduce the cap to `1` notification per local calendar day when `consecutiveIgnores >= 3` (`shouldNotify: false, reason: "DAILY_CAP_REACHED"` when `sentTodayCount >= effectiveDailyCap`).
- **Derived from**: `BR-REMD-004`, `ASM-REMD-004`
- **Business Rules**: `BR-REMD-004`
- **Non-Functional Requirements**: Pure deterministic evaluation (`CON-REMD-001`).
- **Dependencies**: `REQ-REMD-002`

---

### REQ-REMD-005: Intra-Day Cooldown (120 Minutes) & Active Snooze Suppression
- **Category**: Pure Rule Engine (`reminderRules.ts`)
- **Priority**: Must-Have (P0)
- **Status**: Approved
- **Description**: For non-snooze triggers (`triggerSource !== "SNOOZE_ALARM"`), `evaluateReminderRules` SHALL return `{ shouldNotify: false, reason: "SNOOZED_ACTIVE" }` if `state.snoozedUntil` is in the future (`> nowMs`), and `{ shouldNotify: false, reason: "COOLDOWN_ACTIVE" }` if `state.lastNotifiedAt` is less than 120 minutes (`7,200,000ms`) ago on the same day.
- **Derived from**: `BR-REMD-005`, `ASM-REMD-003`, `RISK-REMD-003`
- **Business Rules**: `BR-REMD-005`
- **Non-Functional Requirements**: Prevents notification bursts during frequent periodic or postMessage badge syncs.
- **Dependencies**: `REQ-REMD-002`

---

### REQ-REMD-006: Pure Conditional Study Evaluation (`evaluateReminderRules`)
- **Category**: Pure Rule Engine (`reminderRules.ts`)
- **Priority**: Must-Have (P0)
- **Status**: Approved
- **Description**: Given `summary`, `settings`, `state`, `isAuthenticated`, `triggerSource` (`"DAILY_ALARM" | "SNOOZE_ALARM" | "PERIODIC_SYNC"`), and `now`, `evaluateReminderRules` SHALL return `shouldNotify: true` only when authenticated, `remindersEnabled` is true, outside quiet hours, below `effectiveDailyCap`, outside cooldown/active snooze (for non-snooze triggers), and an actionable condition holds:
  1. `SNOOZE_ALARM` with `(streakAtRisk && streakAtRiskReminderEnabled) || dueCount > 0 || !goalReached`;
  2. `DAILY_ALARM` (or catch-up `PERIODIC_SYNC` at/after `dailyReminderTime` when `dailyReminderSentToday === false`) with `(streakAtRisk && streakAtRiskReminderEnabled) || dueCount > 0 || !goalReached`; or
  3. `PERIODIC_SYNC` with `streakAtRisk === true && streakAtRiskReminderEnabled === true`.
  It SHALL select `notificationType` in priority order: `"STREAK_AT_RISK"` → `"DUE_CARDS"` → `"DAILY_GOAL"`.
- **Derived from**: `BR-REMD-006`, `RISK-REMD-002`
- **Business Rules**: `BR-REMD-006`
- **Non-Functional Requirements**: Execution time `< 5ms`; 100% pure function with zero Chrome API side effects.
- **Dependencies**: `REQ-REMD-002`, `REQ-REMD-003`, `REQ-REMD-004`, `REQ-REMD-005`

---

### REQ-REMD-007: Scheduled `daily-reminder` Alarm & One-Shot `ws-reminder-snooze` Alarm
- **Category**: Background Scheduling (`chrome.alarms`)
- **Priority**: Must-Have (P0)
- **Status**: Approved
- **Description**: The Extension SHALL schedule a recurring alarm `"daily-reminder"` (`periodInMinutes: 1440`) aligned to the next occurrence of `settings.dailyReminderTime` (`HH:mm` in local timezone, clamped `>= now + 60_000ms`) on `onInstalled`, `onStartup`, `LOGIN`, `SET_AUTH_TOKEN`, and `UPDATE_SETTINGS` (clearing it when `remindersEnabled === false` or on `LOGOUT`/`401`). When the learner clicks **"Để sau" / "Snooze"**, the Extension SHALL schedule a one-shot alarm `"ws-reminder-snooze"` with `delayInMinutes: 60`.
- **Derived from**: `BR-REMD-007`, `ASM-REMD-001`, `ASM-REMD-003`
- **Business Rules**: `BR-REMD-007`
- **Non-Functional Requirements**: Complies with Chrome MV3 minimum 1-minute alarm delay floor.
- **Dependencies**: `REQ-REMD-001`

---

### REQ-REMD-008: Consecutive Ignore Tracking & Engagement/Study Backoff Reset
- **Category**: Notification Lifecycle & State Management
- **Priority**: Must-Have (P0)
- **Status**: Approved
- **Description**: The Extension SHALL increment `consecutiveIgnores` by `1` whenever an active reminder notification (`activeNotificationId !== null`) is closed (`chrome.notifications.onClosed`) or superseded without a click/button action. The Extension SHALL reset `consecutiveIgnores = 0` (clearing `activeNotificationId` before calling `chrome.notifications.clear` to prevent false `onClosed` increments) whenever the learner clicks the notification body, clicks **"Học ngay"** (button `0`), clicks **"Để sau"** (button `1`), or completes study activity on the Web App (`WORDSTREAK_REVIEW_SYNC` / `summary.studiedToday` increases or `dueCount === 0 && goalReached`).
- **Derived from**: `BR-REMD-008`, `ASM-REMD-005`, `RISK-REMD-001`, `RISK-REMD-005`
- **Business Rules**: `BR-REMD-008`
- **Non-Functional Requirements**: Race-free state update before `chrome.notifications.clear`.
- **Dependencies**: `REQ-REMD-002`, `REQ-REMD-004`

---

### REQ-REMD-009: Smart `/review` Tab Navigation on "Học ngay" / Notification Click
- **Category**: Browser Tab Management (`chrome.tabs`)
- **Priority**: Must-Have (P0)
- **Status**: Approved
- **Description**: When the learner clicks the reminder notification body (`chrome.notifications.onClicked`) or button index `0` (**"Học ngay" / "Study Now"** in `chrome.notifications.onButtonClicked`), the Extension SHALL query open tabs matching `${WEB_APP_URL}/*`; if found, it SHALL focus the tab's window and activate/navigate that tab to `${WEB_APP_URL}/review`; otherwise, it SHALL create a new active tab at `${WEB_APP_URL}/review`, and clear the notification.
- **Derived from**: `BR-REMD-009`, `ASM-REMD-006`
- **Business Rules**: `BR-REMD-009`
- **Non-Functional Requirements**: Action handling latency `< 150ms`; target URL hardcoded to `${WEB_APP_URL}/review`.
- **Dependencies**: `REQ-REMD-008`

---

### REQ-REMD-010: Bilingual EN/VI Notification Localization via `preferredLanguage`
- **Category**: Internationalization (i18n)
- **Priority**: Must-Have (P0)
- **Status**: Approved
- **Description**: `ExtensionUserSummary` SHALL include `preferredLanguage?: AppLanguage` (`"vi" | "en"`), and `buildReminderNotificationCopy(notificationType, summary, lang)` SHALL generate localized title, message, and 2 action button labels (`["Học ngay", "Để sau"]` for `"vi"`, `["Study Now", "Snooze"]` for `"en"`) for `"STREAK_AT_RISK"`, `"DUE_CARDS"`, and `"DAILY_GOAL"` notifications, resolving `lang` via `user?.preferredLanguage ?? settings?.preferredLanguage ?? browserUiLanguage ?? "vi"`.
- **Derived from**: `BR-REMD-010`, `ASM-REMD-007`
- **Business Rules**: `BR-REMD-010`
- **Non-Functional Requirements**: 100% localized EN/VI copy with zero hardcoded untranslated strings.
- **Dependencies**: `REQ-REMD-006`
