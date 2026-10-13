# User Stories & Acceptance Criteria: Conditional Study Reminder Notifications (`US-ECO-06`)

- **Feature Slug**: `extension-reminder-notifications`
- **Version**: `1.0`
- **Date**: 2026-10-13
- **Upstream References**: [spec/srs.md](./srs.md), [03-domain-model.md](../03-domain-model.md), [04-risk-scope.md](../04-risk-scope.md)

---

### US-ECO-06: Thông báo nhắc học theo luật điều kiện (Conditional Study Reminder Notifications)

- **As an** Authenticated Learner with the WordStreak Chrome Extension installed
- **I want to** receive intelligent, localized (EN/VI) system notifications with **Học ngay (Study Now)** and **Để sau (Snooze)** buttons when I have due flashcards, an incomplete daily goal at my reminder time, or an at-risk streak — while strictly respecting my quiet hours, a 3-notifications/day ceiling, and automatic frequency reduction (max 1/day after 3 consecutive ignores)
- **So that** I am prompted at the right moment to review on `/review` and protect my study streak without being interrupted during quiet hours or spammed when I am busy.
- **Traces to**: `REQ-REMD-001`, `REQ-REMD-002`, `REQ-REMD-003`, `REQ-REMD-004`, `REQ-REMD-005`, `REQ-REMD-006`, `REQ-REMD-007`, `REQ-REMD-008`, `REQ-REMD-009`, `REQ-REMD-010`

#### Acceptance Criteria (Given-When-Then)

- **Scenario 1: Scheduled `daily-reminder` alarm fires localized notification with "Học ngay" / "Để sau" buttons (`REQ-REMD-001`, `REQ-REMD-006`, `REQ-REMD-007`, `REQ-REMD-010`)**
  - **Given** the learner is authenticated with `user.preferredLanguage = "vi"` (or `"en"`), `settings.remindersEnabled = true`, `dailyReminderTime = "20:00"`, and quiet hours `"22:00"`–`"07:00"`
  - **And** `ReviewSummaryDto` reports `dueCount: 12`, `goalReached: false`, `streakAtRisk: false`, and `ws_reminder_state` has `sentTodayCount: 0, consecutiveIgnores: 0`
  - **When** the `"daily-reminder"` alarm fires at `20:00` local time
  - **Then** `evaluateReminderRules` returns `{ shouldNotify: true, reason: "DAILY_SCHEDULED", notificationType: "DUE_CARDS" }`
  - **And** the Extension creates a system notification in Vietnamese (or English when `preferredLanguage = "en"`) displaying `12` due cards and two action buttons: **"Học ngay"** and **"Để sau"** (**"Study Now"** and **"Snooze"** in English)
  - **And** updates `ws_reminder_state` in `chrome.storage.local` with `sentTodayCount: 1` and `dailyReminderSentToday: true`.

- **Scenario 2: Clicking "Học ngay" (or notification body) opens/focuses `/review` and resets `consecutiveIgnores` (`REQ-REMD-008`, `REQ-REMD-009`)**
  - **Given** a WordStreak study reminder notification is currently displayed (`activeNotificationId = "ws-study-reminder"`) and `consecutiveIgnores` was `2`
  - **When** the learner clicks button index `0` (**"Học ngay"** / **"Study Now"**) or clicks the notification body
  - **Then** the Extension sets `consecutiveIgnores: 0` and `activeNotificationId: null` in `ws_reminder_state` before clearing the notification
  - **And** if an existing `${WEB_APP_URL}/*` tab is open, focuses its window and navigates that tab to `${WEB_APP_URL}/review`; otherwise opens a new active tab at `${WEB_APP_URL}/review`.

