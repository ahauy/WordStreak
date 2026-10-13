# Test Plan: Conditional Study Reminder Notifications (`US-ECO-06`)

**Feature slug**: `extension-reminder-notifications`  
**Baseline version**: 1.0 (SIGNED-OFF)  
**Written by**: `backend-developer` (Antigravity) — Stage TDD  
**Traces to**: [`.specify/features/extension-reminder-notifications/spec/user-stories.md`](./spec/user-stories.md), [`spec/srs.md`](./spec/srs.md), [`spec.md`](./spec.md), [`plan.md`](./plan.md), [`contracts/extension-reminder-contracts.md`](./contracts/extension-reminder-contracts.md)

> **Mục đích**: Tài liệu này định nghĩa toàn bộ 16 automated test cases (`TC-REMD-001`..`TC-REMD-016`) dưới chuẩn Gherkin BDD, bao quát toàn bộ 8 User Story Scenarios (`US-ECO-06`), 10 Yêu cầu Kỹ thuật (`REQ-REMD-001`..`REQ-REMD-010`), và 8 Boundary Edge Cases (`EC-REMD-01`..`EC-REMD-08`) trước khi thực hiện code.

---

## Unit Tests

### 1. Extension Storage Module (`apps/extension/src/shared/`)

#### TC-REMD-001: Reminder State Persistence, Reset & Default Settings Merge
```gherkin
Given chrome.storage.local (or localStorage fallback environment) is initialized
When  getSettings() is called on empty storage
Then  returned settings include remindersEnabled: true, dailyReminderTime: "20:00", quietHoursStart: "22:00", quietHoursEnd: "07:00", streakAtRiskReminderEnabled: true
When  setReminderState({ lastResetDate: "2026-10-13", sentTodayCount: 1, dailyReminderSentToday: true, consecutiveIgnores: 0, lastNotifiedAt: "2026-10-13T13:00:00.000Z", snoozedUntil: null, activeNotificationId: "ws-study-reminder", lastStudiedToday: 5 }) is called
Then  chrome.storage.local persists data under key "ws_reminder_state"
  And getReminderState() returns the exact stored state merged with DEFAULT_REMINDER_STATE
  And getAll() includes reminderState in its returned ExtensionStorageState
When  resetReminderState() is called
Then  getReminderState() resolves to DEFAULT_REMINDER_STATE with empty lastResetDate and zero counters
```
- **File**: `apps/extension/src/shared/storage.spec.ts`
- **Priority**: Must-Have (P0)
- **Status**: [x] Passed (`T006` / `T011`)
- **Traces to**: `REQ-REMD-001`, `REQ-REMD-002`, `BR-REMD-001`, `BR-REMD-002`
- **Mock Strategy**: In-memory dictionary mocking `chrome.storage.local.get`, `set`, `remove`. Verify fallback when `chrome` is undefined.

---

### 2. Extension Background API Client (`apps/extension/src/background/`)

#### TC-REMD-002: API Client Preserves `preferredLanguage` on `getMe` and `login`
```gherkin
Given the API server returns user JSON with preferredLanguage: "vi" or "en"
When  apiClient.getMe() succeeds
Then  returned user summary includes preferredLanguage: "vi"
When  apiClient.login({ identifier: "user", password: "pwd" }) succeeds
Then  returned payload.user includes preferredLanguage: "en"
```
- **File**: `apps/extension/src/background/api-client.spec.ts`
- **Priority**: Must-Have (P0)
- **Status**: [x] Passed (`T007` / `T012`)
- **Traces to**: `REQ-REMD-010`, `BR-REMD-010`, `ASM-REMD-007`
- **Mock Strategy**: Mock global `fetch` returning user object with `preferredLanguage`.

---

### 3. Pure Reminder Rules Engine (`apps/extension/src/background/reminderRules.ts`)

