# Feature Specification: Conditional Study Reminder Notifications (`US-ECO-06`)

**Feature Branch**: `feat/extension-reminder-notifications`  
**Feature Slug**: `extension-reminder-notifications`  
**Backlog Reference**: `US-ECO-06` (EPIC-06 / EPIC-09: Browser Extension & Ecosystem — Smart Reminders & Toolbar Badge)  
**Created**: 2026-10-13  
**Status**: Approved (Phase 2 - Specify)  
**Domain Baseline**: [`baseline.md`](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/.specify/features/extension-reminder-notifications/baseline.md) (`SIGNED-OFF v1.0`)  
**Formal Requirements & User Stories**: [`spec/srs.md`](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/.specify/features/extension-reminder-notifications/spec/srs.md), [`spec/user-stories.md`](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/.specify/features/extension-reminder-notifications/spec/user-stories.md)

---

## 1. Executive Summary & Value Proposition

While `US-ECO-05` provides a passive due-card badge on the WordStreak Chrome Extension toolbar icon, busy learners often browse with the extension icon hidden in the overflow menu or fail to notice the badge when their evening study window arrives or when their multi-day streak is at risk (`streakAtRisk = true`). Conversely, naive unconditional desktop notifications disturb users during late-night quiet hours or spam learners who are temporarily unavailable, leading to extension uninstalls.

This specification defines the **Conditional Study Reminder Notification Engine (`US-ECO-06`)** for the WordStreak Chrome Extension (Manifest V3):
1. **Pure Conditional Rule Engine (`reminderRules.ts`)**: Evaluates `ReviewSummaryDto` (`dueCount`, `goalReached`, `streakAtRisk`), `ExtensionSettingsPayload` reminder rules, and persistent `ReminderState` (`ws_reminder_state`) with zero side effects (`< 5ms`).
2. **Quiet Hours & Anti-Spam Guardrails**: Enforces quiet hours (`22:00–07:00` default, supporting both overnight wrap-around and same-day windows), a 120-minute (`2h`) intra-day cooldown between automatic notifications, a daily ceiling of `3` notifications/day, and automatic frequency backoff to `1` notification/day after `3` consecutive ignored notifications (`consecutiveIgnores >= 3`).
3. **Scheduled Daily & Snooze Alarms (`chrome.alarms`)**: Schedules a recurring `"daily-reminder"` alarm (`periodInMinutes: 1440`) aligned to `settings.dailyReminderTime` (`"20:00"` default) with laptop-sleep catch-up on periodic sync, plus a one-shot `"ws-reminder-snooze"` alarm (`delayInMinutes: 60`) when the learner clicks **"Để sau" / "Snooze"**.
4. **Actionable Bilingual (EN/VI) OS Notifications (`chrome.notifications`)**: Renders native notifications for `"STREAK_AT_RISK"`, `"DUE_CARDS"`, and `"DAILY_GOAL"` in Vietnamese or English (`preferredLanguage`) with two action buttons: **"Học ngay" / "Study Now"** (focuses an existing WordStreak tab or opens `${WEB_APP_URL}/review`) and **"Để sau" / "Snooze"** (snoozes for 60 minutes), while resetting `consecutiveIgnores = 0` upon any user click or Web App review completion.

---

## 2. User Scenarios & Testing *(mandatory)*

### User Story 1 — Conditional Study Reminder Notifications with Quiet Hours, Snooze & Frequency Backoff (`US-ECO-06`, Priority: P1 - MVP)

**As an** Authenticated Learner with the WordStreak Chrome Extension installed  
**I want to** receive intelligent, localized (EN/VI) system notifications with **Học ngay (Study Now)** and **Để sau (Snooze)** buttons when I have due flashcards, an incomplete daily goal at my reminder time, or an at-risk streak — while strictly respecting my quiet hours, a 3-notifications/day ceiling, and automatic frequency reduction (max 1/day after 3 consecutive ignores)  
**So that** I am prompted at the right moment to review on `/review` and protect my study streak without being interrupted during quiet hours or spammed when I am busy.

