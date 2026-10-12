import { STORAGE_KEYS, DEFAULT_SETTINGS } from "./constants";
import type {
  ExtensionStorageState,
  ExtensionSettingsPayload,
  ExtensionUserSummary,
  RecentCaptureItem,
  ReviewSummaryCacheState,
} from "@wordstreak/shared-types";

export const extensionStorage = {
  async getToken(): Promise<string | null> {
    if (typeof chrome === "undefined" || !chrome.storage?.local) {
      return localStorage.getItem(STORAGE_KEYS.TOKEN);
    }
    const result = await chrome.storage.local.get(STORAGE_KEYS.TOKEN);
    return (result[STORAGE_KEYS.TOKEN] as string) || null;
  },

  async setToken(token: string | null): Promise<void> {
    if (typeof chrome === "undefined" || !chrome.storage?.local) {
      if (token) localStorage.setItem(STORAGE_KEYS.TOKEN, token);
      else localStorage.removeItem(STORAGE_KEYS.TOKEN);
      return;
    }
    if (token) {
      await chrome.storage.local.set({ [STORAGE_KEYS.TOKEN]: token });
    } else {
      await chrome.storage.local.remove(STORAGE_KEYS.TOKEN);
    }
  },

  async getUser(): Promise<ExtensionUserSummary | null> {
    if (typeof chrome === "undefined" || !chrome.storage?.local) {
      const raw = localStorage.getItem(STORAGE_KEYS.USER);
      return raw ? JSON.parse(raw) : null;
    }
    const result = await chrome.storage.local.get(STORAGE_KEYS.USER);
    return (result[STORAGE_KEYS.USER] as ExtensionUserSummary) || null;
  },

  async setUser(user: ExtensionUserSummary | null): Promise<void> {
    if (typeof chrome === "undefined" || !chrome.storage?.local) {
      if (user) localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
      else localStorage.removeItem(STORAGE_KEYS.USER);
      return;
    }
    if (user) {
      await chrome.storage.local.set({ [STORAGE_KEYS.USER]: user });
    } else {
      await chrome.storage.local.remove(STORAGE_KEYS.USER);
    }
  },

  async getReviewSummaryCache(): Promise<ReviewSummaryCacheState | null> {
    if (typeof chrome === "undefined" || !chrome.storage?.local) {
      const raw = localStorage.getItem(STORAGE_KEYS.REVIEW_SUMMARY_CACHE);
      return raw ? JSON.parse(raw) : null;
    }
    const result = await chrome.storage.local.get(
      STORAGE_KEYS.REVIEW_SUMMARY_CACHE,
    );
    return (
      (result[STORAGE_KEYS.REVIEW_SUMMARY_CACHE] as ReviewSummaryCacheState) ||
      null
    );
  },

  async setReviewSummaryCache(
    cache: ReviewSummaryCacheState | null,
  ): Promise<void> {
    if (typeof chrome === "undefined" || !chrome.storage?.local) {
      if (cache) {
        localStorage.setItem(
          STORAGE_KEYS.REVIEW_SUMMARY_CACHE,
          JSON.stringify(cache),
        );
      } else {
        localStorage.removeItem(STORAGE_KEYS.REVIEW_SUMMARY_CACHE);
      }
      return;
    }
    if (cache) {
      await chrome.storage.local.set({
        [STORAGE_KEYS.REVIEW_SUMMARY_CACHE]: cache,
      });
    } else {
      await chrome.storage.local.remove(STORAGE_KEYS.REVIEW_SUMMARY_CACHE);
    }
  },

  async clearAuth(): Promise<void> {
    if (typeof chrome === "undefined" || !chrome.storage?.local) {
      localStorage.removeItem(STORAGE_KEYS.TOKEN);
      localStorage.removeItem(STORAGE_KEYS.USER);
      localStorage.removeItem(STORAGE_KEYS.REVIEW_SUMMARY_CACHE);
      return;
    }
    await chrome.storage.local.remove([
      STORAGE_KEYS.TOKEN,
      STORAGE_KEYS.USER,
      STORAGE_KEYS.REVIEW_SUMMARY_CACHE,
    ]);
  },

  async getSettings(): Promise<ExtensionSettingsPayload> {
    if (typeof chrome === "undefined" || !chrome.storage?.local) {
      const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      return raw
        ? { ...DEFAULT_SETTINGS, ...JSON.parse(raw) }
        : DEFAULT_SETTINGS;
    }
    const result = await chrome.storage.local.get(STORAGE_KEYS.SETTINGS);
    return result[STORAGE_KEYS.SETTINGS]
      ? {
          ...DEFAULT_SETTINGS,
          ...(result[STORAGE_KEYS.SETTINGS] as ExtensionSettingsPayload),
        }
      : DEFAULT_SETTINGS;
  },

  async updateSettings(
    settings: Partial<ExtensionSettingsPayload>,
  ): Promise<ExtensionSettingsPayload> {
    const current = await this.getSettings();
    const updated = { ...current, ...settings };
    if (typeof chrome === "undefined" || !chrome.storage?.local) {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(updated));
      return updated;
    }
    await chrome.storage.local.set({ [STORAGE_KEYS.SETTINGS]: updated });
    return updated;
  },

  async getRecentCaptures(): Promise<RecentCaptureItem[]> {
    if (typeof chrome === "undefined" || !chrome.storage?.local) {
      const raw = localStorage.getItem(STORAGE_KEYS.RECENT_CAPTURES);
      return raw ? JSON.parse(raw) : [];
    }
    const result = await chrome.storage.local.get(STORAGE_KEYS.RECENT_CAPTURES);
    return (result[STORAGE_KEYS.RECENT_CAPTURES] as RecentCaptureItem[]) || [];
  },

  async addRecentCapture(item: RecentCaptureItem): Promise<void> {
    const list = await this.getRecentCaptures();
    const filtered = list.filter(
      (x) => x.word.toLowerCase() !== item.word.toLowerCase(),
    );
    const updated = [item, ...filtered].slice(0, 10);
    if (typeof chrome === "undefined" || !chrome.storage?.local) {
      localStorage.setItem(
        STORAGE_KEYS.RECENT_CAPTURES,
        JSON.stringify(updated),
      );
      return;
    }
    await chrome.storage.local.set({ [STORAGE_KEYS.RECENT_CAPTURES]: updated });
  },

  async getAll(): Promise<ExtensionStorageState> {
    const [token, user, settings, recentCaptures, reviewSummaryCache] =
      await Promise.all([
        this.getToken(),
        this.getUser(),
        this.getSettings(),
        this.getRecentCaptures(),
        this.getReviewSummaryCache(),
      ]);
    return { token, user, settings, recentCaptures, reviewSummaryCache };
  },
};
