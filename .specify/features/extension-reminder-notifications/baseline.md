# Domain Decision Baseline: Conditional Study Reminder Notifications (`US-ECO-06`)

- **Status**: `SIGNED-OFF (Ready for Confirmation Gate 1)`
- **Version**: `1.0`
- **Feature Slug**: `extension-reminder-notifications`
- **Signed off by**: Customer (Stage 2 Interview Confirmed) & `business-analyst` (2026-10-13)

---

## 1. Business Summary & Problem Statement (Stages 1 & 2)

- **Classification**: **Bounded Task** (`1` client-side storage state entity `ReminderState` + pure rule contracts, `0` DB schema migrations, `1` Chrome Extension MV3 background notification & alarm flow, `1` persona `Authenticated Learner`). See [00-intake.md](./00-intake.md).
- **Problem**: Passive toolbar badges (`US-ECO-05`) can be missed when learners are immersed in browsing or have the extension icon pinned out of sight when their evening study time arrives or when their streak is at risk (`streakAtRisk = true`). WordStreak needs an intelligent, non-spammy system notification engine (`reminderRules.ts`) with **Học ngay (Study Now)** and **Để sau (Snooze)** actions, quiet hours enforcement, a 3-notifications/day ceiling, and automatic frequency reduction (`3 consecutive ignores → max 1/day`).
- **Target Metrics**:
  - `+20%` increase in timely evening review sessions and streak-save conversions via the Extension **"Học ngay"** button.
  - `< 1%` notification-induced extension uninstall rate via quiet hours (`22:00–07:00`), 120-minute cooldown, and 3-ignore frequency backoff.
  - `< 5ms` pure `evaluateReminderRules` execution time and `< 150ms` notification click response time.
- **Elicitation Record**: See [01-elicitation.md](./01-elicitation.md).

---

## 2. Approved Domain Model Summary (Stage 4)

- **Manifest & Default Settings (`BR-REMD-001`)**:
  - Add `"notifications"` permission to `apps/extension/manifest.json`.
  - Default reminder settings in `DEFAULT_SETTINGS` / `ExtensionSettingsPayload`: `remindersEnabled: true`, `dailyReminderTime: "20:00"`, `quietHoursStart: "22:00"`, `quietHoursEnd: "07:00"`, `streakAtRiskReminderEnabled: true`.
- **State Normalization & Quiet Hours (`BR-REMD-002`, `BR-REMD-003`)**:
  - Persist `ReminderState` under `ws_reminder_state` in `chrome.storage.local`. Reset `sentTodayCount = 0` and `dailyReminderSentToday = false` on local calendar date (`YYYY-MM-DD`) rollover while preserving `consecutiveIgnores`.
  - Suppress notifications (`reason: "QUIET_HOURS"`) during `[quietHoursStart, quietHoursEnd)`, supporting both same-day and overnight wrap-around windows (`22:00–07:00`).
- **Daily Ceiling, Backoff & Cooldown (`BR-REMD-004`, `BR-REMD-005`)**:
  - Effective daily cap is `3/day` when `consecutiveIgnores < 3`, and `1/day` when `consecutiveIgnores >= 3`.
  - Enforce a 120-minute intra-day cooldown (`MIN_COOLDOWN_MS = 120 * 60 * 1000`) and active snooze suppression (`snoozedUntil > nowMs`) for non-snooze triggers.
- **Pure Rule Engine (`BR-REMD-006` — `reminderRules.ts`)**:
  - Pure `evaluateReminderRules(input)` evaluates auth, `remindersEnabled`, quiet hours, daily cap, snooze/cooldown, and study conditions (`SNOOZE_ALARM`, `DAILY_ALARM` / catch-up after `dailyReminderTime`, and `PERIODIC_SYNC` when `streakAtRisk === true`), selecting `notificationType` in priority order: `"STREAK_AT_RISK"` → `"DUE_CARDS"` → `"DAILY_GOAL"`.
- **Alarms, Snooze & Consecutive Ignore Lifecycle (`BR-REMD-007`, `BR-REMD-008`)**:
  - Recurring `"daily-reminder"` alarm (`periodInMinutes: 1440`) aligned to next `dailyReminderTime`; one-shot `"ws-reminder-snooze"` alarm (`delayInMinutes: 60`) on clicking **"Để sau"**.
  - Increment `consecutiveIgnores` when an active notification is closed (`onClosed`) or superseded without user interaction; reset `consecutiveIgnores = 0` on clicking **"Học ngay"**, clicking the notification body, clicking **"Để sau"**, or completing study activity on the Web App (`WORDSTREAK_REVIEW_SYNC` / `studiedToday` increases).
- **Smart `/review` Tab Navigation & EN/VI Localization (`BR-REMD-009`, `BR-REMD-010`)**:
  - Clicking **"Học ngay"** or the notification body focuses and navigates an existing `${WEB_APP_URL}/*` tab to `${WEB_APP_URL}/review` if open, or creates a new active tab at `${WEB_APP_URL}/review`.
  - Bilingual EN/VI copy resolved via `user?.preferredLanguage ?? settings?.preferredLanguage ?? browserUiLang ?? "vi"`.