**Why this priority**: Delivers the proactive retention and streak-protection engine of the Chrome Extension while guaranteeing an anti-spam user experience (`< 1%` uninstall rate) and preparing the settings/state foundation for `US-ECO-07` (Options Page UI) and `US-ECO-08` (In-Popup Micro-Review).

**Independent Test**:
- Run the Vitest unit test suites (`reminderRules.spec.ts`, `reminder-manager.spec.ts`, `storage.spec.ts`, `api-client.spec.ts`) or load the unpacked Extension in Chrome.
- Verify that `"daily-reminder"` and periodic `streakAtRisk` checks trigger localized EN/VI notifications only when eligible, suppress during `22:00–07:00` quiet hours, enforce the 120-minute cooldown and `3/day` cap (`1/day` when `consecutiveIgnores >= 3`), navigate/focus `${WEB_APP_URL}/review` on **"Học ngay"**, schedule a 60-minute `"ws-reminder-snooze"` alarm on **"Để sau"**, and reset `consecutiveIgnores = 0` on user interaction or Web App review completion.

**Acceptance Scenarios**:

1. **Scenario 1 (Scheduled `daily-reminder` alarm fires localized notification with "Học ngay" / "Để sau" buttons — `REQ-REMD-001`, `REQ-REMD-006`, `REQ-REMD-007`, `REQ-REMD-010`)**:
   - **Given** the learner is authenticated with `user.preferredLanguage = "vi"` (or `"en"`), `settings.remindersEnabled = true`, `dailyReminderTime = "20:00"`, and quiet hours `"22:00"`–`"07:00"`,
   - **And** `ReviewSummaryDto` reports `dueCount: 12`, `goalReached: false`, `streakAtRisk: false`, and `ws_reminder_state` has `sentTodayCount: 0, consecutiveIgnores: 0`,
   - **When** the `"daily-reminder"` alarm fires at `20:00` local time,
   - **Then** `evaluateReminderRules` returns `{ shouldNotify: true, reason: "DAILY_SCHEDULED", notificationType: "DUE_CARDS" }`,
   - **And** the Extension creates a system notification in Vietnamese (or English when `preferredLanguage = "en"`) displaying `12` due cards and two action buttons: **"Học ngay"** and **"Để sau"** (**"Study Now"** and **"Snooze"** in English),
   - **And** updates `ws_reminder_state` in `chrome.storage.local` with `sentTodayCount: 1` and `dailyReminderSentToday: true`.

2. **Scenario 2 (Clicking "Học ngay" or notification body opens/focuses `/review` and resets `consecutiveIgnores` — `REQ-REMD-008`, `REQ-REMD-009`)**:
   - **Given** a WordStreak study reminder notification is currently displayed (`activeNotificationId = "ws-study-reminder"`) and `consecutiveIgnores` was `2`,
   - **When** the learner clicks button index `0` (**"Học ngay"** / **"Study Now"**) or clicks the notification body,
   - **Then** the Extension sets `consecutiveIgnores: 0` and `activeNotificationId: null` in `ws_reminder_state` before clearing the notification,
   - **And** if an existing `${WEB_APP_URL}/*` tab is open, focuses its window and navigates that tab to `${WEB_APP_URL}/review`; otherwise opens a new active tab at `${WEB_APP_URL}/review`.

3. **Scenario 3 (Clicking "Để sau" / Snooze schedules a one-shot 60-minute alarm and resets `consecutiveIgnores` — `REQ-REMD-005`, `REQ-REMD-007`, `REQ-REMD-008`)**:
   - **Given** a WordStreak study reminder notification is currently displayed at `19:30` local time,
   - **When** the learner clicks button index `1` (**"Để sau"** / **"Snooze"**),
   - **Then** the Extension clears the notification, sets `consecutiveIgnores: 0`, `activeNotificationId: null`, and `snoozedUntil: now + 60m` in `ws_reminder_state`,
   - **And** schedules the one-shot alarm `"ws-reminder-snooze"` with `delayInMinutes: 60`,
   - **And** when `"ws-reminder-snooze"` fires at `20:30` (still outside quiet hours and `< 3` sent today) with `dueCount > 0`, the Extension displays the reminder notification.

