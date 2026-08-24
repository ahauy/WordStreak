export const API_BASE_URL = "http://localhost:3000/api";
export const WEB_APP_URL = "http://localhost:5173";

export const STORAGE_KEYS = {
  TOKEN: "ws_token",
  USER: "ws_user",
  SETTINGS: "ws_settings",
  RECENT_CAPTURES: "ws_recent_captures",
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