- **Scenario 3: Clicking "Để sau" (Snooze) schedules a one-shot 60-minute alarm and resets `consecutiveIgnores` (`REQ-REMD-005`, `REQ-REMD-007`, `REQ-REMD-008`)**
  - **Given** a WordStreak study reminder notification is currently displayed at `19:30` local time
  - **When** the learner clicks button index `1` (**"Để sau"** / **"Snooze"**)
  - **Then** the Extension clears the notification, sets `consecutiveIgnores: 0`, `activeNotificationId: null`, and `snoozedUntil: now + 60m` in `ws_reminder_state`
  - **And** schedules the one-shot alarm `"ws-reminder-snooze"` with `delayInMinutes: 60`
  - **And** when `"ws-reminder-snooze"` fires at `20:30` (still outside quiet hours and `< 3` sent today) with `dueCount > 0`, the Extension displays the reminder notification.

- **Scenario 4: Quiet hours (`22:00–07:00` overnight wrap-around) strictly suppress notifications (`REQ-REMD-003`)**
  - **Given** `settings.quietHoursStart = "22:00"` and `settings.quietHoursEnd = "07:00"`
  - **When** `evaluateReminderRules` is invoked at `22:15` or `06:30` local time (even if `dueCount > 0`, `streakAtRisk === true`, or `"ws-reminder-snooze"` just fired)
  - **Then** `evaluateReminderRules` returns `{ shouldNotify: false, reason: "QUIET_HOURS" }` and no system notification is created.

- **Scenario 5: Daily ceiling of 3 notifications/day and 120-minute intra-day cooldown (`REQ-REMD-004`, `REQ-REMD-005`)**
  - **Given** `consecutiveIgnores < 3` (effective daily cap is `3`)
  - **When** a notification was already sent 45 minutes ago (`now - lastNotifiedAt < 120 minutes`) and a periodic summary sync runs
  - **Then** `evaluateReminderRules` returns `{ shouldNotify: false, reason: "COOLDOWN_ACTIVE" }`
  - **And** once `sentTodayCount` reaches `3` on the same local calendar day (`YYYY-MM-DD`), any further trigger (including `"ws-reminder-snooze"`) returns `{ shouldNotify: false, reason: "DAILY_CAP_REACHED" }` until local midnight rolls over.

- **Scenario 6: Frequency backoff after 3 consecutive ignores (`consecutiveIgnores >= 3` → max 1/day) & recovery on study/interaction (`REQ-REMD-002`, `REQ-REMD-004`, `REQ-REMD-008`)**
  - **Given** the learner has dismissed or ignored 3 notifications in a row without clicking **"Học ngay"**, clicking **"Để sau"**, or studying (`consecutiveIgnores === 3`)
  - **When** a new local calendar day begins (`sentTodayCount` resets to `0`, `consecutiveIgnores` remains `3`) and the first eligible reminder of the day fires (`sentTodayCount` becomes `1`)
  - **Then** any subsequent reminder check on that same day returns `{ shouldNotify: false, reason: "DAILY_CAP_REACHED", effectiveDailyCap: 1 }`
  - **And** as soon as the learner completes a review on the Web App (`WORDSTREAK_REVIEW_SYNC` / `studiedToday` increases) or clicks **"Học ngay"** / **"Để sau"**, `consecutiveIgnores` resets to `0` and the normal `3/day` cap is restored.

- **Scenario 7: Laptop sleep / browser closed at `dailyReminderTime` catches up on next sync outside quiet hours (`REQ-REMD-006`)**
  - **Given** `dailyReminderTime = "20:00"`, the browser was closed at `20:00` (`dailyReminderSentToday === false`), and `dueCount: 8`
  - **When** the learner opens the browser at `20:40` (before `22:00` quiet hours) and the startup summary sync completes
  - **Then** `evaluateReminderRules` triggers the catch-up daily reminder (`reason: "DAILY_SCHEDULED"`, `markDailyReminderSent: true`) and displays the notification once.

- **Scenario 8: No notification when study goal is met and no cards are due, or when logged out (`REQ-REMD-006`, `REQ-REMD-007`)**
  - **Given** `dueCount === 0`, `goalReached === true`, and `streakAtRisk === false` (or the user logs out / `ws_token === null`)
  - **When** `"daily-reminder"` or a periodic sync runs
  - **Then** `evaluateReminderRules` returns `shouldNotify: false` (`reason: "NO_STUDY_NEEDED"` or `"UNAUTHENTICATED"`), and on logout any active notification and snooze alarm are cleared.