#### TC-REMD-003: Pure Rule Engine: Time Parsing & Quiet Hours Evaluation
```gherkin
Given quiet hours configured as start "22:00" and end "07:00" (overnight wrap-around)
When  isWithinQuietHours is evaluated at local time 21:59
Then  it returns false
When  isWithinQuietHours is evaluated at local time 22:00, 23:30, 02:30, 06:59
Then  it returns true
When  isWithinQuietHours is evaluated at local time 07:00
Then  it returns false
Given quiet hours configured as same-day window start "13:00" and end "15:00"
When  isWithinQuietHours is evaluated at local time 12:59, 15:00
Then  it returns false
When  isWithinQuietHours is evaluated at local time 13:00, 14:30
Then  it returns true
Given quiet hours configured with equal start and end "00:00" and "00:00"
When  isWithinQuietHours is evaluated at any time
Then  it returns false (quiet hours disabled)
Given an invalid timezone string like "Invalid/Timezone"
When  getLocalDateAndMinutes or isWithinQuietHours is evaluated
Then  it falls back safely to UTC or system timezone without throwing
```
- **File**: `apps/extension/src/background/reminderRules.spec.ts`
- **Priority**: Must-Have (P0)
- **Status**: [x] Passed
- **Traces to**: `US-ECO-06` Scenario 4, `REQ-REMD-003`, `BR-REMD-003`, `EC-REMD-07`
- **Mock Strategy**: 100% pure unit test with parameterized timestamps across various timezones (`UTC`, `Asia/Ho_Chi_Minh`, `America/New_York`).

---

#### TC-REMD-004: Pure Rule Engine: Local Date Rollover & Ignored Toast Accounting
```gherkin
Given a reminder state with lastResetDate "2026-10-12", sentTodayCount: 2, dailyReminderSentToday: true, consecutiveIgnores: 1
When  normalizeReminderStateForDate is called with same local date "2026-10-12"
Then  it returns an identical copy without mutation
When  normalizeReminderStateForDate is called with new local date "2026-10-13" and activeNotificationId null
Then  sentTodayCount is reset to 0
  And dailyReminderSentToday is reset to false
  And consecutiveIgnores is preserved as 1
  And lastResetDate is updated to "2026-10-13"
When  normalizeReminderStateForDate is called with new local date "2026-10-13" and activeNotificationId "ws-study-reminder"
Then  consecutiveIgnores is incremented to 2 (unclicked notification superseded across midnight)
  And activeNotificationId is cleared to null
  And sentTodayCount is reset to 0
```
- **File**: `apps/extension/src/background/reminderRules.spec.ts`
- **Priority**: Must-Have (P0)
- **Status**: [x] Passed
- **Traces to**: `US-ECO-06` Scenario 6, `REQ-REMD-002`, `BR-REMD-002`, `EC-REMD-04`, `EC-REMD-08`
- **Mock Strategy**: Pure function assertions with immutable input verification.

---

#### TC-REMD-005: Pure Rule Engine: Daily Reminder Alarm Time Calculation & Clamping
```gherkin
Given dailyReminderTime is "20:00" in timezone "Asia/Ho_Chi_Minh"
When  current local time is 18:30 on 2026-10-13
Then  computeNextDailyReminderTime returns epoch timestamp for 20:00 on 2026-10-13
When  current local time is 20:30 on 2026-10-13
Then  computeNextDailyReminderTime returns epoch timestamp for 20:00 on 2026-10-14 (tomorrow)
When  calculated time is less than 60,000ms ahead of nowMs (e.g. at 19:59:45)
Then  computeNextDailyReminderTime clamps to at least nowMs + 60,000ms
```
- **File**: `apps/extension/src/background/reminderRules.spec.ts`
- **Priority**: Must-Have (P0)
- **Status**: [x] Passed
- **Traces to**: `US-ECO-06` Scenario 1, `REQ-REMD-007`, `BR-REMD-007`
- **Mock Strategy**: Pure function evaluation with explicit `nowMs` epoch inputs.

---

