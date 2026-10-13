# Technical Plan — US-ECO-07: Cài đặt nhắc học (Options Page) (`extension-reminder-settings`)

- **Feature Slug**: `extension-reminder-settings`
- **Backlog ID**: `US-ECO-07`

---

## 1. `ponytail` 7-Rung Architecture Audit

| Rung | Principle | Application in `extension-reminder-settings` |
| :--- | :--- | :--- |
| **1. Delete / YAGNI** | Question unnecessary scope | Skip backend profile endpoints (per roadmap `[~]`). Do not touch `PopupApp.tsx`. |
| **2. Reuse Existing Code** | Use existing domain helpers | Reuse `parseTimeToMinutes` from `apps/extension/src/background/reminderRules.ts` for Quiet Hours conflict detection in `OptionsApp.tsx` (via a pure helper `getQuietHoursHint`). |
| **3. Native Platform APIs** | Prefer browser/HTML primitives | Use native `<input type="time">` and `<input type="checkbox">` controls and native `chrome.storage.sync` + `chrome.storage.onChanged`. |
| **4. Zero New Dependencies** | No external UI/time libraries | Zero `package.json` additions. Keep inline styles consistent with `OptionsApp.tsx` and `DESIGN.md` tokens (`#ffffff`, `#fbfbfb`, `#e5e5e5`, `#863bff`, `#000000`). |
| **5. No Single-Use Wrappers** | Extend existing modules | Extend `extensionStorage`, `BadgeManager`, `ReminderManager`, and `OptionsApp` directly instead of creating new manager classes. |

---

## 2. System Architecture & Data Flow

```mermaid
sequenceDiagram
    participant User as Learner (Options Page)
    participant Opt as OptionsApp.tsx
    participant Store as extensionStorage (sync + local)
    participant BG as background/index.ts
    participant BM as BadgeManager
    participant RM as ReminderManager

    User->>Opt: Opens Options Page
    Opt->>Store: getSettings()
    Store->>Store: Read chrome.storage.sync['ws_settings'] (migrate from local if empty)
    Store-->>Opt: ExtensionSettingsPayload
    User->>Opt: Edits badge/reminder/time fields (live Quiet Hours check via reminderRules)
    User->>Opt: Clicks "Lưu thay đổi"
    Opt->>BG: sendMessage({ type: "UPDATE_SETTINGS", payload })
    BG->>Store: updateSettings(payload) (writes sync + local mirror)
    BG->>BM: refreshBadgeFromCache()
    BM->>BM: applyBadgeVisuals(cachedSummary, isAuth) (clears if !badgeEnabled)
    BG->>RM: ensureDailyReminderAlarm()
    RM->>RM: Reschedule daily-reminder or clear alarms + active notification if !remindersEnabled
    BG-->>Opt: { success: true, data: updated }
```

---

## 3. Data Model & Contracts

### 3.1 Shared Types (`packages/shared-types/src/extension.ts`)

```typescript
export interface ReminderSettings {
  badgeEnabled?: boolean;
  remindersEnabled: boolean;
  dailyReminderTime: string;
  quietHoursStart: string;
  quietHoursEnd: string;
  streakAtRiskReminderEnabled: boolean;
  preferredLanguage?: AppLanguage;
}

export interface ExtensionSettingsPayload extends ReminderSettings {
  badgeEnabled: boolean;
  pinnedDeckId: string | null;
  autoShowFloatingIcon: boolean;
  shortcutKey: string;
  blacklistedDomains: string[];
}
```

### 3.2 Default Constants (`apps/extension/src/shared/constants.ts`)

```typescript
export const DEFAULT_SETTINGS: ExtensionSettingsPayload = {
  pinnedDeckId: null,
  autoShowFloatingIcon: true,
  shortcutKey: "Alt+W",
  blacklistedDomains: [] as string[],
  badgeEnabled: true,
  remindersEnabled: true,
  dailyReminderTime: "20:00",
  quietHoursStart: "22:00",
  quietHoursEnd: "07:00",
  streakAtRiskReminderEnabled: true,
};
```

### 3.3 Storage & Runtime Message Contracts

1. **`extensionStorage.getSettings()` / `updateSettings(partial)` (`apps/extension/src/shared/storage.ts`)**:
   - **Time Sanitization Helper (`sanitizeSettings(raw)`)**: Merges `DEFAULT_SETTINGS` with `raw`, ensuring `dailyReminderTime`, `quietHoursStart`, and `quietHoursEnd` match `/^([01]\d|2[0-3]):([0-5]\d)$/` (falling back to `DEFAULT_SETTINGS` if empty/malformed).
   - **Read Path**: If `chrome.storage?.sync` is available, read `chrome.storage.sync.get(STORAGE_KEYS.SETTINGS)`. If defined, return `sanitizeSettings(syncVal)`. If `undefined`, read `chrome.storage.local.get(STORAGE_KEYS.SETTINGS)`. If `localVal` exists, merge with `DEFAULT_SETTINGS`, write to `chrome.storage.sync.set({ [STORAGE_KEYS.SETTINGS]: merged })` (best-effort `try/catch`), and return `merged`. If `chrome.storage.sync` throws or is unavailable, fall back to `chrome.storage.local` / `localStorage`.
   - **Write Path**: Sanitize merged settings, write to `chrome.storage.sync` (with `try/catch` fallback) AND mirror to `chrome.storage.local` so offline/local reads stay in sync.