4. **Scenario 4 (Quiet hours `22:00–07:00` overnight wrap-around strictly suppress notifications — `REQ-REMD-003`)**:
   - **Given** `settings.quietHoursStart = "22:00"` and `settings.quietHoursEnd = "07:00"`,
   - **When** `evaluateReminderRules` is invoked at `22:15` or `06:30` local time (even if `dueCount > 0`, `streakAtRisk === true`, or `"ws-reminder-snooze"` just fired),
   - **Then** `evaluateReminderRules` returns `{ shouldNotify: false, reason: "QUIET_HOURS" }` and no system notification is created.

5. **Scenario 5 (Daily ceiling of 3 notifications/day and 120-minute intra-day cooldown — `REQ-REMD-004`, `REQ-REMD-005`)**:
   - **Given** `consecutiveIgnores < 3` (effective daily cap is `3`),
   - **When** a notification was already sent 45 minutes ago (`now - lastNotifiedAt < 120 minutes`) and a periodic summary sync runs,
   - **Then** `evaluateReminderRules` returns `{ shouldNotify: false, reason: "COOLDOWN_ACTIVE" }`,
   - **And** once `sentTodayCount` reaches `3` on the same local calendar day (`YYYY-MM-DD`), any further trigger (including `"ws-reminder-snooze"`) returns `{ shouldNotify: false, reason: "DAILY_CAP_REACHED" }` until local midnight rolls over.

6. **Scenario 6 (Frequency backoff after 3 consecutive ignores `consecutiveIgnores >= 3` → max 1/day & recovery on study/interaction — `REQ-REMD-002`, `REQ-REMD-004`, `REQ-REMD-008`)**:
   - **Given** the learner has dismissed or ignored 3 notifications in a row without clicking **"Học ngay"**, clicking **"Để sau"**, or studying (`consecutiveIgnores === 3`),
   - **When** a new local calendar day begins (`sentTodayCount` resets to `0`, `consecutiveIgnores` remains `3`) and the first eligible reminder of the day fires (`sentTodayCount` becomes `1`),
   - **Then** any subsequent reminder check on that same day returns `{ shouldNotify: false, reason: "DAILY_CAP_REACHED", effectiveDailyCap: 1 }`,
   - **And** as soon as the learner completes a review on the Web App (`WORDSTREAK_REVIEW_SYNC` / `studiedToday` increases) or clicks **"Học ngay"** / **"Để sau"**, `consecutiveIgnores` resets to `0` and the normal `3/day` cap is restored.

7. **Scenario 7 (Laptop sleep / browser closed at `dailyReminderTime` catches up on next sync outside quiet hours — `REQ-REMD-006`)**:
   - **Given** `dailyReminderTime = "20:00"`, the browser was closed at `20:00` (`dailyReminderSentToday === false`), and `dueCount: 8`,
   - **When** the learner opens the browser at `20:40` (before `22:00` quiet hours) and the startup summary sync completes,
   - **Then** `evaluateReminderRules` triggers the catch-up daily reminder (`reason: "DAILY_SCHEDULED"`, `markDailyReminderSent: true`) and displays the notification once.

8. **Scenario 8 (No notification when study goal is met and no cards are due, or when logged out — `REQ-REMD-006`, `REQ-REMD-007`)**:
   - **Given** `dueCount === 0`, `goalReached === true`, and `streakAtRisk === false` (or the user logs out / `ws_token === null`),
   - **When** `"daily-reminder"` or a periodic sync runs,
   - **Then** `evaluateReminderRules` returns `shouldNotify: false` (`reason: "NO_STUDY_NEEDED"` or `"UNAUTHENTICATED"`), and on logout any active notification and snooze alarm are cleared.

