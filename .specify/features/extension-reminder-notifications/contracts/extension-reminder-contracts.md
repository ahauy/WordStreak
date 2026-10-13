# Interface & Storage Contracts: Conditional Study Reminder Notifications (`US-ECO-06`)

**Feature**: `US-ECO-06`: Thông báo nhắc học theo luật điều kiện (Conditional Study Reminder Notifications)  
**Slug**: `extension-reminder-notifications`  
**Version**: `1.0`  
**Date**: 2026-10-13

---

## 1. Contract Overview

`US-ECO-06` defines five internal and cross-package contracts:
1. **Shared Types Contract (`@wordstreak/shared-types`)**: Reminder settings, state, evaluation context, decision, and `ExtensionUserSummary.preferredLanguage` in [`packages/shared-types/src/extension.ts`](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/packages/shared-types/src/extension.ts).
2. **`chrome.storage.local` Persistence Contract (`apps/extension/src/shared/storage.ts`)**: Storage keys `ws_reminder_state` and `ws_settings` with `getReminderState()`, `setReminderState()`, and `resetReminderState()`.
3. **Pure Rule Engine Contract (`apps/extension/src/background/reminderRules.ts`)**: Deterministic, side-effect-free functions `parseTimeToMinutes`, `getLocalDateAndMinutes`, `isWithinQuietHours`, `normalizeReminderStateForDate`, `computeNextDailyReminderTime`, `evaluateReminderRules`, `resolveReminderLanguage`, and `buildReminderNotificationCopy`.
4. **Chrome Alarms Contract (`chrome.alarms`)**: Recurring `"daily-reminder"` (`periodInMinutes: 1440`) and one-shot `"ws-reminder-snooze"` (`delayInMinutes: 60`).
5. **Chrome Notifications & Tab Navigation Contract (`chrome.notifications`, `chrome.tabs`)**: Notification ID `"ws-study-reminder"`, button index `0` (**"Học ngay" / "Study Now"** → focus/open `${WEB_APP_URL}/review`), button index `1` (**"Để sau" / "Snooze"** → schedule 60m snooze), and race-free `onClosed` ignore tracking.

---

## 2. `chrome.storage.local` Keys & Constants Contract (`apps/extension/src/shared/constants.ts`)

```typescript
export const STORAGE_KEYS = {
  TOKEN: "ws_token",
  USER: "ws_user",
  SETTINGS: "ws_settings",
  RECENT_CAPTURES: "ws_recent_captures",
  REVIEW_SUMMARY_CACHE: "ws_review_summary_cache",
  REMINDER_STATE: "ws_reminder_state",
} as const;

export const ALARM_NAMES = {
  BADGE_PERIODIC: "ws-badge-periodic",
  BADGE_NEXT_DUE: "ws-badge-next-due",
  DAILY_REMINDER: "daily-reminder",
  REMINDER_SNOOZE: "ws-reminder-snooze",
} as const;

export const REMINDER_NOTIFICATION_ID = "ws-study-reminder" as const;

export const REMINDER_LIMITS = {
  NORMAL_DAILY_CAP: 3,
  REDUCED_DAILY_CAP: 1,
  IGNORE_BACKOFF_THRESHOLD: 3,
  MIN_COOLDOWN_MS: 120 * 60 * 1000, // 120 minutes (2 hours)
  SNOOZE_MINUTES: 60,
  DAILY_PERIOD_MINUTES: 1440, // 24 hours
  MIN_ALARM_DELAY_MS: 60_000, // 60 seconds MV3 floor
} as const;

export const DEFAULT_SETTINGS = {
  pinnedDeckId: null,
  autoShowFloatingIcon: true,
  shortcutKey: "Alt+W",
  blacklistedDomains: [] as string[],
  remindersEnabled: true,
  dailyReminderTime: "20:00",
  quietHoursStart: "22:00",
  quietHoursEnd: "07:00",
  streakAtRiskReminderEnabled: true,
};

export const DEFAULT_REMINDER_STATE = {
  lastResetDate: "",
  sentTodayCount: 0,
  dailyReminderSentToday: false,
  consecutiveIgnores: 0,
  lastNotifiedAt: null,
  snoozedUntil: null,
  activeNotificationId: null,
  lastStudiedToday: 0,
} as const;
```

---

## 3. Pure Rule Engine Contract (`apps/extension/src/background/reminderRules.ts`)

All functions in `reminderRules.ts` MUST be 100% pure with zero `chrome.*` API calls (`CON-REMD-001`):

```typescript
export function parseTimeToMinutes(hhmm: string, fallbackMinutes?: number): number;

export function getLocalDateAndMinutes(
  now: Date | number,
  timezone?: string,
): { localDate: string; currentMinutes: number };

export function isWithinQuietHours(
  now: Date | number,
  timezone: string | undefined,
  quietHoursStart: string,
  quietHoursEnd: string,
): boolean;

export function normalizeReminderStateForDate(
  state: ReminderState,
  currentLocalDate: string,
  currentStudiedToday?: number,
): ReminderState;

export function computeNextDailyReminderTime(
  dailyReminderTime: string,
  nowMs?: number,
  timezone?: string,
): number;

export function evaluateReminderRules(
  input: ReminderEvaluationInput,
): ReminderDecision;

export function resolveReminderLanguage(
  user?: Pick<ExtensionUserSummary, "preferredLanguage"> | null,
  settings?: Pick<ReminderSettings, "preferredLanguage"> | null,
  browserUiLang?: string | null,
): AppLanguage;

export function buildReminderNotificationCopy(
  notificationType: ReminderNotificationType,
  summary: Pick<
    ReviewSummaryDto,
    "dueCount" | "currentStreak" | "studiedToday" | "dailyGoal"
  >,
  lang: AppLanguage,
): ReminderNotificationCopy;
```

