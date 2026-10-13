# Technical Specification — US-ECO-07: Cài đặt nhắc học (Options Page) (`extension-reminder-settings`)

- **Feature Slug**: `extension-reminder-settings`
- **Backlog ID**: `US-ECO-07`
- **Baseline Reference**: `.specify/features/extension-reminder-settings/baseline.md`

---

## 1. Functional Requirements (`REQ-ERS-###`)

| ID | Requirement Statement | Derived From |
| :--- | :--- | :--- |
| **REQ-ERS-01** | The shared `ReminderSettings` interface (`packages/shared-types/src/extension.ts`) and `DEFAULT_SETTINGS` (`apps/extension/src/shared/constants.ts`) SHALL include `badgeEnabled: boolean` (default `true`). | `ASM-ERS-002`, `BR-ERS-01` |
| **REQ-ERS-02** | `extensionStorage.getSettings()` and `extensionStorage.updateSettings()` SHALL persist `ws_settings` in `chrome.storage.sync`, performing a one-time read-through migration from `chrome.storage.local['ws_settings']` when `chrome.storage.sync['ws_settings']` is unpopulated, and falling back to `chrome.storage.local` / `localStorage` if `chrome.storage.sync` is unavailable or rejects. | `ASM-ERS-002`, `BR-ERS-02`, `BR-ERS-08` |
| **REQ-ERS-03** | `BadgeManager.applyBadgeVisuals()` SHALL check `settings.badgeEnabled`; when `false`, it SHALL immediately set `chrome.action.setBadgeText({ text: "" })` while keeping background `ReviewSummaryDto` fetching and caching active. `BadgeManager.refreshBadgeFromCache()` SHALL re-apply badge visuals immediately from cached summary state when `badgeEnabled` changes. | `ASM-ERS-002`, `BR-ERS-03` |
| **REQ-ERS-04** | When `settings.remindersEnabled` is `false`, `ReminderManager.ensureDailyReminderAlarm()` SHALL clear both `daily-reminder` and `ws-reminder-snooze` alarms and clear any active `ws-study-reminder` notification. | `ASM-ERS-003`, `BR-ERS-04` |
| **REQ-ERS-05** | `OptionsApp.tsx` SHALL render a **"Nhắc học & Huy hiệu"** section containing controls for `badgeEnabled`, `remindersEnabled`, `dailyReminderTime`, `streakAtRiskReminderEnabled`, `quietHoursStart`, and `quietHoursEnd` following the WordStreak minimal white canvas (`#ffffff`), `1px solid #e5e5e5` hairline borders, `#863bff` accent, and `#000000` pill CTA design system. | `ASM-ERS-001`, `BR-ERS-01` |
| **REQ-ERS-06** | When `remindersEnabled` is toggled off in `OptionsApp.tsx`, child reminder controls (`dailyReminderTime`, `streakAtRiskReminderEnabled`, `quietHoursStart`, `quietHoursEnd`) SHALL be visually disabled (`disabled` attribute and reduced container opacity) while retaining their values in state and storage. | `ASM-ERS-003`, `BR-ERS-04` |
| **REQ-ERS-07** | `OptionsApp.tsx` SHALL display a non-blocking inline warning when `remindersEnabled === true` and `dailyReminderTime` falls within `[quietHoursStart, quietHoursEnd)`, and a non-blocking inline hint when `quietHoursStart === quietHoursEnd`, without blocking form submission. | `ASM-ERS-003`, `BR-ERS-06`, `BR-ERS-07` |
| **REQ-ERS-08** | Saving settings in `OptionsApp.tsx` (via `UPDATE_SETTINGS` message) or receiving a `chrome.storage.onChanged` event for `ws_settings` in the background service worker SHALL immediately invoke `badgeManager.refreshBadgeFromCache()` and `reminderManager.ensureDailyReminderAlarm()`. | `ASM-ERS-003`, `BR-ERS-05` |

---

## 2. User Stories & Given-When-Then Scenarios (`US-ERS-###`)