---

## 3. Edge Cases & Boundary Matrix

| Edge Case ID | Boundary / Trigger Condition | Expected System Behavior | Business Rule |
| :--- | :--- | :--- | :--- |
| **EC-REMD-01** | **Laptop Asleep or Browser Closed at `20:00` (`dailyReminderTime`)**: Browser opens at `20:45` vs. `22:30` | At `20:45` (outside quiet hours, `dailyReminderSentToday === false`), Step 9 of `BR-REMD-006` fires the catch-up daily reminder once and marks `dailyReminderSentToday = true`. At `22:30` (inside `22:00–07:00` quiet hours), Step 3 (`QUIET_HOURS`) suppresses the notification. | `BR-REMD-003`, `BR-REMD-006`, `RISK-REMD-002` |
| **EC-REMD-02** | **Snooze Alarm Fires Inside Quiet Hours**: Learner clicks **"Để sau"** at `21:15`; `"ws-reminder-snooze"` fires at `22:15` | `evaluateReminderRules` evaluates Step 3 (`QUIET_HOURS`) before Step 8 (`SNOOZE_ALARM`), returns `{ shouldNotify: false, reason: "QUIET_HOURS" }`, and clears `snoozedUntil`. | `BR-REMD-003`, `BR-REMD-005`, `BR-REMD-006` |
| **EC-REMD-03** | **Race Condition Between `onClicked`/`onButtonClicked` and `onClosed`**: Calling `chrome.notifications.clear(id)` after a click triggers `chrome.notifications.onClosed` | `onClicked` and `onButtonClicked` persist `activeNotificationId: null` and `consecutiveIgnores: 0` in `ws_reminder_state` *before* calling `chrome.notifications.clear(id)`. When `onClosed` fires, it sees `state.activeNotificationId !== notificationId` and does not increment `consecutiveIgnores`. | `BR-REMD-008`, `RISK-REMD-001` |
| **EC-REMD-04** | **Unclicked Notification Superseded by New Notification or Midnight Rollover**: `activeNotificationId !== null` when a new day starts or a new notification is evaluated | `normalizeReminderStateForDate` (on date rollover) or `reminderManager` (before creating a replacement notification) increments `consecutiveIgnores += 1` and clears `activeNotificationId = null` so ignored OS toasts are accurately counted. | `BR-REMD-002`, `BR-REMD-008`, `RISK-REMD-005` |
| **EC-REMD-05** | **Learner Studies Directly on Web App Without Clicking Notification**: `WORDSTREAK_REVIEW_SYNC` / summary refresh shows `studiedToday > lastStudiedToday` or `dueCount === 0 && goalReached` | Resets `consecutiveIgnores = 0` and updates `lastStudiedToday = summary.studiedToday`. If `dueCount === 0 && goalReached`, clears any active notification (`activeNotificationId = null` first) and clears `"ws-reminder-snooze"`. | `BR-REMD-008` |
| **EC-REMD-06** | **Logout or `401 Unauthorized` While Notification or Snooze Alarm is Active**: User logs out on Web App / Popup or token expires | Clears any active notification (`chrome.notifications.clear`), clears `"daily-reminder"` and `"ws-reminder-snooze"` alarms, and resets `activeNotificationId: null, snoozedUntil: null` in `ws_reminder_state`. | `BR-REMD-007`, `BR-REMD-008` |
| **EC-REMD-07** | **Quiet Hours Same-Day Window vs. Equal Start/End**: `01:00–06:00` (`start < end`) vs. `00:00–00:00` (`start === end`) | Same-day window suppresses when `start <= current < end`; equal `start === end` disables quiet hours (`isWithinQuietHours === false`). | `BR-REMD-003`, `ASM-REMD-002` |
| **EC-REMD-08** | **Learner Timezone Rollover (`Asia/Ho_Chi_Minh` vs. UTC)**: Local time is `00:30` ICT (`17:30` UTC previous day) | `normalizeReminderStateForDate` formats `YYYY-MM-DD` in `summary.timezone || browserTimezone || "UTC"`, resetting `sentTodayCount` at local midnight rather than UTC midnight. | `BR-REMD-002`, `RISK-REMD-004` |