---

## 4. Notification & Action Button Contract (`chrome.notifications`)

### 4.1. Notification Creation Payload (`chrome.notifications.create`)

- **Notification ID**: `"ws-study-reminder"` (`REMINDER_NOTIFICATION_ID`)
- **Options**:
  ```typescript
  {
    type: "basic",
    iconUrl: chrome.runtime?.getURL
      ? chrome.runtime.getURL("icons/icon128.png")
      : "icons/icon128.png",
    title: copy.title,
    message: copy.message,
    buttons: copy.buttons, // Index 0: Học ngay / Study Now, Index 1: Để sau / Snooze
    priority: copy.priority, // 2 for STREAK_AT_RISK, 1 for DUE_CARDS / DAILY_GOAL
  }
  ```

### 4.2. Bilingual Copy Templates (`BR-REMD-010`)

| `notificationType` | Language (`lang`) | `title` | `message` | `buttons` (`[0, 1]`) | `priority` |
| :--- | :---: | :--- | :--- | :--- | :---: |
| `"STREAK_AT_RISK"` | `"vi"` | `"🔥 Chuỗi ${currentStreak} ngày sắp mất!"` | If `dueCount > 0`: `"Bạn còn ${dueCount} thẻ đến hạn. Ôn ngay để giữ chuỗi ngày học!"`<br>Else: `"Hoàn thành phiên ôn tập hôm nay trước nửa đêm để bảo vệ chuỗi ngày học!"` | `[{ title: "Học ngay" }, { title: "Để sau" }]` | `2` |
| `"STREAK_AT_RISK"` | `"en"` | `"🔥 Your ${currentStreak}-day streak is at risk!"` | If `dueCount > 0`: `"You have ${dueCount} due cards waiting. Review now to keep your streak alive!"`<br>Else: `"Complete a quick review before midnight to protect your study streak!"` | `[{ title: "Study Now" }, { title: "Snooze" }]` | `2` |
| `"DUE_CARDS"` | `"vi"` | `"📚 Đến giờ ôn tập WordStreak!"` | `"Bạn có ${dueCount} thẻ từ vựng đến hạn cần ôn tập hôm nay."` | `[{ title: "Học ngay" }, { title: "Để sau" }]` | `1` |
| `"DUE_CARDS"` | `"en"` | `"📚 Time for your WordStreak review!"` | `"You have ${dueCount} vocabulary cards due for review today."` | `[{ title: "Study Now" }, { title: "Snooze" }]` | `1` |
| `"DAILY_GOAL"` | `"vi"` | `"🎯 Hoàn thành mục tiêu từ vựng hôm nay!"` | `"Bạn đã học ${studiedToday}/${dailyGoal} thẻ hôm nay. Chỉ còn ${Math.max(1, dailyGoal - studiedToday)} thẻ nữa để đạt mục tiêu!"` | `[{ title: "Học ngay" }, { title: "Để sau" }]` | `1` |
| `"DAILY_GOAL"` | `"en"` | `"🎯 Reach your daily vocabulary goal!"` | `"You've studied ${studiedToday}/${dailyGoal} cards today. Just ${Math.max(1, dailyGoal - studiedToday)} more to hit your daily goal!"` | `[{ title: "Study Now" }, { title: "Snooze" }]` | `1` |

### 4.3. Event Listener Contracts (`ReminderManager`)

1. **`chrome.notifications.onClicked(notificationId)`**:
   - Ignores if `notificationId !== REMINDER_NOTIFICATION_ID`.
   - Sets `consecutiveIgnores: 0, activeNotificationId: null, snoozedUntil: null` in `ws_reminder_state` **before** calling `chrome.notifications.clear(notificationId)` (`RISK-REMD-001`).
   - Clears `"ws-reminder-snooze"` alarm.
   - Navigates/focuses `${WEB_APP_URL}/review` (`BR-REMD-009`).
2. **`chrome.notifications.onButtonClicked(notificationId, buttonIndex)`**:
   - Ignores if `notificationId !== REMINDER_NOTIFICATION_ID`.
   - **`buttonIndex === 0` ("Học ngay" / "Study Now")**: Identical to `onClicked(notificationId)`.
   - **`buttonIndex === 1` ("Để sau" / "Snooze")**:
     - Sets `consecutiveIgnores: 0, activeNotificationId: null, snoozedUntil: new Date(nowMs + 60 * 60 * 1000).toISOString()` in `ws_reminder_state` **before** calling `chrome.notifications.clear(notificationId)`.
     - Schedules `"ws-reminder-snooze"` with `{ delayInMinutes: 60 }` (`BR-REMD-007`).
3. **`chrome.notifications.onClosed(notificationId, _byUser)`**:
   - Ignores if `notificationId !== REMINDER_NOTIFICATION_ID`.
   - Reads `state = await extensionStorage.getReminderState()`.
   - If `state.activeNotificationId === notificationId`: increments `consecutiveIgnores: state.consecutiveIgnores + 1` and sets `activeNotificationId: null` (`BR-REMD-008`, `RISK-REMD-001`).
