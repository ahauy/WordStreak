# Risk Register & Scope Boundaries: Conditional Study Reminder Notifications (`US-ECO-06`)

- **Feature Slug**: `extension-reminder-notifications`
- **Stage**: Stage 5 — Risk & Contradiction Scanner
- **Date**: 2026-10-13
- **Source Artifacts**: [00-intake.md](./00-intake.md), [01-elicitation.md](./01-elicitation.md), [03-domain-model.md](./03-domain-model.md)

---

## 1. Contradiction Scan

- **Logic Contradictions**: **None found (0 unresolved).**
  - *Checked*: **Snooze vs. Quiet Hours & Daily Cap** (`BR-REMD-003`, `BR-REMD-004`, `BR-REMD-005`, `BR-REMD-006`). When `ws-reminder-snooze` fires after 60 minutes, Step 5 (`SNOOZED_ACTIVE`) and Step 6 (`COOLDOWN_ACTIVE`) are bypassed for `triggerSource === "SNOOZE_ALARM"`, while Step 3 (`QUIET_HOURS`) and Step 4 (`DAILY_CAP_REACHED`) are still strictly enforced before Step 8 (`SNOOZE_REMINDER`). Thus a snoozed notification never violates quiet hours or the 3/day cap.
  - *Checked*: **Daily Counter Reset vs. Consecutive Ignores Persistence** (`BR-REMD-002`, `BR-REMD-004`). `sentTodayCount` resets to `0` at local midnight rollover (`lastResetDate !== currentLocalDate`), whereas `consecutiveIgnores` persists across days so that if a user ignores 3 notifications across 1–3 days, the next day's cap is properly reduced to `1/day` until the user engages (`Học ngay`, `Để sau`, or Web App review completion).
  - *Checked*: **`onButtonClicked` / `onClicked` vs. `onClosed` Event Ordering** (`BR-REMD-008`). Calling `chrome.notifications.clear(notificationId)` inside `onClicked` or `onButtonClicked` triggers `chrome.notifications.onClosed`. By clearing `state.activeNotificationId = null` in `chrome.storage.local` *before* calling `chrome.notifications.clear`, `onClosed` sees `state.activeNotificationId !== notificationId` and never falsely increments `consecutiveIgnores` after a valid click.
- **State Deadlocks**: **None found (0 unresolved).**
  - *Checked*: `REDUCED_FREQUENCY (Cap: 1/day, Ignores >= 3)` is never a permanent deadlock: the learner still receives up to 1 reminder per day, and clicking **"Học ngay"**, clicking **"Để sau"**, or completing any flashcard review on the Web App immediately resets `consecutiveIgnores = 0` and transitions back to `NORMAL_FREQUENCY (Cap: 3/day)`.
- **Backward-Compatibility Risks**: **None found (0 unresolved).**
  - *Checked*: Adding default reminder fields (`remindersEnabled`, `dailyReminderTime`, `quietHoursStart`, `quietHoursEnd`, `streakAtRiskReminderEnabled`) to `DEFAULT_SETTINGS` in `apps/extension/src/shared/constants.ts` merges seamlessly with existing stored `ws_settings` via `{ ...DEFAULT_SETTINGS, ...storedSettings }` in `extensionStorage.getSettings()`.
  - *Checked*: Adding optional `preferredLanguage?: AppLanguage` to `ExtensionUserSummary` in `packages/shared-types/src/extension.ts` is backward-compatible with existing stored `ws_user` objects.

---

## 2. Risk Register (`RISK-REMD-###`)