---

## 4. Requirements *(mandatory)*

### Functional & Technical Requirements

- **REQ-REMD-001 (Manifest Permission & Default Reminder Settings Contract)**:
  - `apps/extension/manifest.json` SHALL declare the `"notifications"` permission, and `ExtensionSettingsPayload` / `DEFAULT_SETTINGS` SHALL define default reminder settings (`remindersEnabled: true`, `dailyReminderTime: "20:00"`, `quietHoursStart: "22:00"`, `quietHoursEnd: "07:00"`, `streakAtRiskReminderEnabled: true`, and optional `preferredLanguage?: AppLanguage`).
  - *Traces to*: `BR-REMD-001`, `ASM-REMD-001`.

- **REQ-REMD-002 (Persistent Reminder State `ws_reminder_state` & Local Date Rollover)**:
  - The Extension SHALL persist `ReminderState` (`lastResetDate`, `sentTodayCount`, `dailyReminderSentToday`, `consecutiveIgnores`, `lastNotifiedAt`, `snoozedUntil`, `activeNotificationId`, `lastStudiedToday`) under `ws_reminder_state` in `chrome.storage.local`. When the local calendar date (`YYYY-MM-DD` in `summary.timezone` or browser local timezone) changes from `lastResetDate`, `normalizeReminderStateForDate` SHALL reset `sentTodayCount = 0` and `dailyReminderSentToday = false`, increment `consecutiveIgnores` by `1` if `activeNotificationId !== null` (and clear `activeNotificationId = null`), and preserve `consecutiveIgnores` across days.
  - *Traces to*: `BR-REMD-002`, `ASM-REMD-004`, `ASM-REMD-005`, `RISK-REMD-004`, `RISK-REMD-005`.

- **REQ-REMD-003 (Quiet Hours Suppression Including Overnight Wrap-Around)**:
  - The pure helper `isWithinQuietHours(now, timezone, quietHoursStart, quietHoursEnd)` in `reminderRules.ts` SHALL suppress all notifications (`shouldNotify: false, reason: "QUIET_HOURS"`) whenever the current local time (`HH:mm` in `timezone`) falls within `[quietHoursStart, quietHoursEnd)`, supporting both same-day windows (`start < end`), overnight wrap-around windows (`start > end`, such as `22:00` to `07:00`), and disabled quiet hours (`start === end`).
  - *Traces to*: `BR-REMD-003`, `ASM-REMD-002`.

- **REQ-REMD-004 (Daily Notification Ceiling 3/Day & Consecutive-Ignore Frequency Backoff 1/Day)**:
  - `evaluateReminderRules` SHALL enforce a maximum of `3` notifications per local calendar day when `consecutiveIgnores < 3`, and automatically reduce the cap to `1` notification per local calendar day when `consecutiveIgnores >= 3` (`shouldNotify: false, reason: "DAILY_CAP_REACHED"` when `sentTodayCount >= effectiveDailyCap`).
  - *Traces to*: `BR-REMD-004`, `ASM-REMD-004`.

- **REQ-REMD-005 (Intra-Day Cooldown 120 Minutes & Active Snooze Suppression)**:
  - For non-snooze triggers (`triggerSource !== "SNOOZE_ALARM"`), `evaluateReminderRules` SHALL return `{ shouldNotify: false, reason: "SNOOZED_ACTIVE" }` if `state.snoozedUntil` is in the future (`> nowMs`), and `{ shouldNotify: false, reason: "COOLDOWN_ACTIVE" }` if `state.lastNotifiedAt` is less than 120 minutes (`7,200,000ms`) ago on the same day.
  - *Traces to*: `BR-REMD-005`, `ASM-REMD-003`, `RISK-REMD-003`.

