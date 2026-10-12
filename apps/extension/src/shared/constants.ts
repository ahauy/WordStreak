export const API_BASE_URL = "http://localhost:3000/api";
export const WEB_APP_URL = "http://localhost:5173";

export const STORAGE_KEYS = {
  TOKEN: "ws_token",
  USER: "ws_user",
  SETTINGS: "ws_settings",
  RECENT_CAPTURES: "ws_recent_captures",
  REVIEW_SUMMARY_CACHE: "ws_review_summary_cache",
} as const;

export const BADGE_COLORS = {
  NORMAL_PURPLE: "#863BFF",
  AT_RISK_RED: "#EF4444",
  TEXT_WHITE: "#FFFFFF",
} as const;

export const ALARM_NAMES = {
  BADGE_PERIODIC: "ws-badge-periodic",
  BADGE_NEXT_DUE: "ws-badge-next-due",
} as const;

export const BADGE_LIMITS = {
  MAX_DISPLAY_COUNT: 99,
  PERIODIC_MINUTES: 30,
  MIN_ALARM_DELAY_MS: 60_000,
  MAX_NEXT_DUE_WINDOW_MS: 30 * 60 * 1000,
  DEBOUNCE_MS: 3_000,
} as const;

export const DEFAULT_SETTINGS = {
  pinnedDeckId: null,
  autoShowFloatingIcon: true,
  shortcutKey: "Alt+W",
  blacklistedDomains: [],
};

export const SELECTION_LIMITS = {
  MIN_LENGTH: 2,
  MAX_LENGTH: 60,
  MAX_WORDS: 5,
  MAX_CONTEXT_LENGTH: 250,
};