### US-ERS-01: Configure Study Reminders & Quiet Hours in Options Page
- **Scenario 1.1 (Happy Path — Update Reminder Time & Quiet Hours)**:
  - **Given** the user opens `OptionsApp.tsx` with default settings (`remindersEnabled: true`, `dailyReminderTime: "20:00"`, `quietHoursStart: "22:00"`, `quietHoursEnd: "07:00"`, `streakAtRiskReminderEnabled: true`)
  - **When** the user changes `dailyReminderTime` to `"19:30"`, `quietHoursStart` to `"23:00"`, `quietHoursEnd` to `"06:30"`, toggles `streakAtRiskReminderEnabled` to `false`, and clicks `"Lưu thay đổi"`
  - **Then** the updated settings are persisted to `chrome.storage.sync`, `UPDATE_SETTINGS` triggers `reminderManager.ensureDailyReminderAlarm()` for `"19:30"`, and `"Đã lưu cài đặt!"` is shown.
- **Scenario 1.2 (Master Reminder Toggle Off Disables Child Controls & Clears Alarms)**:
  - **Given** `remindersEnabled` is `true` and a `daily-reminder` or `ws-reminder-snooze` alarm is scheduled
  - **When** the user toggles `remindersEnabled` to `false` and saves
  - **Then** child reminder inputs are disabled in the UI while preserving their values (`"19:30"`, `"23:00"`, `"06:30"`), and `reminderManager.ensureDailyReminderAlarm()` clears `daily-reminder`, `ws-reminder-snooze`, and any active `ws-study-reminder` notification.

### US-ERS-02: Quiet Hours Conflict & Equal-Boundary Inline Hints
- **Scenario 2.1 (Daily Reminder Inside Overnight or Same-Day Quiet Hours)**:
  - **Given** `remindersEnabled` is `true` and Quiet Hours are `"22:00"` to `"07:00"`
  - **When** the user sets `dailyReminderTime` to `"23:15"` (or `"06:00"`)
  - **Then** `OptionsApp.tsx` immediately renders a non-blocking warning that the daily reminder time falls within Quiet Hours, and clicking `"Lưu thay đổi"` still saves the settings.
- **Scenario 2.2 (Quiet Hours Disabled When Start Equals End)**:
  - **Given** `remindersEnabled` is `true`
  - **When** the user sets both `quietHoursStart` and `quietHoursEnd` to `"22:00"`
  - **Then** `OptionsApp.tsx` displays an inline hint indicating Quiet Hours are disabled because start and end times are identical, and no overlap warning is shown.

### US-ERS-03: Toggle Toolbar Due-Cards Badge Visibility
- **Scenario 3.1 (Disable Toolbar Badge Without Stopping Background Sync)**:
  - **Given** the authenticated user has `dueCount: 12` displayed on the extension badge and `badgeEnabled: true`
  - **When** the user toggles `badgeEnabled` to `false` and saves
  - **Then** `chrome.action.setBadgeText({ text: "" })` is called immediately, while periodic `ReviewSummaryDto` refreshes remain active.
- **Scenario 3.2 (Re-enable Toolbar Badge Restores Cached Count Immediately)**:
  - **Given** `badgeEnabled` is `false` and `ws_review_summary_cache` holds `dueCount: 12, streakAtRisk: true`
  - **When** the user toggles `badgeEnabled` to `true` and saves
  - **Then** `badgeManager.refreshBadgeFromCache()` immediately restores badge text `"12"` and background color `#EF4444` without waiting for the 30-minute alarm.

### US-ERS-04: Cross-Device Settings Sync & Legacy Local Migration
- **Scenario 4.1 (One-Time Read-Through Migration from `chrome.storage.local`)**:
  - **Given** `chrome.storage.sync['ws_settings']` is `undefined` and `chrome.storage.local['ws_settings']` contains `{ pinnedDeckId: "deck-9", autoShowFloatingIcon: false }`
  - **When** `extensionStorage.getSettings()` is called
  - **Then** it merges the local settings with `DEFAULT_SETTINGS` (including `badgeEnabled: true`), writes the merged payload to `chrome.storage.sync`, and returns it.