#### TC-REMD-006: Pure Rule Engine: Daily Ceiling (3/day) & 3-Ignore Backoff (1/day)
```gherkin
Given consecutiveIgnores is 0 (normal learner)
When  evaluateReminderRules is evaluated with sentTodayCount: 0, 1, or 2
Then  effectiveDailyCap is 3 and evaluations proceed
When  evaluateReminderRules is evaluated with sentTodayCount: 3
Then  it returns shouldNotify: false, reason: "DAILY_CAP_REACHED", effectiveDailyCap: 3
Given consecutiveIgnores is 3 or 4 (disengaged learner)
When  evaluateReminderRules is evaluated with sentTodayCount: 0
Then  effectiveDailyCap is 1 and evaluation proceeds
When  evaluateReminderRules is evaluated with sentTodayCount: 1
Then  it returns shouldNotify: false, reason: "DAILY_CAP_REACHED", effectiveDailyCap: 1
```
- **File**: `apps/extension/src/background/reminderRules.spec.ts`
- **Priority**: Must-Have (P0)
- **Status**: [x] Passed
- **Traces to**: `US-ECO-06` Scenario 5, Scenario 6, `REQ-REMD-004`, `BR-REMD-004`
- **Mock Strategy**: Pure function calls passing varying `state.consecutiveIgnores` and `state.sentTodayCount`.

---

#### TC-REMD-007: Pure Rule Engine: 120-Minute Cooldown & Active Snooze Suppression
```gherkin
Given triggerSource is "DAILY_ALARM" or "PERIODIC_SYNC"
  And lastNotifiedAt was 45 minutes ago on the same day
When  evaluateReminderRules is called
Then  it returns shouldNotify: false, reason: "COOLDOWN_ACTIVE"
Given triggerSource is "DAILY_ALARM" or "PERIODIC_SYNC"
  And snoozedUntil is 30 minutes in the future
When  evaluateReminderRules is called
Then  it returns shouldNotify: false, reason: "SNOOZED_ACTIVE"
Given triggerSource is "SNOOZE_ALARM"
  And lastNotifiedAt was 60 minutes ago
  And snoozedUntil has passed or is active
When  evaluateReminderRules is called outside quiet hours and under daily cap
Then  cooldown and snooze checks are bypassed
  And it returns shouldNotify: true, reason: "SNOOZE_REMINDER"
Given triggerSource is "SNOOZE_ALARM"
  And current time falls within quiet hours (e.g. 22:30)
Then  quiet hours suppression takes precedence
  And it returns shouldNotify: false, reason: "QUIET_HOURS"
```
- **File**: `apps/extension/src/background/reminderRules.spec.ts`
- **Priority**: Must-Have (P0)
- **Status**: [x] Passed
- **Traces to**: `US-ECO-06` Scenario 3, Scenario 5, `REQ-REMD-005`, `BR-REMD-005`, `EC-REMD-02`
- **Mock Strategy**: Parameterized pure evaluation inputs with explicit timestamps.

---

#### TC-REMD-008: Pure Rule Engine: Conditional Study Evaluation, Sleep Catch-up & Priority Order
```gherkin
Given unauthenticated state or missing summary (null)
When  evaluateReminderRules is called
Then  it returns shouldNotify: false, reason: "UNAUTHENTICATED"
Given settings.remindersEnabled is false
When  evaluateReminderRules is called
Then  it returns shouldNotify: false, reason: "REMINDERS_DISABLED"
Given dueCount: 0, goalReached: true, streakAtRisk: false
When  evaluateReminderRules is called
Then  it returns shouldNotify: false, reason: "NO_STUDY_NEEDED"
Given triggerSource is "DAILY_ALARM" with dueCount: 5, goalReached: false
Then  it returns shouldNotify: true, reason: "DAILY_SCHEDULED", notificationType: "DUE_CARDS", markDailyReminderSent: true
Given triggerSource is "PERIODIC_SYNC" before dailyReminderTime with streakAtRisk: false
Then  it returns shouldNotify: false, reason: "NOT_YET_SCHEDULED_TIME"
Given triggerSource is "PERIODIC_SYNC" after dailyReminderTime with dailyReminderSentToday: false and dueCount: 4
Then  it returns shouldNotify: true, reason: "DAILY_SCHEDULED", notificationType: "DUE_CARDS", markDailyReminderSent: true
Given triggerSource is "PERIODIC_SYNC" with streakAtRisk: true and streakAtRiskReminderEnabled: true
Then  it returns shouldNotify: true, reason: "STREAK_AT_RISK", notificationType: "STREAK_AT_RISK"
Given streakAtRisk: true AND dueCount: 10 AND goalReached: false
Then  notificationType is "STREAK_AT_RISK" (Priority 1)
Given streakAtRisk: false AND dueCount: 10 AND goalReached: false
Then  notificationType is "DUE_CARDS" (Priority 2)
Given streakAtRisk: false AND dueCount: 0 AND goalReached: false
Then  notificationType is "DAILY_GOAL" (Priority 3)
```
- **File**: `apps/extension/src/background/reminderRules.spec.ts`
- **Priority**: Must-Have (P0)
- **Status**: [x] Passed
- **Traces to**: `US-ECO-06` Scenario 1, Scenario 7, Scenario 8, `REQ-REMD-006`, `BR-REMD-006`, `EC-REMD-01`
- **Mock Strategy**: Pure evaluation against comprehensive decision table.

