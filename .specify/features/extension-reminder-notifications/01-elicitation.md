# Elicitation Record: Conditional Study Reminder Notifications (`US-ECO-06`)

- **Feature Slug**: `extension-reminder-notifications`
- **Protocol Depth**: Bounded Task (Business Value + 3 Targeted Pillar Questions)
- **Date**: 2026-10-13
- **Status**: Complete (0 Open Questions)

---

## Stage 1 — Business Value

- **Problem & Pain Point**: While `US-ECO-05` provides a passive badge count on the Chrome Extension toolbar icon, busy learners often browse with the toolbar collapsed or fail to notice the badge when their evening study window arrives or when their multi-day streak is about to expire (`streakAtRisk = true`). Conversely, naive unconditional notifications annoy users during quiet hours or spam learners who are temporarily unavailable, leading to extension uninstalls. WordStreak needs a conditional, rule-driven desktop notification engine (`reminderRules.ts`) that respects quiet hours, enforces a 3-notifications/day ceiling, automatically backs off to max 1/day after 3 consecutive ignored notifications, and offers actionable **Học ngay (Study Now)** / **Để sau (Snooze)** buttons in EN/VI.
- **Target Personas**:
  - **Authenticated Learner** (Persona B - Minh, busy working professional; Persona C - Linh, daily web reader) with the WordStreak Chrome Extension (Manifest V3) installed.
  - **Unauthenticated / Logged-Out User**: Extension installed but no active session token (`ws_token === null` or expired `401`); receives zero notifications and has all reminder alarms cleared.
- **Success Metrics**:
  - **Primary Product Metric**: +20% increase in timely evening review sessions and streak-save conversions triggered via the Extension **"Học ngay"** notification action, with `< 1%` notification-induced extension uninstall rate thanks to the 3-ignore frequency backoff.
  - **Operational & NFR Metrics**:
    - Pure function rule evaluation (`evaluateReminderRules`) execution time `< 5ms` with 100% deterministic unit-test coverage across all rule branches.
    - Notification action response latency (`onClicked` / `onButtonClicked` → focusing/opening `/review` tab or scheduling snooze alarm) `< 150ms`.
    - Zero notifications fired during quiet hours (`[quietHoursStart, quietHoursEnd)`), when unauthenticated, or above the effective daily cap (`3/day` normal, `1/day` when `consecutiveIgnores >= 3`).

---

## Targeted Pillar Interview Decisions