- **REQ-REMD-006 (Pure Conditional Study Evaluation `evaluateReminderRules`)**:
  - Given `summary`, `settings`, `state`, `isAuthenticated`, `triggerSource` (`"DAILY_ALARM" | "SNOOZE_ALARM" | "PERIODIC_SYNC"`), and `now`, `evaluateReminderRules` SHALL return `shouldNotify: true` only when authenticated, `remindersEnabled` is true, outside quiet hours, below `effectiveDailyCap`, outside cooldown/active snooze (for non-snooze triggers), and an actionable study condition holds:
    1. `SNOOZE_ALARM` with `(streakAtRisk && streakAtRiskReminderEnabled) || dueCount > 0 || !goalReached`;
    2. `DAILY_ALARM` (or catch-up `PERIODIC_SYNC` at/after `dailyReminderTime` when `dailyReminderSentToday === false`) with `(streakAtRisk && streakAtRiskReminderEnabled) || dueCount > 0 || !goalReached`; or
    3. `PERIODIC_SYNC` with `streakAtRisk === true && streakAtRiskReminderEnabled === true`.
  - It SHALL select `notificationType` in priority order: `"STREAK_AT_RISK"` → `"DUE_CARDS"` → `"DAILY_GOAL"`.
  - *Traces to*: `BR-REMD-006`, `RISK-REMD-002`.

- **REQ-REMD-007 (Scheduled `daily-reminder` Alarm & One-Shot `ws-reminder-snooze` Alarm)**:
  - The Extension SHALL schedule a recurring alarm `"daily-reminder"` (`periodInMinutes: 1440`) aligned to the next occurrence of `settings.dailyReminderTime` (`HH:mm` in local timezone, clamped `>= now + 60_000ms`) on `onInstalled`, `onStartup`, `LOGIN`, `SET_AUTH_TOKEN`, and `UPDATE_SETTINGS` (clearing it when `remindersEnabled === false` or on `LOGOUT`/`401`). When the learner clicks **"Để sau" / "Snooze"**, the Extension SHALL schedule a one-shot alarm `"ws-reminder-snooze"` with `delayInMinutes: 60`.
  - *Traces to*: `BR-REMD-007`, `ASM-REMD-001`, `ASM-REMD-003`.

- **REQ-REMD-008 (Consecutive Ignore Tracking & Engagement/Study Backoff Reset)**:
  - The Extension SHALL increment `consecutiveIgnores` by `1` whenever an active reminder notification (`activeNotificationId !== null`) is closed (`chrome.notifications.onClosed`) or superseded without a click/button action. The Extension SHALL reset `consecutiveIgnores = 0` (clearing `activeNotificationId` before calling `chrome.notifications.clear` to prevent false `onClosed` increments) whenever the learner clicks the notification body, clicks **"Học ngay"** (button `0`), clicks **"Để sau"** (button `1`), or completes study activity on the Web App (`WORDSTREAK_REVIEW_SYNC` / `summary.studiedToday` increases or `dueCount === 0 && goalReached`).
  - *Traces to*: `BR-REMD-008`, `ASM-REMD-005`, `RISK-REMD-001`, `RISK-REMD-005`.

- **REQ-REMD-009 (Smart `/review` Tab Navigation on "Học ngay" / Notification Click)**:
  - When the learner clicks the reminder notification body (`chrome.notifications.onClicked`) or button index `0` (**"Học ngay" / "Study Now"** in `chrome.notifications.onButtonClicked`), the Extension SHALL query open tabs matching `${WEB_APP_URL}/*`; if found, it SHALL focus the tab's window and activate/navigate that tab to `${WEB_APP_URL}/review`; otherwise, it SHALL create a new active tab at `${WEB_APP_URL}/review`, and clear the notification.
  - *Traces to*: `BR-REMD-009`, `ASM-REMD-006`.