---

#### TC-REMD-009: Pure Rule Engine: Language Resolution & Bilingual Copy Templates
```gherkin
Given user.preferredLanguage is "en"
When  resolveReminderLanguage is called
Then  it returns "en"
Given user.preferredLanguage is undefined and settings.preferredLanguage is "vi"
When  resolveReminderLanguage is called
Then  it returns "vi"
Given both user and settings language undefined, browserUiLang is "en-US"
When  resolveReminderLanguage is called
Then  it returns "en"
Given both undefined and browserUiLang is "fr"
When  resolveReminderLanguage is called
Then  it falls back to default "vi"
When  buildReminderNotificationCopy is called for STREAK_AT_RISK in Vietnamese
Then  title is "🔥 Chuỗi {currentStreak} ngày sắp mất!"
  And buttons are [{ title: "Học ngay" }, { title: "Để sau" }]
  And priority is 2
When  buildReminderNotificationCopy is called for STREAK_AT_RISK in English
Then  title is "🔥 Your {currentStreak}-day streak is at risk!"
  And buttons are [{ title: "Study Now" }, { title: "Snooze" }]
  And priority is 2
When  buildReminderNotificationCopy is called for DUE_CARDS in Vietnamese
Then  title is "📚 Đến giờ ôn tập WordStreak!"
  And message contains "Bạn có {dueCount} thẻ từ vựng đến hạn cần ôn tập hôm nay."
  And priority is 1
When  buildReminderNotificationCopy is called for DAILY_GOAL in English
Then  title is "🎯 Reach your daily vocabulary goal!"
  And message contains "You've studied {studiedToday}/{dailyGoal} cards today."
  And priority is 1
```
- **File**: `apps/extension/src/background/reminderRules.spec.ts`
- **Priority**: Must-Have (P0)
- **Status**: [x] Passed
- **Traces to**: `US-ECO-06` Scenario 1, `REQ-REMD-010`, `BR-REMD-010`
- **Mock Strategy**: Pure string equality and regex checks on generated copy objects.

---

### 4. Background Reminder Manager (`apps/extension/src/background/reminder-manager.ts`)

#### TC-REMD-010: Reminder Manager: Daily Reminder Alarm Scheduling & Clearing
```gherkin
Given learner is authenticated and remindersEnabled is true
When  reminderManager.syncDailyReminderAlarm() is called
Then  chrome.alarms.create is called with name "daily-reminder" and periodInMinutes: 1440
Given learner has remindersEnabled: false or token is null
When  reminderManager.syncDailyReminderAlarm() is called
Then  chrome.alarms.clear is called for "daily-reminder"
  And chrome.alarms.clear is called for "ws-reminder-snooze"
```
- **File**: `apps/extension/src/background/reminder-manager.spec.ts`
- **Priority**: Must-Have (P0)
- **Status**: [x] Passed (`T009` / `T014`)
- **Traces to**: `US-ECO-06` Scenario 1, Scenario 8, `REQ-REMD-007`, `BR-REMD-007`
- **Mock Strategy**: Spy on `chrome.alarms.create` and `chrome.alarms.clear`.

---