### Pillar 2 & 3 — Default Reminder Settings, Quiet Hours & Snooze/Cooldown Mechanics
**Q1: Default Reminder Settings, Quiet Hours & Snooze Duration (Pre-`US-ECO-07` Defaults)** → **Decision**: **Option A (Confirmed)**
- **Default Settings in `ExtensionSettingsPayload` / `DEFAULT_SETTINGS`**:
  - `remindersEnabled: true`
  - `dailyReminderTime: "20:00"` (24h `HH:mm` in learner's local timezone; 8:00 PM)
  - `quietHoursStart: "22:00"` (10:00 PM local time)
  - `quietHoursEnd: "07:00"` (7:00 AM local time; supports overnight wrap-around `22:00–07:00` as well as same-day ranges)
  - `streakAtRiskReminderEnabled: true`
- **Snooze Duration ("Để sau" / "Snooze")**:
  - Clicking button index `1` (**"Để sau"** / **"Snooze"**) dismisses the active notification, resets `consecutiveIgnores` to `0` (since the user explicitly interacted with the reminder), records `snoozedUntil` (`now + 60 minutes`), and schedules a one-shot alarm `ws-reminder-snooze` with `delayInMinutes: 60`.
  - When `ws-reminder-snooze` fires, it re-fetches/reads the latest `ReviewSummaryDto` and evaluates `reminderRules.ts` (still honoring quiet hours and the daily cap).
- **Intra-Day Cooldown**:
  - Enforce a minimum **120-minute (2-hour)** cooldown (`MIN_COOLDOWN_MS = 120 * 60 * 1000`) between non-snoozed automatic notifications on the same local calendar day so periodic summary refreshes never fire back-to-back notifications.

### Pillar 3 & 4 — Conditional Trigger Rules (`reminderRules.ts`), Daily Cap & Consecutive-Ignore Backoff Reset
**Q2: Conditional Trigger Rules (`reminderRules.ts`), Daily Cap (Max 3/Day) & Consecutive-Ignore Backoff Reset** → **Decision**: **Option A (Confirmed)**
- **Pure Rule Engine (`evaluateReminderRules(summary, settings, state, context)`)**:
  - Evaluates in strict priority order and returns `{ shouldNotify: boolean, reason: ReminderTriggerReason | ReminderSuppressionReason, notificationType?: "STREAK_AT_RISK" | "DUE_CARDS" | "DAILY_GOAL", effectiveDailyCap: 1 | 3 }`.
  - **Eligibility Preconditions**:
    1. User is authenticated (`summary !== null` and `isAuthenticated === true`).
    2. `settings.remindersEnabled === true`.
    3. Current local time (`HH:mm` in `summary.timezone` or browser local timezone) is outside `[settings.quietHoursStart, settings.quietHoursEnd)`.
    4. Normalized `sentTodayCount < effectiveDailyCap`, where `effectiveDailyCap = state.consecutiveIgnores >= 3 ? 1 : 3`.
    5. For non-snooze triggers (`triggerSource !== "SNOOZE_ALARM"`), if `state.lastNotifiedAt` is present on the same day, `nowMs - Date.parse(state.lastNotifiedAt) >= 120 * 60 * 1000` (120-minute cooldown) and no active snooze window (`state.snoozedUntil > nowMs`) is currently suppressing automatic checks.
  - **Actionable Study Triggers**:
    1. **Snooze Wakeup (`triggerSource === "SNOOZE_ALARM"`)**: Eligible if `summary.streakAtRisk || summary.dueCount > 0 || !summary.goalReached`.
    2. **Scheduled / Catch-Up Daily Reminder (`triggerSource === "DAILY_ALARM"` or first periodic sync at/after `dailyReminderTime` when `dailyReminderSentToday === false`)**: Eligible if `summary.dueCount > 0 || !summary.goalReached` (or `summary.streakAtRisk && settings.streakAtRiskReminderEnabled`).
    3. **Periodic Streak-at-Risk Alert (`triggerSource === "PERIODIC_SYNC"`)**: Eligible if `summary.streakAtRisk === true && settings.streakAtRiskReminderEnabled === true` (and 120-minute cooldown has elapsed since `lastNotifiedAt`).
  - **Notification Priority Selection**:
    - If `summary.streakAtRisk && settings.streakAtRiskReminderEnabled`: `notificationType = "STREAK_AT_RISK"`.
    - Else if `summary.dueCount > 0`: `notificationType = "DUE_CARDS"`.
    - Else (`!summary.goalReached`): `notificationType = "DAILY_GOAL"`.
- **Consecutive Ignore Tracking & Reset (`ReminderState` in `chrome.storage.local`)**:
  - **Increment (`consecutiveIgnores += 1`)**: Whenever a shown notification (`activeNotificationId !== null`) is closed by the user/system without clicking the body or action buttons (`chrome.notifications.onClosed`), OR when a new notification / new day rollover occurs while a previous notification remained unclicked (`activeNotificationId !== null`).
  - **Reset (`consecutiveIgnores = 0`)**: Immediately when the learner:
    1. Clicks **"Học ngay"** (button index `0`) or clicks the notification body (`chrome.notifications.onClicked`),
    2. Clicks **"Để sau"** (button index `1`, explicit snooze interaction), OR
    3. Completes a review on the Web App (`WORDSTREAK_REVIEW_SYNC` received or `summary.studiedToday` increases compared to previously observed `lastStudiedToday` on the same day, or `summary.dueCount === 0 && summary.goalReached`).
  - **Daily Counter Reset**: `sentTodayCount` and `dailyReminderSentToday` reset to `0` / `false` when the local calendar date (`YYYY-MM-DD` in `summary.timezone` / browser timezone) changes from `state.lastResetDate`, whereas `consecutiveIgnores` persists across days until reset by learner engagement.

### Pillar 4 & 6 — Notification Click / "Học ngay" Tab Behavior & `preferredLanguage` (EN/VI) Resolution
**Q3: Notification Click / "Học ngay" Tab Behavior & `preferredLanguage` (EN/VI) Resolution** → **Decision**: **Option A (Confirmed)**
- **Smart `/review` Tab Navigation**:
  - When the user clicks the notification body (`onClicked`) or button index `0` (**"Học ngay"** / **"Study Now"** in `onButtonClicked`), the background service worker queries open tabs (`chrome.tabs.query`) for any tab matching `${WEB_APP_URL}/*`.
  - If an existing WordStreak tab is found, focus its window (`chrome.windows.update(tab.windowId, { focused: true })`) and activate/navigate that tab to `${WEB_APP_URL}/review` (`chrome.tabs.update(tab.id, { active: true, url: "${WEB_APP_URL}/review" })`).
  - If no existing WordStreak tab is found, create a new active tab (`chrome.tabs.create({ url: "${WEB_APP_URL}/review", active: true })`).
  - Clear the notification (`chrome.notifications.clear(notificationId)`) and reset `consecutiveIgnores = 0` and `activeNotificationId = null`.
- **Language Resolution (`preferredLanguage: "vi" | "en"`) & Copy**:
  - Extend `ExtensionUserSummary` in `@wordstreak/shared-types` with `preferredLanguage?: AppLanguage` (`"vi" | "en"`), populated from `/api/auth/me`, `/api/users/profile`, or `/api/auth/login` responses.
  - Resolution chain: `user?.preferredLanguage` → `settings?.preferredLanguage` → `chrome.i18n?.getUILanguage?.()` (if starts with `"vi"` → `"vi"`, if starts with `"en"` → `"en"`) → default `"vi"`.
  - Provide localized EN and VI notification templates (title, message with interpolated `dueCount` / `currentStreak` / remaining daily goal, and 2 action buttons: `["Học ngay", "Để sau"]` in VI / `["Study Now", "Snooze"]` in EN) for all 3 notification types (`STREAK_AT_RISK`, `DUE_CARDS`, `DAILY_GOAL`).

---

## Assumptions Confirmed (`ASM-REMD-###`)

- **ASM-REMD-001**: Default reminder settings (`remindersEnabled: true`, `dailyReminderTime: "20:00"`, `quietHoursStart: "22:00"`, `quietHoursEnd: "07:00"`, `streakAtRiskReminderEnabled: true`) are stored in `ExtensionSettingsPayload` so `US-ECO-06` operates immediately with sensible defaults and `US-ECO-07` can bind its Options UI directly to the same fields.
- **ASM-REMD-002**: Quiet hours support both overnight wrap-around ranges where `quietHoursStart > quietHoursEnd` (e.g., `22:00` to `07:00`, active when `currentMinutes >= 22*60 || currentMinutes < 7*60`) and same-day ranges where `quietHoursStart < quietHoursEnd` (e.g., `01:00` to `06:00`, active when `currentMinutes >= 1*60 && currentMinutes < 6*60`). Equal start and end (`quietHoursStart === quietHoursEnd`) disables quiet hours.
- **ASM-REMD-003**: Clicking **"Để sau" / "Snooze"** schedules a one-shot alarm `ws-reminder-snooze` for 60 minutes (`delayInMinutes: 60`) and counts as positive user acknowledgement (resetting `consecutiveIgnores` to `0`), while non-snoozed automatic notifications enforce a 120-minute minimum intra-day cooldown.
- **ASM-REMD-004**: Daily notification ceiling is `3` per local calendar day (`YYYY-MM-DD`), reduced to `1` per local calendar day whenever `consecutiveIgnores >= 3`.
- **ASM-REMD-005**: `consecutiveIgnores` increments by `1` when a notification is closed (`chrome.notifications.onClosed`) or superseded without a click/button action, and resets to `0` when the user clicks the notification body, clicks **"Học ngay"**, clicks **"Để sau"**, or studies on the Web App (`WORDSTREAK_REVIEW_SYNC` / `studiedToday` increases).
- **ASM-REMD-006**: Clicking **"Học ngay"** or the notification body reuses and focuses an existing `${WEB_APP_URL}/*` tab (navigating it to `${WEB_APP_URL}/review`) if one is open, or opens a new active tab to `${WEB_APP_URL}/review` otherwise.
- **ASM-REMD-007**: Notification copy is localized in Vietnamese (`vi`) and English (`en`) using `user?.preferredLanguage ?? settings?.preferredLanguage ?? browserLocale ?? "vi"`, with `ExtensionUserSummary` extended to include `preferredLanguage?: AppLanguage`.

---

## Open Questions (Not Yet Answered)

- None. All business rules, alarm schedules, backoff state transitions, tab navigation behaviors, and i18n copy rules are confirmed.