- **REQ-REMD-010 (Bilingual EN/VI Notification Localization via `preferredLanguage`)**:
  - `ExtensionUserSummary` SHALL include `preferredLanguage?: AppLanguage` (`"vi" | "en"`), and `buildReminderNotificationCopy(notificationType, summary, lang)` SHALL generate localized title, message, and 2 action button labels (`["Học ngay", "Để sau"]` for `"vi"`, `["Study Now", "Snooze"]` for `"en"`) for `"STREAK_AT_RISK"`, `"DUE_CARDS"`, and `"DAILY_GOAL"` notifications, resolving `lang` via `user?.preferredLanguage ?? settings?.preferredLanguage ?? browserUiLanguage ?? "vi"`.
  - *Traces to*: `BR-REMD-010`, `ASM-REMD-007`.

### Key Entities *(0 Database Schema Migrations)*

- **`ReminderState`** (`packages/shared-types/src/extension.ts` & `chrome.storage.local["ws_reminder_state"]`): Tracks `lastResetDate`, `sentTodayCount`, `dailyReminderSentToday`, `consecutiveIgnores`, `lastNotifiedAt`, `snoozedUntil`, `activeNotificationId`, and `lastStudiedToday`.
- **`ExtensionSettingsPayload` / `ReminderSettings`** (`packages/shared-types/src/extension.ts` & `chrome.storage.local["ws_settings"]`): Extended with `remindersEnabled`, `dailyReminderTime`, `quietHoursStart`, `quietHoursEnd`, `streakAtRiskReminderEnabled`, and `preferredLanguage`.
- **`ExtensionUserSummary`** (`packages/shared-types/src/extension.ts` & `chrome.storage.local["ws_user"]`): Extended with `preferredLanguage?: AppLanguage`.
- **`ReminderEvaluationInput` & `ReminderDecision`** (`packages/shared-types/src/extension.ts`): Pure rule evaluation input and deterministic output contract.

---

## 5. Traceability Matrix

| Requirement ID | Business Rules | Assumptions / Risks | User Story / Scenarios | Target Files |
| :--- | :--- | :--- | :--- | :--- |
| **REQ-REMD-001** | `BR-REMD-001` | `ASM-REMD-001` | `US-ECO-06` (Scenario 1) | `apps/extension/manifest.json`, `packages/shared-types/src/extension.ts`, `apps/extension/src/shared/constants.ts`, `storage.ts` |
| **REQ-REMD-002** | `BR-REMD-002` | `ASM-REMD-004`, `ASM-REMD-005`, `RISK-REMD-004`, `RISK-REMD-005` | `US-ECO-06` (Scenarios 1, 6) | `apps/extension/src/shared/storage.ts`, `apps/extension/src/background/reminderRules.ts`, `storage.spec.ts`, `reminderRules.spec.ts` |
| **REQ-REMD-003** | `BR-REMD-003` | `ASM-REMD-002` | `US-ECO-06` (Scenario 4) | `apps/extension/src/background/reminderRules.ts`, `reminderRules.spec.ts` |
| **REQ-REMD-004** | `BR-REMD-004` | `ASM-REMD-004` | `US-ECO-06` (Scenarios 5, 6) | `apps/extension/src/background/reminderRules.ts`, `reminderRules.spec.ts` |
| **REQ-REMD-005** | `BR-REMD-005` | `ASM-REMD-003`, `RISK-REMD-003` | `US-ECO-06` (Scenarios 3, 5) | `apps/extension/src/background/reminderRules.ts`, `reminderRules.spec.ts` |
| **REQ-REMD-006** | `BR-REMD-006` | `RISK-REMD-002` | `US-ECO-06` (Scenarios 1, 7, 8) | `apps/extension/src/background/reminderRules.ts`, `reminderRules.spec.ts` |
| **REQ-REMD-007** | `BR-REMD-007` | `ASM-REMD-001`, `ASM-REMD-003` | `US-ECO-06` (Scenarios 1, 3, 8) | `apps/extension/src/background/reminderRules.ts`, `reminder-manager.ts`, `index.ts`, `reminder-manager.spec.ts` |
| **REQ-REMD-008** | `BR-REMD-008` | `ASM-REMD-005`, `RISK-REMD-001`, `RISK-REMD-005` | `US-ECO-06` (Scenarios 2, 3, 6) | `apps/extension/src/background/reminder-manager.ts`, `badge-manager.ts`, `reminder-manager.spec.ts` |
| **REQ-REMD-009** | `BR-REMD-009` | `ASM-REMD-006` | `US-ECO-06` (Scenario 2) | `apps/extension/src/background/reminder-manager.ts`, `reminder-manager.spec.ts` |
| **REQ-REMD-010** | `BR-REMD-010` | `ASM-REMD-007` | `US-ECO-06` (Scenario 1) | `packages/shared-types/src/extension.ts`, `apps/extension/src/background/api-client.ts`, `reminderRules.ts`, `reminderRules.spec.ts` |

