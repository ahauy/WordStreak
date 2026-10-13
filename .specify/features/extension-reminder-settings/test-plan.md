# Test Plan — US-ECO-07: Cài đặt nhắc học (Options Page) (`extension-reminder-settings`)

- **Feature Slug**: `extension-reminder-settings`
- **Backlog ID**: `US-ECO-07`
- **Test Runner**: `pnpm --filter @wordstreak/extension test` (Vitest)
- **Governance Note**: `ponytail` is **OFF** for test coverage — 100% of `TC-ERS-001`..`TC-ERS-016` MUST be implemented and passing.

---

## 1. Test Case Matrix (`TC-ERS-###`)

| Test Case ID | Target File | Scenario / Edge Case Covered | Requirement / Story |
| :--- | :--- | :--- | :--- |
| **TC-ERS-001** | `apps/extension/src/shared/storage.spec.ts` | Returns `DEFAULT_SETTINGS` (including `badgeEnabled: true`, `remindersEnabled: true`, `dailyReminderTime: "20:00"`, `quietHoursStart: "22:00"`, `quietHoursEnd: "07:00"`, `streakAtRiskReminderEnabled: true`) when both `sync` and `local` storage are empty. | `REQ-ERS-01`, `US-ERS-01` |
| **TC-ERS-002** | `apps/extension/src/shared/storage.spec.ts` | Performs one-time read-through migration: when `chrome.storage.sync['ws_settings']` is empty and `chrome.storage.local['ws_settings']` has legacy settings, merges with `DEFAULT_SETTINGS` and writes to `chrome.storage.sync`. | `REQ-ERS-02`, `US-ERS-04` |
| **TC-ERS-003** | `apps/extension/src/shared/storage.spec.ts` | Persists updated settings to `chrome.storage.sync` (and local mirror) and sanitizes malformed/empty `"HH:mm"` strings back to `DEFAULT_SETTINGS` times. | `REQ-ERS-02`, `REQ-ERS-07`, `US-ERS-01` |
| **TC-ERS-004** | `apps/extension/src/shared/storage.spec.ts` | Gracefully falls back to `chrome.storage.local` when `chrome.storage.sync.get` or `chrome.storage.sync.set` throws/rejects. | `REQ-ERS-02`, `US-ERS-04` |
| **TC-ERS-005** | `apps/extension/src/background/badge-manager.spec.ts` | `applyBadgeVisuals` sets badge text to `""` when `badgeEnabled === false` even if `isAuthenticated === true` and `dueCount > 0`. | `REQ-ERS-03`, `US-ERS-03` |
| **TC-ERS-006** | `apps/extension/src/background/badge-manager.spec.ts` | `refreshBadgeNow` continues fetching and caching `ReviewSummaryDto` and running `reminderManager.evaluateFromSummary` when `badgeEnabled === false`, while keeping badge text `""`. | `REQ-ERS-03`, `US-ERS-03` |
| **TC-ERS-007** | `apps/extension/src/background/badge-manager.spec.ts` | `refreshBadgeFromCache` immediately restores badge text and background color (`#863BFF` / `#EF4444`) from `ws_review_summary_cache` when `badgeEnabled` is toggled back to `true`. | `REQ-ERS-03`, `US-ERS-03` |
| **TC-ERS-008** | `apps/extension/src/background/reminder-manager.spec.ts` | `ensureDailyReminderAlarm` clears `daily-reminder` alarm, `ws-reminder-snooze` alarm, AND active `ws-study-reminder` notification when `remindersEnabled === false`. | `REQ-ERS-04`, `US-ERS-01` |
| **TC-ERS-009** | `apps/extension/src/background/reminder-manager.spec.ts` | `ensureDailyReminderAlarm` reschedules `daily-reminder` alarm at the newly saved `dailyReminderTime` when `remindersEnabled === true` and user is authenticated. | `REQ-ERS-04`, `REQ-ERS-08`, `US-ERS-01` |
| **TC-ERS-010** | `apps/extension/src/background/reminder-manager.spec.ts` | `UPDATE_SETTINGS` and `chrome.storage.onChanged` sync updates trigger both `badgeManager.refreshBadgeFromCache()` and `reminderManager.ensureDailyReminderAlarm()`. | `REQ-ERS-08`, `US-ERS-01`, `US-ERS-04` |
| **TC-ERS-011** | `apps/extension/src/options/options-app.spec.tsx` | Renders the **"Nhắc học & Huy hiệu"** section in `OptionsApp.tsx` with `badgeEnabled`, `remindersEnabled`, `dailyReminderTime`, `streakAtRiskReminderEnabled`, `quietHoursStart`, and `quietHoursEnd` controls populated from settings. | `REQ-ERS-05`, `US-ERS-01`, `US-ERS-03` |
| **TC-ERS-012** | `apps/extension/src/options/options-app.spec.tsx` | Disables child reminder controls (`dailyReminderTime`, `streakAtRiskReminderEnabled`, `quietHoursStart`, `quietHoursEnd`) when `remindersEnabled === false` while preserving their configured values. | `REQ-ERS-06`, `US-ERS-01` |
| **TC-ERS-013** | `apps/extension/src/options/options-app.spec.tsx` | `getQuietHoursHint` and `OptionsApp` detect overnight (`22:00`–`07:00`, reminder `23:30` or `06:15`) and same-day (`09:00`–`17:00`, reminder `12:00`) Quiet Hours overlap and render the non-blocking warning banner. | `REQ-ERS-07`, `US-ERS-02` |
| **TC-ERS-014** | `apps/extension/src/options/options-app.spec.tsx` | Half-open boundary check: when `dailyReminderTime === quietHoursEnd` (e.g. `07:00`), no overlap warning is shown; when `dailyReminderTime === quietHoursStart` (e.g. `22:00`), overlap warning is shown. | `REQ-ERS-07`, `US-ERS-02` |
| **TC-ERS-015** | `apps/extension/src/options/options-app.spec.tsx` | When `quietHoursStart === quietHoursEnd` (e.g. `22:00` and `22:00`), renders the non-blocking hint that Quiet Hours are disabled. | `REQ-ERS-07`, `US-ERS-02` |
| **TC-ERS-016** | `apps/extension/src/options/options-app.spec.tsx` | Clicking `"Lưu thay đổi"` persists settings via `extensionStorage.updateSettings` and dispatches `{ type: "UPDATE_SETTINGS" }` message even when a Quiet Hours overlap warning is active. | `REQ-ERS-07`, `REQ-ERS-08`, `US-ERS-01`, `US-ERS-02` |