#### TC-REMD-011: Reminder Manager: Localized Notification Creation & State Update
```gherkin
Given evaluateReminderRules returns shouldNotify: true for DUE_CARDS in Vietnamese
When  reminderManager.evaluateAndNotify("DAILY_ALARM") is called
Then  chrome.notifications.create is called with notificationId "ws-study-reminder"
  And notification options include title "📚 Đến giờ ôn tập WordStreak!", action buttons ["Học ngay", "Để sau"]
  And ws_reminder_state is updated in storage with sentTodayCount + 1, activeNotificationId: "ws-study-reminder", dailyReminderSentToday: true
```
- **File**: `apps/extension/src/background/reminder-manager.spec.ts`
- **Priority**: Must-Have (P0)
- **Status**: [x] Passed (`T009` / `T014`)
- **Traces to**: `US-ECO-06` Scenario 1, `REQ-REMD-006`, `REQ-REMD-010`, `BR-REMD-006`
- **Mock Strategy**: Mock `chrome.notifications.create` and `extensionStorage.setReminderState`.

---

#### TC-REMD-012: Reminder Manager: "Học ngay" / Body Click, Tab Focus/Create & Ignore Reset
```gherkin
Given active notification "ws-study-reminder" is displayed and consecutiveIgnores is 2
When  handleNotificationClicked("ws-study-reminder") or handleNotificationButtonClicked("ws-study-reminder", 0) is called
Then  consecutiveIgnores is reset to 0 in storage BEFORE calling chrome.notifications.clear
  And activeNotificationId is set to null
  And chrome.alarms.clear("ws-reminder-snooze") is called
  And chrome.notifications.clear("ws-study-reminder") is called
When  openOrFocusReviewTab finds an open tab matching "http://localhost:5173/*"
Then  it activates and updates that tab to "http://localhost:5173/review" and focuses the window
When  no open tab matches
Then  chrome.tabs.create is called with url "http://localhost:5173/review" and active: true
```
- **File**: `apps/extension/src/background/reminder-manager.spec.ts`
- **Priority**: Must-Have (P0)
- **Status**: [x] Passed (`T009` / `T014`)
- **Traces to**: `US-ECO-06` Scenario 2, `REQ-REMD-008`, `REQ-REMD-009`, `BR-REMD-008`, `BR-REMD-009`, `EC-REMD-03`
- **Mock Strategy**: Spies on `chrome.tabs.query`, `chrome.tabs.update`, `chrome.tabs.create`, `chrome.windows.update`, `chrome.notifications.clear`.

---

#### TC-REMD-013: Reminder Manager: "Để sau" (Snooze) Action & 60-Minute Alarm Scheduling
```gherkin
Given active notification "ws-study-reminder" is displayed
When  handleNotificationButtonClicked("ws-study-reminder", 1) is called at timestamp nowMs
Then  consecutiveIgnores is reset to 0 and activeNotificationId is set to null in storage BEFORE clearing
  And snoozedUntil is set to ISO string (nowMs + 60 minutes)
  And chrome.alarms.create is called with name "ws-reminder-snooze" and delayInMinutes: 60
  And chrome.notifications.clear("ws-study-reminder") is called
When  handleNotificationClosed("ws-study-reminder", true) fires immediately afterwards
Then  consecutiveIgnores is NOT incremented because activeNotificationId was already cleared
```
- **File**: `apps/extension/src/background/reminder-manager.spec.ts`
- **Priority**: Must-Have (P0)
- **Status**: [x] Passed (`T009` / `T014`)
- **Traces to**: `US-ECO-06` Scenario 3, `REQ-REMD-005`, `REQ-REMD-007`, `REQ-REMD-008`, `EC-REMD-03`
- **Mock Strategy**: Mock sequential execution of button click followed by `onClosed`.

---