---

## 6. Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001 (Pure Rule Evaluation Speed)**: 100% of `evaluateReminderRules` invocations complete in `< 5ms` with zero Chrome API or I/O side effects.
- **SC-002 (Notification Action Responsiveness)**: 100% of notification click / button click handlers (`"Học ngay"` tab focus/open and `"Để sau"` 60-minute snooze scheduling) execute in `< 150ms`.
- **SC-003 (Zero Quiet-Hours & Cap Violations)**: 0 notifications are created during `[quietHoursStart, quietHoursEnd)`, when unauthenticated, within the 120-minute non-snooze cooldown window, or above the effective daily ceiling (`3/day` normal, `1/day` when `consecutiveIgnores >= 3`).
- **SC-004 (100% Scenario & Branch Test Coverage)**: Automated unit tests cover all 10 requirements (`REQ-REMD-001`..`REQ-REMD-010`), all 8 Gherkin scenarios of `US-ECO-06`, and all 8 edge cases (`EC-REMD-01`..`EC-REMD-08`).

---

## 7. Assumptions & Scope Boundaries

- **Confirmed Assumptions**: `ASM-REMD-001` through `ASM-REMD-007` as signed off in [`baseline.md`](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/.specify/features/extension-reminder-notifications/baseline.md) and [`04-risk-scope.md`](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/.specify/features/extension-reminder-notifications/04-risk-scope.md).
- **In Scope (Must-Have P0)**:
  - `"notifications"` permission in `apps/extension/manifest.json`.
  - Shared types `ReminderState`, `ReminderDecision`, `ReminderEvaluationInput`, `ReminderNotificationType`, `ReminderTriggerSource`, `ReminderReason`, reminder fields in `ExtensionSettingsPayload`, and `preferredLanguage?: AppLanguage` in `ExtensionUserSummary` (`packages/shared-types/src/extension.ts`).
  - Reminder constants (`STORAGE_KEYS.REMINDER_STATE`, `ALARM_NAMES.DAILY_REMINDER`, `ALARM_NAMES.REMINDER_SNOOZE`, `REMINDER_LIMITS`, `DEFAULT_REMINDER_STATE`, `DEFAULT_SETTINGS` reminder defaults) and storage helpers (`getReminderState`, `setReminderState`, `resetReminderState`) in `apps/extension/src/shared/`.
  - Pure rule engine and EN/VI notification copy builder in `apps/extension/src/background/reminderRules.ts`.
  - `ReminderManager` in `apps/extension/src/background/reminder-manager.ts` + wiring in `apps/extension/src/background/badge-manager.ts` and `apps/extension/src/background/index.ts`.
  - Unit tests in `reminderRules.spec.ts`, `reminder-manager.spec.ts`, `storage.spec.ts`, and `api-client.spec.ts`.
- **Out of Scope (Won't-Have in `US-ECO-06`)**:
  - Options Page UI controls for editing reminder settings (`US-ECO-07`).
  - In-Popup 5-card micro-review flashcard UI (`US-ECO-08`).
  - Web Push & Email study reminders for mobile/PWA (`US-ECO-09`).