- **Full Domain Model**: See [03-domain-model.md](./03-domain-model.md).

---

## 3. Scope Boundaries & Risk Register Summary (Stage 5)

- **Contradiction Scan**: Zero logic contradictions, zero state deadlocks, zero backward-compatibility breaks, zero DB migrations.
- **MoSCoW Summary**:
  - **Must-Have (P0)**: `"notifications"` permission in `manifest.json`; shared types in `@wordstreak/shared-types` (`ReminderState`, `ReminderDecision`, `ExtensionSettingsPayload` reminder fields, `ExtensionUserSummary.preferredLanguage`); `ws_reminder_state` storage helpers; pure `reminderRules.ts` (`evaluateReminderRules`, `isWithinQuietHours`, `normalizeReminderStateForDate`, `computeNextDailyReminderTime`, `buildReminderNotificationCopy`); `reminder-manager.ts` (`daily-reminder` & `ws-reminder-snooze` alarms, `onClicked`/`onButtonClicked`/`onClosed`, `/review` tab navigation, Web App study reset); integration in `background/index.ts` & `badge-manager.ts`; unit tests.
  - **Won't-Have (Out of Scope)**: Options Page UI controls for reminder settings (`US-ECO-07`), In-Popup 5-card micro-review (`US-ECO-08`), Web Push / Email reminders (`US-ECO-09`).
- **Full Risk Assessment & Scope**: See [04-risk-scope.md](./04-risk-scope.md).

---

## 4. Specification & IEEE 29148 Validation Summary (Stages 6 & 7)

- **Formal Requirements & User Stories**: `REQ-REMD-001` through `REQ-REMD-010` in [spec/srs.md](./spec/srs.md) and Gherkin `US-ECO-06` (8 Given-When-Then scenarios) in [spec/user-stories.md](./spec/user-stories.md).
- **Validation Result**: `PASS` (8/8 IEEE 29148 criteria passed across all 10 REQs and `US-ECO-06`; unbroken traceability matrix). See [06-validation-report.md](./06-validation-report.md).

---

## 5. Handover Brief (Stage 8 — For Phase 2–4 `system-architect` & Phase 5 Implementation)

### What's Being Built
1. **Shared Types (`packages/shared-types/src/extension.ts`)**: Add `preferredLanguage?: AppLanguage` to `ExtensionUserSummary`, reminder configuration fields to `ExtensionSettingsPayload`, and `ReminderState`, `ReminderTriggerSource`, `ReminderNotificationType`, `ReminderEvaluationInput`, and `ReminderDecision` contracts.
2. **Manifest, Constants & Storage (`apps/extension/manifest.json`, `src/shared/constants.ts`, `src/shared/storage.ts`, `src/background/api-client.ts`)**: Add `"notifications"` permission, `ALARM_NAMES.DAILY_REMINDER = "daily-reminder"`, `ALARM_NAMES.REMINDER_SNOOZE = "ws-reminder-snooze"`, `STORAGE_KEYS.REMINDER_STATE = "ws_reminder_state"`, `DEFAULT_REMINDER_STATE`, `DEFAULT_SETTINGS` reminder defaults, `extensionStorage.getReminderState()` / `setReminderState()` / `resetReminderState()`, and `preferredLanguage` preservation in `apiClient.getMe()`.
3. **Pure Reminder Rules Engine (`apps/extension/src/background/reminderRules.ts`)**: Implement pure, side-effect-free `parseTimeToMinutes`, `getLocalDateAndMinutes`, `isWithinQuietHours`, `normalizeReminderStateForDate`, `computeNextDailyReminderTime`, `evaluateReminderRules`, `resolveReminderLanguage`, and `buildReminderNotificationCopy` (EN/VI).
4. **Reminder Manager & Background Wiring (`apps/extension/src/background/reminder-manager.ts`, `src/background/badge-manager.ts`, `src/background/index.ts`)**: Orchestrate `daily-reminder` and `ws-reminder-snooze` alarms, evaluate rules after summary refreshes and alarm wakeups, create OS notifications with **"Học ngay"** / **"Để sau"** buttons, handle `onClicked` / `onButtonClicked` / `onClosed`, focus or open `${WEB_APP_URL}/review`, and reset `consecutiveIgnores` on Web App review sync.

### What's Explicitly Out of Scope
- Options Page UI controls for reminder settings (`US-ECO-07`).
- Popup 5-card micro-review flashcard flow (`US-ECO-08`).
- Mobile/PWA Web Push & Email notifications (`US-ECO-09`).

### Known Accepted Risks / Gaps
- None. All risks (`RISK-REMD-001`..`005`) have concrete code-level mitigations in [04-risk-scope.md](./04-risk-scope.md).

### Next Step
Present **Confirmation Gate 1** to the user, then dispatch `system-architect` (Phase 2–4) to generate `spec.md`, `plan.md`, and `tasks.md` in `.specify/features/extension-reminder-notifications/`.