- **Scenario 4.2 (Fallback When `chrome.storage.sync` Fails or Is Unavailable)**:
  - **Given** `chrome.storage.sync.get` or `chrome.storage.sync.set` rejects with an error
  - **When** `extensionStorage.getSettings()` or `extensionStorage.updateSettings()` is invoked
  - **Then** it gracefully falls back to `chrome.storage.local` without throwing an unhandled exception.

---

## 3. Edge Case Matrix

| Edge Case | Input / State | Expected System Behavior |
| :--- | :--- | :--- |
| **Overnight Quiet Hours Overlap** | `quietHoursStart: "22:00"`, `quietHoursEnd: "07:00"`, `dailyReminderTime: "00:30"` | Overlap helper returns `true`; inline warning is displayed in `OptionsApp.tsx`. |
| **Boundary End Time (`dailyReminderTime === quietHoursEnd`)** | `quietHoursStart: "22:00"`, `quietHoursEnd: "07:00"`, `dailyReminderTime: "07:00"` | Window is half-open `[start, end)`. `"07:00"` is NOT inside Quiet Hours; no warning shown. |
| **Empty / Malformed Time String on Save** | `dailyReminderTime: ""` (cleared native time input) | Sanitized back to `DEFAULT_SETTINGS.dailyReminderTime` (`"20:00"`) before persisting. |
| **Unauthenticated User Saves Reminder Settings** | `ws_token: null`, user updates `dailyReminderTime: "18:00"` | Settings persist to `chrome.storage.sync`; `ensureDailyReminderAlarm()` keeps alarms cleared and badge text `""`. |
| **Cross-Device Sync Arrival (`chrome.storage.onChanged`)** | Remote Chrome profile updates `ws_settings` in `sync` area | Background `storage.onChanged` listener runs `badgeManager.refreshBadgeFromCache()` and `reminderManager.ensureDailyReminderAlarm()`. |

---

## 4. IEEE 29148 Quality Validation

- **Unambiguous & Singular**: Every `REQ-ERS-01..08` specifies exact module boundaries, field names, and fallback rules.
- **Feasible & Minimal (`ponytail` aligned)**: Zero backend changes, zero new npm packages, reuses existing `reminderRules.ts` time math.
- **Verifiable**: 100% of requirements map to deterministic unit/component test cases (`TC-ERS-001`..`TC-ERS-016`).

---

## 5. Requirement Traceability Matrix

| Business Goal | Requirement ID | User Story | Test Case IDs (`test-plan.md`) |
| :--- | :--- | :--- | :--- |
| `GOAL-ERS-01` | `REQ-ERS-01` | `US-ERS-01`, `US-ERS-03` | `TC-ERS-001` |
| `GOAL-ERS-01` | `REQ-ERS-02` | `US-ERS-04` | `TC-ERS-002`, `TC-ERS-003`, `TC-ERS-004` |
| `GOAL-ERS-01` | `REQ-ERS-03` | `US-ERS-03` | `TC-ERS-005`, `TC-ERS-006`, `TC-ERS-007` |
| `GOAL-ERS-01` | `REQ-ERS-04` | `US-ERS-01` | `TC-ERS-008`, `TC-ERS-009` |
| `GOAL-ERS-01` | `REQ-ERS-05` | `US-ERS-01`, `US-ERS-03` | `TC-ERS-011`, `TC-ERS-014` |
| `GOAL-ERS-01` | `REQ-ERS-06` | `US-ERS-01` | `TC-ERS-012` |
| `GOAL-ERS-01` | `REQ-ERS-07` | `US-ERS-02` | `TC-ERS-013`, `TC-ERS-015` |
| `GOAL-ERS-01` | `REQ-ERS-08` | `US-ERS-01`, `US-ERS-03`, `US-ERS-04` | `TC-ERS-010`, `TC-ERS-016` |