| ID | Category | Risk Description | Prob. | Impact | Mitigation Strategy |
| :--- | :--- | :--- | :---: | :---: | :--- |
| **RISK-REMD-001** | Technical (Event Race) | `chrome.notifications.clear()` invoked after `onClicked` / `onButtonClicked` fires `chrome.notifications.onClosed`, which could mistakenly increment `consecutiveIgnores`. | High | Med | Per `BR-REMD-008`, persist `activeNotificationId: null` and `consecutiveIgnores: 0` in `ws_reminder_state` before calling `chrome.notifications.clear(id)`, and only increment `consecutiveIgnores` in `onClosed` when `state.activeNotificationId === notificationId`. |
| **RISK-REMD-002** | Operational (Laptop Sleep) | Desktop/laptop is asleep or browser is closed at `20:00` (`dailyReminderTime`), missing the exact `"daily-reminder"` alarm timestamp. | High | Med | Per `BR-REMD-006` Step 9, if a periodic summary sync (`onStartup` / `ws-badge-periodic`) runs at or after `dailyReminderTime` on the same day while `dailyReminderSentToday === false` and outside quiet hours, trigger the catch-up daily reminder once and set `dailyReminderSentToday = true`. |
| **RISK-REMD-003** | UX / Anti-Spam | Frequent `ws-badge-periodic` (every 30 min) or `WORDSTREAK_REVIEW_SYNC` summary refreshes could trigger all 3 daily notifications within 1 hour when `streakAtRisk === true`. | Med | High | Per `BR-REMD-005`, enforce a mandatory 120-minute (`2h`) cooldown (`MIN_COOLDOWN_MS`) between non-snoozed notifications on the same day, plus active snooze suppression (`snoozedUntil > nowMs`). |
| **RISK-REMD-004** | Technical (Timezone Rollover) | Using UTC date (`toISOString().slice(0, 10)`) instead of learner local timezone (`summary.timezone`) would reset `sentTodayCount` at 07:00 AM ICT (`Asia/Ho_Chi_Minh`) instead of local midnight. | Med | Med | Per `BR-REMD-002` and `BR-REMD-003`, format local date (`YYYY-MM-DD`) and local time (`HH:mm`) using `Intl.DateTimeFormat` with `timeZone: summary?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC"`. |
| **RISK-REMD-005** | Technical (Unclicked Supersede) | OS auto-dismisses toast to notification center without firing `onClosed`, or a new notification is shown hours later while `activeNotificationId` is still set. | Med | Low | Per `BR-REMD-002` and Edge Case 4 in `03-domain-model.md`, if `activeNotificationId !== null` when a new day starts or when a subsequent notification is evaluated, account for the unclicked notification by incrementing `consecutiveIgnores` first. |

---

## 3. Consolidated Assumptions & Constraints

### Assumptions (`ASM-REMD-###`)
- **ASM-REMD-001**: Default reminder settings (`remindersEnabled: true`, `dailyReminderTime: "20:00"`, `quietHoursStart: "22:00"`, `quietHoursEnd: "07:00"`, `streakAtRiskReminderEnabled: true`) are included in `DEFAULT_SETTINGS` and `ExtensionSettingsPayload`.
- **ASM-REMD-002**: Quiet hours support both overnight wrap-around ranges (`quietHoursStart > quietHoursEnd`, e.g., `22:00–07:00`) and same-day ranges (`quietHoursStart < quietHoursEnd`), with `quietHoursStart === quietHoursEnd` disabling quiet hours.
- **ASM-REMD-003**: Clicking **"Để sau" / "Snooze"** schedules a one-shot alarm `ws-reminder-snooze` for 60 minutes (`delayInMinutes: 60`) and resets `consecutiveIgnores` to `0`; non-snoozed automatic notifications require a 120-minute intra-day cooldown.
- **ASM-REMD-004**: Daily notification ceiling is `3` per local calendar day, reduced to `1` per local calendar day when `consecutiveIgnores >= 3`.
- **ASM-REMD-005**: `consecutiveIgnores` increments by `1` when a notification is closed/superseded without user action, and resets to `0` on clicking **"Học ngay"**, clicking the notification body, clicking **"Để sau"**, or completing a review on the Web App.
- **ASM-REMD-006**: Clicking **"Học ngay"** or the notification body focuses and navigates an existing `${WEB_APP_URL}/*` tab to `${WEB_APP_URL}/review` if open, or creates a new active tab to `${WEB_APP_URL}/review` otherwise.
- **ASM-REMD-007**: Notification copy is localized in `vi` and `en` based on `user?.preferredLanguage ?? settings?.preferredLanguage ?? browserUiLang ?? "vi"`.