2. **`BadgeManager.applyBadgeVisuals` & `refreshBadgeFromCache` (`apps/extension/src/background/badge-manager.ts`)**:
   - `applyBadgeVisuals(summary, isAuthenticated, badgeEnabled = true)`: If `!badgeEnabled`, call `await chrome.action?.setBadgeText?.({ text: "" })` and return immediately.
   - `refreshBadgeFromCache()`: Reads `token`, `settings`, and `reviewSummaryCache` from `extensionStorage` and calls `await this.applyBadgeVisuals(cached?.summary ?? null, Boolean(token), settings.badgeEnabled)`.
   - In `handleSuccessResult`, `handleNotModifiedResult`, and `handleRefreshError`: load `settings = await extensionStorage.getSettings()` and pass `settings.badgeEnabled` to `applyBadgeVisuals`.
3. **`ReminderManager.ensureDailyReminderAlarm` (`apps/extension/src/background/reminder-manager.ts`)**:
   - When `!token || !settings.remindersEnabled`: in addition to clearing `ALARM_NAMES.DAILY_REMINDER` and `ALARM_NAMES.REMINDER_SNOOZE`, also call `await chrome.notifications?.clear?.(REMINDER_NOTIFICATION_ID)`.
4. **Background `UPDATE_SETTINGS` & `chrome.storage.onChanged` (`apps/extension/src/background/index.ts`)**:
   - On `UPDATE_SETTINGS` message:
     ```typescript
     const updated = await extensionStorage.updateSettings(message.payload);
     await badgeManager.refreshBadgeFromCache();
     await reminderManager.ensureDailyReminderAlarm();
     return { success: true, data: updated };
     ```
   - Register `chrome.storage?.onChanged?.addListener((changes, areaName) => ...)`: when `areaName === "sync"` and `changes[STORAGE_KEYS.SETTINGS]` is present, invoke `void badgeManager.refreshBadgeFromCache()` and `void reminderManager.ensureDailyReminderAlarm()`.
5. **Quiet Hours Conflict Helper & UI Section (`apps/extension/src/options/OptionsApp.tsx`)**:
   - Export pure helper `getQuietHoursHint(settings: Pick<ExtensionSettingsPayload, "remindersEnabled" | "dailyReminderTime" | "quietHoursStart" | "quietHoursEnd">): { type: "overlap" | "disabled"; message: string } | null`:
     - Uses `parseTimeToMinutes` from `../background/reminderRules`.
     - If `quietHoursStart === quietHoursEnd` (or parsed minutes equal), returns `{ type: "disabled", message: "Giờ yên lặng đang tắt vì giờ bắt đầu trùng giờ kết thúc." }`.
     - If `settings.remindersEnabled` is `true` and `dailyReminderTime` falls inside `[quietHoursStart, quietHoursEnd)` using half-open interval comparison (`start < end ? (daily >= start && daily < end) : (daily >= start || daily < end)`), returns `{ type: "overlap", message: "Giờ nhắc học hằng ngày đang nằm trong khung Giờ yên lặng — thông báo sẽ bị tạm ẩn vào thời điểm này." }`.
     - Otherwise returns `null`.
   - On save in `OptionsApp.tsx`: call `await extensionStorage.updateSettings(settings)` and notify background via `chrome.runtime?.sendMessage?.({ type: "UPDATE_SETTINGS", payload: settings })` (wrapped in `try/catch` for standalone test resilience).

---

## 4. Dependency-Ordered Implementation Tasks

1. **Task 1 — Shared Types & Constants (`packages/shared-types/src/extension.ts`, `apps/extension/src/shared/constants.ts`)**:
   - Add `badgeEnabled` to `ReminderSettings` / `ExtensionSettingsPayload` and `DEFAULT_SETTINGS`.
   - Rebuild `@wordstreak/shared-types`.
2. **Task 2 — `chrome.storage.sync` Persistence & Migration (`apps/extension/src/shared/storage.ts`, `apps/extension/src/shared/storage.spec.ts`)**:
   - Implement `sanitizeSettings`, `chrome.storage.sync` read/write, one-time read-through migration from `chrome.storage.local`, and fallback handling.
   - Write unit tests `TC-ERS-001`..`TC-ERS-004`.
3. **Task 3 — Badge Visibility & Reminder Alarm Side-Effects (`apps/extension/src/background/badge-manager.ts`, `apps/extension/src/background/reminder-manager.ts`, `apps/extension/src/background/index.ts`, `badge-manager.spec.ts`, `reminder-manager.spec.ts`)**:
   - Update `BadgeManager.applyBadgeVisuals` to respect `badgeEnabled` and add `refreshBadgeFromCache()`.
   - Update `ReminderManager.ensureDailyReminderAlarm()` to clear `REMINDER_NOTIFICATION_ID` when disabled.
   - Update `background/index.ts` `UPDATE_SETTINGS` handler and `chrome.storage.onChanged` listener.
   - Write unit tests `TC-ERS-005`..`TC-ERS-010`.
4. **Task 4 — Options Page UI & Quiet Hours Inline Hints (`apps/extension/src/options/OptionsApp.tsx`, `apps/extension/src/options/options-app.spec.tsx`)**:
   - Add **"Nhắc học & Huy hiệu"** section with `Bell` icon (`lucide-react`), toggles for `badgeEnabled`, `remindersEnabled`, `streakAtRiskReminderEnabled`, time inputs for `dailyReminderTime`, `quietHoursStart`, `quietHoursEnd`, disabled child state when `remindersEnabled === false`, and inline Quiet Hours hint/warning banner.
   - Write component/unit tests `TC-ERS-011`..`TC-ERS-016`.