#### TC-REMD-014: Reminder Manager: User Dismissal (`onClosed`) & Superseded Toast Ignore Accounting
```gherkin
Given active notification "ws-study-reminder" is displayed (activeNotificationId === "ws-study-reminder")
  And current consecutiveIgnores is 1
When  handleNotificationClosed("ws-study-reminder", true) is triggered by OS dismissal without click
Then  consecutiveIgnores is incremented to 2 in storage
  And activeNotificationId is cleared to null
When  a different notification ID closes (e.g. "other-toast")
Then  storage is NOT modified
Given activeNotificationId is "ws-study-reminder" and evaluateAndNotify runs for a new trigger
Then  the unclicked active notification is counted as an ignore (consecutiveIgnores += 1) before replacing
```
- **File**: `apps/extension/src/background/reminder-manager.spec.ts`
- **Priority**: Must-Have (P0)
- **Status**: [x] Passed (`T009` / `T014`)
- **Traces to**: `US-ECO-06` Scenario 6, `REQ-REMD-008`, `BR-REMD-008`, `EC-REMD-04`
- **Mock Strategy**: Test `handleNotificationClosed` and unclicked superseding logic.

---

#### TC-REMD-015: Reminder Manager: Web App Review Progress Detection & Reset
```gherkin
Given consecutiveIgnores is 3 and lastStudiedToday is 4
When  summary refresh reports studiedToday: 5 (> lastStudiedToday)
Then  consecutiveIgnores is reset to 0 in storage
  And lastStudiedToday is updated to 5
Given consecutiveIgnores is 2 and active notification is displayed
When  summary refresh reports dueCount: 0 and goalReached: true
Then  consecutiveIgnores is reset to 0
  And active notification is cleared via chrome.notifications.clear
  And activeNotificationId and snoozedUntil are cleared in storage
  And chrome.alarms.clear("ws-reminder-snooze") is called
```
- **File**: `apps/extension/src/background/reminder-manager.spec.ts`
- **Priority**: Must-Have (P0)
- **Status**: [x] Passed (`T009` / `T014`)
- **Traces to**: `US-ECO-06` Scenario 6, `REQ-REMD-008`, `BR-REMD-008`, `EC-REMD-05`
- **Mock Strategy**: Call `evaluateAndNotify("PERIODIC_SYNC", summary)` with updated review summary.

---

#### TC-REMD-016: Reminder Manager: Logout & 401 Session Cleanup
```gherkin
Given learner is logged out or API returns 401 Unauthorized
When  clearRemindersOnLogout() is called
Then  chrome.alarms.clear("daily-reminder") is called
  And chrome.alarms.clear("ws-reminder-snooze") is called
  And chrome.notifications.clear("ws-study-reminder") is called
  And activeNotificationId and snoozedUntil are set to null in storage
```
- **File**: `apps/extension/src/background/reminder-manager.spec.ts`
- **Priority**: Must-Have (P0)
- **Status**: [x] Passed (`T009` / `T014`)
- **Traces to**: `US-ECO-06` Scenario 8, `REQ-REMD-007`, `REQ-REMD-008`, `EC-REMD-06`
- **Mock Strategy**: Verify full cleanup on logout method call.

---

## Integration Tests

### 5. BadgeManager & ReminderManager Coordination (`apps/extension/src/background/badge-manager.ts`)

#### TC-REMD-INT-001: ReminderManager Integration via BadgeManager
```gherkin
Given BadgeManager successfully refreshes review summary
When  handleSuccessResult or handleNotModifiedResult executes
Then  reminderManager.handleWebReviewActivity is invoked with old and new summaries
  And reminderManager.evaluateFromSummary is invoked unless skipReminderEval is true
When  clearAuthAndBadge executes (logout or 401 response)
Then  reminderManager.clearRemindersAndAlarms is invoked to purge alarms and active notifications
```
- **File**: `apps/extension/src/background/badge-manager.spec.ts`
- **Priority**: Must-Have (P0)
- **Status**: [x] Passed
- **Traces to**: `REQ-REMD-006`, `REQ-REMD-008`, `EC-REMD-05`, `EC-REMD-06`
- **Mock Strategy**: Spy on `reminderManager` methods when invoking `badgeManager.refreshBadgeNow` and `badgeManager.clearAuthAndBadge`.

---

## Requirements & Edge Cases Traceability Matrix