### Technical & Architectural Constraints
- **CON-REMD-001**: `reminderRules.ts` MUST be a 100% pure TypeScript module with zero direct `chrome.*` API calls or side effects so all rule combinations can be unit-tested deterministically.
- **CON-REMD-002**: All reminder state (`ws_reminder_state`) MUST be persisted in `chrome.storage.local` because MV3 background service workers are ephemeral.
- **CON-REMD-003**: Zero backend Prisma schema migrations or new backend endpoints are required (`GET /api/reviews/summary` from `US-REM-01` and `GET /api/auth/me` / `/api/users/profile` are already available).

---

## 4. MoSCoW Scope Table

### Must-Have (P0 — Required for `US-ECO-06` Sign-Off)
- Add `"notifications"` permission to `apps/extension/manifest.json`.
- Update shared contracts in `packages/shared-types/src/extension.ts` (`ReminderState`, `ReminderDecision`, `ReminderEvaluationInput`, `ReminderNotificationType`, reminder fields in `ExtensionSettingsPayload`, and `preferredLanguage?: AppLanguage` in `ExtensionUserSummary`).
- Add `STORAGE_KEYS.REMINDER_STATE = "ws_reminder_state"`, `ALARM_NAMES.DAILY_REMINDER = "daily-reminder"`, `ALARM_NAMES.REMINDER_SNOOZE = "ws-reminder-snooze"`, `REMINDER_LIMITS`, and default reminder settings in `apps/extension/src/shared/constants.ts` and `storage.ts`.
- Create pure module `apps/extension/src/background/reminderRules.ts` implementing `isWithinQuietHours`, `normalizeReminderStateForDate`, `computeNextDailyReminderTime`, `evaluateReminderRules`, and `buildReminderNotificationCopy` (EN/VI).
- Create `apps/extension/src/background/reminder-manager.ts` orchestrating `daily-reminder` and `ws-reminder-snooze` alarms, `chrome.notifications.create` / `onClicked` / `onButtonClicked` / `onClosed`, smart `/review` tab focus/creation, and Web App review sync backoff reset.
- Wire `reminderManager` into `apps/extension/src/background/index.ts` and `badge-manager.ts` (so summary refreshes and auth/settings updates keep reminder alarms and state synchronized).
- Comprehensive unit tests in `reminderRules.spec.ts` and `reminder-manager.spec.ts` covering all rule branches, quiet hours wrap-around, 3/day cap, 3-ignore → 1/day backoff & reset, snooze alarm, tab reuse/creation, and EN/VI i18n copy.

### Should-Have (P1)
- Ensure `apiClient.getMe()` in `apps/extension/src/background/api-client.ts` preserves `preferredLanguage` from `/auth/me` or `/users/profile` so `ws_user.preferredLanguage` is populated automatically.

### Could-Have (P2)
- Re-schedule `"daily-reminder"` alarm automatically whenever `UPDATE_SETTINGS` message updates `dailyReminderTime` or `remindersEnabled` (ready for `US-ECO-07`).

### Won't-Have (Explicitly Out of Scope for `US-ECO-06`)
- **Options Page UI Controls for Reminder Settings** (toggles/time pickers for `remindersEnabled`, `dailyReminderTime`, `quietHoursStart/End`, `streakAtRiskReminderEnabled`) — scoped in **`US-ECO-07: Cài đặt nhắc học (Options Page)`**.
- **In-Popup 5-Card Micro-Review UI** — scoped in **`US-ECO-08: Ôn nhanh trong Popup (Micro-review)`**.
- **Web Push & Email Study Reminders for Mobile/PWA** — scoped in **`US-ECO-09: Web Push & Email nhắc học (mobile / PWA)`**.
