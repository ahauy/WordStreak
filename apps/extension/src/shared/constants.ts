export const API_BASE_URL = "http://localhost:3000/api";
export const WEB_APP_URL = "http://localhost:5173";

export const STORAGE_KEYS = {
  TOKEN: "ws_token",
  USER: "ws_user",
  SETTINGS: "ws_settings",
  RECENT_CAPTURES: "ws_recent_captures",
  REVIEW_SUMMARY_CACHE: "ws_review_summary_cache",
  REMINDER_STATE: "ws_reminder_state",
} as const;

export const BADGE_COLORS = {
  NORMAL_PURPLE: "#863BFF",
  AT_RISK_RED: "#EF4444",
  TEXT_WHITE: "#FFFFFF",
} as const;

export const ALARM_NAMES = {
  BADGE_PERIODIC: "ws-badge-periodic",
  BADGE_NEXT_DUE: "ws-badge-next-due",
  DAILY_REMINDER: "daily-reminder",
  REMINDER_SNOOZE: "ws-reminder-snooze",
} as const;

export const BADGE_LIMITS = {
  MAX_DISPLAY_COUNT: 99,
  PERIODIC_MINUTES: 30,
  MIN_ALARM_DELAY_MS: 60_000,
  MAX_NEXT_DUE_WINDOW_MS: 30 * 60 * 1000,
  DEBOUNCE_MS: 3_000,
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

export const SELECTION_LIMITS = {
  MIN_LENGTH: 2,
  MAX_LENGTH: 60,
  MAX_WORDS: 5,
  MAX_CONTEXT_LENGTH: 250,
};