| Test Case ID | Target File | Scenario Mapping | Requirement Mapping | Edge Case Mapping | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **TC-REMD-001** | `apps/extension/src/shared/storage.spec.ts` | — | `REQ-REMD-001`, `REQ-REMD-002` | — | [x] Passed |
| **TC-REMD-002** | `apps/extension/src/background/api-client.spec.ts` | — | `REQ-REMD-010` | — | [x] Passed |
| **TC-REMD-003** | `apps/extension/src/background/reminderRules.spec.ts` | `Scenario 4` | `REQ-REMD-003` | `EC-REMD-07` | [x] Passed |
| **TC-REMD-004** | `apps/extension/src/background/reminderRules.spec.ts` | `Scenario 6` | `REQ-REMD-002` | `EC-REMD-04`, `EC-REMD-08` | [x] Passed |
| **TC-REMD-005** | `apps/extension/src/background/reminderRules.spec.ts` | `Scenario 1` | `REQ-REMD-007` | — | [x] Passed |
| **TC-REMD-006** | `apps/extension/src/background/reminderRules.spec.ts` | `Scenario 5`, `Scenario 6` | `REQ-REMD-004` | — | [x] Passed |
| **TC-REMD-007** | `apps/extension/src/background/reminderRules.spec.ts` | `Scenario 3`, `Scenario 5` | `REQ-REMD-005` | `EC-REMD-02` | [x] Passed |
| **TC-REMD-008** | `apps/extension/src/background/reminderRules.spec.ts` | `Scenario 1`, `Scenario 7`, `Scenario 8` | `REQ-REMD-006` | `EC-REMD-01` | [x] Passed |
| **TC-REMD-009** | `apps/extension/src/background/reminderRules.spec.ts` | `Scenario 1` | `REQ-REMD-010` | — | [x] Passed |
| **TC-REMD-010** | `apps/extension/src/background/reminder-manager.spec.ts` | `Scenario 1`, `Scenario 8` | `REQ-REMD-007` | — | [x] Passed |
| **TC-REMD-011** | `apps/extension/src/background/reminder-manager.spec.ts` | `Scenario 1` | `REQ-REMD-006`, `REQ-REMD-010` | — | [x] Passed |
| **TC-REMD-012** | `apps/extension/src/background/reminder-manager.spec.ts` | `Scenario 2` | `REQ-REMD-008`, `REQ-REMD-009` | `EC-REMD-03` | [x] Passed |
| **TC-REMD-013** | `apps/extension/src/background/reminder-manager.spec.ts` | `Scenario 3` | `REQ-REMD-005`, `REQ-REMD-007`, `REQ-REMD-008` | `EC-REMD-03` | [x] Passed |
| **TC-REMD-014** | `apps/extension/src/background/reminder-manager.spec.ts` | `Scenario 6` | `REQ-REMD-008` | `EC-REMD-04` | [x] Passed |
| **TC-REMD-015** | `apps/extension/src/background/reminder-manager.spec.ts` | `Scenario 6` | `REQ-REMD-008` | `EC-REMD-05` | [x] Passed |
| **TC-REMD-016** | `apps/extension/src/background/reminder-manager.spec.ts` | `Scenario 8` | `REQ-REMD-007`, `REQ-REMD-008` | `EC-REMD-06` | [x] Passed |
| **TC-REMD-INT-001** | `apps/extension/src/background/badge-manager.spec.ts` | `Scenario 6`, `Scenario 8` | `REQ-REMD-006`, `REQ-REMD-008` | `EC-REMD-05`, `EC-REMD-06` | [x] Passed |

---

## Test Execution Commands

| Scope | Command | Purpose |
| :--- | :--- | :--- |
| **Shared Types Compilation** | `pnpm --filter @wordstreak/shared-types build` | Verify reminder types compile |
| **Pure Reminder Rules Spec** | `pnpm --filter @wordstreak/extension test src/background/reminderRules.spec.ts` | Pure rule engine TDD test suite |
| **Reminder Manager Spec** | `pnpm --filter @wordstreak/extension test src/background/reminder-manager.spec.ts` | Background reminder manager test suite |
| **Storage & API Spec** | `pnpm --filter @wordstreak/extension test src/shared/storage.spec.ts src/background/api-client.spec.ts` | Storage & API language preservation |
| **All Extension Tests** | `pnpm --filter @wordstreak/extension test` | Full regression verification |
